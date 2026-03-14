'use client';

import Link from 'next/link';
import { useAdminBookings } from '@/hooks/useBookings';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  MapPin,
  User,
  CreditCard,
  Home,
  ChevronRight,
} from 'lucide-react';

const bookingStatusVariant: Record<
  string,
  'success' | 'warning' | 'destructive' | 'secondary'
> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'destructive',
  COMPLETED: 'secondary',
};

const paymentStatusVariant: Record<
  string,
  'success' | 'warning' | 'destructive' | 'secondary'
> = {
  SUCCESSFUL: 'success',
  PENDING: 'warning',
  FAILED: 'destructive',
  REFUNDED: 'secondary',
};

export default function AdminBookingsPage() {
  const { data: bookings, isLoading, isError } = useAdminBookings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Booking Management
        </h1>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Booking Management
        </h1>
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm text-red-500">
          Failed to load bookings. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Booking Management
        </h1>
        <span className="text-sm text-gray-500">
          {bookings?.length ?? 0} total bookings
        </span>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <Calendar className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-400">
            Reservations and confirmed bookings will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: any) => {
            const latestPayment = booking.payments?.[0];
            const tenant = booking.tenant;
            const tenantName = tenant?.profile
              ? `${tenant.profile.firstName} ${tenant.profile.lastName}`
              : tenant?.email;

            return (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group mt-5">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      {/* Left: Property + Tenant */}
                      <div className="flex gap-4 items-start flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Home className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {booking.property?.title}
                          </p>
                          <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {booking.property?.city},{' '}
                            {booking.property?.region}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                            <User className="w-3 h-3" />
                            {tenantName}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                            <Calendar className="w-3 h-3" />
                            Check-in:{' '}
                            {new Date(
                              booking.checkIn,
                            ).toLocaleDateString()}
                            {booking.checkOut &&
                              ` → ${new Date(booking.checkOut).toLocaleDateString()}`}
                            {booking.isFlexibleStay && (
                              <span className="text-blue-500 ml-1">
                                (Flexible)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status + Amount + Arrow */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              bookingStatusVariant[booking.status] ||
                              'secondary'
                            }
                          >
                            {booking.status}
                          </Badge>
                          {latestPayment && (
                            <Badge
                              variant={
                                paymentStatusVariant[
                                  latestPayment.status
                                ] || 'secondary'
                              }
                            >
                              <CreditCard className="w-3 h-3 mr-1" />
                              {latestPayment.status}
                            </Badge>
                          )}
                        </div>
                        <p className="font-bold text-gray-900">
                          MWK{' '}
                          {Number(booking.totalCost).toLocaleString()}
                        </p>
                        {latestPayment?.reference && (
                          <p className="text-xs text-gray-400 font-mono">
                            {latestPayment.reference}
                          </p>
                        )}
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0 hidden md:block" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
