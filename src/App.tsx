import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ConfigProvider, Layout, Card, Row, Col, Typography, theme, Menu, Button, Tooltip, Modal, App as AntdApp } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ThemeConfig } from 'antd';
import ElectronTitleBar from './components/ElectronTitleBar';
import NodeManager from './components/NodeManager';
import NPMManager from './components/NPMManager';
import PackageManager from './components/PackageManager';
import ClaudeCodeManager from './components/ClaudeCodeManager';
import ClaudeProviderManager from './components/ClaudeProviderManager';
import { useInstallation } from './hooks/useInstallation';
import {
  Bot,
  Terminal,
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
  Plus,
  Gift,
  Cpu,
  GitBranch,
  Database,
  Cloud,
  Wrench,
  Layers,
  Shield,
  Coffee,
  TerminalSquare,
  Braces,
  Hexagon,
  Activity,
  Globe,
  Box,
  Command,
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
      executeCommand: (command: string) => Promise<{ success: boolean; output?: string; error?: string }>;
    };
  }
}

// 统一版本号格式为 x.x.x
const formatVersion = (version: string): string => {
  if (!version) return version;

  // 移除 v 前缀
  version = version.replace(/^v/, '');

  // 提取版本号格式 x.x.x
  const versionMatch = version.match(/\d+\.\d+\.\d+/);
  if (versionMatch) {
    return versionMatch[0];
  }

  // 如果没有 x.x.x 格式，尝试提取主版本号和次版本号
  const shortVersionMatch = version.match(/\d+\.\d+/);
  if (shortVersionMatch) {
    return shortVersionMatch[0] + '.0';
  }

  // 最后尝试提取主版本号
  const mainVersionMatch = version.match(/\d+/);
  if (mainVersionMatch) {
    return mainVersionMatch[0] + '.0.0';
  }

  return version;
};

// 统一的 Node.js 默认版本获取函数
export const getCurrentNodeVersion = async (): Promise<string> => {
  if (!window.electronAPI) {
    return '';
  }

  try {
    const listResult = await window.electronAPI.executeCommand('fnm list');

    if (listResult.success && listResult.output) {
      const lines = listResult.output.split('\n').filter(line => line.trim());

      // 查找标记为 default 的版本
      for (const line of lines) {
        const versionMatch = line.match(/v\d+\.\d+\.\d+/);
        if (versionMatch && line.includes('default')) {
          const version = versionMatch[0];
          return formatVersion(version);
        }
      }

      // 如果没有找到 default 版本，返回第一个版本（如果有）
      for (const line of lines) {
        const versionMatch = line.match(/v\d+\.\d+\.\d+/);
        if (versionMatch) {
          const version = versionMatch[0];
          return formatVersion(version);
        }
      }

      return '';
    }
    return '';
  } catch (error) {
        return '';
  }
};

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
  // 第一组：Homebrew 和 FNM
  {
    name: 'Homebrew',
    version: '检测中...',
    status: 'warning' as 'active' | 'warning' | 'error',
    description: 'macOS 包管理器',
    icon: <Coffee size={18} />,
    color: '#FB8C00', // 橙棕色，符合 Homebrew 品牌色
    detail: 'macOS 包管理器，用于安装开发工具',
    installable: false, // 检测中状态不可安装
    installCommand: 'brew'
  },
  {
    name: 'FNM',
    version: '检测中...',
    status: 'warning' as 'active' | 'warning' | 'error',
    description: 'Fast Node Manager',
    icon: <GitBranch size={18} />, // 分支图标，代表版本管理
    color: '#7C4DFF', // 紫色，代表版本管理
    detail: 'Fast Node Manager - Node.js 版本管理',
    installable: false, // 检测中状态不可安装
    installCommand: 'fnm'
  },

  // 第二组：Node.js 和 NPM 源
  {
    name: 'Node.js',
    version: '检测中...',
    status: 'warning' as 'active' | 'warning' | 'error',
    description: 'JavaScript 运行环境',
    icon: <Hexagon size={18} />, // 六边形，Node.js 标志性形状
    color: '#5FA04E', // Node.js 绿色
    detail: 'JavaScript 运行环境',
    installable: false, // 检测中状态不可安装
    installCommand: 'node'
  },
  {
    name: 'NPM 源',
    version: '检测中...',
    status: 'warning' as 'active' | 'warning' | 'error',
    description: '包管理器源配置',
    icon: <Database size={18} />, // 数据库图标，代表包仓库
    color: '#CB3837', // NPM 红色
    detail: 'NPM 包注册表源配置',
    installable: false, // 检测中状态不可安装
    installCommand: 'npm' // NPM 源检测和配置
  },

  // 第三组：AI 工具
  {
    name: 'Claude Code',
    version: '检测中...',
    status: 'warning' as 'active' | 'warning' | 'error',
    description: 'Anthropic AI 编程助手',
    icon: <TerminalSquare size={18} />, // 终端图标，代表编程助手
    color: '#D97706', // 橙色，符合 Anthropic 品牌
    detail: 'Anthropic AI 编程助手',
    installable: false, // 检测中状态不可安装
    installCommand: 'claude-code'
  },
  {
    name: 'Gemini CLI',
    version: '检测中...',
    status: 'warning' as 'active' | 'warning' | 'error',
    description: 'Google AI 代码助手',
    icon: <Activity size={18} />, // 活动图标，代表 AI 智能活动
    color: '#4285F4', // Google 蓝
    detail: 'Google Gemini AI 编程助手',
    installable: false, // 检测中状态不可安装
    installCommand: 'gemini-cli'
  },
  {
    name: 'Codex',
    version: '检测中...',
    status: 'warning' as 'active' | 'warning' | 'error',
    description: 'OpenAI 代码助手',
    icon: <Braces size={18} />, // 大括号，代表代码
    color: '#10A37F', // OpenAI 绿色
    detail: 'OpenAI Codex 代码生成工具',
    installable: false, // 检测中状态不可安装
    installCommand: 'codex'
  }
];

