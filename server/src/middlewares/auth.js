import { verifyToken } from '../utils/jwt.js';
  import Session from '../models/Session.js';
  import User from '../models/User.js';

  /**
   * JWT 认证中间件
   */
  export async function authenticateToken(req, res, next) {
    try {
      // 从请求头获取 token
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: '未提供认证 token'
        });
      }

      // 验证 token 格式
      const decoded = verifyToken(token);

      // 检查 session 是否存在且未过期
      const session = await Session.findByToken(token);
      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Token 已失效，请重新登录'
        });
      }

      // 获取用户信息
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 检查用户状态
      if (user.status === 0) {
        return res.status(403).json({
          success: false,
          message: '账号已被禁用'
        });
      }

      // 将用户信息附加到请求对象
      req.user = user;
      req.token = token;

      next();

    } catch (error) {
      console.error('认证错误:', error);
      return res.status(401).json({
        success: false,
        message: 'Token 无效或已过期'
      });
    }
  }