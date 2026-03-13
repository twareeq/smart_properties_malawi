import api from '../api';

export const paymentService = {
  initiatePayment: (bookingId: string) => api.post('/payments/initiate', { bookingId }),
  verifyPayment: (tx_ref: string) => api.post('/payments/verify', { tx_ref }),
  getInvoices: () => api.get('/payments/invoices'),
  getReceipts: () => api.get('/payments/receipts'),
  downloadInvoice: (id: string) => api.get(`/payments/invoices/${id}/download`, { responseType: 'blob' }),
  downloadReceipt: (id: string) => api.get(`/payments/receipts/${id}/download`, { responseType: 'blob' }),
};
