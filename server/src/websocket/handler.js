 import Message from '../models/Message.js';
  import OnlineUser from '../models/OnLineUser.js';
  import User from '../models/User.js';
  import { verifyToken } from '../utils/jwt.js';

  /**
   * 在线用户映射表
   * 结构: { socket.id: { userId, username, roomId } }
   */
  const onlineUsers = new Map();

  /**
   * 房间映射表
   * 结构: { roomId: Set([socket.id, socket.id, ...]) }
   */
  const rooms = new Map();

  /**
   * 正在输入的用户
   * 结构: { roomId: Set([userId, userId, ...]) }
   */
  const typingUsers = new Map();

  /**
   * 设置 WebSocket 事件处理
   */
  export function setupWebSocket(io) {
    console.log('✅ WebSocket 服务已初始化');

    // 中间件：验证 JWT Token
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('未提供认证 token'));
        }

        // 验证 token
        const decoded = verifyToken(token);

        // 获取用户信息
        const user = await User.findById(decoded.userId);

        if (!user) {
          return next(new Error('用户不存在'));
        }

        // 将用户信息附加到 socket
        socket.userId = user.id;
        socket.username = user.nickname || user.username;
        socket.userAvatar = user.avatar_url;

        next();
      } catch (error) {
        console.error('WebSocket 认证失败:', error.message);
        next(new Error('认证失败'));
      }
    });

    // 处理连接
    io.on('connection', (socket) => {
      console.log(`� 用户连接: ${socket.username} (${socket.id})`);

      // ============================================
      // 事件 1: 加入房间
      // ============================================
      socket.on('join-room', async (data) => {
        try {
          const { roomId = '1' } = data;
          const userId = socket.userId;

          console.log(`� ${socket.username} 正在加入房间 ${roomId}`);

          // 离开之前的房间
          socket.rooms.forEach(room => {
            if (room !== socket.id) {
              socket.leave(room);
              removeUserFromRoom(room, socket.id);
            }
          });

          // 加入新房间
          socket.join(roomId);
          socket.currentRoomId = roomId;

          // 添加到房间映射
          addUserToRoom(roomId, socket.id);

          // 添加到在线用户映射
          onlineUsers.set(socket.id, {
            userId,
            username: socket.username,
            avatar: socket.userAvatar,
            roomId
          });

          // 添加到数据库在线用户表
          await OnlineUser.add({
            user_id: userId,
            socket_id: socket.id,
            ip_address: socket.handshake.address,
            device_info: socket.handshake.headers['user-agent']
          });

          // 获取房间内所有在线用户
          const roomUsers = await getRoomUsers(roomId);

          // 通知房间内所有人：新用户上线
          io.to(roomId).emit('user-online', {
            userId,
            username: socket.username,
            avatar: socket.userAvatar,
            timestamp: new Date().toISOString(),
            onlineUsers: roomUsers
          });

          // 向当前用户发送房间信息
          socket.emit('room-joined', {
            roomId,
            onlineUsers: roomUsers,
            message: `成功加入房间 ${roomId}`
          });

          // 发送系统消息
          const systemMessage = {
            _id: `system_${Date.now()}`,
            senderId: '0',
            content: `${socket.username} 加入了聊天室`,
            system: true,
            timestamp: new Date().toISOString()
          };
          io.to(roomId).emit('system-message', systemMessage);

          console.log(`✅ ${socket.username} 已加入房间 ${roomId}`);
          console.log(`� 房间 ${roomId} 当前在线: ${roomUsers.length} 人`);

        } catch (error) {
          console.error('加入房间失败:', error);
          socket.emit('error', {
            event: 'join-room',
            message: '加入房间失败',
            error: error.message
          });
        }
      });

      // ============================================
      // 事件 2: 离开房间
      // ============================================
      socket.on('leave-room', async (data) => {
        try {
          const { roomId } = data;
          const userId = socket.userId;

          console.log(`� ${socket.username} 正在离开房间 ${roomId}`);

          // 离开房间
          socket.leave(roomId);
          removeUserFromRoom(roomId, socket.id);

          // 从在线用户表中移除
          await OnlineUser.removeBySocketId(socket.id);

          // 获取更新后的在线用户列表
          const roomUsers = await getRoomUsers(roomId);

          // 通知房间内其他人：用户离开
          io.to(roomId).emit('user-offline', {
            userId,
            username: socket.username,
            timestamp: new Date().toISOString(),
            onlineUsers: roomUsers
          });

          // 发送系统消息
          const systemMessage = {
            _id: `system_${Date.now()}`,
            senderId: '0',
            content: `${socket.username} 离开了聊天室`,
            system: true,
            timestamp: new Date().toISOString()
          };
          io.to(roomId).emit('system-message', systemMessage);

          // 确认离开
          socket.emit('room-left', {
            roomId,
            message: `已离开房间 ${roomId}`
          });

          console.log(`✅ ${socket.username} 已离开房间 ${roomId}`);

        } catch (error) {
          console.error('离开房间失败:', error);
          socket.emit('error', {
            event: 'leave-room',
            message: '离开房间失败',
            error: error.message
          });
        }
      });

      // ============================================
      // 事件 3: 发送消息
      // ============================================
      socket.on('send-message', async (data) => {
        try {
          const {
            roomId = '1',
            content,
            messageType = 'text',
            fileUrl,
            fileSize,
            fileName,
            thumbnailUrl,
            audioDuration,
            replyToId
          } = data;

          const userId = socket.userId;

          console.log(`� ${socket.username} 发送消息到房间 ${roomId}`);

          // 验证消息内容
          if (!content && !fileUrl) {
            socket.emit('error', {
              event: 'send-message',
              message: '消息内容不能为空'
            });
            return;
          }

          // 保存消息到数据库
          const messageId = await Message.create({
            room_id: roomId,
            user_id: userId,
            content,
            message_type: messageType,
            file_url: fileUrl,
            file_size: fileSize,
            file_name: fileName,
            thumbnail_url: thumbnailUrl,
            audio_duration: audioDuration,
            reply_to_id: replyToId
          });

          // 获取完整消息（包含用户信息）
          const message = await Message.findById(messageId);

          // 构建要广播的消息对象
          const broadcastMessage = {
            _id: message.id.toString(),
            content: message.content,
            senderId: message.user_id.toString(),
            username: message.nickname || message.username,
            avatar: message.avatar_url,
            timestamp: new Date(message.created_at).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            date: formatMessageDate(message.created_at),
            messageType: message.message_type,
            files: formatFiles(message),
            saved: true,
            distributed: true,
            seen: false,
            deleted: false,
            replyMessage: null // TODO: 如果有 reply_to_id，需要查询被回复的消息
          };

          // 广播给房间内所有用户（包括发送者）
          io.to(roomId).emit('new-message', broadcastMessage);

          // 停止正在输入状态
          removeTypingUser(roomId, userId);
          io.to(roomId).emit('user-stop-typing', {
            userId,
            username: socket.username,
            typingUsers: getTypingUsers(roomId)
          });

          console.log(`✅ 消息已广播到房间 ${roomId}`);

        } catch (error) {
          console.error('发送消息失败:', error);
          socket.emit('error', {
            event: 'send-message',
            message: '发送消息失败',
            error: error.message
          });
        }
      });

      // ============================================
      // 事件 4: 正在输入
      // ============================================
      socket.on('typing', (data) => {
        try {
          const { roomId = '1', isTyping } = data;
          const userId = socket.userId;

          if (isTyping) {
            // 添加到正在输入列表
            addTypingUser(roomId, userId);

            // 通知房间内其他人（不包括自己）
            socket.to(roomId).emit('user-typing', {
              userId,
              username: socket.username,
              typingUsers: getTypingUsers(roomId)
            });

            console.log(`⌨️  ${socket.username} 正在输入...`);
          } else {
            // 从正在输入列表移除
            removeTypingUser(roomId, userId);

            // 通知房间内其他人
            socket.to(roomId).emit('user-stop-typing', {
              userId,
              username: socket.username,
              typingUsers: getTypingUsers(roomId)
            });

            console.log(`⏹️  ${socket.username} 停止输入`);
          }

        } catch (error) {
          console.error('处理输入状态失败:', error);
        }
      });

      // ============================================
      // 事件 5: 编辑消息
      // ============================================
      socket.on('edit-message', async (data) => {
        try {
          const { messageId, content, roomId = '1' } = data;
          const userId = socket.userId;

          console.log(`✏️  ${socket.username} 正在编辑消息 ${messageId}`);

          // 检查消息所有权
          const isOwner = await Message.isOwner(messageId, userId);
          if (!isOwner) {
            socket.emit('error', {
              event: 'edit-message',
              message: '无权编辑此消息'
            });
            return;
          }

          // 更新消息
          await Message.update(messageId, { content });

          // 获取更新后的消息
          const updatedMessage = await Message.findById(messageId);

          // 广播消息更新
          io.to(roomId).emit('message-edited', {
            messageId: updatedMessage.id.toString(),
            content: updatedMessage.content,
            updatedAt: updatedMessage.updated_at
          });

          console.log(`✅ 消息 ${messageId} 已更新`);

        } catch (error) {
          console.error('编辑消息失败:', error);
          socket.emit('error', {
            event: 'edit-message',
            message: '编辑消息失败',
            error: error.message
          });
        }
      });

      // ============================================
      // 事件 6: 删除消息
      // ============================================
      socket.on('delete-message', async (data) => {
        try {
          const { messageId, roomId = '1' } = data;
          const userId = socket.userId;

          console.log(`�️  ${socket.username} 正在删除消息 ${messageId}` );

          // 检查消息所有权
          const isOwner = await Message.isOwner(messageId, userId);
          if (!isOwner) {
            socket.emit('error', {
              event: 'delete-message',
              message: '无权删除此消息'
            });
            return;
          }

          // 软删除消息
          await Message.softDelete(messageId);

          // 广播消息删除
          io.to(roomId).emit('message-deleted', {
            messageId: messageId.toString()
          });

          console.log(`✅ 消息 ${messageId} 已删除`);

        } catch (error) {
          console.error('删除消息失败:', error);
          socket.emit('error', {
            event: 'delete-message',
            message: '删除消息失败',
            error: error.message
          });
        }
      });

      // ============================================
      // 事件 7: 标记消息已读
      // ============================================
      socket.on('mark-as-read', async (data) => {
        try {
          const { messageId, roomId = '1' } = data;

          await Message.markAsRead(messageId);

          // 通知消息发送者
          socket.to(roomId).emit('message-read', {
            messageId: messageId.toString(),
            readBy: socket.userId
          });

        } catch (error) {
          console.error('标记已读失败:', error);
        }
      });

      // ============================================
      // 事件 8: 断开连接
      // ============================================
      socket.on('disconnect', async () => {
        try {
          console.log(`� 用户断开: ${socket.username} (${socket.id})`);

          const userInfo = onlineUsers.get(socket.id);

          if (userInfo) {
            const { roomId, userId, username } = userInfo;

            // 从房间移除
            removeUserFromRoom(roomId, socket.id);

            // 从在线用户映射移除
            onlineUsers.delete(socket.id);

            // 从正在输入列表移除
            removeTypingUser(roomId, userId);

            // 从数据库移除
            await OnlineUser.removeBySocketId(socket.id);

            // 获取更新后的在线用户列表
            const roomUsers = await getRoomUsers(roomId);

            // 通知房间内其他人
            io.to(roomId).emit('user-offline', {
              userId,
              username,
              timestamp: new Date().toISOString(),
              onlineUsers: roomUsers
            });

            // 发送系统消息
            const systemMessage = {
              _id: `system_${Date.now()}`,
              senderId: '0',
              content: `${username} 离开了聊天室`,
              system: true,
              timestamp: new Date().toISOString()
            };
            io.to(roomId).emit('system-message', systemMessage);

            console.log(`� ${username} 已离线`);
            console.log(`� 房间 ${roomId} 当前在线: ${roomUsers.length} 人`);
          }

        } catch (error) {
          console.error('处理断开连接失败:', error);
        }
      });

      // ============================================
      // 事件 9: 错误处理
      // ============================================
      socket.on('error', (error) => {
        console.error('Socket 错误:', error);
      });

    });

    // 定期清理超时的在线用户（每 5 分钟）
    setInterval(async () => {
      try {
        const removed = await OnlineUser.cleanupInactive();
        if (removed > 0) {
          console.log(`� 清理了 ${removed} 个超时的在线用户` );
        }
      } catch (error) {
        console.error('清理在线用户失败:', error);
      }
    }, 5 * 60 * 1000);
  }

  // ============================================
  // 辅助函数
  // ============================================

  /**
   * 添加用户到房间
   */
  function addUserToRoom(roomId, socketId) {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socketId);
  }

  /**
   * 从房间移除用户
   */
  function removeUserFromRoom(roomId, socketId) {
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socketId);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      }
    }
  }

  /**
   * 获取房间内所有用户
   */
  async function getRoomUsers(roomId) {
    try {
      const users = await OnlineUser.getRoomOnlineUsers(roomId);
      return users;
    } catch (error) {
      console.error('获取房间用户失败:', error);
      return [];
    }
  }

  /**
   * 添加正在输入的用户
   */
  function addTypingUser(roomId, userId) {
    if (!typingUsers.has(roomId)) {
      typingUsers.set(roomId, new Set());
    }
    typingUsers.get(roomId).add(userId);
  }

  /**
   * 移除正在输入的用户
   */
  function removeTypingUser(roomId, userId) {
    if (typingUsers.has(roomId)) {
      typingUsers.get(roomId).delete(userId);
      if (typingUsers.get(roomId).size === 0) {
        typingUsers.delete(roomId);
      }
    }
  }

  /**
   * 获取正在输入的用户列表
   */
  function getTypingUsers(roomId) {
    if (typingUsers.has(roomId)) {
      return Array.from(typingUsers.get(roomId));
    }
    return [];
  }

  /**
   * 格式化消息日期
   */
  function formatMessageDate(createdAt) {
    const date = new Date(createdAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) return '今天';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) return '昨天';

    return date.toLocaleDateString('zh-CN', {
      day: 'numeric',
      month: 'long'
    });
  }

  /**
   * 格式化文件信息
   */
  function formatFiles(message) {
    if (!message.file_url) return [];

    return [{
      name: message.file_name || 'file',
      size: message.file_size || 0,
      type: getFileType(message.message_type, message.file_url),
      url: message.file_url,
      audio: message.message_type === 'audio',
      duration: message.audio_duration || null,
      preview: message.thumbnail_url || (message.message_type === 'image' ? message.file_url : null)      
    }];
  }

  /**
   * 获取文件类型
   */
  function getFileType(messageType, fileUrl) {
    if (messageType === 'image') return 'png';
    if (messageType === 'audio') return 'mp3';

    // 从 URL 提取扩展名
    const ext = fileUrl.split('.').pop().toLowerCase();
    return ext || 'file';
  }