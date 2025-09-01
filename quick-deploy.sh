#!/bin/bash

# 石油焦掺配优化系统一键部署脚本
# 在阿里云服务器上运行

set -e

SERVER_IP="your-server-ip"
SERVER_USER="root"
DEPLOY_PATH="/opt/petroleum-coke-optimizer"

echo "🚀 石油焦掺配优化系统一键部署"
echo "================================"

# 检查参数
if [ "$1" != "" ]; then
    SERVER_IP=$1
fi

if [ "$2" != "" ]; then
    SERVER_USER=$2
fi

echo "📋 部署配置:"
echo "服务器IP: $SERVER_IP"
echo "用户名: $SERVER_USER"
echo "部署路径: $DEPLOY_PATH"
echo ""

# 1. 本地构建
echo "🔨 本地构建项目..."
./deploy.sh

# 2. 上传到服务器
echo "📤 上传文件到服务器..."
scp petroleum-coke-optimizer.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# 3. 服务器端部署
echo "🚀 在服务器上部署..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

# 创建部署目录
sudo mkdir -p /opt/petroleum-coke-optimizer
cd /opt/petroleum-coke-optimizer

# 停止旧服务
pm2 stop petroleum-coke-optimizer || true
pm2 delete petroleum-coke-optimizer || true

# 解压新版本
tar -xzf /tmp/petroleum-coke-optimizer.tar.gz --strip-components=1
rm -f /tmp/petroleum-coke-optimizer.tar.gz

# 安装依赖
npm install --production

# 启动服务
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机启动
pm2 startup systemd -u $USER --hp $HOME

echo "✅ 部署完成！"
echo "🌐 访问地址: http://$(curl -s ifconfig.me):3001"
echo "📊 状态监控: pm2 status"
echo "📝 查看日志: pm2 logs petroleum-coke-optimizer"
ENDSSH

echo ""
echo "🎉 部署成功完成!"
echo ""
echo "📋 后续操作:"
echo "1. 配置域名和SSL证书 (可选)"
echo "2. 设置防火墙规则开放3001端口"
echo "3. 配置Nginx反向代理 (可选)"
echo ""
echo "🔧 管理命令:"
echo "重启服务: ssh $SERVER_USER@$SERVER_IP 'pm2 restart petroleum-coke-optimizer'"
echo "查看状态: ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
echo "查看日志: ssh $SERVER_USER@$SERVER_IP 'pm2 logs petroleum-coke-optimizer'"