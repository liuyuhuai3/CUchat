import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
    getEmojis,
    createUserEmoji,
    getStickers
  } from '../controllers/emojiController.js';

  const router = express.Router();

  // 所有路由都需要认证
  router.use(authenticateToken);

  // 获取 Emoji 列表
  // GET /api/emojis
  router.get('/', getEmojis);

  // 创建用户自定义 Emoji
  // POST /api/emojis
  router.post('/', createUserEmoji);

  // 获取贴纸列表
  // GET /api/stickers?category=funny
  router.get('/stickers', getStickers);

  export default router;