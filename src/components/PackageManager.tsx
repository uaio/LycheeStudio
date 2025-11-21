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
  message,
  Alert,
  Popconfirm,
  Empty,
  Tooltip
} from 'antd';
import {
  AppstoreOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  LinkOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

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
}

const PackageManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean }> = ({ isDarkMode, collapsed = false }) => {
  const [packages, setPackages] = useState<NpmPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [packageToInstall, setPackageToInstall] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
      const parsedPackages: NpmPackage[] = Object.keys(npmData.dependencies || {}).map((pkgName) => ({
        name: pkgName,
        version: npmData.dependencies[pkgName].version || 'unknown',
        description: '',
      }));

      setPackages(parsedPackages);
    } catch (error) {
      console.error('获取 npm 包列表失败:', error);
      setSaveMessage('获取包列表失败');
      setTimeout(() => setSaveMessage(''), 3000);
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

      setSaveMessage(`包 ${packageName} 安装成功！`);
      setTimeout(() => setSaveMessage(''), 3000);
      await loadNpmPackages();
    } catch (error) {
      console.error('安装失败:', error);
      setSaveMessage('安装失败，请检查包名和网络连接');
      setTimeout(() => setSaveMessage(''), 3000);
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

      setSaveMessage(`包 ${packageName} 已卸载`);
      setTimeout(() => setSaveMessage(''), 3000);
      await loadNpmPackages();
    } catch (error) {
      console.error('卸载失败:', error);
      setSaveMessage('卸载失败');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const quickInstallPackages = ['typescript', 'nodemon', 'pm2', 'eslint', 'prettier', 'ts-node', '@types/node'];

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

  return (
    <div style={{
      marginLeft: collapsed ? '80px' : '200px',
      height: 'calc(100vh - 38px)',
      overflow: 'hidden',
    }}>
      <div style={{
        paddingTop: '32px',
        paddingLeft: '32px',
        paddingBottom: '32px',
        paddingRight: '40px',
        height: '100%',
        overflowY: 'auto',
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 统计卡片 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="全局包"
                  value={packages.length}
                  prefix={<AppstoreOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="包管理器"
                  value="NPM"
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

      {/* 安装新包 */}
          <Card
            title={
              <Space>
                <DownloadOutlined />
                <span>安装全局包</span>
              </Space>
            }
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="输入要安装的包名，例如：typescript"
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

              {/* 快速安装推荐 */}
              <div>
                <Text strong>常用开发工具：</Text>
                <div style={{ marginTop: '8px' }}>
                  <Space wrap>
                    {quickInstallPackages.map((pkg) => (
                      <Button
                        key={pkg}
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => installPackageHandler(pkg)}
                        loading={isLoading}
                        title={`安装 ${pkg}`}
                      >
                        {pkg}
                      </Button>
                    ))}
                  </Space>
                </div>
              </div>
            </Space>
          </Card>

      {/* 已安装包列表 */}
          <Card
            title={
              <Space>
                <AppstoreOutlined />
                <span>已安装的全局包 ({packages.length})</span>
              </Space>
            }
            extra={
              <Space>
                <Input.Search
                  placeholder="搜索包名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: 200 }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  loading={isLoading}
                  onClick={loadNpmPackages}
                  title="刷新包列表"
                >
                  刷新
                </Button>
              </Space>
            }
          >
            {filteredPackages.length > 0 ? (
              <Row gutter={[16, 16]}>
                {filteredPackages.map((pkg, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card
                      size="small"
                      hoverable
                      actions={[
                        <Tooltip title="在 npmjs.com 查看包详情">
                          <a
                            href={`https://www.npmjs.com/package/${pkg.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'inherit' }}
                          >
                            <LinkOutlined />
                          </a>
                        </Tooltip>,
                        <Popconfirm
                          title="确定要卸载这个包吗？"
                          onConfirm={() => uninstallPackage(pkg.name)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Tooltip title="卸载包">
                            <DeleteOutlined style={{ color: '#ff4d4f' }} />
                          </Tooltip>
                        </Popconfirm>
                      ]}
                    >
                      <Card.Meta
                        avatar={<AppstoreOutlined style={{ fontSize: '20px' }} />}
                        title={
                          <Space>
                            <span>{pkg.name}</span>
                            <Tag color="blue">v{pkg.version}</Tag>
                          </Space>
                        }
                        description="全局安装的 npm 包，点击查看详情和文档"
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                image={<AppstoreOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                description={
                  <span>
                    {searchTerm ? '未找到匹配的包' : '未安装全局包'}
                  </span>
                }
              >
                <Text type="secondary">
                  {searchTerm ? '尝试使用其他搜索关键词' : '使用上方输入框安装需要的全局包'}
                </Text>
              </Empty>
            )}
          </Card>
        </Space>
      </div>
    </div>
  );
};

export default PackageManager;