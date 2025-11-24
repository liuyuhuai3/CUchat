# CUchat

> CUHK 最终课程项目 - 实时聊天应用

一个基于 Vue 3 + Node.js + MySQL 的现代化实时聊天应用，支持用户认证、实时消息推送、多媒体消息等功能。

## 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [功能特性](#功能特性)
- [开发指南](#开发指南)
- [常见问题](#常见问题)

---

## 技术栈

### 前端 (Client)
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Element Plus** - 基于 Vue 3 的 UI 组件库
- **Pinia** - Vue 状态管理库
- **Vue Router** - Vue 官方路由
- **Axios** - HTTP 客户端
- **Socket.IO Client** - 实时通信客户端
- **vue-advanced-chat** - 高级聊天组件

### 后端 (Server)
- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **MySQL** - 关系型数据库
- **Socket.IO** - 实时双向通信
- **JWT** - 用户认证
- **bcryptjs** - 密码加密
- **Passport** - 认证中间件
- **Multer** - 文件上传处理

---

## 项目结构

```
group_project/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── components/    # 组件
│   │   ├── views/         # 页面
│   │   ├── stores/        # 状态管理
│   │   ├── router/        # 路由配置
│   │   ├── utils/         # 工具函数
│   │   └── main.js        # 入口文件
│   ├── package.json
│   └── vite.config.js
│
├── server/                # 后端应用
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── middlewares/   # 中间件
│   │   ├── websocket/     # WebSocket 处理
│   │   ├── config/        # 配置
│   │   └── app.js         # 入口文件
│   ├── database/
│   │   ├── schema.sql     # 数据库结构
│   │   └── seeds.sql      # 种子数据
│   ├── .env               # 环境变量
│   └── package.json
│
└── README.md
```

---

## 环境要求

在开始之前，请确保你的系统已安装以下软件：

- **Node.js**: v16.0.0 或更高版本
- **npm**: v7.0.0 或更高版本（通常随 Node.js 一起安装）
- **MySQL**: v8.0 或更高版本

### 验证安装

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查 MySQL 版本
mysql --version
```

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/liuyuhuai3/CUchat.git
cd group_project
```

### 2. 配置数据库

#### 2.1 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE chat_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 2.2 导入数据库结构

```bash
# 导入数据库结构和种子数据
cd server
mysql -u root -p chat_app < database/schema.sql
mysql -u root -p chat_app < database/seeds.sql
```

### 3. 安装依赖

#### 3.1 安装后端依赖

```bash
cd server
npm install
```

#### 3.2 安装前端依赖

```bash
cd ../client
npm install
```

### 4. 配置环境变量

在 `server` 目录下创建或修改 `.env` 文件：

```bash
cd ../server
```

编辑 `.env` 文件，配置你的数据库信息：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=chat_app

# JWT密钥（请修改为随机字符串）
JWT_SECRET=your_super_secret_key_change_this_in_production

# Google OAuth（可选，暂未启用）
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# 服务器端口
PORT=3000

# 上传目录
UPLOAD_DIR=./uploads

# 环境
NODE_ENV=development
```

**重要提示：** 请务必修改 `DB_PASSWORD` 和 `JWT_SECRET` 为你自己的值！

### 5. 启动项目

#### 5.1 启动后端服务

在 `server` 目录下：

```bash
# 开发环境（支持热重载）
npm run dev

# 或生产环境
npm start
```

后端服务将在 `http://localhost:3000` 启动

#### 5.2 启动前端应用

打开新的终端窗口，在 `client` 目录下：

```bash
# 启动开发服务器
npm run dev
```

前端应用将在 `http://localhost:5173` 启动

### 6. 访问应用

在浏览器中打开 [http://localhost:5173](http://localhost:5173)

---

## 配置说明

### 前端配置

前端的 API 基础 URL 配置在 `client/src/utils/request.js` 中：

```javascript
const request = axios.create({
  baseURL: 'http://localhost:3000/api',  // 后端 API 地址
  timeout: 10000
})
```

如果修改了后端端口，请同步修改此配置。

### 后端配置

所有后端配置都在 `server/.env` 文件中，包括：

- 数据库连接信息
- JWT 密钥
- 服务器端口
- 文件上传目录
- OAuth 配置

---

## 功能特性

### 已实现功能

- ✅ 用户注册与登录
- ✅ JWT 身份认证
- ✅ 密码加密存储
- ✅ 用户资料管理
- ✅ 前端路由守卫
- ✅ 响应拦截处理
- ✅ 数据库连接池
- ✅ 文件上传支持
- ✅ 安全中间件
- ✅ CORS 跨域处理

### 开发中功能

- 🔄 实时聊天功能（WebSocket）
- 🔄 在线用户列表
- 🔄 多媒体消息（图片、语音）
- 🔄 表情和贴纸
- 🔄 Google OAuth 登录

---

## 开发指南

### 开发模式

#### 前端开发

```bash
cd client
npm run dev
```

Vite 提供热模块替换 (HMR)，修改代码后会自动刷新页面。

#### 后端开发

```bash
cd server
npm run dev
```

使用 nodemon 实现自动重启，修改代码后会自动重启服务器。

### 构建生产版本

#### 构建前端

```bash
cd client
npm run build
```

构建后的文件将在 `client/dist` 目录中。

#### 预览生产构建

```bash
npm run preview
```

### API 测试

#### 测试数据库连接

```bash
curl http://localhost:3000/api/test-db
```

#### 测试用户注册

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456"
  }'
```

#### 测试用户登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

---

## 常见问题

### 1. 数据库连接失败

**错误信息：** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**解决方法：**
- 确认 MySQL 服务已启动
- 检查 `server/.env` 文件中的数据库配置是否正确
- 确认数据库用户权限

### 2. 端口已被占用

**错误信息：** `Error: listen EADDRINUSE: address already in use :::3000`

**解决方法：**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

或者修改 `server/.env` 中的 `PORT` 配置。

### 3. npm install 失败

**解决方法：**

```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 4. Element Plus 组件不显示

**解决方法：**

Element Plus 已在 `client/src/main.js` 中全局引入，无需额外配置。如果组件不显示，请确认：

```javascript
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

app.use(ElementPlus)
```

### 5. 跨域问题

前端开发时如果遇到跨域问题，请确认：

1. 后端已启用 CORS 中间件（`server/src/app.js`）
2. CORS 配置允许前端地址：`http://localhost:5173`

```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

### 6. JWT Token 过期

Token 默认有效期为 24 小时，过期后需要重新登录。

如需修改有效期，编辑 `server/src/utils/jwt.js`：

```javascript
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}
```

---

## 项目依赖说明

### 前端依赖 (client)

#### 运行时依赖
- **element-plus**: UI 组件库，提供美观的界面组件
- **@element-plus/icons-vue**: Element Plus 图标库
- **axios**: HTTP 客户端，用于发送 API 请求
- **pinia**: 状态管理，用于管理全局状态
- **vue-router**: 路由管理，用于页面导航
- **socket.io-client**: WebSocket 客户端，用于实时通信
- **vue-advanced-chat**: 聊天组件，提供聊天界面

#### 开发依赖
- **vite**: 构建工具，提供快速的开发体验
- **@vitejs/plugin-vue**: Vite 的 Vue 插件

### 后端依赖 (server)

#### 运行时依赖
- **express**: Web 框架
- **mysql2**: MySQL 数据库驱动
- **jsonwebtoken**: JWT 认证
- **bcryptjs**: 密码加密
- **socket.io**: WebSocket 服务端
- **cors**: 跨域资源共享
- **helmet**: 安全中间件
- **morgan**: 请求日志
- **multer**: 文件上传
- **passport**: 认证框架
- **passport-google-oauth20**: Google OAuth 策略
- **express-validator**: 请求验证
- **dotenv**: 环境变量管理

#### 开发依赖
- **nodemon**: 自动重启工具

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

---

## 许可证

本项目仅用于学习和教育目的。

---

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。
