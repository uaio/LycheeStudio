import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Space,
  Tooltip,
  Row,
  Col,
  Statistic,
  Avatar,
  Popconfirm,
  Badge,
  Empty,
  Tabs,
  List,
  Descriptions,
  Alert,
  Divider,
  Upload,
  UploadProps,
  InputNumber,
  Slider,
  Collapse,
  Timeline,
  Progress,
  Steps,
  Drawer,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  GlobalOutlined,
  ApiOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  CopyOutlined,
  HistoryOutlined,
  ToolOutlined,
  RocketOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  KeyOutlined,
  LinkOutlined,
  DisconnectOutlined,
  ReloadOutlined,
  WarningOutlined,
  QuestionCircleOutlined,
  ImportOutlined,
  ExportOutlined,
  SyncOutlined,
  DashboardOutlined,
  SettingFilled,
  CheckSquareOutlined,
  CloseSquareOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface ClaudeProvider {
  id: string;
  name: string;
  type: 'official' | 'custom';
  apiUrl: string;
  apiKey?: string;
  model: string;
  isDefault: boolean;
  isActive: boolean;
  description?: string;
  lastUsed?: string;
  requestCount?: number;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  configPath?: string;
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
  proxy?: string;
  rateLimitPerMinute?: number;
  monthlyQuota?: number;
  currentUsage?: number;
}

interface UsageLog {
  id: string;
  providerId: string;
  providerName: string;
  model: string;
  requestType: string;
  tokensUsed: number;
  cost: number;
  timestamp: string;
  status: 'success' | 'error';
  responseTime: number;
}

interface ConfigBackup {
  id: string;
  name: string;
  description: string;
  providers: ClaudeProvider[];
  createdAt: string;
  version: string;
}

interface ConnectionTestResult {
  providerId: string;
  status: 'success' | 'error' | 'timeout';
  responseTime: number;
  errorMessage?: string;
  testDate: string;
}

const ClaudeProviderManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean }> = ({
  isDarkMode,
  collapsed = false
}) => {
  const [providers, setProviders] = useState<ClaudeProvider[]>([
    {
      id: '1',
      name: 'Claude Official',
      type: 'official',
      apiUrl: 'https://api.anthropic.com',
      model: 'claude-3-5-sonnet-20241022',
      isDefault: true,
      isActive: true,
      description: 'Anthropic官方API服务',
      status: 'connected',
      lastUsed: '2024-11-25 10:30',
      requestCount: 1250,
      timeout: 30,
      maxTokens: 4096,
      temperature: 0.7,
      rateLimitPerMinute: 60,
      monthlyQuota: 100000,
      currentUsage: 15420,
    },
    {
      id: '2',
      name: 'Custom Provider',
      type: 'custom',
      apiUrl: 'https://custom-clude-api.example.com',
      model: 'claude-3-5-sonnet-20241022',
      isDefault: false,
      isActive: false,
      description: '自定义API服务',
      status: 'disconnected',
      lastUsed: '2024-11-20 15:45',
      requestCount: 89,
      timeout: 60,
      maxTokens: 8192,
      temperature: 0.5,
      proxy: 'http://proxy.example.com:8080',
      rateLimitPerMinute: 30,
      monthlyQuota: 50000,
      currentUsage: 890,
    },
    {
      id: '3',
      name: 'Test Provider',
      type: 'custom',
      apiUrl: 'https://api.test.example.com',
      model: 'claude-3-haiku-20241022',
      isDefault: false,
      isActive: true,
      description: '测试环境API服务',
      status: 'error',
      lastUsed: '2024-11-24 09:15',
      requestCount: 45,
      timeout: 45,
      maxTokens: 2048,
      temperature: 0.8,
      rateLimitPerMinute: 20,
      monthlyQuota: 25000,
      currentUsage: 1245,
    },
  ]);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([
    {
      id: '1',
      providerId: '1',
      providerName: 'Claude Official',
      model: 'claude-3-5-sonnet-20241022',
      requestType: '对话',
      tokensUsed: 1250,
      cost: 0.00625,
      timestamp: '2024-11-25 10:30:15',
      status: 'success',
      responseTime: 1250,
    },
    {
      id: '2',
      providerId: '1',
      providerName: 'Claude Official',
      model: 'claude-3-5-sonnet-20241022',
      requestType: '代码生成',
      tokensUsed: 2500,
      cost: 0.0125,
      timestamp: '2024-11-25 09:45:22',
      status: 'success',
      responseTime: 2100,
    },
    {
      id: '3',
      providerId: '2',
      providerName: 'Custom Provider',
      model: 'claude-3-5-sonnet-20241022',
      requestType: '对话',
      tokensUsed: 890,
      cost: 0.00445,
      timestamp: '2024-11-25 08:30:10',
      status: 'error',
      responseTime: 0,
    },
  ]);
  const [configBackups, setConfigBackups] = useState<ConfigBackup[]>([
    {
      id: '1',
      name: '生产环境配置',
      description: '2024年11月生产环境配置备份',
      providers: [],
      createdAt: '2024-11-25 08:00:00',
      version: '1.0.0',
    },
    {
      id: '2',
      name: '开发环境配置',
      description: '2024年11月开发环境配置备份',
      providers: [],
      createdAt: '2024-11-20 15:30:00',
      version: '0.9.0',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ClaudeProvider | null>(null);
  const [form] = Form.useForm();
  const [apiKeyForm] = Form.useForm();
  const [advancedForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('providers');
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ClaudeProvider | null>(null);
  const [testResults, setTestResults] = useState<ConnectionTestResult[]>([]);

  const detectExistingProviders = useCallback(async () => {
    setLoading(true);
    try {
      // 这里可以读取Claude Code的配置文件
      // 目前使用模拟数据
      const existingConfigs = [
        {
          name: 'Claude Official',
          apiUrl: 'https://api.anthropic.com',
          model: 'claude-3-5-sonnet-20241022',
          configPath: '~/.claude/config.json'
        }
      ];

      // 检测并更新默认提供商
      const updatedProviders = providers.map(provider => {
        const existingConfig = existingConfigs.find(
          config => config.name === provider.name
        );
        if (existingConfig) {
          return {
            ...provider,
            apiUrl: existingConfig.apiUrl,
            model: existingConfig.model,
            configPath: existingConfig.configPath,
            status: 'connected',
            isActive: true
          };
        }
        return provider;
      });

      setProviders(updatedProviders);
    } catch (error) {
      message.error('检测配置失败');
    } finally {
      setLoading(false);
    }
  }, [setProviders]);

  // 检测现有配置
  useEffect(() => {
    detectExistingProviders();
  }, [detectExistingProviders]);

  const handleAddProvider = () => {
    setEditingProvider(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEditProvider = (provider: ClaudeProvider) => {
    setEditingProvider(provider);
    setModalVisible(true);
    form.setFieldsValue({
      name: provider.name,
      apiUrl: provider.apiUrl,
      apiKey: provider.apiKey,
      model: provider.model,
      description: provider.description,
      isActive: provider.isActive,
    });
  };

  const handleDeleteProvider = (providerId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个提供商配置吗？此操作无法撤销。',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setProviders(providers.filter(p => p.id !== providerId));
        message.success('提供商已删除');
      },
    });
  };

  const handleSetDefault = (providerId: string) => {
    const updatedProviders = providers.map(p => ({
      ...p,
      isDefault: p.id === providerId
    }));
    setProviders(updatedProviders);
    message.success('默认提供商已更新');
  };

  const handleToggleStatus = (providerId: string, checked: boolean) => {
    const updatedProviders = providers.map(p =>
      p.id === providerId ? { ...p, isActive: checked } : p
    );
    setProviders(updatedProviders);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingProvider) {
        // 编辑现有提供商
        const updatedProviders = providers.map(p =>
          p.id === editingProvider.id
            ? { ...p, ...values }
            : p
        );
        setProviders(updatedProviders);
        message.success('提供商配置已更新');
      } else {
        // 添加新提供商
        const newProvider: ClaudeProvider = {
          id: Date.now().toString(),
          ...values,
          type: 'custom',
          isDefault: providers.length === 0,
          status: 'disconnected',
          lastUsed: '-',
          requestCount: 0,
        };
        setProviders([...providers, newProvider]);
        message.success('提供商已添加');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleTestConnection = async (provider: ClaudeProvider) => {
    // 模拟连接测试
    const originalStatus = provider.status;

    // 临时更新状态为测试中
    setProviders(providers.map(p =>
      p.id === provider.id ? { ...p, status: 'error' as const } : p
    ));

    // 模拟异步连接测试
    setTimeout(() => {
      setProviders(providers.map(p =>
        p.id === provider.id ? { ...p, status: originalStatus } : p
      ));

      if (originalStatus === 'connected') {
        message.success('连接测试成功');
      } else {
        message.error('连接测试失败');
      }
    }, 2000);
  };

  const columns = [
    {
      title: '提供商',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ClaudeProvider) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar
              size="small"
              style={{
                backgroundColor: record.type === 'official' ? '#1890ff' : '#52c41a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {record.type === 'official' ? '🤖' : '🔧'}
            </Avatar>
            <div>
              <Text strong>{text}</Text>
              {record.description && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {record.description}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'official' ? 'blue' : 'green'}>
          {type === 'official' ? '官方' : '自定义'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: ClaudeProvider) => (
        <Space>
          <Badge
            status={status === 'connected' ? 'success' : status === 'error' ? 'error' : 'warning'}
            text={status === 'connected' ? '已连接' : status === 'error' ? '连接失败' : '未连接'}
          />
          <Tooltip title="测试连接">
            <Button
              type="text"
              size="small"
              icon={<ApiOutlined />}
              onClick={() => handleTestConnection(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      render: (model: string) => (
        <Text code>{model}</Text>
      ),
    },
    {
      title: '默认',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean, record: ClaudeProvider) => (
        <Switch
          checked={isDefault}
          onChange={(checked) => handleSetDefault(record.id, checked)}
          disabled={isDefault}
        />
      ),
    },
    {
      title: '启用',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: ClaudeProvider) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleStatus(record.id, checked)}
        />
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'requestCount',
      key: 'requestCount',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: ClaudeProvider) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedProvider(record);
                setDetailsDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditProvider(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确认删除"
              description="此操作无法撤销"
              onConfirm={() => handleDeleteProvider(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const statistics = {
    total: providers.length,
    active: providers.filter(p => p.isActive).length,
    connected: providers.filter(p => p.status === 'connected').length,
    official: providers.filter(p => p.type === 'official').length,
    custom: providers.filter(p => p.type === 'custom').length,
  };

  return (
    <div style={{
      padding: 0,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
        <div style={{ marginBottom: '32px' }}>
          <Title level={3} style={{ marginBottom: '8px', color: isDarkMode ? '#ffffff' : '#000000' }}>
            提供商管理
          </Title>
          <Paragraph type="secondary" style={{ fontSize: '14px', marginBottom: 0 }}>
            管理Claude Code的服务提供商配置，支持官方和自定义API服务
          </Paragraph>
        </div>

        {/* 统计信息 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="总提供商"
                value={statistics.total}
                prefix={<SettingOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="已启用"
                value={statistics.active}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="已连接"
                value={statistics.connected}
                prefix={<GlobalOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="官方提供商"
                value={statistics.official}
                prefix={<ApiOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="providers" activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <DashboardOutlined />
                提供商列表
              </span>
            }
            key="providers"
          >
            <Card
              title="提供商管理"
              extra={
                <Space>
                  <Button
                    icon={<SyncOutlined />}
                    onClick={detectExistingProviders}
                    loading={loading}
                  >
                    检测配置
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddProvider}
                  >
                    添加提供商
                  </Button>
                </Space>
              }
            >
              <Table
                dataSource={providers}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                }}
                locale={{
                  emptyText: <Empty description="暂无提供商配置" />
                }}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                使用记录
              </span>
            }
            key="usage"
          >
            <Card
              title="API使用记录"
              extra={
                <Space>
                  <Select placeholder="选择提供商" style={{ width: 200 }}>
                    <Option value="">全部提供商</Option>
                    {providers.map(provider => (
                      <Option key={provider.id} value={provider.id}>
                        {provider.name}
                      </Option>
                    ))}
                  </Select>
                  <Button icon={<ExportOutlined />}>导出记录</Button>
                </Space>
              }
            >
              <List
                dataSource={usageLogs}
                renderItem={(log) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={log.status === 'success' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                          style={{ backgroundColor: log.status === 'success' ? '#52c41a' : '#ff4d4f' }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{log.providerName}</Text>
                          <Tag color="blue">{log.requestType}</Tag>
                          <Text code>{log.model}</Text>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Space>
                            <Text type="secondary">时间: {log.timestamp}</Text>
                            <Text type="secondary">响应时间: {log.responseTime}ms</Text>
                            <Text type="secondary">Token使用: {log.tokensUsed}</Text>
                            <Text type="secondary">费用: ${log.cost.toFixed(4)}</Text>
                          </Space>
                        </Space>
                      }
                    />
                    <div>
                      <Tag color={log.status === 'success' ? 'green' : 'red'}>
                        {log.status === 'success' ? '成功' : '失败'}
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingFilled />
                高级配置
              </span>
            }
            key="advanced"
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="全局设置" extra={<InfoCircleOutlined />}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>默认超时时间</Text>
                      <InputNumber
                        style={{ width: '100%', marginTop: 8 }}
                        min={5}
                        max={300}
                        defaultValue={30}
                        suffix="秒"
                      />
                    </div>
                    <div>
                      <Text strong>默认最大Token</Text>
                      <InputNumber
                        style={{ width: '100%', marginTop: 8 }}
                        min={100}
                        max={100000}
                        defaultValue={4096}
                        suffix="tokens"
                      />
                    </div>
                    <div>
                      <Text strong>默认温度参数</Text>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        defaultValue={0.7}
                        marks={{ 0: '0', 0.5: '0.5', 1: '1' }}
                      />
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="代理设置">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>HTTP代理</Text>
                      <Input
                        placeholder="http://proxy.example.com:8080"
                        style={{ marginTop: 8 }}
                      />
                    </div>
                    <div>
                      <Text strong>HTTPS代理</Text>
                      <Input
                        placeholder="https://proxy.example.com:8080"
                        style={{ marginTop: 8 }}
                      />
                    </div>
                    <div>
                      <Switch checkedChildren="启用" unCheckedChildren="禁用" defaultChecked={false} />
                      <Text style={{ marginLeft: 8 }}>使用系统代理</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Card title="连接测试记录" style={{ marginTop: 16 }}>
              <Timeline>
                <Timeline.Item color="green">
                  <Text>Claude Official 连接测试成功</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>2024-11-25 10:30 (1250ms)</Text>
                </Timeline.Item>
                <Timeline.Item color="red">
                  <Text>Custom Provider 连接测试失败</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>2024-11-25 09:15 (超时)</Text>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <Text>Test Provider 连接测试中...</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>2024-11-25 08:45</Text>
                </Timeline.Item>
              </Timeline>
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SafetyOutlined />
                配置备份
              </span>
            }
            key="backup"
          >
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Card
                  title="配置备份列表"
                  extra={
                    <Space>
                      <Button icon={<ImportOutlined />}>导入配置</Button>
                      <Button icon={<ExportOutlined />} type="primary">
                        导出当前配置
                      </Button>
                    </Space>
                  }
                >
                  <List
                    dataSource={configBackups}
                    renderItem={(backup) => (
                      <List.Item
                        actions={[
                          <Button size="small" icon={<EyeOutlined />}>
                            查看详情
                          </Button>,
                          <Button size="small" icon={<DownloadOutlined />}>
                            下载
                          </Button>,
                          <Button size="small" danger icon={<DeleteOutlined />}>
                            删除
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={<FileTextOutlined />}
                              style={{ backgroundColor: '#1890ff' }}
                            />
                          }
                          title={backup.name}
                          description={
                            <Space direction="vertical" size="small">
                              <Text type="secondary">{backup.description}</Text>
                              <Space>
                                <Text type="secondary">版本: {backup.version}</Text>
                                <Text type="secondary">创建时间: {backup.createdAt}</Text>
                                <Text type="secondary">提供商数量: {backup.providers.length}</Text>
                              </Space>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="备份统计">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Statistic
                      title="总备份数"
                      value={configBackups.length}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                    <Statistic
                      title="最近备份"
                      value={configBackups.length > 0 ? "2024-11-25" : "无"}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} style={{ width: '100%' }}>
                      创建新备份
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        {/* 添加/编辑提供商模态框 */}
        <Modal
          title={editingProvider ? '编辑提供商' : '添加提供商'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="提供商名称"
                  rules={[{ required: true, message: '请输入提供商名称' }]}
                >
                  <Input placeholder="输入提供商名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="提供商类型"
                  initialValue="custom"
                  rules={[{ required: true, message: '请选择提供商类型' }]}
                >
                  <Select placeholder="选择提供商类型">
                    <Option value="official">官方提供商</Option>
                    <Option value="custom">自定义提供商</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="apiUrl"
                  label="API地址"
                  rules={[
                    { required: true, message: '请输入API地址' },
                    { type: 'url', message: '请输入有效的URL地址' }
                  ]}
                >
                  <Input placeholder="https://api.example.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="apiKey"
                  label="API密钥"
                  rules={[{ required: true, message: '请输入API密钥' }]}
                >
                  <Input.Password placeholder="sk-ant-..." />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="model"
                  label="模型"
                  initialValue="claude-3-5-sonnet-20241022"
                  rules={[{ required: true, message: '请选择模型' }]}
                >
                  <Select placeholder="选择模型">
                    <Option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</Option>
                    <Option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</Option>
                    <Option value="claude-3-opus-20240229">Claude 3 Opus</Option>
                    <Option value="claude-3-sonnet-20240229">Claude 3 Sonnet</Option>
                    <Option value="claude-3-haiku-20240307">Claude 3 Haiku</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="proxy" label="代理地址">
                  <Input placeholder="http://proxy.example.com:8080" />
                </Form.Item>
              </Col>
            </Row>

            <Collapse ghost style={{ marginBottom: 16 }}>
              <Panel header="高级配置" key="advanced">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="timeout" label="超时时间(秒)" initialValue={30}>
                      <InputNumber min={5} max={300} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="maxTokens" label="最大Token" initialValue={4096}>
                      <InputNumber min={100} max={100000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="temperature" label="温度参数" initialValue={0.7}>
                      <Slider min={0} max={1} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="rateLimitPerMinute" label="速率限制(次/分)" initialValue={60}>
                      <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="monthlyQuota" label="月度配额" initialValue={100000}>
                      <InputNumber min={1000} max={1000000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="currentUsage" label="当前用量" initialValue={0}>
                      <InputNumber min={0} style={{ width: '100%' }} disabled />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
            </Collapse>

            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} placeholder="输入提供商描述（可选）" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
                  <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                  <Text style={{ marginLeft: 8 }}>启用此提供商</Text>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isDefault" valuePropName="checked" initialValue={false}>
                  <Switch checkedChildren="是" unCheckedChildren="否" />
                  <Text style={{ marginLeft: 8 }}>设为默认提供商</Text>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingProvider ? '更新' : '添加'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
                {editingProvider && (
                  <Button
                    type="default"
                    icon={<ApiOutlined />}
                    onClick={() => {
                      if (editingProvider) {
                        handleTestConnection(editingProvider);
                      }
                    }}
                  >
                    测试连接
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 提供商详情抽屉 */}
        <Drawer
          title={selectedProvider ? `${selectedProvider.name} 详细信息` : '提供商详情'}
          placement="right"
          onClose={() => setDetailsDrawerVisible(false)}
          open={detailsDrawerVisible}
          width={600}
        >
          {selectedProvider && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Card title="基本信息" size="small">
                <Descriptions column={1}>
                  <Descriptions.Item label="提供商名称">{selectedProvider.name}</Descriptions.Item>
                  <Descriptions.Item label="类型">
                    <Tag color={selectedProvider.type === 'official' ? 'blue' : 'green'}>
                      {selectedProvider.type === 'official' ? '官方' : '自定义'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="API地址">
                    <Text code copyable>{selectedProvider.apiUrl}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="模型">
                    <Text code>{selectedProvider.model}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Badge
                      status={selectedProvider.status === 'connected' ? 'success' : selectedProvider.status === 'error' ? 'error' : 'warning'}
                      text={selectedProvider.status === 'connected' ? '已连接' : selectedProvider.status === 'error' ? '连接失败' : '未连接'}
                    />
                  </Descriptions.Item>
                  {selectedProvider.description && (
                    <Descriptions.Item label="描述">{selectedProvider.description}</Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              <Card title="使用统计" size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="使用次数"
                      value={selectedProvider.requestCount || 0}
                      prefix={<RocketOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="最后使用"
                      value={selectedProvider.lastUsed || '从未使用'}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                </Row>
                {selectedProvider.monthlyQuota && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>月度使用量</Text>
                    <Progress
                      percent={Math.round(((selectedProvider.currentUsage || 0) / selectedProvider.monthlyQuota) * 100)}
                      status="active"
                      format={(percent) => `${selectedProvider.currentUsage || 0} / ${selectedProvider.monthlyQuota}`}
                    />
                  </div>
                )}
              </Card>

              {selectedProvider.timeout && (
                <Card title="连接配置" size="small">
                  <Descriptions column={2}>
                    <Descriptions.Item label="超时时间">{selectedProvider.timeout}秒</Descriptions.Item>
                    <Descriptions.Item label="最大Token">{selectedProvider.maxTokens}</Descriptions.Item>
                    <Descriptions.Item label="温度参数">{selectedProvider.temperature}</Descriptions.Item>
                    <Descriptions.Item label="速率限制">{selectedProvider.rateLimitPerMinute} 次/分钟</Descriptions.Item>
                    {selectedProvider.proxy && (
                      <Descriptions.Item label="代理地址" span={2}>
                        <Text code>{selectedProvider.proxy}</Text>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              )}

              <Space>
                <Button
                  type="primary"
                  icon={<ApiOutlined />}
                  onClick={() => {
                    handleTestConnection(selectedProvider);
                    setDetailsDrawerVisible(false);
                  }}
                >
                  测试连接
                </Button>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    handleEditProvider(selectedProvider);
                    setDetailsDrawerVisible(false);
                  }}
                >
                  编辑
                </Button>
              </Space>
            </Space>
          )}
        </Drawer>
    </div>
  );
};

export default ClaudeProviderManager;