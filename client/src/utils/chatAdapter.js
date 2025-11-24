//client/src/utils/
//   ├── request.js          # 现有的 Axios 实例
//   └── chatAdapter.js      # 新建：数据适配器

//   设计原则：
//   - 单一职责：只负责数据格式转换
//   - 纯函数：不依赖外部状态
//   - 可测试：易于编写单元测试
//   - 可复用：多个组件可共享

 export function formatLastSeen(timestamp) {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();

    // 检查是否是今天
    const isToday = date.toDateString() === now.toDateString();

    const timeString = date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    if (isToday) {
      return `today, ${timeString}`;
    }

    // 其他日期
    const dateString = date.toLocaleDateString('zh-CN', {
      day: 'numeric',
      month: 'short'
    });

    return `${dateString}, ${timeString}`;
  }

   export function formatMessageDate(createdAt) {
    if (!createdAt) return '';

    const date = new Date(createdAt);
    const now = new Date();

    // 检查是否是今天
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return '今天';

    // 检查是否是昨天
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    if (isYesterday) return '昨天';

    // 其他日期
    return date.toLocaleDateString('zh-CN', {
      day: 'numeric',
      month: 'long'
    });
  }

   export function formatMessageTime(createdAt) {
    if (!createdAt) return '';

    const date = new Date(createdAt);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  function extractFileName(url) {
    if (!url) return 'file';

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
      return filename || 'file';
    } catch {
      // 如果不是完整 URL，直接从路径提取
      return url.substring(url.lastIndexOf('/') + 1) || 'file';
    }
  }

   function getFileExtension(url) {
    if (!url) return '';

    const filename = extractFileName(url);
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

   function convertFiles(message) {
    if (!message.file_url) return [];

    const extension = getFileExtension(message.file_url);

    // 根据 message_type 确定文件类型
    const fileTypeMap = {
      'image': extension || 'png',
      'audio': extension || 'mp3',
      'video': extension || 'mp4',
      'file': extension || 'file'
    };

    const file = {
      name: extractFileName(message.file_url),
      size: message.file_size || 0,
      type: fileTypeMap[message.message_type] || extension || 'file',
      url: message.file_url
    };

    // 如果是图片，添加预览
    if (message.message_type === 'image') {
      file.preview = message.thumbnail_url || message.file_url;
    }

    // 如果是音频，添加音频属性
    if (message.message_type === 'audio') {
      file.audio = true;
      file.duration = message.audio_duration || 0;
    }

    return [file];
  }

  export function convertUserToRoomUser({ user, onlineUsers = [] }) {
    if (!user) {
      console.error('convertUserToRoomUser: user is required');
      return null;
    }

    // 判断用户是否在线
    const isOnline = onlineUsers.includes(user.id);

    return {
      // ID 必须是字符串
      _id: user.id.toString(),

      // 优先使用 nickname，否则使用 username
      username: user.nickname || user.username,

      // 头像 URL（可选）
      avatar: user.avatar_url || null,

      // 在线状态
      status: {
        state: isOnline ? 'online' : 'offline',
        lastChanged: formatLastSeen(user.last_active || user.updated_at)
      }
    };
  }

   export function convertMessageToChatMessage({ message, currentUserId }) {
    if (!message) {
      console.error('convertMessageToChatMessage: message is required');
      return null;
    }

    // 判断是否是当前用户发送的消息
    const isMyMessage = message.user_id === currentUserId;

    // 基础消息对象
    const chatMessage = {
      // 消息 ID（必须是字符串）
      _id: message.id.toString(),

      // 消息内容
      content: message.content || '',

      // 发送者 ID（必须是字符串）
      senderId: message.user_id.toString(),

      // 发送者用户名（优先使用 nickname）
      username: message.nickname || message.username,

      // 发送者头像
      avatar: message.avatar_url || null,

      // 消息日期（用于分组）
      date: formatMessageDate(message.created_at),

      // 消息时间戳
      timestamp: formatMessageTime(message.created_at),

      // 是否是系统消息
      system: message.is_system || false,

      // 消息状态（只对自己发送的消息显示）
      saved: true,        // 一个勾 ✓
      distributed: true,  // 两个勾 ✓✓
      seen: isMyMessage && message.seen ? true : false,  // 蓝色勾（已读）

      // 是否已删除
      deleted: message.deleted || false,

      // 是否发送失败
      failure: message.failure || false,

      // 禁用操作（可选，默认允许所有操作）
      disableActions: false,
      disableReactions: false,

      // 文件附件
      files: convertFiles(message),

      // 表情回应（暂时为空对象，后续可从 reactions 表加载）
      reactions: message.reactions || {},

      // 回复的消息（如果存在）
      replyMessage: null  // 这里需要额外处理，见下方说明
    };

    // 如果消息已删除，修改内容
    if (chatMessage.deleted) {
      chatMessage.content = '此消息已被删除';
    }

    return chatMessage;
  }

   export function convertUsersToRoomUsers(users, onlineUsers = []) {
    if (!Array.isArray(users)) {
      console.error('convertUsersToRoomUsers: users must be an array');
      return [];
    }

    return users
      .map(user => convertUserToRoomUser({ user, onlineUsers }))
      .filter(user => user !== null);
  }

  export function convertMessagesToChatMessages(messages, currentUserId) {
    return messages.map(msg => ({
      _id: msg.id?.toString() || msg._id,
      senderId: msg.user_id?.toString() || msg.senderId || '0',
      content: msg.content || '',
      username: msg.nickname || msg.username,
      avatar: msg.avatar_url || msg.avatar,
      timestamp: msg.timestamp || new Date(msg.created_at).toLocaleTimeString(),
      date: msg.date || formatDate(msg.created_at),
      system: msg.is_system || msg.system || false,
      saved: true,
      distributed: true,
      seen: msg.seen || false,
      deleted: msg.deleted || false
    }));
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) return '今天';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) return '昨天';

    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric'
    });
  }
  

  export function createSystemMessage(content, timestamp = new Date()) {
    return {
      _id: `system_${Date.now()}`,
      content,
      system: true,
      date: formatMessageDate(timestamp),
      timestamp: formatMessageTime(timestamp)
    };
  }

  export function createTempMessage({ content, senderId, username, avatar }) {
    const now = new Date();

    return {
      _id: `temp_${Date.now()}`,
      content,
      senderId: senderId.toString(),
      username,
      avatar: avatar || null,
      date: formatMessageDate(now),
      timestamp: formatMessageTime(now),
      system: false,
      saved: false,      // 显示为未发送状态
      distributed: false,
      seen: false,
      deleted: false,
      files: [],
      reactions: {},
      replyMessage: null
    };
  }

  export function convertChatMessageToBackend(chatMessage, roomId) {
    const payload = {
      room_id: roomId,
      content: chatMessage.content,
      message_type: 'text'
    };

    // 如果有文件
    if (chatMessage.files && chatMessage.files.length > 0) {
      const file = chatMessage.files[0];
      payload.file_url = file.url;
      payload.file_size = file.size;

      // 根据文件类型确定 message_type
      if (file.audio) {
        payload.message_type = 'audio';
        payload.audio_duration = file.duration;
      } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(file.type)) {
        payload.message_type = 'image';
      } else {
        payload.message_type = 'file';
      }
    }

    // 如果是回复消息
    if (chatMessage.replyMessage) {
      payload.reply_to_id = parseInt(chatMessage.replyMessage._id);
    }

    return payload;
  }

  export function debugConversion(backend, frontend, type = 'data') {
    if (process.env.NODE_ENV !== 'development') return;

    console.group(`� ${type} Conversion`);
    console.log('� Backend:', backend);
    console.log('� Frontend:', frontend);
    console.groupEnd();
  }