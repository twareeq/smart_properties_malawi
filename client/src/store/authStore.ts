'use client';

import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rems_token', token);
      localStorage.setItem('rems_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rems_token');
      localStorage.removeItem('rems_user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrateFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('rems_token');
      const userStr = localStorage.getItem('rems_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token, isAuthenticated: true });
        } catch { /* ignore */ }
      }
    }
  },
}));
