 import { io } from 'socket.io-client';
  import { ElMessage } from 'element-plus';

  /**
   * Socket.IO 客户端管理类
   */
  class SocketManager {
    constructor() {
      this.socket = null;
      this.connected = false;
      this.token = null;
      this.currentRoomId = null;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.eventListeners = new Map(); // 存储事件监听器
    }

    /**
     * 连接到 WebSocket 服务器
     * @param {string} token - JWT Token
     */
    connect(token) {
      if (this.socket && this.connected) {
        console.log('⚠️ WebSocket 已连接');
        return this.socket;
      }

      this.token = token;

      // 创建 Socket.IO 连接
      this.socket = io('http://localhost:3000', {
        auth: {
          token: token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        transports: ['websocket', 'polling']
      });

      this.setupEventListeners();

      return this.socket;
    }

    /**
     * 设置基础事件监听器
     */
    setupEventListeners() {
      // 连接成功
      this.socket.on('connect', () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log('✅ WebSocket 已连接:', this.socket.id);

        // 如果之前在某个房间，自动重新加入
        if (this.currentRoomId) {
          this.joinRoom(this.currentRoomId);
        }

        // 触发自定义连接成功事件
        this.emit('socket-connected', { socketId: this.socket.id });
      });

      // 连接错误
      this.socket.on('connect_error', (error) => {
        this.connected = false;
        console.error('❌ WebSocket 连接失败:', error.message);

        if (error.message.includes('认证失败') || error.message.includes('未提供认证 token')) {
          ElMessage.error('认证失败，请重新登录');
          this.disconnect();
          // 触发需要重新登录的事件
          this.emit('auth-failed');
        } else {
          ElMessage.error('连接失败，正在尝试重连...');
        }
      });

      // 断开连接
      this.socket.on('disconnect', (reason) => {
        this.connected = false;
        console.log('� WebSocket 已断开:', reason);

        if (reason === 'io server disconnect') {
          // 服务器主动断开，需要手动重连
          console.log('⚠️ 服务器断开连接，尝试重连...');
          this.socket.connect();
        }

        this.emit('socket-disconnected', { reason });
      });

      // 重连尝试
      this.socket.on('reconnect_attempt', (attempt) => {
        this.reconnectAttempts = attempt;
        console.log(`� 尝试重连... (${attempt}/${this.maxReconnectAttempts})`);
      });

      // 重连成功
      this.socket.on('reconnect', (attemptNumber) => {
        this.connected = true;
        console.log(`✅ 重连成功 (尝试了 ${attemptNumber} 次)`);
        ElMessage.success('连接已恢复');
      });

      // 重连失败
      this.socket.on('reconnect_failed', () => {
        console.error('❌ 重连失败，已达到最大尝试次数');
        ElMessage.error('无法连接到服务器，请刷新页面重试');
      });

      // 错误事件
      this.socket.on('error', (error) => {
        console.error('❌ Socket 错误:', error);
        ElMessage.error(error.message || '发生错误');
      });
    }

    /**
     * 加入房间
     * @param {string} roomId - 房间 ID
     */
    joinRoom(roomId) {
      if (!this.connected) {
        console.error('❌ WebSocket 未连接');
        return;
      }

      this.currentRoomId = roomId;
      this.socket.emit('join-room', { roomId });
      console.log(`� 发送加入房间请求: ${roomId}`);
    }

    /**
     * 离开房间
     * @param {string} roomId - 房间 ID
     */
    leaveRoom(roomId) {
      if (!this.connected) {
        console.error('❌ WebSocket 未连接');
        return;
      }

      this.socket.emit('leave-room', { roomId });
      this.currentRoomId = null;
      console.log(`� 发送离开房间请求: ${roomId}`);
    }

    /**
     * 发送消息
     * @param {Object} messageData - 消息数据
     */
    sendMessage(messageData) {
      if (!this.connected) {
        console.error('❌ WebSocket 未连接');
        ElMessage.error('连接已断开，无法发送消息');
        return;
      }

      this.socket.emit('send-message', messageData);
      console.log('� 发送消息:', messageData);
    }

    /**
     * 发送正在输入状态
     * @param {string} roomId - 房间 ID
     * @param {boolean} isTyping - 是否正在输入
     */
    sendTyping(roomId, isTyping) {
      if (!this.connected) return;

      this.socket.emit('typing', { roomId, isTyping });
    }

    /**
     * 编辑消息
     * @param {Object} data - { messageId, content, roomId }
     */
    editMessage(data) {
      if (!this.connected) {
        console.error('❌ WebSocket 未连接');
        return;
      }

      this.socket.emit('edit-message', data);
      console.log('✏️ 编辑消息:', data);
    }

    /**
     * 删除消息
     * @param {Object} data - { messageId, roomId }
     */
    deleteMessage(data) {
      if (!this.connected) {
        console.error('❌ WebSocket 未连接');
        return;
      }

      this.socket.emit('delete-message', data);
      console.log('�️ 删除消息:' , data);
    }

    /**
     * 标记消息为已读
     * @param {Object} data - { messageId, roomId }
     */
    markAsRead(data) {
      if (!this.connected) return;

      this.socket.emit('mark-as-read', data);
    }

    /**
     * 监听事件
     * @param {string} event - 事件名
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
      if (!this.socket) {
        console.error('❌ Socket 未初始化');
        return;
      }

      // 保存监听器引用，方便后续移除
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);

      this.socket.on(event, callback);
    }

    /**
     * 移除事件监听
     * @param {string} event - 事件名
     * @param {Function} callback - 回调函数（可选）
     */
    off(event, callback) {
      if (!this.socket) return;

      if (callback) {
        this.socket.off(event, callback);

        // 从存储中移除
        if (this.eventListeners.has(event)) {
          const listeners = this.eventListeners.get(event);
          const index = listeners.indexOf(callback);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      } else {
        // 移除所有该事件的监听器
        this.socket.off(event);
        this.eventListeners.delete(event);
      }
    }

    /**
     * 触发自定义事件（用于内部通信）
     * @param {string} event - 事件名
     * @param {any} data - 数据
     */
    emit(event, data) {
      if (this.eventListeners.has(event)) {
        this.eventListeners.get(event).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`事件 ${event} 的回调执行失败:`, error);
          }
        });
      }
    }

    /**
     * 断开连接
     */
    disconnect() {
      if (this.socket) {
        console.log('� 断开 WebSocket 连接');

        // 移除所有事件监听器
        this.eventListeners.clear();

        this.socket.disconnect();
        this.socket = null;
        this.connected = false;
        this.currentRoomId = null;
      }
    }

    /**
     * 获取连接状态
     */
    isConnected() {
      return this.connected;
    }

    /**
     * 获取当前房间 ID
     */
    getCurrentRoomId() {
      return this.currentRoomId;
    }

    /**
     * 获取 Socket ID
     */
    getSocketId() {
      return this.socket?.id || null;
    }
  }

  // 创建单例
  const socketManager = new SocketManager();

  // 导出实例和快捷方法
  export default socketManager;

  // 导出快捷方法（向后兼容）
  export const connectSocket = (token) => socketManager.connect(token);
  export const disconnectSocket = () => socketManager.disconnect();
  export const joinRoom = (roomId) => socketManager.joinRoom(roomId);
  export const leaveRoom = (roomId) => socketManager.leaveRoom(roomId);
  export const sendMessage = (data) => socketManager.sendMessage(data);
  export const sendTyping = (roomId, isTyping) => socketManager.sendTyping(roomId, isTyping);
  export const editMessage = (data) => socketManager.editMessage(data);
  export const deleteMessage = (data) => socketManager.deleteMessage(data);
  export const markAsRead = (data) => socketManager.markAsRead(data);
  export const onMessage = (callback) => socketManager.on('new-message', callback);
  export const offMessage = (callback) => socketManager.off('new-message', callback);