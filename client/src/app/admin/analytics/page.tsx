'use client';

import { useAdminMetrics } from '@/hooks/useMessagesAndReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, BarChart3 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { data: metrics, isLoading } = useAdminMetrics();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? [1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />) : (
          <>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  MWK {Number(metrics?.totalRevenue || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-3xl font-bold mt-1">{metrics?.totalBookings || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Avg. Revenue / Booking</p>
                <p className="text-3xl font-bold mt-1">
                  MWK {metrics?.totalBookings ? Math.round(metrics.totalRevenue / metrics.totalBookings).toLocaleString() : '0'}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Revenue by Month</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-64 w-full" /> : (
            <div className="space-y-4">
              {metrics?.revenueChart?.length === 0 ? (
                <div className="text-center py-16">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No revenue data yet. Confirm bookings to see analytics.</p>
                </div>
              ) : (
                metrics?.revenueChart?.map((item: any) => {
                  const pct = Math.min((item.amount / (metrics.totalRevenue || 1)) * 100, 100);
                  return (
                    <div key={item.month} className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 w-20 flex-shrink-0">{item.month}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                        <div className="bg-green-500 h-5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-semibold w-36 text-right">MWK {Number(item.amount).toLocaleString()}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
