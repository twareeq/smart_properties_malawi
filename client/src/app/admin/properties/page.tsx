'use client';

import { useState } from 'react';
import { useMyProperties, useDeleteProperty } from '@/hooks/useProperties';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/providers/ToastProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye, Building2, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminPropertiesPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data, isLoading } = useMyProperties();
  const { mutateAsync: deleteProperty, isPending: deleting } = useDeleteProperty();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteProperty(id);
      queryClient.invalidateQueries({ queryKey: ['myProperties'] });
      addToast('Property permanently deleted.', 'success');
    } catch {
      addToast('Failed to delete property. It may have active bookings.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const properties = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Properties ({properties.length})</h1>
        <Link href="/admin/properties/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Add Property
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <Building2 className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties yet</h3>
          <p className="text-gray-400 mb-4">Add your first property to start receiving bookings.</p>
          <Link href="/admin/properties/create"><Button>Add Property</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property: any) => (
            <Card key={property.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-4 items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={property.images?.[0]?.thumbnailUrl || property.images?.[0]?.secureUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200'}
                      alt={property.title}
                      className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-semibold">{property.title}</h3>
                      <p className="text-gray-500 text-sm">{property.city} · {property.type} · {property.bedrooms} beds</p>
                      <p className="font-medium text-primary text-sm mt-1">MWK {Number(property.pricePerNight).toLocaleString()} / night</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={property.status === 'AVAILABLE' ? 'success' : property.status === 'HIDDEN' ? 'secondary' : 'warning'}>
                      {property.status}
                    </Badge>
                    <Link href={`/properties/${property.id}`} target="_blank">
                      <Button variant="ghost" size="icon" title="View public listing">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/properties/${property.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Edit property">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>

                    {/* ── Delete with AlertDialog ─────────────────── */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Delete property" disabled={deleting && deletingId === property.id}>
                          {deleting && deletingId === property.id
                            ? <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                            : <Trash2 className="w-4 h-4 text-red-500" />
                          }
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                              Delete Property?
                            </AlertDialogTitle>
                          </div>
                          <AlertDialogDescription className="text-gray-600 text-sm leading-relaxed pl-[52px]">
                            You're about to permanently delete{' '}
                            <span className="font-semibold text-gray-800">"{property.title}"</span>.
                            This action <span className="text-red-600 font-medium">cannot be undone</span> — all
                            photos and related data will be removed forever.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-2 gap-2">
                          <AlertDialogCancel className="flex-1">Keep Property</AlertDialogCancel>
                          <AlertDialogAction
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                            onClick={() => handleDelete(property.id)}
                          >
                            Yes, Delete Forever
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {/* ─────────────────────────────────────────────── */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
