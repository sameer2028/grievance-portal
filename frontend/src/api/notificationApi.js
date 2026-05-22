import axiosInstance from './axiosInstance';

export const notificationApi = {
  getAll:      (params) => axiosInstance.get('/notifications', { params }).then(r => r.data),
  markRead:    (id)     => axiosInstance.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: ()       => axiosInstance.patch('/notifications/read-all').then(r => r.data),
  delete:      (id)     => axiosInstance.delete(`/notifications/${id}`).then(r => r.data),
};
