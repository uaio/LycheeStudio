import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, Card, Row, Col, Typography, theme } from 'antd';
import type { ThemeConfig } from 'antd';
import ElectronTitleBar from './components/ElectronTitleBar';
import {
  Bot,
  Terminal,
  Cloud,
  Database,
  Shield,
  FileText
} from 'lucide-react';
import './App.css';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

// LycheeStudio - AI 工具列表
const aiTools = [
  {
    name: 'Claude CLI',
    description: 'Anthropic Claude 命令行工具',
    icon: <Bot size={24} />,
    category: 'AI Assistant',
    color: '#d97706'
  },
  {
    name: 'OpenAI CLI',
    description: 'OpenAI GPT 命令行工具',
    icon: <Cloud size={24} />,
    category: 'AI Assistant',
    color: '#3b82f6'
  },
  {
    name: 'Gemini CLI',
    description: 'Google Gemini 命令行工具',
    icon: <Terminal size={24} />,
    category: 'AI Assistant',
    color: '#059669'
  },
  {
    name: 'Node.js Manager',
    description: 'Node.js 版本管理工具',
    icon: <Database size={24} />,
    category: 'Development',
    color: '#10b981'
  },
  {
    name: 'NPM Manager',
    description: 'NPM 包管理工具',
    icon: <FileText size={24} />,
    category: 'Development',
    color: '#dc2626'
  },
  {
    name: 'Security Tools',
    description: '安全配置管理工具',
    icon: <Shield size={24} />,
    category: 'Security',
    color: '#7c3aed'
  }
];

type ThemeType = 'light' | 'dark' | 'system';

function App() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 主题切换处理
  const handleThemeChange = (theme: ThemeType) => {
    setCurrentTheme(theme);

    // 应用主题到文档
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.style.setProperty('--theme-bg', '#141414');
      root.style.setProperty('--theme-color', '#ffffff');
      setIsDarkMode(true);
    } else {
      root.style.setProperty('--theme-bg', '#ffffff');
      root.style.setProperty('--theme-color', '#000000');
      setIsDarkMode(false);
    }
  };

  // 初始化主题
  useEffect(() => {
    handleThemeChange(currentTheme);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (currentTheme === 'system') {
        handleThemeChange('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [currentTheme]);

  // 渲染首页
  const renderHome = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <img
            src="/assets/lychee.svg"
            alt="LycheeStudio Logo"
            style={{ width: '48px', height: '48px', marginRight: '16px' }}
          />
          <Title level={2} style={{ margin: 0 }}>
            LycheeStudio
          </Title>
        </div>
        <Paragraph type="secondary" style={{ fontSize: '16px' }}>
          统一管理您的 AI 开发工具和配置
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {aiTools.map((tool, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card
              hoverable
              style={{
                height: '100%',
                transition: 'all 0.3s ease',
                border: isDarkMode ? '1px solid #424242' : undefined
              }}
              styles={{
                body: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '24px'
                }
              }}
              onClick={() => setSelectedTool(tool.name)}
            >
              <div
                style={{
                  color: tool.color,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${tool.color}20`,
                }}
              >
                {tool.icon}
              </div>
              <Title level={5} style={{ marginBottom: '8px', margin: 0 }}>
                {tool.name}
              </Title>
              <Text type="secondary" style={{ fontSize: '14px', marginBottom: '12px' }}>
                {tool.description}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {tool.category}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  
  const themeConfig: ThemeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
    },
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout
        style={{
          minHeight: '100vh',
          background: isDarkMode ? '#141414' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
        }}
      >
        {/* 自定义标题栏 */}
        <Header
          style={{
            padding: 0,
            height: 'auto',
            background: 'transparent',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <ElectronTitleBar
            selectedTool={selectedTool}
            onNavigateSettings={() => {}}
            onThemeChange={handleThemeChange}
            currentTheme={currentTheme}
          />
        </Header>

        {/* 主内容区域 */}
        <Content
          style={{
            marginTop: '32px', // 为标题栏留出空间
            background: isDarkMode ? '#141414' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
          }}
        >
          {renderHome()}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
