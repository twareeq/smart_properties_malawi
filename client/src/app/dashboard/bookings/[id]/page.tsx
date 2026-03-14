'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBookingDetail } from '@/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  Home, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const statusVariant: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'destructive',
  COMPLETED: 'secondary',
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: booking, isLoading, error } = useBookingDetail(id as string);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find the booking details you're looking for.</p>
        <Button onClick={() => router.push('/dashboard/bookings')}>Back to My Bookings</Button>
      </div>
    );
  }

  const latestPayment = booking.payments?.[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button 
        variant="ghost" 
        className="mb-6 -ml-2 text-gray-500 hover:text-primary"
        onClick={() => router.push('/dashboard/bookings')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Bookings
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <Card className="border-0 shadow-sm overflow-hidden bg-white">
            <div className="h-32 bg-primary/5 border-b border-primary/10 flex items-center px-8">
              <div className="flex justify-between items-center w-full">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                  <p className="text-gray-500 text-sm mt-1">ID: {booking.id}</p>
                </div>
                <Badge variant={statusVariant[booking.status] || 'secondary'} className="px-4 py-1.5 text-sm">
                  {booking.status}
                </Badge>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Stay Period</p>
                      <p className="font-semibold">
                        {format(new Date(booking.checkIn), 'PPP')} — {booking.checkOut ? format(new Date(booking.checkOut), 'PPP') : 'Flexible'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Duration</p>
                      <p className="font-semibold">{booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Cost</p>
                      <p className="font-bold text-xl text-gray-900">MWK {Number(booking.totalCost).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Section */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 aspect-video md:aspect-auto">
                  <img 
                    src={booking.property.images?.[0]?.secureUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'} 
                    alt={booking.property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{booking.property.title}</h3>
                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.property.address}, {booking.property.city}</span>
                    </div>
                  </div>
                  <Link href={`/properties/${booking.property.id}`}>
                    <Button variant="outline" className="w-fit">View Full Property Listing</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Transaction details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {latestPayment ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Payment Status</p>
                      <Badge variant={latestPayment.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {latestPayment.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Transaction Ref</p>
                      <p className="font-mono text-sm bg-gray-50 p-2 rounded border border-gray-100">{latestPayment.reference || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Amount Paid</p>
                      <p className="font-bold">MWK {Number(latestPayment.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Date Paid</p>
                      <p>{latestPayment.paidAt ? format(new Date(latestPayment.paidAt), 'PPP p') : 'Processing...'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {latestPayment.invoice && (
                      <Link href={`/dashboard/invoices`}>
                         <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="w-4 h-4" /> Download Invoice
                        </Button>
                      </Link>
                    )}
                    {latestPayment.receipt && (
                      <Link href={`/dashboard/receipts`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Download Receipt
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No transactions recorded yet.</p>
                  {booking.status === 'PENDING' && (
                    <Button className="mt-4" onClick={() => router.push('/dashboard/bookings')}>Proceed to Payment</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Owner Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-lg">Owner Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {booking.property.owner.profile?.firstName} {booking.property.owner.profile?.lastName}
                  </p>
                  <p className="text-xs text-primary font-medium hover:underline cursor-pointer">Official Property Owner</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="truncate font-medium">{booking.property.owner.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone Number</p>
                    <p className="font-medium">{booking.property.owner.profile?.phone || 'Not Shared'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button className="w-full flex items-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary border-0 shadow-none">
                  <Mail className="w-4 h-4" /> Message Owner
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="border-0 shadow-sm bg-blue-600 text-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg">Need help with your stay?</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Contact our support team for any issues regarding your booking, payment, or stay experience.
              </p>
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 border-0">Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
