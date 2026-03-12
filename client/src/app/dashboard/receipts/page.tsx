'use client';

import { useReceipts } from '@/hooks/useBookings';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Receipt as ReceiptIcon, Download, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReceiptsPage() {
  const { data: receipts, isLoading } = useReceipts();

  if (isLoading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Receipts</h1>
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
      {!receipts || receipts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <ReceiptIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No receipts yet. Receipts are generated after successful payments.</p>
          <Link href="/properties"><Button className="mt-4">Book a Property</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {receipts.map((receipt: any) => (
            <Card key={receipt.id} className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold">{receipt.number}</p>
                    <p className="text-gray-500 text-sm">{receipt.payment?.booking?.property?.title || 'Property Booking'}</p>
                    <p className="text-gray-400 text-xs">{new Date(receipt.generatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-green-600">MWK {Number(receipt.amount).toLocaleString()}</p>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
