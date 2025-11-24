 import db from '../config/database.js';

  class Message {
    /**
     * 创建消息
     */
    static async create({
      room_id = 1,
      user_id,
      content,
      message_type = 'text',
      file_url = null,
      file_size = null,
      file_name = null,
      thumbnail_url = null,
      audio_duration = null,
      reply_to_id = null,
      is_system = 0
    }) {
      const [result] = await db.query(
        `INSERT INTO messages (
          room_id, user_id, content, message_type, file_url, 
          file_size, file_name, thumbnail_url, audio_duration,
          reply_to_id, is_system
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          room_id, user_id, content, message_type, file_url,
          file_size, file_name, thumbnail_url, audio_duration,
          reply_to_id, is_system
        ]
      );

      return result.insertId;
    }

    /**
     * 获取房间消息（支持分页，JOIN 用户信息）
     */
    static async getByRoomId(room_id, { page = 1, pageSize = 50 } = {}) {
      const offset = (page - 1) * pageSize;

      const [rows] = await db.query(
        `SELECT 
          m.*,
          u.username,
          u.nickname,
          u.avatar_url
        FROM messages m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE m.room_id = ? AND m.deleted = 0
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?`,
        [room_id, pageSize, offset]
      );

      // 反转顺序（最新的在最后）
      return rows.reverse();
    }

    /**
     * 通过 ID 获取消息
     */
    static async findById(id) {
      const [rows] = await db.query(
        `SELECT 
          m.*,
          u.username,
          u.nickname,
          u.avatar_url
        FROM messages m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE m.id = ?`,
        [id]
      );

      return rows[0] || null;
    }

    /**
     * 更新消息
     */
    static async update(id, { content, message_type, file_url }) {
      const updates = [];
      const values = [];

      if (content !== undefined) {
        updates.push('content = ?');
        values.push(content);
      }
      if (message_type !== undefined) {
        updates.push('message_type = ?');
        values.push(message_type);
      }
      if (file_url !== undefined) {
        updates.push('file_url = ?');
        values.push(file_url);
      }

      if (updates.length === 0) {
        throw new Error('没有可更新的字段');
      }

      values.push(id);

      await db.query(
        `UPDATE messages SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    /**
     * 软删除消息
     */
    static async softDelete(id) {
      await db.query(
        `UPDATE messages SET deleted = 1 WHERE id = ?`,
        [id]
      );
    }

    /**
     * 标记消息为已读
     */
    static async markAsRead(id) {
      await db.query(
        `UPDATE messages SET seen = 1 WHERE id = ?`,
        [id]
      );
    }

    /**
     * 批量标记房间消息为已读
     */
    static async markRoomMessagesAsRead(room_id, user_id) {
      await db.query(
        `UPDATE messages 
         SET seen = 1 
         WHERE room_id = ? AND user_id != ? AND seen = 0`,
        [room_id, user_id]
      );
    }

    /**
     * 获取未读消息数量
     */
    static async getUnreadCount(room_id, user_id) {
      const [rows] = await db.query(
        `SELECT COUNT(*) as count 
         FROM messages 
         WHERE room_id = ? AND user_id != ? AND seen = 0 AND deleted = 0`,
        [room_id, user_id]
      );

      return rows[0].count;
    }

    /**
     * 检查消息所有权
     */
    static async isOwner(message_id, user_id) {
      const [rows] = await db.query(
        `SELECT user_id FROM messages WHERE id = ?`,
        [message_id]
      );

      if (rows.length === 0) return false;
      return rows[0].user_id === user_id;
    }
  }

  export default Message;