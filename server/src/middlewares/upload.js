 import multer from 'multer';
  import path from 'path';
  import fs from 'fs';
  import { fileURLToPath } from 'url';
  import { dirname } from 'path';

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // 确保上传目录存在
  const uploadDir = path.join(__dirname, '../../uploads');
  const imageDir = path.join(uploadDir, 'images');
  const audioDir = path.join(uploadDir, 'audio');

  [uploadDir, imageDir, audioDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 配置存储
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let folder = uploadDir;

      if (file.mimetype.startsWith('image/')) {
        folder = imageDir;
      } else if (file.mimetype.startsWith('audio/')) {
        folder = audioDir;
      }

      cb(null, folder);
    },
    filename: (req, file, cb) => {
      // 生成唯一文件名：时间戳_随机数_原始文件名
      const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      cb(null, `${baseName}_${uniqueSuffix}${ext}`);
    }
  });

  // 文件过滤器
  const fileFilter = (req, file, cb) => {
    // 允许的图片类型
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    // 允许的音频类型
    const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];

    if (imageTypes.includes(file.mimetype) || audioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  };

  // 创建 multer 实例
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB 限制
    }
  });

  // 导出中间件
  export const uploadImage = upload.single('image');
  export const uploadAudio = upload.single('audio');
  export const uploadFile = upload.single('file');

  // 错误处理中间件
  export function handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: '文件大小不能超过 10MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: `上传错误: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  }