import api from '../api';

export const notificationService = {
  getMyNotifications: () => api.get('/notifications/my'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
};
