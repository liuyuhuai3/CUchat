import axios from 'axios';
import { ElMessage } from 'element-plus';

  // 创建 axios 实例
  const request = axios.create({
    baseURL: 'http://localhost:3000/api',  // 后端 API 地址
    timeout: 10000,  // 请求超时时间
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // 请求拦截器（在发送请求前执行）
  request.interceptors.request.use(
    config => {
      // 从 localStorage 获取 token
      const token = localStorage.getItem('token');

      // 如果有 token，添加到请求头
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    error => {
      console.error('请求错误:', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器（在收到响应后执行）
  request.interceptors.response.use(
    response => {
      // 直接返回 data 部分
      return response.data;
    },
    error => {
      // 处理错误
      const message = error.response?.data?.message || '请求失败';     
      ElMessage.error(message);

      // 如果是 401 错误（未授权），清除 token 并跳转到登录页
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
  );

  export default request;