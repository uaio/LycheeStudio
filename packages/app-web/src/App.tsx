/**
 * Web 应用主组件
 */

import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Button, Space, Alert, BackTop } from 'antd';
import {
  Hexagon,
  Bot,
  FileText,
  Server,
  Settings,
  Info,
  Github,
  ExternalLink,
} from 'lucide-react';
import { AppProvider, usePages, PLATFORM_CONFIGS } from '@ai-tools/ui';
import { WebAdapter } from '@ai-tools/adapter-web';
import { getPageRegistry } from '@ai-tools/core';
import { BUILTIN_PAGES } from '@ai-tools/core';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ClaudeModelPage from './pages/ClaudeModelPage';
import ClaudePromptsPage from './pages/ClaudePromptsPage';
import MCPManagerPage from './pages/MCPManagerPage';
import NotFoundPage from './pages/NotFoundPage';

const { Content, Footer, Sider } = Layout;

function AppContent() {
  const [adapter, setAdapter] = useState<WebAdapter | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  // 初始化适配器
  useEffect(() => {
    const webAdapter = new WebAdapter();
    setAdapter(webAdapter);

    // 注册所有内置页面
    const registry = getPageRegistry();
    for (const [id, meta] of Object.entries(BUILTIN_PAGES)) {
      registry.register({ meta });
    }
  }, []);

  // 获取 Web 平台可用的页面
  const { pages } = usePages({
    platform: 'web',
    config: PLATFORM_CONFIGS.web,
  });

  // 菜单项配置
  const menuItems = [
    { key: 'home', label: '首页', icon: <Settings size={18} /> },
    ...pages.map(page => ({
      key: page.id,
      label: page.name,
      icon: getMenuIcon(page.id),
    })),
  ];

  const contentStyle: React.CSSProperties = {
    minHeight: 'calc(100vh - 128px)',
    padding: '24px',
    background: '#fff',
    borderRadius: '8px',
    margin: '16px',
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={240}
          style={{
            background: '#fff',
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            position: 'sticky',
            top: 64,
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[currentPage]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => setCurrentPage(key)}
          />
        </Sider>

        <Layout style={{ padding: '0 24px 24px' }}>
          <Content style={contentStyle}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomePage adapter={adapter} />} />
              <Route
                path="/claude_model"
                element={<ClaudeModelPage adapter={adapter} />}
              />
              <Route
                path="/claude_prompts"
                element={<ClaudePromptsPage adapter={adapter} />}
              />
              <Route
                path="/mcp_manager"
                element={<MCPManagerPage adapter={adapter} />}
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>

      <Footer style={{ textAlign: 'center' }}>
        <Space direction="vertical" size="small">
          <div>
            AI Tools Manager Web 版本 - 功能阉割版
          </div>
          <Space>
            <Button
              type="link"
              size="small"
              icon={<Github size={14} />}
              href="https://github.com/your-repo"
              target="_blank"
            >
              GitHub
            </Button>
            <Button
              type="link"
              size="small"
              icon={<ExternalLink size={14} />}
              href="https://github.com/your-repo#desktop-app"
              target="_blank"
            >
              下载桌面应用
            </Button>
          </Space>
        </Space>
      </Footer>

      <BackTop />
    </Layout>
  );
}

function getMenuIcon(pageId: string): React.ReactNode {
  const iconProps = { size: 18 };

  const iconMap: Record<string, React.ReactNode> = {
    claude_model: <Bot {...iconProps} />,
    claude_provider: <Settings {...iconProps} />,
    claude_prompts: <FileText {...iconProps} />,
    mcp_manager: <Server {...iconProps} />,
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
