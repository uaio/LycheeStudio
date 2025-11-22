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
      {/* 第一部分：当前状态 */}
      <Card
        title={
          <Space>
            <DatabaseOutlined />
            <span>当前状态</span>
          </Space>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            loading={isLoading}
            onClick={loadCurrentRegistry}
          >
            刷新状态
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Statistic
              title="当前使用的源"
              value={currentRegistryName}
              prefix={<GlobalOutlined />}
            />
          </Col>
          <Col xs={24} md={8}>
            <Statistic
              title="可用源数量"
              value={registries.length}
              prefix={<AppstoreOutlined />}
            />
          </Col>
          <Col xs={24} md={8}>
            <Statistic
              title="自定义源"
              value={registries.filter(r => r.isCustom).length}
              prefix={<SettingOutlined />}
            />
          </Col>
        </Row>

        <Divider />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size="large">
            <Space>
              <GlobalOutlined style={{ fontSize: '28px', color: isDarkMode ? '#1890ff' : '#52c41a' }} />
              <div>
                <Title level={4} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
                  {currentRegistryName}
                </Title>
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

      {/* 第二部分：管理源列表 */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined />
            <span>源列表管理</span>
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: '12px' }}>
            点击"使用"按钮切换源，自定义源支持编辑和删除
          </Text>
        }
      >
        <Table
          dataSource={registries.map(registry => ({ ...registry, key: registry.id }))}
          columns={tableColumns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条源`
          }}
          size="small"
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 第三部分：添加自定义源 */}
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