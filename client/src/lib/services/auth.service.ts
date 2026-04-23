import api from '../api';

export interface LoginData { email: string; password: string; }
export interface RegisterData { email: string; password: string; firstName: string; lastName: string; role?: string; }
export interface ProfileUpdateData { firstName?: string; lastName?: string; phone?: string; bio?: string; avatarUrl?: string; }

export const authService = {
  login: (data: LoginData) => api.post('/auth/login', data),
  register: (data: RegisterData) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: ProfileUpdateData) => api.put('/auth/profile', data),
  
  uploadAvatar: async (file: File) => {
    // 1. Get signature from backend
    const sigRes = await api.get('/uploads/signature');
    const { signature, timestamp, cloudName, apiKey, folder } = sigRes.data.data;

    // 2. Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', String(timestamp));
    formData.append('api_key', apiKey);
    formData.append('folder', folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadRes.ok) {
      throw new Error('Cloudinary upload failed');
    }
    const cloudData = await uploadRes.json();

    // 3. Update profile with the new secureUrl
    return api.put('/auth/profile', {
      avatarUrl: cloudData.secure_url
    });
  }
};
