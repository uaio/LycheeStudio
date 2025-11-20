const { contextBridge, ipcRenderer } = require('electron');

// 为渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  windowControl: (action) => ipcRenderer.invoke('window-control', action),

  // 应用信息
  getVersion: () => ipcRenderer.invoke('get-app-version'),

  // 对话框
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),

  // 平台信息
  platform: process.platform,

  // 文件操作（如果需要的话）
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: () => ipcRenderer.invoke('dialog:saveFile'),

  // 主题相关 - 直接返回当前平台信息，避免 IPC 调用问题
  getPlatform: () => process.platform,

  // 系统工具检测和安装
  checkToolInstalled: (toolName) => ipcRenderer.invoke('check-tool-installed', toolName),
  installTool: (toolName) => ipcRenderer.invoke('install-tool', toolName),
  getToolVersion: (toolName) => ipcRenderer.invoke('get-tool-version', toolName),
  getLatestNodeVersion: () => ipcRenderer.invoke('get-latest-node-version'),
});

// 监听主题变化
ipcRenderer.on('theme-updated', (event, data) => {
  // 将主题变化事件转发到渲染进程
  if (typeof window !== 'undefined') {
    window.postMessage({
      type: 'theme-updated',
      payload: data
    }, '*');
  }
});