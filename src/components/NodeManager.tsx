import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
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
  Badge,
  Descriptions,
  Progress,
  Spin
} from 'antd';
import {
  CodeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  AppstoreOutlined,
  GlobalOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

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
  installedAt?: string;
}

interface NodeVersionInfo {
  version: string;
  isLTS: boolean;
  releaseDate: string;
  npmVersion?: string;
  security?: boolean;
}

const NodeManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean }> = ({ isDarkMode, collapsed = false }) => {
  const [currentVersion, setCurrentVersion] = useState<NodeVersion | null>(null);
  const [installedVersions, setInstalledVersions] = useState<NodeVersion[]>([]);
  const [availableVersions, setAvailableVersions] = useState<NodeVersionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customVersionInput, setCustomVersionInput] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installationMessage, setInstallationMessage] = useState('');
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadNodeData();
  }, []);

  useEffect(() => {
    if (saveMessage) {
      if (saveMessage.includes('成功')) {
        message.success(saveMessage);
      } else {
        message.error(saveMessage);
      }
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }, [saveMessage]);

  const loadNodeData = async () => {
    setIsLoading(true);
    try {
      // 1. 获取当前版本
      const currentResult = await window.electronAPI.executeCommand('fnm current');
      if (currentResult.success && currentResult.output) {
        const version = currentResult.output.trim();
        setCurrentVersion({
          version,
          current: true,
          installed: true,
          lts: version.includes('v16') || version.includes('v18') || version.includes('v20')
        });
      }

      // 2. 获取已安装版本列表
      const listResult = await window.electronAPI.executeCommand('fnm list');
      if (listResult.success && listResult.output) {
        const installed = parseFnmList(listResult.output);
        setInstalledVersions(installed);
      }

      // 3. 获取最新版本信息
      const latestResult = await window.electronAPI.getLatestNodeVersion();
      if (latestResult.success && latestResult.version) {
        setLatestVersion(latestResult.version);
      }

      // 4. 模拟获取可用版本信息（从v16开始）
      const mockAvailableVersions = generateAvailableVersions();
      setAvailableVersions(mockAvailableVersions);

    } catch (error) {
      console.error('加载Node数据失败:', error);
      message.error('加载Node.js数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const parseFnmList = (output: string): NodeVersion[] => {
    const lines = output.split('\n');
    const versions: NodeVersion[] = [];

    lines.forEach(line => {
      const match = line.match(/([a-fA-F0-9\-\.]+)\s+\(v([a-fA-F0-9\-\.]+)\s+\((.+?)\)/);
      if (match) {
        versions.push({
          version: match[2],
          current: line.includes('*'),
          installed: true,
          path: match[3],
          lts: match[2].includes('v16') || match[2].includes('v18') || match[2].includes('v20'),
          installedAt: new Date().toISOString()
        });
      }
    });

    return versions;
  };

  const generateAvailableVersions = (): NodeVersionInfo[] => {
    const versions: NodeVersionInfo[] = [];
    const majorVersions = [20, 19, 18, 17, 16];

    majorVersions.forEach(major => {
      const latestPatch = major === 20 ? 10 : major === 19 ? 9 : major === 18 ? 20 : major === 17 ? 9 : 20;

      // 为每个主版本添加几个补丁版本
      for (let patch = 0; patch <= 2; patch++) {
        const version = `${major}.${latestPatch - patch}`;
        versions.push({
          version,
          isLTS: major % 2 === 0, // 偶数版本号为LTS
          releaseDate: new Date(Date.now() - (major * 100 + patch * 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          npmVersion: `9.${10 - patch}.2`,
          security: patch === 0 // 第一个补丁版本可能有安全更新
        });
      }
    });

    return versions;
  };

  const switchToVersion = async (version: string) => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.executeCommand(`fnm use ${version}`);
      if (result.success) {
        const newCurrentVersion = installedVersions.find(v => v.version === version) || {
          version,
          current: true,
          installed: true,
          lts: version.includes('v16') || version.includes('v18') || version.includes('v20')
        };

        setCurrentVersion(newCurrentVersion);
        setInstalledVersions(prev => prev.map(v => ({ ...v, current: v.version === version })));
        setSaveMessage(`已切换到 ${version}`);
      } else {
        setSaveMessage('切换版本失败');
      }
    } catch (error) {
      console.error('切换版本失败:', error);
      setSaveMessage('切换版本失败');
    } finally {
      setIsLoading(false);
    }
  };

  const installVersion = async (versionInput: string) => {
    let versionToInstall = versionInput;

    // 处理版本输入
    if (versionInput.startsWith('v')) {
      if (versionInput === 'v20') {
        // v20 表示安装v20的最新版本
        const latestV20 = availableVersions
          .filter(v => v.version.startsWith('20.'))
          .sort((a, b) => b.version.localeCompare(a.version))[0];
        if (latestV20) {
          versionToInstall = `v${latestV20.version}`;
        }
      } else {
        // 已经是完整版本号
        versionToInstall = versionInput;
      }
    } else {
      // 没有前缀，添加前缀
      versionToInstall = `v${versionInput}`;
    }

    setIsInstalling(true);
    setInstallationMessage(`正在安装 ${versionToInstall}...`);

    try {
      const result = await window.electronAPI.executeCommand(`fnm install ${versionToInstall}`);
      if (result.success) {
        setInstallationMessage(`${versionToInstall} 安装成功`);
        setTimeout(() => {
          setInstallationMessage('');
          setCustomVersionInput('');
          loadNodeData(); // 重新加载数据
        }, 2000);
      } else {
        setInstallationMessage(`${versionToInstall} 安装失败: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('安装失败:', error);
      setInstallationMessage(`${versionToInstall} 安装失败`);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleInstallClick = () => {
    if (customVersionInput.trim()) {
      installVersion(customVersionInput.trim());
    }
  };

  const isVersionInstalled = (version: string): boolean => {
    return installedVersions.some(v => v.version === version);
  };

  const getTagColor = (isLatest: boolean, isLTS: boolean, isInstalled: boolean) => {
    if (isInstalled) return 'success';
    if (isLatest) return 'processing';
    if (isLTS) return 'warning';
    return 'default';
  };

  const getTagText = (isLatest: boolean, isLTS: boolean, isInstalled: boolean) => {
    if (isInstalled) return '已安装';
    if (isLatest) return '最新';
    if (isLTS) return 'LTS';
    return '';
  };

  // 渲染当前版本状态
  const renderCurrentVersionStatus = () => (
    <Card
      title={
        <Space>
          <InfoCircleOutlined />
          <span>当前版本状态</span>
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          loading={isLoading}
          onClick={loadNodeData}
        >
          刷新状态
        </Button>
      }
    >
      {currentVersion ? (
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="当前版本">
            <Space>
              <Title level={4} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
                v{currentVersion.version}
              </Title>
              <Tag color="success">正在使用</Tag>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="版本类型">
            <Space>
              {currentVersion.lts && <Tag color="blue">LTS</Tag>}
              <Tag color="processing">JavaScript</Tag>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="安装路径">
            <Text code>{currentVersion.path || 'N/A'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="最新版本">
            <Space>
              <Text>v{latestVersion || '检查中...'}</Text>
              {latestVersion && currentVersion.version !== latestVersion.replace('v', '') && (
                <Tag color="warning" style={{ cursor: 'pointer' }} onClick={() => installVersion(`v${latestVersion}`)}>
                  可升级
                </Tag>
              )}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Empty
          image={<CodeOutlined style={{ fontSize: 48, color: isDarkMode ? '#666' : '#ccc' }} />}
          description={
            <Space direction="vertical">
              <Text type="secondary">未检测到 Node.js 或 fnm 安装</Text>
              <Text type="secondary">请确保已安装 Node.js 和 fnm</Text>
            </Space>
          }
        />
      )}
    </Card>
  );

  // 渲染已安装版本列表
  const renderInstalledVersions = () => (
    <Card
      title={
        <Space>
          <CheckCircleOutlined />
          <span>已安装版本</span>
          <Badge count={installedVersions.length} />
        </Space>
      }
    >
      {installedVersions.length > 0 ? (
        <List
          dataSource={installedVersions}
          renderItem={(version) => (
            <List.Item
              actions={[
                <Button
                  type={version.current ? "primary" : "default"}
                  icon={<AppstoreOutlined />}
                  onClick={() => switchToVersion(version.version)}
                  loading={isLoading}
                >
                  {version.current ? '使用中' : '切换'}
                </Button>,
                <Popconfirm
                  title="确定要卸载这个版本吗？"
                  description="卸载后需要重新下载"
                  onConfirm={() => uninstallVersion(version.version)}
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
                avatar={
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    backgroundColor: isDarkMode ? '#424242' : '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDarkMode ? '#1890ff' : '#1890ff'
                  }}>
                    <CodeOutlined style={{ fontSize: 16 }} />
                  </div>
                }
                title={
                  <Space>
                  <Text strong>v{version.version}</Text>
                  {version.current && <Tag color="success">当前</Tag>}
                </Space>
                }
                description={`安装于 ${version.installedAt ? new Date(version.installedAt).toLocaleDateString() : '未知时间'}`}
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={<DownloadOutlined style={{ fontSize: 48, color: isDarkMode ? '#666' : '#ccc' }} />}
          description="未安装任何 Node.js 版本"
        />
      )}
    </Card>
  );

  // 渲染可用版本列表
  const renderAvailableVersions = () => {
    // 按主版本分组
    const groupedVersions = availableVersions.reduce((acc, version) => {
      const major = version.version.split('.')[0];
      if (!acc[major]) {
        acc[major] = [];
      }
      acc[major].push(version);
      return acc;
    }, {} as Record<string, NodeVersionInfo[]>);

    return (
      <Card
        title={
          <Space>
            <StarOutlined />
            <span>可用版本</span>
            <Badge count={Object.keys(groupedVersions).length} />
          </Space>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={loadNodeData}
          >
            刷新列表
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {Object.entries(groupedVersions)
            .sort(([a], [b]) => Number(b) - Number(a)) // 按主版本号排序（20->19->18...）
            .map(([majorVersion, versions]) => (
              <div key={majorVersion}>
                <Divider orientation="left">
                  <Text strong>Node.js v{majorVersion}</Text>
                </Divider>
                <Row gutter={[16, 16]}>
                  {versions.map((version) => (
                    <Col xs={24} sm={12} md={8} lg={6} xl={4} key={version.version}>
                      <Card
                        hoverable={!isVersionInstalled(version.version)}
                        style={{
                          border: isVersionInstalled(version.version) ? '2px solid #52c41a' : undefined,
                          background: isVersionInstalled(version.version) ?
                            (isDarkMode ? '#162312' : '#f6ffed') : undefined
                        }}
                        onClick={() => !isVersionInstalled(version.version) && installVersion(`v${version.version}`)}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Space>
                              <Text strong>v{version.version}</Text>
                              <Tag color={getTagColor(
                                version.version === latestVersion.replace('v', ''),
                                version.isLTS,
                                isVersionInstalled(version.version)
                              )}>
                                {getTagText(
                                  version.version === latestVersion.replace('v', ''),
                                  version.isLTS,
                                  isVersionInstalled(version.version)
                                )}
                              </Tag>
                            </Space>
                            {isVersionInstalled(version.version) && (
                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: isDarkMode ? '#a0a0a0' : '#666' }}>
                            发布日期: {version.releaseDate}
                          </div>
                          {version.npmVersion && (
                            <div style={{ fontSize: '12px', color: isDarkMode ? '#a0a0a0' : '#666' }}>
                              npm v{version.npmVersion}
                            </div>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
        </Space>
      </Card>
    );
  };

  // 渲染手动安装部分
  const renderCustomInstall = () => (
    <Card
      title={
        <Space>
          <PlusOutlined />
          <span>手动安装</span>
        </Space>
      }
    >
      <Alert
        message="安装提示"
        description={
          <Space direction="vertical">
            <Text>• 输入 "v20" 安装 v20 的最新版本</Text>
            <Text>• 输入 "v20.0.4" 安装指定版本</Text>
            <Text>• 输入 "20" 自动补全为 v20 的最新版本</Text>
          </Space>
        }
        type="info"
        showIcon
      />

      <Space.Compact style={{ width: '100%', marginTop: 16 }}>
        <Input
          placeholder="输入版本号，例如: v20, v20.0.4, 或 20"
          value={customVersionInput}
          onChange={(e) => setCustomVersionInput(e.target.value)}
          onPressEnter={handleInstallClick}
          disabled={isInstalling}
        />
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          disabled={!customVersionInput.trim() || isInstalling}
          onClick={handleInstallClick}
          loading={isInstalling}
        >
          安装
        </Button>
      </Space.Compact>

      {installationMessage && (
        <Alert
          message={installationMessage}
          type={installationMessage.includes('成功') ? 'success' : 'info'}
          style={{ marginTop: 16 }}
          showIcon
          action={
            installationMessage.includes('成功') && (
              <Button size="small" type="text" onClick={() => setInstallationMessage('')}>
                关闭
              </Button>
            )
          }
        />
      )}
    </Card>
  );

  const uninstallVersion = async (version: string) => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.executeCommand(`fnm uninstall ${version}`);
      if (result.success) {
        setSaveMessage(`${version} 卸载成功`);
        loadNodeData(); // 重新加载数据
      } else {
        setSaveMessage(`${version} 卸载失败`);
      }
    } catch (error) {
      console.error('卸载失败:', error);
      setSaveMessage(`${version} 卸载失败`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {renderCurrentVersionStatus()}
      {renderInstalledVersions()}
      {renderAvailableVersions()}
      {renderCustomInstall()}
    </div>
  );
};

export default NodeManager;