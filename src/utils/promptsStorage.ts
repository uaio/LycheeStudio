/**
 * Prompts storage utility - 遵循ClaudeProviderManager的localStorage+Electron双存储模式
 */

import { safeStorage } from './storage';
import { PromptTemplate, PromptsData } from '../types/prompts';

// 内置模板数据将在后面导入
let BUILTIN_TEMPLATES: PromptTemplate[] = [];

// 设置内置模板（延迟导入以避免循环依赖）
export const setBuiltinTemplates = (templates: PromptTemplate[]) => {
  BUILTIN_TEMPLATES = templates;
};

export const promptsStorage = {
  /**
   * 设置内置模板
   */
  setBuiltinTemplates: (templates: PromptTemplate[]) => {
    BUILTIN_TEMPLATES = templates;
  },

  /**
   * 读取prompts数据：优先从文件，失败时使用localStorage缓存
   */
  loadPrompts: async (): Promise<PromptTemplate[]> => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.promptsData.read();
        if (result.success && result.data) {
          // 缓存到localStorage供UI使用
          safeStorage.setItem('prompts-templates', JSON.stringify(result.data.templates));
          return result.data.templates;
        } else if (result.error) {
          console.warn('读取prompts文件失败，使用缓存:', result.error);
        }
      } catch (error) {
        console.warn('读取prompts文件失败，使用缓存:', error);
      }
    }

    // 降级到localStorage
    const cached = safeStorage.getItem('prompts-templates');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        console.warn('解析缓存的prompts数据失败:', error);
      }
    }

    // 最后降级到内置模板
    return BUILTIN_TEMPLATES;
  },

  /**
   * 保存prompts数据：同时保存到文件和localStorage
   */
  savePrompts: async (templates: PromptTemplate[]): Promise<boolean> => {
    try {
      // 过滤掉内置模板，只保存用户自定义模板
      const userTemplates = templates.filter(template => !template.isBuiltin);

      // 先保存到localStorage确保UI响应
      safeStorage.setItem('prompts-templates', JSON.stringify(templates));

      // 然后保存到文件
      if (window.electronAPI) {
        const result = await window.electronAPI.promptsData.write({
          version: '1.0.0',
          templates: userTemplates,
          lastSyncTime: new Date().toISOString()
        });
        return result.success;
      }

      // 非Electron环境认为成功
      return true;
    } catch (error) {
      console.error('保存prompts失败:', error);
      return false;
    }
  },

  /**
   * 读取CLAUDE.md文件内容
   */
  loadClaudeMd: async (): Promise<string> => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.claudeMd.read();
        if (result.success && result.content !== undefined) {
          return result.content;
        } else if (result.error) {
          console.warn('读取CLAUDE.md文件失败:', result.error);
        }
      } catch (error) {
        console.warn('读取CLAUDE.md文件失败:', error);
      }
    }

    // 返回空内容作为默认值
    return '';
  },

  /**
   * 保存内容到CLAUDE.md文件
   */
  saveClaudeMd: async (content: string): Promise<{success: boolean, error?: string}> => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.claudeMd.write(content);
        return result;
      } catch (error) {
        console.error('保存CLAUDE.md失败:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '保存失败'
        };
      }
    }

    // 非Electron环境无法保存文件
    return {
      success: false,
      error: '文件操作不可用'
    };
  },

  /**
   * 添加新的用户模板
   */
  addUserTemplate: async (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const templates = await promptsStorage.loadPrompts();
      const newTemplate: PromptTemplate = {
        ...template,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isBuiltin: false
      };

      templates.push(newTemplate);
      return await promptsStorage.savePrompts(templates);
    } catch (error) {
      console.error('添加用户模板失败:', error);
      return false;
    }
  },

  /**
   * 更新用户模板
   */
  updateUserTemplate: async (updatedTemplate: PromptTemplate): Promise<boolean> => {
    try {
      const templates = await promptsStorage.loadPrompts();
      const index = templates.findIndex(t => t.id === updatedTemplate.id && !t.isBuiltin);

      if (index === -1) {
        return false; // 模板不存在或是内置模板
      }

      templates[index] = {
        ...updatedTemplate,
        updatedAt: new Date().toISOString()
      };

      return await promptsStorage.savePrompts(templates);
    } catch (error) {
      console.error('更新用户模板失败:', error);
      return false;
    }
  },

  /**
   * 删除用户模板
   */
  deleteUserTemplate: async (templateId: string): Promise<boolean> => {
    try {
      const templates = await promptsStorage.loadPrompts();
      const filteredTemplates = templates.filter(t => t.id !== templateId || t.isBuiltin);

      if (filteredTemplates.length === templates.length) {
        return false; // 没有找到要删除的模板
      }

      return await promptsStorage.savePrompts(filteredTemplates);
    } catch (error) {
      console.error('删除用户模板失败:', error);
      return false;
    }
  },

  /**
   * 获取所有模板（包括内置和用户自定义）
   */
  getAllTemplates: async (): Promise<PromptTemplate[]> => {
    const userTemplates = await promptsStorage.loadPrompts();
    const allTemplates = [...BUILTIN_TEMPLATES, ...userTemplates];

    // 按类别和更新时间排序
    return allTemplates.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }
};