import Link from 'next/link';
import { MapPin, Star, Bed, Bath, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PropertyImage {
  id: string;
  secureUrl: string;
  thumbnailUrl?: string | null;
}

export interface Property {
  id: string;
  title: string;
  pricePerNight: number;
  city: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  images: PropertyImage[];
  avgRating?: number;
  status?: string;
}

export function PropertyCard({ property }: { property: Property }) {
  const primaryImage =
    property.images && property.images.length > 0
      ? property.images[0].thumbnailUrl || property.images[0].secureUrl
      : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-green-50 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={property.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-primary/90 backdrop-blur text-white text-[11px] font-semibold rounded-full shadow">
            For Rent
          </span>
        </div>
        {/* Rating */}
        {property.avgRating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-2.5 py-1 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-gray-700">{property.avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Type + Location */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full capitalize">
            {property.type.toLowerCase()}
          </span>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            {property.city}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-3 group-hover:text-primary transition-colors">
          {property.title}
        </h3>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-primary/60" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-primary/60" />
            <span>{property.bathrooms} Baths</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="font-bold text-lg text-gray-900">
              MWK {Number(property.pricePerNight).toLocaleString()}
              <span className="text-sm font-normal text-gray-400"> /night</span>
            </p>
          </div>
          <Link href={`/properties/${property.id}`}>
            <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-semibold">
              Details →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
