/**
 * Node 版本管理相关类型
 */

/**
 * 可用的 Node 版本信息
 */
export interface AvailableNodeVersion {
  /** 版本号 */
  version: string;
  /** LTS 版本名称 */
  lts?: string;
  /** 发布日期 */
  date: string;
  /** 文件名 */
  files: string[];
}

/**
 * FNM 列表输出解析结果
 */
export interface FnmListResult {
  /** 默认版本 */
  defaultVersion: string | null;
  /** 已安装版本列表 */
  installedVersions: string[];
  /** 当前激活版本 */
  currentVersion: string | null;
}

/**
 * Node 安装选项
 */
export interface NodeInstallOptions {
  /** 是否设为默认版本 */
  setAsDefault?: boolean;
  /** 进度回调 */
  onProgress?: (progress: number, step: string) => void;
}
