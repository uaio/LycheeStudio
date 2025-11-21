import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  Tag,
  Badge,
  Row,
  Col,
  Statistic,
  Tooltip,
  message,
  Alert
} from 'antd';
import {
  GlobalOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  RiseOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// 声明 Electron API 类型
declare global {
  interface Window {
    electronAPI: {
      getNpmRegistry: () => Promise<{ success: boolean; registry: string | null; name: string; error?: string }>;
      getNpmRegistries: () => Promise<{ success: boolean; registries: any[] }>;
      setNpmRegistry: (registryUrl: string) => Promise<{ success: boolean; message: string; registry: string; error?: string }>;
    };
  }
}

interface NpmRegistry {
  name: string;
  url: string;
  description: string;
  region?: string;
  speed?: 'fast' | 'medium' | 'slow';
  ping?: number;
}

const NPMManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean; messageApi: any }> = ({ isDarkMode, collapsed = false, messageApi }) => {
  const [currentRegistry, setCurrentRegistry] = useState('');
  const [currentRegistryName, setCurrentRegistryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [customRegistry, setCustomRegistry] = useState('');

  const registries: NpmRegistry[] = [
    {
      name: '官方源',
      url: 'https://registry.npmjs.org/',
      description: 'npm 官方注册表，全球最新包',
      region: '全球',
      speed: 'slow',
      ping: 180
    },
    {
      name: '淘宝源',
      url: 'https://registry.npmmirror.com/',
      description: '阿里云提供的镜像，国内访问速度快',
      region: '中国大陆',
      speed: 'fast',
      ping: 35
    },
    {
      name: '腾讯源',
      url: 'https://mirrors.cloud.tencent.com/npm/',
      description: '腾讯云提供的镜像服务',
      region: '中国大陆',
      speed: 'fast',
      ping: 45
    },
    {
      name: '华为源',
      url: 'https://repo.huaweicloud.com/repository/npm/',
      description: '华为云提供的镜像服务',
      region: '中国大陆',
      speed: 'fast',
      ping: 40
    },
    {
      name: '中科大源',
      url: 'https://mirrors.ustc.edu.cn/npm/',
      description: '中科大提供的镜像服务',
      region: '中国大陆',
      speed: 'fast',
      ping: 55
    }
  ];

  useEffect(() => {
    loadCurrentRegistry();
  }, []);

  const loadCurrentRegistry = async () => {
    try {
      const result = await window.electronAPI.getNpmRegistry();
      if (result.success && result.registry) {
        setCurrentRegistry(result.registry);
        setCurrentRegistryName(result.name || '自定义源');
      } else {
        setCurrentRegistry('https://registry.npmmirror.com/');
        setCurrentRegistryName('淘宝源');
      }
    } catch (error) {
      console.error('获取当前注册表失败:', error);
      setCurrentRegistry('https://registry.npmmirror.com/');
      setCurrentRegistryName('淘宝源');
    }
  };

  const setRegistry = async (registry: string) => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.setNpmRegistry(registry);
      if (result.success) {
        const registryName = registries.find(r => r.url === registry)?.name || registry;
        setSaveMessage(`已切换到 ${registryName}`);
        setCurrentRegistry(registry);
        setCurrentRegistryName(registryName);
      } else {
        setSaveMessage('设置注册表失败');
      }
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('设置注册表失败:', error);
      setSaveMessage('设置注册表失败');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const getSpeedBadgeColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'fast';
      case 'medium': return 'medium';
      case 'slow': return 'slow';
      default: return 'medium';
    }
  };

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast': return <ThunderboltOutlined />;
      case 'medium': return <RiseOutlined />;
      case 'slow': return <ClockCircleOutlined />;
      default: return <RiseOutlined />;
    }
  };

  // 使用 antd message 来显示提示信息
  React.useEffect(() => {
    if (saveMessage) {
      if (saveMessage.includes('成功')) {
        messageApi.success(saveMessage);
      } else {
        messageApi.error(saveMessage);
      }
    }
  }, [saveMessage]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 统计概览 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="可用源"
                value={registries.length}
                prefix={<GlobalOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="当前源"
                value={currentRegistryName}
                prefix={<GlobalOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="包管理器"
                value="NPM"
                prefix={<AppstoreOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 当前源状态 */}
        <Card
          title={
            <Space>
              <DatabaseOutlined />
              <span>当前源状态</span>
            </Space>
          }
          extra={
            <Button
              icon={<ReloadOutlined />}
              loading={isLoading}
              onClick={loadCurrentRegistry}
            >
              检测当前源
            </Button>
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space size="large">
              <Space>
                <GlobalOutlined style={{ fontSize: '28px' }} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>{currentRegistryName}</Title>
                  <Text type="secondary" copyable={{ text: currentRegistry }}>
                    {currentRegistry}
                  </Text>
                </div>
              </Space>
            </Space>
            <div>
              {currentRegistry ? (
                <Badge status="success" text="已配置" />
              ) : (
                <Badge status="error" text="未配置" />
              )}
            </div>
          </div>
        </Card>

        {/* 快速切换源 */}
        <Card
          title={
            <Space>
              <ThunderboltOutlined />
              <span>快速切换源</span>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            {registries.map((registry) => (
              <Col xs={24} sm={12} lg={8} key={registry.url}>
                <Card
                  hoverable
                  className={`registry-card ${currentRegistry === registry.url ? 'selected' : ''}`}
                  onClick={() => setRegistry(registry.url)}
                  style={{
                    border: currentRegistry === registry.url ? '2px solid #1890ff' : undefined,
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Title level={5} style={{ margin: 0 }}>{registry.name}</Title>
                      {currentRegistry === registry.url && (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      )}
                    </div>
                    <Space wrap size="small" style={{ marginTop: '8px' }}>
                      <Tag color={getSpeedBadgeColor(registry.speed || 'medium')}>
                        {getSpeedIcon(registry.speed || 'medium')}
                        {registry.speed === 'fast' ? '快速' : registry.speed === 'medium' ? '中等' : '较慢'}
                      </Tag>
                      <Tag>{registry.region}</Tag>
                      {registry.ping && (
                        <Tag>{registry.ping}ms</Tag>
                      )}
                    </Space>
                  </div>
                  <Paragraph type="secondary" style={{ margin: '8px 0', fontSize: '12px' }}>
                    {registry.description}
                  </Paragraph>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#8c8c8c' }}>
                    <GlobalOutlined style={{ marginRight: '4px' }} />
                    <Text ellipsis style={{ maxWidth: '200px' }}>{registry.url}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 自定义源 */}
        <Card
          title={
            <Space>
              <PlusOutlined />
              <span>自定义源</span>
            </Space>
          }
        >
          <Space.Compact style={{ width: '100%', marginBottom: '16px' }}>
            <Input
              placeholder="输入自定义注册表地址，例如：https://registry.example.com/"
              value={customRegistry}
              onChange={(e) => setCustomRegistry(e.target.value)}
              onPressEnter={() => {
                if (customRegistry) {
                  setRegistry(customRegistry);
                  setCustomRegistry('');
                }
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={!customRegistry || isLoading}
              onClick={() => {
                if (customRegistry) {
                  setRegistry(customRegistry);
                  setCustomRegistry('');
                }
              }}
            >
              设置源
            </Button>
          </Space.Compact>
          <Alert
            message="请确保自定义源地址格式正确且可访问"
            type="info"
            showIcon
            icon={<ExclamationCircleOutlined />}
          />
        </Card>
    </Space>
  );
};

export default NPMManager;