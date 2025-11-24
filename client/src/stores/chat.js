import { defineStore } from 'pinia';

  export const useChatStore = defineStore('chat', {
    state: () => ({
      // 当前房间信息（单聊天室模式）
      currentRoom: {
        roomId: '1',  // 默认房间 ID，与数据库中的 room_id 对应     
        roomName: 'CUchat 聊天室',
        avatar: null,
        unreadCount: 0,
        users: []  // 房间内的用户列表
      },

      // 消息列表
      messages: [],

      // 在线用户列表
      onlineUsers: [],

      // 加载状态
      loadingMessages: false,  // 是否正在加载消息
      messagesLoaded: false,   // 消息是否全部加载完成（用于分页）

      // 房间加载状态
      loadingRooms: false,
      roomsLoaded: true,       // 单聊天室模式，房间默认已加载      

      // 输入状态
      typingUsers: [],  // 正在输入的用户 ID 列表

      // 分页信息
      currentPage: 1,
      pageSize: 50,  // 每次加载 50 条消息
      hasMoreMessages: true  // 是否还有更多历史消息
    }),

    actions: {
      // 设置当前房间信息
      setCurrentRoom(room) {
        this.currentRoom = { ...this.currentRoom, ...room };        
      },

      // 设置房间内的用户列表
      setRoomUsers(users) {
        this.currentRoom.users = users;
        this.currentRoom = { ...this.currentRoom };  // 触发响应式更新
      },

      // 设置消息列表
      setMessages(messages) {
        this.messages = messages;
      },

      // 添加单条消息（新消息）
      addMessage(message) {
        // 检查消息是否已存在（避免重复）
        const exists = this.messages.some(m => m._id ===
  message._id);
        if (!exists) {
          this.messages = [...this.messages, message];
        }
      },

      // 添加多条消息（加载历史消息，添加到开头）
      prependMessages(messages) {
        this.messages = [...messages, ...this.messages];
      },

      // 更新消息（编辑消息）
      updateMessage(messageId, updates) {
        const index = this.messages.findIndex(m => m._id ===        
  messageId);
        if (index !== -1) {
          this.messages[index] = { ...this.messages[index],
  ...updates };
          this.messages = [...this.messages];  // 触发响应式更新    
        }
      },

      // 删除消息
      deleteMessage(messageId) {
        const index = this.messages.findIndex(m => m._id ===        
  messageId);
        if (index !== -1) {
          // 标记为已删除，而不是真正删除
          this.messages[index] = {
            ...this.messages[index],
            deleted: true,
            content: '此消息已被删除'
          };
          this.messages = [...this.messages];
        }
      },

      // 设置在线用户列表
      setOnlineUsers(users) {
        this.onlineUsers = users;
      },

      // 添加在线用户
      addOnlineUser(userId) {
        if (!this.onlineUsers.includes(userId)) {
          this.onlineUsers = [...this.onlineUsers, userId];
        }
      },

      // 移除在线用户
      removeOnlineUser(userId) {
        this.onlineUsers = this.onlineUsers.filter(id => id !==     
  userId);
      },

      // 设置正在输入的用户
      setTypingUsers(userIds) {
        this.currentRoom.typingUsers = userIds;
        this.currentRoom = { ...this.currentRoom };
      },

      // 添加正在输入的用户
      addTypingUser(userId) {
        if (!this.currentRoom.typingUsers) {
          this.currentRoom.typingUsers = [];
        }
        if (!this.currentRoom.typingUsers.includes(userId)) {       
          this.currentRoom.typingUsers =
  [...this.currentRoom.typingUsers, userId];
          this.currentRoom = { ...this.currentRoom };
        }
      },

      // 移除正在输入的用户
      removeTypingUser(userId) {
        if (this.currentRoom.typingUsers) {
          this.currentRoom.typingUsers =
  this.currentRoom.typingUsers.filter(
            id => id !== userId
          );
          this.currentRoom = { ...this.currentRoom };
        }
      },

      // 设置加载状态
      setLoadingMessages(loading) {
        this.loadingMessages = loading;
      },

      setMessagesLoaded(loaded) {
        this.messagesLoaded = loaded;
      },

      // 清空聊天记录（退出聊天室时）
      clearMessages() {
        this.messages = [];
        this.currentPage = 1;
        this.hasMoreMessages = true;
        this.messagesLoaded = false;
      },

      // 重置 store（退出登录时）
      resetStore() {
        this.messages = [];
        this.onlineUsers = [];
        this.currentPage = 1;
        this.hasMoreMessages = true;
        this.messagesLoaded = false;
        this.loadingMessages = false;
        this.currentRoom.typingUsers = [];
      }
    },

    getters: {
      // 获取格式化后的消息列表（用于 vue-advanced-chat）
      formattedMessages: (state) => {
        return state.messages.map(msg => ({
          _id: msg.id || msg._id,
          content: msg.content,
          senderId: msg.user_id?.toString() || msg.senderId,        
          username: msg.username,
          avatar: msg.avatar_url || msg.avatar,
          date: msg.date,
          timestamp: msg.timestamp,
          system: msg.system || false,
          saved: msg.saved || true,
          distributed: msg.distributed || true,
          seen: msg.seen || false,
          deleted: msg.deleted || false,
          files: msg.files || [],
          reactions: msg.reactions || {},
          replyMessage: msg.reply_message || msg.replyMessage       
        }));
      },

      // 获取房间列表（单聊天室模式，返回数组）
      rooms: (state) => {
        return [state.currentRoom];
      },

      // 获取消息总数
      messageCount: (state) => state.messages.length,

      // 获取在线用户数量
      onlineUserCount: (state) => state.onlineUsers.length
    }
  });