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

  // MCP配置文件操作
  mcpConfig: {
    read: () => Promise<{ success: boolean; content?: string; error?: string }>;
    write: (content: string) => Promise<{ success: boolean; error?: string }>;
    exists: () => Promise<{ success: boolean; exists: boolean; error?: string }>;
  };

  // MCP服务管理
  mcpService: {
    getStatus: () => Promise<{ success: boolean; data?: any; error?: string }>;
    start: () => Promise<{ success: boolean; error?: string }>;
    stop: () => Promise<{ success: boolean; error?: string }>;
    restart: () => Promise<{ success: boolean; error?: string }>;
    getLogs: (lines: number) => Promise<{ success: boolean; data?: any[]; error?: string }>;
    searchPackages: (query: string) => Promise<{ success: boolean; servers?: any[]; error?: string }>;
    installPackage: (packageName: string) => Promise<{ success: boolean; error?: string }>;
    uninstallPackage: (packageName: string) => Promise<{ success: boolean; error?: string }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};