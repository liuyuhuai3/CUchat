# server/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装生产依赖
RUN npm install --production

# 复制源代码
COPY . .

# 创建上传目录
RUN mkdir -p uploads
RUN node -v


EXPOSE 3000

CMD ["npm", "start"]