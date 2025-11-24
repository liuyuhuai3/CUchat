import mysql from 'mysql2/promise';
  import dotenv from 'dotenv';
  import { fileURLToPath } from 'url';
  import { dirname, join } from 'path';
  import { readFileSync } from 'fs';

  dotenv.config();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  async function initDatabase() {
    let connection;

    try {
      console.log('� 正在连接到 MySQL...');

      // 先连接 MySQL（不指定数据库）
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
      });

      console.log('✅ MySQL 连接成功！');

      // 创建数据库
      console.log('� 正在创建数据库 chat_app...');
      await connection.query(
        'CREATE DATABASE IF NOT EXISTS chat_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
      );
      console.log('✅ 数据库 chat_app 创建成功！');

      // 使用数据库
      await connection.query('USE chat_app');

      // 创建 users 表
      console.log('� 正在创建 users 表...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          google_id VARCHAR(100) UNIQUE,
          avatar_url VARCHAR(500),
          nickname VARCHAR(50),
          age INT,
          bio TEXT,
          status TINYINT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_google_id (google_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ users 表创建成功！');

      // 创建 messages 表
      console.log('� 正在创建 messages 表...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          room_id BIGINT NOT NULL DEFAULT 1,
          user_id BIGINT NOT NULL,
          content TEXT,
          message_type ENUM('text', 'image', 'audio', 'emoji', 'sticker') DEFAULT 'text',
          file_url VARCHAR(500),
          file_size BIGINT,
          file_name VARCHAR(255),
          thumbnail_url VARCHAR(500),
          audio_duration INT,
          reply_to_id BIGINT,
          is_system TINYINT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_room_created (room_id, created_at),
          INDEX idx_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ messages 表创建成功！');

      // 创建 sessions 表
      console.log('� 正在创建 sessions 表...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT NOT NULL,
          token VARCHAR(500) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_token (token),
          INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ sessions 表创建成功！');

      // 验证表创建
      const [tables] = await connection.query('SHOW TABLES');
      console.log('\n� 数据库中的表：');
      tables.forEach(row => {
        console.log('  - ' + Object.values(row)[0]);
      });

      console.log('\n� 数据库初始化完成！');

    } catch (error) {
      console.error('❌ 错误：', error.message);
      process.exit(1);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  // 执行初始化
  initDatabase();