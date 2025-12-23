/**
 * VSCode 平台适配器
 */

import * as vscode from 'vscode';
import * as os from 'os';
import type {
  PlatformAdapter,
  FileSystemAdapter,
  EnvironmentAdapter,
  UIAdapter,
  VSCodeSpecificAdapter,
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
 * VSCode 文件系统适配器
 */
class VSCodeFileSystemAdapter implements FileSystemAdapter {
  async readFile(path: string): Promise<string> {
    const uri = vscode.Uri.file(path);
    const content = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(content).toString('utf8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    const uri = vscode.Uri.file(path);
    const encoder = new TextEncoder();
    await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
  }

  async exists(path: string): Promise<boolean> {
    try {
      const uri = vscode.Uri.file(path);
      await vscode.workspace.fs.stat(uri);
      return true;
    } catch {
      return false;
    }
  }

  async delete(path: string): Promise<void> {
    const uri = vscode.Uri.file(path);
    await vscode.workspace.fs.delete(uri);
  }

  async mkdir(path: string, options?: MkdirOptions): Promise<void> {
    const uri = vscode.Uri.file(path);
    await vscode.workspace.fs.createDirectory(uri);
  }

  async readdir(path: string): Promise<string[]> {
    const uri = vscode.Uri.file(path);
    const entries = await vscode.workspace.fs.readDirectory(uri);
    return entries.map(([name]) => name);
  }
}

/**
 * VSCode 环境变量适配器
 */
class VSCodeEnvironmentAdapter implements EnvironmentAdapter {
  constructor(private context: vscode.ExtensionContext) {}

  async get(key: string): Promise<string | undefined> {
    return this.context.globalState.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.context.globalState.update(key, value);
  }

  async getAll(): Promise<Record<string, string>> {
    const keys = this.context.globalState.keys();
    const env: Record<string, string> = {};
    for (const key of keys) {
      const value = await this.get(key);
      if (value) {
        env[key] = value;
      }
    }
    return env;
  }

  async getUserHomeDir(): Promise<string> {
    return os.homedir();
  }

  async getAppDataDir(): Promise<string> {
    return this.context.globalStorageUri.fsPath;
  }

  async getProjectDir(): Promise<string> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return workspaceFolders[0].uri.fsPath;
    }
    return os.homedir();
  }
}

/**
 * VSCode UI 适配器
 */
class VSCodeUIAdapter implements UIAdapter {
  async showMessage(options: MessageOptions): Promise<MessageResult> {
    let result: number | undefined;

    if (options.type === 'info') {
      await vscode.window.showInformationMessage(options.message);
      result = 0;
    } else if (options.type === 'warning') {
      await vscode.window.showWarningMessage(options.message);
      result = 0;
    } else if (options.type === 'error') {
      await vscode.window.showErrorMessage(options.message);
      result = 0;
    } else if (options.type === 'confirm') {
      const confirmed = await vscode.window.showWarningMessage(
        options.message,
        { modal: true },
        ...(options.buttons || ['确定', '取消'])
      );
      result = confirmed === '确定' ? 0 : 1;
    }

    return { response: result ?? 0 };
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    // VSCode 没有直接的通知 API，使用 showMessage 代替
    await vscode.window.showInformationMessage(options.message);
  }

  async openExternal(url: string): Promise<void> {
    await vscode.env.openExternal(vscode.Uri.parse(url));
  }
}

/**
 * VSCode 平台适配器
 */
export class VSCodeAdapter implements PlatformAdapter, VSCodeSpecificAdapter {
  readonly id = 'vscode' as const;

  private terminal: vscode.Terminal;
  fileSystem: FileSystemAdapter;
  environment: EnvironmentAdapter;
  ui: UIAdapter;

  constructor(private context: vscode.ExtensionContext) {
    // 创建终端
    this.terminal = vscode.window.createTerminal('AI Tools Manager');

    // 初始化子适配器
    this.fileSystem = new VSCodeFileSystemAdapter();
    this.environment = new VSCodeEnvironmentAdapter(context);
    this.ui = new VSCodeUIAdapter();
  }

  async getPlatformInfo(): Promise<PlatformInfo> {
    return {
      platform: process.platform,
      arch: process.arch,
      version: vscode.version,
      capabilities: {
        commandExecution: true,
        fileSystemAccess: true,
        networkAccess: true,
        nativeDialogs: true,
      },
    };
  }

  async executeCommand(command: string, options?: CommandOptions): Promise<CommandResult> {
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';

      // 使用终端执行命令（简化实现）
      this.terminal.sendText(command);

      // 实际实现需要监听终端输出
      // 这里返回一个模拟结果
      setTimeout(() => {
        resolve({
          success: true,
          stdout: '命令已执行（输出捕获未实现）',
          stderr,
        });
      }, 100);
    });
  }

  // VSCode 专用方法

  async executeInTerminal(command: string): Promise<void> {
    this.terminal.sendText(command);
    this.terminal.show();
  }

  async getProjectNodeVersion(): Promise<string | null> {
    if (!this.environment.getProjectDir) {
      return null;
    }
    const projectDir = await this.environment.getProjectDir();
    const packageJsonPath = `${projectDir}/package.json`;

    try {
      const content = await this.fileSystem.readFile(packageJsonPath);
      const packageJson = JSON.parse(content);
      // 检查 .nvmrc 文件
      const nvmrcPath = `${projectDir}/.nvmrc`;
      if (await this.fileSystem.exists(nvmrcPath)) {
        const version = await this.fileSystem.readFile(nvmrcPath);
        return version.trim();
      }
      return null;
    } catch {
      return null;
    }
  }

  async setProjectNodeVersion(version: string): Promise<void> {
    if (!this.environment.getProjectDir) {
      throw new Error('getProjectDir method not available');
    }
    const projectDir = await this.environment.getProjectDir();
    const nvmrcPath = `${projectDir}/.nvmrc`;
    await this.fileSystem.writeFile(nvmrcPath, version);
  }
}
