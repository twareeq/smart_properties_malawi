import api from '../api';

export const messageService = {
  getConversations: () => api.get('/messages'),
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`),
  sendMessage: (propertyId: string, content: string) => api.post('/messages', { propertyId, content }),
  replyMessage: (conversationId: string, content: string) =>
    api.post(`/messages/${conversationId}/reply`, { content }),
};
