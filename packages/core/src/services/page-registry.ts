/**
 * 页面注册中心
 */

import type { PageMeta, PageRegistration, PageFilter } from '../types/page.js';
import type { PlatformType } from '../types/index.js';

/**
 * 页面注册中心
 * 用于管理所有可用的页面/模块
 */
export class PageRegistry {
  private static instance: PageRegistry;
  private pages: Map<string, PageRegistration> = new Map();

  private constructor() {}

  static getInstance(): PageRegistry {
    if (!PageRegistry.instance) {
      PageRegistry.instance = new PageRegistry();
    }
    return PageRegistry.instance;
  }

  /**
   * 注册页面
   * @param registration - 页面注册项
   */
  register<T = any>(registration: PageRegistration<T>): void {
    const { meta } = registration;

    if (this.pages.has(meta.id)) {
      console.warn(`页面 ${meta.id} 已存在，将被覆盖`);
    }

    this.pages.set(meta.id, registration);
  }

  /**
   * 批量注册页面
   * @param registrations - 页面注册项数组
   */
  registerMany(registrations: PageRegistration[]): void {
    for (const registration of registrations) {
      this.register(registration);
    }
  }

  /**
   * 注销页面
   * @param id - 页面ID
   */
  unregister(id: string): void {
    this.pages.delete(id);
  }

  /**
   * 获取页面
   * @param id - 页面ID
   * @returns 页面注册项或 undefined
   */
  get(id: string): PageRegistration | undefined {
    return this.pages.get(id);
  }

  /**
   * 获取所有页面
   * @returns 所有页面注册项
   */
  getAll(): PageRegistration[] {
    return Array.from(this.pages.values());
  }

  /**
   * 根据平台获取页面
   * @param platform - 平台类型
   * @returns 页面注册项数组
   */
  getByPlatform(platform: PlatformType): PageRegistration[] {
    return this.getAll().filter(page =>
      page.meta.platforms.includes(platform)
    );
  }

  /**
   * 根据分类获取页面
   * @param category - 页面分类
   * @returns 页面注册项数组
   */
  getByCategory(category: string): PageRegistration[] {
    return this.getAll().filter(page =>
      page.meta.category === category
    );
  }

  /**
   * 过滤页面
   * @param filter - 过滤条件
   * @returns 页面注册项数组
   */
  filter(filter: PageFilter): PageRegistration[] {
    let pages = this.getAll();

    // 平台过滤
    if (filter.platform) {
      pages = pages.filter(page =>
        page.meta.platforms.includes(filter.platform!)
      );
    }

    // 分类过滤
    if (filter.category) {
      pages = pages.filter(page => page.meta.category === filter.category);
    }

    // 能力过滤
    if (filter.requiresCommandExecution !== undefined) {
      pages = pages.filter(page =>
        page.meta.requiresCommandExecution === filter.requiresCommandExecution
      );
    }

    if (filter.requiresFileSystemAccess !== undefined) {
      pages = pages.filter(page =>
        page.meta.requiresFileSystemAccess === filter.requiresFileSystemAccess
      );
    }

    // 标签过滤
    if (filter.tags && filter.tags.length > 0) {
      pages = pages.filter(page =>
        filter.tags!.some(tag => page.meta.tags?.includes(tag))
      );
    }

    // 搜索过滤
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      pages = pages.filter(page =>
        page.meta.name.toLowerCase().includes(searchLower) ||
        page.meta.description?.toLowerCase().includes(searchLower) ||
        page.meta.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 排序
    pages.sort((a, b) => (a.meta.order || 0) - (b.meta.order || 0));

    return pages;
  }

  /**
   * 检查页面是否在指定平台可用
   * @param id - 页面ID
   * @param platform - 平台类型
   * @returns 是否可用
   */
  isAvailableOn(id: string, platform: PlatformType): boolean {
    const page = this.pages.get(id);
    if (!page) {
      return false;
    }
    return page.meta.platforms.includes(platform);
  }

  /**
   * 清空所有注册
   */
  clear(): void {
    this.pages.clear();
  }

  /**
   * 获取页面数量
   * @returns 页面数量
   */
  get size(): number {
    return this.pages.size;
  }
}

/**
 * 获取页面注册中心实例
 */
export function getPageRegistry(): PageRegistry {
  return PageRegistry.getInstance();
}
