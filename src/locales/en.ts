import type { Translations } from '../types/i18n';

// English translations
export const en: Translations = {
  // Common
  loading: 'Loading...',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  search: 'Search',
  refresh: 'Refresh',
  settingsText: 'Settings',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  yes: 'Yes',
  no: 'No',
  ok: 'OK',
  close: 'Close',

  // Dashboard
  dashboard: {
    title: 'AI Tools Manager',
    subtitle: 'Manage your AI programming assistants and development environment',
    aiConfig: {
      title: 'AI Tools Configuration',
      description: 'Configure and manage AI programming assistants like Claude, OpenAI, Gemini',
      status: {
        configured: 'Configured',
        notConfigured: 'Not Configured'
      }
    },
    nodeManager: {
      title: 'Node.js Management',
      description: 'Install and switch between different Node.js versions',
      status: {
        installed: 'Installed',
        notInstalled: 'Not Installed'
      }
    },
    npmManager: {
      title: 'NPM Package Management',
      description: 'Manage global packages and registry sources for different Node.js versions',
      status: {
        available: 'Available',
        notAvailable: 'Not Available'
      }
    },
    systemSettings: {
      title: 'System Settings',
      description: 'Configure application preferences and system options'
    }
  },

  // AI Config
  aiConfig: {
    title: 'AI Tools Configuration',
    subtitle: 'Manage AI models, prompts, and provider configurations',
    tabs: {
      models: 'Models',
      prompts: 'Prompts',
      providers: 'Providers'
    },
    models: {
      title: 'AI Model Management',
      addModel: 'Add Model',
      modelName: 'Model Name',
      provider: 'Provider',
      maxTokens: 'Max Tokens',
      temperature: 'Temperature',
      enabled: 'Enabled',
      actions: 'Actions'
    },
    prompts: {
      title: 'Prompt Templates',
      addPrompt: 'Add Prompt',
      promptName: 'Prompt Name',
      content: 'Content',
      category: 'Category',
      variables: 'Variables',
      categories: {
        code: 'Code',
        analysis: 'Analysis',
        creative: 'Creative',
        debugging: 'Debugging',
        documentation: 'Documentation'
      },
      actions: 'Actions'
    },
    providers: {
      title: 'Provider Configuration',
      providerName: 'Provider Name',
      apiKey: 'API Key',
      baseUrl: 'Base URL',
      status: {
        configured: 'Configured',
        notConfigured: 'Not Configured'
      },
      actions: 'Actions'
    }
  },

  // Node Manager
  nodeManager: {
    title: 'Node.js Management',
    subtitle: 'Manage Node.js versions and environment configuration',
    tabs: {
      versions: 'Versions',
      environment: 'Environment',
      global: 'Global Packages'
    },
    versions: {
      title: 'Node.js Version Management',
      currentVersion: 'Current Version',
      installVersion: 'Install Version',
      installedVersions: 'Installed Versions',
      lts: 'LTS',
      latest: 'Latest',
      current: 'Current',
      switchTo: 'Switch To',
      uninstall: 'Uninstall',
      versionNumber: 'Version Number',
      releaseDate: 'Release Date'
    },
    environment: {
      title: 'Environment Configuration',
      defaultVersion: 'Default Version',
      npmMirror: 'NPM Mirror',
      selectDefaultVersion: 'Select Default Version',
      selectNpmMirror: 'Select NPM Mirror',
      description: 'Configure the default Node.js version and NPM mirror used when the system starts'
    },
    global: {
      title: 'Global Package Management',
      subtitle: 'Manage installed global npm packages',
      packageName: 'Package Name',
      version: 'Version',
      packageDescription: 'Description',
      installedAt: 'Installed At',
      actions: 'Actions'
    }
  },

  // NPM Manager
  npmManager: {
    title: 'NPM Package Management',
    subtitle: 'Manage global packages and registry source configuration',
    tabs: {
      packages: 'Packages',
      registry: 'Registry',
      config: 'Configuration'
    },
    packages: {
      title: 'NPM Package Management',
      installPackage: 'Install Package',
      installedPackages: 'Installed Packages',
      packageName: 'Package Name',
      version: 'Version',
      packageDescription: 'Description',
      installedAt: 'Installed At',
      lastUpdated: 'Last Updated',
      size: 'Size',
      actions: 'Actions',
      quickInstall: 'Quick Install Common Packages'
    },
    registry: {
      title: 'Registry Configuration',
      currentRegistry: 'Current Registry',
      switchRegistry: 'Switch Registry',
      customRegistry: 'Custom Registry',
      official: 'Official',
      taobao: 'Taobao',
      tencent: 'Tencent',
      huawei: 'Huawei',
      netease: 'Netease',
      speed: {
        fast: 'Fast',
        medium: 'Medium',
        slow: 'Slow'
      },
      region: 'Region',
      description: 'Select the NPM mirror source suitable for your network to improve download speed'
    },
    config: {
      title: 'NPM Configuration Management',
      globalConfig: 'Global Configuration',
      author: 'Author Information',
      email: 'Email Address',
      license: 'Default License',
      cache: 'Cache Management',
      cacheLocation: 'Cache Location',
      cacheSize: 'Cache Size',
      lastCleanup: 'Last Cleanup',
      clearCache: 'Clear Cache',
      verifyCache: 'Verify Cache'
    }
  },

  // Settings
  settings: {
    title: 'Settings',
    subtitle: 'Manage application preferences and configuration',
    tabs: {
      general: 'General',
      appearance: 'Appearance',
      data: 'Data',
      about: 'About',
      help: 'Help'
    },
    general: {
      title: 'General Settings',
      language: 'Language',
      theme: 'Theme',
      autoStart: 'Auto Start',
      notifications: 'Notifications',
      description: 'Configure basic application settings and behavior'
    },
    appearance: {
      title: 'Appearance Settings',
      theme: {
        light: 'Light',
        dark: 'Dark',
        system: 'Follow System'
      },
      language: {
        chinese: '中文',
        english: 'English'
      },
      description: 'Customize application appearance and language settings'
    },
    data: {
      title: 'Data Management',
      export: 'Export Data',
      import: 'Import Data',
      clear: 'Clear Data',
      description: 'Manage application data import, export, and cleanup'
    },
    about: {
      title: 'About',
      version: 'Version',
      author: 'Author',
      description: 'AI Tools Manager - Manage your AI programming assistants and development environment'
    },
    help: {
      title: 'Help',
      documentation: 'Documentation',
      support: 'Support',
      feedback: 'Feedback',
      description: 'Get help information and support resources'
    }
  }
};