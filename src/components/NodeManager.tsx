import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  Tag,
  List,
  Popconfirm,
  Row,
  Col,
  Empty,
  Alert,
  Badge,
  Descriptions,
  Table,
  Select,
  Pagination,
  App as AntdApp
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

const NodeManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean; isInstalling?: boolean }> = ({ isDarkMode, collapsed = false, isInstalling = false }) => {
  // 直接在组件内使用 useApp 获取 message API
  const { message } = AntdApp.useApp();
  const [currentVersion, setCurrentVersion] = useState<string>('');

    const [installedVersions, setInstalledVersions] = useState<NodeVersion[]>([]);
  const [availableVersions, setAvailableVersions] = useState<NodeReleaseInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customVersionInput, setCustomVersionInput] = useState('');
  const [installationMessage, setInstallationMessage] = useState('');
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState('');
  const [versionFilter, setVersionFilter] = useState<string>('all');
  const [expandedVersions, setExpandedVersions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // 每页显示5个大版本

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
  }, [saveMessage, message]);

  const loadNodeData = async () => {
    setIsLoading(true);
    try {
      // 1. 获取已安装版本列表 (使用 fnm list)
      const listResult = await window.electronAPI.executeCommand('fnm list');

      if (listResult.success && listResult.output) {
        // 2. 从 fnm list 中解析默认版本和所有已安装版本
        const { defaultVersion, installedVersions } = await parseFnmList(listResult.output);

        setCurrentVersion(defaultVersion);
        setInstalledVersions(installedVersions);
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

      // 过滤出有用的版本信息（从v10开始，包含LTS和最新版本）
      const filteredReleases = releases.filter(release => {
        const majorVersion = parseInt(release.version.substring(1).split('.')[0]);
        return majorVersion >= 10; // 包含所有v10及以上的版本
      });

      setAvailableVersions(filteredReleases);

      // 设置最新版本和当前LTS
      const latest = releases[0];

      setLatestVersion(latest.version);

    } catch (error) {
      console.error('获取版本信息失败:', error);
      // 如果网络请求失败，使用模拟数据
      setAvailableVersions(generateMockVersions());
      setLatestVersion('v25.2.1');
    }
  };

  const parseFnmList = async (output: string): Promise<{ defaultVersion: string; installedVersions: NodeVersion[] }> => {
    const lines = output.split('\n').filter(line => line.trim());
    const versions: NodeVersion[] = [];
    let defaultVersion = '';

    for (const line of lines) {
      // 解析格式：* v24.8.0 default 或 v20.18.0 或 * system
      // 注意：在这个版本的fnm中，* 表示已安装，不代表当前版本
      const versionMatch = line.match(/v\d+\.\d+\.\d+/);

      if (versionMatch) {
        const version = versionMatch[0];
        const isDefault = line.includes('default');

        // 记录默认版本
        if (isDefault) {
          defaultVersion = version;
        }

        let installedAt = new Date().toISOString(); // 默认值

        try {
          // 尝试获取真实的安装时间 - 使用固定的路径格式
          const installedPath = `/Users/anwan/.fnm/node-versions/${version}`;
          const installResult = await window.electronAPI.executeCommand(`stat -f %m "${installedPath}" 2>/dev/null || echo "0"`);
          const installTime = installResult.success && installResult.output && installResult.output.trim() !== "0"
            ? new Date(parseInt(installResult.output.trim()) * 1000).toISOString()
            : installedAt;

          versions.push({
            version,
            current: isDefault, // 默认版本就是当前版本
            default: isDefault,
            installed: true,
            installedAt: installTime
          });
        } catch (error) {
          versions.push({
            version,
            current: isDefault, // 默认版本就是当前版本
            default: isDefault,
            installed: true,
            installedAt
          });
        }
      }
    }

    return { defaultVersion, installedVersions: versions };
  };

  const generateMockVersions = (): NodeReleaseInfo[] => {
    const versions: NodeReleaseInfo[] = [];
    const majorVersions = [25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10];

    majorVersions.forEach(major => {
      // 为每个大版本生成多个小版本
      for (let minor = 0; minor <= 9; minor++) {
        for (let patch = 0; patch <= 2; patch++) {
          // 只生成合理的版本组合
          if (minor === 0 && patch > 0) continue;

          versions.push({
            version: `v${major}.${minor}.${patch}`,
            date: new Date(Date.now() - (major * 100 + minor * 10 + patch) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            npm: `${9 - minor}.${patch}.0`,
            lts: major % 2 === 0 && minor === 0 && patch === 0 ? `LTS${major}` : undefined,
            security: minor <= 1 && patch === 0,
            modules: 120 + major
          });
        }
      }
    });

    // 按版本号降序排序
    return versions.sort((a, b) => b.version.localeCompare(a.version));
  };

  const switchToVersion = async (version: string) => {
    setIsLoading(true);
    try {
      // 使用 fnm default 设置全局默认版本
      const result = await window.electronAPI.executeCommand(`/bin/zsh -i -c 'fnm default ${version}'`);

      if (result.success) {
        setSaveMessage(`已设置全局默认版本为 ${version}`);

        // 重新加载数据以更新当前版本状态
        setTimeout(() => {
          loadNodeData();
          // 通知首页更新状态（通过全局事件）
          window.dispatchEvent(new CustomEvent('nodeVersionChanged', { detail: { version } }));
        }, 1500); // 增加延迟确保环境变量完全生效
      } else {
        // 如果 zsh 失败，尝试直接执行 fnm default 命令
        const fallbackResult = await window.electronAPI.executeCommand(`fnm default ${version}`);
        if (fallbackResult.success) {
          setSaveMessage(`已设置全局默认版本为 ${version}`);
          setTimeout(() => {
            loadNodeData();
            // 通知首页更新状态
            window.dispatchEvent(new CustomEvent('nodeVersionChanged', { detail: { version } }));
          }, 1500);
        } else {
          setSaveMessage(`设置默认版本失败: ${fallbackResult.error || '未知错误'}`);
        }
      }
    } catch (error) {
      console.error('设置默认版本失败:', error);
      setSaveMessage(`设置默认版本失败: ${error}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // 切换折叠状态
  const toggleExpanded = (major: string) => {
    setExpandedVersions(prev =>
      prev.includes(major)
        ? prev.filter(v => v !== major)
        : [...prev, major]
    );
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
      // 在 zsh 环境中使用 fnm 安装指定版本，确保环境变量正确设置
      const result = await window.electronAPI.executeCommand(`/bin/zsh -i -c 'fnm install ${versionToInstall}'`);
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
                    升级
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
    // 优先显示默认版本，其余按版本号从高到低排序
    const defaultVersion = installedVersions.find(v => v.default);
    const otherVersions = [...installedVersions].filter(v => !v.default).sort((a, b) => {
      const aVersion = a.version.substring(1).split('.').map(Number);
      const bVersion = b.version.substring(1).split('.').map(Number);

      for (let i = 0; i < 3; i++) {
        const aNum = aVersion[i] || 0;
        const bNum = bVersion[i] || 0;
        if (aNum !== bNum) return bNum - aNum; // 降序排列
      }
      return 0;
    });

    // 将默认版本放在第一位，其余版本按顺序排列
    const sortedVersions = defaultVersion ? [defaultVersion, ...otherVersions] : otherVersions;

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
          <div className="custom-scrollbar"
               style={{
                 maxHeight: '400px',    // 固定最大高度
                 overflowY: 'auto',      // 垂直滚动
                 overflowX: 'hidden',    // 隐藏水平滚动
                 paddingRight: '8px'     // 为滚动条预留空间
               }}>
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
                        {isDefaultVersion ? '默认' : canSwitch ? '设为默认' : '默认'}
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
          </div>
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
    // 过滤和分组版本
    const getFilteredVersions = () => {
      let filtered = availableVersions;

      switch (versionFilter) {
        case 'lts':
          filtered = filtered.filter(v => v.lts);
          break;
        case 'security':
          filtered = filtered.filter(v => v.security);
          break;
        default:
          break;
      }

      // 按主版本分组
      const grouped = filtered.reduce((acc, version) => {
        const major = version.version.substring(1).split('.')[0];
        if (!acc[major]) {
          acc[major] = [];
        }
        acc[major].push(version);
        return acc;
      }, {} as Record<string, NodeReleaseInfo[]>);

      // 对每个主版本内的版本按新版本排序
      Object.keys(grouped).forEach(major => {
        grouped[major].sort((a, b) => b.version.localeCompare(a.version));
      });

      return grouped;
    };

    const groupedVersions = getFilteredVersions();
    const versionGroups = Object.keys(groupedVersions)
      .map(major => ({
        major,
        versions: groupedVersions[major]
      }))
      .sort((a, b) => Number(b.major) - Number(a.major)); // 按主版本号降序

    // 分页处理
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentGroups = versionGroups.slice(startIndex, endIndex);

    // 内部表格列定义
    const innerColumns = [
      {
        title: '版本',
        dataIndex: 'version',
        key: 'version',
        width: 120,
        render: (version: string, record: NodeReleaseInfo) => (
          <Space>
            <Text strong style={{
              color: record.version === latestVersion ? '#1890ff' : undefined,
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
        key: 'type',
        width: 100,
        render: (record: NodeReleaseInfo) => (
          <Space wrap size="small">
            {record.lts ? <Tag color="gold" size="small">LTS</Tag> : <Tag color="default" size="small">Current</Tag>}
            {record.security && <Tag color="red" size="small">安全</Tag>}
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
              <Tag color="success" size="small">已安装</Tag>
              {installedVersions.find(v => v.version === record.version)?.current && (
                <Tag color="blue" size="small">当前</Tag>
              )}
            </Space>
          ) : (
            <Tag type="nounderline" size="small">未安装</Tag>
          )
        ),
      },
      {
        title: '发布时间',
        dataIndex: 'date',
        key: 'date',
        width: 100,
        render: (date: string) => (
          <Text style={{ fontSize: '11px', color: isDarkMode ? '#a0a0a0' : '#666' }}>
            {date}
          </Text>
        ),
      },
      {
        title: 'npm',
        dataIndex: 'npm',
        key: 'npm',
        width: 60,
        render: (npm: string) => (
          <Text style={{ fontSize: '11px', color: isDarkMode ? '#a0a0a0' : '#666' }}>
            v{npm}
          </Text>
        ),
      },
      {
        title: '操作',
        key: 'actions',
        width: 80,
        render: (record: NodeReleaseInfo) => (
          <Space>
            {isVersionInstalled(record.version) ? (
              <Button
                size="small"
                type="primary"
                ghost
                onClick={() => switchToVersion(record.version)}
                loading={isLoading}
              >
                设为默认
              </Button>
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
            <Badge count={versionGroups.length} />
          </Space>
        }
        extra={
          <Space>
            <Select
              value={versionFilter}
              onChange={(value) => {
                setVersionFilter(value);
                setCurrentPage(1); // 重置到第一页
              }}
              style={{ width: 120 }}
              size="small"
            >
              <Select.Option value="all">全部版本</Select.Option>
              <Select.Option value="lts">LTS 版本</Select.Option>
              <Select.Option value="security">安全更新</Select.Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchLatestVersions();
                setCurrentPage(1); // 重置到第一页
              }}
              loading={isLoading}
              size="small"
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {currentGroups.map((group) => {
            const isExpanded = expandedVersions.includes(group.major);
            const hasInstalledVersions = group.versions.some(v => isVersionInstalled(v.version));
            const latestInGroup = group.versions[0]; // 最多显示5个版本

            return (
              <Card
                key={group.major}
                size="small"
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Text strong>Node.js v{group.major}</Text>
                      <Tag color={hasInstalledVersions ? 'green' : 'default'} size="small">
                        {group.versions.length} 个版本
                      </Tag>
                      {hasInstalledVersions && (
                        <Tag color="success" size="small">
                          <CheckCircleOutlined /> 已安装
                        </Tag>
                      )}
                    </Space>
                    <Button
                      type="text"
                      size="small"
                      icon={isExpanded ? '▲' : '▼'}
                      onClick={() => toggleExpanded(group.major)}
                    >
                      {isExpanded ? '收起' : '展开'}
                    </Button>
                  </div>
                }
                style={{
                  border: hasInstalledVersions ? '1px solid #52c41a' : undefined,
                  background: hasInstalledVersions ?
                    (isDarkMode ? '#162312' : '#f6ffed') : undefined
                }}
              >
                {/* 精简展示 - 只显示最新版本 */}
                {!isExpanded && (
                  <div style={{ padding: '8px 0' }}>
                    <Row gutter={[16, 8]} align="middle">
                      <Col span={6}>
                        <Space>
                          <Text strong style={{
                            color: latestInGroup.version === latestVersion ? '#1890ff' : undefined
                          }}>
                            {latestInGroup.version}
                          </Text>
                          {latestInGroup.version === latestVersion && (
                            <Tag color="blue" size="small">最新</Tag>
                          )}
                        </Space>
                      </Col>
                      <Col span={8}>
                        <Space wrap size="small">
                          {latestInGroup.lts ? <Tag color="gold" size="small">LTS</Tag> : <Tag color="default" size="small">Current</Tag>}
                          {latestInGroup.security && <Tag color="red" size="small">安全</Tag>}
                          {isVersionInstalled(latestInGroup.version) && (
                            <Tag color="success" size="small">已安装</Tag>
                          )}
                        </Space>
                      </Col>
                      <Col span={6}>
                        <Text style={{ fontSize: '12px', color: isDarkMode ? '#a0a0a0' : '#666' }}>
                          {latestInGroup.date} • npm v{latestInGroup.npm}
                        </Text>
                      </Col>
                      <Col span={4} style={{ textAlign: 'right' }}>
                        {isVersionInstalled(latestInGroup.version) ? (
                          <Button
                            size="small"
                            type="primary"
                            ghost
                            onClick={() => switchToVersion(latestInGroup.version)}
                            loading={isLoading}
                          >
                            设为默认
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={() => installVersion(latestInGroup.version)}
                            loading={isInstalling && installationMessage.includes(latestInGroup.version)}
                          >
                            安装
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </div>
                )}

                {/* 展开的详细表格 */}
                {isExpanded && (
                  <Table
                    dataSource={group.versions.slice(0, 10).map(v => ({ ...v, key: v.version }))}
                    columns={innerColumns}
                    size="small"
                    pagination={false}
                    scroll={{ x: 400 }}
                    showHeader={false}
                    style={{ marginTop: isExpanded ? 16 : 0 }}
                  />
                )}
              </Card>
            );
          })}

          {/* 分页控件 */}
          {versionGroups.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 20
            }}>
              <Pagination
                current={currentPage}
                total={versionGroups.length}
                pageSize={pageSize}
                showSizeChanger
                onChange={(page, size) => {
                  setCurrentPage(page);
                  if (size !== pageSize) {
                    setPageSize(size);
                  }
                }}
                pageSizeOptions={['5', '10', '20']}
                size="small"
              />
            </div>
          )}

          {/* 无版本提示 */}
          {versionGroups.length === 0 && (
            <Empty
              description={
                <Text style={{ color: isDarkMode ? '#a0a0a0' : '#666' }}>
                  当前筛选条件下没有可用版本
                </Text>
              }
              style={{ padding: '30px 0' }}
            >
              <Button type="link" onClick={() => {
                setVersionFilter('all');
                setCurrentPage(1);
              }}>
                显示全部版本
              </Button>
            </Empty>
          )}
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

      {/* Node.js 版本管理说明 */}
      <Alert
        message="Node.js 版本管理"
        description="基于 fnm 进行版本管理，新终端会话将自动使用设置的默认版本。"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        closable
      />

      {renderCurrentVersionStatus()}
      {renderInstalledVersions()}
      {renderAvailableVersions()}
      {renderCustomInstall()}
    </div>
  );
};

export default NodeManager;