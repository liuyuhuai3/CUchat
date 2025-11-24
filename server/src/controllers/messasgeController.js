import Message from '../models/Message.js';
import User from '../models/User.js';
import OnlineUser from '../models/OnLineUser.js';


   /**
   * 添加/移除消息 emoji 反应
   * POST /api/messages/:messageId/reaction
   */
  export async function addReaction(req, res) {
    try {
      const { messageId } = req.params;
      const { emoji, remove } = req.body;
      const user_id = req.user.id;

      // 这里你需要创建一个 reactions 表或者在 messages 表添加 JSON 字段
      // 简单做法：在 messages 表添加 reactions JSON 字段存储
      // { "�": [1, 2, 3], "❤️": [4, 5] }  // user_id 数组

      if (remove) {
        // 移除反应逻辑
      } else {
        // 添加反应逻辑
      }

      res.json({
        success: true,
        message: remove ? '反应已移除' : '反应已添加'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: '操作失败' });
    }
  }

  /**
   * 获取聊天室消息（支持分页）
   * GET /api/messages?roomId=1&page=1&pageSize=50
   */
  export async function getMessages(req, res) {
    try {
      const { roomId = 1, page = 1, pageSize = 50 } = req.query;

      // 验证参数
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: '无效的页码'
        });
      }

      if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
        return res.status(400).json({
          success: false,
          message: '无效的页面大小（1-100）'
        });
      }

      // 获取消息列表
      const messages = await Message.getByRoomId(roomId, {
        page: pageNum,
        pageSize: pageSizeNum
      });

      res.json({
        success: true,
        messages,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          total: messages.length
        }
      });

    } catch (error) {
      console.error('获取消息失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 发送消息
   * POST /api/messages
   */
  export async function sendMessage(req, res) {
    try {
      const {
        room_id = 1,
        content,
        message_type = 'text',
        file_url,
        file_size,
        file_name,
        thumbnail_url,
        audio_duration,
        reply_to_id
      } = req.body;

      const user_id = req.user.id;

      // 验证消息内容
      if (!content && !file_url) {
        return res.status(400).json({
          success: false,
          message: '消息内容或文件不能为空'
        });
      }

      // 验证消息类型
      const validTypes = ['text', 'image', 'audio', 'emoji', 'sticker'];
      if (!validTypes.includes(message_type)) {
        return res.status(400).json({
          success: false,
          message: '无效的消息类型'
        });
      }

      // 创建消息
      const messageId = await Message.create({
        room_id,
        user_id,
        content,
        message_type,
        file_url,
        file_size,
        file_name,
        thumbnail_url,
        audio_duration,
        reply_to_id
      });

      // 获取完整的消息信息（包含用户信息）
      const message = await Message.findById(messageId);

      res.status(201).json({
        success: true,
        message: '消息发送成功',
        data: message
      });

    } catch (error) {
      console.error('发送消息失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 编辑消息
   * PUT /api/messages/:messageId
   */
  export async function editMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { content, message_type, file_url } = req.body;
      const user_id = req.user.id;

      // 检查消息是否存在
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: '消息不存在'
        });
      }

      // 检查是否是消息所有者
      const isOwner = await Message.isOwner(messageId, user_id);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: '无权编辑此消息'
        });
      }

      // 更新消息
      await Message.update(messageId, {
        content,
        message_type,
        file_url
      });

      // 获取更新后的消息
      const updatedMessage = await Message.findById(messageId);

      res.json({
        success: true,
        message: '消息更新成功',
        data: updatedMessage
      });

    } catch (error) {
      console.error('编辑消息失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 删除消息（软删除）
   * DELETE /api/messages/:messageId
   */
  export async function deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const user_id = req.user.id;

      // 检查消息是否存在
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: '消息不存在'
        });
      }

      // 检查是否是消息所有者
      const isOwner = await Message.isOwner(messageId, user_id);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: '无权删除此消息'
        });
      }

      // 软删除消息
      await Message.softDelete(messageId);

      res.json({
        success: true,
        message: '消息删除成功'
      });

    } catch (error) {
      console.error('删除消息失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 标记消息为已读
   * PUT /api/messages/:messageId/read
   */
  export async function markAsRead(req, res) {
    try {
      const { messageId } = req.params;

      await Message.markAsRead(messageId);

      res.json({
        success: true,
        message: '已标记为已读'
      });

    } catch (error) {
      console.error('标记已读失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 批量标记房间消息为已读
   * PUT /api/messages/room/:roomId/read
   */
  export async function markRoomAsRead(req, res) {
    try {
      const { roomId } = req.params;
      const user_id = req.user.id;

      await Message.markRoomMessagesAsRead(roomId, user_id);

      res.json({
        success: true,
        message: '已标记房间所有消息为已读'
      });

    } catch (error) {
      console.error('标记房间已读失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 获取未读消息数量
   * GET /api/messages/unread?roomId=1
   */
  export async function getUnreadCount(req, res) {
    try {
      const { roomId = 1 } = req.query;
      const user_id = req.user.id;

      const count = await Message.getUnreadCount(roomId, user_id);

      res.json({
        success: true,
        unreadCount: count
      });

    } catch (error) {
      console.error('获取未读数失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

   /**
   * 上传图片
   * POST /api/upload/image
   */
  export async function uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '没有上传文件'
        });
      }

      // 构建文件 URL
      const fileUrl = `/uploads/images/${req.file.filename}`;

      res.json({
        success: true,
        message: '图片上传成功',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });

    } catch (error) {
      console.error('上传图片失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 上传音频
   * POST /api/upload/audio
   */
  export async function uploadAudio(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '没有上传文件'
        });
      }

      // 构建文件 URL
      const fileUrl = `/uploads/audio/${req.file.filename}`;

      res.json({
        success: true,
        message: '音频上传成功',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          duration: null // 可以使用 ffmpeg 等工具获取音频时长
        }
      });

    } catch (error) {
      console.error('上传音频失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 上传通用文件
   * POST /api/upload/file
   */
  export async function uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '没有上传文件'
        });
      }

      // 构建文件 URL
      const fileUrl = `/uploads/${req.file.filename}`;

      res.json({
        success: true,
        message: '文件上传成功',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });

    } catch (error) {
      console.error('上传文件失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  server/src/controllers/emojiController.js

  import Emoji from '../models/Emoji.js';
  import Sticker from '../models/Sticker.js';

  /**
   * 获取 Emoji 列表
   * GET /api/emojis
   */
  export async function getEmojis(req, res) {
    try {
      const user_id = req.user.id;

      const emojis = await Emoji.getAllEmojis(user_id);

      res.json({
        success: true,
        emojis
      });

    } catch (error) {
      console.error('获取 Emoji 失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 创建用户自定义 Emoji
   * POST /api/emojis
   */
  export async function createUserEmoji(req, res) {
    try {
      const { emoji_code, emoji_url, name } = req.body;
      const user_id = req.user.id;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Emoji 名称不能为空'
        });
      }

      const emojiId = await Emoji.createUserEmoji({
        user_id,
        emoji_code,
        emoji_url,
        name
      });

      res.status(201).json({
        success: true,
        message: '自定义 Emoji 创建成功',
        emojiId
      });

    } catch (error) {
      console.error('创建 Emoji 失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 获取贴纸列表
   * GET /api/emojis/stickers
   */
  export async function getStickers(req, res) {
    try {
      const { category } = req.query;

      let stickers;
      if (category) {
        stickers = await Sticker.getByCategory(category);
      } else {
        stickers = await Sticker.getAll();
      }

      // 获取所有分类
      const categories = await Sticker.getCategories();

      res.json({
        success: true,
        stickers,
        categories
      });

    } catch (error) {
      console.error('获取贴纸失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  server/src/controllers/userController.js

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