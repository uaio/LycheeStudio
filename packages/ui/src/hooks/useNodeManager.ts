/**
 * Node Manager Hook
 */

import { useState, useCallback, useEffect } from 'react';
import type { PlatformAdapter } from '@ai-tools/core';
import { NodeManager } from '@ai-tools/core';
import type { NodeVersion, InstallationResult } from '@ai-tools/core';

export interface UseNodeManagerOptions {
  adapter: PlatformAdapter;
}

export interface UseNodeManagerReturn {
  manager: NodeManager;
  installedVersions: NodeVersion[];
  currentVersion: string | null;
  defaultVersion: string | null;
  loading: boolean;
  refreshing: boolean;
  refreshVersions: () => Promise<void>;
  installVersion: (version: string, setAsDefault?: boolean) => Promise<InstallationResult>;
  useVersion: (version: string, setAsDefault?: boolean) => Promise<boolean>;
  uninstallVersion: (version: string) => Promise<boolean>;
}

export function useNodeManager(options: UseNodeManagerOptions): UseNodeManagerReturn {
  const { adapter } = options;

  const manager = new NodeManager(adapter);

  const [installedVersions, setInstalledVersions] = useState<NodeVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [defaultVersion, setDefaultVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refreshVersions = useCallback(async () => {
    setRefreshing(true);
    try {
      const [versions, current, defaultVer] = await Promise.all([
        manager.getInstalledVersions(),
        manager.getCurrentVersion(),
        manager.getDefaultVersion(),
      ]);
      setInstalledVersions(versions);
      setCurrentVersion(current);
      setDefaultVersion(defaultVer);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [manager]);

  const installVersion = useCallback(
    async (version: string, setAsDefault = false) => {
      const result = await manager.installVersion(version, { setAsDefault });
      if (result.success) {
        await refreshVersions();
      }
      return result;
    },
    [manager, refreshVersions]
  );

  const useVersion = useCallback(
    async (version: string, setAsDefault = false) => {
      const result = await manager.useVersion(version, setAsDefault);
      if (result) {
        await refreshVersions();
      }
      return result;
    },
    [manager, refreshVersions]
  );

  const uninstallVersion = useCallback(
    async (version: string) => {
      const result = await manager.uninstallVersion(version);
      if (result) {
        await refreshVersions();
      }
      return result;
    },
    [manager, refreshVersions]
  );

  // 初始化时加载版本列表
  useEffect(() => {
    refreshVersions();
  }, [refreshVersions]);

  return {
    manager,
    installedVersions,
    currentVersion,
    defaultVersion,
    loading,
    refreshing,
    refreshVersions,
    installVersion,
    useVersion,
    uninstallVersion,
  };
}
