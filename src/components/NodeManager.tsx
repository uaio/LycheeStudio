import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Divider,
  Tag,
  message,
  List,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Empty,
  Alert,
  Badge
} from 'antd';
import {
  CodeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  AppstoreOutlined,
  GlobalOutlined,
  SettingOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// 声明 Electron API 类型
declare global {
  interface Window {
    electronAPI: {
      checkToolInstalled: (toolName: string) => Promise<{ installed: boolean; path: string | null }>;
      installTool: (toolName: string) => Promise<{ success: boolean; message?: string; error?: string }>;
      getToolVersion: (toolName: string) => Promise<{ version: string | null; error: string | null }>;
      getLatestNodeVersion: () => Promise<{ success: boolean; version?: string; error?: string }>;
      executeCommand: (command: string) => Promise<{ success: boolean; output?: string; error?: string }>;
    };
  }
}

interface NodeVersion {
  version: string;
  path?: string;
  current?: boolean;
  lts?: boolean;
  latest?: boolean;
  installed: boolean;
  releaseDate?: string;
}

interface EnvironmentConfig {
  defaultVersion?: string;
  npmRegistry?: string;
  npmMirror?: string;
  globalPackages?: string[];
}

const NodeManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean }> = ({ isDarkMode, collapsed = false }) => {
  const [activeTab, setActiveTab] = useState<'versions' | 'environment' | 'global'>('versions');
  const [versions, setVersions] = useState<NodeVersion[]>([]);
  const [environmentConfig, setEnvironmentConfig] = useState<EnvironmentConfig>({});
  const [globalPackages, setGlobalPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [customVersionToInstall, setCustomVersionToInstall] = useState('');

  // 可用的Node.js版本
  const availableVersions = [
    { version: '20.10.0', lts: false, latest: true, installed: false },
    { version: '20.9.0', lts: false, latest: false, installed: false },
    { version: '18.20.0', lts: true, latest: false, installed: false },
    { version: '18.19.0', lts: false, latest: false, installed: false },
    { version: '16.20.2', lts: true, latest: false, installed: false }
  ];

  useEffect(() => {
    // 模拟加载数据
    loadNodeData();
  }, []);

  // 使用 antd message 来显示提示信息
  React.useEffect(() => {
    if (saveMessage) {
      if (saveMessage.includes('成功')) {
        message.success(saveMessage);
      } else {
        message.error(saveMessage);
      }
    }
  }, [saveMessage]);

  const loadNodeData = async () => {
    setIsLoading(true);
    try {
      // 检查 fnm 和 node 是否已安装
      const [fnmInstalled, nodeInstalled] = await Promise.all([
        window.electronAPI.checkToolInstalled('fnm'),
        window.electronAPI.checkToolInstalled('node')
      ]);

      // 如果 fnm 和 node 都安装了，获取已安装的版本
      if (fnmInstalled.installed && nodeInstalled.installed) {
        // 模拟获取已安装版本
        const installedVersions = availableVersions.filter(v => Math.random() > 0.5);
        setVersions(installedVersions);
      }

      // 模拟获取全局包
      const mockGlobalPackages = [
        { name: 'npm', version: '10.2.3' },
        { name: 'yarn', version: '1.22.19' },
        { name: 'pnpm', version: '8.6.0' }
      ];
      setGlobalPackages(mockGlobalPackages);

      // 模拟环境配置
      const mockConfig = {
        defaultVersion: '20.10.0',
        npmRegistry: 'https://registry.npmjs.org',
        npmMirror: 'https://registry.npmmirror.com',
        globalPackages: []
      };
      setEnvironmentConfig(mockConfig);
    } catch (error) {
      console.error('加载数据失败:', error);
      setSaveMessage('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfiguration = () => {
    // 配置加载逻辑
  };

  const installNodeVersion = async (version: string) => {
    setIsLoading(true);
    try {
      // 模拟安装
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVersions([...versions, {
        version,
        installed: true,
        current: true
      }]);
      setSaveMessage(`Node.js ${version} 安装成功！`);
    } catch (error) {
      console.error('安装失败:', error);
      setSaveMessage('安装失败');
    } finally {
      setIsLoading(false);
    }
  };

  const uninstallNodeVersion = async (version: string) => {
    setIsLoading(true);
    try {
      // 模拟卸载
      await new Promise(resolve => setTimeout(resolve, 1500));
      setVersions(versions.filter(v => v.version !== version));
      setSaveMessage(`Node.js ${version} 已卸载`);
    } catch (error) {
      console.error('卸载失败:', error);
      setSaveMessage('卸载失败');
    } finally {
      setIsLoading(false);
    }
  };

  const switchToVersion = async (version: string) => {
    setIsLoading(true);
    try {
      await window.electronAPI.executeCommand(`fnm use ${version}`);
      setVersions(versions.map(v => ({
        ...v,
        current: v.version === version
      })));
      setSaveMessage(`已切换到 Node.js ${version}`);
    } catch (error) {
      console.error('切换版本失败:', error);
      setSaveMessage('切换版本失败');
    } finally {
      setIsLoading(false);
    }
  };

  const saveEnvironmentConfig = async () => {
    setIsLoading(true);
    try {
      // 模拟保存配置
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('环境配置已保存');
    } catch (error) {
      console.error('保存配置失败:', error);
      setSaveMessage('保存配置失败');
    } finally {
      setIsLoading(false);
    }
  };

  const renderVersionTab = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Input.Search
            placeholder="输入版本号，例如：20.10.0"
            value={customVersionToInstall}
            onChange={(e) => setCustomVersionToInstall(e.target.value)}
            onSearch={() => {
              if (customVersionToInstall) {
                installNodeVersion(customVersionToInstall);
                setCustomVersionToInstall('');
              }
            }}
            style={{ marginBottom: 16 }}
          />
        </Col>
      </Row>

      <List
        loading={isLoading}
        dataSource={availableVersions}
        renderItem={(version) => (
          <List.Item
            actions={[
              <Button
                type={version.installed ? "default" : "primary"}
                danger={version.installed}
                icon={version.installed ? <DeleteOutlined /> : <DownloadOutlined />}
                onClick={() => version.installed ? uninstallNodeVersion(version.version) : installNodeVersion(version.version)}
              >
                {version.installed ? '卸载' : '安装'}
              </Button>,
              version.installed && (
                <Button
                  type={version.current ? "primary" : "default"}
                  onClick={() => switchToVersion(version.version)}
                >
                  {version.current ? '当前' : '使用'}
                </Button>
              )
            ]}
          >
            <List.Item.Meta
              avatar={
                <Space>
                  {version.lts && <Tag color="blue">LTS</Tag>}
                  {version.latest && <Tag color="green">Latest</Tag>}
                </Space>
              }
              title={
                <Space>
                  <Text strong>{version.version}</Text>
                </Space>
              }
              description={
                version.releaseDate ? `发布日期: ${version.releaseDate}` : '无发布日期信息'
              }
            />
          </List.Item>
        )}
      />
    </Space>
  );

  const renderEnvironmentTab = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="默认版本设置">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>默认 Node.js 版本:</Text>
            <Select
              style={{ width: '200px', marginTop: 8 }}
              placeholder="选择默认版本"
              value={environmentConfig.defaultVersion}
              onChange={(value) => setEnvironmentConfig({ ...environmentConfig, defaultVersion: value })}
            >
              {availableVersions.filter(v => v.installed).map(version => (
                <Select.Option key={version.version} value={version.version}>
                  {version.version}
                </Select.Option>
              ))}
            </Select>
          </div>

          <Divider />

          <div>
            <Text strong>NPM 注册表:</Text>
            <Input
              style={{ width: '100%', marginTop: 8 }}
              placeholder="输入 NPM 注册表地址"
              value={environmentConfig.npmRegistry}
              onChange={(e) => setEnvironmentConfig({ ...environmentConfig, npmRegistry: e.target.value })}
            />
          </div>

          <div>
            <Text strong>NPM 镜像源:</Text>
            <Input
              style={{ width: '100%', marginTop: 8 }}
              placeholder="输入 NPM 镜像源地址"
              value={environmentConfig.npmMirror}
              onChange={(e) => setEnvironmentConfig({ ...environmentConfig, npmMirror: e.target.value })}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveEnvironmentConfig}
              loading={isLoading}
            >
              保存配置
            </Button>
          </div>
        </Space>
      </Card>
    </Space>
  );

  const renderGlobalPackagesTab = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Input.Search
            placeholder="输入包名安装全局包"
            onSearch={(value) => {
              if (value) {
                // 模拟安装
                setGlobalPackages([...globalPackages, { name: value, version: 'latest' }]);
                setSaveMessage(`全局包 ${value} 安装成功`);
              }
            }}
            style={{ marginBottom: 16 }}
          />
        </Col>
      </Row>

      <List
        loading={isLoading}
        dataSource={globalPackages}
        renderItem={(pkg) => (
          <List.Item
            actions={[
              <Popconfirm
                title="确定要卸载这个全局包吗？"
                onConfirm={() => {
                  setGlobalPackages(globalPackages.filter(p => p.name !== pkg.name));
                  setSaveMessage(`全局包 ${pkg.name} 已卸载`);
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                >
                  卸载
                </Button>
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              avatar={<AppstoreOutlined />}
              title={
                <Space>
                  <Text strong>{pkg.name}</Text>
                  <Tag color="blue">{pkg.version}</Tag>
                </Space>
              }
              description={`全局安装的 ${pkg.name}`}
            />
          </List.Item>
        )}
      />
    </Space>
  );

  const tabItems = [
    {
      key: 'versions',
      label: '版本管理',
      children: renderVersionTab()
    },
    {
      key: 'environment',
      label: '环境配置',
      children: renderEnvironmentTab()
    },
    {
      key: 'global',
      label: '全局包管理',
      children: renderGlobalPackagesTab()
    }
  ];

  return (
    <Card style={{ width: '100%' }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Card>
  );
};

export default NodeManager;