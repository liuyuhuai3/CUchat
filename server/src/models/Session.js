 import db from '../config/database.js';

  class Session {
    /**
     * 创建新会话
     */
    static async create(userId, token, expiresAt) {
      const [result] = await db.query(
        `INSERT INTO sessions (user_id, token, expires_at) 
         VALUES (?, ?, ?)`,
        [userId, token, expiresAt]
      );

      return result.insertId;
    }

    /**
     * 通过 token 查找会话
     */
    static async findByToken(token) {
      const [rows] = await db.query(
        `SELECT * FROM sessions 
         WHERE token = ? AND expires_at > NOW()`,
        [token]
      );
      return rows[0] || null;
    }

    /**
     * 删除会话（登出）
     */
    static async deleteByToken(token) {
      await db.query(
        'DELETE FROM sessions WHERE token = ?',
        [token]
      );
    }

    /**
     * 删除用户的所有会话
     */
    static async deleteByUserId(userId) {
      await db.query(
        'DELETE FROM sessions WHERE user_id = ?',
        [userId]
      );
    }
  }

  export default Session;