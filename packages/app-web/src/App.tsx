/**
 * Web 应用主组件
 */

import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Button, Space, Alert, BackTop, ConfigProvider, theme } from 'antd';
import {
  Hexagon,
  Bot,
  FileText,
  Server,
  Settings,
  Info,
  Github,
  ExternalLink,
  Activity,
  Download,
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
import NodeManagerGuidePage from './pages/guide/NodeManagerGuidePage';
import FNMManagerGuidePage from './pages/guide/FNMManagerGuidePage';
import SystemStatusGuidePage from './pages/guide/SystemStatusGuidePage';
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
          width={260}
          style={{
            background: '#f8fdf8',
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            position: 'sticky',
            top: 64,
            borderRight: '1px solid #e8e8e8',
          }}
        >
          <div style={{
            padding: '20px 16px',
            borderBottom: '1px solid #e8e8e8',
            background: '#f0f9f0',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#52c41a',
              fontWeight: 600,
              fontSize: 16,
            }}>
              <Hexagon size={22} />
              <span>AI Tools</span>
            </div>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentPage]}
            style={{ height: '100%', borderRight: 0, background: 'transparent' }}
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
                path="/node_manager"
                element={<NodeManagerGuidePage adapter={adapter} />}
              />
              <Route
                path="/fnm_manager"
                element={<FNMManagerGuidePage adapter={adapter} />}
              />
              <Route
                path="/system_status"
                element={<SystemStatusGuidePage adapter={adapter} />}
              />
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

      <Footer style={{
        textAlign: 'center',
        background: '#f0f9f0',
        borderTop: '1px solid #d9f7be',
      }}>
        <Space direction="vertical" size="small">
          <div style={{ color: '#52c41a', fontWeight: 500 }}>
            🌿 AI Tools Manager - Web 版本（功能指引）
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
              icon={<Download size={14} />}
              href="https://github.com/your-repo/releases"
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
    node_manager: <Hexagon {...iconProps} />,
    fnm_manager: <Download {...iconProps} />,
    system_status: <Activity {...iconProps} />,
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
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#52c41a', // 绿色主色调
          borderRadius: 8,
          fontSize: 14,
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            siderBg: '#f5f5f5',
          },
          Menu: {
            itemSelectedBg: '#e6f7ff',
            itemSelectedColor: '#52c41a',
          },
        },
      }}
    >
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ConfigProvider>
  );
}

export default App;
