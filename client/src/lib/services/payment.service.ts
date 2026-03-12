import api from '../api';

export const paymentService = {
  initiatePayment: (bookingId: string) => api.post('/payments/initiate', { bookingId }),
  getInvoices: () => api.get('/payments/invoices'),
  getReceipts: () => api.get('/payments/receipts'),
};
