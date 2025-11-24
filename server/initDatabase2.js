import mysql from 'mysql2/promise';
  import dotenv from 'dotenv';

  dotenv.config();

  async function addNewTables() {
    let connection;

    try {
      console.log('� 正在连接到数据库...');

      // 连接到 chat_app 数据库
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      console.log('✅ 数据库连接成功！\n');

      // 1. 创建 emojis 表
      console.log('� 正在创建 emojis 表...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS emojis (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT NULL COMMENT '用户ID，NULL表示系统emoji',
          emoji_code VARCHAR(50) COMMENT 'emoji代码（如 :smile:）',
          emoji_url VARCHAR(500) COMMENT 'emoji图片URL',
          name VARCHAR(50) NOT NULL COMMENT 'emoji名称',
          type ENUM('system', 'user') DEFAULT 'system' COMMENT '类型：system=系统，user=用户自定义',
          sort INT DEFAULT 0 COMMENT '排序顺序',
          is_active TINYINT DEFAULT 1 COMMENT '是否启用：1=启用，0=禁用',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_type (type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='emoji表'
      `);
      console.log('✅ emojis 表创建成功！');

      // 2. 创建 stickers 表
      console.log('� 正在创建 stickers 表...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS stickers (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          sticker_url VARCHAR(500) NOT NULL COMMENT '贴纸图片URL',
          name VARCHAR(50) NOT NULL COMMENT '贴纸名称',
          category VARCHAR(50) DEFAULT 'general' COMMENT '分类：funny, sad, cute, love等',
          width INT DEFAULT 200 COMMENT '贴纸宽度（像素）',
          height INT DEFAULT 200 COMMENT '贴纸高度（像素）',
          sort INT DEFAULT 0 COMMENT '排序顺序',
          is_active TINYINT DEFAULT 1 COMMENT '是否启用：1=启用，0=禁用',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_category (category),
          INDEX idx_active_sort (is_active, sort)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='贴纸库表'
      `);
      console.log('✅ stickers 表创建成功！');

      // 3. 创建 online_users 表
      console.log('� 正在创建 online_users 表...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS online_users (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT NOT NULL COMMENT '用户ID',
          socket_id VARCHAR(100) NOT NULL COMMENT 'WebSocket连接ID',
          ip_address VARCHAR(50) COMMENT 'IP地址',
          device_info VARCHAR(255) COMMENT '设备信息',
          last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后活跃时间',       
          connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '连接时间',
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY idx_socket_id (socket_id),
          INDEX idx_user_id (user_id),
          INDEX idx_last_active (last_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在线用户表'
      `);
      console.log('✅ online_users 表创建成功！');

      // 验证所有表
      console.log('\n� 验证表创建...');
      const [tables] = await connection.query('SHOW TABLES');
      console.log('\n� 数据库中的所有表：');
      tables.forEach(row => {
        const tableName = Object.values(row)[0];
        const isNew = ['emojis', 'stickers', 'online_users'].includes(tableName);
        console.log(`  ${isNew ? '�' : '  '} ${tableName}`);
      });

      // 插入一些示例数据
      console.log('\n� 插入示例数据...');

      // 插入系统 emoji
      await connection.query(`
        INSERT INTO emojis (user_id, emoji_code, emoji_url, name, type, sort) VALUES
        (NULL, '�', NULL, '微笑', 'system', 1),
        (NULL, '�', NULL, '大笑', 'system', 2),
        (NULL, '❤️', NULL, '爱心', 'system', 3),
        (NULL, '�', NULL, '点赞', 'system', 4),
        (NULL, '�', NULL, '庆祝', 'system', 5)
        ON DUPLICATE KEY UPDATE name=name
      `);
      console.log('✅ 插入了 5 个系统 emoji');

      // 插入贴纸
      await connection.query(`
        INSERT INTO stickers (sticker_url, name, category, sort) VALUES
        ('https://example.com/stickers/happy.gif', '开心', 'funny', 1),
        ('https://example.com/stickers/sad.gif', '难过', 'sad', 2),
        ('https://example.com/stickers/cute.gif', '可爱', 'cute', 3),
        ('https://example.com/stickers/love.gif', '爱你', 'love', 4),
        ('https://example.com/stickers/cool.gif', '酷', 'funny', 5)
        ON DUPLICATE KEY UPDATE name=name
      `);
      console.log('✅ 插入了 5 个贴纸');

      console.log('\n� 新表创建完成！');

    } catch (error) {
      console.error('❌ 错误：', error.message);
      process.exit(1);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

addNewTables();
