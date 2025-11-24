 import db from '../config/database.js';

  class Emoji {
    /**
     * 获取所有激活的系统 emoji
     */
    static async getSystemEmojis() {
      const [rows] = await db.query(
        `SELECT id, emoji_code, emoji_url, name, sort
         FROM emojis
         WHERE type = 'system' AND is_active = 1
         ORDER BY sort ASC`
      );

      return rows;
    }

    /**
     * 获取用户自定义 emoji
     */
    static async getUserEmojis(user_id) {
      const [rows] = await db.query(
        `SELECT id, emoji_code, emoji_url, name, sort
         FROM emojis
         WHERE user_id = ? AND type = 'user' AND is_active = 1
         ORDER BY sort ASC`,
        [user_id]
      );

      return rows;
    }

    /**
     * 获取所有 emoji（系统 + 用户自定义）
     */
    static async getAllEmojis(user_id) {
      const systemEmojis = await this.getSystemEmojis();
      const userEmojis = await this.getUserEmojis(user_id);

      return {
        system: systemEmojis,
        user: userEmojis
      };
    }

    /**
     * 创建用户自定义 emoji
     */
    static async createUserEmoji({ user_id, emoji_code, emoji_url, name }) {
      const [result] = await db.query(
        `INSERT INTO emojis (user_id, emoji_code, emoji_url, name, type, is_active)
         VALUES (?, ?, ?, ?, 'user', 1)`,
        [user_id, emoji_code, emoji_url, name]
      );

      return result.insertId;
    }
  }

  export default Emoji;