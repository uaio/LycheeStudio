import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, Card, Row, Col, Typography, theme, Menu, Button } from 'antd';
import type { ThemeConfig } from 'antd';
import ElectronTitleBar from './components/ElectronTitleBar';
import {
  Bot,
  Terminal,
  Cloud,
  Home,
  HelpCircle,
  ChevronRight,
  Package,
  Code,
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import './App.css';

// 全局类型声明
declare global {
  interface Window {
    electronAPI?: {
      checkToolInstalled: (toolName: string) => Promise<{ installed: boolean; path: string | null }>;
      installTool: (toolName: string) => Promise<{ success: boolean; message?: string; error?: string }>;
      getToolVersion: (toolName: string) => Promise<{ version: string | null; error: string | null }>;
      getLatestNodeVersion: () => Promise<{ success: boolean; version?: string; error?: string }>;
      showMessageBox: (options: any) => Promise<any>;
    };
  }
}

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

// LycheeStudio - 系统状态卡片
const initialStatusCards = [
  {
    name: 'Node.js',
    version: '检测中...',
    status: 'warning' as 'active' | 'warning' | 'error',
    description: 'JavaScript 运行环境',
    icon: <Code size={18} />,
    color: '#68a063',
    detail: 'JavaScript 运行环境',
    installable: true,
    installCommand: 'node'
  },
  {
    name: 'FNM',
    version: '检测中...',
    status: 'warning' as 'active' | 'warning' | 'error',
    description: 'Fast Node Manager',
    icon: <Package size={18} />,
    color: '#f59e0b',
    detail: 'Fast Node Manager',
    installable: true,
    installCommand: 'fnm'
  },
  {
    name: 'NPM 源',
    version: '淘宝镜像',
    status: 'active' as 'active' | 'warning' | 'error',
    description: '包管理器源配置',
    icon: <Package size={18} />,
    color: '#cb3837',
    detail: 'https://registry.npmmirror.com'
  },
  {
    name: 'Claude API',
    version: 'Claude-3.5-Sonnet',
    status: 'active' as 'active' | 'warning' | 'error',
    description: 'Anthropic AI 助手',
    icon: <Bot size={18} />,
    color: '#d97706',
    detail: 'API 连接正常'
  },
  {
    name: 'OpenAI API',
    version: 'GPT-4o',
    status: 'warning' as 'active' | 'warning' | 'error',
    description: 'OpenAI GPT 模型',
    icon: <Cloud size={18} />,
    color: '#3b82f6',
    detail: '需要更新密钥'
  },
  {
    name: 'Gemini API',
    version: 'Gemini-1.5-Pro',
    status: 'active' as 'active' | 'warning' | 'error',
    description: 'Google AI 模型',
    icon: <Zap size={18} />,
    color: '#059669',
    detail: '服务可用'
  },
  {
    name: '开发环境',
    version: '就绪',
    status: 'active' as 'active' | 'warning' | 'error',
    description: '整体开发状态',
    icon: <Terminal size={18} />,
    color: '#10b981',
    detail: '所有工具已配置'
  }
];

type ThemeType = 'light' | 'dark' | 'system';

function App() {
  const [currentView, setCurrentView] = useState<'home' | string>('home');
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    // 从 localStorage 读取保存的主题设置
    const savedTheme = localStorage.getItem('app-theme') as ThemeType;
    return savedTheme || 'system';
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [statusCards, setStatusCards] = useState(initialStatusCards);
  const [installingTool, setInstallingTool] = useState<string | null>(null);

  // 检查工具安装状态
  const checkToolStatus = async (toolName: string) => {
    if (!window.electronAPI) {
      console.error('electronAPI 不存在');
      return;
    }

    try {
      // 检查是否已安装
      const checkResult = await window.electronAPI.checkToolInstalled(toolName);

      // 获取版本信息
      let version = '未知版本';
      let status: 'active' | 'warning' | 'error' = 'warning';
      let detail = '';

      if (checkResult.installed) {
        const versionResult = await window.electronAPI.getToolVersion(toolName);

        if (versionResult.version) {
          version = versionResult.version;
          status = 'active';
          // 根据工具类型设置不同的detail信息
          if (toolName === 'node') {
            detail = 'JavaScript 运行环境';
          } else if (toolName === 'fnm') {
            detail = 'Fast Node Manager';
          } else {
            detail = '运行正常';
          }
        } else {
          version = '已安装';
          status = 'active';
          // 根据工具类型设置不同的detail信息
          if (toolName === 'node') {
            detail = 'JavaScript 运行环境';
          } else if (toolName === 'fnm') {
            detail = 'Fast Node Manager';
          } else {
            detail = '运行正常';
          }
        }
      } else {
        version = '未安装';
        status = 'error';
        detail = `点击安装 ${toolName}`;
      }

      // 更新状态卡片
      setStatusCards(prevCards => {
        const updatedCards = prevCards.map(card => {
          // 特殊处理 Node.js 和 FNM 的匹配
          const shouldUpdate =
            (toolName === 'node' && card.name === 'Node.js') ||
            (toolName === 'fnm' && card.name === 'FNM') ||
            (card.name.toUpperCase() === toolName.toUpperCase());

          if (shouldUpdate) {
            return { ...card, version, status, detail };
          }
          return card;
        });
        return updatedCards;
      });
    } catch (error) {
      console.error(`检查 ${toolName} 状态失败:`, error);
      setStatusCards(prevCards =>
        prevCards.map(card => {
          // 特殊处理 Node.js 和 FNM 的匹配
          const shouldUpdate =
            (toolName === 'node' && card.name === 'Node.js') ||
            (toolName === 'fnm' && card.name === 'FNM') ||
            (card.name.toUpperCase() === toolName.toUpperCase());

          if (shouldUpdate) {
            return {
              ...card,
              version: '检测失败',
              status: 'error',
              detail: '检测工具状态时出错'
            };
          }
          return card;
        })
      );
    }
  };

  // 安装工具
  const installTool = async (toolName: string) => {
    if (!window.electronAPI || installingTool) return;

    setInstallingTool(toolName);

    try {
      const result = await window.electronAPI.installTool(toolName);

      if (result.success) {
        // 显示成功消息
        await window.electronAPI.showMessageBox({
          type: 'info',
          title: '安装成功',
          message: result.message,
          buttons: ['确定']
        });

        // 重新检测工具状态
        setTimeout(() => {
          checkToolStatus(toolName);
        }, 2000);
      } else {
        // 显示错误消息
        await window.electronAPI.showMessageBox({
          type: 'error',
          title: '安装失败',
          message: result.error,
          buttons: ['确定']
        });
      }
    } catch (error) {
      console.error('安装工具失败:', error);
      await window.electronAPI.showMessageBox({
        type: 'error',
        title: '安装失败',
        message: `安装 ${toolName} 时发生错误`,
        buttons: ['确定']
      });
    } finally {
      setInstallingTool(null);
    }
  };

  // 初始化时检测工具状态
  useEffect(() => {
    // 延迟执行以确保 electron API 完全初始化
    const timer = setTimeout(() => {
      if (window.electronAPI) {
        // 检测 Node.js
        checkToolStatus('node');
        // 检测 fnm
        checkToolStatus('fnm');
      } else {
        console.error('electronAPI 未找到');
        // 如果 electronAPI 不存在，设置为错误状态
        setStatusCards(prevCards =>
          prevCards.map(card => {
            if (card.name === 'Node.js' || card.name === 'FNM') {
              return {
                ...card,
                version: 'API不可用',
                status: 'error' as 'active' | 'warning' | 'error',
                detail: 'Electron API 初始化失败'
              };
            }
            return card;
          })
        );
      }
    }, 1000); // 延迟1秒执行

    return () => clearTimeout(timer);
  }, []);

  // 处理卡片点击事件
  const handleCardClick = (card: any) => {
    if (card.installable && card.status === 'error') {
      installTool(card.installCommand);
    } else if (card.name === 'Node.js' || card.name === 'NPM 源') {
      setCurrentView('nodejs');
    } else if (card.name.includes('API')) {
      setCurrentView('ai-tools');
    }
  };

  // 主题切换处理
  const handleThemeChange = (theme: ThemeType) => {
    setCurrentTheme(theme);

    // 保存主题设置到 localStorage
    localStorage.setItem('app-theme', theme);

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

  // 渲染工具详情页面
  const renderToolDetail = () => {
    // 处理不同的视图类型
    if (currentView === 'nodejs' || currentView === 'ai-tools' ||
        currentView === 'dev-recommend' || currentView === 'help') {
      // 显示占位页面
      const viewTitles = {
        'nodejs': 'Node.js 管理',
        'ai-tools': 'AI 工具配置',
        'dev-recommend': '开发推荐',
        'help': '帮助中心'
      };

      const viewDescriptions = {
        'nodejs': 'Node.js 版本切换、NPM 源管理、包管理工具配置',
        'ai-tools': 'Claude Code、OpenAI CLI、Gemini CLI 等 AI 工具配置',
        'dev-recommend': 'VS Code 扩展、开发工具、学习资源推荐',
        'help': '文档、教程、关于信息'
      };

      return (
        <>
          {renderSidebar()}
          <div style={{
            padding: '32px',
            marginLeft: '240px',
            minHeight: 'calc(100vh - 38px)',
            background: isDarkMode ? '#141414' : '#ffffff'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '32px',
              cursor: 'pointer'
            }} onClick={() => setCurrentView('home')}>
              <ChevronRight size={16} style={{
                transform: 'rotate(180deg)',
                marginRight: '8px',
                color: '#1890ff'
              }} />
              <span style={{ fontSize: '14px', color: '#1890ff' }}>返回首页</span>
            </div>

            <div style={{ maxWidth: '800px' }}>
              <Title level={2} style={{ margin: 0, marginBottom: '8px', color: isDarkMode ? '#ffffff' : '#000000' }}>
                {viewTitles[currentView]}
              </Title>
              <p style={{ color: isDarkMode ? '#a0a0a0' : '#666', marginBottom: '32px' }}>
                {viewDescriptions[currentView]}
              </p>

              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card
                    style={{
                      background: isDarkMode ? '#1f1f1f' : '#ffffff',
                      border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
                      height: '100%'
                    }}
                  >
                    <Title level={4} style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                      功能概述
                    </Title>
                    <div style={{
                      color: isDarkMode ? '#e0e0e0' : '#333',
                      lineHeight: '1.8'
                    }}>
                      <p>该页面正在开发中，即将为您提供完整的配置管理功能。</p>
                      <p>敬请期待更多功能的到来！</p>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card
                    style={{
                      background: isDarkMode ? '#1f1f1f' : '#ffffff',
                      border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
                      height: '100%'
                    }}
                  >
                    <Title level={4} style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                      快速导航
                    </Title>
                    <div style={{
                      color: isDarkMode ? '#e0e0e0' : '#333',
                      lineHeight: '1.8'
                    }}>
                      <p>• 返回首页查看系统状态</p>
                      <p>• 通过左侧菜单访问其他功能</p>
                      <p>• 使用右上角按钮切换主题</p>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
        </div>
      </>
    );
  }

  // 默认返回空内容而不是 null，避免整个组件消失
  return (
    <div style={{
      padding: '32px',
      marginLeft: '240px',
      minHeight: 'calc(100vh - 38px)',
      background: isDarkMode ? '#141414' : '#ffffff'
    }}>
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <p style={{ color: isDarkMode ? '#a0a0a0' : '#666' }}>页面未找到</p>
        <Button type="primary" onClick={() => setCurrentView('home')}>
          返回首页
        </Button>
      </div>
    </div>
  );
};

  // 渲染侧边栏菜单
  const renderSidebar = () => (
    <Sider
      width={240}
      style={{
        background: isDarkMode ? '#1f1f1f' : '#f8f9fa',
        borderRight: `1px solid ${isDarkMode ? '#424242' : '#e8e8e8'}`,
        height: 'calc(100vh - 38px)',
        position: 'fixed',
        left: 0,
        top: 38,
      }}
    >
      <div
        className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
        style={{
          padding: '16px',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          // 确保滚动条不占用额外空间
          marginRight: 0,
          paddingRight: 0,
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[currentView === 'home' ? 'home' : currentView]}
          style={{
            border: 'none',
            background: 'transparent',
            // 确保菜单不被挤压
            width: '100%',
          }}
          items={[
            {
              key: 'home',
              icon: <Home size={16} />,
              label: '首页',
              onClick: () => setCurrentView('home'),
            },
            {
              key: 'nodejs',
              icon: <Code size={16} />,
              label: 'Node.js',
              children: [
                { key: 'node-version', label: '版本切换' },
                { key: 'npm-source', label: 'NPM 源管理' },
                { key: 'package-managers', label: '包管理工具' },
              ],
            },
            {
              key: 'ai-tools',
              icon: <Bot size={16} />,
              label: 'AI 工具',
              children: [
                { key: 'claude-code', label: 'Claude Code' },
                { key: 'openai-cli', label: 'OpenAI CLI' },
                { key: 'gemini-cli', label: 'Gemini CLI' },
                { key: 'github-copilot', label: 'GitHub Copilot' },
              ],
            },
            {
              key: 'dev-recommend',
              icon: <Terminal size={16} />,
              label: '开发推荐',
              children: [
                { key: 'vscode-extensions', label: 'VS Code 扩展' },
                { key: 'dev-tools', label: '开发工具' },
                { key: 'learning-resources', label: '学习资源' },
              ],
            },
            {
              key: 'help',
              icon: <HelpCircle size={16} />,
              label: '帮助',
              children: [
                { key: 'documentation', label: '文档' },
                { key: 'tutorials', label: '教程' },
                { key: 'about', label: '关于' },
              ],
            },
          ]}
        />
      </div>
    </Sider>
  );

  // 渲染首页
  const renderHome = () => (
    <div style={{
      padding: '32px',
      marginLeft: '240px', // 为侧边栏留出空间
      minHeight: 'calc(100vh - 44px)'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={3} style={{ marginBottom: '8px', color: isDarkMode ? '#ffffff' : '#000000' }}>
          AI 工具管理
        </Title>
        <Paragraph type="secondary" style={{ fontSize: '14px', marginBottom: 0 }}>
          选择并管理您的 AI 开发工具，提升开发效率
        </Paragraph>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Row gutter={[20, 20]}>
          {statusCards.map((card, index) => (
            <Col xs={24} sm={12} md={8} lg={8} xl={8} key={index}>
              <Card
                hoverable
                style={{
                  height: '160px',
                  transition: 'all 0.3s ease',
                  border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: isDarkMode ? '#2a2a2a' : '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
                styles={{
                  body: {
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }
                }}
                onClick={() => handleCardClick(card)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div
                      style={{
                        color: card.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: `${card.color}15`,
                        flexShrink: 0,
                      }}
                    >
                      {React.cloneElement(card.icon, { size: 20 })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {card.status === 'active' && <CheckCircle size={16} color="#52c41a" />}
                      {card.status === 'warning' && <AlertCircle size={16} color="#faad14" />}
                      {card.status === 'error' && (
                        card.installable ? (
                          <Button
                            size="small"
                            type="primary"
                            loading={installingTool === card.installCommand}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(card);
                            }}
                            style={{
                              fontSize: '10px',
                              height: '24px',
                              padding: '0 8px',
                              borderRadius: '4px'
                            }}
                          >
                            {installingTool === card.installCommand ? '安装中...' : '安装'}
                          </Button>
                        ) : (
                          <XCircle size={16} color="#f5222d" />
                        )
                      )}
                      {!card.installable && card.status !== 'error' && (
                        <ChevronRight size={14} color={isDarkMode ? '#888' : '#ccc'} style={{ marginLeft: '8px' }} />
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}>
                      {card.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: card.color,
                      fontWeight: 500
                    }}>
                      {card.version}
                    </div>
                    {card.detail && (
                      <div style={{
                        fontSize: '10px',
                        color: isDarkMode ? '#a0a0a0' : '#666',
                        marginTop: '4px'
                      }}>
                        {card.detail}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
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
            selectedTool={null} // 不在标题栏显示选中的工具
            onNavigateSettings={() => {}}
            onThemeChange={handleThemeChange}
            currentTheme={currentTheme}
          />
        </Header>

        {/* 主内容区域 */}
        <Content
          style={{
            marginTop: '38px', // 为标题栏留出空间
            background: isDarkMode ? '#141414' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
          }}
        >
          {currentView === 'home' ? (
            <>
              {renderSidebar()}
              {renderHome()}
            </>
          ) : renderToolDetail()}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
