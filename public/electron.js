const { app, BrowserWindow, Menu, shell, ipcMain, nativeTheme } = require('electron');
const { spawn, exec } = require('child_process');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// 保持对window对象的全局引用，如果不这样做，当JavaScript对象被垃圾回收时，窗口会自动关闭
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: 'hiddenInset', // 隐藏标题栏但保留红绿灯按钮
    show: false, // 先不显示，等加载完成后再显示
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    // icon: path.join(__dirname, 'assets/icon.png'), // 应用图标 - 暂时注释掉
  });

  // 加载应用
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // 设置内容安全策略（仅在开发环境中允许 unsafe-eval）
  const csp = isDev
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self' data: https:; connect-src 'self' https: http: ws: wss:; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; child-src 'none'; frame-src 'none';"
    : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; child-src 'none'; frame-src 'none';";

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    });
  });

  // 窗口准备好显示时显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // 开发环境下打开开发者工具
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // 当窗口被关闭时发出
  mainWindow.on('closed', () => {
    // 解除window对象的引用，如果你的应用支持多窗口，通常会把多个window对象存放在一个数组里面，与此同时，你应该删除相应的元素
    mainWindow = null;
  });

  // 处理窗口控制
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 阻止新窗口打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow();

  // 在macOS上，当点击dock图标并且没有其他窗口打开时，通常在应用程序中重新创建一个窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，应用程序及其菜单栏通常保持活动状态，直到用户使用Cmd + Q明确退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 阻止导航到外部链接
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (parsedUrl.origin !== 'http://localhost:3000' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
});

