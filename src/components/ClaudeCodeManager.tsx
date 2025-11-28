import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  message,
  Tabs,
  List,
  Avatar,
  Tooltip,
  Progress,
  Divider,
  Alert,
  Row,
  Col,
  Statistic,
  Select,
} from 'antd';
import {
  RobotOutlined,
  KeyOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ApiOutlined,
  CodeOutlined,
  FileTextOutlined,
  BulbOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ClaudeSession {
  id: string;
  name: string;
  model: string;
  createdAt: string;
  lastUsed: string;
  messageCount: number;
  status: 'active' | 'archived' | 'shared';
  tags: string[];
  description?: string;
}

interface ClaudeProject {
  id: string;
  name: string;
  path: string;
  lastModified: string;
  sessionCount: number;
  isFavorite: boolean;
  language: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  usageCount: number;
  isActive: boolean;
  permissions: string[];
}

const ClaudeCodeManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean }> = ({
  isDarkMode,
  collapsed = false
}) => {
  const [sessions, setSessions] = useState<ClaudeSession[]>([]);
  const [projects, setProjects] = useState<ClaudeProject[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [apiKeyForm] = Form.useForm();

  // 模拟数据加载
  useEffect(() => {
    loadSessions();
    loadProjects();
    loadApiKeys();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSessions([
        {
          id: '1',
          name: 'React项目重构',
          model: 'claude-3-sonnet-20240229',
          createdAt: '2024-01-15',
          lastUsed: '2024-01-20 14:30',
          messageCount: 156,
          status: 'active',
          tags: ['React', 'TypeScript', '重构'],
          description: '讨论React项目的重构方案和最佳实践'
        },
        {
          id: '2',
          name: 'Python数据分析',
          model: 'claude-3-sonnet-20240229',
          createdAt: '2024-01-10',
          lastUsed: '2024-01-18 09:15',
          messageCount: 89,
          status: 'active',
          tags: ['Python', '数据分析', 'Pandas'],
        },
        {
          id: '3',
          name: '系统设计讨论',
          model: 'claude-3-opus-20240229',
          createdAt: '2024-01-08',
          lastUsed: '2024-01-12 16:45',
          messageCount: 234,
          status: 'archived',
          tags: ['系统设计', '架构', '微服务'],
        },
      ]);
    } catch (error) {
      message.error('加载会话失败');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setProjects([
        {
          id: '1',
          name: 'ai-tools-manager',
          path: '/Users/anan/Coding/AITools/ai-tools-manager',
          lastModified: '2024-01-20 10:30',
          sessionCount: 12,
          isFavorite: true,
          language: 'TypeScript'
        },
        {
          id: '2',
          name: 'data-analysis-dashboard',
          path: '/Users/anan/Coding/DataAnalysis/dashboard',
          lastModified: '2024-01-19 15:45',
          sessionCount: 8,
          isFavorite: false,
          language: 'Python'
        },
      ]);
    } catch (error) {
      message.error('加载项目失败');
    }
  };

  const loadApiKeys = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      setApiKeys([
        {
          id: '1',
          name: '主开发密钥',
          key: 'sk-ant-***3F4G',
          createdAt: '2024-01-01',
          lastUsed: '2024-01-20 14:30',
          usageCount: 1250,
          isActive: true,
          permissions: ['read', 'write', 'execute']
        },
      ]);
    } catch (error) {
      message.error('加载API密钥失败');
    }
  };

  const handleCreateSession = async (values: any) => {
    try {
      const newSession: ClaudeSession = {
        id: Date.now().toString(),
        name: values.name,
        model: values.model || 'claude-3-sonnet-20240229',
        createdAt: new Date().toISOString().split('T')[0],
        lastUsed: new Date().toLocaleString(),
        messageCount: 0,
        status: 'active',
        tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : [],
        description: values.description,
      };
      setSessions([newSession, ...sessions]);
      setSessionModalVisible(false);
      form.resetFields();
      message.success('会话创建成功');
    } catch (error) {
      message.error('创建会话失败');
    }
  };

  const handleCreateAPIKey = async (values: any) => {
    try {
      const newAPIKey: APIKey = {
        id: Date.now().toString(),
        name: values.name,
        key: `sk-ant-${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date().toISOString().split('T')[0],
        lastUsed: '-',
        usageCount: 0,
        isActive: true,
        permissions: values.permissions || ['read'],
      };
      setApiKeys([...apiKeys, newAPIKey]);
      setApiKeyModalVisible(false);
      apiKeyForm.resetFields();
      message.success('API密钥创建成功');
    } catch (error) {
      message.error('创建API密钥失败');
    }
  };

  const deleteSession = (sessionId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个会话吗？此操作无法撤销。',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setSessions(sessions.filter(s => s.id !== sessionId));
        message.success('会话已删除');
      },
    });
  };

  const deleteAPIKey = (keyId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个API密钥吗？此操作无法撤销。',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setApiKeys(apiKeys.filter(k => k.id !== keyId));
        message.success('API密钥已删除');
      },
    });
  };

  const sessionColumns = [
    {
      title: '会话名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ClaudeSession) => (
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
      ),
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      render: (model: string) => (
        <Tag color={model.includes('opus') ? 'red' : model.includes('sonnet') ? 'blue' : 'green'}>
          {model}
        </Tag>
      ),
    },
    {
      title: '消息数',
      dataIndex: 'messageCount',
      key: 'messageCount',
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'archived' ? 'gray' : 'blue'}>
          {status === 'active' ? '活跃' : status === 'archived' ? '已归档' : '已分享'}
        </Tag>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map(tag => (
            <Tag key={tag} size="small">{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: ClaudeSession) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => deleteSession(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'sessions',
      label: (
        <span>
          <FileTextOutlined />
          会话管理
        </span>
      ),
      children: (
        <Card
          title="会话列表"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setSessionModalVisible(true)}
            >
              新建会话
            </Button>
          }
        >
          <Table
            dataSource={sessions}
            columns={sessionColumns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </Card>
      )
    },
    {
      key: 'projects',
      label: (
        <span>
          <CodeOutlined />
          项目管理
        </span>
      ),
      children: (
        <Card
          title="关联项目"
          extra={
            <Space>
              <Button icon={<ReloadOutlined />}>刷新</Button>
              <Button type="primary" icon={<PlusOutlined />}>
                关联项目
              </Button>
            </Space>
          }
        >
          <List
            dataSource={projects}
            renderItem={(project) => (
              <List.Item
                actions={[
                  <Tooltip title="取消收藏">
                    <Button type="text" size="small">
                      {project.isFavorite ? '★' : '☆'}
                    </Button>
                  </Tooltip>,
                  <Button type="text" size="small" icon={<EditOutlined />} />,
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<CodeOutlined />}
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{project.name}</Text>
                      <Tag color="blue">{project.language}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">{project.path}</Text>
                      <Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          会话数: {project.sessionCount}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          最后修改: {project.lastModified}
                        </Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )
    },
    {
      key: 'api',
      label: (
        <span>
          <ApiOutlined />
          API配置
        </span>
      ),
      children: (
        <Card
          title="API密钥管理"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setApiKeyModalVisible(true)}
            >
              生成密钥
            </Button>
          }
        >
          <Alert
            message="API密钥安全提示"
            description="请妥善保管你的API密钥，不要分享给他人。建议定期轮换密钥以确保安全。"
            type="warning"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <List
            dataSource={apiKeys}
            renderItem={(apiKey) => (
              <List.Item
                actions={[
                  <Tag color={apiKey.isActive ? 'green' : 'red'}>
                    {apiKey.isActive ? '活跃' : '禁用'}
                  </Tag>,
                  <Button type="text" size="small" icon={<EditOutlined />} />,
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => deleteAPIKey(apiKey.id)}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<KeyOutlined />}
                      style={{ backgroundColor: '#faad14' }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{apiKey.name}</Text>
                      <Text code>{apiKey.key}</Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Space>
                        <Text type="secondary">创建时间: {apiKey.createdAt}</Text>
                        <Text type="secondary">使用次数: {apiKey.usageCount}</Text>
                        <Text type="secondary">最后使用: {apiKey.lastUsed}</Text>
                      </Space>
                      <Space wrap>
                        {apiKey.permissions.map(permission => (
                          <Tag key={permission} size="small">
                            {permission}
                          </Tag>
                        ))}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )
    }
  ];

  return (
    <div style={{
      marginLeft: collapsed ? '80px' : '200px',
      height: 'calc(100vh - 38px)',
      overflow: 'hidden',
    }}>
      <div
        className="sidebar-scroll-container"
        style={{
          paddingTop: '32px',
          paddingLeft: '32px',
          paddingRight: '40px',
          paddingBottom: '32px',
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <Title level={2}>
            <RobotOutlined style={{ marginRight: '8px' }} />
            Claude Code 管理
          </Title>
          <Paragraph type="secondary">
            管理你的Claude Code会话、项目和API密钥
          </Paragraph>
        </div>

        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: '32px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总会话数"
                value={sessions.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃项目"
                value={projects.filter(p => p.isFavorite).length}
                prefix={<CodeOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="API密钥"
                value={apiKeys.length}
                prefix={<KeyOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总消息数"
                value={sessions.reduce((sum, s) => sum + s.messageCount, 0)}
                prefix={<BulbOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs
          defaultActiveKey="sessions"
          items={tabItems}
        />
        {/* 新建会话模态框 */}
        <Modal
          title="新建Claude会话"
          open={sessionModalVisible}
          onCancel={() => setSessionModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateSession}
          >
            <Form.Item
              name="name"
              label="会话名称"
              rules={[{ required: true, message: '请输入会话名称' }]}
            >
              <Input placeholder="输入会话名称" />
            </Form.Item>

            <Form.Item name="description" label="描述">
              <TextArea rows={3} placeholder="输入会话描述（可选）" />
            </Form.Item>

            <Form.Item name="model" label="模型选择" initialValue="claude-3-sonnet-20240229">
              <Select>
                <Select.Option value="claude-3-sonnet-20240229">Claude 3 Sonnet</Select.Option>
                <Select.Option value="claude-3-opus-20240229">Claude 3 Opus</Select.Option>
                <Select.Option value="claude-3-haiku-20240307">Claude 3 Haiku</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="tags" label="标签">
              <Input placeholder="输入标签，用逗号分隔" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  创建会话
                </Button>
                <Button onClick={() => setSessionModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 生成API密钥模态框 */}
        <Modal
          title="生成API密钥"
          open={apiKeyModalVisible}
          onCancel={() => setApiKeyModalVisible(false)}
          footer={null}
        >
          <Form
            form={apiKeyForm}
            layout="vertical"
            onFinish={handleCreateAPIKey}
          >
            <Form.Item
              name="name"
              label="密钥名称"
              rules={[{ required: true, message: '请输入密钥名称' }]}
            >
              <Input placeholder="输入密钥名称" />
            </Form.Item>

            <Form.Item name="permissions" label="权限设置">
              <Select mode="multiple" placeholder="选择权限" defaultValue={['read']}>
                <Select.Option value="read">读取</Select.Option>
                <Select.Option value="write">写入</Select.Option>
                <Select.Option value="execute">执行</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  生成密钥
                </Button>
                <Button onClick={() => setApiKeyModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default ClaudeCodeManager;