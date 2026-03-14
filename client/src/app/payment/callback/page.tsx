'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Suspense } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tx_ref = searchParams.get('tx_ref');
    const status = searchParams.get('status');

    if (!tx_ref) {
      router.replace('/dashboard/bookings');
      return;
    }

    // PayChangu appends status=cancelled or status=failed on those outcomes
    if (status === 'cancelled' || status === 'failed') {
      router.replace('/payment/failure');
      return;
    }

    // Verify with backend — api.ts attaches token from localStorage automatically
    api.post('/payments/verify', { tx_ref })
      .then(() => {
        router.replace(`/payment/success?tx_ref=${tx_ref}`);
      })
      .catch((err) => {
        console.error('Verification failed:', err);
        router.replace('/payment/failure');
      });
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 text-center bg-gray-50">
      <Loader2 className="w-14 h-14 text-primary animate-spin mb-2" />
      <h2 className="text-2xl font-bold text-gray-900">Verifying your payment...</h2>
      <p className="text-gray-500">Please stay on this page while we process your transaction securely.</p>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
