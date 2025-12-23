/**
 * Claude Config Hook
 */

import { useState, useCallback, useEffect } from 'react';
import type { PlatformAdapter } from '@ai-tools/core';
import { ClaudeConfigManager } from '@ai-tools/core';
import type { AIModel, APIProvider } from '@ai-tools/core';

export interface UseClaudeConfigOptions {
  adapter: PlatformAdapter;
}

export interface UseClaudeConfigReturn {
  manager: ClaudeConfigManager;
  provider: APIProvider | null;
  models: AIModel[];
  loading: boolean;
  refreshProvider: () => Promise<void>;
  setProvider: (provider: APIProvider) => Promise<void>;
  setModel: (modelType: 'haiku' | 'sonnet' | 'opus', model: string) => Promise<void>;
}

export function useClaudeConfig(options: UseClaudeConfigOptions): UseClaudeConfigReturn {
  const { adapter } = options;

  const manager = new ClaudeConfigManager(adapter);

  const [provider, setProviderState] = useState<APIProvider | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProvider = useCallback(async () => {
    setLoading(true);
    try {
      const [prov, availableModels] = await Promise.all([
        manager.getProvider(),
        Promise.resolve(manager.getAvailableModels()),
      ]);
      setProviderState(prov);
      setModels(availableModels);
    } finally {
      setLoading(false);
    }
  }, [manager]);

  const setProvider = useCallback(
    async (prov: APIProvider) => {
      await manager.setProvider(prov);
      await refreshProvider();
    },
    [manager, refreshProvider]
  );

  const setModel = useCallback(
    async (modelType: 'haiku' | 'sonnet' | 'opus', model: string) => {
      await manager.setModel(modelType, model);
    },
    [manager]
  );

  useEffect(() => {
    refreshProvider();
  }, [refreshProvider]);

  return {
    manager,
    provider,
    models,
    loading,
    refreshProvider,
    setProvider,
    setModel,
  };
}
