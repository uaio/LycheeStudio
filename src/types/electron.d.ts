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

  // CLAUDE.md文件操作（基于现有settings模式）
  claudeMd: {
    read: () => Promise<{ success: boolean; content?: string; error?: string }>;
    write: (content: string) => Promise<{ success: boolean; error?: string }>;
    exists: () => Promise<{ success: boolean; exists: boolean; error?: string }>;
  };

  // prompts数据操作（基于现有settings模式）
  promptsData: {
    read: () => Promise<{ success: boolean; data?: any; error?: string }>;
    write: (data: any) => Promise<{ success: boolean; error?: string }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};