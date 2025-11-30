import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Alert,
  Tooltip,
  Row,
  Col,
  Select,
} from 'antd';
import './ClaudeProviderManager.css';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface APIProvider {
  id: string;
  name: string;
  type: 'official' | 'custom';
  apiUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  selected: boolean;
  status: 'connected' | 'disconnected' | 'error';
  template?: string;
}

interface ProviderTemplate {
  id: string;
  name: string;
  apiUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  description: string;
}

const ClaudeProviderManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean }> = ({
  isDarkMode,
  collapsed = false
}) => {
  // 预置的 API 服务商模板
  const providerTemplates: ProviderTemplate[] = [
    {
      id: 'claude-official',
      name: 'Claude 官方 API',
      apiUrl: 'https://api.anthropic.com',
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4096,
      temperature: 0.7,
      description: 'Anthropic 官方 Claude API 服务'
    },
    {
      id: 'claude-opus',
      name: 'Claude 3 Opus',
      apiUrl: 'https://api.anthropic.com',
      model: 'claude-3-opus-20240229',
      maxTokens: 4096,
      temperature: 0.7,
      description: 'Anthropic 最强大的 Claude 模型'
    },
    {
      id: 'claude-haiku',
      name: 'Claude 3 Haiku',
      apiUrl: 'https://api.anthropic.com',
      model: 'claude-3-haiku-20240307',
      maxTokens: 4096,
      temperature: 0.7,
      description: '快速响应的 Claude 模型'
    },
    {
      id: 'custom-proxy',
      name: '自定义代理服务',
      apiUrl: 'https://your-proxy.example.com/v1',
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4096,
      temperature: 0.7,
      description: '通过代理服务访问 Claude API'
    }
  ];

  const [providers, setProviders] = useState<APIProvider[]>([
    {
      id: '1',
      name: 'Claude API',
      type: 'official',
      apiUrl: 'https://api.anthropic.com',
      apiKey: 'sk-ant-api03-***',
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4096,
      temperature: 0.7,
      selected: true,
      status: 'connected'
    },
    {
      id: '2',
      name: '自定义代理',
      type: 'custom',
      apiUrl: 'https://my-proxy.example.com/v1',
      apiKey: 'custom-key-***',
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4096,
      temperature: 0.7,
      selected: false,
      status: 'disconnected'
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<APIProvider | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      message.error('加载 API 服务商失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProvider = useCallback((providerId: string) => {
    setProviders(prev => prev.map(provider =>
      provider.id === providerId
        ? { ...provider, selected: true, status: 'connected' as const }
        : { ...provider, selected: false }
    ));
    message.success('已切换 API 服务商');
  }, []);

  const handleEditProvider = (provider: APIProvider) => {
    setEditingProvider(provider);
    form.setFieldsValue(provider);
    setModalVisible(true);
  };

  const handleDeleteProvider = (providerId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个 API 服务商吗？此操作无法撤销。',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setProviders(prev => prev.filter(p => p.id !== providerId));
        message.success('API 服务商已删除');
      },
    });
  };

  const handleTemplateChange = (templateId: string) => {
    const template = providerTemplates.find(t => t.id === templateId);
    if (template) {
      form.setFieldsValue({
        name: template.name,
        apiUrl: template.apiUrl,
        model: template.model,
        maxTokens: template.maxTokens,
        temperature: template.temperature,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingProvider) {
        setProviders(prev => prev.map(provider =>
          provider.id === editingProvider.id
            ? { ...provider, ...values }
            : provider
        ));
        message.success('API 服务商更新成功');
      } else {
        const newProvider: APIProvider = {
          id: Date.now().toString(),
          ...values,
          selected: false,
          status: 'disconnected'
        };
        setProviders(prev => [...prev, newProvider]);
        message.success('API 服务商添加成功');
      }
      setModalVisible(false);
      setEditingProvider(null);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleAddNew = () => {
    setEditingProvider(null);
    form.resetFields();
    setModalVisible(true);
  };

  
  
  // 获取当前选中的 API 服务商
  const selectedProvider = providers.find(p => p.selected);

  return (
    <div style={{
      marginLeft: collapsed ? '0px' : '0px',
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div
        className="sidebar-scroll-container"
        style={{
          paddingTop: '32px',
          paddingLeft: collapsed ? '24px' : '24px',
          paddingRight: collapsed ? '24px' : '32px',
          paddingBottom: '32px',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0
        }}
      >
        {/* 当前使用模型的大卡片 */}
        <Card
          style={{
            marginBottom: '24px',
            borderRadius: '12px',
            background: isDarkMode
              ? '#2a2a2a'
              : '#ffffff',
            border: isDarkMode
              ? '2px solid #404040'
              : '2px solid #e0e0e0',
            boxShadow: isDarkMode
              ? '0 4px 16px rgba(0, 0, 0, 0.4)'
              : '0 4px 16px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          {/* 标题和添加按钮 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* 呼吸灯图标 */}
              {selectedProvider && (
                <div
                  className="pulsing-dot"
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#52c41a',
                    boxShadow: '0 0 12px rgba(82, 196, 26, 0.6)'
                  }}
                />
              )}

              <Title level={3} style={{
                color: isDarkMode ? '#ffffff' : '#262626',
                margin: 0,
                fontSize: '20px',
                fontWeight: 600
              }}>
                {selectedProvider?.name || 'API 服务商'}
              </Title>
            </div>

            {/* 右上角添加按钮 */}
            <Button
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              style={{
                fontSize: '12px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </div>

          {/* 提供商列表 - 在大卡片内部 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {providers.map(provider => (
            <div
              key={provider.id}
              onClick={() => handleSelectProvider(provider.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                gap: '12px',
                borderRadius: '8px',
                background: provider.selected
                  ? isDarkMode ? '#1890ff' : '#1677ff'
                  : isDarkMode ? '#262626' : '#ffffff',
                border: provider.selected
                  ? '2px solid #1890ff'
                  : isDarkMode ? '1px solid #404040' : '1px solid #d9d9d9',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: provider.selected
                  ? '0 4px 12px rgba(24, 144, 255, 0.3)'
                  : isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                if (!provider.selected) {
                  e.currentTarget.style.background = isDarkMode ? '#303030' : '#f0f0f0';
                  e.currentTarget.style.boxShadow = isDarkMode ? '0 2px 6px rgba(0, 0, 0, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!provider.selected) {
                  e.currentTarget.style.background = isDarkMode ? '#262626' : '#ffffff';
                  e.currentTarget.style.boxShadow = isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {/* 左侧图标 */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: provider.type === 'official'
                  ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                  : 'linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#ffffff',
                flexShrink: 0
              }}>
                {provider.type === 'official' ? '🤖' : '🔧'}
              </div>

              {/* 中间信息 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: provider.selected
                    ? '#ffffff'
                    : (isDarkMode ? '#ffffff' : '#1a1a1a'),
                  marginBottom: '2px'
                }}>
                  {provider.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: provider.selected
                    ? 'rgba(255, 255, 255, 0.85)'
                    : (isDarkMode ? '#bfbfbf' : '#595959')
                }}>
                  {provider.model}
                </div>
              </div>

              {/* 右侧操作按钮 */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 选中状态 */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: provider.selected
                    ? '1px solid rgba(255, 255, 255, 0.6)'
                    : (isDarkMode ? '1px solid #595959' : '1px solid #d9d9d9'),
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  {provider.selected ? (
                    <div style={{
                      width: '12px',
                      height: '12px',
                      color: provider.selected
                        ? 'rgba(255, 255, 255, 0.9)'
                        : (isDarkMode ? '#a0a0a0' : '#666666'),
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ✓
                    </div>
                  ) : null}
                </div>

                {/* 编辑按钮 */}
                <Tooltip title="编辑">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProvider(provider);
                    }}
                    style={{
                      fontSize: '12px',
                      color: provider.selected
                        ? 'rgba(255, 255, 255, 0.9)'
                        : (isDarkMode ? '#a0a0a0' : '#666666'),
                      padding: '2px 6px',
                      height: '24px',
                      width: '24px'
                    }}
                  />
                </Tooltip>

                {/* 删除按钮 */}
                <Tooltip title="删除">
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProvider(provider.id);
                    }}
                    style={{
                      fontSize: '12px',
                      color: provider.selected
                        ? 'rgba(255, 255, 255, 0.9)'
                        : (isDarkMode ? '#ff7875' : '#ff4d4f'),
                      padding: '2px 6px',
                      height: '24px',
                      width: '24px'
                    }}
                  />
                </Tooltip>
              </div>

            </div>
          ))}
          </div>
        </Card>

        {/* 添加/编辑 API 服务商模态框 */}
        <Modal
          title={editingProvider ? "编辑 API 服务商" : "添加 API 服务商"}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingProvider(null);
            form.resetFields();
          }}
          footer={null}
          width={650}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: '',
              apiUrl: '',
              apiKey: '',
              model: 'claude-3-sonnet-20240229',
              maxTokens: 4096,
              temperature: 0.7,
            }}
          >
            <Form.Item
              label="API 服务商模板"
              tooltip="选择预设的 API 服务商模板，会自动填充相关配置"
            >
              <Select
                placeholder="选择 API 服务商模板（可选）"
                onChange={handleTemplateChange}
                allowClear
                style={{ width: '100%' }}
              >
                {providerTemplates.map(template => (
                  <Select.Option key={template.id} value={template.id}>
                    <div>
                      <Text strong>{template.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {template.description}
                      </Text>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="name"
              label="API 服务商名称"
              rules={[{ required: true, message: '请输入 API 服务商名称' }]}
            >
              <Input placeholder="输入 API 服务商名称" />
            </Form.Item>

            <Form.Item
              name="apiUrl"
              label="API 地址"
              rules={[
                { required: true, message: '请输入API地址' },
                { type: 'url', message: '请输入有效的URL' }
              ]}
            >
              <Input placeholder="https://api.anthropic.com" />
            </Form.Item>

            <Form.Item
              name="apiKey"
              label="API 密钥"
              rules={[{ required: true, message: '请输入API密钥' }]}
            >
              <Input.Password placeholder="输入API密钥" />
            </Form.Item>

            <Form.Item
              name="model"
              label="模型"
              rules={[{ required: true, message: '请选择模型' }]}
            >
              <Select placeholder="选择模型" style={{ width: '100%' }}>
                <Select.Option value="claude-3-opus-20240229">Claude 3 Opus</Select.Option>
                <Select.Option value="claude-3-sonnet-20240229">Claude 3 Sonnet</Select.Option>
                <Select.Option value="claude-3-haiku-20240307">Claude 3 Haiku</Select.Option>
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="maxTokens"
                  label="最大令牌数"
                  rules={[{ required: true, message: '请输入最大令牌数' }]}
                >
                  <Select
                    placeholder="选择最大令牌数"
                    style={{ width: '100%' }}
                  >
                    <Select.Option value={1024}>1024</Select.Option>
                    <Select.Option value={2048}>2048</Select.Option>
                    <Select.Option value={4096}>4096</Select.Option>
                    <Select.Option value={8192}>8192</Select.Option>
                    <Select.Option value={100000}>100K</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="temperature"
                  label="温度参数"
                  rules={[{ required: true, message: '请输入温度值' }]}
                >
                  <Select
                    placeholder="选择温度"
                    style={{ width: '100%' }}
                  >
                    <Select.Option value={0.1}>0.1 (更严格)</Select.Option>
                    <Select.Option value={0.3}>0.3</Select.Option>
                    <Select.Option value={0.7}>0.7 (平衡)</Select.Option>
                    <Select.Option value={1.0}>1.0 (更自由)</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setModalVisible(false);
                  setEditingProvider(null);
                  form.resetFields();
                }}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingProvider ? '更新' : '添加'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default ClaudeProviderManager;