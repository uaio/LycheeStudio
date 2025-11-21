#!/bin/bash

echo "🔄 正在清理相关进程..."

# 首先正常关闭进程
echo "📦 杀死 npm 相关进程..."
pkill -f "npm start" 2>/dev/null || true
pkill -f "npm run electron" 2>/dev/null || true
pkill -f "npm run electron-dev" 2>/dev/null || true
pkill -f "npm run electron-dev-auto" 2>/dev/null || true
pkill -f "npm run clean-start" 2>/dev/null || true

echo "⚡ 杀死 electron 相关进程..."
pkill -f "Electron" 2>/dev/null || true
pkill -f "electron" 2>/dev/null || true

echo "🌐 杀死 React 开发服务器进程..."
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

echo "🔧 杀死 concurrently 进程..."
pkill -f "concurrently" 2>/dev/null || true

echo "📱 杀死 wait-on 进程..."
pkill -f "wait-on" 2>/dev/null || true

# 等待进程完全结束
echo "⏳ 等待进程完全结束..."
sleep 3

# 使用更强力的方式杀死所有相关进程
echo "🔨 强制杀死所有相关进程..."

# 查找并杀死所有相关进程的PID
process_patterns=(
    "npm.*start"
    "npm.*electron"
    "electron.*\."
    "react-scripts"
    "concurrently"
    "wait-on"
    "node.*lychee-studio"
)

for pattern in "${process_patterns[@]}"; do
    pids=$(pgrep -f "$pattern" 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🔨 找到进程匹配 '$pattern': $pids"
        echo "$pids" | xargs kill -9 2>/dev/null || true
    fi
done

# 特别处理端口占用
echo "🔌 检查并清理端口 3000"
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true

# 最终等待
echo "⏳ 最终等待..."
sleep 2

# 验证清理结果
remaining=$(pgrep -f "npm.*start|npm.*electron|electron.*\.|react-scripts|concurrently|wait-on" 2>/dev/null)
if [ ! -z "$remaining" ]; then
    echo "⚠️ 仍有进程在运行: $remaining"
    echo "🔄 进行最后的强制清理..."
    echo "$remaining" | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo "✅ 所有相关进程已清理完成！"