// 定义翻译接口类型
export interface Translations {
  // 通用
  loading: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  refresh: string;
  settingsText: string;
  back: string;
  next: string;
  previous: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  yes: string;
  no: string;
  ok: string;
  close: string;

  // 仪表板
  dashboard: {
    title: string;
    subtitle: string;
    aiConfig: {
      title: string;
      description: string;
      status: {
        configured: string;
        notConfigured: string;
      }
    };
    nodeManager: {
      title: string;
      description: string;
      status: {
        installed: string;
        notInstalled: string;
      }
    };
    npmManager: {
      title: string;
      description: string;
      status: {
        available: string;
        notAvailable: string;
      }
    };
    systemSettings: {
      title: string;
      description: string;
    }
  };

  // AI配置
  aiConfig: {
    title: string;
    subtitle: string;
    tabs: {
      models: string;
      prompts: string;
      providers: string;
    };
    models: {
      title: string;
      addModel: string;
      modelName: string;
      provider: string;
      maxTokens: string;
      temperature: string;
      enabled: string;
      actions: string;
    };
    prompts: {
      title: string;
      addPrompt: string;
      promptName: string;
      content: string;
      category: string;
      variables: string;
      categories: {
        code: string;
        analysis: string;
        creative: string;
        debugging: string;
        documentation: string;
      };
      actions: string;
    };
    providers: {
      title: string;
      providerName: string;
      apiKey: string;
      baseUrl: string;
      status: {
        configured: string;
        notConfigured: string;
      };
      actions: string;
    }
  };

  // Node管理器
  nodeManager: {
    title: string;
    subtitle: string;
    tabs: {
      versions: string;
      environment: string;
      global: string;
    };
    versions: {
      title: string;
      currentVersion: string;
      installVersion: string;
      installedVersions: string;
      lts: string;
      latest: string;
      current: string;
      switchTo: string;
      uninstall: string;
      versionNumber: string;
      releaseDate: string;
    };
    environment: {
      title: string;
      defaultVersion: string;
      npmMirror: string;
      selectDefaultVersion: string;
      selectNpmMirror: string;
      description: string;
    };
    global: {
      title: string;
      description: string;
      packageName: string;
      version: string;
      packageDescription: string;
      installedAt: string;
      actions: string;
    }
  };

  // NPM管理器
  npmManager: {
    title: string;
    subtitle: string;
    tabs: {
      packages: string;
      registry: string;
      config: string;
    };
    packages: {
      title: string;
      installPackage: string;
      installedPackages: string;
      packageName: string;
      version: string;
      packageDescription: string;
      installedAt: string;
      lastUpdated: string;
      size: string;
      actions: string;
      quickInstall: string;
    };
    registry: {
      title: string;
      currentRegistry: string;
      switchRegistry: string;
      customRegistry: string;
      official: string;
      taobao: string;
      tencent: string;
      huawei: string;
      netease: string;
      speed: {
        fast: string;
        medium: string;
        slow: string;
      };
      region: string;
      description: string;
    };
    config: {
      title: string;
      globalConfig: string;
      author: string;
      email: string;
      license: string;
      cache: string;
      cacheLocation: string;
      cacheSize: string;
      lastCleanup: string;
      clearCache: string;
      verifyCache: string;
    }
  };

  // 设置
  settings: {
    title: string;
    subtitle: string;
    tabs: {
      general: string;
      appearance: string;
      data: string;
      about: string;
      help: string;
    };
    general: {
      title: string;
      language: string;
      theme: string;
      autoStart: string;
      notifications: string;
      description: string;
    };
    appearance: {
      title: string;
      theme: {
        light: string;
        dark: string;
        system: string;
      };
      language: {
        chinese: string;
        english: string;
      };
      description: string;
    };
    data: {
      title: string;
      export: string;
      import: string;
      clear: string;
      description: string;
    };
    about: {
      title: string;
      version: string;
      author: string;
      description: string;
    };
    help: {
      title: string;
      documentation: string;
      support: string;
      feedback: string;
      description: string;
    }
  };
}

// 语言类型
export type Language = 'zh' | 'en';

// 主题类型
export type Theme = 'light' | 'dark' | 'system';

// 应用状态接口
export interface AppState {
  language: Language;
  theme: Theme;
  systemTheme: 'light' | 'dark';
  translations: Translations;
}