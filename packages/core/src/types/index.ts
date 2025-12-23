/**
 * 核心类型定义
 */

/**
 * 平台类型
 */
export type PlatformType = 'electron' | 'web' | 'vscode';

/**
 * 工具状态
 */
export type ToolStatusType = 'active' | 'warning' | 'error';

/**
 * 工具状态
 */
export interface ToolStatus {
  /** 工具名称 */
  name: string;
  /** 显示名称 */
  displayName: string;
  /** 状态 */
  status: ToolStatusType;
  /** 版本信息 */
  version?: string;
  /** 安装路径 */
  path?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * Node 版本信息
 */
export interface NodeVersion {
  /** 版本号 */
  version: string;
  /** 是否为默认版本 */
  isDefault: boolean;
  /** 是否为当前激活版本 */
  isActive: boolean;
  /** 安装日期 */
  installDate?: Date;
}

/**
 * 安装进度
 */
export interface InstallationProgress {
  /** 工具名称 */
  toolName: string;
  /** 当前步骤 */
  currentStep: string;
  /** 进度百分比 0-100 */
  progress: number;
  /** 状态 */
  status: 'pending' | 'running' | 'completed' | 'failed';
  /** 错误信息 */
  error?: string;
}

/**
 * 安装结果
 */
export interface InstallationResult {
  /** 是否成功 */
  success: boolean;
  /** 版本号 */
  version?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 命令执行选项
 */
export interface CommandOptions {
  /** 工作目录 */
  cwd?: string;
  /** 环境变量 */
  env?: Record<string, string>;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 是否使用shell */
  shell?: boolean;
}

/**
 * 命令执行结果
 */
export interface CommandResult {
  /** 是否成功 */
  success: boolean;
  /** 标准输出 */
  stdout?: string;
  /** 标准错误输出 */
  stderr?: string;
  /** 退出码 */
  exitCode?: number;
  /** 错误信息 */
  error?: AdapterError;
}

/**
 * 适配器错误
 */
export interface AdapterError {
  /** 错误码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 详细信息 */
  details?: unknown;
}

/**
 * 平台能力
 */
export interface PlatformCapabilities {
  /** 命令执行能力 */
  commandExecution: boolean;
  /** 文件系统访问能力 */
  fileSystemAccess: boolean;
  /** 网络访问能力 */
  networkAccess: boolean;
  /** 原生对话框能力 */
  nativeDialogs: boolean;
}

/**
 * 平台信息
 */
export interface PlatformInfo {
  /** 平台类型 */
  platform: NodeJS.Platform;
  /** 架构 */
  arch: string;
  /** 版本 */
  version: string;
  /** 平台能力 */
  capabilities: PlatformCapabilities;
}

/**
 * 消息选项
 */
export interface MessageOptions {
  /** 类型 */
  type: 'info' | 'warning' | 'error' | 'confirm';
  /** 标题 */
  title?: string;
  /** 消息内容 */
  message: string;
  /** 按钮 */
  buttons?: string[];
}

/**
 * 消息结果
 */
export interface MessageResult {
  /** 用户选择的按钮索引 */
  response: number;
}

/**
 * 通知选项
 */
export interface NotificationOptions {
  /** 标题 */
  title?: string;
  /** 消息内容 */
  message: string;
  /** 图标 */
  icon?: string;
}

/**
 * 目录创建选项
 */
export interface MkdirOptions {
  /** 递归创建 */
  recursive?: boolean;
  /** 设置模式 */
  mode?: number;
}
