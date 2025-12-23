/**
 * AI Tools UI 组件库
 *
 * 提供 React 组件和 Hooks
 */

// Hooks
export { useFNMManager } from './hooks/useFNMManager.js';
export { useNodeManager } from './hooks/useNodeManager.js';
export { useClaudeConfig } from './hooks/useClaudeConfig.js';
export { usePromptsManager } from './hooks/usePromptsManager.js';
export { useMCPManager } from './hooks/useMCPManager.js';
export { usePages, PLATFORM_CONFIGS } from './hooks/usePages.js';
export type {
  UsePagesOptions,
  UsePagesReturn,
  PlatformPageConfig,
} from './hooks/usePages.js';

// Context
export { AppProvider, useApp } from './contexts/AppContext.js';

// Types
export type { AppContextType, ThemeMode, Language } from './contexts/AppContext.js';

// Config
export { PAGE_CONFIGS, getPlatformConfig } from './config/page-config.js';
