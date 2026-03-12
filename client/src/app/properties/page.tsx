'use client';

import { useState } from 'react';
import { useProperties } from '@/hooks/useProperties';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';

const CITIES = ['Lilongwe', 'Blantyre', 'Zomba', 'Mangochi', 'Mzuzu', 'Salima', 'Karonga'];
const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'COMMERCIAL', 'LAND'];

export default function PropertiesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    hasWiFi: false,
    hasPool: false,
    page: 1,
    limit: 12,
  });

  const { data, isLoading, isError } = useProperties({
    search: filters.search || undefined,
    city: filters.city || undefined,
    type: filters.type || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
    hasWiFi: filters.hasWiFi || undefined,
    hasPool: filters.hasPool || undefined,
    page: filters.page,
    limit: filters.limit,
  });

  const properties = data?.data || [];
  const meta = data?.meta || {};

  const clearFilters = () => {
    setFilters({ search: '', city: '', type: '', minPrice: '', maxPrice: '', bedrooms: '', hasWiFi: false, hasPool: false, page: 1, limit: 12 });
  };

  const activeFilterCount = [filters.city, filters.type, filters.minPrice, filters.maxPrice, filters.bedrooms]
    .filter(Boolean).length + (filters.hasWiFi ? 1 : 0) + (filters.hasPool ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Properties</h1>
              {meta.total && <p className="text-gray-500 text-sm">{meta.total} properties available</p>}
            </div>
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title or city..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2 flex-shrink-0"
                onClick={() => setShowFilters((s) => !s)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3"
            >
              <Select value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value, page: 1 }))}>
                <option value="">All Cities</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value, page: 1 }))}>
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
              </Select>
              <Input placeholder="Min Price (MWK)" type="number" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value, page: 1 }))} />
              <Input placeholder="Max Price (MWK)" type="number" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value, page: 1 }))} />
              <Input placeholder="Min. Bedrooms" type="number" value={filters.bedrooms} onChange={(e) => setFilters((f) => ({ ...f, bedrooms: e.target.value, page: 1 }))} />
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={filters.hasWiFi} onChange={(e) => setFilters((f) => ({ ...f, hasWiFi: e.target.checked }))} className="rounded" />
                  WiFi
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={filters.hasPool} onChange={(e) => setFilters((f) => ({ ...f, hasPool: e.target.checked }))} className="rounded" />
                  Swimming Pool
                </label>
              </div>
              {activeFilterCount > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2 text-red-500 col-span-2 md:col-span-1">
                  <X className="w-4 h-4" /> Clear All
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">Failed to load properties. Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters.</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <Button
                  variant="outline"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={filters.page >= meta.totalPages}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
