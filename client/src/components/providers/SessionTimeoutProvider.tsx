'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const { addToast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    logout();
    addToast('You have been logged out due to inactivity.', 'info');
    router.push('/login');
  }, [logout, router, addToast]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(handleLogout, TIMEOUT_DURATION);
    }
  }, [isAuthenticated, handleLogout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleEvent = () => {
      resetTimer();
    };

    if (isAuthenticated) {
      resetTimer();
      events.forEach((event) => {
        window.addEventListener(event, handleEvent);
      });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [isAuthenticated, resetTimer]);

  return <>{children}</>;
}
