/**
 * Node 版本管理服务
 */

import type { PlatformAdapter } from '../adapters/interface.js';
import type {
  NodeVersion,
  InstallationResult,
  InstallationProgress,
} from '../types/index.js';
import type {
  AvailableNodeVersion,
  NodeInstallOptions,
  FnmListResult,
} from '../types/node.js';

/**
 * Node 版本管理服务
 * 负责管理 Node.js 版本的安装、切换、卸载
 */
export class NodeManager {
  constructor(private adapter: PlatformAdapter) {}

  /**
   * 获取已安装的 Node 版本列表
   * @returns Node 版本列表
   */
  async getInstalledVersions(): Promise<NodeVersion[]> {
    const result = await this.adapter.executeCommand('fnm list');

    if (!result.success || !result.stdout) {
      return [];
    }

    const lines = result.stdout.trim().split('\n');
    const versions: NodeVersion[] = [];

    for (const line of lines) {
      // 匹配 "* v20.0.0 default" 或 "v20.0.0" 格式
      const match = line.match(/(?:\*\s+)?v?(\d+\.\d+\.\d+)(\s+default)?/);
      if (match) {
        const version = match[1];
        const isDefault = !!match[2];
        const isActive = line.startsWith('*');

        versions.push({
          version,
          isDefault,
          isActive,
        });
      }
    }

    return versions;
  }

  /**
   * 获取当前激活的 Node 版本
   * @returns 当前版本号，未安装返回 null
   */
  async getCurrentVersion(): Promise<string | null> {
    const result = await this.adapter.executeCommand('fnm current');

    if (!result.success || !result.stdout) {
      return null;
    }

    const output = result.stdout.trim();
    if (output === 'None' || output === '') {
      return null;
    }

    // 匹配 "v20.0.0" 格式
    const match = output.match(/v?(\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  }

  /**
   * 获取默认 Node 版本
   * @returns 默认版本号，未设置返回 null
   */
  async getDefaultVersion(): Promise<string | null> {
    const fnmList = await this.getFnmList();
    return fnmList.defaultVersion;
  }

  /**
   * 安装 Node 版本
   * @param version - 版本号（支持 "20" 自动匹配最新版本）
   * @param options - 安装选项
   * @returns 安装结果
   */
  async installVersion(
    version: string,
    options?: NodeInstallOptions
  ): Promise<InstallationResult> {
    // 如果是主版本号（如 "20"），需要先解析成完整版本号
    const targetVersion = await this.resolveVersion(version);

    if (!targetVersion) {
      return {
        success: false,
        error: `无法找到匹配版本 ${version}`,
      };
    }

    // 执行安装命令
    const result = await this.adapter.executeCommand(
      `fnm install ${targetVersion}`
    );

    if (!result.success) {
      return {
        success: false,
        error: result.stderr || result.error?.message || '安装失败',
      };
    }

    // 如果需要设为默认版本
    if (options?.setAsDefault) {
      await this.setDefaultVersion(targetVersion);
    }

    return {
      success: true,
      version: targetVersion,
    };
  }

  /**
   * 切换 Node 版本
   * @param version - 版本号
   * @param setAsDefault - 是否设为默认版本
   * @returns 是否成功
   */
  async useVersion(
    version: string,
    setAsDefault = false
  ): Promise<boolean> {
    // 切换版本
    const useResult = await this.adapter.executeCommand(`fnm use ${version}`);

    if (!useResult.success) {
      return false;
    }

    // 如果需要设为默认
    if (setAsDefault) {
      return await this.setDefaultVersion(version);
    }

    return true;
  }

  /**
   * 设置默认 Node 版本
   * @param version - 版本号
   * @returns 是否成功
   */
  async setDefaultVersion(version: string): Promise<boolean> {
    const result = await this.adapter.executeCommand(`fnm default ${version}`);
    return result.success;
  }

  /**
   * 卸载 Node 版本
   * @param version - 版本号
   * @returns 是否成功
   */
  async uninstallVersion(version: string): Promise<boolean> {
    const result = await this.adapter.executeCommand(`fnm uninstall ${version}`);
    return result.success;
  }

  /**
   * 解析版本号
   * @param versionInput - 版本输入（可能是主版本号如 "20"）
   * @returns 完整版本号
   */
  private async resolveVersion(versionInput: string): Promise<string | null> {
    // 如果已经是完整版本号
    if (/^\d+\.\d+\.\d+$/.test(versionInput)) {
      return versionInput;
    }

    // 如果是主版本号，获取可用版本列表
    if (/^\d+$/.test(versionInput)) {
      const availableVersions = await this.getAvailableVersions();
      const majorVersion = versionInput;

      // 找到匹配主版本号的最新版本
      const matchedVersion = availableVersions.find(v =>
        v.version.startsWith(`${majorVersion}.`)
      );

      return matchedVersion?.version || null;
    }

    // 尝试直接使用
    return versionInput;
  }

  /**
   * 获取可用的 Node 版本列表
   * @returns 可用版本列表
   */
  async getAvailableVersions(): Promise<AvailableNodeVersion[]> {
    const result = await this.adapter.executeCommand(
      'fnm list-remote --downloaded-only'
    );

    if (!result.success || !result.stdout) {
      return [];
    }

    // 解析输出
    const lines = result.stdout.trim().split('\n');
    const versions: AvailableNodeVersion[] = [];

    for (const line of lines) {
      // 匹配 "v20.0.0" 格式
      const match = line.match(/v(\d+\.\d+\.\d+)/);
      if (match) {
        versions.push({
          version: match[1],
          date: '',
          files: [],
        });
      }
    }

    return versions;
  }

  /**
   * 获取 FNM 列表输出
   * @returns FNM 列表解析结果
   */
  private async getFnmList(): Promise<FnmListResult> {
    const result = await this.adapter.executeCommand('fnm list');

    if (!result.success || !result.stdout) {
      return {
        defaultVersion: null,
        installedVersions: [],
        currentVersion: null,
      };
    }

    const lines = result.stdout.trim().split('\n');
    const installedVersions: string[] = [];
    let defaultVersion: string | null = null;
    let currentVersion: string | null = null;

    for (const line of lines) {
      const match = line.match(/(?:\*\s+)?v?(\d+\.\d+\.\d+)(\s+default)?/);
      if (match) {
        const version = match[1];
        installedVersions.push(version);

        if (match[2]) {
          defaultVersion = version;
        }

        if (line.startsWith('*')) {
          currentVersion = version;
        }
      }
    }

    return {
      defaultVersion,
      installedVersions,
      currentVersion,
    };
  }

  /**
   * 检查 Node 是否已安装
   * @returns 是否已安装
   */
  async isInstalled(): Promise<boolean> {
    const result = await this.adapter.executeCommand('node --version');
    return result.success;
  }

  /**
   * 获取当前 Node 版本
   * @returns 版本号
   */
  async getNodeVersion(): Promise<string | null> {
    const result = await this.adapter.executeCommand('node --version');

    if (result.success && result.stdout) {
      return result.stdout.trim().replace(/^v/, '');
    }

    return null;
  }
}
