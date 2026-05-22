import axiosInstance from './axiosInstance';

export const analyticsApi = {
  getSummary: () =>
    axiosInstance.get('/analytics/summary').then((r) => r.data),

  getSentiment: () =>
    axiosInstance.get('/analytics/sentiment').then((r) => r.data),
};
