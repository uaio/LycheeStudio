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
  // 预置的供应商模板
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
      message.error('加载提供商失败');
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
    message.success('已切换提供商');
  }, []);

  const handleEditProvider = (provider: APIProvider) => {
    setEditingProvider(provider);
    form.setFieldsValue(provider);
    setModalVisible(true);
  };

  const handleDeleteProvider = (providerId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个提供商吗？此操作无法撤销。',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setProviders(prev => prev.filter(p => p.id !== providerId));
        message.success('提供商已删除');
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
        message.success('提供商更新成功');
      } else {
        const newProvider: APIProvider = {
          id: Date.now().toString(),
          ...values,
          selected: false,
          status: 'disconnected'
        };
        setProviders(prev => [...prev, newProvider]);
        message.success('提供商添加成功');
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
        
        
        {/* 添加提供商按钮 */}
        <div style={{ marginBottom: '24px' }}>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            style={{
              height: '48px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
            }}
          >
            添加新提供商
          </Button>
        </div>

        {/* 提供商列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {providers.map(provider => (
            <div
              key={provider.id}
              onClick={() => handleSelectProvider(provider.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                gap: '16px',
                borderRadius: '12px',
                background: provider.selected
                  ? 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)'
                  : '#ffffff',
                border: provider.selected
                  ? '2px solid #1890ff'
                  : '1px solid #e8e8e8',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: provider.selected
                  ? '0 4px 16px rgba(24, 144, 255, 0.15)'
                  : '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
              onMouseEnter={(e) => {
                if (!provider.selected) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!provider.selected) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                }
              }}
            >
              {/* 左侧图标 */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: provider.type === 'official'
                  ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                  : 'linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#ffffff',
                flexShrink: 0
              }}>
                {provider.type === 'official' ? '🤖' : '🔧'}
              </div>

              {/* 中间信息 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#262626',
                  marginBottom: '4px'
                }}>
                  {provider.name}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#8c8c8c'
                }}>
                  {provider.model}
                </div>
              </div>

              {/* 右侧操作按钮 */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 选中状态 */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  {provider.selected ? (
                    <CheckCircleFilled style={{ color: '#52c41a', fontSize: '14px' }} />
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
                      fontSize: '14px',
                      color: '#666666',
                      padding: '4px 8px'
                    }}
                  />
                </Tooltip>

                {/* 删除按钮 */}
                <Tooltip title="删除">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProvider(provider.id);
                    }}
                    style={{
                      fontSize: '14px',
                      color: '#ff4d4f',
                      padding: '4px 8px'
                    }}
                  />
                </Tooltip>
              </div>

              </div>
          ))}
        </div>

    
        {/* 添加/编辑提供商模态框 */}
        <Modal
          title={editingProvider ? "编辑提供商" : "添加提供商"}
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
              label="供应商模板"
              tooltip="选择预设的供应商模板，会自动填充相关配置"
            >
              <Select
                placeholder="选择供应商模板（可选）"
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
              label="提供商名称"
              rules={[{ required: true, message: '请输入提供商名称' }]}
            >
              <Input placeholder="输入提供商名称" />
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