type ThemeType = 'light' | 'dark' | 'system';

// 将检测结果映射到界面状态卡片的函数
const mapToolsToStatusCards = (tools: any[], currentStatusCards = null) => {
  // 如果没有当前状态卡片，使用初始状态
  const statusCards = currentStatusCards || [
    // 第一行：Homebrew 和 FNM
    {
      name: 'Homebrew',
      version: '检测中...',
      status: 'warning' as 'active' | 'warning' | 'error',
      description: 'macOS 包管理器',
      icon: <Coffee size={18} />,
      color: '#FB8C00', // 橙棕色，符合 Homebrew 品牌色
      detail: 'macOS 包管理器，用于安装开发工具',
      installable: false, // 检测中状态不可安装
      installCommand: 'brew'
    },
    {
      name: 'FNM',
      version: '检测中...',
      status: 'warning' as 'active' | 'warning' | 'error',
      description: 'Fast Node Manager',
      icon: <GitBranch size={18} />, // 分支图标，代表版本管理
      color: '#7C4DFF', // 紫色，代表版本管理
      detail: 'Fast Node Manager - Node.js 版本管理',
      installable: false, // 检测中状态不可安装
      installCommand: 'fnm'
    },

    // 第二行：Node.js 和 NPM 源
    {
      name: 'Node.js',
      version: '检测中...',
      status: 'warning' as 'active' | 'warning' | 'error',
      description: 'JavaScript 运行环境',
      icon: <Hexagon size={18} />, // 六边形，Node.js 标志性形状
      color: '#5FA04E', // Node.js 绿色
      detail: 'JavaScript 运行环境',
      installable: false, // 检测中状态不可安装
      installCommand: 'node'
    },
    {
      name: 'NPM 源',
      version: '检测中...',
      status: 'warning' as 'active' | 'warning' | 'error',
      description: '包管理器源配置',
      icon: <Database size={18} />, // 数据库图标，代表包仓库
      color: '#CB3837', // NPM 红色
      detail: 'NPM 包注册表源配置',
      installable: false, // 检测中状态不可安装
      installCommand: 'npm'
    },

    // 第三行：AI 工具
    {
      name: 'Claude Code',
      version: '检测中...',
      status: 'warning' as 'active' | 'warning' | 'error',
      description: 'Anthropic AI 编程助手',
      icon: <TerminalSquare size={18} />, // 终端图标，代表编程助手
      color: '#D97706', // 橙色，符合 Anthropic 品牌
      detail: 'Anthropic AI 编程助手',
      installable: false, // 检测中状态不可安装
      installCommand: 'claude-code'
    },
    {
      name: 'Gemini CLI',
      version: '检测中...',
      status: 'warning' as 'active' | 'warning' | 'error',
      description: 'Google Gemini AI 助手',
      icon: <Activity size={18} />, // 活动图标，代表 AI 智能活动
      color: '#4285F4', // Google 蓝
      detail: 'Google Gemini AI 编程助手',
      installable: false, // 检测中状态不可安装
      installCommand: 'gemini-cli'
    },
    {
      name: 'Codex',
      version: '检测中...',
      status: 'warning' as 'active' | 'warning' | 'error',
      description: 'OpenAI Codex AI 代码助手',
      icon: <Braces size={18} />, // 大括号，代表代码
      color: '#10A37F', // OpenAI 绿色
      detail: 'OpenAI Codex 代码生成工具',
      installable: false, // 检测中状态不可安装
      installCommand: 'codex'
    }
  ];

  // 使用检测结果更新状态卡片（基于当前状态，保留已检测的结果）
  return statusCards.map(card => {
    const tool = tools.find(t => {
      // 匹配逻辑 - 与 installationService.ts 中的工具名称保持一致
      if (card.name === 'Homebrew') return t.name === 'brew';
      if (card.name === 'FNM') return t.name === 'fnm';
      if (card.name === 'Node.js') return t.name === 'node';
      if (card.name === 'NPM 源') return t.name === 'npm';
      if (card.name === 'Claude Code') return t.name === 'claude-code' || t.name === 'claudeCode';
      if (card.name === 'Gemini CLI') return t.name === 'gemini-cli' || t.name === 'geminiCli';
      if (card.name === 'Codex') return t.name === 'codex';
      return false;
    });

    if (tool) {
      let installable = false;
      let status: 'active' | 'warning' | 'error' = 'warning';
      let version = tool.version || card.version;

      // 根据依赖关系判断是否可安装和状态
      if (card.name === 'Homebrew') {
        // Homebrew 无依赖，总是可安装
        installable = !tool.isInstalled;
        if (tool.isInstalled) status = 'active';
        else if (tool.status === 'error') status = 'error';
        else status = 'warning';
      } else if (card.name === 'FNM') {
        // FNM 依赖 Homebrew
        const homebrew = tools.find(t => t.name === 'brew');
        installable = !tool.isInstalled && homebrew?.isInstalled;
        if (tool.isInstalled) status = 'active';
        else if (tool.status === 'error' || !homebrew?.isInstalled) status = 'error';
        else status = 'warning';
      } else if (card.name === 'Node.js') {
        // Node.js 依赖 FNM
        const fnm = tools.find(t => t.name === 'fnm');
        installable = !tool.isInstalled && fnm?.isInstalled;
        if (tool.isInstalled) status = 'active';
        else if (tool.status === 'error' || !fnm?.isInstalled) status = 'error';
        else status = 'warning';
      } else if (card.name === 'NPM 源') {
        // NPM 源完全依赖 Node.js 状态
        const nodejs = tools.find(t => t.name === 'node');

        if (!nodejs) {
          // 如果没有找到Node.js数据，设为错误状态
          status = 'error';
          version = 'API不可用';
          installable = false;
        } else if (!nodejs.isInstalled) {
          // Node.js未安装时，NPM源也不可安装
          status = 'warning';
          version = '依赖Node.js';
          installable = false;
        } else if (nodejs.status === 'error') {
          // Node.js API不可用时，NPM源也是API不可用
          status = 'error';
          version = 'API不可用';
          installable = false;
        } else {
          // Node.js正常时，NPM源才能正常工作
          installable = false; // NPM源不需要安装，是配置项
          if (tool.isInstalled) status = 'active';
          else if (tool.status === 'error') status = 'error';
          else status = 'warning';
        }
      } else {
        // AI工具依赖 Homebrew
        const homebrew = tools.find(t => t.name === 'brew');
        installable = !tool.isInstalled && homebrew?.isInstalled;
        if (tool.isInstalled) status = 'active';
        else if (tool.status === 'error' || !homebrew?.isInstalled) status = 'error';
        else status = 'warning';
      }

      return {
        ...card,
        version,
        status,
        installable,
        path: tool.path
      };
    }

    return card;
  });
};

