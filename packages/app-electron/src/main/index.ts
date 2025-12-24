/**
 * Electron 主进程入口
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let mainWindow: BrowserWindow | null = null;

/**
 * 创建主窗口
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'AI Tools Manager',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    titleBarStyle: 'hiddenInset', // macOS 风格标题栏
    backgroundColor: '#1e1e1e',
  });

  // 开发模式加载 Vite 服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * IPC 处理器
 */
function setupIpcHandlers(): void {
  // 命令执行
  ipcMain.handle('execute-command', async (_event, command: string, options?: any) => {
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: options?.cwd,
        env: { ...process.env, ...options?.env },
        timeout: options?.timeout || 30000,
      });

      return {
        success: true,
        output: stdout.trim(),
        error: stderr?.trim(),
      };
    } catch (error: any) {
      return {
        success: false,
        output: error.stdout || '',
        error: error.stderr || error.message,
      };
    }
  });

  // 文件读取
  ipcMain.handle('read-file', async (_event, filePath: string) => {
    const fs = await import('fs/promises');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 文件写入
  ipcMain.handle('write-file', async (_event, filePath: string, content: string) => {
    const fs = await import('fs/promises');
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 文件存在检查
  ipcMain.handle('exists-file', async (_event, filePath: string) => {
    const fs = await import('fs/promises');
    try {
      await fs.access(filePath);
      return { success: true, exists: true };
    } catch {
      return { success: true, exists: false };
    }
  });

  // 删除文件
  ipcMain.handle('delete-file', async (_event, filePath: string) => {
    const fs = await import('fs/promises');
    try {
      await fs.unlink(filePath);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 创建目录
  ipcMain.handle('mkdir', async (_event, dirPath: string, options?: any) => {
    const fs = await import('fs/promises');
    try {
      await fs.mkdir(dirPath, { recursive: options?.recursive || false });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 读取目录
  ipcMain.handle('readdir', async (_event, dirPath: string) => {
    const fs = await import('fs/promises');
    try {
      const files = await fs.readdir(dirPath);
      return { success: true, files };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取用户主目录
  ipcMain.handle('get-user-home-dir', async () => {
    const os = await import('os');
    return { success: true, path: os.homedir() };
  });

  // 获取应用数据目录
  ipcMain.handle('get-app-data-dir', async () => {
    const os = await import('os');
    return { success: true, path: app.getPath('userData') };
  });

  // 显示消息框
  ipcMain.handle('show-message-box', async (_event, options: any) => {
    const { dialog } = require('electron');
    const result = await dialog.showMessageBox(mainWindow!, options);
    return { success: true, response: result.response };
  });

  // 显示通知
  ipcMain.handle('show-notification', async (_event, options: any) => {
    const { Notification } = require('electron');
    if (Notification.isSupported()) {
      new Notification({
        title: options.title || 'AI Tools Manager',
        body: options.message,
      }).show();
    }
    return { success: true };
  });

  // 打开外部链接
  ipcMain.handle('open-external', async (_event, url: string) => {
    const { shell } = require('electron');
    await shell.openExternal(url);
    return { success: true };
  });

  // 获取平台信息
  ipcMain.handle('get-platform-info', async () => {
    return {
      success: true,
      platform: process.platform,
      arch: process.arch,
      version: process.versions.electron,
    };
  });
}

// 应用事件
app.on('ready', () => {
  createWindow();
  setupIpcHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
