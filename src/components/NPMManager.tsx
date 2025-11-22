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
  Alert,
  App as AntdApp,
  Table,
  Modal,
  Form,
  message,
  Tooltip,
  Popconfirm,
  Divider
} from 'antd';
import {
  GlobalOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  LinkOutlined
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
  id: string;
  name: string;
  url: string;
  description: string;
  region?: string;
  speed?: 'fast' | 'medium' | 'slow';
  ping?: number;
  isCustom?: boolean;
  isActive?: boolean;
}

const NPMManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean }> = ({ isDarkMode, collapsed = false }) => {
  // 直接在组件内使用 useApp 获取 message API
  const { message: antdMessage } = AntdApp.useApp();
  const [currentRegistry, setCurrentRegistry] = useState('');
  const [currentRegistryName, setCurrentRegistryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registries, setRegistries] = useState<NpmRegistry[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRegistry, setEditingRegistry] = useState<NpmRegistry | null>(null);
  const [form] = Form.useForm();

  // 初始化默认源列表
  const defaultRegistries: NpmRegistry[] = [
    {
      id: 'npm-official',
      name: '官方源',
      url: 'https://registry.npmjs.org/',
      description: 'npm 官方注册表，全球最新包',
      region: '全球',
      speed: 'slow',
      ping: 180,
      isCustom: false
    },
    {
      id: 'npm-taobao',
      name: '淘宝源',
      url: 'https://registry.npmmirror.com/',
      description: '阿里云提供的镜像，国内访问速度快',
      region: '中国大陆',
      speed: 'fast',
      ping: 35,
      isCustom: false
    },
    {
      id: 'npm-tencent',
      name: '腾讯源',
      url: 'https://mirrors.cloud.tencent.com/npm/',
      description: '腾讯云提供的镜像服务',
      region: '中国大陆',
      speed: 'fast',
      ping: 45,
      isCustom: false
    },
    {
      id: 'npm-huawei',
      name: '华为源',
      url: 'https://repo.huaweicloud.com/repository/npm/',
      description: '华为云提供的镜像服务',
      region: '中国大陆',
      speed: 'fast',
      ping: 40,
      isCustom: false
    },
    {
      id: 'npm-ustc',
      name: '中科大源',
      url: 'https://mirrors.ustc.edu.cn/npm/',
      description: '中科大提供的镜像服务',
      region: '中国大陆',
      speed: 'fast',
      ping: 55,
      isCustom: false
    }
  ];

  useEffect(() => {
    initializeRegistries();
    loadCurrentRegistry();
  }, []);

  const initializeRegistries = () => {
    // 从本地存储加载自定义源
    const customRegistriesJson = localStorage.getItem('custom-npm-registries');
    const customRegistries = customRegistriesJson ? JSON.parse(customRegistriesJson) : [];

    const allRegistries = [
      ...defaultRegistries,
      ...customRegistries
    ].map(registry => ({
      ...registry,
      isActive: false // 初始化时都设为非活跃状态
    }));

    setRegistries(allRegistries);
  };

  const saveCustomRegistries = (updatedRegistries: NpmRegistry[]) => {
    const customRegistries = updatedRegistries.filter(registry => registry.isCustom);
    localStorage.setItem('custom-npm-registries', JSON.stringify(customRegistries));
  };

  const loadCurrentRegistry = async () => {
    try {
      const result = await window.electronAPI.getNpmRegistry();
      let registryUrl = '';
      let registryName = '';

      if (result.success && result.registry) {
        registryUrl = result.registry;
        registryName = result.name || '自定义源';
      } else {
        registryUrl = 'https://registry.npmmirror.com/';
        registryName = '淘宝源';
      }

      setCurrentRegistry(registryUrl);
      setCurrentRegistryName(registryName);

      // 更新源列表中的活跃状态
      setRegistries(prev => prev.map(registry => ({
        ...registry,
        isActive: registry.url === registryUrl
      })));
    } catch (error) {
      console.error('获取当前注册表失败:', error);
      const defaultUrl = 'https://registry.npmmirror.com/';
      setCurrentRegistry(defaultUrl);
      setCurrentRegistryName('淘宝源');

      setRegistries(prev => prev.map(registry => ({
        ...registry,
        isActive: registry.url === defaultUrl
      })));
    }
  };

  const setRegistry = async (registry: NpmRegistry) => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.setNpmRegistry(registry.url);
      if (result.success) {
        antdMessage.success(`已切换到 ${registry.name}`);
        setCurrentRegistry(registry.url);
        setCurrentRegistryName(registry.name);

        // 更新活跃状态
        setRegistries(prev => prev.map(r => ({
          ...r,
          isActive: r.url === registry.url
        })));
      } else {
        antdMessage.error('设置注册表失败');
      }
    } catch (error) {
      console.error('设置注册表失败:', error);
      antdMessage.error('设置注册表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRegistry = () => {
    setEditingRegistry(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditRegistry = (registry: NpmRegistry) => {
    setEditingRegistry(registry);
    form.setFieldsValue({
      name: registry.name,
      url: registry.url,
      description: registry.description,
      region: registry.region
    });
    setIsModalVisible(true);
  };

  const handleDeleteRegistry = (registry: NpmRegistry) => {
    if (registry.isCustom) {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除自定义源 "${registry.name}" 吗？`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          const updatedRegistries = registries.filter(r => r.id !== registry.id);
          setRegistries(updatedRegistries);
          saveCustomRegistries(updatedRegistries);
          antdMessage.success('删除成功');
        }
      });
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingRegistry) {
        // 编辑现有源
        const updatedRegistries = registries.map(registry =>
          registry.id === editingRegistry.id
            ? { ...registry, ...values }
            : registry
        );
        setRegistries(updatedRegistries);
        saveCustomRegistries(updatedRegistries);
        antdMessage.success('更新成功');
      } else {
        // 添加新源
        const newRegistry: NpmRegistry = {
          ...values,
          id: `custom-${Date.now()}`,
          isCustom: true,
          speed: 'medium' as const,
          ping: 100
        };
        const updatedRegistries = [...registries, newRegistry];
        setRegistries(updatedRegistries);
        saveCustomRegistries(updatedRegistries);
        antdMessage.success('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const getSpeedBadgeColor = (speed?: string) => {
    switch (speed) {
      case 'fast': return 'success';
      case 'medium': return 'warning';
      case 'slow': return 'default';
      default: return 'default';
    }
  };

  const getSpeedIcon = (speed?: string) => {
    switch (speed) {
      case 'fast': return <ThunderboltOutlined />;
      case 'medium': return <RiseOutlined />;
      case 'slow': return <ClockCircleOutlined />;
      default: return <RiseOutlined />;
    }
  };

  // 表格列定义
  const tableColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: NpmRegistry) => (
        <Space>
          <Text strong>{name}</Text>
          {record.isActive && <Tag color="blue">当前</Tag>}
          {record.isCustom && <Tag color="orange">自定义</Tag>}
        </Space>
      )
    },
    {
      title: '地址',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <Tooltip title={url}>
          <Text copyable={{ text: url }} ellipsis style={{ maxWidth: '200px' }}>
            {url}
          </Text>
        </Tooltip>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {description}
        </Text>
      )
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      width: 100,
      render: (region?: string) => (
        <Tag size="small">{region || '未知'}</Tag>
      )
    },
    {
      title: '速度',
      key: 'speed',
      width: 120,
      render: (record: NpmRegistry) => (
        <Space>
          <Tag color={getSpeedBadgeColor(record.speed)} size="small">
            {getSpeedIcon(record.speed)}
            {record.speed === 'fast' ? '快速' : record.speed === 'medium' ? '中等' : '较慢'}
          </Tag>
          {record.ping && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {record.ping}ms
            </Text>
          )}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (record: NpmRegistry) => (
        <Space>
          <Button
            type={record.isActive ? 'default' : 'primary'}
            size="small"
            onClick={() => setRegistry(record)}
            loading={isLoading && record.isActive}
          >
            {record.isActive ? '当前使用' : '使用'}
          </Button>
          {record.isCustom && (
            <>
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEditRegistry(record)}
              />
              <Popconfirm
                title="确定要删除这个自定义源吗？"
                onConfirm={() => handleDeleteRegistry(record)}
                okText="删除"
                cancelText="取消"
              >
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                />
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 源列表管理 - 融合当前状态 */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ color: isDarkMode ? '#1890ff' : '#52c41a' }} />
            <span style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>NPM 源管理</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              loading={isLoading}
              onClick={loadCurrentRegistry}
              size="small"
            >
              刷新
            </Button>
          </Space>
        }
        style={{
          background: isDarkMode ? '#141414' : '#ffffff',
          borderRadius: '8px',
          boxShadow: isDarkMode ? '0 1px 4px rgba(255,255,255,0.1)' : '0 1px 4px rgba(0,0,0,0.06)'
        }}
        styles={{ body: { padding: '16px' } }}
      >
        {/* 顶部状态栏 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          padding: '12px 16px',
          background: isDarkMode ? '#1a1a1a' : '#f8f9fa',
          borderRadius: '8px',
          border: `1px solid ${isDarkMode ? '#303030' : '#e0e0e0'}`
        }}>
          <Space size="large" style={{ flex: 1 }}>
            <Space>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: registries.find(r => r.isActive)
                  ? (isDarkMode ? 'linear-gradient(135deg, #1890ff, #096dd9)' : 'linear-gradient(135deg, #52c41a, #389e0d)')
                  : (isDarkMode ? 'linear-gradient(135deg, #faad14, #d48806)' : 'linear-gradient(135deg, #ff7875, #ff4d4f)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}>
                <GlobalOutlined style={{
                  fontSize: '18px',
                  color: '#ffffff'
                }} />
              </div>
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: isDarkMode ? '#ffffff' : '#000000',
                  marginBottom: '2px'
                }}>
                  {currentRegistryName}
                </div>
                <Space>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {currentRegistry}
                  </Text>
                  <Text copyable={{ text: currentRegistry }} style={{ cursor: 'pointer' }}>
                    <LinkOutlined style={{ color: isDarkMode ? '#1890ff' : '#1890ff', fontSize: '12px' }} />
                  </Text>
                </Space>
              </div>
            </Space>
          </Space>

          <Space size="large">
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: isDarkMode ? '#1890ff' : '#1890ff',
                marginBottom: '2px'
              }}>
                {registries.length}
              </div>
              <div style={{
                fontSize: '11px',
                color: isDarkMode ? '#a0a0a0' : '#666666'
              }}>
                总源数
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: isDarkMode ? '#52c41a' : '#52c41a',
                marginBottom: '2px'
              }}>
                {registries.filter(r => r.isCustom).length}
              </div>
              <div style={{
                fontSize: '11px',
                color: isDarkMode ? '#a0a0a0' : '#666666'
              }}>
                自定义源
              </div>
            </div>
            {currentRegistry ? (
              <Badge status="success" text="已配置" style={{ fontSize: '12px' }} />
            ) : (
              <Badge status="error" text="未配置" style={{ fontSize: '12px' }} />
            )}
          </Space>
        </div>
        <Row gutter={[12, 12]}>
          {registries.map((registry) => (
            <Col xs={24} sm={12} lg={8} key={registry.id}>
              <Card
                hoverable={!registry.isActive}
                className={`registry-card ${registry.isActive ? 'active' : ''}`}
                style={{
                  height: '100%',
                  borderRadius: '6px',
                  border: registry.isActive
                    ? `2px solid ${isDarkMode ? '#1890ff' : '#1890ff'}`
                    : `1px solid ${isDarkMode ? '#303030' : '#d9d9d9'}`,
                  background: registry.isActive
                    ? (isDarkMode ? 'linear-gradient(135deg, #1890ff15, #096dd905)' : 'linear-gradient(135deg, #e6f7ff, #f0f9ff)')
                    : (isDarkMode ? '#1a1a1a' : '#ffffff'),
                  transition: 'all 0.3s ease',
                  cursor: registry.isActive ? 'default' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                styles={{ body: { padding: '12px' } }}
                onClick={() => !registry.isActive && setRegistry(registry)}
              >
                {/* 当前使用标识 */}
                {registry.isActive && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: isDarkMode ? '#1890ff' : '#1890ff',
                    color: '#ffffff',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    borderBottomLeftRadius: '6px'
                  }}>
                    当前使用
                  </div>
                )}

                <div>
                  {/* 头部信息 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <Space>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: registry.isCustom
                          ? 'linear-gradient(135deg, #faad14, #d48806)'
                          : 'linear-gradient(135deg, #52c41a, #389e0d)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <GlobalOutlined
                          style={{
                            fontSize: '14px',
                            color: '#ffffff'
                          }}
                        />
                      </div>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: isDarkMode ? '#ffffff' : '#000000',
                          marginBottom: '2px'
                        }}>
                          {registry.name}
                        </div>
                        <Space size="small" style={{ marginTop: '2px' }}>
                          {registry.isCustom && (
                            <Tag color="orange" size="small">自定义</Tag>
                          )}
                          <Tag
                            color={getSpeedBadgeColor(registry.speed)}
                            size="small"
                            style={{ margin: 0, fontSize: '10px' }}
                          >
                            {getSpeedIcon(registry.speed)}
                            {registry.speed === 'fast' ? '快速' : registry.speed === 'medium' ? '中等' : '较慢'}
                          </Tag>
                        </Space>
                      </div>
                    </Space>
                  </div>

                  {/* 地址信息 */}
                  <div style={{
                    marginBottom: '8px',
                    padding: '6px 8px',
                    background: isDarkMode ? '#262626' : '#f5f5f5',
                    borderRadius: '4px',
                    border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Text
                        ellipsis
                        style={{
                          maxWidth: '160px',
                          fontSize: '11px',
                          fontFamily: 'Monaco, Consolas, monospace',
                          color: isDarkMode ? '#e0e0e0' : '#333333'
                        }}
                      >
                        {registry.url}
                      </Text>
                      <Text
                        copyable={{ text: registry.url }}
                        style={{
                          cursor: 'pointer',
                          color: isDarkMode ? '#1890ff' : '#1890ff',
                          fontSize: '11px'
                        }}
                      >
                        <LinkOutlined />
                      </Text>
                    </div>
                  </div>

                  {/* 描述信息 */}
                  <div style={{ marginBottom: '8px' }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: '11px',
                        lineHeight: '1.3',
                        color: isDarkMode ? '#a0a0a0' : '#666666'
                      }}
                    >
                      {registry.description}
                    </Text>
                  </div>

                  {/* 底部信息 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Space size="small">
                      <Tag size="small" style={{ margin: 0, fontSize: '10px' }}>
                        {registry.region || '未知'}
                      </Tag>
                      {registry.ping && (
                        <Text
                          type="secondary"
                          style={{
                            fontSize: '10px',
                            color: isDarkMode ? '#a0a0a0' : '#999999'
                          }}
                        >
                          {registry.ping}ms
                        </Text>
                      )}
                    </Space>

                    <Space size="small">
                      <Button
                        type={registry.isActive ? 'default' : 'primary'}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRegistry(registry);
                        }}
                        loading={isLoading && registry.isActive}
                        style={{
                          fontSize: '11px',
                          height: '24px',
                          padding: '0 8px'
                        }}
                      >
                        {registry.isActive ? '当前使用' : '使用'}
                      </Button>

                      {registry.isCustom && (
                        <>
                          <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRegistry(registry);
                            }}
                            style={{
                              fontSize: '11px',
                              height: '24px',
                              padding: '0 6px'
                            }}
                          />
                          <Popconfirm
                            title="确定要删除这个自定义源吗？"
                            onConfirm={(e) => {
                              e?.stopPropagation();
                              handleDeleteRegistry(registry);
                            }}
                            okText="删除"
                            cancelText="取消"
                          >
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: '11px',
                                height: '24px',
                                padding: '0 6px'
                              }}
                            />
                          </Popconfirm>
                        </>
                      )}
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 第二部分：添加自定义源 */}
      <Card
        title={
          <Space>
            <PlusOutlined />
            <span>添加自定义源</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRegistry}
          >
            添加新源
          </Button>
        }
      >
        <Alert
          message="添加自定义源"
          description="自定义源将保存在本地，支持添加企业内部源或其他第三方源。请确保源地址格式正确且可访问。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" hoverable style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleAddRegistry}>
              <PlusOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <div>添加新源</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>配置自定义NPM源</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <LinkOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div>企业源</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>支持私有源配置</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <ThunderboltOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
              <div>加速源</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>提升下载速度</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: '24px', color: '#13c2c2', marginBottom: '8px' }} />
              <div>安全可靠</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>官方认证源</Text>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 添加/编辑源的模态框 */}
      <Modal
        title={editingRegistry ? '编辑NPM源' : '添加自定义NPM源'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: '',
            url: '',
            description: '',
            region: '自定义'
          }}
        >
          <Form.Item
            label="源名称"
            name="name"
            rules={[{ required: true, message: '请输入源名称' }]}
          >
            <Input placeholder="例如：公司私有源" />
          </Form.Item>

          <Form.Item
            label="源地址"
            name="url"
            rules={[
              { required: true, message: '请输入源地址' },
              { type: 'url', message: '请输入有效的URL地址' }
            ]}
          >
            <Input placeholder="https://registry.example.com/" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入源描述' }]}
          >
            <Input.TextArea rows={3} placeholder="简要描述这个源的用途和特点" />
          </Form.Item>

          <Form.Item
            label="地区"
            name="region"
          >
            <Input placeholder="例如：中国大陆、欧洲等" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default NPMManager;