function App() {
  // 不需要在这里获取 message API，子组件会自己使用 useApp

  const [currentView, setCurrentView] = useState<'home' | string>(() => {
    // 从URL参数读取当前页面状态
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    return view || 'home';
  });

  // 子页面到父菜单的映射关系
  const subPageToParentMap = useMemo(() => ({
    'node-version': 'nodejs',
    'npm-source': 'nodejs',
    'package-managers': 'nodejs',
    'claude-providers': 'claude-code',
    'claude-prompts': 'claude-code',
    'claude-mcp': 'claude-code',
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
  }), []);

  // 使用安装Hook
  const { tools, refreshTools, refreshSingleTool, installTool, partialResults, isLoading } = useInstallation();

  // 开发环境状态
  const [devEnvironmentStatus, setDevEnvironmentStatus] = useState({
    ready: false,
    message: '开发环境准备中 (0/4)',
    description: '请安装所有核心开发工具以获得最佳体验'
  });

  // 计算当前应该展开的父菜单
  const getOpenKeys = useCallback((view: string): string[] => {
    const parentKey = subPageToParentMap[view];
    // 只有当访问的视图有实际页面实现时才展开父菜单
    const hasActualPage = [
      'node-version', 'npm-source', 'package-managers',
      'claude-providers', 'claude-prompts', 'claude-mcp',
      'platform-promotions', 'my-invitations'
    ].includes(view);
    return parentKey && hasActualPage ? [parentKey] : [];
  }, [subPageToParentMap]);

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    return getOpenKeys(currentView);
  });

  // 侧边栏始终展开，不再支持收起功能
  const collapsed = false;
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    // 从 localStorage 读取保存的主题设置
    const savedTheme = localStorage.getItem('app-theme') as ThemeType;
    return savedTheme || 'system';
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [statusCards, setStatusCards] = useState(initialStatusCards);

  // 统一监听所有状态变化，更新状态卡片
  useEffect(() => {
    // 检测期间：使用部分结果进行渐进式更新，基于当前状态保留已检测结果
    if (!isLoading && partialResults.length > 0) {
            const updatedCards = mapToolsToStatusCards(partialResults, statusCards);
      setStatusCards(updatedCards);
    }

    // 检测完成后：使用完整结果，基于当前状态保留已检测结果
    if (!isLoading && tools.length > 0) {
            const updatedCards = mapToolsToStatusCards(tools, statusCards);
      setStatusCards(updatedCards);
    }
  }, [tools, partialResults, isLoading]); // 移除 statusCards 和 mapToolsToStatusCards 依赖
  const [installingTool, setInstallingTool] = useState<string | null>(null);
  const [currentImageUrl] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // 监听工具状态变化，更新首页状态卡片
  useEffect(() => {
    const updatedCards = statusCards.map(card => {
      if (card.installable && card.installCommand) {
        const tool = tools.find(t => t.name === card.name || t.name === card.installCommand);
        if (tool) {
          return {
            ...card,
            version: tool.version ? `v${tool.version}` : (tool.isInstalled ? '已安装' : '未安装'),
            status: tool.isInstalled ? 'active' : 'warning' as 'active' | 'warning' | 'error',
            detail: card.description // 保持使用原有的简单介绍
          };
        }
      }
      return card;
    });

    // 检查是否需要更新
    const hasChanges = updatedCards.some((card, index) => {
      const originalCard = statusCards[index];
      return card.version !== originalCard.version ||
             card.status !== originalCard.status ||
             card.detail !== originalCard.detail;
    });

    if (hasChanges) {
      setStatusCards(updatedCards);
    }
  }, [tools, statusCards]);

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
  }, [currentView, getOpenKeys]);

  // 组件加载时自动检测NPM源
  useEffect(() => {
    // 延迟一点时间让electronAPI初始化完成
    const timer = setTimeout(() => {
      checkNpmRegistry();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 监听工具状态变化，更新开发环境状态
  useEffect(() => {
    // 从statusCards中找到核心工具的状态
    const nodeCard = statusCards.find(card => card.name === 'Node.js');
    const fnmCard = statusCards.find(card => card.name === 'FNM');
    const npmCard = statusCards.find(card => card.name === 'NPM 源');
    const brewCard = statusCards.find(card => card.name === 'Homebrew');

    // 检查工具是否已安装（status为'active'表示已安装）
    const nodeInstalled = nodeCard?.status === 'active';
    const fnmInstalled = fnmCard?.status === 'active';
    const npmInstalled = npmCard?.status === 'active';
    const brewInstalled = brewCard?.status === 'active';

    const allInstalled = nodeInstalled && fnmInstalled && npmInstalled && brewInstalled;
    const installedCount = [nodeInstalled, fnmInstalled, npmInstalled, brewInstalled].filter(Boolean).length;

    const newStatus = allInstalled ? {
      ready: true,
      message: '开发环境准备就绪',
      description: '所有核心开发工具已安装完成'
    } : {
      ready: false,
      message: `开发环境准备中 (${installedCount}/4)`,
      description: '请安装所有核心开发工具以获得最佳体验'
    };

    // 检查是否需要更新状态
    if (JSON.stringify(devEnvironmentStatus) !== JSON.stringify(newStatus)) {
      setDevEnvironmentStatus(newStatus);
    }
  }, [statusCards]); // 依赖statusCards数组

  // 检查工具安装状态
  const checkToolStatus = async (toolName: string) => {
    if (!window.electronAPI) {
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
        // 对于Node.js，使用统一的版本获取函数
        if (toolName === 'node') {
          const currentVersion = await getCurrentNodeVersion();
          if (currentVersion) {
            version = currentVersion;
            status = 'active';
            detail = 'JavaScript 运行环境';
          } else {
            // 如果没有获取到版本，尝试使用getToolVersion作为备用
            const versionResult = await window.electronAPI.getToolVersion(toolName);
            if (versionResult.version) {
              version = formatVersion(versionResult.version);
              status = 'active';
              detail = 'JavaScript 运行环境';
            } else {
              version = '已安装';
              status = 'active';
              detail = 'JavaScript 运行环境';
            }
          }
        } else {
          // 其他工具使用原来的方法
          const versionResult = await window.electronAPI.getToolVersion(toolName);
          if (versionResult.version) {
            version = formatVersion(versionResult.version);
            status = 'active';
            if (toolName === 'fnm') {
              detail = 'Fast Node Manager';
            } else {
              detail = '运行正常';
            }
          } else {
            version = '已安装';
            status = 'active';
            if (toolName === 'fnm') {
              detail = 'Fast Node Manager';
            } else {
              detail = '运行正常';
            }
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
        await checkToolStatus('node');
  };

  // 刷新FNM状态
  const refreshFnmStatus = async () => {
        await checkToolStatus('fnm');
  };

  // 检查NPM源
  const checkNpmRegistry = async () => {
        if (!window.electronAPI) {
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

  // 通用刷新工具状态
  const refreshToolStatus = async (displayName: string, isInitializing: boolean = false) => {
    const action = isInitializing ? '初始化检测' : '刷新';
        try {
      // 根据显示名称找到对应的工具命令
      const toolCard = statusCards.find(card => card.name === displayName);
      const toolCommand = toolCard?.installCommand;

      if (toolCommand) {
        
        // 只更新版本显示加载状态，保持原始的详情描述
        setStatusCards(prevCards => {
          const updatedCards = prevCards.map(card => {
            if (card.name === displayName) {
              return {
                ...card,
                version: isInitializing ? '检测中...' : '刷新中...',
                status: 'warning' as const
                // 保持原有的 detail 不变
              };
            }
            return card;
          });
          return updatedCards;
        });

        // 使用新的单个工具刷新功能
        const toolStatus = await refreshSingleTool(toolCommand);
        
        // 更新状态卡片中的版本信息，但保持原有的 detail 不变
        setStatusCards(prevCards => {
          const updatedCards = prevCards.map(card => {
            if (card.name === displayName) {
              return {
                ...card,
                version: toolStatus.version ? formatVersion(toolStatus.version) : (toolStatus.isInstalled ? '已安装' : '未安装'),
                status: toolStatus.isInstalled ? 'active' as const : 'error' as const
                // 保持原有的 detail 字段不变
              };
            }
            return card;
          });
          return updatedCards;
        });

              } else {
                // 如果找不到工具命令，执行全局刷新
        await refreshTools();
      }
    } catch (error) {
            // 显示错误状态
      setStatusCards(prevCards => {
        const updatedCards = prevCards.map(card => {
          if (card.name === displayName) {
            return {
              ...card,
              version: '检测失败',
              status: 'error' as const,
              detail: `${action}失败`
            };
          }
          return card;
        });
        return updatedCards;
      });
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

        // 检测 AI 工具
        setTimeout(() => {
                    refreshToolStatus('Claude Code', true);
          refreshToolStatus('Gemini CLI', true);
          refreshToolStatus('Codex', true);
        }, 500); // 稍微延迟检测AI工具
      } else {
                // 如果 electronAPI 不存在，设置为错误状态
        setStatusCards(prevCards =>
          prevCards.map(card => {
            if (card.name === 'Node.js' || card.name === 'FNM' || card.name === 'Claude Code' || card.name === 'Gemini CLI' || card.name === 'Codex') {
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
  }, [refreshTools]);

  // 监听版本切换事件
  useEffect(() => {
    const handleNodeVersionChanged = (event: CustomEvent) => {
      const { version } = event.detail;
            // 重新检测Node.js状态以同步首页显示
      checkToolStatus('node');
    };

    // 添加事件监听器
    window.addEventListener('nodeVersionChanged', handleNodeVersionChanged as EventListener);

    // 清理事件监听器
    return () => {
      window.removeEventListener('nodeVersionChanged', handleNodeVersionChanged as EventListener);
    };
  }, []);

  // 处理卡片点击事件
  const handleCardClick = async (card: any) => {
    // Node.js 和 NPM 源的特殊处理（优先处理）
    if (card.name === 'Node.js' || card.name === 'NPM 源') {
      if (card.status === 'active') {
        // 已安装：根据具体工具跳转到对应页面
        if (card.name === 'Node.js') {
          setCurrentView('node-version');
        } else if (card.name === 'NPM 源') {
          setCurrentView('npm-source');
        }
      } else {
        // 未安装或其他状态：不执行跳转
              }
      return;
    }

    // 如果是其他可安装的工具
    if (card.installable) {
      // 检查工具是否已安装
      const toolStatus = tools.find(tool => tool.name === card.installCommand);

      if (toolStatus && toolStatus.isInstalled) {
        // 已安装：根据具体工具跳转到对应页面
        switch (card.name) {
          case 'FNM':
            // FNM 不跳转，只显示状态
            break;
          case 'Homebrew':
            // Homebrew 不跳转，只显示状态
            break;
          case 'Claude Code':
          case 'Gemini CLI':
          case 'Codex':
            // AI工具暂时不跳转，预留功能
                        break;
          default:
            // 其他可安装工具跳转到对应页面
            if (card.name === 'FNM') {
              setCurrentView('nodejs');
            } else if (card.name === 'Homebrew') {
              setCurrentView('homebrew');
            }
            break;
        }
      } else {
        // 未安装：不执行任何操作，等待用户点击安装按钮
              }
    } else {
      // 非可安装工具的点击逻辑
      if (card.name.includes('API')) {
        setCurrentView('ai-tools');
      }
    }
  };

  // 处理安装按钮点击事件
  const handleInstallClick = async (e: React.MouseEvent, card: any) => {
    e.stopPropagation(); // 阻止事件冒泡到卡片点击事件

    if (!card.installable) {
      return;
    }

    try {
      setInstallingTool(card.installCommand);
      await installTool(card.installCommand);
      // 安装成功后刷新工具状态
      setTimeout(() => {
        refreshTools();
      }, 2000);
    } catch (error) {
          } finally {
      setInstallingTool(null);
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
        currentView === 'dev-recommend' || currentView === 'help' ||
        currentView === 'node-version' || currentView === 'npm-source' || currentView === 'package-managers') {

      // 如果是 Node.js 相关的子页面，渲染对应组件
      if (currentView === 'node-version') {
        return (
          <div style={{
            marginLeft: '200px',
            height: 'calc(100vh - 38px)',
            overflow: 'hidden',
          }}>
            <div
              className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
              style={{
                paddingTop: '48px',
                paddingLeft: '48px',
                paddingBottom: '48px',
                paddingRight: '56px',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                marginRight: 0,
              }}
            >
              <NodeManager
                isDarkMode={isDarkMode}
                collapsed={collapsed}
                isInstalling={installingTool !== null}
              />
            </div>
          </div>
        );
      }

      if (currentView === 'npm-source') {
        return (
          <div style={{
            marginLeft: '200px',
            height: 'calc(100vh - 38px)',
            overflow: 'hidden',
          }}>
            <div
              className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
              style={{
                paddingTop: '48px',
                paddingLeft: '48px',
                paddingBottom: '48px',
                paddingRight: '56px',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                marginRight: 0,
              }}
            >
              <NPMManager isDarkMode={isDarkMode} collapsed={collapsed} />
            </div>
          </div>
        );
      }

      if (currentView === 'package-managers') {
        return (
          <div style={{
            marginLeft: '200px',
            height: 'calc(100vh - 38px)',
            overflow: 'hidden',
          }}>
            <div
              className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
              style={{
                paddingTop: '48px',
                paddingLeft: '48px',
                paddingBottom: '48px',
                paddingRight: '56px',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                marginRight: 0,
              }}
            >
              <PackageManager isDarkMode={isDarkMode} collapsed={collapsed} />
            </div>
          </div>
        );
      }

      if (currentView === 'claude-providers') {
        return (
          <div style={{
            marginLeft: '200px',
            height: 'calc(100vh - 38px)',
            overflow: 'hidden',
          }}>
            <div
              className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
              style={{
                paddingTop: '48px',
                paddingLeft: '48px',
                paddingBottom: '48px',
                paddingRight: '56px',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                marginRight: 0,
              }}
            >
              <ClaudeProviderManager isDarkMode={isDarkMode} collapsed={collapsed} />
            </div>
          </div>
        );
      }

      if (currentView === 'claude-code') {
        return (
          <div style={{
            marginLeft: '200px',
            height: 'calc(100vh - 38px)',
            overflow: 'hidden',
          }}>
            <div
              className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
              style={{
                paddingTop: '48px',
                paddingLeft: '48px',
                paddingBottom: '48px',
                paddingRight: '56px',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                marginRight: 0,
              }}
            >
              <ClaudeCodeManager isDarkMode={isDarkMode} collapsed={collapsed} />
            </div>
          </div>
        );
      }

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
          marginLeft: '200px',
          height: 'calc(100vh - 38px)',
          overflow: 'hidden',
        }}>
          <div
            className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
            style={{
              paddingTop: '48px',
              paddingLeft: '16px',
              paddingBottom: '48px',
              paddingRight: '8px',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              marginRight: 0,
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

    return (
      <div style={{
        marginLeft: collapsed ? '64px' : '200px',
        height: 'calc(100vh - 38px)',
        overflow: 'hidden',
      }}>
        <div
          className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
          style={{
            paddingTop: '48px',
            paddingLeft: '48px',
            paddingBottom: '48px',
            paddingRight: '56px',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            marginRight: 0,
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <Title level={3} style={{ marginBottom: '8px', color: isDarkMode ? '#ffffff' : '#000000' }}>
              平台活动
            </Title>
            <Paragraph type="secondary" style={{ fontSize: '14px', marginBottom: 0 }}>
              发现各大 AI 平台的最新优惠活动和促销信息
            </Paragraph>
          </div>

        <Row gutter={[16, 16]}>
          {platformActivities.map((activity) => (
            <Col xs={24} sm={24} md={12} lg={8} xl={6} xxl={4} key={activity.id}>
              <Card
                hoverable
                onClick={() => openLinkSafely(activity.link)}
                style={{
                  height: '100%',
                  background: isDarkMode ? '#1f1f1f' : '#ffffff',
                  border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
                  cursor: 'pointer',
                }}
                styles={{ body: { padding: '16px' } }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{
                      fontSize: '28px',
                      marginRight: '12px',
                      filter: isDarkMode ? 'brightness(1.2)' : 'none',
                      flexShrink: 0,
                      marginTop: '4px'
                    }}>
                      {activity.imageUrl ? '🖼️' : activity.image}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Title
                        level={4}
                        style={{
                          margin: '0 0 4px 0',
                          color: isDarkMode ? '#ffffff' : '#000000',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.4',
                          fontSize: '16px',
                          fontWeight: 600
                        }}
                      >
                        {activity.title}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {activity.platform}
                      </Text>
                    </div>
                  </div>

                  <Paragraph
                    style={{
                      margin: 0,
                      color: isDarkMode ? '#e0e0e0' : '#333',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '14px'
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
        marginLeft: collapsed ? '64px' : '200px',
        height: 'calc(100vh - 38px)',
        overflow: 'hidden',
      }}>
        <div
          className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
          style={{
            paddingTop: '48px',
            paddingLeft: '48px',
            paddingBottom: '48px',
            paddingRight: '56px',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            marginRight: 0,
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <Title level={3} style={{ marginBottom: '8px', color: isDarkMode ? '#ffffff' : '#000000' }}>
              我的邀请
            </Title>
            <Paragraph type="secondary" style={{ fontSize: '14px', marginBottom: 0 }}>
              管理您的邀请链接，跟踪邀请进度和奖励收益
            </Paragraph>
          </div>

        <Row gutter={[16, 16]}>
          {myInvitations.map((invitation) => (
            <Col xs={24} sm={24} md={12} lg={8} xl={6} xxl={4} key={invitation.id}>
              <Card
                hoverable
                onClick={() => openLinkSafely(invitation.inviteLink)}
                style={{
                  height: '100%',
                  background: isDarkMode ? '#1f1f1f' : '#ffffff',
                  border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
                  cursor: 'pointer',
                }}
                styles={{ body: { padding: '16px' } }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{
                      fontSize: '28px',
                      marginRight: '12px',
                      filter: isDarkMode ? 'brightness(1.2)' : 'none',
                      flexShrink: 0,
                      marginTop: '4px'
                    }}>
                      {invitation.imageUrl ? '🖼️' : invitation.image}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Title
                        level={4}
                        style={{
                          margin: '0 0 4px 0',
                          color: isDarkMode ? '#ffffff' : '#000000',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.4',
                          fontSize: '16px',
                          fontWeight: 600
                        }}
                      >
                        {invitation.title}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {invitation.platform}
                      </Text>
                    </div>
                  </div>

                  <Paragraph
                    style={{
                      margin: 0,
                      color: isDarkMode ? '#e0e0e0' : '#333',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '14px'
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
    <>
      <Sider
        width={200}
          style={{
          background: isDarkMode ? '#1f1f1f' : '#f8f9fa',
          borderRight: `1px solid ${isDarkMode ? '#424242' : '#e8e8e8'}`,
          height: 'calc(100vh - 38px)',
          position: 'fixed',
          left: 0,
          top: 38,
          transition: collapsed
          ? 'width 0.15s cubic-bezier(0.42, 0, 1, 1)'  // 收起：先慢后快
          : 'width 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',  // 展开：先快后慢
        }}
      >
        <div
          className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
          style={{
            paddingTop: collapsed ? '6px' : '16px',
            paddingLeft: collapsed ? '6px' : '16px',
            paddingBottom: collapsed ? '6px' : '16px',
            paddingRight: 0,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            // 确保滚动条不占用额外空间
            marginRight: 0,
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[currentView === 'home' ? 'home' : currentView]}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={setOpenKeys}
            inlineCollapsed={collapsed}
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
                  {
                    key: 'node-version',
                    label: '版本切换',
                    onClick: () => setCurrentView('node-version')
                  },
                  {
                    key: 'npm-source',
                    label: 'NPM 源管理',
                    onClick: () => setCurrentView('npm-source')
                  },
                  {
                    key: 'package-managers',
                    label: '包管理工具',
                    onClick: () => setCurrentView('package-managers')
                  },
                ],
              },
              {
                key: 'claude-code',
                icon: <Bot size={16} />,
                label: 'Claude Code',
                children: [
                  {
                    key: 'claude-providers',
                    label: '提供商管理',
                    onClick: () => setCurrentView('claude-providers')
                  },
                  {
                    key: 'claude-prompts',
                    label: '全局提示词管理',
                    onClick: () => setCurrentView('claude-prompts')
                  },
                  {
                    key: 'claude-mcp',
                    label: 'MCP管理',
                    onClick: () => setCurrentView('claude-mcp')
                  },
                ],
              },
              {
                key: 'ai-tools',
                icon: <Bot size={16} />,
                label: 'AI 工具',
                children: [
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

      </>
  );

  
  const renderHome = () => (
    <div style={{
      marginLeft: collapsed ? '64px' : '200px', // 为侧边栏留出空间
      height: 'calc(100vh - 48px)', // 固定高度，减去标题栏高度（已增加到48px）
      overflow: 'hidden', // 隐藏溢出
    }}>
      <div
        className={`sidebar-scroll-container ${isDarkMode ? 'dark-mode' : ''}`}
        style={{
          paddingTop: '48px', // 增加上边距
          paddingLeft: '48px', // 增加左边距
          paddingBottom: '48px', // 增加下边距
          paddingRight: '56px', // 增加右边距（原本40px + 16px）
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          // 确保滚动条不占用额外空间
          marginRight: 0,
        }}
      >
  
      {/* 开发环境状态提示 */}
      <div style={{ marginBottom: '32px' }}>
        <Card
          style={{
            background: devEnvironmentStatus.ready
              ? (isDarkMode ? '#1f3a1f' : '#f6ffed')
              : (isDarkMode ? '#2a2a2a' : '#ffffff'),
            border: devEnvironmentStatus.ready
              ? '1px solid #52c41a'
              : (isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8'),
            borderRadius: '8px',
          }}
          styles={{ body: { padding: '16px' } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: devEnvironmentStatus.ready
                  ? '#52c41a'
                  : '#faad14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {devEnvironmentStatus.ready ? (
                <CheckCircle size={20} color="#ffffff" />
              ) : (
                <AlertCircle size={20} color="#ffffff" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: isDarkMode ? '#ffffff' : '#000000',
                marginBottom: '4px',
              }}>
                {devEnvironmentStatus.message}
              </div>
              <div style={{
                fontSize: '14px',
                color: isDarkMode ? '#a0a0a0' : '#666',
              }}>
                {devEnvironmentStatus.description}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 工具卡片列表 - 一行一个卡片 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {statusCards.map((card, index) => (
          <Card
            key={`tool-${index}`}
            hoverable
            style={{
              transition: 'all 0.3s ease',
              border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
              borderRadius: '12px',
              cursor: 'pointer',
              background: isDarkMode ? '#2a2a2a' : '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
            styles={{
              body: {
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }
            }}
            onClick={() => handleCardClick(card)}
          >
            {/* 左侧：图标区域 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${card.color}15, ${card.color}25)`,
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${card.color}10 0%, transparent 50%, ${card.color}05 100%)`,
                  opacity: 0.8
                }}
              />
              {React.cloneElement(card.icon, {
                size: 24,
                color: card.color,
                style: {
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }
              })}
            </div>

            {/* 中间：工具信息 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '4px',
                color: isDarkMode ? '#ffffff' : '#000000',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {card.name}
                {/* 刷新按钮 */}
                {(card.name === 'Node.js' || card.name === 'FNM' || card.name === 'NPM 源' ||
                  card.name === 'Homebrew' || card.name === 'Claude Code' || card.name === 'Gemini CLI' || card.name === 'Codex') && (
                  <Button
                    type="text"
                    size="small"
                    icon={<RefreshCw size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.name === 'Node.js') {
                        refreshNodeStatus();
                      } else if (card.name === 'FNM') {
                        refreshFnmStatus();
                      } else if (card.name === 'NPM 源') {
                        checkNpmRegistry();
                      } else {
                        refreshToolStatus(card.name);
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
                  />
                )}
              </div>
              <div style={{
                fontSize: '14px',
                color: isDarkMode ? '#a0a0a0' : '#666',
                marginBottom: '2px'
              }}>
                {card.description}
              </div>
              {card.detail && card.name !== 'NPM 源' && (
                <div style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#888' : '#999',
                }}>
                  {card.detail}
                </div>
              )}
            </div>

            {/* 右侧：状态和操作 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              {/* 版本信息 */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: card.color,
                  marginBottom: '2px'
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
                <div style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#888' : '#999',
                }}>
                  {card.status === 'active' ? '已安装' :
                   card.status === 'warning' ? '待安装' : '错误'}
                </div>
              </div>

              {/* 状态图标和操作按钮 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {card.status === 'active' && (
                  <CheckCircle size={20} color="#52c41a" />
                )}

                {card.status === 'warning' && card.installable && (
                  <Tooltip title="点击安装" placement="top">
                    <DownloadOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInstallClick(e, card);
                      }}
                      style={{
                        color: isDarkMode ? '#1890ff' : '#1890ff',
                        fontSize: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: installingTool === card.installCommand ? 0.6 : 1,
                      }}
                    />
                  </Tooltip>
                )}

                {card.status === 'warning' && !card.installable && (
                  <AlertCircle size={20} color="#faad14" />
                )}

                {card.status === 'error' && (
                  <XCircle size={20} color="#f5222d" />
                )}

                {!card.installable && card.status !== 'error' && card.status !== 'warning' && (
                  <ChevronRight size={16} color={isDarkMode ? '#888' : '#ccc'} />
                )}
              </div>
            </div>
          </Card>
        ))}
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
      <AntdApp>
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
          className={isDarkMode ? 'dark-mode' : ''}
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
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
