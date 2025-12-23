/**
 * Prompts Manager Hook
 */

import { useState, useCallback, useEffect } from 'react';
import type { PlatformAdapter } from '@ai-tools/core';
import { PromptsManager } from '@ai-tools/core';
import type { PromptTemplate } from '@ai-tools/core';

export interface UsePromptsManagerOptions {
  adapter: PlatformAdapter;
}

export interface UsePromptsManagerReturn {
  manager: PromptsManager;
  claudeMd: string;
  templates: PromptTemplate[];
  userTemplates: PromptTemplate[];
  loading: boolean;
  refresh: () => Promise<void>;
  saveClaudeMd: (content: string) => Promise<void>;
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltin'>) => Promise<void>;
  updateTemplate: (template: PromptTemplate) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  applyTemplate: (template: PromptTemplate) => Promise<void>;
}

export function usePromptsManager(options: UsePromptsManagerOptions): UsePromptsManagerReturn {
  const { adapter } = options;

  const manager = new PromptsManager(adapter);

  const [claudeMd, setClaudeMd] = useState('');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [userTemplates, setUserTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [content, allTemplates, userTempls] = await Promise.all([
        manager.readClaudeMd(),
        manager.getAllTemplates(),
        manager.getUserTemplates(),
      ]);
      setClaudeMd(content);
      setTemplates(allTemplates);
      setUserTemplates(userTempls);
    } finally {
      setLoading(false);
    }
  }, [manager]);

  const saveClaudeMd = useCallback(
    async (content: string) => {
      await manager.writeClaudeMd(content);
      setClaudeMd(content);
    },
    [manager]
  );

  const addTemplate = useCallback(
    async (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltin'>) => {
      await manager.addUserTemplate(template);
      await refresh();
    },
    [manager, refresh]
  );

  const updateTemplate = useCallback(
    async (template: PromptTemplate) => {
      await manager.updateUserTemplate(template);
      await refresh();
    },
    [manager, refresh]
  );

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      await manager.deleteUserTemplate(templateId);
      await refresh();
    },
    [manager, refresh]
  );

  const applyTemplate = useCallback(
    async (template: PromptTemplate) => {
      await manager.applyTemplate(template);
      setClaudeMd(template.content);
    },
    [manager]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    manager,
    claudeMd,
    templates,
    userTemplates,
    loading,
    refresh,
    saveClaudeMd,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
  };
}
