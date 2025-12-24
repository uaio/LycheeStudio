/**
 * 主应用组件
 */

import { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  Hexagon,
  Bot,
  FileText,
  Server,
  Activity,
  Settings,
  Info,
} from 'lucide-react';
import { AppProvider, usePages, PLATFORM_CONFIGS } from '@ai-tools/ui';
import { ElectronAdapter } from '@ai-tools/adapter-electron';
import { getPageRegistry } from '@ai-tools/core';
import { BUILTIN_PAGES } from '@ai-tools/core';
import PageRouter from './components/PageRouter';

const { Header, Sider, Content } = Layout;

function AppContent() {
  const [adapter, setAdapter] = useState<ElectronAdapter | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  // 初始化适配器
  useEffect(() => {
    try {
      const electronAdapter = new ElectronAdapter();
      setAdapter(electronAdapter);

      // 注册所有内置页面
      const registry = getPageRegistry();
      for (const [id, meta] of Object.entries(BUILTIN_PAGES)) {
        registry.register({ meta });
      }
    } catch (error) {
      console.error('初始化适配器失败:', error);
    }
  }, []);

  // 获取可用页面
  const { pages } = usePages({
    platform: 'electron',
    config: PLATFORM_CONFIGS.electron,
  });

  // 菜单项配置
  const menuItems = pages.map(page => {
    const icon = getMenuIcon(page.id);
    return {
      key: page.id,
      label: page.name,
      icon,
    };
  });

  const [currentPage, setCurrentPage] = useState<string>('system_status');

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: collapsed ? 16 : 20 }}>
            {collapsed ? 'AI' : 'AI Tools'}
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={({ key }) => setCurrentPage(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 240 }}>
        <Header style={{ background: '#1e1e1e', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
          <h1 style={{ color: '#fff', margin: 0, fontSize: 18 }}>
            {pages.find(p => p.id === currentPage)?.name || 'AI Tools Manager'}
          </h1>
        </Header>
        <Content style={{ overflow: 'auto', background: '#141414' }}>
          <div style={{ padding: 24 }}>
            <PageRouter pageId={currentPage} adapter={adapter} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

function getMenuIcon(pageId: string): React.ReactNode {
  const iconProps = { size: 18 };

  const iconMap: Record<string, React.ReactNode> = {
    node_manager: <Hexagon {...iconProps} />,
    fnm_manager: <Settings {...iconProps} />,
    claude_model: <Bot {...iconProps} />,
    claude_provider: <Settings {...iconProps} />,
    claude_prompts: <FileText {...iconProps} />,
    mcp_manager: <Server {...iconProps} />,
    system_status: <Activity {...iconProps} />,
    tool_installation: <Settings {...iconProps} />,
    app_settings: <Settings {...iconProps} />,
    about: <Info {...iconProps} />,
  };

  return iconMap[pageId] || <Settings {...iconProps} />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
