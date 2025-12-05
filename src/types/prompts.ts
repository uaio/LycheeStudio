/**
 * 全局提示词管理功能的类型定义
 */

export type PromptCategory = 'development' | 'analysis' | 'creative' | 'productivity';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: PromptCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isBuiltin: boolean;
}

export interface ClaudeFileState {
  exists: boolean;
  content: string;
  lastModified: string | null;
  hasUnsavedChanges: boolean;
}

export interface PromptsData {
  version: string;
  templates: PromptTemplate[];
  lastSyncTime: string | null;
}

// API响应类型定义（遵循现有模式）
export interface ClaudeMdReadResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface ClaudeMdWriteResponse {
  success: boolean;
  error?: string;
}

export interface PromptsDataReadResponse {
  success: boolean;
  data?: PromptsData;
  error?: string;
}

export interface PromptsDataWriteResponse {
  success: boolean;
  error?: string;
}

// 模板库组件Props
export interface TemplateLibraryProps {
  templates: PromptTemplate[];
  onSelectTemplate: (template: PromptTemplate) => void;
  onAddTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditTemplate: (template: PromptTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  isDarkMode: boolean;
  loading?: boolean;
  simplified?: boolean; // 简化模式，不显示搜索筛选和分离的内置/用户模板区域
}

// Markdown编辑器Props
export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
  placeholder?: string;
  readonly?: boolean;
  height?: string | number;
}

// 主管理组件Props
export interface ClaudePromptsManagerProps {
  isDarkMode: boolean;
  collapsed?: boolean;
}