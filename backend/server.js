/**
 * 儿童识字小报生成器 - Express 服务器
 * Children's Literacy Poster Generator - Express Server
 */

// 加载环境变量 - 从 config 目录加载
require('dotenv').config({ path: require('path').join(__dirname, '../config/.env') });
const express = require('express');
const path = require('path');
const cors = require('cors');

// 导入路由
const posterRoutes = require('./routes/poster');
const taskRoutes = require('./routes/task');

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 提供前端文件
app.use(express.static(path.join(__dirname, '../frontend')));

// API 路由
app.use('/api/poster', posterRoutes);
app.use('/api/task', taskRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '儿童识字小报生成器 API 运行正常',
    timestamp: new Date().toISOString()
  });
});

// SPA 路由处理 - 所有其他路由返回 index.html
app.get('*', (req, res) => {
  // 如果是 API 请求，返回 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'API 路由不存在'
    });
  }
  // 否则返回 index.html
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('儿童识字小报生成器 - Children\'s Literacy Poster Generator');
  console.log('='.repeat(50));
  console.log(`服务器运行在: http://localhost:${PORT}`);
  console.log(`API 文档: http://localhost:${PORT}/api`);
  console.log('='.repeat(50));

  // 检查 API Key
  if (!process.env.API_KEY) {
    console.log('⚠️  警告: 未设置 API_KEY 环境变量');
    console.log('请在 config/.env 文件中设置 API_KEY=your_api_key_here');
  } else {
    console.log('✅ API Key 已配置');
  }
  console.log('='.repeat(50));
});

module.exports = app;
