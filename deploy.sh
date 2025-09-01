#!/bin/bash

# 石油焦掺配优化系统阿里云部署脚本
# 作者: Claude Code
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 开始部署石油焦掺配优化系统..."

# 1. 构建前端
echo "📦 构建前端项目..."
cd client
npm install --production
npm run build
cd ..

# 2. 准备后端
echo "🔧 准备后端环境..."
cd server
npm install --production
npm run build
cd ..

# 3. 创建部署包
echo "📁 创建部署包..."
rm -rf deploy-package
mkdir -p deploy-package

# 复制后端构建文件
cp -r server/dist deploy-package/
cp -r server/public deploy-package/
cp server/package.json deploy-package/
cp -r server/node_modules deploy-package/

# 复制启动脚本
cat > deploy-package/start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=3001
node dist/index.js
EOF

chmod +x deploy-package/start.sh

# 创建PM2配置
cat > deploy-package/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'petroleum-coke-optimizer',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# 创建日志目录
mkdir -p deploy-package/logs

# 打包
echo "🗜️  压缩部署包..."
tar -czf petroleum-coke-optimizer.tar.gz deploy-package/

echo "✅ 部署包创建完成: petroleum-coke-optimizer.tar.gz"
echo ""
echo "📋 部署步骤:"
echo "1. 上传 petroleum-coke-optimizer.tar.gz 到阿里云服务器"
echo "2. 在服务器上执行以下命令:"
echo "   tar -xzf petroleum-coke-optimizer.tar.gz"
echo "   cd deploy-package"
echo "   npm install --production"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "🌐 访问地址: http://your-server-ip:3001"