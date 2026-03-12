'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * AuthHydrator: Runs on client mount to restore auth state from localStorage.
 * Place this inside the root layout so auth persists on page refresh.
 */
export function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
