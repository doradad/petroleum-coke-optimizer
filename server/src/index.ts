import express from 'express';
import cors from 'cors';
import path from 'path';
import uploadRoutes from './routes/upload';
import optimizeRoutes from './routes/optimize';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// API路由
app.use('/api', uploadRoutes);
app.use('/api', optimizeRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: '石油焦掺配优化系统'
  });
});

// 404处理
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 前端路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 石油焦掺配优化系统已启动`);
  console.log(`🌐 服务地址: http://localhost:${PORT}`);
  console.log(`📊 API接口: http://localhost:${PORT}/api`);
});

export default app;