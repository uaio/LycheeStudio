/**
 * AI Tools Manager - 核心包
 *
 * 提供平台无关的核心功能
 */

// 导出所有类型
export * from './types/index.js';
export * from './types/claude.js';
export * from './types/node.js';

// 导出适配器接口
export * from './adapters/interface.js';

// 导出服务类
export { FNMManager } from './services/fnm-manager.js';
export { NodeManager } from './services/node-manager.js';
export { ClaudeConfigManager } from './services/claude-config.js';
export { PromptsManager } from './services/prompts-manager.js';
export { MCPManager } from './services/mcp-manager.js';

// 导出工具函数
export * from './utils/version-parser.js';
