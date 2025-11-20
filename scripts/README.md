# 开发脚本使用指南

本项目提供了一些便捷的脚本来管理开发环境。

## 可用脚本

### 清理进程
```bash
npm run kill
```
清理所有相关的npm和electron进程。

### 开发模式启动
```bash
npm run electron-dev-auto
```
自动在开发环境启动应用，无需手动设置端口。

### 一键清理启动
```bash
npm run clean-start
```
先清理所有相关进程，然后自动启动开发环境。

### 传统开发模式
```bash
npm run electron-dev
```
传统的开发模式，需要等待localhost:3000可用。

## 脚本说明

- **kill**: 使用`scripts/kill-processes.sh`清理所有相关进程
- **electron-dev-auto**: 增强版electron-dev，增加2秒延迟确保稳定性
- **clean-start**: 组合脚本，清理+自动启动

## 推荐使用方式

对于日常开发，推荐使用：
```bash
npm run clean-start
```

这样可以确保一个干净的开发环境并自动启动应用。