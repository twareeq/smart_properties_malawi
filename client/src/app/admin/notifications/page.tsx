'use client';

import { Bell } from 'lucide-react';

// Admin notifications page
export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
        <Bell className="w-14 h-14 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">You&apos;re all caught up! No new notifications.</p>
      </div>
    </div>
  );
}
