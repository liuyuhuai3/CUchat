import db from '../config/database.js';
  import bcrypt from 'bcryptjs';

  const SALT_ROUNDS = 10;  // bcrypt 加密强度

  class User {
    /**
     * 创建新用户
     */
    static async create({ username, email, password, nickname }) {
      // 加密密码
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      const [result] = await db.query(
        `INSERT INTO users (username, email, password_hash, nickname, status) 
         VALUES (?, ?, ?, ?, 1)`,
        [username, email, password_hash, nickname || username]
      );

      return result.insertId;
    }

    /**
     * 通过邮箱查找用户
     */
    static async findByEmail(email) {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    }

    /**
     * 通过用户名查找用户
     */
    static async findByUsername(username) {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0] || null;
    }

    /**
     * 通过 ID 查找用户（不包含密码）
     */
    static async findById(id) {
      const [rows] = await db.query(
        `SELECT id, username, email, nickname, age, bio, avatar_url, status, created_at, updated_at FROM users WHERE id = ?`,
        [id]
      );
      return rows[0] || null;
    }
    
    /**
     * 通过 Google ID查找用户
     */
    static async findByGoogleId(googleId) {
      const [rows] = await db.query(
        `SELECT * FROM users WHERE google_id = ?`,
        [googleId]
      );
      return rows[0] || null;
    }

    /**
     * 从Google账户创建新用户
     */
    static async createFromGoogle({ googleId, email, displayName, avatarUrl }) {
      // 从email生成username（取@前面的部分）
      const username = email.split('@')[0] + '_' + Date.now();
      const [result] = await db.query(
        `INSERT INTO users (username, email, google_id, nickname, avatar_url, status)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [username, email, googleId, displayName || username, avatarUrl]
      );
      return result.insertId;
    }
    
    /**
     * 将Google账号链接到现有用户
     */
    static async linkGoogleAccount(userId, googleId) {
      const [result] = await db.query(
        `UPDATE users SET google_id = ? WHERE id = ?`,
        [googleId, userId]
      );
      return result.affectedRows > 0;
    }

    /**
     * 验证密码
     */
    static async verifyPassword(plainPassword, hashedPassword) {
      return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * 更新用户信息
     */
    static async update(id, updateData) {
      const allowedFields = ['nickname', 'age', 'bio', 'avatar_url'];
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        throw new Error('没有可更新的字段');
      }

      values.push(id);

      try {
        const [result] = await db.query(
          `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          values
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.error('更新用户信息时出错:', error);
        throw error;
      }

      /* await db.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      ); */
    }
  }

  export default User;