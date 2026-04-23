'use client';

import { useAuthStore } from '@/store/authStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authService, LoginData, RegisterData, ProfileUpdateData } from '@/lib/services/auth.service';
import { useRouter } from 'next/navigation';

export function useLogin(redirectTo?: string) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (response) => {
      const { user, token } = response.data.data;
      setAuth(user, token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('spm_token', token);
        localStorage.setItem('spm_user', JSON.stringify(user));
      }
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(redirectTo || '/dashboard');
      }
    },
  });
}

export function useRegister(redirectTo?: string) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (response) => {
      const { user, token } = response.data.data;
      setAuth(user, token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('spm_token', token);
        localStorage.setItem('spm_user', JSON.stringify(user));
      }
      router.push(redirectTo || '/dashboard');
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => authService.getMe().then((r) => r.data.data),
    retry: false,
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: ProfileUpdateData) => authService.updateProfile(data),
  });
}

export function useUpdateAvatar() {
  return useMutation({
    mutationFn: (file: File) => authService.uploadAvatar(file),
  });
}
