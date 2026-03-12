import api from '../api';

export const bookingService = {
  createBooking: (data: { propertyId: string; checkIn: string; checkOut?: string; isFlexibleStay?: boolean }) =>
    api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  requestModification: (bookingId: string, data: any) => api.post(`/bookings/${bookingId}/modify`, data),
};
