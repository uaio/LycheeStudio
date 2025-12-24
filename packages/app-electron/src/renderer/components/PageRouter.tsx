/**
 * 页面路由器
 * 根据页面ID渲染对应的内容
 */

import { useMemo } from 'react';
import { Spin, Alert } from 'antd';
import type { PlatformAdapter } from '@ai-tools/core';
import type { ElectronAdapter } from '@ai-tools/adapter-electron';

// 页面组件
import SystemStatusPage from './pages/SystemStatusPage';
import NodeManagerPage from './pages/NodeManagerPage';
import ClaudeModelPage from './pages/ClaudeModelPage';
import ClaudePromptsPage from './pages/ClaudePromptsPage';
import MCPManagerPage from './pages/MCPManagerPage';

interface PageRouterProps {
  pageId: string;
  adapter: PlatformAdapter | null;
}

export default function PageRouter({ pageId, adapter }: PageRouterProps) {
  // 检查适配器是否可用
  if (!adapter) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  // 根据页面ID渲染对应组件
  const PageComponent = useMemo(() => {
    const pageComponents: Record<string, React.ComponentType<{ adapter: PlatformAdapter }>> = {
      system_status: SystemStatusPage,
      node_manager: NodeManagerPage,
      claude_model: ClaudeModelPage,
      claude_prompts: ClaudePromptsPage,
      mcp_manager: MCPManagerPage,
    };

    const Component = pageComponents[pageId];
    if (!Component) {
      return () => (
        <Alert
          message="页面开发中"
          description={`页面 "${pageId}" 正在开发中，敬请期待`}
          type="info"
          showIcon
        />
      );
    }

    return Component;
  }, [pageId]);

  return <PageComponent adapter={adapter} />;
}
