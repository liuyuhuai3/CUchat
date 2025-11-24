 import Emoji from '../models/Emoji.js';
  import Sticker from '../models/Sticker.js';

  /**
   * 获取 Emoji 列表
   * GET /api/emojis
   */
  export async function getEmojis(req, res) {
    try {
      const user_id = req.user.id;

      const emojis = await Emoji.getAllEmojis(user_id);

      res.json({
        success: true,
        emojis
      });

    } catch (error) {
      console.error('获取 Emoji 失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 创建用户自定义 Emoji
   * POST /api/emojis
   */
  export async function createUserEmoji(req, res) {
    try {
      const { emoji_code, emoji_url, name } = req.body;
      const user_id = req.user.id;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Emoji 名称不能为空'
        });
      }

      const emojiId = await Emoji.createUserEmoji({
        user_id,
        emoji_code,
        emoji_url,
        name
      });

      res.status(201).json({
        success: true,
        message: '自定义 Emoji 创建成功',
        emojiId
      });

    } catch (error) {
      console.error('创建 Emoji 失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 获取贴纸列表
   * GET /api/stickers
   */
  export async function getStickers(req, res) {
    try {
      const { category } = req.query;

      let stickers;
      if (category) {
        stickers = await Sticker.getByCategory(category);
      } else {
        stickers = await Sticker.getAll();
      }

      // 获取所有分类
      const categories = await Sticker.getCategories();

      res.json({
        success: true,
        stickers,
        categories
      });

    } catch (error) {
      console.error('获取贴纸失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }