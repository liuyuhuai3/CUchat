import db from '../config/database.js';

  class OnlineUser {
    /**
     * 添加在线用户
     */
    static async add({ user_id, socket_id, ip_address, device_info }) {
      try {
        await db.query(
          `INSERT INTO online_users (user_id, socket_id, ip_address, device_info)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             socket_id = VALUES(socket_id),
             ip_address = VALUES(ip_address),
             device_info = VALUES(device_info),
             last_active = CURRENT_TIMESTAMP`,
          [user_id, socket_id, ip_address, device_info]
        );
      } catch (error) {
        console.error('添加在线用户失败:', error);
        throw error;
      }
    }

    /**
     * 移除在线用户（通过 socket_id）
     */
    static async removeBySocketId(socket_id) {
      await db.query(
        `DELETE FROM online_users WHERE socket_id = ?`,
        [socket_id]
      );
    }

    /**
     * 移除在线用户（通过 user_id）
     */
    static async removeByUserId(user_id) {
      await db.query(
        `DELETE FROM online_users WHERE user_id = ?`,
        [user_id]
      );
    }

    /**
     * 更新最后活跃时间
     */
    static async updateLastActive(socket_id) {
      await db.query(
        `UPDATE online_users 
         SET last_active = CURRENT_TIMESTAMP 
         WHERE socket_id = ?`,
        [socket_id]
      );
    }

    /**
     * 获取所有在线用户 ID
     */
    static async getAllUserIds() {
      const [rows] = await db.query(
        `SELECT DISTINCT user_id FROM online_users`
      );

      return rows.map(row => row.user_id);
    }

    /**
     * 获取房间内的在线用户（带用户详情）
     */
static async getRoomOnlineUsers(room_id = 1) {
    const [rows] = await db.query(
      `SELECT DISTINCT
        u.id,
        u.username,
        u.nickname,
        u.avatar_url,
        MAX(ou.last_active) as last_active,
        MAX(ou.connected_at) as connected_at
      FROM online_users ou
      INNER JOIN users u ON ou.user_id = u.id
      WHERE ou.last_active > DATE_SUB(NOW(), INTERVAL 2 MINUTE)
      GROUP BY u.id, u.username, u.nickname, u.avatar_url
      ORDER BY connected_at DESC`
    );

    return rows;
  }

    /**
     * 检查用户是否在线
     */
    static async isUserOnline(user_id) {
      const [rows] = await db.query(
        `SELECT COUNT(*) as count FROM online_users WHERE user_id = ?`,
        [user_id]
      );

      return rows[0].count > 0;
    }

    /**
     * 清理超时的在线用户（5分钟未活跃）
     */
    static async cleanupInactive() {
      const [result] = await db.query(
        `DELETE FROM online_users 
         WHERE last_active < DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
      );

      return result.affectedRows;
    }
  }

  export default OnlineUser;