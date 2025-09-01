# 🚀 部署文件创建指南

## 如果你没有看到部署文件，请按以下步骤创建：

### 1. 创建 deploy.sh
```bash
cat > deploy.sh << 'EOF'
#!/bin/bash

# 石油焦掺配优化系统阿里云部署脚本
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
cat > deploy-package/start.sh << 'SCRIPT'
#!/bin/bash
export NODE_ENV=production
export PORT=3001
node dist/index.js
SCRIPT

chmod +x deploy-package/start.sh

# 创建PM2配置
cat > deploy-package/ecosystem.config.js << 'SCRIPT'
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
SCRIPT

# 创建日志目录
mkdir -p deploy-package/logs

# 打包
echo "🗜️  压缩部署包..."
tar -czf petroleum-coke-optimizer.tar.gz deploy-package/

echo "✅ 部署包创建完成: petroleum-coke-optimizer.tar.gz"
echo ""
echo "📋 接下来请手动上传到服务器并部署"
EOF
```

### 2. 创建简化的手动部署脚本 manual-deploy.sh
```bash
cat > manual-deploy.sh << 'EOF'
#!/bin/bash

echo "📋 手动部署指南"
echo "==============="
echo ""
echo "1. 在本地执行构建:"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh"
echo ""
echo "2. 上传文件到服务器:"
echo "   scp petroleum-coke-optimizer.tar.gz root@YOUR_SERVER_IP:/tmp/"
echo ""
echo "3. 登录服务器:"
echo "   ssh root@YOUR_SERVER_IP"
echo ""
echo "4. 在服务器上执行:"
echo "   cd /opt"
echo "   mkdir -p petroleum-coke-optimizer"
echo "   cd petroleum-coke-optimizer"
echo "   tar -xzf /tmp/petroleum-coke-optimizer.tar.gz --strip-components=1"
echo "   npm install --production"
echo "   npm install -g pm2"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "5. 配置防火墙:"
echo "   firewall-cmd --permanent --add-port=3001/tcp"
echo "   firewall-cmd --reload"
echo ""
echo "6. 访问系统:"
echo "   http://YOUR_SERVER_IP:3001"
EOF
```

### 3. 给脚本执行权限
```bash
chmod +x deploy.sh manual-deploy.sh
```

### 4. 执行本地构建
```bash
./deploy.sh
```