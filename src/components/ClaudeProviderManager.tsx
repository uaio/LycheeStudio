import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Tooltip,
  Row,
  Col,
  Select,
  InputNumber,
  Collapse,
} from 'antd';
import './ClaudeProviderManager.css';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

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
  // 新增字段
  env: {
    ANTHROPIC_AUTH_TOKEN: string;
    ANTHROPIC_BASE_URL: string;
    ANTHROPIC_DEFAULT_HAIKU_MODEL: string;
    ANTHROPIC_DEFAULT_SONNET_MODEL: string;
    ANTHROPIC_DEFAULT_OPUS_MODEL: string;
  };
  apiSettings: {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

interface ProviderTemplate {
  id: string;
  name: string;
  description: string;
  env: {
    ANTHROPIC_AUTH_TOKEN: string;
    ANTHROPIC_BASE_URL: string;
    ANTHROPIC_DEFAULT_HAIKU_MODEL: string;
    ANTHROPIC_DEFAULT_SONNET_MODEL: string;
    ANTHROPIC_DEFAULT_OPUS_MODEL: string;
  };
  apiSettings: {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

const ClaudeProviderManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean }> = ({
  isDarkMode,
  collapsed = false
}) => {
  // 预置的 API 服务商模板
  const providerTemplates: ProviderTemplate[] = [
    {
      id: 'zhipu-ai',
      name: '智谱 AI',
      description: '智谱AI提供的Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://open.bigmodel.cn/api/anthropic',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'glm-4.5-air',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'glm-4.6',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'glm-4.6'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
    {
      id: 'z-ai',
      name: 'z.ai',
      description: 'z.ai提供的Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://api.z.ai/api/anthropic',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'glm-4.5-air',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'glm-4.6',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'glm-4.6'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
    {
      id: 'minimax-cn',
      name: 'MiniMax 国内版',
      description: 'MiniMax国内版Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://api.minimaxi.com/anthropic',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'MiniMax-M2',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'MiniMax-M2',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'MiniMax-M2'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
    {
      id: 'minimax-intl',
      name: 'MiniMax 国际版',
      description: 'MiniMax国际版Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://api.minimax.io/anthropic',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'MiniMax-M2',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'MiniMax-M2',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'MiniMax-M2'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
    {
      id: 'moonshot',
      name: '月之暗面 (Moonshot)',
      description: '月之暗面提供的Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://api.moonshot.cn/anthropic',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'kimi-k2-turbo-preview',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'kimi-k2-turbo-preview',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'kimi-k2-turbo-preview'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
    {
      id: 'kuaishou',
      name: '快手万擎',
      description: '快手万擎提供的Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://wanqing.streamlakeapi.com/api/gateway/v1/endpoints/xxx/claude-code-proxy',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'KAT-Coder',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'KAT-Coder',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'KAT-Coder'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
    {
      id: 'deepseek',
      name: '深度求索 (DeepSeek)',
      description: '深度求索提供的Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://api.deepseek.com/anthropic',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'deepseek-chat',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'deepseek-chat',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'deepseek-chat'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
    {
      id: 'alibaba-bailian',
      name: '阿里云百炼',
      description: '阿里云百炼提供的Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://dashscope.aliyuncs.com/apps/anthropic',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'qwen-flash',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'qwen-max',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'qwen-max'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
    {
      id: 'modelscope',
      name: '魔搭 ModelScope',
      description: '魔搭ModelScope提供的Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://api-inference.modelscope.cn',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'Qwen/Qwen3-Coder-480B-A35B-Instruct',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'deepseek-ai/DeepSeek-R1-0528',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'Qwen/Qwen3-Coder-480B-A35B-Instruct'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
    {
      id: 'packycode',
      name: 'PackyCode',
      description: 'PackyCode提供的Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://api.packycode.com',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: '',
        ANTHROPIC_DEFAULT_SONNET_MODEL: '',
        ANTHROPIC_DEFAULT_OPUS_MODEL: ''
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
    {
      id: 'anyrouter',
      name: 'AnyRouter',
      description: 'AnyRouter提供的Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://anyrouter.top',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: '',
        ANTHROPIC_DEFAULT_SONNET_MODEL: '',
        ANTHROPIC_DEFAULT_OPUS_MODEL: ''
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
    {
      id: 'longcat',
      name: 'LongCat',
      description: 'LongCat提供的Claude兼容API服务',
      env: {
        ANTHROPIC_AUTH_TOKEN: '',
        ANTHROPIC_BASE_URL: 'https://api.longcat.chat/anthropic',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'LongCat-Flash-Chat',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'LongCat-Flash-Thinking',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'LongCat-Flash-Chat'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
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
      status: 'connected',
      env: {
        ANTHROPIC_AUTH_TOKEN: 'sk-ant-api03-***',
        ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'claude-3-haiku-20240307',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'claude-3-sonnet-20240229',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'claude-3-opus-20240229'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
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
      status: 'disconnected',
      env: {
        ANTHROPIC_AUTH_TOKEN: 'custom-key-***',
        ANTHROPIC_BASE_URL: 'https://my-proxy.example.com/v1',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'claude-3-haiku-20240307',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'claude-3-sonnet-20240229',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'claude-3-opus-20240229'
      },
      apiSettings: {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    },
  ]);

    const [modalVisible, setModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<APIProvider | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      message.error('加载 API 服务商失败');
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
        apiUrl: template.env.ANTHROPIC_BASE_URL,
        apiKey: template.env.ANTHROPIC_AUTH_TOKEN,
        model: template.env.ANTHROPIC_DEFAULT_SONNET_MODEL,
        env: template.env,
        apiSettings: template.apiSettings,
        maxTokens: 4096,
        temperature: 0.7,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // 确保有完整的env和apiSettings字段
      const providerData = {
        ...values,
        env: {
          ANTHROPIC_AUTH_TOKEN: values.env?.ANTHROPIC_AUTH_TOKEN || values.apiKey || '',
          ANTHROPIC_BASE_URL: values.env?.ANTHROPIC_BASE_URL || values.apiUrl || '',
          ANTHROPIC_DEFAULT_HAIKU_MODEL: values.env?.ANTHROPIC_DEFAULT_HAIKU_MODEL || '',
          ANTHROPIC_DEFAULT_SONNET_MODEL: values.env?.ANTHROPIC_DEFAULT_SONNET_MODEL || values.model || '',
          ANTHROPIC_DEFAULT_OPUS_MODEL: values.env?.ANTHROPIC_DEFAULT_OPUS_MODEL || '',
        },
        apiSettings: {
          timeout: values.apiSettings?.timeout || 3000000,
          retryAttempts: values.apiSettings?.retryAttempts || 3,
          retryDelay: values.apiSettings?.retryDelay || 1000,
        },
        type: values.name?.toLowerCase().includes('claude') ? 'official' : 'custom'
      };

      if (editingProvider) {
        setProviders(prev => prev.map(provider =>
          provider.id === editingProvider.id
            ? { ...provider, ...providerData }
            : provider
        ));
        message.success('API 服务商更新成功');
      } else {
        const newProvider: APIProvider = {
          id: Date.now().toString(),
          selected: false,
          status: 'disconnected',
          ...providerData
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
          width={700}
          style={{ top: 20 }}
          bodyStyle={{
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            padding: '20px 24px'
          }}
        >
          <div className="modal-content-scroll" style={{
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                name: '',
                apiUrl: '',
                apiKey: '',
                model: '',
                maxTokens: 4096,
                temperature: 0.7,
                env: {
                  ANTHROPIC_AUTH_TOKEN: '',
                  ANTHROPIC_BASE_URL: '',
                  ANTHROPIC_DEFAULT_HAIKU_MODEL: '',
                  ANTHROPIC_DEFAULT_SONNET_MODEL: '',
                  ANTHROPIC_DEFAULT_OPUS_MODEL: '',
                },
                apiSettings: {
                  timeout: 3000000,
                  retryAttempts: 3,
                  retryDelay: 1000,
                },
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

            {/* 使用折叠面板组织表单字段 */}
            <Collapse
              defaultActiveKey={['basic']}
              items={[
                {
                  key: 'basic',
                  label: '基本信息',
                  children: (
                    <div style={{ padding: '8px 0' }}>
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
                        label="当前使用模型"
                        rules={[{ required: true, message: '请输入模型名称' }]}
                      >
                        <Input placeholder="例如: claude-3-sonnet-20240229" />
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
                    </div>
                  )
                },
                {
                  key: 'env',
                  label: '环境变量配置',
                  children: (
                    <div style={{ padding: '8px 0' }}>
                      <Form.Item
                        name={['env', 'ANTHROPIC_AUTH_TOKEN']}
                        label="认证令牌 (ANTHROPIC_AUTH_TOKEN)"
                        tooltip="用于API认证的令牌"
                      >
                        <Input.Password placeholder="输入认证令牌" />
                      </Form.Item>

                      <Form.Item
                        name={['env', 'ANTHROPIC_BASE_URL']}
                        label="基础URL (ANTHROPIC_BASE_URL)"
                        rules={[{ required: true, message: '请输入基础URL' }]}
                        tooltip="API的基础URL地址"
                      >
                        <Input placeholder="https://api.anthropic.com" />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            name={['env', 'ANTHROPIC_DEFAULT_HAIKU_MODEL']}
                            label="Haiku模型"
                            tooltip="快速响应的模型，适用于简单任务"
                          >
                            <Input placeholder="例如: claude-3-haiku-20240307" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={['env', 'ANTHROPIC_DEFAULT_SONNET_MODEL']}
                            label="Sonnet模型"
                            tooltip="均衡性能的模型，适用于大多数任务"
                          >
                            <Input placeholder="例如: claude-3-sonnet-20240229" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={['env', 'ANTHROPIC_DEFAULT_OPUS_MODEL']}
                            label="Opus模型"
                            tooltip="高性能模型，适用于复杂任务"
                          >
                            <Input placeholder="例如: claude-3-opus-20240229" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: 'apiSettings',
                  label: 'API 设置',
                  children: (
                    <div style={{ padding: '8px 0' }}>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            name={['apiSettings', 'timeout']}
                            label="超时时间 (毫秒)"
                            rules={[{ required: true, message: '请输入超时时间' }]}
                            tooltip="API请求的超时时间"
                          >
                            <InputNumber
                              min={1000}
                              max={30000000}
                              step={1000}
                              style={{ width: '100%' }}
                              placeholder="3000000"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={['apiSettings', 'retryAttempts']}
                            label="重试次数"
                            rules={[{ required: true, message: '请输入重试次数' }]}
                            tooltip="失败时的重试次数"
                          >
                            <InputNumber
                              min={0}
                              max={10}
                              style={{ width: '100%' }}
                              placeholder="3"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name={['apiSettings', 'retryDelay']}
                            label="重试延迟 (毫秒)"
                            rules={[{ required: true, message: '请输入重试延迟' }]}
                            tooltip="重试之间的延迟时间"
                          >
                            <InputNumber
                              min={100}
                              max={10000}
                              step={100}
                              style={{ width: '100%' }}
                              placeholder="1000"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  )
                }
              ]}
            />

            </Form>

          {/* 固定在底部的按钮 */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: isDarkMode ? '#2a2a2a' : 'white',
            borderTop: isDarkMode ? '1px solid #404040' : '1px solid #f0f0f0',
            padding: '16px 24px',
            zIndex: 10
          }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingProvider(null);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button
                type="primary"
                onClick={() => form.submit()}
              >
                {editingProvider ? '更新' : '添加'}
              </Button>
            </Space>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
};

export default ClaudeProviderManager;