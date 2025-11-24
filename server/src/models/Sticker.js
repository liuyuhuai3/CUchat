 import db from '../config/database.js';

  class Sticker {
    /**
     * 获取所有激活的贴纸
     */
    static async getAll() {
      const [rows] = await db.query(
        `SELECT id, sticker_url, name, category, width, height
         FROM stickers
         WHERE is_active = 1
         ORDER BY category, sort ASC`
      );

      return rows;
    }

    /**
     * 按分类获取贴纸
     */
    static async getByCategory(category) {
      const [rows] = await db.query(
        `SELECT id, sticker_url, name, category, width, height
         FROM stickers
         WHERE category = ? AND is_active = 1
         ORDER BY sort ASC`,
        [category]
      );

      return rows;
    }

    /**
     * 获取所有分类
     */
    static async getCategories() {
      const [rows] = await db.query(
        `SELECT DISTINCT category
         FROM stickers
         WHERE is_active = 1
         ORDER BY category`
      );

      return rows.map(row => row.category);
    }
  }

  export default Sticker;