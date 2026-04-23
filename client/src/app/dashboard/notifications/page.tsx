'use client';

import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, CreditCard, MessageSquare, Info, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function TenantNotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { mutate: markAsRead, isPending: markPending } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: markAllPending } = useMarkAllNotificationsAsRead();

  const getIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT_SUCCESS': return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'NEW_MESSAGE': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'BOOKING_CONFIRMED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTargetUrl = (type: string) => {
    switch (type) {
      case 'NEW_MESSAGE': return '/dashboard/messages';
      case 'PAYMENT_SUCCESS': 
      case 'BOOKING_CONFIRMED': return '/dashboard/bookings';
      default: return '/dashboard/notifications';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  const hasUnread = notifications?.some((n: any) => !n.isRead);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {hasUnread && (
          <Button 
            variant="outline" 
            onClick={() => markAllAsRead()} 
            disabled={markAllPending}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <Bell className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">You&apos;re all caught up! No new notifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif: any) => (
            <Card key={notif.id} className={`transition-all ${notif.isRead ? 'opacity-60 bg-gray-50' : 'border-primary/20 bg-white shadow-sm'}`}>
              <CardContent className="p-4 sm:p-6 flex gap-4 items-start">
                <div className={`p-2 rounded-full ${notif.isRead ? 'bg-gray-100' : 'bg-primary/10'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{notif.message}</p>
                  
                  <div className="flex items-center gap-2">
                    {!notif.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary h-8 px-3 text-xs"
                        onClick={() => markAsRead(notif.id)}
                        disabled={markPending}
                      >
                        Mark as read
                      </Button>
                    )}
                    <Link href={getTargetUrl(notif.type)}>
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs flex items-center gap-1">
                        View details <ChevronRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
