'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FavoritesPage() {
  // In production, fetch from backend favorites endpoint
  const favorites: any[] = [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Saved Properties</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <Heart className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved properties</h3>
          <p className="text-gray-500 mb-4">Click the heart icon on any property to save it for later.</p>
          <Link href="/properties"><Button>Explore Properties</Button></Link>
        </div>
      ) : null}
    </div>
  );
}
