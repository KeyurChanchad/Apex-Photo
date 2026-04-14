import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const api = axios.create({
  baseURL:
    Config.API_URL?.replace(/\/$/, '') || 'https://event.apexinfocom.in/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor - simplified without token cleaning
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      // Only trim whitespace, don't modify the token
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    console.log('Axios interceptor response ', error);

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${Config.API_URL}/auth/refresh`, {
            refreshToken: refreshToken.trim(),
          });

          const { accessToken } = response.data;
          await AsyncStorage.setItem('token', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('Refresh failed:', refreshError);
        await AsyncStorage.clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
