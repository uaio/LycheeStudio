/**
 * Claude 配置相关类型
 */

/**
 * AI 提供商
 */
export interface APIProvider {
  /** 提供商名称 */
  name: string;
  /** API Key */
  apiKey: string;
  /** Base URL */
  baseUrl?: string;
}

/**
 * AI 模型配置
 */
export interface AIModel {
  /** 模型ID */
  id: string;
  /** 模型名称 */
  name: string;
  /** 提供商 */
  provider: 'anthropic' | 'openai' | 'google';
  /** 最大Token数 */
  maxTokens: number;
  /** 温度参数 */
  temperature: number;
  /** 是否启用 */
  enabled: boolean;
}

/**
 * Claude 配置
 */
export interface ClaudeConfig {
  /** 环境变量 */
  env: Record<string, string>;
  /** API 设置 */
  apiSettings?: {
    /** 超时时间 */
    timeout?: number;
    /** 重试次数 */
    retryAttempts?: number;
    /** 重试延迟 */
    retryDelay?: number;
  };
}

/**
 * Prompt 模板
 */
export interface PromptTemplate {
  /** 模板ID */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板内容 */
  content: string;
  /** 是否为内置模板 */
  isBuiltin: boolean;
  /** 标签 */
  tags: string[];
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * Prompts 数据
 */
export interface PromptsData {
  /** 版本 */
  version: string;
  /** 模板列表 */
  templates: PromptTemplate[];
  /** 最后同步时间 */
  lastSyncTime: string | null;
}

/**
 * MCP 服务配置（配置文件中的格式）
 */
export interface MCPServerConfig {
  /** 命令 */
  command: string;
  /** 参数 */
  args: string[];
  /** 环境变量 */
  env?: Record<string, string>;
}

/**
 * MCP 服务（包含名称）
 */
export interface MCPServer extends MCPServerConfig {
  /** 服务名称 */
  name: string;
}

/**
 * MCP 配置
 */
export interface MCPConfig {
  /** MCP 服务列表 */
  mcpServers: Record<string, MCPServerConfig>;
}
