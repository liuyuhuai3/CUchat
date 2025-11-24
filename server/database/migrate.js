import mysql from 'mysql2/promise';
  import dotenv from 'dotenv';
  import { fileURLToPath } from 'url';
  import { dirname, join } from 'path';

  // 获取当前文件所在目录
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // 加载环境变量（从 server 目录的 .env 文件）
  dotenv.config({ path: join(__dirname, '../.env') });

  // 创建数据库连接
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'chat_app'
  });

  console.log('� 正在连接数据库...\n');

  /**
   * 检查字段是否存在
   */
  async function columnExists(tableName, columnName) {
    const [rows] = await connection.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = ? 
       AND COLUMN_NAME = ?`,
      [process.env.DB_NAME || 'chat_app', tableName, columnName]
    );
    return rows.length > 0;
  }

  /**
   * 检查索引是否存在
   */
  async function indexExists(tableName, indexName) {
    const [rows] = await connection.query(
      `SELECT INDEX_NAME 
       FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = ? 
       AND INDEX_NAME = ?`,
      [process.env.DB_NAME || 'chat_app', tableName, indexName]
    );
    return rows.length > 0;
  }

  /**
   * 安全地添加字段
   */
  async function addColumn(tableName, columnName, columnDefinition) {
    const exists = await columnExists(tableName, columnName);

    if (exists) {
      console.log(`⏭️  字段 ${tableName}.${columnName} 已存在，跳过`);
      return false;
    }

    try {
      await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`);
      console.log(`✅ 成功添加字段 ${tableName}.${columnName}`);
      return true;
    } catch (error) {
      console.error(`❌ 添加字段 ${tableName}.${columnName} 失败:`, error.message);
      return false;
    }
  }

  /**
   * 安全地添加索引
   */
  async function addIndex(tableName, indexName, indexDefinition) {
    const exists = await indexExists(tableName, indexName);

    if (exists) {
      console.log(`⏭️  索引 ${indexName} 已存在，跳过`);
      return false;
    }

    try {
      await connection.query(`ALTER TABLE ${tableName} ADD ${indexDefinition}`);
      console.log(`✅ 成功添加索引 ${indexName}`);
      return true;
    } catch (error) {
      console.error(`❌ 添加索引 ${indexName} 失败:`, error.message)
      return false;
    }
  }

  /**
   * 检查表是否存在
   */
  async function tableExists(tableName) {
    const [rows] = await connection.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = ?`,
      [process.env.DB_NAME || 'chat_app', tableName]
    );
    return rows.length > 0;
  }

  /**
   * 创建表
   */
  async function createTable(tableName, createSQL) {
    const exists = await tableExists(tableName);

    if (exists) {
      console.log(`⏭️  表 ${tableName} 已存在，跳过`);
      return false;
    }

    try {
      await connection.query(createSQL);
      console.log(`✅ 成功创建表 ${tableName}`);
      return true;
    } catch (error) {
      console.error(`❌ 创建表 ${tableName} 失败:`, error.message);
      return false;
    }
  }

  /**
   * 执行迁移
   */
  async function migrate() {
    try {
      console.log('� 开始数据库迁移...\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // ============================================
      // 第一部分：添加 messages 表的必需字段
      // ============================================
      console.log('� 第一部分：添加 messages 表的核心字段\n');

      await addColumn(
        'messages',
        'seen',
        'seen TINYINT DEFAULT 0 COMMENT "是否已读：0=未读，1=已读" AFTER reply_to_id'
      );

      await addColumn(
        'messages',
        'deleted',
        'deleted TINYINT DEFAULT 0 COMMENT "是否已删除：0=正常，1=已删除" AFTER seen'
      );

      await addColumn(
        'messages',
        'is_system',
        'is_system TINYINT DEFAULT 0 COMMENT "是否是系统消息：0=否，1=是" AFTER deleted'
      );

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // ============================================
      // 第二部分：添加文件相关字段（增强功能）
      // ============================================
      console.log('� 第二部分：添加文件相关字段（增强功能）\n');

      await addColumn(
        'messages',
        'file_size',
        'file_size INT COMMENT "文件大小（字节）" AFTER file_url'
      );

      await addColumn(
        'messages',
        'file_name',
        'file_name VARCHAR(255) COMMENT "原始文件名" AFTER file_size'
      );

      await addColumn(
        'messages',
        'thumbnail_url',
        'thumbnail_url VARCHAR(500) COMMENT "缩略图URL（用于图片/视频）" AFTER file_name'
      );

      await addColumn(
        'messages',
        'audio_duration',
        'audio_duration DECIMAL(10,2) COMMENT "音频时长（秒）" AFTER thumbnail_url'
      );

      await addColumn(
        'messages',
        'updated_at',
        'updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT "消息编辑时间" AFTER created_at'
      );

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // ============================================
      // 第三部分：添加索引优化查询
      // ============================================
      console.log('� 第三部分：添加索引优化查询\n');

      await addIndex(
        'messages',
        'idx_deleted',
        'INDEX idx_deleted (deleted)'
      );

      await addIndex(
        'messages',
        'idx_user_seen',
        'INDEX idx_user_seen (user_id, seen)'
      );

      await addIndex(
        'messages',
        'idx_room_user',
        'INDEX idx_room_user (room_id, user_id, created_at)'
      );

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // ============================================
      // 第四部分：创建消息表情回应表（可选）
      // ============================================
      console.log('� 第四部分：创建消息表情回应表（可选功能）\n');

      await createTable(
        'message_reactions',
        `CREATE TABLE message_reactions (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          message_id BIGINT NOT NULL COMMENT '消息ID',
          user_id BIGINT NOT NULL COMMENT '回应用户ID',
          emoji VARCHAR(10) NOT NULL COMMENT 'emoji表情',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY idx_msg_user_emoji (message_id, user_id, emoji),
          INDEX idx_message_id (message_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表情回应表'`
      );

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✨ 数据库迁移完成！\n');

      // ============================================
      // 验证结果
      // ============================================
      console.log('� 验证 messages 表结构：\n');
      const [columns] = await connection.query('DESCRIBE messages');
      console.table(columns.map(col => ({
        字段: col.Field,
        类型: col.Type,
        允许NULL: col.Null,
        默认值: col.Default
      })));

      console.log('\n� 所有操作执行完毕！');

    } catch (error) {
      console.error('\n❌ 迁移过程中发生错误：', error);
      throw error;
    } finally {
      // 关闭连接
      await connection.end();
      console.log('\n� 数据库连接已关闭');
    }
  }

  // 执行迁移
  migrate().catch(error => {
    console.error('❌ 迁移失败：', error);
    process.exit(1);
  });