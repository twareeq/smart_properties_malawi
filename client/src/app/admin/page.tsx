'use client';

import { useAdminMetrics } from '@/hooks/useMessagesAndReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Calendar, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function MetricCard({ title, value, icon: Icon, color }: { title: string; value: any; icon: any; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: metrics, isLoading } = useAdminMetrics();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your properties and bookings</p>
        </div>
        <Link href="/admin/properties/create">
          <Button className="flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Add Property
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Properties" value={metrics?.totalProperties || 0} icon={Building2} color="bg-blue-50 text-blue-600" />
          <MetricCard title="Total Bookings" value={metrics?.totalBookings || 0} icon={Calendar} color="bg-purple-50 text-purple-600" />
          <MetricCard title="Total Revenue" value={`MWK ${Number(metrics?.totalRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="bg-green-50 text-green-600" />
          <MetricCard title="Pending Refunds" value={metrics?.pendingRefunds || 0} icon={AlertTriangle} color="bg-orange-50 text-orange-600" />
        </div>
      )}

      {/* Revenue Chart Placeholder */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-48 w-full" /> : (
            <div className="space-y-3">
              {metrics?.revenueChart?.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No revenue data yet. Payments will appear here as bookings are confirmed.</p>
                </div>
              ) : (
                metrics?.revenueChart?.map((item: any) => (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-16">{item.month}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                      <div
                        className="bg-primary h-4 rounded-full"
                        style={{ width: `${Math.min((item.amount / (metrics.totalRevenue || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-32 text-right">MWK {Number(item.amount).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Manage Properties', href: '/admin/properties' },
          { label: 'View Bookings', href: '/admin/bookings' },
          { label: 'Revenue Analytics', href: '/admin/analytics' },
          { label: 'Settings', href: '/admin/settings' },
        ].map(({ label, href }) => (
          <Link key={href} href={href}>
            <Button variant="outline" className="w-full h-14 text-sm">{label}</Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
