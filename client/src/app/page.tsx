'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Home, Building2, Trees, ChevronRight, Star, Shield, Calendar, MessageSquare } from 'lucide-react';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useProperties } from '@/hooks/useProperties';
import { usePublicStats } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

const CITIES = [
  { name: 'Lilongwe', count: '120+ listings', icon: '🏙️' },
  { name: 'Blantyre', count: '95+ listings', icon: '🌆' },
  { name: 'Mangochi', count: '40+ listings', icon: '🏖️' },
  { name: 'Zomba', count: '28+ listings', icon: '🌳' },
];

export default function HomePage() {
  const [searchType, setSearchType] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchType) params.append('type', searchType);
    if (searchLocation) params.append('city', searchLocation);
    router.push(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const { data: propertiesData, isLoading: propertiesLoading } = useProperties({ limit: 3 });
  const { data: stats, isLoading: statsLoading } = usePublicStats();
  
  const properties = propertiesData?.data || [];

  const displayStats = [
    { label: 'Satisfied Clients', value: stats ? `${stats.satisfactionRate}%` : '100%' },
    { label: 'Property Sells', value: stats ? `${stats.propertySells}+` : '500+' },
    { label: 'Cities & Locations', value: stats ? `${stats.citiesCount}+` : '9+' },
    { label: 'Positive Reviews', value: stats ? `${stats.positiveReviews}+` : '200+' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-[680px] flex items-center justify-center overflow-hidden">
        {/* BG image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1920")' }}
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/30 z-10" />

        {/* Content */}
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto pt-20 space-y-6">
          {/* Tags */}
          <div className="flex justify-center gap-3 flex-wrap">
            {['House', 'Apartment', 'Residential'].map(tag => (
              <span key={tag} className="px-4 py-1.5 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-balance">
            Build Your Future,<br />
            <span className="text-green-300">One Property</span> at a Time.
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Discover, secure, and manage your dream property in Malawi with ease.
          </p>

          {/* Search bar */}
          <div className="mt-8 bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row items-stretch gap-2 max-w-3xl mx-auto text-gray-900">
            <div className="flex items-center flex-1 px-4 border-r border-gray-200">
              <Home className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
              <select 
                className="bg-transparent w-full outline-none text-sm text-gray-600 py-3"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="">Property Type</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
            <div className="flex items-center flex-1 px-4 border-r border-gray-200">
              <MapPin className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
              <select 
                className="bg-transparent w-full outline-none text-sm text-gray-600 py-3"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              >
                <option value="">Location</option>
                {['Lilongwe', 'Blantyre', 'Zomba', 'Mangochi', 'Mzuzu'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Button size="lg" className="w-full md:w-auto rounded-xl px-8 py-6 h-auto text-base bg-primary hover:bg-primary/90 shadow-md" onClick={handleSearch}>
              <Search className="w-5 h-5 mr-2" />
              Search Properties
            </Button>
          </div>

          {/* quick filters */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <span className="text-white/60 text-sm">Filter:</span>
            {['Apartment', 'House', 'Villa', 'Commercial'].map(f => (
              <Link href={`/properties?type=${f.toUpperCase()}`} key={f}>
                <span className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs text-white cursor-pointer transition-colors">
                  {f}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-green-100 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-green-100">
            {displayStats.map(stat => (
              <div key={stat.label} className="text-center py-2 px-4">
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-20 mx-auto" />
                    <Skeleton className="h-3 w-24 mx-auto" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl md:text-3xl font-extrabold text-primary">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROPERTIES ───────────────────────────────── */}
      <section className="py-20 px-4 container mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Top Picks</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Our premier houses</h2>
            <p className="text-gray-500 max-w-sm">Thoughtfully selected listings with exceptional quality and prime locations.</p>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="hidden md:flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5">
              See All Properties <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {propertiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl">
            <p className="text-gray-500">No premier houses highlighted right now.</p>
          </div>
        )}

        <div className="text-center mt-8 md:hidden">
          <Link href="/properties">
            <Button variant="outline" className="border-primary/30 text-primary">
              See All Properties <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── EXPLORE CITIES ────────────────────────────────────── */}
      <section className="bg-secondary/40 py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Explore</p>
            <h2 className="text-3xl font-bold text-gray-900">Discover properties with the best value</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">From minimalist interiors to compact solutions — properties proving that great homes come in every size.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CITIES.map(city => (
              <Link href={`/properties?city=${city.name}`} key={city.name}>
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-green-100 group cursor-pointer">
                  <span className="text-3xl mb-3 block">{city.icon}</span>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{city.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{city.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY SMART PROPERTIES MALAWI ──────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Why Choose Us</p>
            <h2 className="text-3xl font-bold text-gray-900">Your primary home might begin to feel left out.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure Payments',
                desc: 'Pay safely through PayChangu with digital receipts and zero fraud risk.',
                color: 'bg-green-100 text-green-700',
              },
              {
                icon: Calendar,
                title: 'Flexible Bookings',
                desc: 'Fixed-date or open-ended stays. Extend easily or request a refund if plans change.',
                color: 'bg-sky-100 text-sky-700',
              },
              {
                icon: MessageSquare,
                title: 'Direct Messaging',
                desc: 'Chat directly with verified property owners in a secure, in-app messaging system.',
                color: 'bg-amber-100 text-amber-700',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg border border-green-50 hover:border-primary/20 transition-all">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────────── */}
      <section className="mx-4 md:mx-auto container mb-16">
        <div
          className="rounded-3xl overflow-hidden relative flex items-center justify-between px-8 md:px-16 py-16 min-h-[240px]"
          style={{ background: 'linear-gradient(135deg, hsl(142, 43%, 22%) 0%, hsl(152, 38%, 35%) 100%)' }}
        >
          <div className="relative z-10 text-white max-w-lg">
            <h2 className="text-3xl font-bold mb-3">Big things can happen in small spaces.</h2>
            <p className="text-white/80 mb-6">Whether it's a cozy corner or a sprawling estate — find the space that fits your life.</p>
            <Link href="/properties">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                Explore Properties <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
          <div className="absolute right-24 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        </div>
      </section>
    </div>
  );
}
