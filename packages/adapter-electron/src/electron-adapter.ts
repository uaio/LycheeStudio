/**
 * Electron 平台适配器
 */

import type {
  PlatformAdapter,
  FileSystemAdapter,
  EnvironmentAdapter,
  UIAdapter,
} from '@ai-tools/core';
import type {
  PlatformInfo,
  CommandOptions,
  CommandResult,
  MessageOptions,
  MessageResult,
  NotificationOptions,
  MkdirOptions,
} from '@ai-tools/core';

/**
 * Electron API 接口（从 preload.js 注入）
 */
interface ElectronAPI {
  // 平台信息
  platform: NodeJS.Platform;
  arch: string;

  // 命令执行
  executeCommand(command: string, options?: CommandOptions): Promise<CommandResult>;

  // 文件操作
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  delete(path: string): Promise<void>;
  mkdir(path: string, options?: MkdirOptions): Promise<void>;
  readdir(path: string): Promise<string[]>;

  // 环境变量
  getUserHomeDir(): Promise<string>;
  getAppDataDir(): Promise<string>;

  // UI 操作
  showMessageBox(options: MessageOptions): Promise<MessageResult>;
  showNotification(options: NotificationOptions): Promise<void>;
  openExternal(url: string): Promise<void>;
}

/**
 * Electron 文件系统适配器
 */
class ElectronFileSystemAdapter implements FileSystemAdapter {
  constructor(private api: ElectronAPI) {}

  async readFile(path: string): Promise<string> {
    return await this.api.readFile(path);
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.api.writeFile(path, content);
  }

  async exists(path: string): Promise<boolean> {
    return await this.api.exists(path);
  }

  async delete(path: string): Promise<void> {
    await this.api.delete(path);
  }

  async mkdir(path: string, options?: MkdirOptions): Promise<void> {
    await this.api.mkdir(path, options);
  }

  async readdir(path: string): Promise<string[]> {
    return await this.api.readdir(path);
  }
}

/**
 * Electron 环境变量适配器
 */
class ElectronEnvironmentAdapter implements EnvironmentAdapter {
  constructor(private api: ElectronAPI) {}

  async get(key: string): Promise<string | undefined> {
    // Electron 环境下通过命令获取
    const result = await this.api.executeCommand(`echo $${key}`);
    if (result.success && result.stdout) {
      return result.stdout.trim();
    }
    return undefined;
  }

  async set(key: string, value: string): Promise<void> {
    // 设置环境变量需要在主进程中处理
    await this.api.executeCommand(`export ${key}="${value}"`);
  }

  async getAll(): Promise<Record<string, string>> {
    const result = await this.api.executeCommand('env');
    if (result.success && result.stdout) {
      const env: Record<string, string> = {};
      const lines = result.stdout.split('\n');
      for (const line of lines) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          env[match[1]] = match[2];
        }
      }
      return env;
    }
    return {};
  }

  async getUserHomeDir(): Promise<string> {
    return await this.api.getUserHomeDir();
  }

  async getAppDataDir(): Promise<string> {
    return await this.api.getAppDataDir();
  }
}

/**
 * Electron UI 适配器
 */
class ElectronUIAdapter implements UIAdapter {
  constructor(private api: ElectronAPI) {}

  async showMessage(options: MessageOptions): Promise<MessageResult> {
    return await this.api.showMessageBox(options);
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    await this.api.showNotification(options);
  }

  async openExternal(url: string): Promise<void> {
    await this.api.openExternal(url);
  }
}

/**
 * Electron 平台适配器
 */
export class ElectronAdapter implements PlatformAdapter {
  readonly id = 'electron' as const;

  private api: ElectronAPI;
  fileSystem: FileSystemAdapter;
  environment: EnvironmentAdapter;
  ui: UIAdapter;

  constructor() {
    // 从 window 对象获取 Electron API
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      this.api = (window as any).electronAPI;
    } else {
      throw new Error('Electron API 不可用');
    }

    // 初始化子适配器
    this.fileSystem = new ElectronFileSystemAdapter(this.api);
    this.environment = new ElectronEnvironmentAdapter(this.api);
    this.ui = new ElectronUIAdapter(this.api);
  }

  async getPlatformInfo(): Promise<PlatformInfo> {
    return {
      platform: this.api.platform,
      arch: this.api.arch,
      version: process.versions.electron || 'unknown',
      capabilities: {
        commandExecution: true,
        fileSystemAccess: true,
        networkAccess: true,
        nativeDialogs: true,
      },
    };
  }

  async executeCommand(command: string, options?: CommandOptions): Promise<CommandResult> {
    return await this.api.executeCommand(command, options);
  }
}
