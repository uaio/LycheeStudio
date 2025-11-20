import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, Card, Row, Col, Typography, theme, Menu, Button, Tooltip, Input, Progress, Space, Tag, Modal } from 'antd';
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
  XCircle,
  RefreshCw,
  Gift,
  ExternalLink
} from 'lucide-react';
import './App.css';

const { Text } = Typography;

// 全局类型声明
declare global {
  interface Window {
    electronAPI?: {
      checkToolInstalled: (toolName: string) => Promise<{ installed: boolean; path: string | null }>;
      installTool: (toolName: string) => Promise<{ success: boolean; message?: string; error?: string }>;
      getToolVersion: (toolName: string) => Promise<{ version: string | null; error: string | null }>;
      getLatestNodeVersion: () => Promise<{ success: boolean; version?: string; error?: string }>;
      getNpmRegistry: () => Promise<{ success: boolean; name?: string; registry?: string; error?: string }>;
      showMessageBox: (options: any) => Promise<any>;
    };
  }
}

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

// 活动数据
const platformActivities = [
  {
    id: 1,
    title: 'Claude Code Pro 新用户优惠',
    platform: 'Anthropic',
    description: '新用户注册 Claude Code Pro 即可获得 50% 折扣，首月仅需 $9.9',
    discount: '50%',
    originalPrice: '$19.9',
    currentPrice: '$9.9',
    validUntil: '2024-12-31',
    tags: ['新用户', '限时优惠'],
    link: 'https://claude.ai/code',
    image: '🤖',
    status: 'active' as 'active' | 'expired' | 'upcoming'
  },
  {
    id: 2,
    title: 'OpenAI GPT-4 Turbo 限时特价',
    platform: 'OpenAI',
    description: 'GPT-4 Turbo API 使用费率降低 30%，适合开发者批量采购',
    discount: '30%',
    originalPrice: '$0.03/1K tokens',
    currentPrice: '$0.021/1K tokens',
    validUntil: '2024-11-30',
    tags: ['API', '开发者', '限时'],
    link: 'https://openai.com/pricing',
    image: '🚀',
    status: 'active' as 'active' | 'expired' | 'upcoming'
  },
  {
    id: 3,
    title: 'Gemini Advanced 年度订阅优惠',
    platform: 'Google',
    description: '订阅 Gemini Advanced 年度套餐，可享 2 个月免费使用',
    discount: '2个月免费',
    originalPrice: '$19.99/月',
    currentPrice: '$166.65/年',
    validUntil: '2024-12-15',
    tags: ['年度订阅', '免费试用'],
    link: 'https://gemini.google.com',
    image: '💎',
    status: 'active' as 'active' | 'expired' | 'upcoming'
  },
  {
    id: 4,
    title: 'GitHub Copilot 学生计划',
    platform: 'GitHub',
    description: '学生和教师可免费使用 GitHub Copilot，验证身份即可获得',
    discount: '免费',
    originalPrice: '$10/月',
    currentPrice: '$0',
    validUntil: '长期有效',
    tags: ['教育', '学生', '教师'],
    link: 'https://github.com/education/students',
    image: '👨‍💻',
    status: 'active' as 'active' | 'expired' | 'upcoming'
  }
];

