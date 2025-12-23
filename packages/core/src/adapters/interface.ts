/**
 * 平台适配器接口 - 定义所有平台必须实现的能力
 */

import type {
  PlatformType,
  PlatformInfo,
  CommandOptions,
  CommandResult,
  MessageOptions,
  MessageResult,
  NotificationOptions,
  MkdirOptions,
} from '../types/index.js';

/**
 * 文件系统适配器
 */
export interface FileSystemAdapter {
  /**
   * 读取文件内容
   * @param path - 文件路径
   * @returns 文件内容
   */
  readFile(path: string): Promise<string>;

  /**
   * 写入文件内容
   * @param path - 文件路径
   * @param content - 文件内容
   */
  writeFile(path: string, content: string): Promise<void>;

  /**
   * 检查文件或目录是否存在
   * @param path - 路径
   * @returns 是否存在
   */
  exists(path: string): Promise<boolean>;

  /**
   * 删除文件
   * @param path - 文件路径
   */
  delete(path: string): Promise<void>;

  /**
   * 创建目录
   * @param path - 目录路径
   * @param options - 选项
   */
  mkdir(path: string, options?: MkdirOptions): Promise<void>;

  /**
   * 读取目录内容
   * @param path - 目录路径
   * @returns 文件名列表
   */
  readdir(path: string): Promise<string[]>;
}

/**
 * 环境变量适配器
 */
export interface EnvironmentAdapter {
  /**
   * 获取环境变量
   * @param key - 环境变量键
   * @returns 环境变量值
   */
  get(key: string): Promise<string | undefined>;

  /**
   * 设置环境变量
   * @param key - 环境变量键
   * @param value - 环境变量值
   */
  set(key: string, value: string): Promise<void>;

  /**
   * 获取所有环境变量
   * @returns 环境变量对象
   */
  getAll(): Promise<Record<string, string>>;

  /**
   * 获取用户主目录
   * @returns 用户主目录路径
   */
  getUserHomeDir(): Promise<string>;

  /**
   * 获取应用数据目录
   * @returns 应用数据目录路径
   */
  getAppDataDir(): Promise<string>;

  /**
   * 获取项目目录（VSCode专用）
   * @returns 项目目录路径
   */
  getProjectDir?: () => Promise<string>;
}

/**
 * UI 适配器
 */
export interface UIAdapter {
  /**
   * 显示消息对话框
   * @param options - 消息选项
   * @returns 用户选择结果
   */
  showMessage(options: MessageOptions): Promise<MessageResult>;

  /**
   * 显示通知
   * @param options - 通知选项
   */
  showNotification(options: NotificationOptions): Promise<void>;

  /**
   * 打开外部链接
   * @param url - URL地址
   */
  openExternal(url: string): Promise<void>;
}

/**
 * VSCode 专用适配器接口
 */
export interface VSCodeSpecificAdapter {
  /**
   * 在终端执行命令
   * @param command - 命令
   */
  executeInTerminal(command: string): Promise<void>;

  /**
   * 获取项目 Node 版本
   * @returns Node 版本号
   */
  getProjectNodeVersion(): Promise<string | null>;

  /**
   * 设置项目 Node 版本
   * @param version - 版本号
   */
  setProjectNodeVersion(version: string): Promise<void>;
}

/**
 * 平台适配器接口
 */
export interface PlatformAdapter {
  /**
   * 适配器标识
   */
  readonly id: PlatformType;

  /**
   * 获取平台信息
   * @returns 平台信息
   */
  getPlatformInfo(): Promise<PlatformInfo>;

  /**
   * 执行命令
   * @param command - 命令
   * @param options - 选项
   * @returns 执行结果
   */
  executeCommand(command: string, options?: CommandOptions): Promise<CommandResult>;

  /**
   * 文件系统操作
   */
  fileSystem: FileSystemAdapter;

  /**
   * 环境变量操作
   */
  environment: EnvironmentAdapter;

  /**
   * UI 操作
   */
  ui: UIAdapter;
}
