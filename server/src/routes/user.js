import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
    getProfile,
    updateProfile,
    getOnlineUsers,
    getRoomUsers
  } from '../controllers/userController.js';
import uploadAvatar from '../middlewares/uploadAvatar.js';

  const router = express.Router();

  // 所有路由都需要认证
  router.use(authenticateToken);

  // 获取当前用户信息
  // GET /api/users/profile
  router.get('/profile', getProfile);

  // 更新用户个人资料
  // PUT /api/users/profile
  router.put('/profile', uploadAvatar.single('avatar'), updateProfile);

  // 获取在线用户列表
  // GET /api/users/online
  router.get('/online', getOnlineUsers);

  // 获取房间内用户
  // GET /api/users/room/:roomId
  router.get('/room/:roomId', getRoomUsers);

  export default router;