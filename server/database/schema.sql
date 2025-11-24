CREATE DATABASE IF NOT EXISTS chat_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chat_app;  

-- Users table to store user information
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Messages table to store chat messages
  CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_id BIGINT NOT NULL DEFAULT 1,
    user_id BIGINT NOT NULL,
    content TEXT,
    message_type ENUM('text', 'image', 'audio', 'emoji', 'sticker') DEFAULT 'text',
    file_url VARCHAR(500),
    reply_to_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_room_created (room_id, created_at),
    INDEX idx_user (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- chatroom table to store chat information
CREATE TABLE IF NOT EXISTS sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 

 -- ============================================
  -- 4. Emojis 表（emoji库）
  -- ============================================
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='emoji表';

  -- ============================================
  -- 5. Stickers 表（贴纸库）
  -- ============================================
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='贴纸库表';

  -- ============================================
  -- 6. Online Users 表（在线用户）
  -- ============================================
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在线用户表';

  -- ============================================
  -- 插入示例数据
  -- ============================================

  -- 插入系统 emoji
  INSERT INTO emojis (user_id, emoji_code, emoji_url, name, type, sort) VALUES
  (NULL, '�', NULL, '微笑', 'system', 1),
  (NULL, '�', NULL, '大笑', 'system', 2),
  (NULL, '❤️', NULL, '爱心', 'system', 3),
  (NULL, '�', NULL, '点赞', 'system', 4),
  (NULL, '�', NULL, '庆祝', 'system', 5),
  (NULL, '�', NULL, '大哭', 'system', 6),
  (NULL, '�', NULL, '爱慕', 'system', 7),
  (NULL, '�', NULL, '思考', 'system', 8)
  ON DUPLICATE KEY UPDATE name=name;

  -- 插入贴纸
  INSERT INTO stickers (sticker_url, name, category, sort) VALUES
  ('https://example.com/stickers/happy.gif', '开心', 'funny', 1),
  ('https://example.com/stickers/sad.gif', '难过', 'sad', 2),
  ('https://example.com/stickers/cute.gif', '可爱', 'cute', 3),
  ('https://example.com/stickers/love.gif', '爱你', 'love', 4),
  ('https://example.com/stickers/cool.gif', '酷', 'funny', 5)
  ON DUPLICATE KEY UPDATE name=name;