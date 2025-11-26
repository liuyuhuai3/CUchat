import User from '../models/User.js';
import OnlineUser from '../models/OnLineUser.js';

  /**
   * 获取当前用户信息
   * GET /api/users/profile
   */
  export async function getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 更新用户个人资料
   * PUT /api/users/profile
   */
  export async function updateProfile(req, res) {
    try {
      // 从 req.body 中获取文本字段
      const { nickname, age, bio } = req.body; // 移除 avatar_url，因为现在通过文件上传获取
      const userId = req.user.id;

      const updates = {};
      if (nickname !== undefined) updates.nickname = nickname;
      if (age !== undefined) updates.age = age;
      if (bio !== undefined) updates.bio = bio;

      // 检查是否有上传的文件（通过 multer 中间件处理）
      if (req.file) {
        // 生成文件访问URL - 使用你现有的 BASE_URL 配置
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        updates.avatar_url = `${baseUrl}/uploads/avatars/${req.file.filename}`;
      }

      // 添加错误处理，检查是否成功更新
      await User.update(userId, updates);
      const updated = await User.update(userId, updates);
      if (!updated) {
        return res.status(400).json({
          success: false,
          message: '更新失败'
        });
      }

      const updatedUser = await User.findById(userId);

      res.json({
        success: true,
        message: '个人资料更新成功',
        user: updatedUser
      });
    } catch (error) {
      console.error('更新用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 获取在线用户列表
   * GET /api/users/online
   */
  export async function getOnlineUsers(req, res) {
    try {
      const users = await OnlineUser.getRoomOnlineUsers();

      res.json({
        success: true,
        users,
        count: users.length
      });

    } catch (error) {
      console.error('获取在线用户失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 获取房间内用户
   * GET /api/users/room/:roomId
   */
  export async function getRoomUsers(req, res) {
    try {
      const { roomId = 1 } = req.params;

      // 获取在线用户
      const onlineUsers = await OnlineUser.getRoomOnlineUsers(roomId);

      // 获取在线用户 ID 列表
      const onlineUserIds = await OnlineUser.getAllUserIds();

      res.json({
        success: true,
        users: onlineUsers,
        onlineUserIds,
        count: onlineUsers.length
      });

    } catch (error) {
      console.error('获取房间用户失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }