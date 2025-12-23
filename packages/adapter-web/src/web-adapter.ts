/**
 * Web 平台适配器（功能阉割版）
 *
 * 由于浏览器安全限制，部分功能无法使用或需要降级处理
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
 * LocalStorage 文件系统适配器（模拟）
 */
class WebFileSystemAdapter implements FileSystemAdapter {
  private prefix = 'ai-tools-fs:';

  private toKey(path: string): string {
    return this.prefix + path;
  }

  async readFile(path: string): Promise<string> {
    const key = this.toKey(path);
    const data = localStorage.getItem(key);
    if (data === null) {
      throw new Error(`文件不存在: ${path}`);
    }
    return data;
  }

  async writeFile(path: string, content: string): Promise<void> {
    const key = this.toKey(path);
    localStorage.setItem(key, content);
  }

  async exists(path: string): Promise<boolean> {
    const key = this.toKey(path);
    return localStorage.getItem(key) !== null;
  }

  async delete(path: string): Promise<void> {
    const key = this.toKey(path);
    localStorage.removeItem(key);
  }

  async mkdir(path: string, options?: MkdirOptions): Promise<void> {
    // Web 环境中目录是虚拟的，不需要创建
  }

  async readdir(path: string): Promise<string[]> {
    const prefix = this.toKey(path);
    const keys = Object.keys(localStorage);
    const results: string[] = [];

    for (const key of keys) {
      if (key.startsWith(prefix)) {
        results.push(key.substring(prefix.length));
      }
    }

    return results;
  }
}

/**
 * Web 环境变量适配器（使用 sessionStorage）
 */
class WebEnvironmentAdapter implements EnvironmentAdapter {
  async get(key: string): Promise<string | undefined> {
    return sessionStorage.getItem(key) || undefined;
  }

  async set(key: string, value: string): Promise<void> {
    sessionStorage.setItem(key, value);
  }

  async getAll(): Promise<Record<string, string>> {
    const env: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        if (value) {
          env[key] = value;
        }
      }
    }
    return env;
  }

  async getUserHomeDir(): Promise<string> {
    // Web 环境返回虚拟路径
    return '/mock/home/user';
  }

  async getAppDataDir(): Promise<string> {
    return '/mock/appdata';
  }
}

/**
 * Web UI 适配器
 */
class WebUIAdapter implements UIAdapter {
  async showMessage(options: MessageOptions): Promise<MessageResult> {
    if (options.type === 'confirm') {
      const result = confirm(options.message);
      return { response: result ? 0 : 1 };
    }

    if (options.type === 'error') {
      alert(`错误: ${options.message}`);
    } else if (options.type === 'warning') {
      alert(`警告: ${options.message}`);
    } else {
      alert(options.message);
    }

    return { response: 0 };
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(options.title || '通知', {
        body: options.message,
        icon: options.icon,
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(options.title || '通知', {
            body: options.message,
            icon: options.icon,
          });
        }
      });
    } else {
      // 降级到 console
      console.log(`[通知] ${options.title}: ${options.message}`);
    }
  }

  async openExternal(url: string): Promise<void> {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Web 平台适配器（功能阉割版）
 */
export class WebAdapter implements PlatformAdapter {
  readonly id = 'web' as const;

  fileSystem: FileSystemAdapter;
  environment: EnvironmentAdapter;
  ui: UIAdapter;

  constructor() {
    this.fileSystem = new WebFileSystemAdapter();
    this.environment = new WebEnvironmentAdapter();
    this.ui = new WebUIAdapter();
  }

  async getPlatformInfo(): Promise<PlatformInfo> {
    return {
      platform: navigator.platform as any,
      arch: 'unknown',
      version: navigator.userAgent,
      capabilities: {
        commandExecution: false, // Web 环境无法执行系统命令
        fileSystemAccess: false, // 使用 LocalStorage 模拟
        networkAccess: true,
        nativeDialogs: true,
      },
    };
  }

  async executeCommand(command: string, options?: CommandOptions): Promise<CommandResult> {
    // Web 环境无法执行真实命令，返回降级响应
    console.log(`[Web] 命令执行请求（不支持）: ${command}`);

    return {
      success: false,
      error: {
        code: 'NOT_SUPPORTED',
        message: 'Web 环境不支持命令执行，请使用桌面应用',
      },
    };
  }
}
