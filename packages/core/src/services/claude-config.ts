/**
 * Claude 配置服务
 */

import type { PlatformAdapter } from '../adapters/interface.js';
import type {
  ClaudeConfig,
  APIProvider,
  AIModel,
  PromptTemplate,
  PromptsData,
} from '../types/claude.js';

/**
 * 路径工具函数
 */
function joinPath(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/');
}

/**
 * Claude 配置管理服务
 * 负责管理 Claude Code 的配置、模型切换、Provider 设置
 */
export class ClaudeConfigManager {
  constructor(private adapter: PlatformAdapter) {}

  /**
   * 获取配置文件路径
   * @returns 配置文件路径
   */
  private getConfigPath(): string {
    // 在实际实现中需要使用 path.join
    return joinPath(
      this.adapter.environment.getUserHomeDir.toString(),
      '.claude',
      'settings.json'
    ) as any;
  }

  /**
   * 读取 Claude 配置
   * @returns Claude 配置
   */
  async readConfig(): Promise<ClaudeConfig> {
    const configPath = this.getConfigPath();
    const exists = await this.adapter.fileSystem.exists(configPath);

    if (!exists) {
      return this.getDefaultConfig();
    }

    try {
      const content = await this.adapter.fileSystem.readFile(configPath);
      return JSON.parse(content);
    } catch {
      return this.getDefaultConfig();
    }
  }

  /**
   * 写入 Claude 配置
   * @param config - 配置
   */
  async writeConfig(config: ClaudeConfig): Promise<void> {
    const configPath = this.getConfigPath();
    const content = JSON.stringify(config, null, 2);

    // 确保目录存在
    const dir = configPath.substring(0, configPath.lastIndexOf('/'));
    await this.adapter.fileSystem.mkdir(dir, { recursive: true });

    await this.adapter.fileSystem.writeFile(configPath, content);
  }

  /**
   * 设置当前模型
   * @param modelType - 模型类型 (haiku, sonnet, opus)
   * @param model - 模型名称
   */
  async setModel(modelType: 'haiku' | 'sonnet' | 'opus', model: string): Promise<void> {
    const config = await this.readConfig();
    const envKey = `ANTHROPIC_DEFAULT_${modelType.toUpperCase()}_MODEL`;
    config.env[envKey] = model;
    await this.writeConfig(config);
  }

  /**
   * 获取当前模型
   * @param modelType - 模型类型
   * @returns 模型名称
   */
  async getModel(modelType: 'haiku' | 'sonnet' | 'opus'): Promise<string | null> {
    const config = await this.readConfig();
    const envKey = `ANTHROPIC_DEFAULT_${modelType.toUpperCase()}_MODEL`;
    return config.env[envKey] || null;
  }

  /**
   * 设置 API 提供商
   * @param provider - 提供商配置
   */
  async setProvider(provider: APIProvider): Promise<void> {
    const config = await this.readConfig();
    config.env = {
      ...config.env,
      ANTHROPIC_AUTH_TOKEN: provider.apiKey,
    };

    if (provider.baseUrl) {
      config.env.ANTHROPIC_BASE_URL = provider.baseUrl;
    }

    await this.writeConfig(config);
  }

  /**
   * 获取 API 提供商配置
   * @returns 提供商配置
   */
  async getProvider(): Promise<APIProvider | null> {
    const config = await this.readConfig();
    const apiKey = config.env.ANTHROPIC_AUTH_TOKEN;

    if (!apiKey) {
      return null;
    }

    return {
      name: 'anthropic',
      apiKey,
      baseUrl: config.env.ANTHROPIC_BASE_URL,
    };
  }

  /**
   * 获取默认配置
   * @returns 默认配置
   */
  private getDefaultConfig(): ClaudeConfig {
    return {
      env: {},
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000,
      },
    };
  }

  /**
   * 获取可用的模型列表
   * @returns 模型列表
   */
  getAvailableModels(): AIModel[] {
    return [
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        maxTokens: 200000,
        temperature: 0,
        enabled: true,
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        maxTokens: 200000,
        temperature: 0,
        enabled: true,
      },
      {
        id: 'claude-3-5-sonnet-20240620',
        name: 'Claude 3.5 Sonnet (旧版)',
        provider: 'anthropic',
        maxTokens: 200000,
        temperature: 0,
        enabled: false,
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        maxTokens: 200000,
        temperature: 0,
        enabled: false,
      },
    ];
  }
}
