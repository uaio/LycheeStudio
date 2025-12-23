/**
 * 版本解析工具函数
 */

import type { NodeVersion } from '../types/index.js';
import type { FnmListResult } from '../types/node.js';

/**
 * 解析 fnm list 输出
 * @param output - fnm list 命令输出
 * @returns 解析结果
 */
export function parseFnmList(output: string): FnmListResult {
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
 * 解析 fnm list 输出为 NodeVersion 数组
 * @param output - fnm list 命令输出
 * @returns Node 版本数组
 */
export function parseFnmListToNodeVersions(output: string): NodeVersion[] {
  const lines = output.trim().split('\n');
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
 * 格式化日期
 * @param date - 日期
 * @returns 格式化后的字符串
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return '今天';
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days} 天前`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} 周前`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} 个月前`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} 年前`;
  }
}

/**
 * 解析版本号
 * @param versionInput - 版本输入
 * @returns 完整版本号或 null
 */
export function parseVersion(versionInput: string): string | null {
  // 如果已经是完整版本号
  if (/^\d+\.\d+\.\d+$/.test(versionInput)) {
    return versionInput;
  }

  // 如果是主版本号
  if (/^\d+$/.test(versionInput)) {
    return null; // 需要从远程列表查找
  }

  return versionInput;
}

/**
 * 比较版本号
 * @param v1 - 版本1
 * @param v2 - 版本2
 * @returns 比较结果：-1(v1<v2), 0(v1=v2), 1(v1>v2)
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
}

/**
 * 检查版本是否为 LTS
 * @param version - 版本号
 * @returns 是否为 LTS
 */
export function isLTSVersion(version: string): boolean {
  // 常见的 LTS 版本前缀
  const ltsPrefixes = ['18.', '20.', '22.'];
  return ltsPrefixes.some(prefix => version.startsWith(prefix));
}