// 设置应用菜单
const template = [
  {
    label: '文件',
    submenu: [
      {
        label: '退出',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: '编辑',
    submenu: [
      { role: 'undo', label: '撤销' },
      { role: 'redo', label: '重做' },
      { type: 'separator' },
      { role: 'cut', label: '剪切' },
      { role: 'copy', label: '复制' },
      { role: 'paste', label: '粘贴' }
    ]
  },
  {
    label: '视图',
    submenu: [
      { role: 'reload', label: '重新加载' },
      { role: 'forceReload', label: '强制重新加载' },
      { role: 'toggleDevTools', label: '开发者工具' },
      { type: 'separator' },
      { role: 'resetZoom', label: '实际大小' },
      { role: 'zoomIn', label: '放大' },
      { role: 'zoomOut', label: '缩小' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: '全屏' }
    ]
  },
  {
    label: '窗口',
    submenu: [
      { role: 'minimize', label: '最小化' },
      { role: 'close', label: '关闭' }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);

// 在macOS上设置菜单始终可见
if (process.platform === 'darwin') {
  Menu.setApplicationMenu(menu);
  // 禁用自动隐藏菜单栏
  app.setAboutPanelOptions({
    applicationName: 'LycheeStudio',
    applicationVersion: app.getVersion()
  });
} else {
  Menu.setApplicationMenu(menu);
}

// 禁用菜单自动隐藏（适用于所有平台）
app.on('browser-window-focus', () => {
  if (process.platform === 'darwin') {
    // macOS下确保菜单栏始终可见
    Menu.setApplicationMenu(menu);
  }
});

// 防止菜单被隐藏
app.on('browser-window-blur', () => {
  if (process.platform === 'darwin') {
    // 即使窗口失去焦点也保持菜单可见
    Menu.setApplicationMenu(menu);
  }
});

// IPC 处理程序
ipcMain.handle('get-app-version', () => {
  console.log('IPC: get-app-version 被调用');
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  console.log('IPC: show-message-box 被调用', options);
  const { dialog } = require('electron');
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// 主题相关处理程序
ipcMain.handle('native-theme:shouldUseDarkColors', () => {
  return nativeTheme.shouldUseDarkColors;
});

// 监听系统主题变化并发送到渲染进程
nativeTheme.on('updated', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('theme-updated', {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors
    });
  }
});

// 处理窗口控制
ipcMain.handle('window-control', async (event, action) => {
  if (!mainWindow) return { success: false };

  try {
    switch (action) {
      case 'minimize':
        mainWindow.minimize();
        break;
      case 'maximize':
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        break;
      case 'close':
        mainWindow.close();
        break;
      default:
        return { success: false, error: 'Unknown action' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 检查工具是否已安装
ipcMain.handle('check-tool-installed', async (event, toolName) => {
  return new Promise((resolve) => {
    const command = process.platform === 'win32' ? 'where' : 'which';
    exec(`${command} ${toolName}`, (error, stdout, stderr) => {
      resolve({
        installed: !error,
        path: error ? null : stdout.trim().split('\n')[0]
      });
    });
  });
});

// 获取工具版本
ipcMain.handle('get-tool-version', async (event, toolName) => {
  return new Promise((resolve) => {
    const versionCommands = {
      'fnm': 'fnm --version',
      'node': 'node --version',
      'npm': 'npm --version'
    };

    const command = versionCommands[toolName] || `${toolName} --version`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({ version: null, error: error.message });
      } else {
        const version = stdout.trim() || stderr.trim();
        resolve({ version, error: null });
      }
    });
  });
});

// 安装工具
ipcMain.handle('install-tool', async (event, toolName) => {
  const platform = process.platform;

  const installCommands = {
    'fnm': {
      'darwin': 'curl -fsSL https://fnm.vercel.app/install | bash',
      'linux': 'curl -fsSL https://fnm.vercel.app/install | bash',
      'win32': 'winget install Schniz.fnm'
    }
  };

  // 获取最新 Node.js 版本
  const getLatestNodeVersion = async () => {
    return new Promise((resolve, reject) => {
      exec('curl -s https://nodejs.org/dist/index.json', (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          const data = JSON.parse(stdout);
          const latestVersion = data.version;
          resolve(latestVersion);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  };

  if (!installCommands[toolName]) {
    return { success: false, error: `不支持安装工具: ${toolName}` };
  }

  const command = installCommands[toolName][platform];
  if (!command) {
    return { success: false, error: `平台 ${platform} 不支持安装 ${toolName}` };
  }

  return new Promise(async (resolve) => {
    try {
      if (toolName === 'node') {
        // 检查是否已安装 fnm
        const fnmCheck = await new Promise((fnmResolve) => {
          exec('which fnm', (error, stdout, stderr) => {
            fnmResolve(!error);
          });
        });

        if (!fnmCheck) {
          resolve({ success: false, error: '需要先安装 fnm 才能安装 Node.js。请先安装 fnm 后再试。' });
          return;
        }

        // 获取最新 Node.js 版本
        let latestVersion;
        try {
          latestVersion = await getLatestNodeVersion();
        } catch (versionError) {
          console.log('获取最新版本失败，使用默认版本:', versionError.message);
          latestVersion = 'lts'; // 使用 LTS 版本作为默认
        }

        // 使用 fnm 安装 Node.js
        const nodeCommand = platform === 'win32'
          ? `fnm install ${latestVersion}`
          : `fnm install ${latestVersion} && fnm use ${latestVersion}`;

        if (platform === 'darwin' || platform === 'linux') {
          const shell = process.env.SHELL || '/bin/bash';
          spawn(shell, ['-c', nodeCommand], {
            stdio: 'inherit',
            env: { ...process.env }
          }).on('close', (code) => {
            if (code === 0) {
              resolve({
                success: true,
                message: `Node.js ${latestVersion} 安装成功！请重启终端或应用以生效。`
              });
            } else {
              resolve({ success: false, error: `Node.js 安装失败，退出码: ${code}` });
            }
          }).on('error', (error) => {
            resolve({ success: false, error: `Node.js 安装失败: ${error.message}` });
          });
        } else {
          exec(nodeCommand, (error, stdout, stderr) => {
            if (error) {
              resolve({ success: false, error: error.message });
            } else {
              resolve({
                success: true,
                message: `Node.js ${latestVersion} 安装成功！请重启终端或应用以生效。`
              });
            }
          });
        }
      } else {
        // 处理其他工具的安装（如 fnm）
        if (platform === 'darwin' || platform === 'linux') {
          const shell = process.env.SHELL || '/bin/bash';
          spawn(shell, ['-c', command], {
            stdio: 'inherit',
            env: { ...process.env }
          }).on('close', (code) => {
            if (code === 0) {
              resolve({ success: true, message: `${toolName} 安装成功！请重启应用以生效。` });
            } else {
              resolve({ success: false, error: `${toolName} 安装失败，退出码: ${code}` });
            }
          }).on('error', (error) => {
            resolve({ success: false, error: `安装失败: ${error.message}` });
          });
        } else {
          // Windows 使用 winget
          exec(command, (error, stdout, stderr) => {
            if (error) {
              resolve({ success: false, error: error.message });
            } else {
              resolve({ success: true, message: `${toolName} 安装成功！请重启应用以生效。` });
            }
          });
        }
      }
    } catch (error) {
      resolve({ success: false, error: `安装过程发生错误: ${error.message}` });
    }
  });
});

// 获取最新 Node.js 版本
ipcMain.handle('get-latest-node-version', async () => {
  try {
    const version = await getLatestNodeVersion();
    return { success: true, version };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 获取当前NPM源
ipcMain.handle('get-npm-registry', async () => {
  return new Promise((resolve) => {
    exec('npm config get registry', (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          error: error.message,
          registry: null,
          name: '中科大镜像'
        });
        return;
      }

      const registry = stdout.trim();

      // 如果为空或无效，默认返回中科大镜像
      if (!registry || registry.trim() === '') {
        resolve({
          success: true,
          registry: 'https://mirrors.ustc.edu.cn/npm/',
          name: '中科大镜像'
        });
        return;
      }

      let name = '中科大镜像'; // 默认值改为中科大镜像

      // 根据registry URL判断源名称
      if (registry.includes('registry.npmmirror.com') || registry.includes('taobao.org')) {
        name = '淘宝镜像';
      } else if (registry.includes('registry.npmjs.org')) {
        name = '官方源';
      } else if (registry.includes('repo.huaweicloud.com')) {
        name = '华为镜像';
      } else if (registry.includes('mirrors.cloud.tencent.com')) {
        name = '腾讯镜像';
      } else if (registry.includes('mirrors.ustc.edu.cn')) {
        name = '中科大镜像';
      } else if (registry.includes('mirrors.aliyun.com')) {
        name = '阿里镜像';
      } else if (registry.includes('kwnpm.tmeoa.com')) {
        name = '酷我镜像';
      } else {
        name = '中科大镜像'; // 未知源也默认显示为中科大镜像
      }

      resolve({
        success: true,
        registry,
        name
      });
    });
  });
});

// 获取NPM源列表
ipcMain.handle('get-npm-registries', async () => {
  const registries = [
    {
      name: '官方源',
      url: 'https://registry.npmjs.org',
      description: 'NPM官方源，速度较慢但最稳定'
    },
    {
      name: '酷我镜像',
      url: 'https://kwnpm.tmeoa.com',
      description: '酷我音乐NPM镜像'
    },
    {
      name: '腾讯镜像',
      url: 'https://mirrors.cloud.tencent.com/npm/',
      description: '腾讯云NPM镜像'
    },
    {
      name: '华为镜像',
      url: 'https://repo.huaweicloud.com/repository/npm/',
      description: '华为云NPM镜像'
    },
    {
      name: '阿里镜像',
      url: 'https://mirrors.aliyun.com/npm/',
      description: '阿里云NPM镜像'
    },
    {
      name: '中科大镜像',
      url: 'https://mirrors.ustc.edu.cn/npm/',
      description: '中科大NPM镜像'
    },
    {
      name: '淘宝镜像',
      url: 'https://registry.npmmirror.com',
      description: '淘宝NPM镜像，国内常用'
    }
  ];

  return {
    success: true,
    registries
  };
});

// 切换NPM源
ipcMain.handle('set-npm-registry', async (event, registryUrl) => {
  return new Promise((resolve) => {
    exec(`npm config set registry ${registryUrl}`, (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          error: error.message,
          message: '切换NPM源失败'
        });
        return;
      }

      resolve({
        success: true,
        message: 'NPM源切换成功',
        registry: registryUrl
      });
    });
  });
});

// 打开外部链接
ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

// 通用命令执行
ipcMain.handle('execute-command', async (event, command) => {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          error: error.message,
          output: null
        });
      } else {
        resolve({
          success: true,
          output: stdout.trim(),
          error: stderr.trim()
        });
      }
    });
  });
});

