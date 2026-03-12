'use client';

import { useAuthStore } from '@/store/authStore';
import { useMyBookings } from '@/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Heart, MessageSquare, ArrowRight } from 'lucide-react';

function StatCard({ title, value, icon: Icon, href }: { title: string; value: any; icon: any; href: string }) {
  return (
    <Link href={href}>
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function TenantDashboardPage() {
  const { user } = useAuthStore();
  const { data: bookings, isLoading } = useMyBookings();

  const confirmedBookings = bookings?.filter((b: any) => b.status === 'CONFIRMED').length ?? 0;
  const pendingBookings = bookings?.filter((b: any) => b.status === 'PENDING').length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={isLoading ? '...' : (bookings?.length ?? 0)} icon={Calendar} href="/dashboard/bookings" />
        <StatCard title="Confirmed Stays" value={isLoading ? '...' : confirmedBookings} icon={Calendar} href="/dashboard/bookings" />
        <StatCard title="Pending Payment" value={isLoading ? '...' : pendingBookings} icon={FileText} href="/dashboard/bookings" />
        <StatCard title="Saved Properties" value="0" icon={Heart} href="/dashboard/favorites" />
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Link href="/dashboard/bookings">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : bookings?.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">You haven&apos;t made any bookings yet.</p>
              <Link href="/properties"><Button>Browse Properties</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings?.slice(0, 5).map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{booking.property?.title || 'Property'}</p>
                    <p className="text-gray-500 text-xs">{booking.property?.city} · {new Date(booking.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-sm">MWK {Number(booking.totalCost).toLocaleString()}</p>
                    <Badge variant={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'PENDING' ? 'warning' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Find a Property', href: '/properties', icon: Heart },
              { label: 'My Bookings', href: '/dashboard/bookings', icon: Calendar },
              { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
              { label: 'Invoices', href: '/dashboard/invoices', icon: FileText },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
