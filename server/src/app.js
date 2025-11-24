  import express from 'express';
  import http from 'http';
  import { Server } from 'socket.io';
  import cors from 'cors';
  import helmet from 'helmet';
  import morgan from 'morgan';
  import dotenv from 'dotenv';
  import db from './config/database.js';
  import uploadRoutes from './routes/upload.js';      // 新增
  import emojiRoutes from './routes/emoji.js';        // 新增

  // 路由导入
  import authRoutes from './routes/auth.js';
  import userRoutes from './routes/user.js';
  import messageRoutes from './routes/message.js';

  // WebSocket处理
  import { setupWebSocket } from './websocket/handler.js';

  dotenv.config();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',  // Vue 开发服务器地址
      methods: ['GET', 'POST']
    }
  });

  // 中间件
 // CORS 配置（必须在 helmet 之前）
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Helmet 安全头部（允许跨域资源）
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 静态文件服务（添加 CORS 头）
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');    
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static('uploads'));
  app.use(morgan('dev'));  // 日志
  app.use(express.json());  // 解析 JSON
  app.use(express.urlencoded({ extended: true }));  // 解析 URL 编码
  

  // 测试路由
  app.get('/', (req, res) => {
    res.json({
      message: '聊天应用 API 正在运行！',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        user: '/api/user',
        messages: '/api/messages'
      }
    });
  });

  // 数据库测试路由
  app.get('/api/test-db', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
      res.json({
        success: true,
        message: '数据库连接正常',
        userCount: rows[0].count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // API 路由
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/upload', uploadRoutes);       // 新增
  app.use('/api/emojis', emojiRoutes);        // 新增：包含 /api/emojis 和 /api/emojis/stickers

  // WebSocket 初始化
  setupWebSocket(io);

  io.engine.on("connection_error", (err) => {
    console.error('WebSocket 连接错误:', err);
  });

  // 监控连接数
  setInterval(() => {
    const socketsCount = io.engine.clientsCount;
    console.log(`� 当前 WebSocket 连接数: ${socketsCount}`);
  }, 60000); // 每分钟打印一次

  // 404 处理
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: '路由不存在'
    });
  });

  // 错误处理中间件
  app.use((err, req, res, next) => {
    console.error('错误:', err);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  // 启动服务器
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`� 服务器运行在 http://localhost:${PORT}`);
    console.log(`� WebSocket 运行在 ws://localhost:${PORT}`);
  });