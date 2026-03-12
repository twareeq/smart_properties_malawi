import api from '../api';

export interface LoginData { email: string; password: string; }
export interface RegisterData { email: string; password: string; firstName: string; lastName: string; role?: string; }
export interface ProfileUpdateData { firstName?: string; lastName?: string; phone?: string; bio?: string; avatarUrl?: string; }

export const authService = {
  login: (data: LoginData) => api.post('/auth/login', data),
  register: (data: RegisterData) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: ProfileUpdateData) => api.put('/auth/profile', data),
};
