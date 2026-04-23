import api from '../api';

export const favoriteService = {
  getMyFavorites: () => api.get('/favorites/my'),
  toggleFavorite: (propertyId: string) => api.post(`/favorites/toggle/${propertyId}`),
};
