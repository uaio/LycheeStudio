import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Space,
  Modal,
  Form,
  App,
  Tooltip,
  Select,
  InputNumber,
  Divider,
} from 'antd';
import './ClaudeProviderManager.css';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ExclamationOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import {
  Brain,
  Zap,
  Cpu,
  Globe,
  Moon,
  Video,
  Search,
  Cloud,
  Database,
  Package,
  Router,
  Cat,
  Bot,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { providerTemplates } from '../data/providerTemplates';
import { safeStorage } from '../utils/storage';

const { Title, Text } = Typography;

// 图标映射函数
const getProviderIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'Brain': Brain,
    'Zap': Zap,
    'Cpu': Cpu,
    'Globe': Globe,
    'Moon': Moon,
    'Video': Video,
    'Search': Search,
    'Cloud': Cloud,
    'Database': Database,
    'Package': Package,
    'Router': Router,
    'Cat': Cat,
    'Bot': Bot,
    'MessageSquare': MessageSquare,
    'Sparkles': Sparkles,
  };
  return iconMap[iconName] || Bot; // 默认使用Bot图标
};

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
  icon?: string; // 图标字段
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

const ClaudeProviderManager: React.FC<{ isDarkMode: boolean; collapsed?: boolean }> = ({
  isDarkMode,
  collapsed = false
}) => {
  const { message } = App.useApp();

  const [providers, setProviders] = useState<APIProvider[]>([
    {
      id: '1',
      name: 'Claude 默认',
      type: 'official',
      apiUrl: 'https://api.anthropic.com',
      apiKey: '',
      model: '',
      maxTokens: 4096,
      temperature: 0.7,
      selected: true,
      status: 'connected',
      icon: 'Bot',
      env: {},
      apiSettings: {}
    }
  ]);

    const [modalVisible, setModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<APIProvider | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      // 从localStorage加载用户设置的提供商
      const savedProviders = safeStorage.getItem('claude-providers');
      let userProviders: APIProvider[] = [];

      let selectedUserProvider: APIProvider | null = null;

  if (savedProviders) {
        const parsedProviders = JSON.parse(savedProviders);

        // 检查是否有选中的提供商
        const hasSelectedProvider = parsedProviders.some((p: APIProvider) => p.selected);

        // 分离默认提供商和用户提供商
        const defaultProviderFromStorage = parsedProviders.find((p: APIProvider) => p.id === '1');
        userProviders = parsedProviders.filter((p: APIProvider) => p.id !== '1');

        // 检查是否选中了默认提供商
        const isDefaultSelected = defaultProviderFromStorage?.selected || false;
        selectedUserProvider = hasSelectedProvider ? userProviders.find(p => p.selected) : null;
      }

      // 创建默认提供商
      const defaultProvider: APIProvider = {
        id: '1',
        name: 'Claude 默认',
        type: 'official',
        apiUrl: 'https://api.anthropic.com',
        apiKey: '',
        model: '',
        maxTokens: 4096,
        temperature: 0.7,
        selected: false, // 默认不选中，稍后根据实际情况设置
        status: 'connected',
        icon: 'Bot',
        env: {},
        apiSettings: {}
      };

      // 根据保存的状态设置选中状态
      if (selectedUserProvider) {
        // 如果有选中的用户提供商，确保它被选中
        const providerIndex = userProviders.findIndex(p => p.id === selectedUserProvider.id);
        if (providerIndex !== -1) {
          userProviders[providerIndex].selected = true;
        }
        // 确保默认提供商未被选中
        defaultProvider.selected = false;
      } else {
        // 如果没有选中的用户提供商，选中默认提供商
        defaultProvider.selected = true;
      }

      // 合并默认提供商和用户创建的提供商
      setProviders([defaultProvider, ...userProviders]);
    } catch (error) {
      message.error('加载 API 服务商失败');
    }
  };

  const saveProviders = useCallback((updatedProviders: APIProvider[]) => {
    try {
      // 确保只有一个提供商被选中
      const selectedCount = updatedProviders.filter(p => p.selected).length;
      let providersToSave = updatedProviders;

      if (selectedCount > 1) {
        // 如果有多个被选中，只保留第一个选中的
        let foundSelected = false;
        providersToSave = updatedProviders.map(provider => {
          if (provider.selected && !foundSelected) {
            foundSelected = true;
            return { ...provider, selected: true };
          } else {
            return { ...provider, selected: false };
          }
        });
      } else if (selectedCount === 0) {
        // 如果没有选中的，默认选中第一个
        providersToSave = updatedProviders.map((provider, index) => ({
          ...provider,
          selected: index === 0
        }));
      }

      // 只保存用户创建的提供商（过滤掉默认提供商）
      const userProviders = providersToSave.filter(p => p.id !== '1');
      safeStorage.setItem('claude-providers', JSON.stringify(userProviders));

      // 更新.claude/settings.json
      const selectedProvider = providersToSave.find(p => p.selected);
      if (selectedProvider) {
        if (selectedProvider.id === '1') {
          // 如果选中的是默认提供商，清空settings.json中的env和apiSettings
          clearSettingsFile();
        } else {
          // 调用API更新settings.json
          updateSettingsFile(selectedProvider);
        }
      }
    } catch (error) {
      console.error('保存提供商失败:', error);
    }
  }, []);

  const updateSettingsFile = async (provider: APIProvider) => {
    try {
      // 使用Electron API来更新用户目录下的.claude/settings.json
      if (window.electronAPI) {
        const result = await window.electronAPI.writeUserSettings({
          env: provider.env,
          apiSettings: provider.apiSettings
        });

        if (result.success) {
          console.log('设置保存成功:', result);
        } else {
          throw new Error(result.error);
        }
      } else {
        // 如果在浏览器环境（非Electron），保存到localStorage
        const settings = {
          env: provider.env,
          apiSettings: provider.apiSettings
        };
        safeStorage.setItem('claude-settings', JSON.stringify(settings));
      }
    } catch (error) {
      console.error('更新settings.json失败:', error);
      message.error('保存设置失败');
    }
  };

  const clearSettingsFile = async () => {
    try {
      // 使用Electron API来清空用户目录下.claude/settings.json中的env和apiSettings
      if (window.electronAPI) {
        const result = await window.electronAPI.writeUserSettings({
          env: {},
          apiSettings: {}
        });

        if (result.success) {
          console.log('设置清空成功:', result);
        } else {
          throw new Error(result.error);
        }
      } else {
        // 如果在浏览器环境（非Electron），清空localStorage
        safeStorage.setItem('claude-settings', JSON.stringify({
          env: {},
          apiSettings: {}
        }));
      }
    } catch (error) {
      console.error('清空settings.json失败:', error);
      message.error('清空设置失败');
    }
  };

  const handleSelectProvider = useCallback((providerId: string) => {
    const updatedProviders = providers.map(provider =>
      provider.id === providerId
        ? { ...provider, selected: true, status: 'connected' as const }
        : { ...provider, selected: false }
    );
    setProviders(updatedProviders);
    saveProviders(updatedProviders);
    message.success('已切换 API 服务商');
  }, [providers, saveProviders]);

  const handleEditProvider = (provider: APIProvider) => {
    setEditingProvider(provider);
    form.setFieldsValue(provider);
    setModalVisible(true);
  };

  const handleDeleteProvider = (providerId: string) => {
    // 检查要删除的提供商是否被选中
    const providerToDelete = providers.find(p => p.id === providerId);

    if (providerToDelete?.selected) {
      message.warning('选中的 API 服务商不能删除，请先切换到其他提供商');
      return;
    }

    setProviderToDelete(providerId);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (providerToDelete) {
      const updatedProviders = providers.filter(p => p.id !== providerToDelete);
      setProviders(updatedProviders);
      saveProviders(updatedProviders);
      message.success('API 服务商已删除');
      setDeleteModalVisible(false);
      setProviderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setProviderToDelete(null);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = providerTemplates.find(t => t.id === templateId);
    if (template) {
      form.setFieldsValue({
        name: template.name,
        env: template.env,
        apiSettings: template.apiSettings,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // 基于env字段生成其他必需字段
      const env = values.env || {};

      // 获取当前选择的模板图标
      let selectedIcon = 'Brain'; // 默认图标
      if (selectedTemplate) {
        const template = providerTemplates.find(t => t.id === selectedTemplate);
        if (template) {
          selectedIcon = template.icon;
        }
      }

      const providerData = {
        name: values.name,
        apiUrl: env.ANTHROPIC_BASE_URL || '',
        apiKey: env.ANTHROPIC_AUTH_TOKEN || '',
        model: env.ANTHROPIC_DEFAULT_SONNET_MODEL || env.ANTHROPIC_DEFAULT_HAIKU_MODEL || '',
        maxTokens: 4096,
        temperature: 0.7,
        icon: selectedIcon,
        env: {
          ANTHROPIC_AUTH_TOKEN: env.ANTHROPIC_AUTH_TOKEN || '',
          ANTHROPIC_BASE_URL: env.ANTHROPIC_BASE_URL || '',
          ANTHROPIC_DEFAULT_HAIKU_MODEL: env.ANTHROPIC_DEFAULT_HAIKU_MODEL || '',
          ANTHROPIC_DEFAULT_SONNET_MODEL: env.ANTHROPIC_DEFAULT_SONNET_MODEL || '',
          ANTHROPIC_DEFAULT_OPUS_MODEL: env.ANTHROPIC_DEFAULT_OPUS_MODEL || '',
        },
        apiSettings: {
          timeout: values.apiSettings?.timeout || 3000000,
          retryAttempts: values.apiSettings?.retryAttempts || 3,
          retryDelay: values.apiSettings?.retryDelay || 1000,
        },
        type: values.name?.toLowerCase().includes('claude') ? 'official' : 'custom'
      };

      let updatedProviders: APIProvider[];

      if (editingProvider) {
        updatedProviders = providers.map(provider =>
          provider.id === editingProvider.id
            ? { ...provider, ...providerData }
            : provider
        );
        setProviders(updatedProviders);
        message.success('API 服务商更新成功');
      } else {
        const newProvider: APIProvider = {
          id: Date.now().toString(),
          selected: false,
          status: 'disconnected',
          ...providerData
        };
        updatedProviders = [...providers, newProvider];
        setProviders(updatedProviders);
        message.success('API 服务商添加成功');
      }

      // 保存到localStorage和更新settings.json
      saveProviders(updatedProviders);
      setModalVisible(false);
      setEditingProvider(null);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleAddNew = () => {
    setEditingProvider(null);
    setSelectedTemplate(null);
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
          styles={{ body: { padding: '24px' } }}
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
                background: provider.selected
                  ? 'rgba(255, 255, 255, 0.2)'
                  : (provider.type === 'official'
                    ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                    : 'linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {(() => {
                  const IconComponent = getProviderIcon(provider.icon || 'Brain');
                  return (
                    <IconComponent
                      size={18}
                      color={provider.selected ? '#ffffff' : '#ffffff'}
                    />
                  );
                })()}
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
                  {provider.id === '1' ? provider.apiUrl : (provider.env?.ANTHROPIC_BASE_URL || '未设置')}
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
                    ? '1px solid rgba(255, 255, 255, 0.8)'
                    : (isDarkMode ? '1px solid #595959' : '1px solid #d9d9d9'),
                  background: provider.selected
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'transparent',
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
                        ? '#1890ff'
                        : (isDarkMode ? '#a0a0a0' : '#666666'),
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ✓
                    </div>
                  ) : null}
                </div>

                {/* 编辑按钮 - 只有非默认提供商才显示 */}
                {provider.id !== '1' && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProvider(provider);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: provider.selected
                        ? '1px solid rgba(255, 255, 255, 0.8)'
                        : (isDarkMode ? '1px solid #595959' : '1px solid #d9d9d9'),
                      background: provider.selected
                        ? 'rgba(255, 255, 255, 0.9)'
                        : (isDarkMode ? '#404040' : '#e0e0e0'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ExclamationOutlined
                      style={{
                        fontSize: '12px',
                        color: provider.selected
                          ? '#1890ff'
                          : (isDarkMode ? '#a0a0a0' : '#666666')
                      }}
                    />
                  </div>
                )}

                {/* 删除按钮 - 只有非默认提供商才显示，且选中的提供商不能删除 */}
                {provider.id !== '1' && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!provider.selected) {
                        handleDeleteProvider(provider.id);
                      }
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: provider.selected
                        ? '1px solid rgba(255, 255, 255, 0.8)'
                        : (isDarkMode ? '1px solid #ff7875' : '1px solid #ff4d4f'),
                      background: provider.selected
                        ? 'rgba(255, 255, 255, 0.9)'
                        : (isDarkMode ? 'rgba(255, 120, 117, 0.4)' : 'rgba(255, 77, 79, 0.4)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: provider.selected ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: provider.selected ? 0.6 : 1
                    }}
                  >
                    <MinusOutlined
                      style={{
                        fontSize: '12px',
                        color: provider.selected
                          ? '#1890ff'
                          : (isDarkMode ? '#ff7875' : '#ff4d4f')
                      }}
                    />
                  </div>
                )}
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
            setSelectedTemplate(null);
            form.resetFields();
          }}
          footer={null}
          width={700}
          style={{ top: 20 }}
          styles={{
            body: {
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
              padding: '20px 24px'
            }
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
                {providerTemplates.map(template => {
                  const IconComponent = getProviderIcon(template.icon);
                  return (
                    <Select.Option key={template.id} value={template.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconComponent size={16} />
                        {template.name}
                      </div>
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>

            {/* 选中的模板信息显示 */}
            {selectedTemplate && (() => {
              const template = providerTemplates.find(t => t.id === selectedTemplate);
              return template ? (
                <div style={{
                  padding: '12px 16px',
                  background: isDarkMode ? '#1f1f1f' : '#f6f8fa',
                  borderRadius: '8px',
                  border: `1px solid ${isDarkMode ? '#303030' : '#d9d9d9'}`,
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Text strong style={{ color: isDarkMode ? '#ffffff' : '#262626' }}>
                      {template.name}
                    </Text>
                    <a
                      href={template.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '12px',
                        color: '#1890ff',
                        textDecoration: 'none'
                      }}
                    >
                      开发文档
                    </a>
                    {template.apiDocs && (
                      <>
                        <Text style={{ color: isDarkMode ? '#8c8c8c' : '#666666' }}>|</Text>
                        <a
                          href={template.apiDocs}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '12px',
                            color: '#1890ff',
                            textDecoration: 'none'
                          }}
                        >
                          API文档
                        </a>
                      </>
                    )}
                    {template.website && (
                      <>
                        <Text style={{ color: isDarkMode ? '#8c8c8c' : '#666666' }}>|</Text>
                        <a
                          href={template.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '12px',
                            color: '#1890ff',
                            textDecoration: 'none'
                          }}
                        >
                          官网
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ) : null;
            })()}

            {/* 平铺展示所有表单字段 */}
            {/* 基本信息 */}
            <Title level={5}>基本信息</Title>
            <Form.Item
              name="name"
              label="API 服务商名称"
              rules={[{ required: true, message: '请输入 API 服务商名称' }]}
            >
              <Input placeholder="输入 API 服务商名称" style={{ width: '100%' }} />
            </Form.Item>

            <Divider />

            {/* 环境变量配置 */}
            <Title level={5}>环境变量配置</Title>
            <Form.Item
              name={['env', 'ANTHROPIC_AUTH_TOKEN']}
              label="认证令牌 (ANTHROPIC_AUTH_TOKEN)"
              rules={[{ required: true, message: '请输入认证令牌' }]}
              tooltip="用于API认证的令牌"
            >
              <Input.Password placeholder="输入认证令牌" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name={['env', 'ANTHROPIC_BASE_URL']}
              label="基础URL (ANTHROPIC_BASE_URL)"
              rules={[{ required: true, message: '请输入基础URL' }]}
              tooltip="API的基础URL地址"
            >
              <Input placeholder="https://api.anthropic.com" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name={['env', 'ANTHROPIC_DEFAULT_HAIKU_MODEL']}
              label="Haiku模型"
              tooltip="快速响应的模型，适用于简单任务"
            >
              <Input placeholder="例如: claude-3-haiku-20240307" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name={['env', 'ANTHROPIC_DEFAULT_SONNET_MODEL']}
              label="Sonnet模型"
              tooltip="均衡性能的模型，适用于大多数任务"
            >
              <Input placeholder="例如: claude-3-sonnet-20240229" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name={['env', 'ANTHROPIC_DEFAULT_OPUS_MODEL']}
              label="Opus模型"
              tooltip="高性能模型，适用于复杂任务"
            >
              <Input placeholder="例如: claude-3-opus-20240229" style={{ width: '100%' }} />
            </Form.Item>

            <Divider />

            {/* API设置 */}
            <Title level={5}>API 设置</Title>
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
                setSelectedTemplate(null);
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

      {/* 删除确认模态框 */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="删除"
        cancelText="取消"
        okType="danger"
        icon={<ExclamationCircleOutlined />}
      >
        <p>确定要删除这个 API 服务商吗？此操作无法撤销。</p>
      </Modal>
      </div>
    </div>
  );
};

export default ClaudeProviderManager;