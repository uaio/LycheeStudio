/**
 * 页面/模块注册相关类型
 */

import type { PlatformType } from './index.js';

/**
 * 页面类型
 */
export type PageType = 'page' | 'settings' | 'card' | 'modal';

/**
 * 页面元数据
 */
export interface PageMeta {
  /** 页面唯一标识 */
  id: string;

  /** 页面名称（用于显示） */
  name: string;

  /** 页面描述 */
  description?: string;

  /** 页面类型 */
  type: PageType;

  /** 图标 */
  icon?: string;

  /** 支持的平台列表 */
  platforms: PlatformType[];

  /** 排序权重（越小越靠前） */
  order?: number;

  /** 分类 */
  category?: PageCategory;

  /** 是否需要系统命令能力 */
  requiresCommandExecution?: boolean;

  /** 是否需要文件系统访问 */
  requiresFileSystemAccess?: boolean;

  /** 标签 */
  tags?: string[];

  /** 版本 */
  version?: string;

  /** 作者 */
  author?: string;
}

/**
 * 页面分类
 */
export type PageCategory =
  | 'node'        // Node 相关
  | 'claude'      // Claude 相关
  | 'system'      // 系统工具
  | 'config'      // 配置管理
  | 'mcp'         // MCP 服务
  | 'other';      // 其他

/**
 * 页面注册项
 */
export interface PageRegistration<T = any> {
  /** 页面元数据 */
  meta: PageMeta;

  /** 页面组件（在 UI 包中实现） */
  component?: React.ComponentType<T>;

  /** 页面属性 */
  props?: T;
}

/**
 * 页面过滤器
 */
export interface PageFilter {
  /** 平台类型 */
  platform?: PlatformType;

  /** 页面分类 */
  category?: PageCategory;

  /** 是否需要特定能力 */
  requiresCommandExecution?: boolean;
  requiresFileSystemAccess?: boolean;

  /** 标签过滤 */
  tags?: string[];

  /** 搜索关键词 */
  search?: string;
}
