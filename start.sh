#!/bin/bash

echo "🚀 启动石油焦掺配优化系统..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js (版本 >= 16.0.0)"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查Node.js版本
NODE_VERSION=$(node -v | sed 's/v//')
MIN_VERSION="16.0.0"

if [ "$(printf '%s\n' "$MIN_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$MIN_VERSION" ]; then
    echo "❌ 错误: Node.js版本过低，当前版本: v$NODE_VERSION，要求版本: >= v$MIN_VERSION"
    exit 1
fi

echo "✅ Node.js版本检查通过: v$NODE_VERSION"

# 安装依赖
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm run install:all
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
fi

# 检查是否为生产环境
if [ "$NODE_ENV" = "production" ]; then
    echo "🏗️ 构建生产环境..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ 构建失败"
        exit 1
    fi
    echo "✅ 构建完成"
    
    echo "🌐 启动生产服务器..."
    npm start
else
    echo "🔧 启动开发环境..."
    echo "前端地址: http://localhost:3000"
    echo "后端API: http://localhost:3001"
    echo ""
    echo "按 Ctrl+C 停止服务"
    echo ""
    npm run dev
fi