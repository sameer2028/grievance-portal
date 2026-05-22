import axiosInstance from './axiosInstance';

export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data).then((r) => r.data),
  login: (data) => axiosInstance.post('/auth/login', data).then((r) => r.data),
  logout: () => axiosInstance.post('/auth/logout').then((r) => r.data),
  refresh: () => axiosInstance.post('/auth/refresh').then((r) => r.data),
  getMe: () => axiosInstance.get('/auth/me').then((r) => r.data),
};
