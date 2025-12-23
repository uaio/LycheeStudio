/**
 * 内置页面定义
 *
 * 定义所有可用的页面及其在各个平台的可见性
 */

import type { PageMeta } from '../types/page.js';

/**
 * 内置页面元数据
 */
export const BUILTIN_PAGES: Record<string, PageMeta> = {
  // ============================================
  // Node 相关页面
  // ============================================

  /**
   * Node 版本管理
   * 需要执行系统命令，仅 Electron 和 VSCode 可用
   */
  node_manager: {
    id: 'node_manager',
    name: 'Node 版本管理',
    description: '管理、安装和切换 Node.js 版本',
    type: 'page',
    icon: 'hexagon',
    platforms: ['electron', 'vscode'],
    category: 'node',
    requiresCommandExecution: true,
    order: 10,
    tags: ['node', 'fnm', 'version'],
  },

  /**
   * FNM 管理
   * 需要执行系统命令
   */
  fnm_manager: {
    id: 'fnm_manager',
    name: 'FNM 管理',
    description: '管理 Fast Node Manager (FNM)',
    type: 'settings',
    icon: 'settings',
    platforms: ['electron', 'vscode'],
    category: 'node',
    requiresCommandExecution: true,
    order: 11,
    tags: ['fnm', 'node'],
  },

  // ============================================
  // Claude 配置页面（所有平台可用）
  // ============================================

  /**
   * Claude 模型配置
   * 配置文件操作，所有平台可用
   */
  claude_model: {
    id: 'claude_model',
    name: 'Claude 模型',
    description: '配置 Claude API 模型和参数',
    type: 'settings',
    icon: 'bot',
    platforms: ['electron', 'vscode', 'web'],
    category: 'claude',
    requiresFileSystemAccess: true,
    order: 20,
    tags: ['claude', 'model', 'api'],
  },

  /**
   * Claude Provider 配置
   */
  claude_provider: {
    id: 'claude_provider',
    name: 'API 提供商',
    description: '配置 API 提供商和密钥',
    type: 'settings',
    icon: 'key',
    platforms: ['electron', 'vscode', 'web'],
    category: 'claude',
    requiresFileSystemAccess: true,
    order: 21,
    tags: ['claude', 'api', 'provider'],
  },

  /**
   * CLAUDE.md 管理
   */
  claude_prompts: {
    id: 'claude_prompts',
    name: 'Claude 提示词',
    description: '管理 CLAUDE.md 文件和提示词模板',
    type: 'page',
    icon: 'file-text',
    platforms: ['electron', 'vscode', 'web'],
    category: 'claude',
    requiresFileSystemAccess: true,
    order: 22,
    tags: ['claude', 'prompt', 'template'],
  },

  // ============================================
  // MCP 服务管理
  // ============================================

  /**
   * MCP 服务管理
   */
  mcp_manager: {
    id: 'mcp_manager',
    name: 'MCP 服务',
    description: '管理 Model Context Protocol 服务',
    type: 'page',
    icon: 'server',
    platforms: ['electron', 'vscode', 'web'],
    category: 'mcp',
    requiresFileSystemAccess: true,
    order: 30,
    tags: ['mcp', 'server', 'integration'],
  },

  // ============================================
  // 系统工具
  // ============================================

  /**
   * 系统状态卡片
   * 显示各工具安装状态
   */
  system_status: {
    id: 'system_status',
    name: '系统状态',
    description: '查看开发工具安装状态',
    type: 'card',
    icon: 'activity',
    platforms: ['electron', 'vscode'],
    category: 'system',
    requiresCommandExecution: true,
    order: 40,
    tags: ['system', 'status', 'tools'],
  },

  /**
   * 工具安装
   */
  tool_installation: {
    id: 'tool_installation',
    name: '工具安装',
    description: '安装 AI 开发工具',
    type: 'page',
    icon: 'download',
    platforms: ['electron', 'vscode'],
    category: 'system',
    requiresCommandExecution: true,
    order: 41,
    tags: ['install', 'tools', 'ai'],
  },

  // ============================================
  // 配置管理
  // ============================================

  /**
   * 应用设置
   * 所有平台可用
   */
  app_settings: {
    id: 'app_settings',
    name: '应用设置',
    description: '应用偏好设置',
    type: 'settings',
    icon: 'settings',
    platforms: ['electron', 'vscode', 'web'],
    category: 'config',
    order: 50,
    tags: ['settings', 'config', 'preferences'],
  },

  /**
   * 关于页面
   */
  about: {
    id: 'about',
    name: '关于',
    description: '关于 AI Tools Manager',
    type: 'modal',
    icon: 'info',
    platforms: ['electron', 'vscode', 'web'],
    category: 'other',
    order: 100,
    tags: ['about', 'info'],
  },
};

/**
 * 获取指定平台的页面列表
 * @param platform - 平台类型
 * @returns 页面元数据数组
 */
export function getPagesForPlatform(platform: 'electron' | 'vscode' | 'web'): PageMeta[] {
  return Object.values(BUILTIN_PAGES)
    .filter(page => page.platforms.includes(platform))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * 获取指定分类的页面列表
 * @param category - 页面分类
 * @returns 页面元数据数组
 */
export function getPagesByCategory(category: string): PageMeta[] {
  return Object.values(BUILTIN_PAGES)
    .filter(page => page.category === category)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}
