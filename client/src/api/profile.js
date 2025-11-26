import request from '../utils/request';

// 获取用户资料
export function getProfile() {
  return request({
    url: '/users/profile',
    method: 'GET'
  });
}

// 更新用户资料
export function updateProfile(data) {
  // 检查是否是 FormData（文件上传）
  const isFormData = data instanceof FormData;
  
  return request({
    url: '/users/profile',
    method: 'PUT',
    data,
    headers: isFormData ? {
      'Content-Type': 'multipart/form-data'
    } : {}
  });
}

// 上传头像（需要单独接口）
export function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  
  return request({
    url: '/api/users/avatar',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}