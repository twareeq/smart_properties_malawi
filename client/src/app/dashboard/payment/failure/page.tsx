'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, PhoneCall } from 'lucide-react';
import { Suspense } from 'react';

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-lg mx-auto text-center space-y-6 px-4">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-2 shadow-sm border border-red-100 line-wobble">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Payment Failed</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          We couldn't process your payment. This might be due to insufficient funds, a network error, or a cancelled transaction.
        </p>

        <div className="bg-orange-50/80 p-5 rounded-2xl w-full text-left flex gap-4 items-start border border-orange-100/50 mt-6 shadow-sm">
          <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
             <PhoneCall className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-orange-900 text-lg">Need help?</h3>
            <p className="text-sm mt-1.5 text-orange-800/80 leading-relaxed">If you keep experiencing issues, please verify your card details or try reaching out to your bank.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-8">
          <Link href="/dashboard/bookings" className="flex-1">
            <Button className="w-full h-12 text-md gap-2 shadow-sm" variant="default">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full h-12 text-md border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors shadow-sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </Suspense>
  );
}
