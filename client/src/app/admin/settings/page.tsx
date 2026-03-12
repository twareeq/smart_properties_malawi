'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Account Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Email Address</Label>
            <Input value={user?.email || ''} readOnly className="bg-gray-50" />
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <Input value={user?.role || ''} readOnly className="bg-gray-50 capitalize" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'email', label: 'Email notifications for new bookings' },
            { key: 'sms', label: 'SMS notifications for payment updates' },
            { key: 'booking', label: 'Booking modification requests' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">{label}</span>
            </label>
          ))}
          <Button className="mt-2">Save Notification Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
