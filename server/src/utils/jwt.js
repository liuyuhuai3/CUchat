import jwt from 'jsonwebtoken';
  import dotenv from 'dotenv';

  dotenv.config();

  const JWT_SECRET = process.env.JWT_SECRET;
  const TOKEN_EXPIRES_IN = '7d';  // Token 有效期 7 天

  /**
   * 生成 JWT token
   * @param {Object} payload - 要编码的数据（通常是 user id）
   * @returns {String} JWT token
   */
  export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  }

  /**
   * 验证 JWT token
   * @param {String} token - JWT token
   * @returns {Object} 解码后的数据
   */
  export function verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token 无效或已过期');
    }
  }