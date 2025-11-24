import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { authenticateToken as authMiddleware } from '../middlewares/auth.js';
  const router = express.Router();

  // 注册
  router.post('/register', register);

  // 登录
  router.post('/login', login);

  // 登出
  router.post('/logout', logout);

  router.get('/me', authMiddleware, async (req, res) => {
  
  // 返回当前登录用户信息

  res.json({
    success: true,
    user: req.user
    });
  });

  export default router;