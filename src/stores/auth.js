import { defineStore } from 'pinia';
import api from '@/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('sustc_user')) || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(id, password) {
      const res = await api.post('/user/login', { authorId: id, password });
      if (res.data !== -1) {
        this.user = { id: res.data, password }; 
        localStorage.setItem('sustc_user', JSON.stringify(this.user));
        return true;
      }
      return false;
    },
    async register(payload) {
      const res = await api.post('/user/register', payload);
      return res.data;
    },
    logout() {
      this.user = null;
      localStorage.removeItem('sustc_user');
    }
  }
});