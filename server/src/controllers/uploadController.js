/**
   * 上传图片
   * POST /api/upload/image
   */
   export async function uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '没有上传文件'
        });
      }

      // � 构建完整的文件 URL（包含域名和端口）
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';        
      const fileUrl = `${baseUrl}/uploads/images/${req.file.filename}`;       

      res.json({
        success: true,
        message: '图片上传成功',
        data: {
          url: fileUrl,  // � 完整 URL
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });

    } catch (error) {
      console.error('上传图片失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 上传音频
   * POST /api/upload/audio
   */
  export async function uploadAudio(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '没有上传文件'
        });
      }

      // � 构建完整的文件 URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';        
      const fileUrl = `${baseUrl}/uploads/audio/${req.file.filename}`;        

      res.json({
        success: true,
        message: '音频上传成功',
        data: {
          url: fileUrl,  // � 完整 URL
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          duration: null
        }
      });

    } catch (error) {
      console.error('上传音频失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }

  /**
   * 上传通用文件
   * POST /api/upload/file
   */
  export async function uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '没有上传文件'
        });
      }

      // � 构建完整的文件 URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';        
      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

      res.json({
        success: true,
        message: '文件上传成功',
        data: {
          url: fileUrl,  // � 完整 URL
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });

    } catch (error) {
      console.error('上传文件失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  }