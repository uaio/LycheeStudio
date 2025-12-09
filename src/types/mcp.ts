/**
 * MCP (Model Context Protocol) 相关类型定义
 */

export interface MCPServer {
  id: string;
  name: string;
  version: string;
  description?: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  status: 'running' | 'stopped' | 'error' | 'unknown';
  autoStart?: boolean;
  port?: number;
  pid?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  lastStartTime?: string;
}

export interface MCPServiceStatus {
  running: boolean;
  pid?: number;
  port?: number;
  uptime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  startTime?: string;
  logPath?: string;
  configPath?: string;
}

export interface MCPLogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source?: string;
}

export interface MCPConfig {
  mcpServers: Record<string, {
    command: string;
    args?: string[];
    env?: Record<string, string>;
  }>;
}

export interface MCPSearchResult {
  name: string;
  version: string;
  description: string;
  author: string;
  keywords: string[];
  downloadCount: number;
  lastUpdated: string;
}