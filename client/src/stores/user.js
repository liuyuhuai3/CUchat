import { defineStore } from 'pinia';
import { getProfile } from '@/api/profile';

  export const useUserStore = defineStore('user', {
    state: () => ({
      user: null,
      token: localStorage.getItem('token') || null
    }),

    actions: {
      setUser(user) {
        this.user = user;
      },

      setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
      },
      
      // 获取用户资料
      async fetchUserProfile() {
        try {
          const response = await getProfile();
          // 注意：由于 request 直接返回 data，这里直接使用 response.success
          if (response.success) {
            this.user = response.user;
          }
          return response.user;
        } catch (error) {
          console.error('获取用户信息失败:', error);
          throw error;
        }
      },

      // 新增：更新用户信息
      updateUserInfo(updates) {
        if (this.user) {
          this.user = { ...this.user, ...updates };
        }
      },

      logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
      }
    },

    getters: {
      isLoggedIn: (state) => !!state.token,
      displayName: (state) => state.user?.nickname || state.user?.username,
      userAvatar: (state) => state.user?.avatar_url
    }
  });