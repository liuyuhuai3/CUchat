import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
    uploadImage as uploadImageMiddleware,
    uploadAudio as uploadAudioMiddleware,
    uploadFile as uploadFileMiddleware,
    handleUploadError
  } from '../middlewares/upload.js';
import {
    uploadImage,
    uploadAudio,
    uploadFile
  } from '../controllers/uploadController.js';

  const router = express.Router();

  // 所有路由都需要认证
  router.use(authenticateToken);

  // 上传图片
  // POST /api/upload/image
  router.post('/image', uploadImageMiddleware, handleUploadError, uploadImage);

  // 上传音频
  // POST /api/upload/audio
  router.post('/audio', uploadAudioMiddleware, handleUploadError, uploadAudio);

  // 上传通用文件
  // POST /api/upload/file
  router.post('/file', uploadFileMiddleware, handleUploadError, uploadFile);

  export default router;