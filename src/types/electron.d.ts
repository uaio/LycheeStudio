// Electron API 类型定义
export interface ElectronAPI {
  // 窗口控制
  windowControl: (action: 'minimize' | 'maximize' | 'close') => Promise<{ success: boolean; error?: string }>;

  // 应用信息
  getVersion: () => Promise<string>;

  // 对话框
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;

  // 平台信息
  platform: string;

  // 文件操作
  openFile: () => Promise<any>;
  saveFile: () => Promise<any>;

  // 主题相关
  nativeTheme: {
    shouldUseDarkColors: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};