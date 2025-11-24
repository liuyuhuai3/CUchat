 import User from '../models/User.js';
  import Session from '../models/Session.js';
  import { generateToken } from '../utils/jwt.js';

  /**
   * 注册新用户
   */
  export async function register(req, res) {
    try {
      const { username, email, password, nickname } = req.body;

      // 验证必填字段
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名、邮箱和密码不能为空'
        });
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: '邮箱格式不正确'
        });
      }

      // 验证密码长度
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: '密码长度至少为 6 位'
        });
      }

      // 检查邮箱是否已存在
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被注册'
        });
      }

      // 检查用户名是否已存在
      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({
          success: false,
          message: '该用户名已被使用'
        });
      }

      // 创建用户
      const userId = await User.create({
        username,
        email,
        password,
        nickname
      });

      // 生成 JWT token
      const token = generateToken({ userId });

      // 计算过期时间（7天后）
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // 存储 session
      await Session.create(userId, token, expiresAt);

      // 获取用户信息（不包含密码）
      const user = await User.findById(userId);

      // 返回成功响应
      res.status(201).json({
        success: true,
        message: '注册成功',
        token,
        user
      });

    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 用户登录
   */
  export async function login(req, res) {
    try {
      const { email, password } = req.body;

      // 验证必填字段
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: '邮箱和密码不能为空'
        });
      }

      // 查找用户
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      // 检查用户状态
      if (user.status === 0) {
        return res.status(403).json({
          success: false,
          message: '该账号已被禁用'
        });
      }

      // 验证密码
      const isPasswordValid = await User.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      // 生成 JWT token
      const token = generateToken({ userId: user.id });

      // 计算过期时间（7天后）
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // 存储 session
      await Session.create(user.id, token, expiresAt);

      // 获取用户信息（不包含密码）
      const userInfo = await User.findById(user.id);

      // 返回成功响应
      res.json({
        success: true,
        message: '登录成功',
        token,
        user: userInfo
      });

    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 用户登出
   */
  export async function logout(req, res) {
    try {
      // 从请求头获取 token
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(400).json({
          success: false,
          message: '未提供 token'
        });
      }

      // 删除 session
      await Session.deleteByToken(token);

      res.json({
        success: true,
        message: '登出成功'
      });

    } catch (error) {
      console.error('登出错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }