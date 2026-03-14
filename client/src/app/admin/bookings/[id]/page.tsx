'use client';

import Link from 'next/link';
import { useAdminBookingDetail } from '@/hooks/useBookings';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Home, MapPin, User, CreditCard, Calendar, FileText, Receipt, Phone, Mail, Hash
} from 'lucide-react';

const bookingStatusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'destructive',
  COMPLETED: 'secondary',
};

const paymentStatusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  SUCCESSFUL: 'success',
  PENDING: 'warning',
  FAILED: 'destructive',
  REFUNDED: 'secondary',
};

const propertyStatusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  AVAILABLE: 'success',
  RENTED: 'destructive',
  MAINTENANCE: 'warning',
  HIDDEN: 'secondary',
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide sm:w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value ?? <span className="text-gray-300">—</span>}</span>
    </div>
  );
}

export default function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: booking, isLoading, isError } = useAdminBookingDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>Booking not found or failed to load.</p>
        <Link href="/admin/bookings"><Button variant="outline" className="mt-4">Back to Bookings</Button></Link>
      </div>
    );
  }

  const latestPayment = booking.payments?.[0];
  const tenant = booking.tenant;
  const property = booking.property;
  const tenantName = tenant?.profile
    ? `${tenant.profile.firstName} ${tenant.profile.lastName}`
    : tenant?.email;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Detail</h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{booking.id}</p>
        </div>
        <Badge variant={bookingStatusVariant[booking.status] || 'secondary'} className="ml-auto">
          {booking.status}
        </Badge>
      </div>

      {/* Property Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Home className="w-4 h-4 text-primary" /> Property Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-lg text-gray-900">{property?.title}</p>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                {property?.address}, {property?.city}, {property?.region}
              </div>
            </div>
            <Badge variant={propertyStatusVariant[property?.status] || 'secondary'}>{property?.status}</Badge>
          </div>
          <DetailRow label="Type" value={property?.type} />
          <DetailRow label="Price / Night" value={`MWK ${Number(property?.pricePerNight).toLocaleString()}`} />
          <DetailRow
            label="Owner"
            value={
              property?.owner?.profile
                ? `${property.owner.profile.firstName} ${property.owner.profile.lastName} (${property.owner.email})`
                : property?.owner?.email
            }
          />
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DetailRow label="Booking ID" value={<span className="font-mono text-xs">{booking.id}</span>} />
          <DetailRow label="Status" value={<Badge variant={bookingStatusVariant[booking.status] || 'secondary'}>{booking.status}</Badge>} />
          <DetailRow label="Reserved On" value={new Date(booking.createdAt).toLocaleString()} />
          <DetailRow label="Check-In" value={new Date(booking.checkIn).toLocaleDateString()} />
          <DetailRow label="Check-Out" value={booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '—'} />
          <DetailRow label="Nights" value={booking.nights} />
          <DetailRow label="Stay Type" value={booking.isFlexibleStay ? 'Flexible' : 'Fixed'} />
          <DetailRow label="Total Amount" value={<span className="font-bold">MWK {Number(booking.totalCost).toLocaleString()}</span>} />
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Payment & Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestPayment ? (
            <>
              <DetailRow label="Payment Status" value={<Badge variant={paymentStatusVariant[latestPayment.status] || 'secondary'}>{latestPayment.status}</Badge>} />
              <DetailRow label="Amount" value={`MWK ${Number(latestPayment.amount).toLocaleString()} ${latestPayment.currency}`} />
              <DetailRow label="Transaction Ref" value={<span className="font-mono text-xs">{latestPayment.reference}</span>} />
              <DetailRow label="Paid At" value={latestPayment.paidAt ? new Date(latestPayment.paidAt).toLocaleString() : '—'} />
              {latestPayment.invoice && (
                <DetailRow label="Invoice" value={
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-mono text-xs">{latestPayment.invoice.number}</span>
                    <Link href={`/api/payments/invoices/${latestPayment.invoice.id}/download`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600">Download</Button>
                    </Link>
                  </div>
                } />
              )}
              {latestPayment.receipt && (
                <DetailRow label="Receipt" value={
                  <div className="flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-green-500" />
                    <span className="font-mono text-xs">{latestPayment.receipt.number}</span>
                    <Link href={`/api/payments/receipts/${latestPayment.receipt.id}/download`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-green-600">Download</Button>
                    </Link>
                  </div>
                } />
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 py-2">No payment initiated yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Tenant Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Tenant Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DetailRow
            label="Full Name"
            value={tenantName}
          />
          <DetailRow
            label="Email"
            value={
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />{tenant?.email}
              </span>
            }
          />
          {tenant?.profile?.phone && (
            <DetailRow
              label="Phone"
              value={
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />{tenant.profile.phone}
                </span>
              }
            />
          )}
          <DetailRow label="Tenant ID" value={<span className="font-mono text-xs">{tenant?.id}</span>} />
        </CardContent>
      </Card>
    </div>
  );
}
