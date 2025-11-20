#!/bin/bash

echo "🔄 正在清理相关进程..."

# 杀死所有相关进程
echo "📦 杀死 npm start 进程..."
pkill -f "npm start" 2>/dev/null || true

echo "⚡ 杀死 electron 进程..."
pkill -f electron 2>/dev/null || true

echo "🔧 杀死 npm run electron 进程..."
pkill -f "npm run electron" 2>/dev/null || true

echo "🌐 杀死 React 开发服务器进程..."
pkill -f "react-scripts start" 2>/dev/null || true

# 等待进程完全结束
echo "⏳ 等待进程完全结束..."
sleep 3

# 再次检查并强制杀死仍在运行的进程
for pid in $(pgrep -f "electron|npm.*start|react-scripts" 2>/dev/null); do
    echo "🔨 强制杀死进程 $pid..."
    kill -9 "$pid" 2>/dev/null || true
done

echo "✅ 所有相关进程已清理完成！"