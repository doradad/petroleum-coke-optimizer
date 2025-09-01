# 石油焦掺配优化系统阿里云部署指南

## 📋 系统架构
- 前端：React + TypeScript + Ant Design
- 后端：Node.js + Express + TypeScript
- 数据库：SQLite
- 部署：单端口架构 (3001)

## 🚀 快速部署

### 方法一：一键部署 (推荐)
```bash
# 1. 给脚本执行权限
chmod +x deploy.sh quick-deploy.sh

# 2. 执行一键部署 (替换为你的服务器IP)
./quick-deploy.sh your-server-ip root
```

### 方法二：手动部署
```bash
# 1. 本地构建
chmod +x deploy.sh
./deploy.sh

# 2. 上传到服务器
scp petroleum-coke-optimizer.tar.gz root@your-server-ip:/opt/

# 3. 服务器部署
ssh root@your-server-ip
cd /opt
tar -xzf petroleum-coke-optimizer.tar.gz
cd deploy-package
npm install --production
pm2 start ecosystem.config.js
pm2 save && pm2 startup
```

## ⚙️ 阿里云服务器配置

### 1. 安全组配置
在阿里云控制台 → ECS → 安全组，添加以下规则：

| 端口范围 | 授权策略 | 协议类型 | 授权类型 | 授权对象 | 描述 |
|---------|---------|---------|---------|---------|------|
| 3001/3001 | 允许 | TCP | 地址段访问 | 0.0.0.0/0 | 石油焦优化系统 |
| 80/80 | 允许 | TCP | 地址段访问 | 0.0.0.0/0 | HTTP访问 |
| 443/443 | 允许 | TCP | 地址段访问 | 0.0.0.0/0 | HTTPS访问 |
| 22/22 | 允许 | TCP | 地址段访问 | 你的IP/32 | SSH访问 |

### 2. 系统防火墙配置
```bash
# CentOS/RHEL
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --reload

# Ubuntu/Debian
ufw allow 3001/tcp
ufw reload
```

### 3. Nginx配置 (可选)
```bash
# 安装Nginx
yum install -y nginx  # CentOS
apt install -y nginx  # Ubuntu

# 复制配置文件
cp nginx.conf /etc/nginx/sites-available/petroleum-coke-optimizer
ln -s /etc/nginx/sites-available/petroleum-coke-optimizer /etc/nginx/sites-enabled/

# 测试配置并重启
nginx -t
systemctl restart nginx
```

## 🔧 服务管理命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs petroleum-coke-optimizer

# 重启服务
pm2 restart petroleum-coke-optimizer

# 停止服务
pm2 stop petroleum-coke-optimizer

# 查看监控信息
pm2 monit
```

## 📊 性能优化

### 1. 服务器配置建议
- **CPU**: 2核以上
- **内存**: 4GB以上
- **存储**: 40GB以上
- **带宽**: 5Mbps以上

### 2. 数据库优化
```bash
# SQLite配置优化已内置在代码中
# 如需处理大量数据，建议升级到MySQL/PostgreSQL
```

### 3. 缓存配置
```bash
# Nginx静态文件缓存已配置
# 如需Redis缓存，可后续添加
```

## 🛡️ 安全配置

### 1. SSL证书配置
```bash
# 使用Let's Encrypt免费证书
yum install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

### 2. 访问限制
```bash
# 限制API访问频率（已在代码中实现基础限制）
# 生产环境建议配置更严格的安全策略
```

## 🚨 故障排查

### 1. 服务无法启动
```bash
# 查看详细日志
pm2 logs petroleum-coke-optimizer --lines 100

# 检查端口占用
netstat -tulpn | grep 3001

# 手动启动测试
node dist/index.js
```

### 2. 无法访问
```bash
# 检查防火墙
firewall-cmd --list-ports  # CentOS
ufw status  # Ubuntu

# 检查Nginx状态
systemctl status nginx

# 检查进程
ps aux | grep node
```

## 📈 监控和维护

### 1. 日志管理
```bash
# 日志文件位置
./logs/combined.log  # 综合日志
./logs/err.log       # 错误日志
./logs/out.log       # 输出日志

# 日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
```

### 2. 备份策略
```bash
# 数据库备份
cp database.sqlite3 backup/database_$(date +%Y%m%d).sqlite3

# 应用备份
tar -czf backup_$(date +%Y%m%d).tar.gz deploy-package/
```

## 📞 技术支持

如遇到部署问题，请检查：
1. Node.js版本 ≥ 16.0
2. 端口3001是否开放
3. 防火墙和安全组配置
4. 服务器内存和磁盘空间

访问地址：`http://your-server-ip:3001`