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
  return request({
    url: '/users/profile',
    method: 'PUT',
    data
  });
}

// 上传头像（如果需要单独接口）
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