'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/components/providers/ToastProvider';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Heart, Calendar, FileText, Receipt, Bell, MessageSquare, Settings, LogOut, ChevronRight
} from 'lucide-react';

const tenantLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: Calendar },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { href: '/dashboard/receipts', label: 'Receipts', icon: Receipt },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile & Settings', icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const { addToast } = useToast();

  const { data: notifications } = useNotifications();
  const [prevNotifIds, setPrevNotifIds] = useState<string[]>([]);

  useEffect(() => {
    if (notifications) {
      if (prevNotifIds.length > 0) {
        const newNotifs = notifications.filter((n: any) => !n.isRead && !prevNotifIds.includes(n.id));
        if (newNotifs.length > 0) {
          addToast(`You have ${newNotifs.length} new notification(s)`, 'info');
        }
      }
      setPrevNotifIds(notifications.map((n: any) => n.id));
    }
  }, [notifications]);

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spm_token');
      localStorage.removeItem('spm_user');
    }
    router.push('/');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg mb-2 overflow-hidden">
          {user?.profile?.avatarUrl ? (
            <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user?.profile?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'T'
          )}
        </div>
        <p className="font-semibold text-gray-800 truncate">
          {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : user?.email}
        </p>
        <span className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {tenantLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {href === '/dashboard/notifications' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
              {active && href !== '/dashboard/notifications' && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
