/**
 * FNM 管理服务
 */

import type { PlatformAdapter } from '../adapters/interface.js';
import type { ToolStatus, CommandResult } from '../types/index.js';
import type { FnmListResult, NodeInstallOptions } from '../types/node.js';

/**
 * FNM 管理服务
 * 负责检测 FNM 安装状态、检查 AI 工具
 */
export class FNMManager {
  constructor(private adapter: PlatformAdapter) {}

  /**
   * 检查 FNM 是否已安装
   * @returns 是否已安装
   */
  async isInstalled(): Promise<boolean> {
    const result = await this.adapter.executeCommand('fnm --version');
    return result.success;
  }

  /**
   * 获取 FNM 版本
   * @returns 版本号，未安装返回 null
   */
  async getVersion(): Promise<string | null> {
    const result = await this.adapter.executeCommand('fnm --version');
    if (result.success && result.stdout) {
      return result.stdout.trim();
    }
    return null;
  }

  /**
   * 检查 AI 工具是否通过 FNM 安装
   * @param toolName - 工具名称 (codex, gemini-cli, claude-code)
   * @returns 工具状态
   */
  async checkAITool(toolName: string): Promise<ToolStatus> {
    const result = await this.adapter.executeCommand(`which ${toolName}`);
    const displayName = this.getToolDisplayName(toolName);

    if (result.success && result.stdout) {
      const path = result.stdout.trim();
      return {
        name: toolName,
        displayName,
        status: 'active',
        path,
      };
    }

    return {
      name: toolName,
      displayName,
      status: 'warning',
      error: '未安装',
    };
  }

  /**
   * 批量检查 AI 工具
   * @param toolNames - 工具名称列表
   * @returns 工具状态列表
   */
  async checkAITools(toolNames: string[]): Promise<ToolStatus[]> {
    const results = await Promise.all(
      toolNames.map(name => this.checkAITool(name))
    );
    return results;
  }

  /**
   * 获取 FNM 列表输出
   * @returns FNM 列表解析结果
   */
  async getFnmList(): Promise<FnmListResult> {
    const result = await this.adapter.executeCommand('fnm list');

    if (!result.success || !result.stdout) {
      return {
        defaultVersion: null,
        installedVersions: [],
        currentVersion: null,
      };
    }

    return this.parseFnmList(result.stdout);
  }

  /**
   * 解析 fnm list 输出
   * @param output - 命令输出
   * @returns 解析结果
   */
  private parseFnmList(output: string): FnmListResult {
    const lines = output.trim().split('\n');
    const installedVersions: string[] = [];
    let defaultVersion: string | null = null;
    let currentVersion: string | null = null;

    for (const line of lines) {
      // 匹配 "* v20.0.0 default" 或 "v20.0.0" 格式
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
   * 获取工具显示名称
   * @param toolName - 工具名称
   * @returns 显示名称
   */
  private getToolDisplayName(toolName: string): string {
    const displayNames: Record<string, string> = {
      'codex': 'Codex CLI',
      'gemini-cli': 'Gemini CLI',
      'claude-code': 'Claude Code',
    };
    return displayNames[toolName] || toolName;
  }

  /**
   * 安装 FNM（通过 Homebrew）
   * @returns 安装结果
   */
  async installFNM(): Promise<CommandResult> {
    return await this.adapter.executeCommand('brew install fnm');
  }

  /**
   * 获取 FNM 安装路径
   * @returns 安装路径
   */
  async getInstallPath(): Promise<string | null> {
    const result = await this.adapter.executeCommand('which fnm');
    if (result.success && result.stdout) {
      return result.stdout.trim();
    }
    return null;
  }
}
