const { contextBridge, ipcRenderer } = require('electron');

// localStorage polyfill for Electron
if (!global.localStorage) {
  global.localStorage = {
    _data: {},
    _keys: [],
    setItem(key, value) {
      this._data[key] = value;
      if (!this._keys.includes(key)) {
        this._keys.push(key);
      }
    },
    getItem(key) {
      return this._data[key] || null;
    },
    removeItem(key) {
      delete this._data[key];
      const index = this._keys.indexOf(key);
      if (index > -1) {
        this._keys.splice(index, 1);
      }
    },
    clear() {
      this._data = {};
      this._keys = [];
    },
    get length() {
      return this._keys.length;
    },
    key(index) {
      return this._keys[index] || null;
    }
  };
}

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
  getNpmRegistry: () => ipcRenderer.invoke('get-npm-registry'),
  getNpmRegistries: () => ipcRenderer.invoke('get-npm-registries'),
  setNpmRegistry: (registryUrl) => ipcRenderer.invoke('set-npm-registry', registryUrl),
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