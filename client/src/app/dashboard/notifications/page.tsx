'use client';

import { Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// In a full implementation, this would fetch from /api/v1/notifications
// For MVP, we show an empty state placeholder
export default function NotificationsPage() {
  const notifications: any[] = [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <Bell className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">You&apos;re all caught up! No new notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => (
            <Card key={n.id} className={`border-0 shadow-sm ${!n.isRead ? 'border-l-4 border-primary' : ''}`}>
              <CardContent className="pt-4 pb-4">
                <p className="font-medium">{n.title}</p>
                <p className="text-gray-500 text-sm">{n.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
