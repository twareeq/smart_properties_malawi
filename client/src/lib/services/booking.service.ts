import api from '../api';

export const bookingService = {
  createBooking: (data: { propertyId: string; checkIn: string; checkOut?: string; isFlexibleStay?: boolean }) =>
    api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBookingDetail: (id: string) => api.get(`/bookings/${id}`),
  cancelBooking: (id: string) => api.put(`/bookings/${id}/cancel`),
  requestModification: (bookingId: string, data: any) => api.post(`/bookings/${bookingId}/modify`, data),
  // Admin
  getAdminBookings: () => api.get('/bookings/admin/all'),
  getAdminBookingDetail: (id: string) => api.get(`/bookings/admin/${id}`),
};

