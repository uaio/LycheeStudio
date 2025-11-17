# AI Tools Manager

一个用于管理 AI 命令行工具、Node.js 版本和 NPM 包的统一桌面应用。

![AI Tools Manager](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ 功能特性

### 🤖 AI 工具配置管理
- **Claude Code** - Anthropic Claude CLI 配置
- **OpenAI Codex** - OpenAI CLI 工具配置
- **Gemini CLI** - Google Gemini CLI 配置
- API Key 安全管理（显示/隐藏）
- 模型选择和参数调整
- 预设配置模板

### 💻 Node.js 版本管理
- 查看已安装版本列表
- 安装新版本（LTS、最新版）
- 一键切换 Node.js 版本
- 实时状态监控

### 📦 NPM 包管理
- 全局包列表查看
- 快速安装 NPM 包
- 源配置管理（官方、淘宝、腾讯、华为）
- 常用包快速安装

### 🎨 现代化界面
- 响应式设计，支持多种屏幕尺寸
- 现代化 UI，渐变色彩和流畅动画
- 直观的侧边栏导航
- 实时状态反馈

### ⚙️ 高级功能
- 设置导入/导出
- 应用主题切换
- 缓存管理
- 帮助文档

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **Rust**: >= 1.70.0
- **macOS**: >= 10.15
- **内存**: >= 4GB

### 安装运行

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/ai-tools-manager.git
   cd ai-tools-manager
   ```

2. **安装 Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup default stable
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **运行开发环境**
   ```bash
   npm run tauri:dev
   ```

5. **构建生产版本**
   ```bash
   npm run tauri build
   ```

详细安装说明请查看 [RUN_INSTRUCTIONS.md](./RUN_INSTRUCTIONS.md)

## 📱 界面预览

### 主界面
- 🏠 **仪表板** - 系统状态概览和快速操作
- ⚙️ **AI工具配置** - 配置各种 AI CLI 工具
- 💻 **Node.js管理** - 版本安装和切换
- 📦 **NPM管理** - 包和源管理
- 🔧 **设置** - 应用配置和偏好

### AI 工具配置界面
- 工具选择器（Claude、OpenAI、Gemini）
- API Key 安全输入
- 模型参数调整
- 预设配置模板

### Node.js 管理界面
- 当前版本状态
- 已安装版本列表
- 快速安装新版本
- 版本切换功能

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Lucide React** - 图标库

### 后端
- **Rust** - 系统编程语言
- **Tauri 2.0** - 桌面应用框架
- **Tokio** - 异步运行时

### 构建工具
- **Tauri CLI** - 应用构建
- **ESLint** - 代码检查
- **TypeScript** - 类型检查

## 📁 项目结构

```
ai-tools-manager/
├── src/                    # React 前端代码
│   ├── components/         # React 组件
│   │   ├── Dashboard.tsx  # 仪表板组件
│   │   ├── AIConfig.tsx   # AI 配置组件
│   │   ├── NodeManager.tsx # Node.js 管理
│   │   ├── NPMManager.tsx # NPM 管理
│   │   └── Settings.tsx   # 设置页面
│   ├── lib/               # 工具库
│   │   └── tauri-commands.ts
│   ├── App.tsx           # 主应用组件
│   └── App.css           # 样式文件
├── src-tauri/            # Rust 后端代码
│   ├── src/main.rs       # 主要逻辑
│   ├── Cargo.toml        # Rust 依赖配置
│   └── tauri.conf.json   # Tauri 配置
├── public/               # 静态资源
├── package.json          # Node.js 依赖
└── README.md            # 项目说明
```

## 🔧 开发指南

### 添加新的 AI 工具支持

1. 在 `src-tauri/src/main.rs` 中添加新的配置读取/写入函数
2. 在 `src/components/AIConfig.tsx` 中添加新的工具配置界面
3. 更新配置类型定义和预设模板

### 扩展 Node.js 功能

1. 在 Rust 后端添加新的系统调用函数
2. 在前端组件中添加对应的 UI 和状态管理
3. 更新错误处理和用户反馈

### 自定义主题

1. 修改 `src/App.css` 中的 CSS 变量
2. 在设置页面添加主题切换逻辑
3. 实现主题持久化存储

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Tauri](https://tauri.app/) - 优秀的桌面应用框架
- [React](https://reactjs.org/) - 强大的前端框架
- [Lucide](https://lucide.dev/) - 精美的图标库
- 所有开源贡献者

## 📞 联系方式

- 项目主页: [GitHub Repository](https://github.com/your-username/ai-tools-manager)
- 问题反馈: [Issues](https://github.com/your-username/ai-tools-manager/issues)
- 功能建议: [Discussions](https://github.com/your-username/ai-tools-manager/discussions)

---

**AI Tools Manager** - 让 AI 工具管理变得简单高效！ 🚀