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
      const { nickname, age, bio, avatar_url } = req.body;
      const userId = req.user.id;

      const updates = {};
      if (nickname !== undefined) updates.nickname = nickname;
      if (age !== undefined) updates.age = age;
      if (bio !== undefined) updates.bio = bio;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;

      await User.update(userId, updates);
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