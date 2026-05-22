import axiosInstance from './axiosInstance';

export const userApi = {
  getProfile:       ()         => axiosInstance.get('/users/profile').then(r => r.data),
  updateProfile:    (data)     => axiosInstance.patch('/users/profile', data).then(r => r.data),
  changePassword:   (data)     => axiosInstance.patch('/users/change-password', data).then(r => r.data),
  getAll:           (params)   => axiosInstance.get('/users', { params }).then(r => r.data),
  createOfficer:    (data)     => axiosInstance.post('/users/officers', data).then(r => r.data),
  toggleActive:     (id)       => axiosInstance.patch(`/users/${id}/toggle-active`).then(r => r.data),
  updateDepartment: (id, dept) => axiosInstance.patch(`/users/${id}/department`, { department: dept }).then(r => r.data),
  getById:          (id)       => axiosInstance.get(`/users/${id}`).then(r => r.data),
};
