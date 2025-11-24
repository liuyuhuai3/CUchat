import request from '@/utils/request'

  // 获取聊天室列表
  export const getRooms = () => {
    return request.get('/rooms')
  }

  // 获取指定聊天室的消息
 export function getMessages(roomId, { page = 1, pageSize = 50 } = {}) {
    return request({
      url: `/messages`,
      method: 'GET',
      params: {
        roomId,
        page,
        pageSize
      }
    });
  }

  // 创建新聊天室
  export const createRoom = (data) => {
    return request.post('/rooms', data)
  }

  // 获取聊天室成员
  export const getRoomMembers = (roomId) => {
    return request.get(`/rooms/${roomId}/members`)
  }

  export const addReaction = (messageId, emoji, remove = false) => {
    return request.post(`/messages/${messageId}/reaction`, {
      emoji,
      remove
    });
  };