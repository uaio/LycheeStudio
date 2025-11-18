// Electron 命令封装

// AI 配置相关命令
export const readConfig = async (tool: string): Promise<string> => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.readConfig(tool);
    }
    throw new Error('Electron API not available');
  } catch (error) {
    console.error('Failed to read config:', error);
    throw error;
  }
};

export const writeConfig = async (tool: string, config: string): Promise<string> => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.writeConfig(tool, config);
    }
    throw new Error('Electron API not available');
  } catch (error) {
    console.error('Failed to write config:', error);
    throw error;
  }
};

// Node.js 管理相关命令
export const getNodeVersions = async (): Promise<string[]> => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.getNodeVersions();
    }
    throw new Error('Electron API not available');
  } catch (error) {
    console.error('Failed to get Node versions:', error);
    throw error;
  }
};

export const installNodeVersion = async (version: string): Promise<string> => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.installNodeVersion(version);
    }
    throw new Error('Electron API not available');
  } catch (error) {
    console.error('Failed to install Node version:', error);
    throw error;
  }
};

export const switchNodeVersion = async (version: string): Promise<string> => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.switchNodeVersion(version);
    }
    throw new Error('Electron API not available');
  } catch (error) {
    console.error('Failed to switch Node version:', error);
    throw error;
  }
};

// NPM 包管理相关命令
export const getNpmPackages = async (): Promise<string[]> => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.getNpmPackages();
    }
    throw new Error('Electron API not available');
  } catch (error) {
    console.error('Failed to get NPM packages:', error);
    throw error;
  }
};

export const installNpmPackage = async (pkg: string, global: boolean = false): Promise<string> => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.installNpmPackage(pkg, global);
    }
    throw new Error('Electron API not available');
  } catch (error) {
    console.error('Failed to install NPM package:', error);
    throw error;
  }
};

export const setNpmRegistry = async (registry: string): Promise<string> => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.setNpmRegistry(registry);
    }
    throw new Error('Electron API not available');
  } catch (error) {
    console.error('Failed to set NPM registry:', error);
    throw error;
  }
};

// 应用信息命令
export const getAppVersion = async (): Promise<string> => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.getVersion();
    }
    throw new Error('Electron API not available');
  } catch (error) {
    console.error('Failed to get app version:', error);
    throw error;
  }
};

// 窗口控制命令
export const windowControl = async (action: 'minimize' | 'maximize' | 'close'): Promise<{ success: boolean; error?: string }> => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.windowControl(action);
    }
    throw new Error('Electron API not available');
  } catch (error) {
    console.error('Failed to control window:', error);
    throw error;
  }
};

// 主题相关命令
export const getSystemTheme = async (): Promise<boolean> => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.nativeTheme.shouldUseDarkColors();
    }
    throw new Error('Electron API not available');
  } catch (error) {
    console.error('Failed to get system theme:', error);
    throw error;
  }
};

// 平台信息
export const getPlatform = (): string => {
  return window.electronAPI?.platform || 'unknown';
};

// 安全性检查 - 检查 Electron API 是否可用
export const isElectronAPIAvailable = (): boolean => {
  return !!(window as any).electronAPI;
};

// 错误处理包装器
export const safeExecute = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.warn('Operation failed, returning fallback:', error);
    return fallback;
  }
};