import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.isAuthenticated) {
    config.headers['Auth-Id'] = authStore.user.id;
    config.headers['Auth-Password'] = authStore.user.password;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
        // Handle forbidden/unauthorized
    }
    return Promise.reject(error);
  }
);

export default api;