const myInvitations = [
  {
    id: 1,
    title: 'Claude Code 邀请计划',
    platform: 'Anthropic',
    description: '邀请朋友使用 Claude Code，双方各得 $10 积分奖励',
    reward: '$10 积分',
    inviteLink: 'https://claude.ai/invite?ref=yourcode',
    invitedCount: 3,
    maxInvites: 10,
    earnedRewards: '$30',
    potentialRewards: '$70',
    tags: ['双奖励', '积分'],
    image: '🎁',
    clickAction: 'link' as 'image' | 'link' // 点击行为：展示图片或跳转链接
  },
  {
    id: 2,
    title: 'OpenAI API 推荐计划',
    platform: 'OpenAI',
    description: '推荐新用户使用 OpenAI API，可获得消费额 5% 返现',
    reward: '5% 返现',
    inviteLink: 'https://openai.com/join?ref=yourref',
    invitedCount: 5,
    maxInvites: 20,
    earnedRewards: '$45.50',
    potentialRewards: '$200',
    tags: ['返现', 'API'],
    image: '💰',
    clickAction: 'link' as 'image' | 'link'
  },
  {
    id: 3,
    title: '智谱 GLM Coding 邀请',
    platform: '智谱 AI',
    description: '🚀 速来拼好模，智谱 GLM Coding 超值订阅，邀你一起薅羊毛！Claude Code、Cline 等 10+ 大编程工具无缝支持',
    reward: '限时惊喜价',
    inviteLink: 'https://www.bigmodel.cn/claude-code?ic=NH7UUC7QWY',
    invitedCount: 8,
    maxInvites: 50,
    earnedRewards: '¥240',
    potentialRewards: '¥1260',
    tags: ['拼团', '限时优惠', '多工具支持'],
    image: '🤖',
    clickAction: 'image' as 'image' | 'link', // 点击展示图片
    imageUrl: 'https://maas-log-prod.cn-wlcb.ufileos.com/anthropic/d32c9dd1-b2d2-40dd-87d2-345fd2910517/9818fbd4835ab479a5fe8ea4d5160974.png?UCloudPublicKey=TOKEN_e15ba47a-d098-4fbd-9afc-a0dcf0e4e621&Expires=1763618033&Signature=v+kGcnKgk820LHwoTanGKDy1FD8='
  }
];

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
    version: '检测中',
    status: 'active' as 'active' | 'warning' | 'error',
    description: '包管理器源配置',
    icon: <Package size={18} />,
    color: '#cb3837',
    detail: '检测中...'
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
  const [currentView, setCurrentView] = useState<'home' | string>(() => {
    // 从URL参数读取当前页面状态
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    return view || 'home';
  });

  // 子页面到父菜单的映射关系
  const subPageToParentMap: Record<string, string> = {
    'node-version': 'nodejs',
    'npm-source': 'nodejs',
    'package-managers': 'nodejs',
    'claude-code': 'ai-tools',
    'openai-cli': 'ai-tools',
    'gemini-cli': 'ai-tools',
    'github-copilot': 'ai-tools',
    'platform-promotions': 'activities',
    'my-invitations': 'activities',
    'vscode-extensions': 'dev-recommend',
    'dev-tools': 'dev-recommend',
    'learning-resources': 'dev-recommend',
    'documentation': 'help',
    'tutorials': 'help',
    'about': 'help',
  };

  // 计算当前应该展开的父菜单
  const getOpenKeys = (view: string): string[] => {
    const parentKey = subPageToParentMap[view];
    return parentKey ? [parentKey] : [];
  };

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    return getOpenKeys(currentView);
  });
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    // 从 localStorage 读取保存的主题设置
    const savedTheme = localStorage.getItem('app-theme') as ThemeType;
    return savedTheme || 'system';
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [statusCards, setStatusCards] = useState(initialStatusCards);
  const [installingTool, setInstallingTool] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // 安全打开链接的函数
  const openLinkSafely = (url: string) => {
    try {
      if (window.electronAPI && window.electronAPI.openExternal) {
        // 在 Electron 环境中，使用默认浏览器打开链接
        window.electronAPI.openExternal(url);
      } else {
        // 在普通浏览器环境中打开链接
        window.open(url, '_blank');
      }
    } catch (error) {
      console.warn('Failed to open link:', error);
      // 最后的降级方案
      window.open(url, '_blank');
    }
  };

  // 监听 currentView 变化并同步到 URL 和菜单展开状态
  useEffect(() => {
    const url = new URL(window.location);
    if (currentView === 'home') {
      // 在首页时移除 view 参数
      url.searchParams.delete('view');
    } else {
      // 在其他页面时设置 view 参数
      url.searchParams.set('view', currentView);
    }

    // 只有当 URL 发生变化时才更新
    if (window.location.search !== url.search) {
      window.history.replaceState({}, '', url);
    }

    // 更新菜单展开状态
    const newOpenKeys = getOpenKeys(currentView);
    setOpenKeys(newOpenKeys);
  }, [currentView]);

  // 组件加载时自动检测NPM源
  useEffect(() => {
    // 延迟一点时间让electronAPI初始化完成
    const timer = setTimeout(() => {
      checkNpmRegistry();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  // 刷新Node.js状态
  const refreshNodeStatus = async () => {
    console.log('刷新Node.js状态被调用');
    await checkToolStatus('node');
  };

  // 刷新FNM状态
  const refreshFnmStatus = async () => {
    console.log('刷新FNM状态被调用');
    await checkToolStatus('fnm');
  };

  // 检查NPM源
  const checkNpmRegistry = async () => {
    console.log('刷新NPM源状态被调用');
    if (!window.electronAPI) {
      console.error('electronAPI 不存在');
      return;
    }

    try {
      const result = await window.electronAPI.getNpmRegistry();

      if (result.success) {
        // 更新NPM源卡片
        setStatusCards(prevCards => {
          const updatedCards = prevCards.map(card => {
            if (card.name === 'NPM 源') {
              return {
                ...card,
                version: result.name,
                status: 'active' as 'active' | 'warning' | 'error',
                detail: result.registry
              };
            }
            return card;
          });
          return updatedCards;
        });
      } else {
        console.error('获取NPM源失败:', result.error);
        setStatusCards(prevCards => {
          const updatedCards = prevCards.map(card => {
            if (card.name === 'NPM 源') {
              return {
                ...card,
                version: '获取失败',
                status: 'error' as 'active' | 'warning' | 'error',
                detail: '无法获取NPM源信息'
              };
            }
            return card;
          });
          return updatedCards;
        });
      }
    } catch (error) {
      console.error('检查NPM源状态失败:', error);
      setStatusCards(prevCards => {
        const updatedCards = prevCards.map(card => {
          if (card.name === 'NPM 源') {
            return {
              ...card,
              version: '检测失败',
              status: 'error' as 'active' | 'warning' | 'error',
              detail: '检测NPM源时出错'
            };
          }
          return card;
        });
        return updatedCards;
      });
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
        // 检测 NPM 源
        checkNpmRegistry();
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
        <div style={{
          marginLeft: '240px',
          height: 'calc(100vh - 38px)',
          overflow: 'hidden',
        }}>
          <div
            className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
            style={{
              padding: '32px',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              marginRight: 0,
              paddingRight: '8px',
            }}
          >
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
        </div>
      );
    }

    // 如果不是指定的视图，返回null或默认内容
    return null;
  };

  // 渲染平台活动页面
  const renderPlatformPromotions = () => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return '#52c41a';
        case 'expired': return '#ff4d4f';
        case 'upcoming': return '#faad14';
        default: return '#d9d9d9';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'active': return '进行中';
        case 'expired': return '已结束';
        case 'upcoming': return '即将开始';
        default: return '未知';
      }
    };

    return (
      <div style={{
        marginLeft: '240px',
        height: 'calc(100vh - 38px)',
        overflow: 'hidden',
      }}>
        <div
          className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
          style={{
            padding: '32px',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            marginRight: 0,
            paddingRight: '8px',
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <Title level={2} style={{ color: isDarkMode ? '#ffffff' : '#000000', margin: 0 }}>
              平台活动
          </Title>
          <Text style={{ color: isDarkMode ? '#a0a0a0' : '#666' }}>
            发现各大 AI 平台的最新优惠活动和促销信息
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {platformActivities.map((activity) => (
            <Col xs={24} md={12} lg={8} key={activity.id}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  background: isDarkMode ? '#1f1f1f' : '#ffffff',
                  border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
                }}
                styles={{ body: { padding: '20px' } }}
                actions={[
                  <Button
                    type="primary"
                    icon={<ExternalLink size={16} />}
                    onClick={() => {
                      openLinkSafely(activity.link);
                    }}
                    disabled={activity.status === 'expired'}
                  >
                    {activity.status === 'expired' ? '活动已结束' : '立即参与'}
                  </Button>
                ]}
              >
                <div
                  onClick={() => {
                    if (activity.imageUrl) {
                      setCurrentImageUrl(activity.imageUrl);
                      setImageModalVisible(true);
                    }
                  }}
                  style={{ cursor: activity.imageUrl ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '32px',
                      marginRight: '12px',
                      filter: isDarkMode ? 'brightness(1.2)' : 'none'
                    }}>
                      {activity.imageUrl ? '🖼️' : activity.image}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <Title level={4} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
                          {activity.title}
                        </Title>
                        <Tag color={getStatusColor(activity.status)} style={{ margin: 0 }}>
                          {getStatusText(activity.status)}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {activity.platform}
                      </Text>
                    </div>
                  </div>

                  <Paragraph
                    style={{
                      marginBottom: '0',
                      color: isDarkMode ? '#e0e0e0' : '#333',
                      lineHeight: '1.6'
                    }}
                  >
                    {activity.description}
                  </Paragraph>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        </div>
      </div>
    );
  };

  // 渲染我的邀请页面
  const renderMyInvitations = () => {
    return (
      <div style={{
        marginLeft: '240px',
        height: 'calc(100vh - 38px)',
        overflow: 'hidden',
      }}>
        <div
          className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
          style={{
            padding: '32px',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            marginRight: 0,
            paddingRight: '8px',
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <Title level={2} style={{ color: isDarkMode ? '#ffffff' : '#000000', margin: 0 }}>
              我的邀请
          </Title>
          <Text style={{ color: isDarkMode ? '#a0a0a0' : '#666' }}>
            管理您的邀请链接，跟踪邀请进度和奖励收益
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {myInvitations.map((invitation) => (
            <Col xs={24} md={12} key={invitation.id}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  background: isDarkMode ? '#1f1f1f' : '#ffffff',
                  border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
                }}
                styles={{ body: { padding: '20px' } }}
                actions={[
                  <Button
                    type="primary"
                    icon={<ExternalLink size={16} />}
                    onClick={() => {
                      openLinkSafely(invitation.inviteLink);
                    }}
                  >
                    分享邀请链接
                  </Button>
                ]}
              >
                <div
                  onClick={() => {
                    if (invitation.imageUrl) {
                      setCurrentImageUrl(invitation.imageUrl);
                      setImageModalVisible(true);
                    }
                  }}
                  style={{ cursor: invitation.imageUrl ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '32px',
                      marginRight: '12px',
                      filter: isDarkMode ? 'brightness(1.2)' : 'none'
                    }}>
                      {invitation.imageUrl ? '🖼️' : invitation.image}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Title level={4} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
                        {invitation.title}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {invitation.platform}
                      </Text>
                    </div>
                  </div>

                  <Paragraph
                    style={{
                      marginBottom: '0',
                      color: isDarkMode ? '#e0e0e0' : '#333',
                      lineHeight: '1.6'
                    }}
                  >
                    {invitation.description}
                  </Paragraph>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
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
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
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
              key: 'activities',
              icon: <Gift size={16} />,
              label: '活动',
              children: [
                {
                  key: 'platform-promotions',
                  label: '平台活动',
                  onClick: () => setCurrentView('platform-promotions')
                },
                {
                  key: 'my-invitations',
                  label: '我的邀请',
                  onClick: () => setCurrentView('my-invitations')
                },
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
      marginLeft: '240px', // 为侧边栏留出空间
      height: 'calc(100vh - 38px)', // 固定高度，减去标题栏高度
      overflow: 'hidden', // 隐藏溢出
    }}>
      <div
        className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
        style={{
          padding: '32px',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          // 确保滚动条不占用额外空间
          marginRight: 0,
          paddingRight: '8px', // 为滚动条留出空间
        }}
      >
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
                      color: isDarkMode ? '#ffffff' : '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {card.name}
                      {/* 刷新按钮 - 仅在Node.js、FNM、NPM源卡片中显示 */}
                      {(card.name === 'Node.js' || card.name === 'FNM' || card.name === 'NPM 源') && (
                        <Button
                          type="text"
                          size="small"
                          icon={<RefreshCw size={14} />}
                          onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡到卡片点击事件
                            if (card.name === 'Node.js') {
                              refreshNodeStatus();
                            } else if (card.name === 'FNM') {
                              refreshFnmStatus();
                            } else if (card.name === 'NPM 源') {
                              checkNpmRegistry();
                            }
                          }}
                          style={{
                            padding: '2px',
                            height: '20px',
                            minWidth: '20px',
                            lineHeight: '20px',
                            color: card.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          title={`刷新${card.name}状态`}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        />
                      )}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: card.color,
                      fontWeight: 500
                    }}>
                      {card.name === 'NPM 源' ? (
                        <Tooltip title={card.detail} placement="top">
                          <span style={{ cursor: 'help' }}>
                            {card.version}
                          </span>
                        </Tooltip>
                      ) : (
                        card.version
                      )}
                    </div>
                    {card.detail && card.name !== 'NPM 源' && (
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
          ) : currentView === 'platform-promotions' ? (
            <>
              {renderSidebar()}
              {renderPlatformPromotions()}
            </>
          ) : currentView === 'my-invitations' ? (
            <>
              {renderSidebar()}
              {renderMyInvitations()}
            </>
          ) : (
            <>
              {renderSidebar()}
              {renderToolDetail()}
            </>
          )}
        </Content>
      </Layout>

      {/* 图片模态框 */}
      <Modal
        open={imageModalVisible}
        title="活动图片"
        footer={null}
        onCancel={() => setImageModalVisible(false)}
        width="80%"
        centered
        style={{
          maxWidth: '800px'
        }}
      >
        {currentImageUrl && (
          <img
            src={currentImageUrl}
            alt="活动图片"
            style={{
              width: '100%',
              maxHeight: '70vh',
              objectFit: 'contain'
            }}
          />
        )}
      </Modal>
    </ConfigProvider>
  );
}

export default App;
