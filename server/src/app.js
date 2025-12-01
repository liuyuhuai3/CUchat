  import express from 'express';
  import session from 'express-session';
  import passport from 'passport';
  import http from 'http';
  import { Server } from 'socket.io';
  import cors from 'cors';
  import helmet from 'helmet';
  import morgan from 'morgan';
  import dotenv from 'dotenv';
  import db from './config/database.js';
  import './config/passport.js';
  import uploadRoutes from './routes/upload.js';
  import emojiRoutes from './routes/emoji.js';
  import { generateToken } from './utils/jwt.js';
  import Session from './models/Session.js';

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
  // Session 配置（在路由和其他中间件之前）
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-chatroom-session-secret', // 建议使用环境变量
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // 开发环境设为false，生产环境根据HTTPS设置
  }));

  // 初始化Passport
  app.use(passport.initialize());
  app.use(passport.session());

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

  app.use(morgan('dev'));  // 日志
  app.use(express.json());  // 解析 JSON
  app.use(express.urlencoded({ extended: true }));  // 解析 URL 编码

  // 静态文件服务（添加 CORS 头）
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');    
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static('uploads'));
  

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
  app.use('/api/upload', uploadRoutes);
  app.use('/api/emojis', emojiRoutes);

  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  // Google OAuth 路由 - 详细日志
  app.get('/api/auth/google',
    (req, res, next) => {
      console.log('🚀 开始 Google OAuth 认证流程');
      console.log('📝 回调 URL:', '/auth/google/callback');
      next();
    },
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })
  );

  // Google OAuth2 回调路由 - 详细日志和错误处理
  app.get('/api/auth/google/callback',
    (req, res, next) => {
      console.log('🔄 收到 Google 回调');
      console.log('📋 查询参数:', req.query);
      next();
    },
    passport.authenticate('google', { 
      failureRedirect: process.env.FRONTEND_URL + '/login?error=auth_failed',
      failureMessage: true
    }),
    async (req, res) => {
      try {
        console.log('✅ Google OAuth 认证成功');
        console.log('👤 用户信息:', req.user);

        // 生成 JWT token
        const token = generateToken({ userId: req.user.id });

        // 创建会话并存储在数据库中
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7) // 7天后过期

        await Session.create(req.user.id, token, expiresAt);
        console.log('🔑 JWT Token 已生成:', token.substring(0,20) + '...');
      
        // 重定向到前端，并携带token
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendURL}/login?auth=success&token=${encodeURIComponent(token)}`);
    } catch (error) {
        console.error('❌ 处理 Google OAuth 回调时出错:', error);
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendURL}/login?error=token_generation_failed`);
      }
    }
  );

  // 添加认证状态检查路由（用于调试）
  app.get('/auth/status', (req, res) => {
    console.log('🔍 检查认证状态，用户:', req.user);
    res.json({ 
      authenticated: !!req.user,
      user: req.user || null
    });
  });

  // 登出路由
  app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });

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