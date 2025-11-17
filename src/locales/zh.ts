import type { Translations } from '../types/i18n';

// 中文翻译
export const zh: Translations = {
  // 通用
  loading: '加载中...',
  save: '保存',
  cancel: '取消',
  confirm: '确认',
  delete: '删除',
  edit: '编辑',
  add: '添加',
  search: '搜索',
  refresh: '刷新',
  settingsText: '设置',
  back: '返回',
  next: '下一步',
  previous: '上一步',
  success: '成功',
  error: '错误',
  warning: '警告',
  info: '信息',
  yes: '是',
  no: '否',
  ok: '确定',
  close: '关闭',

  // 仪表板
  dashboard: {
    title: 'AI 工具管理器',
    subtitle: '管理您的 AI 编程助手和开发环境',
    aiConfig: {
      title: 'AI 工具配置',
      description: '配置和管理 Claude、OpenAI、Gemini 等 AI 编程助手',
      status: {
        configured: '已配置',
        notConfigured: '未配置'
      }
    },
    nodeManager: {
      title: 'Node.js 管理',
      description: '安装和切换不同版本的 Node.js 环境',
      status: {
        installed: '已安装',
        notInstalled: '未安装'
      }
    },
    npmManager: {
      title: 'NPM 包管理',
      description: '管理各 Node.js 版本的全局包和注册表源',
      status: {
        available: '可用',
        notAvailable: '不可用'
      }
    },
    systemSettings: {
      title: '系统设置',
      description: '配置应用偏好设置和系统选项'
    }
  },

  // AI配置
  aiConfig: {
    title: 'AI 工具配置',
    subtitle: '管理 AI 模型、提示词和服务提供商配置',
    tabs: {
      models: '模型管理',
      prompts: '提示词',
      providers: '服务提供商'
    },
    models: {
      title: 'AI 模型管理',
      addModel: '添加模型',
      modelName: '模型名称',
      provider: '提供商',
      maxTokens: '最大令牌数',
      temperature: '温度',
      enabled: '启用',
      actions: '操作'
    },
    prompts: {
      title: '提示词模板',
      addPrompt: '添加提示词',
      promptName: '提示词名称',
      content: '内容',
      category: '类别',
      variables: '变量',
      categories: {
        code: '代码',
        analysis: '分析',
        creative: '创意',
        debugging: '调试',
        documentation: '文档'
      },
      actions: '操作'
    },
    providers: {
      title: '服务提供商配置',
      providerName: '提供商名称',
      apiKey: 'API 密钥',
      baseUrl: '基础URL',
      status: {
        configured: '已配置',
        notConfigured: '未配置'
      },
      actions: '操作'
    }
  },

  // Node管理器
  nodeManager: {
    title: 'Node.js 管理',
    subtitle: '管理 Node.js 版本和环境配置',
    tabs: {
      versions: '版本管理',
      environment: '环境配置',
      global: '全局包'
    },
    versions: {
      title: 'Node.js 版本管理',
      currentVersion: '当前版本',
      installVersion: '安装版本',
      installedVersions: '已安装版本',
      lts: 'LTS',
      latest: 'Latest',
      current: '当前',
      switchTo: '切换到',
      uninstall: '卸载',
      versionNumber: '版本号',
      releaseDate: '发布日期'
    },
    environment: {
      title: '环境配置',
      defaultVersion: '默认版本',
      npmMirror: 'NPM 镜像源',
      selectDefaultVersion: '选择默认版本',
      selectNpmMirror: '选择 NPM 镜像源',
      description: '配置系统启动时使用的默认 Node.js 版本和 NPM 镜像源'
    },
    global: {
      title: '全局包管理',
      subtitle: '管理已安装的全局 npm 包',
      packageName: '包名',
      version: '版本',
      packageDescription: '描述',
      installedAt: '安装时间',
      actions: '操作'
    }
  },

  // NPM管理器
  npmManager: {
    title: 'NPM 包管理',
    subtitle: '管理全局包和注册表源配置',
    tabs: {
      packages: '包管理',
      registry: '注册表源',
      config: '配置管理'
    },
    packages: {
      title: 'NPM 包管理',
      installPackage: '安装包',
      installedPackages: '已安装包',
      packageName: '包名',
      version: '版本',
      packageDescription: '描述',
      installedAt: '安装时间',
      lastUpdated: '更新时间',
      size: '大小',
      actions: '操作',
      quickInstall: '快速安装常用包'
    },
    registry: {
      title: '注册表源配置',
      currentRegistry: '当前注册表源',
      switchRegistry: '切换注册表源',
      customRegistry: '自定义注册表源',
      official: '官方源',
      taobao: '淘宝源',
      tencent: '腾讯源',
      huawei: '华为源',
      netease: '网易源',
      speed: {
        fast: '快速',
        medium: '中等',
        slow: '较慢'
      },
      region: '地区',
      description: '选择适合您网络的 NPM 镜像源以提高下载速度'
    },
    config: {
      title: 'NPM 配置管理',
      globalConfig: '全局配置',
      author: '作者信息',
      email: '邮箱地址',
      license: '默认许可证',
      cache: '缓存管理',
      cacheLocation: '缓存位置',
      cacheSize: '缓存大小',
      lastCleanup: '最后清理',
      clearCache: '清理缓存',
      verifyCache: '验证缓存'
    }
  },

  // 设置
  settings: {
    title: '设置',
    subtitle: '管理应用偏好设置和配置',
    tabs: {
      general: '常规',
      appearance: '外观',
      data: '数据',
      about: '关于',
      help: '帮助'
    },
    general: {
      title: '常规设置',
      language: '语言',
      theme: '主题',
      autoStart: '开机自启',
      notifications: '通知',
      description: '配置应用的基本设置和行为'
    },
    appearance: {
      title: '外观设置',
      theme: {
        light: '浅色',
        dark: '深色',
        system: '跟随系统'
      },
      language: {
        chinese: '中文',
        english: 'English'
      },
      description: '自定义应用的外观和语言设置'
    },
    data: {
      title: '数据管理',
      export: '导出数据',
      import: '导入数据',
      clear: '清除数据',
      description: '管理应用数据的导入、导出和清理'
    },
    about: {
      title: '关于',
      version: '版本',
      author: '作者',
      description: 'AI 工具管理器 - 管理您的 AI 编程助手和开发环境'
    },
    help: {
      title: '帮助',
      documentation: '文档',
      support: '支持',
      feedback: '反馈',
      description: '获取帮助信息和支持资源'
    }
  }
};