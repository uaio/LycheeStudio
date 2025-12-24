/**
 * 页面管理 Hook
 */

import { useMemo } from 'react';
import type { PlatformType } from '@ai-tools/core';
import type { PageMeta, PageFilter } from '@ai-tools/core';
import { BUILTIN_PAGES, getPagesForPlatform, getPagesByCategory } from '@ai-tools/core';

/**
 * 平台页面配置
 */
export interface PlatformPageConfig {
  /** 平台类型 */
  platform: PlatformType;

  /** 禁用的页面ID列表 */
  disabledPages?: string[];

  /** 启用的页面ID列表（优先级高于 disabledPages） */
  enabledPages?: string[];

  /** 自定义页面配置 */
  customPages?: PageMeta[];
}

/**
 * 页面管理 Hook
 */
export interface UsePagesOptions {
  /** 平台类型 */
  platform: PlatformType;

  /** 页面配置 */
  config?: PlatformPageConfig;

  /** 额外的过滤器 */
  filter?: PageFilter;
}

/**
 * 页面管理返回值
 */
export interface UsePagesReturn {
  /** 所有可用页面 */
  pages: PageMeta[];

  /** 按分类分组的页面 */
  pagesByCategory: Record<string, PageMeta[]>;

  /** 获取指定页面 */
  getPage: (id: string) => PageMeta | undefined;

  /** 检查页面是否可用 */
  isPageAvailable: (id: string) => boolean;

  /** 根据分类获取页面 */
  getPagesByCategory: (category: string) => PageMeta[];
}

/**
 * 页面管理 Hook
 */
export function usePages(options: UsePagesOptions): UsePagesReturn {
  const { platform, config, filter } = options;

  // 计算可用页面列表
  const pages = useMemo(() => {
    let pageList = getPagesForPlatform(platform);

    // 应用自定义配置
    if (config) {
      // 如果指定了启用的页面，只显示这些页面
      if (config.enabledPages && config.enabledPages.length > 0) {
        pageList = pageList.filter(page => config.enabledPages!.includes(page.id));
      }
      // 否则排除禁用的页面
      else if (config.disabledPages && config.disabledPages.length > 0) {
        pageList = pageList.filter(page => !config.disabledPages!.includes(page.id));
      }

      // 添加自定义页面
      if (config.customPages && config.customPages.length > 0) {
        pageList = [...pageList, ...config.customPages];
      }
    }

    // 应用过滤器
    if (filter) {
      if (filter.category) {
        pageList = pageList.filter(page => page.category === filter.category);
      }
      if (filter.tags && filter.tags.length > 0) {
        pageList = pageList.filter(page =>
          filter.tags!.some(tag => page.tags?.includes(tag))
        );
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        pageList = pageList.filter(page =>
          page.name.toLowerCase().includes(searchLower) ||
          page.description?.toLowerCase().includes(searchLower) ||
          page.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
    }

    // 排序
    return pageList.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [platform, config, filter]);

  // 按分类分组
  const pagesByCategory = useMemo(() => {
    const grouped: Record<string, PageMeta[]> = {};
    for (const page of pages) {
      const category = page.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(page);
    }
    return grouped;
  }, [pages]);

  // 获取指定页面
  const getPage = (id: string): PageMeta | undefined => {
    return pages.find(page => page.id === id);
  };

  // 检查页面是否可用
  const isPageAvailable = (id: string): boolean => {
    return pages.some(page => page.id === id);
  };

  // 根据分类获取页面
  const getPagesByCategoryFn = (category: string): PageMeta[] => {
    return pagesByCategory[category] || [];
  };

  return {
    pages,
    pagesByCategory,
    getPage,
    isPageAvailable,
    getPagesByCategory: getPagesByCategoryFn,
  };
}

/**
 * 预设的平台配置
 */
export const PLATFORM_CONFIGS: Record<PlatformType, PlatformPageConfig> = {
  // Electron 完整功能
  electron: {
    platform: 'electron',
    // 所有默认页面都启用
  },

  // VSCode 项目级配置
  vscode: {
    platform: 'vscode',
    // VSCode 禁用一些全局工具安装功能
    disabledPages: ['fnm_manager', 'tool_installation'],
  },

  // Web 版本 - 显示所有页面，不支持的功能显示指引
  web: {
    platform: 'web',
    // 所有页面都启用（显示指引版本）
  },
};
