'use client';

import { useState } from 'react';
import { useInvoices } from '@/hooks/useBookings';
import { paymentService } from '@/lib/services/payment.service';
import { useToast } from '@/components/providers/ToastProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useInvoices();
  const { addToast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string, number: string) => {
    try {
      setDownloadingId(id);
      const response = await paymentService.downloadInvoice(id);
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${number}.html`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      addToast('Failed to download invoice', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
      {!invoices || invoices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No invoices yet. Invoices are generated when you initiate a booking payment.</p>
          <Link href="/properties"><Button className="mt-4">Book a Property</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice: any) => (
            <Card key={invoice.id} className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold">{invoice.number}</p>
                    <p className="text-gray-500 text-sm">{invoice.payment?.booking?.property?.title || 'Property Booking'}</p>
                    <p className="text-gray-400 text-xs">{new Date(invoice.generatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-gray-900">MWK {Number(invoice.amount).toLocaleString()}</p>
                  <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleDownload(invoice.id, invoice.number)} disabled={downloadingId === invoice.id}>
                    {downloadingId === invoice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download
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
