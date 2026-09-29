'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { useAuth } from '@/lib/auth/AuthContext';
import { getMyBookings } from '@/lib/api/bookings';
import { getCustomerRentals } from '@/lib/api/rentals';
import { getCustomerLoyalty } from '@/lib/api/loyalty';
import { getUserNotifications } from '@/lib/api/notifications';
import { getRecommendations } from '@/lib/api/recommendations';
import { getVehicles, getVehicleById } from '@/lib/api/vehicles';
import { Booking, Rental, LoyaltyAccount, Recommendation, Notification, Vehicle } from '@/types';
import {
  Calendar,
  ArrowRight,
  Search,
  Bell,
} from 'lucide-react';

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
};

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
  const [activeRentalVehicle, setActiveRentalVehicle] = useState<Vehicle | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [bookingVehicles, setBookingVehicles] = useState<Map<number, Vehicle>>(new Map());
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showcaseVehicles, setShowcaseVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const fetchDashboardData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [bookings, rts, loy, notifs, recs, allVehicles] = await Promise.all([
          getMyBookings(user.id).catch(() => []),
          getCustomerRentals(user.id).catch(() => []),
          getCustomerLoyalty(user.id).catch(() => null),
          getUserNotifications(user.id, true).catch(() => []),
          getRecommendations().catch(() => []),
          getVehicles({ status: 'AVAILABLE' }).catch(() => []),
        ]);

        if (!mounted) return;

        const vMap = new Map<number, Vehicle>();
        allVehicles.forEach((v) => vMap.set(v.id, v));
        setBookingVehicles(vMap);

        setShowcaseVehicles(allVehicles.slice(0, 3));

        setUpcomingBookings(
          bookings
            .filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING')
            .sort((a, b) => b.id - a.id)
            .slice(0, 3)
        );

        const active = rts.filter((r) => r.status === 'ACTIVE');
        setActiveRentals(active);

        // Fetch vehicle for active rental if present
        if (active.length > 0) {
          const matchingBooking = bookings.find((b) => b.id === active[0].bookingId);
          if (matchingBooking?.vehicleId) {
            getVehicleById(matchingBooking.vehicleId)
              .then((v) => {
                if (mounted) setActiveRentalVehicle(v);
              })
              .catch(() => {});
          }
        }

        setLoyalty(loy);
        setUnreadNotifications(notifs);
        setRecommendations(recs.slice(0, 4));
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    router.push(`/customer/vehicles?${params.toString()}`);
  };

  const featuredCar = showcaseVehicles[0] || (recommendations[0]?.vehicle);
  const secondaryCar1 = showcaseVehicles[1] || (recommendations[1]?.vehicle);
  const secondaryCar2 = showcaseVehicles[2] || (recommendations[2]?.vehicle);

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <AppShell>
        {/* Editorial Subheader Brand Track */}
        <div className="flex items-center justify-between border-b border-[#111111]/15 pb-3 mb-8">
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-xs tracking-[0.25em] text-[#111111] uppercase">
              VEL O RENT
            </span>
            <span className="text-[#888880] font-mono text-xs">/</span>
            <span className="font-display text-xs font-bold tracking-wider text-[#777770] uppercase">
              01 / DISCOVER
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[#777770]">
            <span>DRIVER:</span>
            <span className="font-bold text-[#111111] uppercase">
              {user?.fullName || 'CUSTOMER'}
            </span>
            <span className="text-[#C7F000] bg-[#111111] px-1 text-[9px] font-black">
              {isLoading ? 'SYNCING' : 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Big Editorial Hero Section */}
        <section className="mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Big Bold Typography & CTA */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="micro-tag text-[#777770] block mb-2">
                  CURATED AUTOMOTIVE EDITORIAL
                </span>

                <h1 className="editorial-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#111111]">
                  FIND<br />
                  YOUR<br />
                  NEXT<br />
                  RIDE.
                </h1>

                <p className="text-sm md:text-base text-[#555550] mt-4 font-mono leading-relaxed max-w-md">
                  Cars, bikes and SUVs ready when you are. Verified vehicle diagnostics, real-time pricing engine, and instant keys.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/customer/vehicles">
                    <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      EXPLORE VEHICLES
                    </Button>
                  </Link>

                  <Link href="/customer/bookings">
                    <Button size="lg" variant="outline">
                      VIEW BOOKINGS
                    </Button>
                  </Link>
                </div>

                {/* Micro Search Input */}
                <form onSubmit={handleSearch} className="pt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="QUICK SEARCH (E.G. CRETA, BMW, NEXON)..."
                        leftIcon={<Search className="w-4 h-4 text-[#777770]" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="font-mono text-xs uppercase"
                      />
                    </div>
                    <Button type="submit" variant="secondary" size="md">
                      GO
                    </Button>
                  </div>

                  {/* Category Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {[
                      { label: 'ALL LOT', val: '' },
                      { label: 'SUV', val: 'SUV' },
                      { label: 'SEDAN', val: 'Sedan' },
                      { label: 'LUXURY', val: 'Luxury' },
                      { label: 'ELECTRIC', val: 'Electric' },
                    ].map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.val);
                          router.push(
                            cat.val
                              ? `/customer/vehicles?category=${encodeURIComponent(cat.val)}`
                              : '/customer/vehicles'
                          );
                        }}
                        className={`px-2.5 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider transition-all border ${
                          selectedCategory === cat.val
                            ? 'bg-[#111111] text-[#C7F000] border-[#111111]'
                            : 'bg-white text-[#555550] border-[#111111]/20 hover:border-[#111111] hover:text-[#111111]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Major Vehicle Photography Region */}
            <div className="lg:col-span-7 bg-[#111111] text-white p-3 sm:p-4 border border-[#111111] shadow-[4px_4px_0px_#111111] relative flex flex-col justify-between overflow-hidden min-h-[380px] sm:min-h-[460px]">
              {/* Photo Display */}
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-[#161614] overflow-hidden">
                <VehicleImage
                  vehicle={featuredCar}
                  aspectRatio="auto"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  priority={true}
                />
                {/* Micro tags overlay */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className="bg-[#C7F000] text-[#111111] font-display font-extrabold text-[9px] px-2 py-0.5 uppercase tracking-widest border border-[#111111]">
                    FEATURED VEHICLE
                  </span>
                  <span className="bg-[#111111]/90 text-white font-mono text-[9px] px-2 py-0.5 uppercase tracking-wider border border-white/20">
                    AVAILABLE NOW
                  </span>
                </div>

                <div className="absolute top-3 right-3 z-10 bg-[#111111]/90 text-[#C7F000] font-mono text-[10px] px-2.5 py-1 border border-white/10">
                  HEALTH {featuredCar?.healthScore || 94}%
                </div>
              </div>

              {/* Bottom Strip of Hero Frame */}
              <div className="pt-3 px-1 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
                <div>
                  <span className="micro-tag text-[#888880] block">
                    {featuredCar?.brand || 'HYUNDAI'}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-0.5">
                    {featuredCar?.model || 'CRETA SX'}
                  </h3>
                  <p className="text-[11px] font-mono text-[#AAA8A0] mt-0.5">
                    {featuredCar?.transmission || 'AUTOMATIC'} • {featuredCar?.fuelType || 'PETROL'} • {featuredCar?.seats || 5} SEATER
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-[#888880] block">
                      STARTING FROM
                    </span>
                    <span className="font-display text-xl sm:text-2xl font-black text-[#C7F000]">
                      {featuredCar ? formatINR(featuredCar.baseRentalRate) : '₹3,200'}
                      <span className="text-xs text-white font-mono font-normal"> /day</span>
                    </span>
                  </div>

                  <Link href={featuredCar ? `/customer/vehicles/${featuredCar.id}` : '/customer/vehicles'}>
                    <Button variant="primary" size="sm">
                      INSPECT
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Rental / Garage Spotlight */}
        {activeRentals.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between border-b border-[#111111]/20 pb-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#C7F000] border border-[#111111] animate-pulse" />
                <h3 className="font-display text-base font-extrabold uppercase tracking-tight text-[#111111]">
                  YOUR CURRENT RIDE — ON THE ROAD
                </h3>
              </div>
              <Link
                href={`/customer/rentals/${activeRentals[0].id}`}
                className="micro-tag text-[#111111] hover:underline flex items-center gap-1 font-bold"
              >
                MANAGE TRIP <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="relative aspect-[16/10] bg-[#111111] overflow-hidden border border-[#111111]/20">
                <VehicleImage
                  vehicle={activeRentalVehicle}
                  aspectRatio="auto"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-[#C7F000] text-[#111111] text-[9px] font-display font-black px-2 py-0.5 uppercase tracking-widest border border-[#111111]">
                  CHECKED OUT
                </span>
              </div>

              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="micro-tag text-[#777770]">RENTAL #{activeRentals[0].id}</span>
                    <span className="font-mono text-xs font-semibold text-[#888880]">
                      BOOKING #{activeRentals[0].bookingId}
                    </span>
                  </div>

                  <h4 className="font-display text-2xl font-black uppercase text-[#111111] mt-1">
                    {activeRentalVehicle ? `${activeRentalVehicle.brand} ${activeRentalVehicle.model}` : 'ACTIVE RENTAL'}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
                    <div className="p-3 bg-[#FAF8F5] border border-[#111111]/15">
                      <span className="text-[9px] text-[#888880] uppercase block">START TIME</span>
                      <span className="font-bold text-[#111111] mt-0.5 block truncate">
                        {activeRentals[0].startDateTime || 'CHECKED OUT'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF8F5] border border-[#111111]/15">
                      <span className="text-[9px] text-[#888880] uppercase block">START ODOMETER</span>
                      <span className="font-bold text-[#111111] mt-0.5 block tabular-nums">
                        {activeRentals[0].startOdometerKm.toLocaleString()} KM
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF8F5] border border-[#111111]/15">
                      <span className="text-[9px] text-[#888880] uppercase block">STATUS</span>
                      <span className="font-extrabold text-[#111111] bg-[#C7F000] px-1 mt-0.5 inline-block">
                        {activeRentals[0].status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#111111]/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#666660]">
                    Drop-off requires recording final odometer reading.
                  </span>
                  <Link href={`/customer/rentals/${activeRentals[0].id}`}>
                    <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      RETURN VEHICLE
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 01 / ON THE LOT — Asymmetric Editorial Showcase */}
        <section className="mb-14">
          <div className="flex items-center justify-between border-b border-[#111111]/20 pb-2 mb-6">
            <div>
              <span className="micro-tag text-[#777770] block">01 / SHOWCASE</span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#111111]">
                ON THE LOT
              </h2>
            </div>
            <Link
              href="/customer/vehicles"
              className="font-display text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#7657FF] flex items-center gap-1"
            >
              FULL CATALOGUE <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Asymmetric composition: 1 Large Car + 2 Stacked Smaller Cars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Large Featured Car (Spans 7 cols) */}
            {featuredCar && (
              <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#111111]/25 hover:border-[#111111] shadow-[2px_2px_0px_rgba(17,17,17,0.06)] hover:shadow-[4px_4px_0px_#111111] transition-all flex flex-col justify-between overflow-hidden group">
                <div className="relative aspect-[16/10] bg-[#111111] overflow-hidden">
                  <VehicleImage
                    vehicle={featuredCar}
                    aspectRatio="auto"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <span className="bg-[#111111] text-[#C7F000] border border-[#111111] font-display text-[9px] font-black px-2 py-0.5 uppercase tracking-widest">
                      SHOT 01
                    </span>
                    <VehicleStatusBadge status={featuredCar.status} />
                  </div>
                  <div className="absolute bottom-3 left-3 z-10 bg-[#111111]/90 text-white font-mono text-[10px] px-2 py-0.5 border border-white/10">
                    LOT SPECIMEN #{String(featuredCar.id).padStart(2, '0')}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#888880] mb-1">
                    <span>{featuredCar.type}</span>
                    <span>PURCHASE {featuredCar.purchaseYear}</span>
                  </div>

                  <span className="micro-tag text-[#777770] block">{featuredCar.brand}</span>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight text-[#111111] mt-0.5">
                    {featuredCar.model}
                  </h3>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-y border-[#111111]/10 py-2.5 font-mono text-xs text-[#555550]">
                    <div>
                      <span className="text-[8px] text-[#999990] block">TRANSMISSION</span>
                      <span className="font-bold text-[#111111]">{featuredCar.transmission}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-[#999990] block">FUEL SYSTEM</span>
                      <span className="font-bold text-[#111111]">{featuredCar.fuelType}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-[#999990] block">HEALTH SCORE</span>
                      <span className="font-bold text-[#111111]">{featuredCar.healthScore}%</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-[#888880] uppercase block">DAILY RATE</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-2xl font-black text-[#111111]">
                          {formatINR(featuredCar.baseRentalRate)}
                        </span>
                        <span className="text-xs font-mono text-[#777770]">/day</span>
                      </div>
                    </div>

                    <Link href={`/customer/vehicles/${featuredCar.id}`}>
                      <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        VIEW VEHICLE
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Stack of 2 Smaller Cars (Spans 5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {secondaryCar1 && (
                <div className="bg-[#FFFFFF] border border-[#111111]/25 hover:border-[#111111] shadow-[2px_2px_0px_rgba(17,17,17,0.06)] hover:shadow-[4px_4px_0px_#111111] transition-all flex flex-col sm:flex-row overflow-hidden group">
                  <div className="relative sm:w-2/5 aspect-[16/10] sm:aspect-auto bg-[#111111] overflow-hidden shrink-0">
                    <VehicleImage
                      vehicle={secondaryCar1}
                      aspectRatio="auto"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-[#111111] text-white text-[8px] font-mono px-1.5 py-0.5 uppercase">
                      SHOT 02
                    </span>
                  </div>
                  <div className="p-4 sm:w-3/5 flex flex-col justify-between">
                    <div>
                      <span className="micro-tag text-[#888880]">{secondaryCar1.brand}</span>
                      <h4 className="font-display text-lg font-black uppercase text-[#111111] line-clamp-1">
                        {secondaryCar1.model}
                      </h4>
                      <p className="text-[10px] font-mono text-[#777770] mt-1">
                        {secondaryCar1.fuelType} • {secondaryCar1.transmission}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#111111]/10 flex items-center justify-between">
                      <span className="font-display text-base font-black text-[#111111]">
                        {formatINR(secondaryCar1.baseRentalRate)}<span className="text-[10px] font-normal text-[#888880]">/d</span>
                      </span>
                      <Link href={`/customer/vehicles/${secondaryCar1.id}`}>
                        <Button size="sm" variant="outline">
                          DETAILS
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {secondaryCar2 && (
                <div className="bg-[#FFFFFF] border border-[#111111]/25 hover:border-[#111111] shadow-[2px_2px_0px_rgba(17,17,17,0.06)] hover:shadow-[4px_4px_0px_#111111] transition-all flex flex-col sm:flex-row overflow-hidden group">
                  <div className="relative sm:w-2/5 aspect-[16/10] sm:aspect-auto bg-[#111111] overflow-hidden shrink-0">
                    <VehicleImage
                      vehicle={secondaryCar2}
                      aspectRatio="auto"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-[#111111] text-white text-[8px] font-mono px-1.5 py-0.5 uppercase">
                      SHOT 03
                    </span>
                  </div>
                  <div className="p-4 sm:w-3/5 flex flex-col justify-between">
                    <div>
                      <span className="micro-tag text-[#888880]">{secondaryCar2.brand}</span>
                      <h4 className="font-display text-lg font-black uppercase text-[#111111] line-clamp-1">
                        {secondaryCar2.model}
                      </h4>
                      <p className="text-[10px] font-mono text-[#777770] mt-1">
                        {secondaryCar2.fuelType} • {secondaryCar2.transmission}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#111111]/10 flex items-center justify-between">
                      <span className="font-display text-base font-black text-[#111111]">
                        {formatINR(secondaryCar2.baseRentalRate)}<span className="text-[10px] font-normal text-[#888880]">/d</span>
                      </span>
                      <Link href={`/customer/vehicles/${secondaryCar2.id}`}>
                        <Button size="sm" variant="outline">
                          DETAILS
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Lower Row: Membership Pass & Reservations Ledger Preview */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Membership Pass Card (Spans 5 cols) */}
          <div className="lg:col-span-5 bg-[#111111] text-[#F4F1EA] border-2 border-[#111111] shadow-[4px_4px_0px_#7657FF] p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-[#2E2E2A] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#C7F000] text-[#111111] font-display font-black text-[10px] flex items-center justify-center">
                    VR
                  </div>
                  <span className="micro-tag text-white tracking-[0.25em]">
                    MEMBERSHIP PASS
                  </span>
                </div>
                <span className="font-display text-xs font-black bg-[#7657FF] text-white px-2 py-0.5 uppercase tracking-wider">
                  {loyalty?.tier || 'BRONZE'} TIER
                </span>
              </div>

              <span className="micro-tag text-[#888880] block">REWARD ACCRUAL</span>
              <div className="mt-1 flex items-baseline justify-between">
                <div className="font-display text-4xl sm:text-5xl font-black text-[#C7F000] tracking-tight">
                  {loyalty ? loyalty.currentPoints.toLocaleString() : '0'}
                  <span className="text-xs font-mono text-[#AAA8A0] font-normal ml-1">PTS</span>
                </div>
              </div>

              <div className="mt-5 space-y-1.5 font-mono text-xs text-[#AAA8A0] border-t border-[#2E2E2A] pt-4">
                <div className="flex justify-between">
                  <span>MEMBER:</span>
                  <span className="text-white font-bold uppercase">{user?.fullName || 'CUSTOMER'}</span>
                </div>
                <div className="flex justify-between">
                  <span>DRIVER ID:</span>
                  <span className="text-white">#{user?.id || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>BENEFIT:</span>
                  <span className="text-[#C7F000]">
                    {loyalty?.tier === 'PLATINUM' ? '15% OFF ALL TRIPS' : loyalty?.tier === 'GOLD' ? '10% OFF ALL TRIPS' : loyalty?.tier === 'SILVER' ? '5% OFF ALL TRIPS' : 'STANDARD ACCRUAL'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#2E2E2A] flex items-center justify-between relative z-10">
              <span className="text-[10px] font-mono text-[#888880]">PASS VERIFIED 2026</span>
              <Link href="/customer/loyalty">
                <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  REWARDS
                </Button>
              </Link>
            </div>
          </div>

          {/* Bookings / Upcoming Reservations Ledger (Spans 7 cols) */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#111111]/25 p-6 shadow-[2px_2px_0px_rgba(17,17,17,0.06)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#111111]/10 pb-3 mb-4">
                <div>
                  <span className="micro-tag text-[#777770] block">03 / RESERVATIONS</span>
                  <h3 className="font-display text-lg font-black uppercase text-[#111111]">
                    UPCOMING TRIPS
                  </h3>
                </div>
                <Link
                  href="/customer/bookings"
                  className="font-display text-xs font-bold uppercase text-[#111111] hover:text-[#7657FF] flex items-center gap-1"
                >
                  FULL LEDGER <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBookings.map((b, idx) => {
                    const v = bookingVehicles.get(b.vehicleId);
                    return (
                      <Link
                        key={b.id}
                        href={`/customer/bookings/${b.id}`}
                        className="block p-3.5 bg-[#FAF8F5] border border-[#111111]/15 hover:border-[#111111] transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-display font-black text-sm text-[#888880] w-6">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h4 className="font-display text-sm font-bold text-[#111111] uppercase group-hover:text-[#7657FF] transition-colors">
                                {v ? `${v.brand} ${v.model}` : `BOOKING #${b.id}`}
                              </h4>
                              <p className="text-[10px] font-mono text-[#777770]">
                                {formatDate(b.startDate)} — {formatDate(b.endDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-display font-black text-sm text-[#111111]">
                              {formatINR(b.totalPrice)}
                            </span>
                            <span className="micro-tag bg-[#C7F000] text-[#111111] px-1.5 py-0.5 border border-[#111111]">
                              {b.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#FAF8F5] border border-[#111111]/10">
                  <Calendar className="w-8 h-8 text-[#888880] mx-auto mb-2" />
                  <p className="font-display text-sm font-bold text-[#111111] uppercase">
                    NO UPCOMING RESERVATIONS
                  </p>
                  <p className="text-xs font-mono text-[#777770] mt-1">
                    Select a vehicle from our lot to lock in dynamic pricing.
                  </p>
                  <Link href="/customer/vehicles" className="inline-block mt-4">
                    <Button size="sm" variant="primary">
                      BROWSE LOT
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Micro alert ticker */}
            {unreadNotifications.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#111111]/10 flex items-center justify-between text-xs font-mono text-[#555550]">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-[#7657FF]" />
                  <span>{unreadNotifications.length} UNREAD ALERT{unreadNotifications.length > 1 ? 'S' : ''} IN INBOX</span>
                </div>
                <Link href="/customer/notifications" className="text-[#111111] font-bold hover:underline">
                  OPEN INBOX &rarr;
                </Link>
              </div>
            )}
          </div>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
