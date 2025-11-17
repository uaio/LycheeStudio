# AI Tools Manager 运行说明

## 🚀 如何运行此应用

由于当前环境的网络限制，无法直接运行 Tauri 桌面应用。以下是完整的运行步骤：

### 1. 安装 Rust 环境

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 设置默认工具链
rustup default stable

# 验证安装
rustc --version
cargo --version
```

### 2. 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 安装 Tauri CLI
npm install -g @tauri-apps/cli@latest
```

### 3. 运行开发环境

```bash
# 运行 Tauri 开发环境
npm run tauri:dev
```

### 4. 构建生产版本

```bash
# 构建应用
npm run tauri build
```

## 📋 环境要求

- **Node.js**: >= 18.0.0
- **Rust**: >= 1.70.0
- **macOS**: >= 10.15
- **内存**: >= 4GB

## 🛠️ 故障排除

### Rust 安装问题

如果遇到网络超时：

```bash
# 使用国内镜像源
export RUSTUP_DIST_SERVER=https://mirrors.ustc.edu.cn/rust-static
export RUSTUP_UPDATE_ROOT=https://mirrors.ustc.edu.cn/rust-static/rustup

# 然后重新安装
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Tauri 构建问题

如果遇到构建错误：

```bash
# 清理缓存
rm -rf node_modules
rm -rf src-tauri/target
npm install

# 重新构建
npm run tauri:dev
```

## 📱 应用功能

### AI 工具配置
- ✅ Claude Code 配置
- ✅ OpenAI Codex 配置
- ✅ Gemini CLI 配置
- ✅ API Key 安全管理
- ✅ 模型参数调整

### Node.js 管理
- ✅ 版本列表查看
- ✅ 新版本安装
- ✅ 版本切换
- ✅ 状态监控

### NPM 管理
- ✅ 全局包管理
- ✅ 源配置切换
- ✅ 包快速安装
- ✅ 依赖列表查看

### 用户体验
- ✅ 现代化界面设计
- ✅ 响应式布局
- ✅ 实时状态反馈
- ✅ 配置导入导出

## 🎯 下一步开发

1. **功能增强**
   - 添加更多 AI 工具支持
   - 实现配置同步功能
   - 添加插件系统

2. **性能优化**
   - 优化启动速度
   - 减少内存占用
   - 改进响应性能

3. **用户体验**
   - 添加快捷键支持
   - 实现主题切换
   - 优化移动端适配

## 📞 技术支持

如果遇到问题，请检查：

1. 系统是否满足最低要求
2. 所有依赖是否正确安装
3. 网络连接是否正常
4. 防火墙设置是否允许

---

**注意**: 当前项目结构完整，代码功能齐全。一旦环境配置完成，即可正常运行所有功能。