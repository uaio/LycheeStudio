/**
 * FNM Manager Hook
 */

import { useState, useCallback, useEffect } from 'react';
import type { PlatformAdapter } from '@ai-tools/core';
import { FNMManager } from '@ai-tools/core';
import type { ToolStatus } from '@ai-tools/core';

export interface UseFNMManagerOptions {
  adapter: PlatformAdapter;
}

export interface UseFNMManagerReturn {
  manager: FNMManager;
  isInstalled: boolean;
  version: string | null;
  toolStatuses: ToolStatus[];
  checking: boolean;
  checkFNM: () => Promise<void>;
  checkTools: (toolNames: string[]) => Promise<void>;
  installFNM: () => Promise<void>;
}

export function useFNMManager(options: UseFNMManagerOptions): UseFNMManagerReturn {
  const { adapter } = options;

  const manager = new FNMManager(adapter);

  const [isInstalled, setIsInstalled] = useState(false);
  const [version, setVersion] = useState<string | null>(null);
  const [toolStatuses, setToolStatuses] = useState<ToolStatus[]>([]);
  const [checking, setChecking] = useState(false);

  const checkFNM = useCallback(async () => {
    setChecking(true);
    try {
      const [installed, ver] = await Promise.all([
        manager.isInstalled(),
        manager.getVersion(),
      ]);
      setIsInstalled(installed);
      setVersion(ver);
    } finally {
      setChecking(false);
    }
  }, [manager]);

  const checkTools = useCallback(
    async (toolNames: string[]) => {
      setChecking(true);
      try {
        const statuses = await manager.checkAITools(toolNames);
        setToolStatuses(statuses);
      } finally {
        setChecking(false);
      }
    },
    [manager]
  );

  const installFNM = useCallback(async () => {
    await manager.installFNM();
    await checkFNM();
  }, [manager, checkFNM]);

  // 初始化时检查 FNM 状态
  useEffect(() => {
    checkFNM();
  }, [checkFNM]);

  return {
    manager,
    isInstalled,
    version,
    toolStatuses,
    checking,
    checkFNM,
    checkTools,
    installFNM,
  };
}
