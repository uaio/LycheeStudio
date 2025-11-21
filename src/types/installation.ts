// 安装相关类型定义

export interface ToolStatus {
  name: string;
  version?: string;
  isInstalled: boolean;
  path?: string;
  status: 'installed' | 'not-installed' | 'installing' | 'error';
  dependencies: string[];
  description: string;
  installCommand?: string;
}

export interface InstallationProgress {
  tool: string;
  stage: 'checking' | 'downloading' | 'installing' | 'configuring' | 'completed' | 'error';
  progress: number;
  total?: number;
  downloaded?: number;
  speed?: number;
  eta?: number;
  message: string;
  timestamp: number;
}

export interface InstallationLog {
  message: string;
  level: 'info' | 'error' | 'warning' | 'success';
  color: string;
  timestamp: number;
}

export interface InstallationError {
  code: string;
  message: string;
  originalError: string;
  solution?: string;
  canRetry: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface InstallationTask {
  id: string;
  toolName: string;
  command: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress?: InstallationProgress;
  logs: InstallationLog[];
  error?: InstallationError;
  startTime?: number;
  endTime?: number;
  dependencies: string[];
}

export interface InstallationEngine {
  // 检测工具状态
  detectTool(toolName: string): Promise<ToolStatus>;

  // 检测所有工具
  detectAllTools(): Promise<ToolStatus[]>;

  // 安装单个工具
  installTool(toolName: string): Promise<string>;

  // 获取安装进度
  getProgress(toolName: string): InstallationProgress | null;

  // 取消安装
  cancelInstallation(toolName: string): boolean;

  // 监听进度变化
  onProgress(callback: (progress: InstallationProgress) => void): void;

  // 监听日志输出
  onLog(callback: (log: InstallationLog) => void): void;
}

// 工具信息
export const TOOLS_INFO = {
  brew: {
    name: 'Homebrew',
    description: 'macOS 包管理器',
    installCommand: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
    dependencies: [],
  },
  fnm: {
    name: 'fnm',
    description: 'Fast Node Manager',
    installCommand: 'brew install fnm',
    dependencies: ['brew'],
  },
  claudeCode: {
    name: 'claude-cdoe',
    description: 'Claude Code CLI',
    installCommand: 'npm install -g @anthropic-ai/claude-code',
    dependencies: ['fnm'],
  },
  codex: {
    name: 'codex',
    description: 'Codex CLI',
    installCommand: 'npm install -g @github/codex-cli',
    dependencies: ['fnm'],
  },
  geminiCli: {
    name: 'gemini-cli',
    description: 'Gemini CLI',
    installCommand: 'npm install -g @google/generative-ai-cli',
    dependencies: ['fnm'],
  },
} as const;

export type ToolName = keyof typeof TOOLS_INFO;