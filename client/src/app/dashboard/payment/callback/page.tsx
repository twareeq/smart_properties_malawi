'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyPayment } from '@/hooks/useBookings';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync: verifyPayment } = useVerifyPayment();
  const { addToast } = useToast();

  useEffect(() => {
    const tx_ref = searchParams.get('tx_ref');
    const status = searchParams.get('status');

    if (!tx_ref) {
      router.replace('/dashboard/bookings');
      return;
    }

    if (status === 'cancelled' || status === 'failed') {
      router.replace('/dashboard/payment/failure');
      return;
    }
    
    verifyPayment(tx_ref).then((res: any) => {
      // res mapping
      router.replace(`/dashboard/payment/success?tx_ref=${tx_ref}`);
    }).catch((err) => {
      console.error(err);
      addToast(err?.response?.data?.message || 'Payment verification failed or was cancelled.', 'error');
      router.replace('/dashboard/payment/failure');
    });
  }, [searchParams, verifyPayment, router, addToast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <Loader2 className="w-14 h-14 text-primary animate-spin mb-2" />
      <h2 className="text-2xl font-bold text-gray-900">Verifying your payment...</h2>
      <p className="text-gray-500">Please stay on this page while we process your transaction securely.</p>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <Loader2 className="w-14 h-14 text-primary animate-spin mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Verifying your payment...</h2>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
