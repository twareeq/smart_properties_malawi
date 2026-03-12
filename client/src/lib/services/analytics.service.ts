import api from '../api';

export const analyticsService = {
  getDashboardMetrics: () => api.get('/analytics/metrics'),
};
