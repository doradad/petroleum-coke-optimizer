"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const upload_1 = __importDefault(require("./routes/upload"));
const optimize_1 = __importDefault(require("./routes/optimize"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 静态文件服务
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// API路由
app.use('/api', upload_1.default);
app.use('/api', optimize_1.default);
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
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// 错误处理中间件
app.use((err, req, res, next) => {
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
exports.default = app;
