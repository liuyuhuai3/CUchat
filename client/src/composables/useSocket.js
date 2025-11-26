import { onMounted, onUnmounted, ref } from 'vue';
  import socketManager from '@/utils/socket';
  import { useChatStore } from '@/stores/chat';
  import { useUserStore } from '@/stores/user';
  import { convertMessageToChatMessage, convertUserToRoomUser, formatMessageDate, formatMessageTime } from '@/utils/chatAdapter';

  /**
   * WebSocket Composable
   * 在 Vue 组件中使用 WebSocket 的便捷工具
   */
  export function useSocket() {
    const chatStore = useChatStore();
    const userStore = useUserStore();

    const isConnected = ref(false);
    const onlineUsers = ref([]);

    /**
     * 初始化 WebSocket 连接
     */
    const initSocket = () => {
      if (!userStore.token) {
        console.error('❌ 未找到 Token，无法连接 WebSocket');
        return;
      }

      // 连接 WebSocket
      socketManager.connect(userStore.token);

      // 设置事件监听
      setupListeners();

      // 同步实际连接状态到本地 ref
      // 如果 socketManager 已经连接，直接更新本地状态
      if (socketManager.isConnected()) {
        isConnected.value = true;
        console.log('✅ WebSocket 已连接，状态已同步');
      }
    };

    /**
     * 设置所有事件监听器
     */
    const setupListeners = () => {
      // ============================================
      // 连接状态事件
      // ============================================

      // 先移除所有旧的监听器
    socketManager.off('socket-connected');
    socketManager.off('room-joined');
    socketManager.off('user-online');
    // ... 移除所有事件

      socketManager.on('socket-connected', ({ socketId }) => {
        isConnected.value = true;
        console.log('✅ Socket 已连接:', socketId);
      });

      socketManager.on('socket-disconnected', ({ reason }) => {
        isConnected.value = false;
        console.log('� Socket 已断开:', reason);
      });

      socketManager.on('auth-failed', () => {
        // 认证失败，清除本地数据并跳转登录页
        userStore.logout();
        window.location.href = '/login';
      });

      // ============================================
      // 房间事件
      // ============================================

      socketManager.on('room-joined', (data) => {
        console.log('� 已加入房间:', data);

        // 更新在线用户列表
        if (data.onlineUsers) {
          const users = data.onlineUsers.map(user =>
            convertUserToRoomUser({
              user,
              onlineUsers: data.onlineUsers.map(u => u.id)
            })
          );
          chatStore.setRoomUsers(users);
          onlineUsers.value = users;
        }
      });

      socketManager.on('room-left', (data) => {
        console.log('� 已离开房间:', data);
      });

      // ============================================
      // 用户上下线事件
      // ============================================

      socketManager.on('user-online', (data) => {
        console.log('� 用户上线:', data);

        // 添加到在线用户列表
        chatStore.addOnlineUser(data.userId);

        // 更新房间用户状态
        if (data.onlineUsers) {
          const users = data.onlineUsers.map(user =>
            convertUserToRoomUser({
              user,
              onlineUsers: data.onlineUsers.map(u => u.id)
            })
          );
          chatStore.setRoomUsers(users);
          onlineUsers.value = users;
        }
      });

      socketManager.on('user-offline', (data) => {
        console.log('� 用户下线:', data);

        // 从在线用户列表移除
        chatStore.removeOnlineUser(data.userId);

        // 更新房间用户列表
        if (data.onlineUsers) {
          const users = data.onlineUsers.map(user =>
            convertUserToRoomUser({
              user,
              onlineUsers: data.onlineUsers.map(u => u.id)
            })
          );
          chatStore.setRoomUsers(users);
          onlineUsers.value = users;
        }
      });

      // ============================================
      // 消息事件
      // ============================================

      socketManager.on('new-message', (message) => {
        console.log('� 收到新消息:', message);

        // 使用适配器转换消息格式（如果需要）
        const formattedMessage = message;

        // 添加到消息列表
        chatStore.addMessage(formattedMessage);
      });

      socketManager.on('message-edited', (data) => {
        console.log('✏️ 消息已编辑:', data);

        // 更新消息
        chatStore.updateMessage(data.messageId, {
          content: data.content,
          updated_at: data.updatedAt
        });
      });

      socketManager.on('message-deleted', (data) => {
        console.log('�️ 消息已删除:' , data);

        // 标记消息为已删除
        chatStore.deleteMessage(data.messageId);
      });

      socketManager.on('message-read', (data) => {
        console.log('�️ 消息已读:' , data);

        // 更新消息已读状态
        chatStore.updateMessage(data.messageId, { seen: true });
      });

      // ============================================
      // 正在输入事件
      // ============================================

      socketManager.on('user-typing', (data) => {
        console.log('⌨️ 用户正在输入:', data);

        // 添加到正在输入列表
        chatStore.addTypingUser(data.userId);

        // 3秒后自动移除
        setTimeout(() => {
          chatStore.removeTypingUser(data.userId);
        }, 3000);
      });

      socketManager.on('user-stop-typing', (data) => {
        console.log('⏹️ 用户停止输入:', data);

        // 从正在输入列表移除
        chatStore.removeTypingUser(data.userId);
      });

      // ============================================
      // 系统消息
      // ============================================

      socketManager.on('system-message', (message) => {
        console.log('🔔 系统消息:', message);

        // 获取最后一条消息的日期
        const lastMessage = chatStore.messages[chatStore.messages.length - 1];
        const messageDate = new Date(message.timestamp || new Date());

        // 格式化系统消息，补充缺失的字段
        const formattedMessage = {
          ...message,
          // 如果最后一条消息是今天的，使用相同的 date，避免重复显示日期分隔符
          date: lastMessage && lastMessage.date === formatMessageDate(messageDate)
            ? lastMessage.date
            : formatMessageDate(messageDate),
          timestamp: formatMessageTime(messageDate)
        };

        // 添加系统消息
        chatStore.addMessage(formattedMessage);
      });

      // ============================================
      // 错误事件
      // ============================================

      socketManager.on('error', (error) => {
        console.error('❌ Socket 错误:', error);
      });
    };

    /**
     * 加入房间
     */
    const joinRoom = (roomId) => {
      socketManager.joinRoom(roomId);
    };

    /**
     * 离开房间
     */
    const leaveRoom = (roomId) => {
      socketManager.leaveRoom(roomId);
    };

    /**
     * 发送消息
     */
    const sendMessage = (messageData) => {
      socketManager.sendMessage(messageData);
    };

    /**
     * 发送正在输入状态
     */
    const sendTyping = (roomId, isTyping) => {
      socketManager.sendTyping(roomId, isTyping);
    };

    /**
     * 编辑消息
     */
    const editMessage = (data) => {
      socketManager.editMessage(data);
    };

    /**
     * 删除消息
     */
    const deleteMessage = (data) => {
      socketManager.deleteMessage(data);
    };

    /**
     * 断开连接
     */
    const disconnect = () => {
      socketManager.disconnect();
      isConnected.value = false;
    };

    /**
     * 获取连接状态
     */
    const checkConnection = () => {
      return socketManager.isConnected();
    };

    // 组件卸载时清理
    onUnmounted(() => {
      // 注意：不要在这里断开连接，因为可能其他组件还在使用
      // disconnect();
    });

    return {
      // 状态
      isConnected,
      onlineUsers,

      // 方法
      initSocket,
      joinRoom,
      leaveRoom,
      sendMessage,
      sendTyping,
      editMessage,
      deleteMessage,
      disconnect,
      checkConnection
    };
  }