/**
 * MCP 配置和状态存储工具
 */

import { MCPConfig, MCPServiceStatus, MCPServer, MCPLogEntry } from '../types/mcp';
import { safeStorage } from './storage';

export const mcpStorage = {
  /**
   * 读取 MCP 配置文件
   */
  async readMCPConfig(): Promise<{ success: boolean; config?: MCPConfig; error?: string }> {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.mcpConfig.read();
        if (result.success && result.content) {
          const config = JSON.parse(result.content);
          // 缓存到 localStorage
          safeStorage.setItem('mcp-config', JSON.stringify(config));
          return { success: true, config };
        } else if (result.error) {
          console.warn('读取MCP配置文件失败，使用缓存:', result.error);
        }
      } catch (error) {
        console.warn('读取MCP配置文件失败，使用缓存:', error);
      }
    }

    // 降级到 localStorage
    const cached = safeStorage.getItem('mcp-config');
    if (cached) {
      try {
        const config = JSON.parse(cached);
        return { success: true, config };
      } catch (error) {
        console.warn('解析缓存的MCP配置失败:', error);
      }
    }

    // 返回默认配置
    const defaultConfig: MCPConfig = {
      mcpServers: {}
    };
    return { success: true, config: defaultConfig };
  },

  /**
   * 保存 MCP 配置文件
   */
  async saveMCPConfig(config: MCPConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // 先保存到 localStorage
      safeStorage.setItem('mcp-config', JSON.stringify(config));

      // 然后保存到文件
      if (window.electronAPI) {
        const result = await window.electronAPI.mcpConfig.write(JSON.stringify(config, null, 2));
        return result;
      }

      // 非Electron环境认为成功
      return { success: true };
    } catch (error) {
      console.error('保存MCP配置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存失败'
      };
    }
  },

  /**
   * 检查 MCP 配置文件是否存在
   */
  async checkMCPConfigExists(): Promise<{ success: boolean; exists: boolean; error?: string }> {
    if (window.electronAPI && window.electronAPI.mcpConfig && window.electronAPI.mcpConfig.exists) {
      try {
        const result = await window.electronAPI.mcpConfig.exists();
        return result;
      } catch (error) {
        console.error('检查MCP配置文件失败:', error);
        return {
          success: false,
          exists: false,
          error: error instanceof Error ? error.message : '检查失败'
        };
      }
    }

    // 检查 localStorage 中是否有配置
    const cached = safeStorage.getItem('mcp-config');
    return {
      success: true,
      exists: !!cached
    };
  },

  /**
   * 获取 MCP 服务状态
   */
  async getMCPServiceStatus(): Promise<MCPServiceStatus> {
    if (window.electronAPI && window.electronAPI.mcpService && window.electronAPI.mcpService.getStatus) {
      try {
        const result = await window.electronAPI.mcpService.getStatus();
        return result.success ? result.data : {
          running: false
        };
      } catch (error) {
        console.error('获取MCP服务状态失败:', error);
      }
    }

    // 默认状态
    return {
      running: false
    };
  },

  /**
   * 启动 MCP 服务
   */
  async startMCPService(): Promise<{ success: boolean; error?: string }> {
    if (window.electronAPI && window.electronAPI.mcpService && window.electronAPI.mcpService.start) {
      try {
        const result = await window.electronAPI.mcpService.start();
        return result;
      } catch (error) {
        console.error('启动MCP服务失败:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '启动失败'
        };
      }
    }

    return {
      success: false,
      error: 'MCP服务控制不可用'
    };
  },

  /**
   * 停止 MCP 服务
   */
  async stopMCPService(): Promise<{ success: boolean; error?: string }> {
    if (window.electronAPI && window.electronAPI.mcpService && window.electronAPI.mcpService.stop) {
      try {
        const result = await window.electronAPI.mcpService.stop();
        return result;
      } catch (error) {
        console.error('停止MCP服务失败:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '停止失败'
        };
      }
    }

    return {
      success: false,
      error: 'MCP服务控制不可用'
    };
  },

  /**
   * 重启 MCP 服务
   */
  async restartMCPService(): Promise<{ success: boolean; error?: string }> {
    const stopResult = await this.stopMCPService();
    if (!stopResult.success) {
      return stopResult;
    }

    // 等待一秒确保服务完全停止
    await new Promise(resolve => setTimeout(resolve, 1000));

    return await this.startMCPService();
  },

  /**
   * 获取 MCP 服务日志
   */
  async getMCPServiceLogs(lines: number = 100): Promise<MCPLogEntry[]> {
    if (window.electronAPI && window.electronAPI.mcpService && window.electronAPI.mcpService.getLogs) {
      try {
        const result = await window.electronAPI.mcpService.getLogs(lines);
        return result.success ? result.data : [];
      } catch (error) {
        console.error('获取MCP服务日志失败:', error);
      }
    }

    return [];
  },

  /**
   * 搜索 npm 上的 MCP 服务器包
   */
  async searchMCPServers(query: string): Promise<{ success: boolean; servers?: any[]; error?: string }> {
    if (window.electronAPI && window.electronAPI.mcpService && window.electronAPI.mcpService.searchPackages) {
      try {
        const result = await window.electronAPI.mcpService.searchPackages(query);
        return result;
      } catch (error) {
        console.error('搜索MCP服务器失败:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '搜索失败'
        };
      }
    }

    // 降级到浏览器搜索 NPM
    try {
      const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=mcp+${encodeURIComponent(query)}`);
      const data = await response.json();

      const servers = data.objects
        .filter((obj: any) => {
          // 使用正确的数据结构
          const packageName = obj.package?.name || '';
          const description = obj.package?.description || '';

          return packageName.includes('mcp') ||
                 (description && description.toLowerCase().includes('model context protocol'));
        })
        .slice(0, 20)
        .map((obj: any) => ({
          name: obj.package?.name || obj.name,
          displayName: obj.package?.name?.replace('@modelcontextprotocol/server-', '') || obj.name,
          version: obj.package?.version || '0.0.0',
          description: obj.package?.description || 'No description available',
          keywords: obj.package?.keywords || [],
          author: obj.package?.publisher?.username || 'Unknown',
          date: obj.package?.date,
          links: {
            npm: `https://www.npmjs.com/package/${obj.package?.name || obj.name}`,
            github: obj.package?.links?.repository
          }
        }));

      return {
        success: true,
        servers
      };
    } catch (error) {
      console.error('搜索NPM MCP包失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '搜索失败'
      };
    }
  },

  /**
   * 获取官方 MCP 服务器列表
   */
  async getOfficialMCPServers(): Promise<{ success: boolean; servers?: any[]; error?: string }> {
    try {
      console.log('开始获取官方 MCP 服务器...');
      const response = await fetch('https://registry.npmjs.org/-/v1/search?text=keywords:modelcontextprotocol');

      console.log('响应状态:', response.status, response.statusText);
      console.log('响应头:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('非 JSON 响应:', text);
        throw new Error('服务器返回了非 JSON 格式的响应');
      }

      const data = await response.json();
      console.log('获取到的数据:', data);

      if (!data.objects || !Array.isArray(data.objects)) {
        console.error('响应数据格式不正确:', data);
        throw new Error('响应数据格式不正确');
      }

      const servers = data.objects
        .filter((obj: any) =>
          obj.package && obj.package.name && obj.package.name.startsWith('@modelcontextprotocol/server-')
        )
        .map((obj: any) => ({
          name: obj.package.name,
          displayName: obj.package.name.replace('@modelcontextprotocol/server-', ''),
          version: obj.package.version || '0.0.0',
          description: obj.package.description || 'No description available',
          keywords: obj.package.keywords || [],
          author: obj.package.publisher?.username || 'Model Context Protocol',
          date: obj.package.date,
          homepage: obj.package.homepage,
          repository: obj.package.links?.repository,
          dependencies: obj.package.dependencies || {},
          links: {
            npm: `https://www.npmjs.com/package/${obj.package.name}`,
            github: obj.package.links?.repository
          }
        }));

      console.log('处理后的服务器数量:', servers.length);
      return {
        success: true,
        servers
      };
    } catch (error) {
      console.error('获取官方MCP服务器失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取失败'
      };
    }
  },

  /**
   * 安装 MCP 服务器包
   */
  async installMCPServer(packageName: string): Promise<{ success: boolean; error?: string }> {
    if (window.electronAPI && window.electronAPI.mcpService && window.electronAPI.mcpService.installPackage) {
      try {
        const result = await window.electronAPI.mcpService.installPackage(packageName);
        return result;
      } catch (error) {
        console.error('安装MCP服务器失败:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '安装失败'
        };
      }
    }

    return {
      success: false,
      error: '包安装功能不可用'
    };
  },

  /**
   * 卸载 MCP 服务器包
   */
  async uninstallMCPServer(packageName: string): Promise<{ success: boolean; error?: string }> {
    if (window.electronAPI && window.electronAPI.mcpService && window.electronAPI.mcpService.uninstallPackage) {
      try {
        const result = await window.electronAPI.mcpService.uninstallPackage(packageName);
        return result;
      } catch (error) {
        console.error('卸载MCP服务器失败:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '卸载失败'
        };
      }
    }

    return {
      success: false,
      error: '包卸载功能不可用'
    };
  }
};