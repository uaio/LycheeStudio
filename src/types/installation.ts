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
  stage: 'checking' | 'downloading' | 'installing' | 'configuring' | 'completed' | 'error' | 'group-completed';
  progress: number;
  total?: number;
  downloaded?: number;
  speed?: number;
  eta?: number;
  message: string;
  timestamp: number;
  groupIndex?: number;
  groupResults?: ToolStatus[];
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
    description: 'macOS 包管理器，用于安装和管理开发工具',
    installCommand: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
    dependencies: [],
  },
  fnm: {
    name: 'FNM',
    description: 'Fast Node Manager - 快速的 Node.js 版本管理器',
    installCommand: 'brew install fnm',
    dependencies: ['brew'],
  },
  claudeCode: {
    name: 'Claude Code',
    description: 'Anthropic Claude Code CLI - AI驱动的开发工具',
    installCommand: 'brew install claude-code',
    dependencies: ['brew'],
  },
  geminiCli: {
    name: 'Gemini CLI',
    description: 'Google Gemini CLI - AI代码助手和生成工具',
    installCommand: 'brew install gemini-cli',
    dependencies: ['brew'],
  },
  codex: {
    name: 'Codex',
    description: 'OpenAI Codex CLI - AI代码生成和补全工具',
    installCommand: 'brew install codex',
    dependencies: ['brew'],
  },
  node: {
    name: 'Node.js',
    description: 'Node.js - JavaScript 运行环境',
    installCommand: 'fnm install --lts',
    dependencies: ['fnm'],
  },
  npm: {
    name: 'NPM 源',
    description: 'NPM - Node.js 包管理器',
    installCommand: 'npm --version', // NPM 随 Node.js 一起安装，不需要单独安装
    dependencies: ['node'],
  },
} as const;

export type ToolName = keyof typeof TOOLS_INFO;