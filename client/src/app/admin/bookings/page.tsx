'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

// Admin bookings management page - fetches all bookings for admin's properties
// In a full implementation this would call a dedicated admin/bookings endpoint
export default function AdminBookingsPage() {
  const bookings: any[] = [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <Calendar className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
          <p className="text-gray-400">Bookings for your properties will appear here once tenants book.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <Card key={booking.id} className="border-0 shadow-sm">
              <CardContent className="flex items-center justify-between pt-4 pb-4">
                <div>
                  <p className="font-semibold">{booking.tenant?.email}</p>
                  <p className="text-gray-500 text-sm">{booking.property?.title}</p>
                  <p className="text-gray-400 text-xs">{new Date(booking.checkIn).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold">MWK {Number(booking.totalCost).toLocaleString()}</p>
                  <Badge variant={booking.status === 'CONFIRMED' ? 'success' : 'warning'}>{booking.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
