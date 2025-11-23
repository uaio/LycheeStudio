import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Empty,
  Tooltip,
  App as AntdApp,
  Divider,
  Table,
  Modal
} from 'antd';
import {
  AppstoreOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  LinkOutlined,
  PackageOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  ToolOutlined,
  SettingOutlined,
  ZapOutlined,
  ShieldCheckOutlined,
  RocketOutlined,
  StarOutlined,
  InfoCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Text, Paragraph, Title } = Typography;

// 声明 Electron API 类型
declare global {
  interface Window {
    electronAPI: {
      executeCommand: (command: string) => Promise<{ success: boolean; output?: string; error?: string }>;
    };
  }
}

interface NpmPackage {
  name: string;
  version: string;
  description?: string;
  homepage?: string;
  lastUpdated?: string;
  size?: string;
  isInstalled?: boolean;
}

interface RecommendedPackage {
  name: string;
  description: string;
  category: string;
  tags: string[];
  homepage: string;
  icon?: React.ReactNode;
  color?: string;
}

interface PackageManager {
  name: string;
  description: string;
  homepage: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
  installCommand: string;
}

const PackageManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean }> = ({ isDarkMode, collapsed = false }) => {
  // 直接在组件内使用 useApp 获取 message API
  const { message } = AntdApp.useApp();
  const [packages, setPackages] = useState<NpmPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [packageToInstall, setPackageToInstall] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 推荐的全局包
  const recommendedPackages: RecommendedPackage[] = [
    {
      name: 'typescript',
      description: 'TypeScript - JavaScript的超集，添加了类型系统',
      category: '开发工具',
      tags: ['TypeScript', '类型系统'],
      homepage: 'https://www.typescriptlang.org/',
      icon: <CodeOutlined />,
      color: '#007ACC'
    },
    {
      name: 'nodemon',
      description: '监控Node.js应用的变化自动重启',
      category: '开发工具',
      tags: ['监控', '自动重启'],
      homepage: 'https://nodemon.io/',
      icon: <ThunderboltOutlined />,
      color: '#76D04B'
    },
    {
      name: 'pm2',
      description: 'Node.js应用的进程管理器，支持负载均衡',
      category: '进程管理',
      tags: ['进程管理', '负载均衡', '集群'],
      homepage: 'https://pm2.keymetrics.io/',
      icon: <SettingOutlined />,
      color: '#2B2B2B'
    },
    {
      name: 'eslint',
      description: '可插拔的JavaScript和TypeScript代码检查工具',
      category: '代码质量',
      tags: ['代码检查', '质量保证'],
      homepage: 'https://eslint.org/',
      icon: <ShieldCheckOutlined />,
      color: '#4B32C3'
    },
    {
      name: 'prettier',
      description: '代码格式化工具，支持多种语言',
      category: '代码质量',
      tags: ['代码格式化', '代码风格'],
      homepage: 'https://prettier.io/',
      icon: <ToolOutlined />,
      color: '#F7B93E'
    },
    {
      name: '@types/node',
      description: 'Node.js的TypeScript类型定义',
      category: '类型定义',
      tags: ['TypeScript', '类型定义'],
      homepage: 'https://www.npmjs.com/package/@types/node',
      icon: <StarOutlined />,
      color: '#68A063'
    },
    {
      name: 'ts-node',
      description: '直接运行TypeScript文件，无需编译',
      category: '开发工具',
      tags: ['TypeScript', '直接运行'],
      homepage: 'https://typestrong.org/ts-node/',
      icon: <ZapOutlined />,
      color: '#3178C6'
    },
    {
      name: 'rimraf',
      description: '跨平台的删除工具，类似rm -rf',
      category: '系统工具',
      tags: ['删除', '跨平台'],
      homepage: 'https://www.npmjs.com/package/rimraf',
      icon: <DeleteOutlined />,
      color: '#CC3534'
    }
  ];

  // 包管理器推荐
  const packageManagers: PackageManager[] = [
    {
      name: 'pnpm',
      description: '快速的、节省磁盘空间的包管理器',
      homepage: 'https://pnpm.io/',
      features: ['快速安装', '节省磁盘空间', '严格的依赖管理', 'monorepo支持'],
      icon: <RocketOutlined />,
      color: '#F69220',
      installCommand: 'npm install -g pnpm'
    },
    {
      name: 'Yarn',
      description: '可靠、快速、安全的依赖管理工具',
      homepage: 'https://yarnpkg.com/',
      features: ['快速安装', '离线模式', '确定性安装', '工作空间'],
      icon: <PackageOutlined />,
      color: '#2C8EBB',
      installCommand: 'npm install -g yarn'
    }
  ];

  useEffect(() => {
    loadNpmPackages();
  }, []);

  const loadNpmPackages = async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.executeCommand('npm list -g --depth=0 --json');
      if (!result.success || !result.output) {
        throw new Error(result.error || '获取包列表失败');
      }

      const npmData = JSON.parse(result.output);
      const parsedPackages: NpmPackage[] = Object.keys(npmData.dependencies || {}).map((pkgName) => {
        const pkgData = npmData.dependencies[pkgName];
        return {
          name: pkgName,
          version: pkgData.version || 'unknown',
          description: '',
          isInstalled: true
        };
      });

      setPackages(parsedPackages);
    } catch (error) {
      console.error('获取 npm 包列表失败:', error);
      message.error('获取包列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const installPackageHandler = async (packageName: string) => {
    setIsLoading(true);
    try {
      const command = `npm install -g ${packageName}`;
      const result = await window.electronAPI.executeCommand(command);
      if (!result.success) {
        throw new Error(result.error || '安装失败');
      }

      message.success(`包 ${packageName} 安装成功！`);
      await loadNpmPackages();
    } catch (error) {
      console.error('安装失败:', error);
      message.error('安装失败，请检查包名和网络连接');
    } finally {
      setIsLoading(false);
      setPackageToInstall('');
    }
  };

  const uninstallPackage = async (packageName: string) => {
    setIsLoading(true);
    try {
      const command = `npm uninstall -g ${packageName}`;
      const result = await window.electronAPI.executeCommand(command);
      if (!result.success) {
        throw new Error(result.error || '卸载失败');
      }

      message.success(`包 ${packageName} 已卸载`);
      await loadNpmPackages();
    } catch (error) {
      console.error('卸载失败:', error);
      message.error('卸载失败');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isPackageInstalled = (packageName: string): boolean => {
    return packages.some(pkg => pkg.name === packageName);
  };

  // 使用 antd message 来显示提示信息

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 统计概览 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="全局包"
              value={packages.length}
              prefix={<PackageOutlined />}
              valueStyle={{ color: isDarkMode ? '#1890ff' : '#1890ff', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="包管理器"
              value="NPM"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: isDarkMode ? '#52c41a' : '#52c41a', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="系统状态"
              value="正常"
              prefix={<ShieldCheckOutlined />}
              valueStyle={{ color: isDarkMode ? '#faad14' : '#faad14', fontSize: '24px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 已安装包管理 */}
      <Card
        title={
          <Space>
            <AppstoreOutlined style={{ color: isDarkMode ? '#1890ff' : '#52c41a' }} />
            <span style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>已安装的全局包</span>
          </Space>
        }
        extra={
          <Space>
            <Input.Search
              placeholder="搜索包名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200 }}
              size="small"
            />
            <Button
              icon={<ReloadOutlined />}
              loading={isLoading}
              onClick={loadNpmPackages}
              title="刷新包列表"
              size="small"
            >
              刷新
            </Button>
          </Space>
        }
        style={{
          background: isDarkMode ? '#141414' : '#ffffff',
          borderRadius: '8px'
        }}
        styles={{ body: { padding: '16px' } }}
      >
        {filteredPackages.length > 0 ? (
          <Table
            dataSource={filteredPackages.map((pkg, index) => ({
              ...pkg,
              key: index
            }))}
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              showQuickJumper: true
            }}
            columns={[
              {
                title: '包名',
                dataIndex: 'name',
                key: 'name',
                render: (text: string) => (
                  <Space>
                    <AppstoreOutlined style={{ color: isDarkMode ? '#1890ff' : '#52c41a' }} />
                    <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                      {text}
                    </Text>
                  </Space>
                )
              },
              {
                title: '版本',
                dataIndex: 'version',
                key: 'version',
                width: 120,
                render: (text: string) => (
                  <Tag color="blue" size="small">v{text}</Tag>
                )
              },
              {
                title: '操作',
                key: 'actions',
                width: 120,
                render: (_, record: NpmPackage) => (
                  <Space size="small">
                    <Tooltip title="在 npmjs.com 查看详情">
                      <a
                        href={`https://www.npmjs.com/package/${record.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: isDarkMode ? '#1890ff' : '#1890ff' }}
                      >
                        <LinkOutlined />
                      </a>
                    </Tooltip>
                    <Popconfirm
                      title="确定要卸载这个包吗？"
                      onConfirm={() => uninstallPackage(record.name)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Tooltip title="卸载包">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
          />
        ) : (
          <Empty
            image={<PackageOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
            description={
              <span>
                {searchTerm ? '未找到匹配的包' : '当前没有安装任何全局包'}
              </span>
            }
          >
            <Text type="secondary">
              {searchTerm ? '尝试使用其他搜索关键词' : '下方推荐一些常用的全局开发包'}
            </Text>
          </Empty>
        )}
      </Card>

      {/* 推荐的全局包 */}
      <Card
        title={
          <Space>
            <StarOutlined style={{ color: isDarkMode ? '#faad14' : '#faad14' }} />
            <span style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>推荐的全局开发包</span>
          </Space>
        }
        style={{
          background: isDarkMode ? '#141414' : '#ffffff',
          borderRadius: '8px'
        }}
        styles={{ body: { padding: '16px' } }}
      >
        <Row gutter={[16, 16]}>
          {recommendedPackages.map((pkg) => {
            const isInstalled = isPackageInstalled(pkg.name);
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={pkg.name}>
                <Card
                  hoverable={!isInstalled}
                  size="small"
                  style={{
                    height: '100%',
                    border: isInstalled ? `1px solid ${isDarkMode ? '#52c41a' : '#52c41a'}` : undefined,
                    background: isInstalled
                      ? (isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.05)')
                      : undefined,
                    transition: 'all 0.3s ease'
                  }}
                  actions={[
                    <Tooltip title={`访问 ${pkg.name} 官网`}>
                      <a
                        href={pkg.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: pkg.color }}
                      >
                        <LinkOutlined />
                      </a>
                    </Tooltip>,
                    isInstalled ? null : (
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => installPackageHandler(pkg.name)}
                        loading={isLoading}
                      >
                        安装
                      </Button>
                    )
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: pkg.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}>
                        {pkg.icon}
                      </div>
                    }
                    title={
                      <Space direction="vertical" size="small">
                        <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                          {pkg.name}
                        </Text>
                        <Tag color={pkg.color} size="small">
                          {pkg.category}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Text
                        type="secondary"
                        style={{
                          fontSize: '12px',
                          lineHeight: '1.4',
                          color: isDarkMode ? '#a0a0a0' : '#666666'
                        }}
                      >
                        {pkg.description}
                      </Text>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* 包管理器推荐 */}
      <Card
        title={
          <Space>
            <RocketOutlined style={{ color: isDarkMode ? '#722ed1' : '#722ed1' }} />
            <span style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>包管理器推荐</span>
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: '12px' }}>
          除了NPM，还有这些优秀的包管理器
        </Text>
        }
        style={{
          background: isDarkMode ? '#141414' : '#ffffff',
          borderRadius: '8px'
        }}
        styles={{ body: { padding: '16px' } }}
      >
        <Row gutter={[16, 16]}>
          {packageManagers.map((pm) => (
            <Col xs={24} md={12} key={pm.name}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  border: `1px solid ${isDarkMode ? '#303030' : '#d9d9d9'}`,
                  transition: 'all 0.3s ease'
                }}
                actions={[
                  <Tooltip title={`访问 ${pm.name} 官网`}>
                    <a
                      href={pm.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: pm.color }}
                    >
                      <LinkOutlined style={{ marginRight: '8px' }} />
                      官网
                    </a>
                  </Tooltip>,
                  <Button
                    type="default"
                    size="small"
                    onClick={() => installPackageHandler(pm.name)}
                    loading={isLoading}
                  >
                    安装
                  </Button>
                ]}
              >
                <Card.Meta
                  avatar={
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: pm.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}>
                      {pm.icon}
                    </div>
                  }
                  title={
                    <Space direction="vertical" size="small">
                      <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                        {pm.name}
                      </Text>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: '11px',
                          color: pm.color,
                          background: isDarkMode ? 'rgba(114, 46, 209, 0.1)' : 'rgba(114, 46, 209, 0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {pm.installCommand}
                      </Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text
                        style={{
                          fontSize: '13px',
                          lineHeight: '1.4',
                          color: isDarkMode ? '#ffffff' : '#000000'
                        }}
                      >
                        {pm.description}
                      </Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          特性:
                        </Text>
                        <div style={{ marginTop: '4px' }}>
                          <Space wrap size="small">
                            {pm.features.map((feature) => (
                              <Tag
                                key={feature}
                                size="small"
                                color={pm.color}
                                style={{ fontSize: '10px' }}
                              >
                                {feature}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      </div>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 自定义安装 */}
      <Card
        title={
          <Space>
            <ToolOutlined style={{ color: isDarkMode ? '#13c2c2' : '#13c2c2' }} />
            <span style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>自定义安装</span>
          </Space>
        }
        style={{
          background: isDarkMode ? '#141414' : '#ffffff',
          borderRadius: '8px'
        }}
        styles={{ body: { padding: '16px' } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Text type="secondary">
            输入自定义包名进行全局安装，请确保包名正确且可访问
          </Text>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="例如：@types/react"
              value={packageToInstall}
              onChange={(e) => setPackageToInstall(e.target.value)}
              onPressEnter={() => packageToInstall && installPackageHandler(packageToInstall)}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={isLoading}
              disabled={!packageToInstall || isLoading}
              onClick={() => packageToInstall && installPackageHandler(packageToInstall)}
            >
              安装
            </Button>
          </Space.Compact>
        </Space>
      </Card>
    </Space>
  );
};

export default PackageManager;