/**
 * MCP 管理服务
 */

import type { PlatformAdapter } from '../adapters/interface.js';
import type { MCPConfig, MCPServer } from '../types/claude.js';

/**
 * 路径工具函数
 */
function joinPath(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/');
}

/**
 * MCP 管理服务
 * 负责管理 Claude Desktop 的 MCP 服务配置
 */
export class MCPManager {
  constructor(private adapter: PlatformAdapter) {}

  /**
   * 获取 MCP 配置文件路径
   * @returns 配置文件路径
   */
  private getConfigPath(): string {
    return joinPath(
      this.adapter.environment.getUserHomeDir.toString(),
      'Library',
      'Application Support',
      'Claude',
      'claude_desktop_config.json'
    ) as any;
  }

  /**
   * 读取 MCP 配置
   * @returns MCP 配置
   */
  async readConfig(): Promise<MCPConfig> {
    const configPath = this.getConfigPath();
    const exists = await this.adapter.fileSystem.exists(configPath);

    if (!exists) {
      return { mcpServers: {} };
    }

    try {
      const content = await this.adapter.fileSystem.readFile(configPath);
      return JSON.parse(content);
    } catch {
      return { mcpServers: {} };
    }
  }

  /**
   * 写入 MCP 配置
   * @param config - 配置
   */
  async writeConfig(config: MCPConfig): Promise<void> {
    const configPath = this.getConfigPath();
    const content = JSON.stringify(config, null, 2);

    // 确保目录存在
    const dir = configPath.substring(0, configPath.lastIndexOf('/'));
    await this.adapter.fileSystem.mkdir(dir, { recursive: true });

    await this.adapter.fileSystem.writeFile(configPath, content);
  }

  /**
   * 获取所有 MCP 服务
   * @returns MCP 服务列表
   */
  async getServers(): Promise<MCPServer[]> {
    const config = await this.readConfig();
    return Object.entries(config.mcpServers).map(([name, server]) => ({
      name,
      command: server.command,
      args: server.args,
      env: server.env,
    }));
  }

  /**
   * 获取单个 MCP 服务
   * @param name - 服务名称
   * @returns MCP 服务或 null
   */
  async getServer(name: string): Promise<MCPServer | null> {
    const config = await this.readConfig();
    const server = config.mcpServers[name];

    if (!server) {
      return null;
    }

    return {
      name,
      command: server.command,
      args: server.args,
      env: server.env,
    };
  }

  /**
   * 添加或更新 MCP 服务
   * @param name - 服务名称
   * @param server - 服务配置
   */
  async setServer(name: string, server: Omit<MCPServer, 'name'>): Promise<void> {
    const config = await this.readConfig();
    config.mcpServers[name] = {
      command: server.command,
      args: server.args,
      env: server.env,
    };
    await this.writeConfig(config);
  }

  /**
   * 删除 MCP 服务
   * @param name - 服务名称
   */
  async removeServer(name: string): Promise<void> {
    const config = await this.readConfig();
    delete config.mcpServers[name];
    await this.writeConfig(config);
  }

  /**
   * 检查 MCP 服务是否存在
   * @param name - 服务名称
   * @returns 是否存在
   */
  async serverExists(name: string): Promise<boolean> {
    const config = await this.readConfig();
    return name in config.mcpServers;
  }

  /**
   * 获取推荐的 MCP 服务列表
   * @returns 推荐的 MCP 服务
   */
  getRecommendedServers(): Array<{ name: string; server: Omit<MCPServer, 'name'>; description: string }> {
    return [
      {
        name: 'filesystem',
        server: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/anan/Projects'],
        },
        description: '文件系统访问 - 允许读取和写入项目文件',
      },
      {
        name: 'brave-search',
        server: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-brave-search'],
        },
        description: 'Brave 搜索 - 网络搜索功能',
      },
      {
        name: 'github',
        server: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-github'],
        },
        description: 'GitHub 集成 - 管理 Issues、PR、仓库等',
      },
      {
        name: 'postgres',
        server: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-postgres'],
        },
        description: 'PostgreSQL 数据库 - 查询和管理数据库',
      },
    ];
  }
}
