'use client';

import { create } from 'zustand';
import { authService } from '@/lib/services/auth.service';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  profile?: UserProfile;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hasHydrated: false,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spm_token', token);
      localStorage.setItem('spm_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spm_token');
      localStorage.removeItem('spm_user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const res = await authService.getMe();
      const user = res.data.data;
      if (user) {
        set((state) => ({ ...state, user }));
        if (typeof window !== 'undefined') {
          localStorage.setItem('spm_user', JSON.stringify(user));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
    }
  },

  hydrateFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('spm_token');
      const userStr = localStorage.getItem('spm_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token, isAuthenticated: true, hasHydrated: true });
          return;
        } catch { /* ignore */ }
      }
      set({ hasHydrated: true });
    }
  },
}));
