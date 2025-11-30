/**
 * API服务商模板数据
 *
 * 此文件包含所有预置的API服务商模板配置
 * 支持远程更新和动态加载
 */

export interface ProviderTemplate {
  id: string;
  name: string;
  description: string;
  category: 'official' | 'domestic' | 'international' | 'proxy';
  icon: string;  // 图标组件名称
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
  tags?: string[];
  website?: string;
  docs: string;  // 开发文档链接（必需）
  apiDocs?: string;  // API文档链接
  status?: 'active' | 'deprecated' | 'experimental';
}

/**
 * 预置的API服务商模板列表
 */
export const providerTemplates: ProviderTemplate[] = [
  {
    id: 'zhipu-ai',
    name: '智谱 AI',
    description: '智谱AI提供的Claude兼容API服务',
    category: 'domestic',
    icon: 'Brain',
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
    },
    tags: ['domestic', 'glm', 'zhipu'],
    website: 'https://www.zhipuai.cn',
    docs: 'https://open.bigmodel.cn/dev/api',
    apiDocs: 'https://open.bigmodel.cn/dev/api#glm4',
    status: 'active'
  },
  {
    id: 'z-ai',
    name: 'z.ai',
    description: 'z.ai提供的Claude兼容API服务',
    category: 'domestic',
    icon: 'Zap',
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
    },
    tags: ['domestic', 'glm'],
    website: 'https://z.ai',
    docs: 'https://z.ai/docs',
    status: 'active'
  },
  {
    id: 'minimax-cn',
    name: 'MiniMax 国内版',
    description: 'MiniMax国内版Claude兼容API服务',
    category: 'domestic',
    icon: 'Cpu',
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
    },
    tags: ['domestic', 'minimax'],
    website: 'https://www.minimaxi.com',
    status: 'active'
  },
  {
    id: 'minimax-intl',
    name: 'MiniMax 国际版',
    description: 'MiniMax国际版Claude兼容API服务',
    category: 'international',
    icon: 'Globe',
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
    },
    tags: ['international', 'minimax'],
    website: 'https://api.minimax.chat',
    status: 'active'
  },
  {
    id: 'moonshot',
    name: '月之暗面 (Moonshot)',
    description: '月之暗面提供的Claude兼容API服务',
    category: 'domestic',
    icon: 'Moon',
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
    },
    tags: ['domestic', 'kimi', 'moonshot'],
    website: 'https://www.moonshot.cn',
    status: 'active'
  },
  {
    id: 'kuaishou',
    name: '快手万擎',
    description: '快手万擎提供的Claude兼容API服务',
    category: 'domestic',
    icon: 'Video',
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
    },
    tags: ['domestic', 'kuaishou', 'kat'],
    status: 'active'
  },
  {
    id: 'deepseek',
    name: '深度求索 (DeepSeek)',
    description: '深度求索提供的Claude兼容API服务',
    category: 'domestic',
    icon: 'Search',
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
    },
    tags: ['domestic', 'deepseek'],
    website: 'https://www.deepseek.com',
    docs: 'https://platform.deepseek.com/api-docs',
    apiDocs: 'https://platform.deepseek.com/api-docs/zh-cn/',
    status: 'active'
  },
  {
    id: 'alibaba-bailian',
    name: '阿里云百炼',
    description: '阿里云百炼提供的Claude兼容API服务',
    category: 'domestic',
    icon: 'Cloud',
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
    },
    tags: ['domestic', 'qwen', 'alibaba'],
    website: 'https://bailian.console.aliyun.com',
    docs: 'https://help.aliyun.com/zh/modelscope/practical-tutorial',
    apiDocs: 'https://help.aliyun.com/zh/modelscope/developer-reference',
    status: 'active'
  },
  {
    id: 'modelscope',
    name: '魔搭 ModelScope',
    description: '魔搭ModelScope提供的Claude兼容API服务',
    category: 'domestic',
    icon: 'Database',
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
    },
    tags: ['domestic', 'qwen', 'modelscope'],
    website: 'https://modelscope.cn',
    status: 'active'
  },
  {
    id: 'packycode',
    name: 'PackyCode',
    description: 'PackyCode提供的Claude兼容API服务',
    category: 'proxy',
    icon: 'Package',
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
    },
    tags: ['proxy'],
    website: 'https://packycode.com',
    docs: 'https://packycode.com/docs',
    status: 'active'
  },
  {
    id: 'anyrouter',
    name: 'AnyRouter',
    description: 'AnyRouter提供的Claude兼容API服务',
    category: 'proxy',
    icon: 'Router',
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
    },
    tags: ['proxy'],
    website: 'https://anyrouter.top',
    docs: 'https://anyrouter.top/docs',
    status: 'active'
  },
  {
    id: 'longcat',
    name: 'LongCat',
    description: 'LongCat提供的Claude兼容API服务',
    category: 'proxy',
    icon: 'Cat',
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
    },
    tags: ['proxy'],
    website: 'https://longcat.chat',
    docs: 'https://longcat.chat/docs',
    status: 'active'
  }
];

/**
 * 按分类获取模板
 */
export const getTemplatesByCategory = (category: ProviderTemplate['category']): ProviderTemplate[] => {
  return providerTemplates.filter(template => template.category === category && template.status !== 'deprecated');
};

/**
 * 根据ID获取模板
 */
export const getTemplateById = (id: string): ProviderTemplate | undefined => {
  return providerTemplates.find(template => template.id === id);
};

/**
 * 搜索模板
 */
export const searchTemplates = (query: string): ProviderTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return providerTemplates.filter(template =>
    template.status !== 'deprecated' && (
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  );
};

/**
 * 获取激活的模板列表
 */
export const getActiveTemplates = (): ProviderTemplate[] => {
  return providerTemplates.filter(template => template.status === 'active');
};