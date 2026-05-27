import axiosInstance from './axiosInstance';

export const grievanceApi = {
  create: (data) =>
    axiosInstance.post('/grievances', data).then((r) => r.data),

  getAll: (params) =>
    axiosInstance.get('/grievances', { params }).then((r) => r.data),

  getMy: (params) =>
    axiosInstance.get('/grievances/my', { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`/grievances/${id}`).then((r) => r.data),

  updateStatus: (id, data) => axiosInstance.patch(`/grievances/${id}/status`, data).then(r => r.data),
  assign:       (id, officerId) => axiosInstance.patch(`/grievances/${id}/assign`, { officerId }).then(r => r.data),
  trackByTicket:        (ticketNum)   => axiosInstance.get(`/grievances/track/${ticketNum}`).then(r => r.data),
  analyzeImage: (file)        => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosInstance.post('/grievances/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
};
