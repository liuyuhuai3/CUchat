import { defineStore } from 'pinia';

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

      logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
      }
    },

    getters: {
      isLoggedIn: (state) => !!state.token
    }
  });