// Claude设置文件操作
const os = require('os');
const fs = require('fs');

// 获取用户系统目录下的 .claude/settings.json 文件路径
function getUserSettingsPath() {
  return require('path').join(os.homedir(), '.claude', 'settings.json');
}

// 确保目录存在
function ensureDirectoryExists(filePath) {
  const dir = require('path').dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 读取用户设置
ipcMain.handle('settings:read', async () => {
  try {
    const settingsPath = getUserSettingsPath();

    if (!fs.existsSync(settingsPath)) {
      // 如果文件不存在，返回默认设置
      return {
        success: true,
        settings: {
          env: {},
          apiSettings: {
            timeout: 3000000,
            retryAttempts: 3,
            retryDelay: 1000
          }
        }
      };
    }

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    return {
      success: true,
      settings
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      settings: null
    };
  }
});

// 写入用户设置
ipcMain.handle('settings:write', async (event, settingsData) => {
  try {
    const { env, apiSettings } = settingsData;
    const settingsPath = getUserSettingsPath();

    // 确保目录存在
    ensureDirectoryExists(settingsPath);

    let currentSettings = {};
    if (fs.existsSync(settingsPath)) {
      currentSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }

    // 更新env和apiSettings字段，保留其他字段
    const updatedSettings = {
      ...currentSettings,
      env: env || {},
      apiSettings: apiSettings || {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    };

    fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2), 'utf8');

    return {
      success: true,
      message: '设置保存成功',
      settingsPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// CLAUDE.md文件操作
function getClaudeMdPath() {
  return require('path').join(os.homedir(), '.claude', 'CLAUDE.md');
}

function getPromptsDataPath() {
  return require('path').join(os.homedir(), '.claude', 'prompts-data.json');
}

// 读取CLAUDE.md文件
ipcMain.handle('claudeMd:read', async () => {
  try {
    const claudeMdPath = getClaudeMdPath();

    if (!fs.existsSync(claudeMdPath)) {
      // 文件不存在时返回空内容，而不是错误
      return {
        success: true,
        content: ''
      };
    }

    const content = fs.readFileSync(claudeMdPath, 'utf8');
    return {
      success: true,
      content
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// 写入CLAUDE.md文件
ipcMain.handle('claudeMd:write', async (event, content) => {
  try {
    const claudeMdPath = getClaudeMdPath();

    // 复用现有的 ensureDirectoryExists 函数
    ensureDirectoryExists(claudeMdPath);

    fs.writeFileSync(claudeMdPath, content, 'utf8');

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// 检查CLAUDE.md文件是否存在
ipcMain.handle('claudeMd:exists', async () => {
  try {
    const claudeMdPath = getClaudeMdPath();

    return {
      success: true,
      exists: fs.existsSync(claudeMdPath)
    };
  } catch (error) {
    return {
      success: false,
      exists: false,
      error: error.message
    };
  }
});

// 读取prompts数据文件
ipcMain.handle('promptsData:read', async () => {
  try {
    const promptsDataPath = getPromptsDataPath();

    if (!fs.existsSync(promptsDataPath)) {
      // 文件不存在时返回默认数据结构
      return {
        success: true,
        data: {
          version: '1.0.0',
          templates: [],
          lastSyncTime: null
        }
      };
    }

    const data = JSON.parse(fs.readFileSync(promptsDataPath, 'utf8'));
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// 写入prompts数据文件
ipcMain.handle('promptsData:write', async (event, data) => {
  try {
    const promptsDataPath = getPromptsDataPath();

    // 复用现有的 ensureDirectoryExists 函数
    ensureDirectoryExists(promptsDataPath);

    // 确保数据结构完整
    const writeData = {
      version: data.version || '1.0.0',
      templates: data.templates || [],
      lastSyncTime: new Date().toISOString()
    };

    fs.writeFileSync(promptsDataPath, JSON.stringify(writeData, null, 2), 'utf8');

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});