import React, { useState, useEffect } from 'react';
import {
  Save,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface AIModel {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'google';
  maxTokens: number;
  temperature: number;
  enabled: boolean;
  description?: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  category: 'code' | 'analysis' | 'creative' | 'debugging' | 'documentation';
  variables: string[];
  created: string;
  isDefault: boolean;
}

interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  organizationId?: string;
}

const AIConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'prompts' | 'providers'>('models');
  const [models, setModels] = useState<AIModel[]>([]);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [providers, setProviders] = useState<Record<string, ProviderConfig>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // 默认模型配置
  const defaultModels: AIModel[] = [
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
      description: '高性能通用模型，适合代码生成和分析'
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      maxTokens: 4096,
      temperature: 0.5,
      enabled: false,
      description: '最强推理能力，适合复杂任务'
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
      description: '快速响应，适合实时应用'
    },
    {
      id: 'gemini-1-5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      maxTokens: 4096,
      temperature: 0.6,
      enabled: false,
      description: '多模态支持，处理长文本能力强'
    }
  ];

  // 默认Prompt模板
  const defaultPrompts: PromptTemplate[] = [
    {
      id: 'code-review',
      name: '代码审查',
      category: 'code',
      content: `请审查以下代码，重点关注：
1. 代码质量和可读性
2. 潜在的性能问题
3. 安全漏洞
4. 最佳实践符合度

代码：
\`\`\`{{language}}
{{code}}
\`\`\``,
      variables: ['language', 'code'],
      created: new Date().toISOString(),
      isDefault: true
    },
    {
      id: 'bug-fix',
      name: 'Bug修复',
      category: 'debugging',
      content: `问题描述：{{problem}}

代码：
\`\`\`{{language}}
{{code}}
\`\`\`

请分析问题并提供修复方案，包括：
1. 问题根因分析
2. 修复代码
3. 测试建议`,
      variables: ['problem', 'language', 'code'],
      created: new Date().toISOString(),
      isDefault: true
    },
    {
      id: 'optimize-performance',
      name: '性能优化',
      category: 'analysis',
      content: `请分析以下代码的性能并优化：

代码：
\`\`\`{{language}}
{{code}}
\`\`\`

提供：
1. 性能瓶颈分析
2. 优化建议
3. 优化后的代码
4. 性能提升预期`,
      variables: ['language', 'code'],
      created: new Date().toISOString(),
      isDefault: true
    }
  ];

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      // 加载模型配置
      const loadedModels = await loadModels();
      setModels(loadedModels.length > 0 ? loadedModels : defaultModels);

      // 加载Prompt模板
      const loadedPrompts = await loadPrompts();
      setPrompts(loadedPrompts.length > 0 ? loadedPrompts : defaultPrompts);

      // 加载提供商配置
      const loadedProviders = await loadProviders();
      setProviders(loadedProviders);
    } catch (error) {
      console.error('加载配置失败:', error);
      setModels(defaultModels);
      setPrompts(defaultPrompts);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModels = async (): Promise<AIModel[]> => {
    try {
      const result = await invoke<string>('get_ai_models');
      return JSON.parse(result);
    } catch (error) {
      console.warn('加载模型配置失败:', error);
      return [];
    }
  };

  const loadPrompts = async (): Promise<PromptTemplate[]> => {
    try {
      const result = await invoke<string>('get_prompt_templates');
      return JSON.parse(result);
    } catch (error) {
      console.warn('加载Prompt模板失败:', error);
      return [];
    }
  };

  const loadProviders = async (): Promise<Record<string, ProviderConfig>> => {
    try {
      const result = await invoke<string>('get_provider_configs');
      return JSON.parse(result);
    } catch (error) {
      console.warn('加载提供商配置失败:', error);
      return {};
    }
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        invoke('save_ai_models', { models: JSON.stringify(models) }),
        invoke('save_prompt_templates', { prompts: JSON.stringify(prompts) }),
        invoke('save_provider_configs', { providers: JSON.stringify(providers) })
      ]);
      setSaveMessage('配置已保存成功！');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('保存配置失败:', error);
      setSaveMessage('保存失败，请重试');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updateModel = (modelId: string, updates: Partial<AIModel>) => {
    setModels(prev => prev.map(model =>
      model.id === modelId ? { ...model, ...updates } : model
    ));
  };

  const updatePrompt = (promptId: string, updates: Partial<PromptTemplate>) => {
    setPrompts(prev => prev.map(prompt =>
      prompt.id === promptId ? { ...prompt, ...updates } : prompt
    ));
  };

  const updateProvider = (provider: string, updates: Partial<ProviderConfig>) => {
    setProviders(prev => ({
      ...prev,
      [provider]: { ...prev[provider], ...updates }
    }));
  };

  const addPrompt = () => {
    const newPrompt: PromptTemplate = {
      id: `custom-${Date.now()}`,
      name: '新Prompt模板',
      content: '请在此输入Prompt内容...',
      category: 'code',
      variables: [],
      created: new Date().toISOString(),
      isDefault: false
    };
    setPrompts(prev => [...prev, newPrompt]);
  };

  const deletePrompt = (promptId: string) => {
    setPrompts(prev => prev.filter(prompt => prompt.id !== promptId));
  };

  const toggleModelEnabled = (modelId: string) => {
    updateModel(modelId, { enabled: !models.find(m => m.id === modelId)?.enabled });
  };

  const copyPrompt = (promptId: string) => {
    const original = prompts.find(p => p.id === promptId);
    if (original) {
      const newPrompt: PromptTemplate = {
        ...original,
        id: `copy-${Date.now()}`,
        name: `${original.name} (副本)`,
        isDefault: false
      };
      setPrompts(prev => [...prev, newPrompt]);
    }
  };

  const renderModelsTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>AI模型配置</h2>
        <p className="section-description">选择和配置您要使用的AI模型</p>
      </div>

      <div className="models-grid">
        {models.map((model) => (
          <div key={model.id} className={`model-card ${model.enabled ? 'enabled' : 'disabled'}`}>
            <div className="model-header">
              <div className="model-info">
                <h3 className="model-name">{model.name}</h3>
                <span className="model-provider">{model.provider}</span>
              </div>
              <div className="model-controls">
                <button
                  onClick={() => toggleModelEnabled(model.id)}
                  className={`toggle-btn ${model.enabled ? 'on' : 'off'}`}
                >
                  <div className="toggle-slider"></div>
                </button>
              </div>
            </div>

            {model.description && (
              <p className="model-description">{model.description}</p>
            )}

            <div className="model-settings">
              <div className="setting-item">
                <label>最大Token</label>
                <input
                  type="number"
                  value={model.maxTokens}
                  onChange={(e) => updateModel(model.id, { maxTokens: parseInt(e.target.value) })}
                  min="1"
                  max="100000"
                />
              </div>

              <div className="setting-item">
                <label>Temperature: {model.temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={model.temperature}
                  onChange={(e) => updateModel(model.id, { temperature: parseFloat(e.target.value) })}
                />
                <div className="range-labels">
                  <span>保守</span>
                  <span>创意</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPromptsTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>Prompt模板管理</h2>
        <div className="section-actions">
          <button onClick={addPrompt} className="btn btn-primary">
            <Plus size={16} />
            新建模板
          </button>
        </div>
      </div>

      <div className="prompts-container">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="prompt-card">
            <div className="prompt-header">
              <div className="prompt-info">
                <h3 className="prompt-name">{prompt.name}</h3>
                <div className="prompt-meta">
                  <span className={`category-badge ${prompt.category}`}>{prompt.category}</span>
                  {prompt.isDefault && <span className="default-badge">默认</span>}
                </div>
              </div>
              <div className="prompt-actions">
                <button onClick={() => copyPrompt(prompt.id)} title="复制">
                  <Copy size={16} />
                </button>
                {!prompt.isDefault && (
                  <button onClick={() => deletePrompt(prompt.id)} title="删除">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="prompt-content">
              <textarea
                value={prompt.content}
                onChange={(e) => updatePrompt(prompt.id, { content: e.target.value })}
                placeholder="输入Prompt模板内容..."
                rows={4}
              />
            </div>

            <div className="prompt-variables">
              <label>变量：</label>
              <input
                type="text"
                value={prompt.variables.join(', ')}
                onChange={(e) => updatePrompt(prompt.id, {
                  variables: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                })}
                placeholder="变量名，用逗号分隔"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProvidersTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>API提供商配置</h2>
        <p className="section-description">配置各个AI服务提供商的API密钥</p>
      </div>

      <div className="providers-grid">
        {['anthropic', 'openai', 'google'].map((provider) => (
          <div key={provider} className="provider-card">
            <div className="provider-header">
              <h3 className="provider-name">
                {provider === 'anthropic' && 'Anthropic Claude'}
                {provider === 'openai' && 'OpenAI'}
                {provider === 'google' && 'Google Gemini'}
              </h3>
              <div className="provider-status">
                {providers[provider]?.apiKey ? (
                  <span className="status-configured">
                    <CheckCircle size={16} />
                    已配置
                  </span>
                ) : (
                  <span className="status-unconfigured">
                    <AlertCircle size={16} />
                    未配置
                  </span>
                )}
              </div>
            </div>

            <div className="provider-settings">
              <div className="setting-item">
                <label>API Key</label>
                <div className="input-group">
                  <input
                    type={showApiKeys[provider] ? 'text' : 'password'}
                    value={providers[provider]?.apiKey || ''}
                    onChange={(e) => updateProvider(provider, { apiKey: e.target.value })}
                    placeholder="输入API Key"
                  />
                  <button
                    onClick={() => setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider] }))}
                    className="btn btn-secondary"
                  >
                    {showApiKeys[provider] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {provider === 'openai' && (
                <div className="setting-item">
                  <label>Organization ID (可选)</label>
                  <input
                    type="text"
                    value={providers[provider]?.organizationId || ''}
                    onChange={(e) => updateProvider(provider, { organizationId: e.target.value })}
                    placeholder="组织ID"
                  />
                </div>
              )}

              <div className="setting-item">
                <label>Base URL (可选)</label>
                <input
                  type="url"
                  value={providers[provider]?.baseUrl || ''}
                  onChange={(e) => updateProvider(provider, { baseUrl: e.target.value })}
                  placeholder="自定义API端点"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="ai-config">
      {/* 保存状态提示 */}
      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('成功') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      {/* 标签页导航 */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            <Settings size={18} />
            模型配置
          </button>
          <button
            className={`tab ${activeTab === 'prompts' ? 'active' : ''}`}
            onClick={() => setActiveTab('prompts')}
          >
            <Edit3 size={18} />
            Prompt模板
          </button>
          <button
            className={`tab ${activeTab === 'providers' ? 'active' : ''}`}
            onClick={() => setActiveTab('providers')}
          >
            <Settings size={18} />
            API配置
          </button>
        </div>

        <div className="save-section">
          <button
            onClick={saveConfiguration}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save size={16} />
                保存配置
              </>
            )}
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="content-area">
        {activeTab === 'models' && renderModelsTab()}
        {activeTab === 'prompts' && renderPromptsTab()}
        {activeTab === 'providers' && renderProvidersTab()}
      </div>
    </div>
  );
};

export default AIConfig;