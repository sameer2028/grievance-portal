import axiosInstance from './axiosInstance';

export const commentApi = {
  getAll: (grievanceId) =>
    axiosInstance.get(`/grievances/${grievanceId}/comments`).then(r => r.data),
  create: (grievanceId, data) =>
    axiosInstance.post(`/grievances/${grievanceId}/comments`, data).then(r => r.data),
  delete: (grievanceId, commentId) =>
    axiosInstance.delete(`/grievances/${grievanceId}/comments/${commentId}`).then(r => r.data),
};

export const feedbackApi = {
  get:    (grievanceId)       => axiosInstance.get(`/grievances/${grievanceId}/feedback`).then(r => r.data),
  submit: (grievanceId, data) => axiosInstance.post(`/grievances/${grievanceId}/feedback`, data).then(r => r.data),
};

export const slaApi = {
  getAll:  ()         => axiosInstance.get('/sla').then(r => r.data),
  update:  (id, data) => axiosInstance.patch(`/sla/${id}`, data).then(r => r.data),
  trigger: ()         => axiosInstance.post('/sla/run-escalation').then(r => r.data),
};

export const publicApi = {
  getStats: () => axiosInstance.get('/public/stats').then(r => r.data),
};

export const exportApi = {
  downloadGrievancesCSV: (params) =>
    axiosInstance.get('/export/grievances', {
      params,
      responseType: 'blob', // Important: tells Axios to handle binary response
    }),
};
