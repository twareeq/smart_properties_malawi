import api from '../api';

export const reviewService = {
  getPropertyReviews: (propertyId: string) => api.get(`/reviews/property/${propertyId}`),
  submitReview: (data: {
    propertyId: string;
    rating: number;
    cleanliness?: number;
    comfort?: number;
    location?: number;
    value?: number;
    comment?: string;
  }) => api.post('/reviews', data),
};
