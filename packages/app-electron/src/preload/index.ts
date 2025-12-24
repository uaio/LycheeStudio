/**
 * Electron Preload 脚本
 * 安全地暴露 API 到渲染进程
 */

import { contextBridge, ipcRenderer } from 'electron';

/**
 * Electron API 接口
 */
const electronAPI = {
  // 平台信息
  platform: process.platform,
  arch: process.arch,

  // 命令执行
  executeCommand: (command: string, options?: any) =>
    ipcRenderer.invoke('execute-command', command, options),

  // 文件操作
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('write-file', path, content),
  exists: (path: string) => ipcRenderer.invoke('exists-file', path),
  delete: (path: string) => ipcRenderer.invoke('delete-file', path),
  mkdir: (path: string, options?: any) => ipcRenderer.invoke('mkdir', path, options),
  readdir: (path: string) => ipcRenderer.invoke('readdir', path),

  // 环境变量
  getUserHomeDir: () => ipcRenderer.invoke('get-user-home-dir'),
  getAppDataDir: () => ipcRenderer.invoke('get-app-data-dir'),

  // UI 操作
  showMessageBox: (options: any) => ipcRenderer.invoke('show-message-box', options),
  showNotification: (options: any) => ipcRenderer.invoke('show-notification', options),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
};

// 暴露到 window 对象
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript 类型声明
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
