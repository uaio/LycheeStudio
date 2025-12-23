/**
 * MCP Manager Hook
 */

import { useState, useCallback, useEffect } from 'react';
import type { PlatformAdapter } from '@ai-tools/core';
import { MCPManager } from '@ai-tools/core';
import type { MCPServer } from '@ai-tools/core';

export interface UseMCPManagerOptions {
  adapter: PlatformAdapter;
}

export interface UseMCPManagerReturn {
  manager: MCPManager;
  servers: MCPServer[];
  recommended: Array<{ name: string; server: Omit<MCPServer, 'name'>; description: string }>;
  loading: boolean;
  refresh: () => Promise<void>;
  getServer: (name: string) => Promise<MCPServer | null>;
  addServer: (name: string, server: Omit<MCPServer, 'name'>) => Promise<void>;
  removeServer: (name: string) => Promise<void>;
  serverExists: (name: string) => Promise<boolean>;
}

export function useMCPManager(options: UseMCPManagerOptions): UseMCPManagerReturn {
  const { adapter } = options;

  const manager = new MCPManager(adapter);

  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);

  const recommended = manager.getRecommendedServers();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const serverList = await manager.getServers();
      setServers(serverList);
    } finally {
      setLoading(false);
    }
  }, [manager]);

  const getServer = useCallback(
    async (name: string) => {
      return await manager.getServer(name);
    },
    [manager]
  );

  const addServer = useCallback(
    async (name: string, server: Omit<MCPServer, 'name'>) => {
      await manager.setServer(name, server);
      await refresh();
    },
    [manager, refresh]
  );

  const removeServer = useCallback(
    async (name: string) => {
      await manager.removeServer(name);
      await refresh();
    },
    [manager, refresh]
  );

  const serverExists = useCallback(
    async (name: string) => {
      return await manager.serverExists(name);
    },
    [manager]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    manager,
    servers,
    recommended,
    loading,
    refresh,
    getServer,
    addServer,
    removeServer,
    serverExists,
  };
}
