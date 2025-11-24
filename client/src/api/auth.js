import request from '../utils/request';

  // 注册
  export function register(data) {
    return request({
      url: '/auth/register',
      method: 'POST',
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        nickname: data.nickname
      }
    });
  }

  // 登录
  export function login(data) {
    return request({
      url: '/auth/login',
      method: 'POST',
      data: {
        email: data.email,
        password: data.password
      }
    });
  }

  // 登出
  export function logout() {
    return request({
      url: '/auth/logout',
      method: 'POST'
    });
  }

  // 获取当前用户信息
  export function getCurrentUser() {
    return request({
      url: '/auth/me',
      method: 'GET'
    });
  }