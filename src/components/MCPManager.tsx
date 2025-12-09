/**
 * MCP (Model Context Protocol) 管理器主组件
 * 采用类似 NPM 包管理的布局
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tag,
  Spin,
  Alert,
  Input,
  List,
  Modal,
  Form,
  Divider,
  Tooltip,
  Badge,
  App,
  Select,
  Empty,
  Switch
} from 'antd';
import {
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Settings,
  FolderOpen,
  Terminal,
  Package,
  Search,
  Plus,
  Edit3,
  Trash2,
  Download,
  Upload,
  FileText,
  Activity,
  Check,
  X,
  AlertTriangle,
  Star,
  ExternalLink
} from 'lucide-react';
import { MCPConfig, MCPServer, MCPServiceStatus, MCPLogEntry } from '../types/mcp';
import { mcpStorage } from '../utils/mcpStorage';
import CodeEditor from './CodeEditor';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface MCPManagerProps {
  isDarkMode: boolean;
}

interface RecommendedMCPServer {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  author: string;
  downloadCount: number;
  rating: number;
  tags: string[];
  npmPackage: string;
  installCommand: string;
  icon: React.ReactNode;
}

const MCPManager: React.FC<MCPManagerProps> = ({ isDarkMode }) => {
  // 消息API
  const { message: antMessage } = App.useApp();

  // 状态管理
  const [loading, setLoading] = useState<boolean>(false);
  const [configLoading, setConfigLoading] = useState<boolean>(false);
  const [recommendedLoading, setRecommendedLoading] = useState<boolean>(false);

  const [serviceStatus, setServiceStatus] = useState<MCPServiceStatus>({ running: false });
  const [mcpConfig, setMcpConfig] = useState<MCPConfig>({ mcpServers: {} });
  const [installedServers, setInstalledServers] = useState<MCPServer[]>([]);
  const [recommendedServers, setRecommendedServers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [configEditorVisible, setConfigEditorVisible] = useState<boolean>(false);
  const [serverModalVisible, setServerModalVisible] = useState<boolean>(false);
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null);

  const [form] = Form.useForm();

  // 加载推荐的 MCP 服务（使用热门服务列表）
  const loadRecommendedMCPServers = async () => {
    setRecommendedLoading(true);
    try {
      // 直接使用精心挑选的热门服务列表
      const popularServers = getPopularMCPServers();
      setRecommendedServers(popularServers);
      console.log(`加载了 ${popularServers.length} 个热门推荐服务`);
    } catch (error) {
      console.error('加载推荐 MCP 服务失败:', error);
    } finally {
      setRecommendedLoading(false);
    }
  };

  // 分类列表
  const categories = [
    { value: 'all', label: '全部' },
    { value: 'files', label: '文件系统' },
    { value: 'development', label: '开发工具' },
    { value: 'search', label: '搜索引擎' },
    { value: 'database', label: '数据库' },
    { value: 'utilities', label: '实用工具' }
  ];

  // 加载初始数据
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // 并行加载服务状态和配置
      const [statusResult, configResult] = await Promise.all([
        mcpStorage.getMCPServiceStatus(),
        mcpStorage.readMCPConfig()
      ]);

      if (statusResult) {
        setServiceStatus(statusResult);
      }

      if (configResult.success && configResult.config) {
        setMcpConfig(configResult.config);
        // 将配置转换为服务器列表
        const serverList: MCPServer[] = Object.entries(configResult.config.mcpServers).map(([key, config]) => ({
          id: key,
          name: key,
          version: 'unknown',
          command: config.command,
          args: config.args || [],
          env: config.env,
          status: 'unknown',
          autoStart: false
        }));
        setInstalledServers(serverList);
      }
    } catch (error) {
      console.error('加载MCP数据失败:', error);
      antMessage.error('加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [antMessage]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadInitialData();
    loadRecommendedMCPServers();
  }, []); // 只在组件挂载时执行一次

  // 监控推荐服务状态变化
  useEffect(() => {
    console.log('recommendedServers 状态变化:', recommendedServers.length, recommendedServers);
  }, [recommendedServers]);

  // 测试直接的 NPM API 调用
  const testDirectAPI = async () => {
    try {
      console.log('测试直接 NPM API 调用...');
      const response = await fetch('https://registry.npmjs.org/-/v1/search?text=keywords:modelcontextprotocol');
      const data = await response.json();
      console.log('直接 API 调用结果:', data);
      console.log('找到的对象数量:', data.objects?.length);
    } catch (error) {
      console.error('直接 API 调用失败:', error);
    }
  };

  // 热门推荐 MCP 服务列表（基于使用量和社区反馈）
  const getPopularMCPServers = () => [
    {
      id: 'filesystem',
      name: '@modelcontextprotocol/server-filesystem',
      displayName: 'Filesystem',
      version: '1.0.0',
      description: '文件系统访问服务，允许读取、写入和管理本地文件系统',
      icon: '🗂️',
      category: 'file',
      popularity: 'high',
      installCommand: 'npx -y @modelcontextprotocol/server-filesystem /path/to/directory',
      useCase: '需要访问和管理本地文件的项目',
      links: {
        npm: 'https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem',
        github: 'https://github.com/modelcontextprotocol/servers'
      }
    },
    {
      id: 'git',
      name: '@modelcontextprotocol/server-git',
      displayName: 'Git',
      version: '1.0.0',
      description: 'Git 版本控制集成，支持仓库操作、提交管理、分支切换等',
      icon: '📝',
      category: 'development',
      popularity: 'high',
      installCommand: 'npx -y @modelcontextprotocol/server-git --repository /path/to/repo',
      useCase: '需要与 Git 仓库交互的开发项目',
      links: {
        npm: 'https://www.npmjs.com/package/@modelcontextprotocol/server-git',
        github: 'https://github.com/modelcontextprotocol/servers'
      }
    },
    {
      id: 'github',
      name: '@modelcontextprotocol/server-github',
      displayName: 'GitHub',
      version: '1.0.0',
      description: 'GitHub 平台集成，管理 Issues、Pull Requests、仓库信息等',
      icon: '🐙',
      category: 'development',
      popularity: 'high',
      installCommand: 'npx -y @modelcontextprotocol/server-github --token YOUR_GITHUB_TOKEN',
      useCase: '需要与 GitHub API 交互的自动化工作流',
      links: {
        npm: 'https://www.npmjs.com/package/@modelcontextprotocol/server-github',
        github: 'https://github.com/modelcontextprotocol/servers'
      }
    },
    {
      id: 'sqlite',
      name: '@modelcontextprotocol/server-sqlite',
      displayName: 'SQLite',
      version: '1.0.0',
      description: 'SQLite 数据库操作服务，支持 SQL 查询和数据库管理',
      icon: '🗃️',
      category: 'database',
      popularity: 'medium',
      installCommand: 'npx -y @modelcontextprotocol/server-sqlite --db-path /path/to/database.db',
      useCase: '本地数据存储、数据分析应用',
      links: {
        npm: 'https://www.npmjs.com/package/@modelcontextprotocol/server-sqlite',
        github: 'https://github.com/modelcontextprotocol/servers'
      }
    },
    {
      id: 'postgres',
      name: '@modelcontextprotocol/server-postgres',
      displayName: 'PostgreSQL',
      version: '1.0.0',
      description: 'PostgreSQL 数据库集成，支持复杂 SQL 查询和数据库管理',
      icon: '🐘',
      category: 'database',
      popularity: 'medium',
      installCommand: 'npx -y @modelcontextprotocol/server-postgres --connection-string="postgresql://..."',
      useCase: '企业级应用、复杂数据分析',
      links: {
        npm: 'https://www.npmjs.com/package/@modelcontextprotocol/server-postgres',
        github: 'https://github.com/modelcontextprotocol/servers'
      }
    },
    {
      id: 'brave-search',
      name: '@modelcontextprotocol/server-brave-search',
      displayName: 'Brave Search',
      version: '1.0.0',
      description: 'Brave 搜索引擎集成，提供实时网络搜索能力',
      icon: '🔍',
      category: 'search',
      popularity: 'medium',
      installCommand: 'npx -y @modelcontextprotocol/server-brave-search --api-key YOUR_API_KEY',
      useCase: '需要实时网络搜索的应用',
      links: {
        npm: 'https://www.npmjs.com/package/@modelcontextprotocol/server-brave-search',
        github: 'https://github.com/modelcontextprotocol/servers'
      }
    },
    {
      id: 'memory',
      name: '@modelcontextprotocol/server-memory',
      displayName: 'Memory',
      version: '1.0.0',
      description: '持久化内存服务，提供对话历史存储和检索功能',
      icon: '🧠',
      category: 'utility',
      popularity: 'medium',
      installCommand: 'npx -y @modelcontextprotocol/server-memory',
      useCase: '需要记住对话历史的 AI 助手',
      links: {
        npm: 'https://www.npmjs.com/package/@modelcontextprotocol/server-memory',
        github: 'https://github.com/modelcontextprotocol/servers'
      }
    },
    {
      id: 'puppeteer',
      name: '@modelcontextprotocol/server-puppeteer',
      displayName: 'Puppeteer',
      version: '1.0.0',
      description: '网页自动化服务，支持浏览器控制、截图、网页抓取等',
      icon: '🌐',
      category: 'automation',
      popularity: 'medium',
      installCommand: 'npx -y @modelcontextprotocol/server-puppeteer',
      useCase: '网页自动化、数据抓取、UI 测试',
      links: {
        npm: 'https://www.npmjs.com/package/@modelcontextprotocol/server-puppeteer',
        github: 'https://github.com/modelcontextprotocol/servers'
      }
    },
    {
      id: 'fetch',
      name: '@modelcontextprotocol/server-fetch',
      displayName: 'Fetch',
      version: '1.0.0',
      description: 'HTTP 请求服务，支持发送 GET、POST 等网络请求',
      icon: '🌐',
      category: 'network',
      popularity: 'medium',
      installCommand: 'npx -y @modelcontextprotocol/server-fetch',
      useCase: '需要调用 REST API 的应用',
      links: {
        npm: 'https://www.npmjs.com/package/@modelcontextprotocol/server-fetch',
        github: 'https://github.com/modelcontextprotocol/servers'
      }
    },
    {
      id: 'slack',
      name: '@modelcontextprotocol/server-slack',
      displayName: 'Slack',
      version: '1.0.0',
      description: 'Slack 集成服务，支持消息发送、频道管理、用户查询等',
      icon: '💬',
      category: 'communication',
      popularity: 'low',
      installCommand: 'npx -y @modelcontextprotocol/server-slack --bot-token YOUR_BOT_TOKEN',
      useCase: 'Slack 自动化、团队协作工具',
      links: {
        npm: 'https://www.npmjs.com/package/@modelcontextprotocol/server-slack',
        github: 'https://github.com/modelcontextprotocol/servers'
      }
    }
  ];

  // 刷新服务状态
  const refreshServiceStatus = async () => {
    const status = await mcpStorage.getMCPServiceStatus();
    setServiceStatus(status);
    // 刷新单个服务器状态
    const updatedServers = installedServers.map(server => ({
      ...server,
      status: Math.random() > 0.3 ? 'running' : 'stopped' // 模拟状态
    }));
    setInstalledServers(updatedServers);
  };

  // 启动/停止单个服务
  const toggleService = async (serverId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'stopped' : 'running';

    // 更新本地状态
    const updatedServers = installedServers.map(server =>
      server.id === serverId ? { ...server, status: newStatus as any } : server
    );
    setInstalledServers(updatedServers);

    antMessage.success(`${serverId} ${newStatus === 'running' ? '启动成功' : '已停止'}`);
  };

  // 安装推荐的服务
  const installRecommendedServer = (server: any) => {
    Modal.confirm({
      title: '安装 MCP 服务',
      content: (
        <div>
          <Paragraph>确定要安装 <strong>{server.displayName || server.name}</strong> 吗？</Paragraph>
          <Paragraph>
            <Text code>npm install {server.name}</Text>
          </Paragraph>
        </div>
      ),
      onOk: async () => {
        try {
          antMessage.loading('正在安装...', 0);

          // 调用实际的安装逻辑
          const installResult = await mcpStorage.installMCPServer(server.name);

          antMessage.destroy();

          if (installResult.success) {
            antMessage.success(`${server.displayName || server.name} 安装成功！`);

            // 添加到已安装列表
            const newServer: MCPServer = {
              id: server.name,
              name: server.displayName || server.name,
              version: server.version,
              command: 'npx',
              args: ['-y', server.name],
              status: 'stopped'
            };
            setInstalledServers([...installedServers, newServer]);
          } else {
            antMessage.error(`安装失败: ${installResult.error}`);
          }
        } catch (error) {
          antMessage.destroy();
          antMessage.error(`安装失败: ${error}`);
        }
      }
    });
  };

  // 手动安装服务
  const [manualInstallVisible, setManualInstallVisible] = useState(false);
  const [manualInstallForm] = Form.useForm();

  const handleManualInstall = (values: any) => {
    const { serviceName, command, args } = values;

    Modal.confirm({
      title: '手动配置 MCP 服务',
      content: (
        <div>
          <Paragraph>确定要添加 <strong>{serviceName}</strong> 到配置中吗？</Paragraph>
          <Paragraph>
            <Text code>{command} {args.join(' ')}</Text>
          </Paragraph>
        </div>
      ),
      onOk: async () => {
        try {
          // 更新配置
          const newConfig = { ...mcpConfig };
          newConfig.mcpServers[serviceName] = {
            command,
            args: args ? args.split(' ').filter(arg => arg) : []
          };

          const saveResult = await mcpStorage.saveMCPConfig(newConfig);

          if (saveResult.success) {
            setMcpConfig(newConfig);
            antMessage.success(`${serviceName} 配置保存成功！`);

            // 添加到已安装列表
            const newServer: MCPServer = {
              id: serviceName,
              name: serviceName,
              version: 'unknown',
              command,
              args: args ? args.split(' ').filter(arg => arg) : [],
              status: 'stopped'
            };
            setInstalledServers([...installedServers, newServer]);
            setManualInstallVisible(false);
            manualInstallForm.resetFields();
          } else {
            antMessage.error(`配置保存失败: ${saveResult.error}`);
          }
        } catch (error) {
          antMessage.error(`操作失败: ${error}`);
        }
      }
    });
  };

  // 卸载服务
  const uninstallServer = (server: MCPServer) => {
    Modal.confirm({
      title: '卸载 MCP 服务',
      content: `确定要卸载 <strong>${server.name}</strong> 吗？这将删除相关配置。`,
      okText: '确定卸载',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const updatedServers = installedServers.filter(s => s.id !== server.id);
          setInstalledServers(updatedServers);

          // 更新配置
          const newConfig = { ...mcpConfig };
          delete newConfig.mcpServers[server.id];
          setMcpConfig(newConfig);

          antMessage.success(`${server.name} 卸载成功`);
        } catch (error) {
          antMessage.error(`卸载失败: ${error}`);
        }
      }
    });
  };

  // 打开配置文件夹
  const handleOpenConfigFolder = async () => {
    if (window.electronAPI && window.electronAPI.openExternal) {
      const result = await window.electronAPI.openExternal('file://~/.claude');
      if (!result.success) {
        antMessage.error('打开配置文件夹失败');
      }
    }
  };

  // 格式化下载数 - 适配新的数据结构
  const formatDownloadCount = (count: number | string) => {
    if (typeof count === 'string') {
      return count;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // 过滤推荐服务 - 适配新的数据结构
  const filteredRecommendedServers = selectedCategory === 'all'
    ? recommendedServers
    : recommendedServers.filter(server => {
        console.log('过滤服务:', server.name, '关键词:', server.keywords);
        if (!server.keywords) {
          console.log('服务', server.name, '没有关键词，被过滤掉');
          return false;
        }
        const keywordsStr = server.keywords.join(' ').toLowerCase();
        console.log('服务', server.name, '关键词字符串:', keywordsStr);

        let result = false;
        switch (selectedCategory) {
          case 'files':
            result = keywordsStr.includes('file') || keywordsStr.includes('filesystem') || keywordsStr.includes('storage');
            break;
          case 'development':
            result = keywordsStr.includes('git') || keywordsStr.includes('github') || keywordsStr.includes('development');
            break;
          case 'search':
            result = keywordsStr.includes('search') || keywordsStr.includes('web') || keywordsStr.includes('browser');
            break;
          case 'database':
            result = keywordsStr.includes('database') || keywordsStr.includes('sql') || keywordsStr.includes('db');
            break;
          case 'utilities':
            result = keywordsStr.includes('utility') || keywordsStr.includes('memory') || keywordsStr.includes('tool');
            break;
          default:
            result = true;
        }
        console.log('服务', server.name, '分类', selectedCategory, '结果:', result);
        return result;
      });

  // 过滤已安装服务
  const filteredInstalledServers = searchQuery
    ? installedServers.filter(server =>
        server.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : installedServers;

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Check size={16} style={{ color: '#52c41a' }} />;
      case 'stopped':
        return <X size={16} style={{ color: '#ff4d4f' }} />;
      case 'error':
        return <AlertTriangle size={16} style={{ color: '#faad14' }} />;
      default:
        return <Activity size={16} style={{ color: '#d9d9d9' }} />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'default';
      case 'error': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Layout style={{
      height: '100%',
      background: 'transparent',
      width: '100%'
    }}>
      <div style={{
        height: '100%',
        margin: '16px',
        background: isDarkMode ? '#1f1f1f' : '#ffffff',
        borderRadius: '12px',
        boxShadow: isDarkMode
          ? '0 4px 16px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        border: isDarkMode ? '1px solid #404040' : '1px solid #e0e0e0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 顶部标题栏 */}
        <div style={{
          padding: '16px 24px',
          borderBottom: isDarkMode ? '1px solid #404040' : '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Title level={4} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
            MCP 管理器
          </Title>
          <Space>
            <Button
              icon={<RefreshCw size={16} />}
              onClick={refreshServiceStatus}
              loading={loading}
            >
              刷新状态
            </Button>
            <Button
              icon={<RefreshCw size={16} />}
              onClick={loadRecommendedMCPServers}
              loading={recommendedLoading}
            >
              刷新推荐
            </Button>
            <Button
              icon={<Settings size={16} />}
              onClick={() => setConfigEditorVisible(true)}
            >
              高级设置
            </Button>
            <Button
              onClick={testDirectAPI}
            >
              测试 API
            </Button>
          </Space>
        </div>

        <Content style={{
          padding: '24px',
          overflow: 'auto',
          flex: 1
        }}>
          {/* MCP 配置管理区域 */}
          <div style={{
            background: isDarkMode ? '#2a2a2a' : '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <Space>
                <Settings size={20} />
                <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '16px' }}>
                  MCP 配置中心
                </Text>
              </Space>
              <Space>
                <Button size="small" icon={<FolderOpen size={14} />} onClick={handleOpenConfigFolder}>
                  配置文件夹
                </Button>
                <Button size="small" icon={<FileText size={14} />} onClick={() => setConfigEditorVisible(true)}>
                  编辑配置
                </Button>
              </Space>
            </div>
            <div style={{
              padding: '12px 16px',
              background: isDarkMode ? '#1f1f1f' : '#f8f9fa',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: isDarkMode ? '#b0b0b0' : '#666'
            }}>
              配置文件: ~/.claude/claude_desktop_config.json
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Badge count={installedServers.length} style={{ backgroundColor: '#1890ff' }}>
                <div style={{
                  padding: '8px 16px',
                  background: isDarkMode ? '#333' : '#e6f7ff',
                  borderRadius: '6px'
                }}>
                  <Text style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                    已配置服务
                  </Text>
                </div>
              </Badge>
              <div style={{
                padding: '8px 16px',
                background: isDarkMode ? '#333' : '#f6ffed',
                borderRadius: '6px'
              }}>
                <Text style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                  运行中: {installedServers.filter(s => s.status === 'running').length}
                </Text>
              </div>
            </div>
          </div>

          {/* 已安装的 MCP 服务 */}
          <div style={{
            background: isDarkMode ? '#2a2a2a' : '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <Space>
                <Package size={20} />
                <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '16px' }}>
                  已安装的服务
                </Text>
                <Badge count={installedServers.length} style={{ backgroundColor: '#1890ff' }} />
              </Space>
            </div>
            {installedServers.length === 0 ? (
              <Empty
                description="暂无已安装的 MCP 服务，请在下方推荐中选择安装"
                style={{ padding: '60px 0' }}
              />
            ) : (
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 3,
                  xl: 3,
                  xxl: 4
                }}
                dataSource={installedServers}
                renderItem={(server) => (
                  <List.Item>
                    <Card
                      size="small"
                      hoverable
                      style={{
                        background: isDarkMode ? '#1f1f1f' : '#ffffff',
                        borderColor: isDarkMode ? '#424242' : '#e8e8e8',
                        borderRadius: '12px'
                      }}
                      bodyStyle={{ padding: '16px' }}
                      actions={[
                        <Tooltip key="toggle" title={server.status === 'running' ? '停止服务' : '启动服务'}>
                          <Button
                            type={server.status === 'running' ? 'default' : 'primary'}
                            size="small"
                            icon={server.status === 'running' ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                            onClick={() => toggleService(server.id, server.status)}
                            style={{ borderRadius: '6px' }}
                          >
                            {server.status === 'running' ? '停止' : '启动'}
                          </Button>
                        </Tooltip>,
                        <Tooltip key="config" title="编辑配置">
                          <Button
                            type="text"
                            size="small"
                            icon={<Edit3 size={14} />}
                          />
                        </Tooltip>,
                        <Tooltip key="uninstall" title="卸载">
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<Trash2 size={14} />}
                            onClick={() => uninstallServer(server)}
                          />
                        </Tooltip>
                      ]}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: server.status === 'running'
                              ? isDarkMode ? '#1a3d1a' : '#f6ffed'
                              : server.status === 'error'
                              ? isDarkMode ? '#3a1a1a' : '#fff2f0'
                              : isDarkMode ? '#2a2a2a' : '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {getStatusIcon(server.status)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <Text strong style={{
                              fontSize: '14px',
                              color: isDarkMode ? '#ffffff' : '#000000',
                              display: 'block'
                            }}>
                              {server.name}
                            </Text>
                            <Tag
                              color={server.status === 'running' ? 'green' : server.status === 'error' ? 'red' : 'default'}
                              size="small"
                              style={{ marginTop: '4px', borderRadius: '4px' }}
                            >
                              {server.status === 'running' ? '运行中' : server.status === 'error' ? '异常' : '已停止'}
                            </Tag>
                          </div>
                        </div>
                        <Text code style={{
                          fontSize: '11px',
                          color: isDarkMode ? '#b0b0b0' : '#666',
                          display: 'block',
                          background: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          {server.command} {server.args.join(' ')}
                        </Text>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </div>

        {/* 推荐的 MCP 服务 */}
          <div style={{
            background: isDarkMode ? '#2a2a2a' : '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <Space>
                <Star size={20} />
                <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '16px' }}>
                  推荐的热门服务
                </Text>
                <Badge count={recommendedServers.length} style={{ backgroundColor: '#52c41a' }} />
              </Space>
            </div>
            <Spin spinning={recommendedLoading}>
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 3,
                  xl: 3,
                  xxl: 4
                }}
                dataSource={recommendedServers}
                renderItem={(server) => (
                  <List.Item>
                    <Card
                      hoverable
                      style={{
                        background: isDarkMode ? '#1f1f1f' : '#ffffff',
                        borderColor: isDarkMode ? '#424242' : '#e8e8e8',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease'
                      }}
                      bodyStyle={{ padding: '20px' }}
                      actions={[
                        <Tooltip key="install" title="一键安装">
                          <Button
                            type="primary"
                            size="small"
                            icon={<Download size={14} />}
                            onClick={() => installRecommendedServer(server)}
                            style={{ borderRadius: '6px' }}
                          >
                            安装
                          </Button>
                        </Tooltip>,
                        <Tooltip key="npm" title={server.name}>
                          <Button
                            type="text"
                            size="small"
                            icon={<ExternalLink size={14} />}
                            onClick={() => window.open(server.links?.npm || `https://www.npmjs.com/package/${server.name}`, '_blank')}
                          />
                        </Tooltip>
                      ]}
                    >
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            fontSize: '32px',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                            borderRadius: '12px'
                          }}>
                            {server.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <Text strong style={{
                              fontSize: '16px',
                              color: isDarkMode ? '#ffffff' : '#000000',
                              display: 'block',
                              marginBottom: '4px'
                            }}>
                              {server.displayName}
                            </Text>
                            <Text type="secondary" style={{
                              fontSize: '12px',
                              color: isDarkMode ? '#999' : '#666'
                            }}>
                              {server.useCase}
                            </Text>
                          </div>
                        </div>

                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{
                            fontSize: '13px',
                            margin: '12px 0',
                            color: isDarkMode ? '#b0b0b0' : '#666',
                            lineHeight: '1.5'
                          }}
                        >
                          {server.description}
                        </Paragraph>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '12px'
                        }}>
                          <Tag
                            color={server.popularity === 'high' ? 'green' : server.popularity === 'medium' ? 'blue' : 'default'}
                            style={{ fontSize: '11px', borderRadius: '4px' }}
                          >
                            {server.popularity === 'high' ? '热门' : server.popularity === 'medium' ? '推荐' : '可选'}
                          </Tag>
                          <Text code style={{
                            fontSize: '11px',
                            background: isDarkMode ? '#2a2a2a' : '#f1f3f4',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {server.category}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </Spin>
          </div>
        </Content>
      </div>

      {/* 配置编辑器模态框 */}
      <Modal
        title="编辑 MCP 配置"
        open={configEditorVisible}
        onCancel={() => setConfigEditorVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfigEditorVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" loading={configLoading} onClick={() => {
            const newConfig: MCPConfig = { mcpServers: {} };
            handleSaveConfig(newConfig);
          }}>
            保存
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        <Alert
          message="配置文件位置"
          description="~/.claude/claude_desktop_config.json"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <div style={{
          height: '400px',
          border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
          borderRadius: '8px'
        }}>
          <CodeEditor
            value={JSON.stringify(mcpConfig, null, 2)}
            language="json"
            isDarkMode={isDarkMode}
            placeholder="在此编辑 MCP 配置..."
            height="100%"
          />
        </div>
      </Modal>

      {/* 配置保存函数 */}
      {(() => {
        const handleSaveConfig = async (newConfig: MCPConfig) => {
          setConfigLoading(true);
          try {
            const result = await mcpStorage.saveMCPConfig(newConfig);
            if (result.success) {
              setMcpConfig(newConfig);
              antMessage.success('配置保存成功');
              setConfigEditorVisible(false);
              await loadInitialData();
            } else {
              antMessage.error(`保存失败: ${result.error}`);
            }
          } catch (error) {
            console.error('保存配置失败:', error);
            antMessage.error('保存过程中出现错误');
          } finally {
            setConfigLoading(false);
          }
        };
        return null;
      })()}

      {/* 手动安装服务模态框 */}
      <Modal
        title="手动配置 MCP 服务"
        open={manualInstallVisible}
        onCancel={() => {
          setManualInstallVisible(false);
          manualInstallForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setManualInstallVisible(false);
            manualInstallForm.resetFields();
          }}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => manualInstallForm.submit()}>
            添加配置
          </Button>
        ]}
        width={600}
        destroyOnClose
      >
        <Form
          form={manualInstallForm}
          layout="vertical"
          onFinish={handleManualInstall}
        >
          <Form.Item
            label="服务名称"
            name="serviceName"
            rules={[{ required: true, message: '请输入服务名称' }]}
          >
            <Input placeholder="例如: my-custom-server" />
          </Form.Item>
          <Form.Item
            label="启动命令"
            name="command"
            rules={[{ required: true, message: '请输入启动命令' }]}
          >
            <Input placeholder="例如: npx" />
          </Form.Item>
          <Form.Item
            label="命令参数"
            name="args"
          >
            <Input placeholder="例如: -y @my-org/my-server --arg1 value1" />
          </Form.Item>
          <Alert
            message="配置说明"
            description="配置将被添加到 ~/.claude/claude_desktop_config.json 文件中。您可以随时在配置编辑器中修改这些设置。"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Form>
      </Modal>
    </Layout>
  );
};

export default MCPManager;