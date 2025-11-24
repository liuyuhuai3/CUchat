import express from 'express';

  const router = express.Router();

  // 临时的路由占位符，后续会实现
  router.get('/', (req, res) => {
    res.json({ message: '获取消息列表功能待实现' });
  });

  router.post('/', (req, res) => {
    res.json({ message: '发送消息功能待实现' });
  });

  export default router;