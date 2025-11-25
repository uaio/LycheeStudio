#!/bin/bash

echo "🔄 正在清理 Electron 相关进程和端口..."

# 定义 Electron 可能使用的端口
PORTS=(3000)  # 根据你的实际情况调整

# 清理 Electron 相关进程
echo ""
echo "⚡ 杀死 Electron 相关进程..."
pkill -f "Electron" 2>/dev/null || true
pkill -f "electron" 2>/dev/null || true

# 清理 npm electron 相关命令
echo "📦 杀死 npm electron 相关进程..."
pkill -f "npm run electron" 2>/dev/null || true
pkill -f "npm run electron-dev" 2>/dev/null || true
pkill -f "npm run electron-dev-auto" 2>/dev/null || true

# 等待进程完全结束
echo "⏳ 等待进程结束..."
sleep 2

# 强制清理残留的 Electron 进程
echo ""
echo "🔨 强制清理所有 Electron 进程..."
process_patterns=(
    "npm.*electron"
    "electron.*\."
    "Electron"
)

for pattern in "${process_patterns[@]}"; do
    pids=$(pgrep -f "$pattern" 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "  🔨 找到进程匹配 '$pattern': $pids"
        echo "$pids" | xargs kill -9 2>/dev/null || true
    fi
done

# 清理端口占用
echo ""
echo "🔌 检查并清理端口占用..."
for port in "${PORTS[@]}"; do
    port_info=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$port_info" ]; then
        echo "  ⚠️  端口 $port 被占用"
        # 显示占用端口的进程信息
        echo "  📋 进程信息:"
        lsof -i:$port 2>/dev/null | grep LISTEN || true
        # 杀死进程
        echo "  🔨 正在清理端口 $port..."
        lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
        echo "  ✅ 端口 $port 已清理"
    else
        echo "  ✅ 端口 $port 空闲"
    fi
done

# 最终等待
echo ""
echo "⏳ 最终等待..."
sleep 1

# 验证清理结果
remaining=$(pgrep -f "electron|Electron" 2>/dev/null)
if [ ! -z "$remaining" ]; then
    echo "⚠️  仍有 Electron 进程在运行: $remaining"
    echo "🔄 进行最后的强制清理..."
    echo "$remaining" | xargs kill -9 2>/dev/null || true
    sleep 1
else
    echo "✅ 没有残留的 Electron 进程"
fi

echo ""
echo "✅ Electron 相关进程和端口已清理完成！"
