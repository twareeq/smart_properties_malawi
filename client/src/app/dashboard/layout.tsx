'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for token on mount
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('rems_token');
      const storedUser = localStorage.getItem('rems_user');
      if (!token || !storedUser) {
        router.push('/login');
      }
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <DashboardSidebar />
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
