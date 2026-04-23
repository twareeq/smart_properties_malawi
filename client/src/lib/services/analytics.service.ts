import api from '../api';

export const analyticsService = {
  getAdminMetrics: () => api.get('/analytics/metrics'),
  getPublicStats: () => api.get('/analytics/public-stats'),
};
