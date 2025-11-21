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
  Empty,
  Alert,
  Badge,
  Descriptions,
  Table,
  Select
} from 'antd';
import {
  CodeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  AppstoreOutlined,
  StarOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// 声明 Electron API 类型
declare global {
  interface Window {
    electronAPI: {
      executeCommand: (command: string) => Promise<{ success: boolean; output?: string; error?: string }>;
    };
  }
}

interface NodeVersion {
  version: string;  // v20.18.0 格式
  current?: boolean;
  default?: boolean;
  installed: boolean;
  path?: string;
  installedAt?: string;
}

interface NodeReleaseInfo {
  version: string;
  date: string;
  npm: string;
  lts?: string;
  security: boolean;
  modules: number;
}

const NodeManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean }> = ({ isDarkMode, collapsed = false }) => {
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [installedVersions, setInstalledVersions] = useState<NodeVersion[]>([]);
  const [availableVersions, setAvailableVersions] = useState<NodeReleaseInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customVersionInput, setCustomVersionInput] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installationMessage, setInstallationMessage] = useState('');
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [currentLTS, setCurrentLTS] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState('');
  const [versionFilter, setVersionFilter] = useState<string>('all');

  useEffect(() => {
    loadNodeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setCurrentVersion(version);
      }

      // 2. 获取已安装版本列表 (使用 fnm list)
      const listResult = await window.electronAPI.executeCommand('fnm list');
      if (listResult.success && listResult.output) {
        const installed = await parseFnmList(listResult.output);
        setInstalledVersions(installed);
      }

      // 3. 获取最新版本信息
      await fetchLatestVersions();

    } catch (error) {
      console.error('加载Node数据失败:', error);
      message.error('加载Node.js数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestVersions = async () => {
    try {
      // 获取官方发布信息
      const response = await fetch('https://nodejs.org/dist/index.json');
      const releases: NodeReleaseInfo[] = await response.json();

      // 过滤出有用的版本信息（从v16开始，包含LTS和最新版本）
      const filteredReleases = releases.filter(release => {
        const majorVersion = parseInt(release.version.substring(1).split('.')[0]);
        return majorVersion >= 16 && (release.lts || !release.lts);
      }).slice(0, 50); // 取前50个版本

      setAvailableVersions(filteredReleases);

      // 设置最新版本和当前LTS
      const latest = releases[0];
      const currentLtsVersion = releases.find(r => r.lts && !r.version.includes('rc'));

      setLatestVersion(latest.version);
      if (currentLtsVersion) {
        setCurrentLTS(currentLtsVersion.version);
      }

    } catch (error) {
      console.error('获取版本信息失败:', error);
      // 如果网络请求失败，使用模拟数据
      setAvailableVersions(generateMockVersions());
      setLatestVersion('v25.2.1');
      setCurrentLTS('v24.11.1');
    }
  };

  const parseFnmList = async (output: string): Promise<NodeVersion[]> => {
    const lines = output.split('\n').filter(line => line.trim());
    const versions: NodeVersion[] = [];

    for (const line of lines) {
      // 解析格式：* v24.8.0 default 或 v20.18.0
      const isCurrent = line.includes('*');
      const isDefault = line.includes('default');
      const versionMatch = line.match(/v\d+\.\d+\.\d+/);

      if (versionMatch) {
        const version = versionMatch[0];
        let installedAt = new Date().toISOString(); // 默认值

        try {
          // 尝试获取真实的安装时间
          const fnmDirResult = await window.electronAPI.executeCommand('echo $FNM_DIR');
          if (fnmDirResult.success && fnmDirResult.output) {
            const fnmDir = fnmDirResult.output.trim();
            const versionPath = `${fnmDir}/node-versions/${version}`;

            // 尝试检测操作系统并使用正确的 stat 命令格式
            // 先尝试 macOS 格式，如果失败再尝试 Linux 格式
            let statCommand = '';

            // 首先尝试 macOS 格式 (stat -f %m)
            statCommand = `stat -f %m "${versionPath}" 2>/dev/null || echo "0"`;
            let statResult = await window.electronAPI.executeCommand(statCommand);

            // 如果 macOS 格式失败，尝试 Linux 格式 (stat -c %Y)
            if ((!statResult.success || statResult.output.trim() === "0") &&
                statResult.error && statResult.error.includes("illegal option")) {
              statCommand = `stat -c %Y "${versionPath}" 2>/dev/null || echo "0"`;
              statResult = await window.electronAPI.executeCommand(statCommand);
            }

            // 使用上面已经获取的 statResult
            if (statResult.success && statResult.output) {
              const timestampStr = statResult.output.trim();
              const timestamp = parseInt(timestampStr) * 1000; // 转换为毫秒
              if (timestamp > 0 && !isNaN(timestamp)) {
                installedAt = new Date(timestamp).toISOString();
                console.log(`版本 ${version} 的安装时间: ${installedAt}`);
              } else {
                console.warn(`无法解析版本 ${version} 的时间戳: ${timestampStr}`);
              }
            } else {
              console.warn(`stat 命令执行失败，版本 ${version}:`, statResult.error);
            }
          } else {
            console.warn('无法获取 FNM_DIR 环境变量:', fnmDirResult.error);
          }
        } catch (error) {
          console.warn('获取安装时间时发生错误:', error);
          // 使用默认值
        }

        versions.push({
          version,
          current: isCurrent,
          default: isDefault,
          installed: true,
          installedAt
        });
      }
    }

    return versions;
  };

  const generateMockVersions = (): NodeReleaseInfo[] => {
    const versions: NodeReleaseInfo[] = [];
    const majorVersions = [25, 24, 23, 22, 21, 20, 19, 18, 17, 16];

    majorVersions.forEach(major => {
      for (let minor = 0; minor <= 2; minor++) {
        versions.push({
          version: `v${major}.${10 - minor}.0`,
          date: new Date(Date.now() - (major * 100 + minor * 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          npm: `${10 - minor}.0.0`,
          lts: major % 2 === 0 && minor === 0 ? `LTS${major}` : undefined,
          security: minor === 0,
          modules: 120 + major
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
        setCurrentVersion(version);
        setInstalledVersions(prev => prev.map(v => ({
          ...v,
          current: v.version === version
        })));
        setSaveMessage(`已切换到 ${version}`);
      } else {
        setSaveMessage(`切换到 ${version} 失败: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('切换版本失败:', error);
      setSaveMessage(`切换到 ${version} 失败`);
    } finally {
      setIsLoading(false);
    }
  };

  const installVersion = async (versionInput: string) => {
    let versionToInstall = versionInput;

    // 处理版本输入
    if (!versionInput.startsWith('v')) {
      if (versionInput.match(/^\d+$/)) {
        // 输入的是主版本号，找到该版本的最新版本
        const latestOfMajor = availableVersions
          .filter(v => v.version.startsWith(`v${versionInput}.`))
          .sort((a, b) => b.version.localeCompare(a.version))[0];
        if (latestOfMajor) {
          versionToInstall = latestOfMajor.version;
        } else {
          versionToInstall = `v${versionInput}.0.0`;
        }
      } else {
        versionToInstall = `v${versionInput}`;
      }
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

  const getVersionType = (version: string): string => {
    const releaseInfo = availableVersions.find(r => r.version === version);
    if (releaseInfo?.lts) {
      return `稳定版 (LTS)`;
    }
    return '非LTS';
  };

  const isNewerThan = (version1: string, version2: string): boolean => {
    const v1 = version1.substring(1).split('.').map(Number);
    const v2 = version2.substring(1).split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if ((v1[i] || 0) > (v2[i] || 0)) return true;
      if ((v1[i] || 0) < (v2[i] || 0)) return false;
    }
    return false;
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
            <Title level={4} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
              {currentVersion}
            </Title>
          </Descriptions.Item>
          <Descriptions.Item label="版本类型">
            <Space>
              <Tag color="blue">{getVersionType(currentVersion)}</Tag>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="安装路径">
            <Space>
              <EnvironmentOutlined />
              <Text code style={{ fontSize: '12px' }}>~/.fnm/node-versions</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="最新版本">
            <Space>
              <Text>{latestVersion || '检查中...'}</Text>
              {latestVersion && isNewerThan(latestVersion, currentVersion) && (
                <Button
                  type="primary"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => installVersion(latestVersion)}
                >
                  升级到最新
                </Button>
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
  const renderInstalledVersions = () => {
    // 按版本号从高到低排序
    const sortedVersions = [...installedVersions].sort((a, b) => {
      const aVersion = a.version.substring(1).split('.').map(Number);
      const bVersion = b.version.substring(1).split('.').map(Number);

      for (let i = 0; i < 3; i++) {
        const aNum = aVersion[i] || 0;
        const bNum = bVersion[i] || 0;
        if (aNum !== bNum) return bNum - aNum; // 降序排列
      }
      return 0;
    });

    return (
      <Card
        title={
          <Space>
            <CheckCircleOutlined />
            <span>已安装版本</span>
            <Badge count={installedVersions.length} />
          </Space>
        }
      >
        {sortedVersions.length > 0 ? (
          <List
            dataSource={sortedVersions}
            renderItem={(version) => {
              const isDefaultVersion = version.default;
              const canSwitch = !isDefaultVersion;

              return (
                <List.Item
                  actions={[
                    <Button
                      type={isDefaultVersion ? "primary" : "default"}
                      icon={<AppstoreOutlined />}
                      onClick={() => canSwitch && switchToVersion(version.version)}
                      loading={isLoading}
                      disabled={!canSwitch}
                    >
                      {isDefaultVersion ? '使用中' : canSwitch ? '设置' : '使用中'}
                    </Button>,
                    <Popconfirm
                      title="确定要卸载这个版本吗？"
                      description="卸载后需要重新下载"
                      onConfirm={() => uninstallVersion(version.version)}
                      okText="确定"
                      cancelText="取消"
                      disabled={isDefaultVersion}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        disabled={isDefaultVersion}
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
                        <Text strong>{version.version}</Text>
                        {isDefaultVersion && <Tag color="warning">默认</Tag>}
                      </Space>
                    }
                    description={`${getVersionType(version.version)} • 安装于 ${version.installedAt ? new Date(version.installedAt).toLocaleDateString() : '未知时间'}`}
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty
            image={<DownloadOutlined style={{ fontSize: 48, color: isDarkMode ? '#666' : '#ccc' }} />}
            description="未安装任何 Node.js 版本"
          />
        )}
      </Card>
    );
  };

  // 渲染可用版本列表
  const renderAvailableVersions = () => {
    // 过滤版本
    const getFilteredVersions = () => {
      switch (versionFilter) {
        case 'lts':
          return availableVersions.filter(v => v.lts);
        case 'latest':
          return availableVersions.filter((v, i, arr) => {
            const major = v.version.substring(1).split('.')[0];
            return !arr.find((item, index) =>
              index < i && item.version.substring(1).split('.')[0] === major
            );
          });
        case 'security':
          return availableVersions.filter(v => v.security);
        default:
          return availableVersions;
      }
    };

    const filteredVersions = getFilteredVersions();

    // 表格列定义
    const columns = [
      {
        title: '版本',
        dataIndex: 'version',
        key: 'version',
        width: 120,
        render: (version: string, record: NodeReleaseInfo) => (
          <Space>
            <Text strong style={{
              color: record.version === latestVersion ? '#1890ff' : undefined,
              fontSize: record.version === latestVersion ? '14px' : '13px'
            }}>
              {version}
            </Text>
            {record.version === latestVersion && (
              <Tag color="blue" size="small">最新</Tag>
            )}
          </Space>
        ),
      },
      {
        title: '类型',
        dataIndex: 'lts',
        key: 'type',
        width: 100,
        render: (lts: string, record: NodeReleaseInfo) => (
          <Space wrap size="small">
            {lts ? <Tag color="gold">LTS</Tag> : <Tag color="default">Current</Tag>}
            {record.security && <Tag color="red">安全</Tag>}
          </Space>
        ),
      },
      {
        title: '状态',
        key: 'status',
        width: 100,
        render: (record: NodeReleaseInfo) => (
          isVersionInstalled(record.version) ? (
            <Space>
              <Tag color="success">
                <CheckCircleOutlined /> 已安装
              </Tag>
              {installedVersions.find(v => v.version === record.version)?.current && (
                <Tag color="blue">当前</Tag>
              )}
              {installedVersions.find(v => v.version === record.version)?.default && (
                <Tag color="green">默认</Tag>
              )}
            </Space>
          ) : (
            <Tag type="nounderline">未安装</Tag>
          )
        ),
      },
      {
        title: '发布时间',
        dataIndex: 'date',
        key: 'date',
        width: 120,
        render: (date: string) => (
          <Text style={{ fontSize: '12px', color: isDarkMode ? '#a0a0a0' : '#666' }}>
            {date}
          </Text>
        ),
      },
      {
        title: 'npm 版本',
        dataIndex: 'npm',
        key: 'npm',
        width: 80,
        render: (npm: string) => (
          <Text style={{ fontSize: '12px', color: isDarkMode ? '#a0a0a0' : '#666' }}>
            v{npm}
          </Text>
        ),
      },
      {
        title: '模块',
        dataIndex: 'modules',
        key: 'modules',
        width: 80,
        render: (modules: number) => (
          <Text style={{ fontSize: '12px', color: isDarkMode ? '#a0a0a0' : '#666' }}>
            {modules}
          </Text>
        ),
      },
      {
        title: '操作',
        key: 'actions',
        width: 100,
        render: (record: NodeReleaseInfo) => (
          <Space>
            {isVersionInstalled(record.version) ? (
              !installedVersions.find(v => v.version === record.version)?.default && (
                <Button
                  size="small"
                  type="primary"
                  ghost
                  onClick={() => switchToVersion(record.version)}
                  loading={isLoading}
                >
                  使用
                </Button>
              )
            ) : (
              <Button
                size="small"
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => installVersion(record.version)}
                loading={isInstalling && installationMessage.includes(record.version)}
              >
                安装
              </Button>
            )}
          </Space>
        ),
      },
    ];

    return (
      <Card
        title={
          <Space>
            <StarOutlined />
            <span>可用版本</span>
            <Badge count={filteredVersions.length} />
          </Space>
        }
        extra={
          <Space>
            <Select
              value={versionFilter}
              onChange={setVersionFilter}
              style={{ width: 120 }}
              size="small"
            >
              <Select.Option value="all">全部版本</Select.Option>
              <Select.Option value="lts">LTS 版本</Select.Option>
              <Select.Option value="latest">各版本最新</Select.Option>
              <Select.Option value="security">安全更新</Select.Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchLatestVersions}
              loading={isLoading}
              size="small"
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={filteredVersions.map(v => ({ ...v, key: v.version }))}
          columns={columns}
          size="small"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 个版本`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 600 }}
          rowClassName={(record) => {
            if (isVersionInstalled(record.version)) {
              return record.default ? 'table-row-default' : 'table-row-installed';
            }
            return '';
          }}
          style={{
            '.table-row-installed': {
              backgroundColor: isDarkMode ? '#162312' : '#f6ffed',
            },
            '.table-row-default': {
              backgroundColor: isDarkMode ? '#0d2818' : '#d9f7be',
            }
          }}
        />
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
            <Text>• 输入 "20" 安装 v20 的最新版本</Text>
            <Text>• 输入 "v20.18.0" 安装指定版本</Text>
            <Text>• 输入 "18" 安装 v18 的最新版本</Text>
          </Space>
        }
        type="info"
        showIcon
      />

      <Space.Compact style={{ width: '100%', marginTop: 16 }}>
        <Input
          placeholder="输入版本号，例如: 20, v20.18.0, 或 18"
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
        setSaveMessage(`${version} 卸载失败: ${result.error || '未知错误'}`);
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