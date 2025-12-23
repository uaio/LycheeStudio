/**
 * 平台页面配置
 *
 * 定义各个平台显示哪些页面
 */

import type { PlatformPageConfig } from '../hooks/usePages';

/**
 * 各平台页面配置
 */
export const PAGE_CONFIGS: Record<string, PlatformPageConfig> = {
  // ============================================
  // Electron 完整配置
  // ============================================
  electron_full: {
    platform: 'electron',
    // 启用所有页面
  },

  // ============================================
  // VSCode 项目级配置
  // ============================================
  vscode_project: {
    platform: 'vscode',
    disabledPages: [
      'fnm_manager',        // FNM 管理在项目级不需要
      'tool_installation',  // 全局工具安装不需要
    ],
  },

  // ============================================
  // Web 阉割配置
  // ============================================
  web_limited: {
    platform: 'web',
    disabledPages: [
      'node_manager',       // 需要系统命令
      'fnm_manager',        // 需要系统命令
      'system_status',      // 需要系统命令
      'tool_installation',  // 需要系统命令
    ],
  },

  // ============================================
  // 自定义配置示例
  // ============================================
  // 仅 Claude 配置
  claude_only: {
    platform: 'web',
    enabledPages: [
      'claude_model',
      'claude_provider',
      'claude_prompts',
      'mcp_manager',
      'app_settings',
      'about',
    ],
  },

  // 仅 Node 管理
  node_only: {
    platform: 'electron',
    enabledPages: [
      'node_manager',
      'fnm_manager',
      'app_settings',
      'about',
    ],
  },
};

/**
 * 获取平台配置
 * @param platform - 平台类型
 * @param configName - 配置名称（可选）
 * @returns 平台页面配置
 */
export function getPlatformConfig(
  platform: 'electron' | 'vscode' | 'web',
  configName?: string
): PlatformPageConfig {
  if (configName && PAGE_CONFIGS[configName]) {
    return PAGE_CONFIGS[configName];
  }

  // 默认配置
  switch (platform) {
    case 'electron':
      return PAGE_CONFIGS.electron_full;
    case 'vscode':
      return PAGE_CONFIGS.vscode_project;
    case 'web':
      return PAGE_CONFIGS.web_limited;
  }
}
