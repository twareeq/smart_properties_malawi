'use client';

import { useMyBookings } from '@/hooks/useBookings';
import { useInitiatePayment } from '@/hooks/useBookings';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/providers/ToastProvider';
import Link from 'next/link';
import { Calendar, MapPin, CreditCard, Home } from 'lucide-react';

const statusVariant: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'destructive',
  COMPLETED: 'secondary',
};

export default function BookingsPage() {
  const { data: bookings, isLoading } = useMyBookings();
  const { mutateAsync: initiatePayment, isPending } = useInitiatePayment();
  const { addToast } = useToast();

  const handlePay = async (bookingId: string) => {
    try {
      const result = await initiatePayment(bookingId);
      const checkoutUrl = result?.data?.data?.checkoutUrl;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
      addToast('Payment initiated! Complete payment in the new tab.', 'info');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Payment failed to initiate.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>

      {!bookings || bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <Calendar className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
          <p className="text-gray-400 mb-6">Explore properties and make your first reservation.</p>
          <Link href="/properties"><Button>Browse Properties</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-5">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Home className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.property?.title}</h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {booking.property?.city}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                        {booking.checkOut && <span>→ {new Date(booking.checkOut).toLocaleDateString()}</span>}
                        {booking.isFlexibleStay && <span className="text-blue-500">(Flexible)</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    <Badge variant={statusVariant[booking.status] || 'secondary'}>{booking.status}</Badge>
                    <p className="font-bold text-gray-900">MWK {Number(booking.totalCost).toLocaleString()}</p>
                    {booking.status === 'PENDING' && (
                      <Button size="sm" className="flex items-center gap-1" onClick={() => handlePay(booking.id)} disabled={isPending}>
                        <CreditCard className="w-4 h-4" /> Pay Now
                      </Button>
                    )}
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
