'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const tx_ref = searchParams.get('tx_ref');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-lg mx-auto text-center space-y-6 px-4">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-2 shadow-sm border border-green-100">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Payment Successful!</h1>
      <p className="text-gray-600 text-lg leading-relaxed">
        Thank you! Your transaction has been completed securely and your property is now confirmed. 
        {tx_ref && <span className="block mt-3 text-sm font-medium text-gray-400 bg-gray-50 py-1.5 px-3 rounded-md border border-gray-100 inline-block">Ref: {tx_ref}</span>}
      </p>

      <div className="bg-blue-50/80 p-5 rounded-2xl w-full text-left flex gap-4 items-start border border-blue-100/50 mt-6 shadow-sm">
        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 text-lg">Lease Agreement Generated</h3>
          <p className="text-sm mt-1.5 text-blue-700/80 leading-relaxed">We've generated your official residential lease agreement. You can download it directly from your notifications or your bookings dashboard.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full pt-8">
        <Link href="/dashboard/bookings" className="flex-1">
          <Button className="w-full h-12 text-md shadow-sm">View Bookings</Button>
        </Link>
        <Link href="/dashboard/notifications" className="flex-1">
          <Button variant="outline" className="w-full h-12 text-md border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors shadow-sm">
            Check Notifications <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
