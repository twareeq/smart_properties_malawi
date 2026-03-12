'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProperty } from '@/hooks/useProperties';
import { usePropertyReviews, useSubmitReview } from '@/hooks/useMessagesAndReviews';
import { useCreateBooking } from '@/hooks/useBookings';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Wifi, Car, Waves, Leaf, Shield, Bed, Bath, MapPin, Star, Calendar, MessageSquare, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

function AmenityBadge({ has, label, Icon }: { has: boolean; label: string; Icon: any }) {
  if (!has) return null;
  return (
    <div className="flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-100">
      <Icon className="w-4 h-4" /> {label}
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useToast();

  const { data: property, isLoading } = useProperty(id);
  const { data: reviews } = usePropertyReviews(id);

  const [activeImage, setActiveImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);

  const { mutateAsync: createBooking, isPending: bookingPending } = useCreateBooking();

  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!checkIn) {
      addToast('Please select a check-in date.', 'error');
      return;
    }
    try {
      const result = await createBooking({
        propertyId: id,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: checkOut ? new Date(checkOut).toISOString() : undefined,
        isFlexibleStay: isFlexible,
      });
      addToast('Booking created! Proceed to payment.', 'success');
      router.push('/dashboard/bookings');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Booking failed.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-96 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-full" /></div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return <div className="container mx-auto px-4 py-20 text-center"><p>Property not found.</p></div>;
  }

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const totalCost = nights * Number(property.pricePerNight);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8 rounded-2xl overflow-hidden h-96">
          <div className="md:col-span-2 row-span-2 h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={property.images[activeImage]?.secureUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}
              alt={property.title}
              className="object-cover w-full h-full cursor-pointer"
            />
          </div>
          {property.images.slice(1, 5).map((img: any, i: number) => (
            <div key={i} className="h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.secureUrl}
                alt={`${property.title} ${i + 2}`}
                className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setActiveImage(i + 1)}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Property Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                  <div className="flex items-center gap-2 text-gray-500 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{property.address}, {property.city}, {property.region}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{property.type}</Badge>
                  <Badge variant={property.status === 'AVAILABLE' ? 'success' : 'warning'}>{property.status}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 text-gray-600">
                <div className="flex items-center gap-2"><Bed className="w-5 h-5" /> <span>{property.bedrooms} Bedrooms</span></div>
                <div className="flex items-center gap-2"><Bath className="w-5 h-5" /> <span>{property.bathrooms} Bathrooms</span></div>
                {property.avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{property.avgRating?.toFixed(1)}</span>
                    <span className="text-gray-400">({reviews?.length || 0} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">About this property</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-3">
                <AmenityBadge has={property.isFurnished} label="Furnished" Icon={CheckCircle} />
                <AmenityBadge has={property.hasWiFi} label="WiFi" Icon={Wifi} />
                <AmenityBadge has={property.hasParking} label="Parking" Icon={Car} />
                <AmenityBadge has={property.hasPool} label="Swimming Pool" Icon={Waves} />
                <AmenityBadge has={property.hasGarden} label="Garden" Icon={Leaf} />
                <AmenityBadge has={property.hasSecurity} label="Security" Icon={Shield} />
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Reviews ({reviews?.length || 0})
              </h2>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <Card key={review.id} className="border-0 shadow-sm">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                            {review.tenant?.profile?.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{review.tenant?.profile?.firstName || 'Anonymous'}</p>
                            <div className="flex">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">MWK {Number(property.pricePerNight).toLocaleString()}</span>
                  <span className="text-sm font-normal text-gray-500">/ night</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Check-In Date</Label>
                  <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Check-Out Date</Label>
                    <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                      <input type="checkbox" checked={isFlexible} onChange={(e) => setIsFlexible(e.target.checked)} className="rounded" />
                      Flexible stay
                    </label>
                  </div>
                  {!isFlexible && (
                    <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split('T')[0]} />
                  )}
                </div>

                {nights > 0 && (
                  <div className="border rounded-lg p-3 space-y-1 text-sm bg-gray-50">
                    <div className="flex justify-between text-gray-600">
                      <span>MWK {Number(property.pricePerNight).toLocaleString()} × {nights} nights</span>
                      <span>MWK {totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>Total</span>
                      <span>MWK {totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <Button className="w-full h-12 text-base" onClick={handleBooking} disabled={bookingPending}>
                  {bookingPending ? 'Creating Booking...' : 'Reserve Property'}
                </Button>

                <Button variant="outline" className="w-full flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message Owner
                </Button>

                <p className="text-center text-xs text-gray-400">You won&apos;t be charged yet. Payment comes next.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
