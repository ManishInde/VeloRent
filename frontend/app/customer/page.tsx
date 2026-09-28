'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookingCard } from '@/components/bookings/BookingCard';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { useAuth } from '@/lib/auth/AuthContext';
import { getMyBookings } from '@/lib/api/bookings';
import { getCustomerRentals } from '@/lib/api/rentals';
import { getCustomerLoyalty } from '@/lib/api/loyalty';
import { getUserNotifications } from '@/lib/api/notifications';
import { getRecommendations } from '@/lib/api/recommendations';
import { getVehicleById } from '@/lib/api/vehicles';
import { Booking, Rental, LoyaltyAccount, Recommendation, Notification, Vehicle } from '@/types';
import {
  Car,
  Calendar,
  KeyRound,
  Award,
  ArrowRight,
  Search,
  Sparkles,
  Bell,
  Clock,
  Compass,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
  const [activeRentalVehicle, setActiveRentalVehicle] = useState<Vehicle | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const fetchDashboardData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [bookings, rts, loy, notifs, recs] = await Promise.all([
          getMyBookings(user.id).catch(() => []),
          getCustomerRentals(user.id).catch(() => []),
          getCustomerLoyalty(user.id).catch(() => null),
          getUserNotifications(user.id, true).catch(() => []),
          getRecommendations().catch(() => []),
        ]);

        if (!mounted) return;

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

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <AppShell>
        {/* Top Greeting Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
              VeloRent Marketplace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {getTimeGreeting()}, {user?.fullName || 'Customer'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Find and manage your next journey with intelligent fleet reservations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/customer/vehicles">
              <Button leftIcon={<Car className="w-4 h-4" />}>
                Browse All Vehicles
              </Button>
            </Link>
          </div>
        </div>

        {/* Discovery & Search Hero Banner */}
        <div className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20 mb-4">
              <Compass className="w-3.5 h-3.5" />
              <span>Smart Automotive Discovery</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2">
              Where will the road take you today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-6">
              Instant real-time quotes, verified vehicle health diagnostics, and seamless bookings.
            </p>

            {/* Quick Search Form */}
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1">
                  <Input
                    placeholder="Search by brand, model (e.g. Creta, Swift, BMW)..."
                    leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white focus:text-slate-900"
                  />
                </div>
                <Button type="submit" variant="primary" className="shrink-0">
                  Search Vehicles
                </Button>
              </div>

              {/* Category Quick Chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { label: 'All Fleet', value: '' },
                  { label: 'SUVs', value: 'SUV' },
                  { label: 'Sedans', value: 'Sedan' },
                  { label: 'Hatchbacks', value: 'Hatchback' },
                  { label: 'Luxury', value: 'Luxury' },
                  { label: 'Electric', value: 'Electric' },
                  { label: 'Bikes', value: 'Bike' },
                ].map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      router.push(
                        cat.value
                          ? `/customer/vehicles?category=${encodeURIComponent(cat.value)}`
                          : '/customer/vehicles'
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      selectedCategory === cat.value
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Quick Stat Overview Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
          <Card className="p-4 sm:p-5 border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Rentals</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
              {isLoading ? '—' : activeRentals.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeRentals.length > 0 ? 'Vehicle currently checked out' : 'No active checkout'}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Upcoming Bookings</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
              {isLoading ? '—' : upcomingBookings.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {upcomingBookings.length > 0 ? 'Confirmed reservations' : 'No reservations queued'}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Loyalty Balance</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
              {isLoading ? '—' : loyalty?.currentPoints.toLocaleString() || '0'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {loyalty ? `${loyalty.tier} tier benefits` : 'Bronze tier'}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Inbox Alerts</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
              {isLoading ? '—' : unreadNotifications.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {unreadNotifications.length > 0 ? 'Requires your attention' : 'All alerts caught up'}
            </p>
          </Card>
        </div>

        {/* Active Rental Spotlight */}
        {activeRentals.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" /> Current Active Rental
              </h3>
              <Link
                href={`/customer/rentals/${activeRentals[0].id}`}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                Full Rental Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Vehicle Photo */}
                <div className="relative aspect-[16/10] md:aspect-auto h-full min-h-[200px] bg-slate-900">
                  <VehicleImage
                    vehicle={activeRentalVehicle}
                    aspectRatio="auto"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                    Active Trip
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-lg font-bold text-slate-900">
                        {activeRentalVehicle
                          ? `${activeRentalVehicle.brand} ${activeRentalVehicle.model}`
                          : `Rental #${activeRentals[0].id}`}
                      </h4>
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        Booking #{activeRentals[0].bookingId}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Checkout Start
                        </span>
                        <span className="font-semibold text-slate-800 mt-0.5 block">
                          {activeRentals[0].startDateTime || 'Recently Checked Out'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Start Odometer
                        </span>
                        <span className="font-semibold text-slate-800 mt-0.5 block tabular-nums">
                          {activeRentals[0].startOdometerKm.toLocaleString()} km
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Trip Status
                        </span>
                        <span className="font-bold text-emerald-600 mt-0.5 block uppercase">
                          {activeRentals[0].status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Vehicle checked out. Return inspection and final odometer recording required at drop-off.
                    </span>
                    <Link href={`/customer/rentals/${activeRentals[0].id}`}>
                      <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Manage Rental
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Vehicles Section */}
        {recommendations.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Recommended For You
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curated recommendations based on popularity, category, and health scores.
                </p>
              </div>
              <Link
                href="/customer/vehicles"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                View Marketplace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.vehicle.id} recommendation={rec} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Bookings & Side Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Upcoming Bookings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Upcoming Reservations
                </CardTitle>
                <Link
                  href="/customer/bookings"
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  All Bookings <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBookings.map((b) => (
                      <BookingCard key={b.id} booking={b} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-slate-800">No Upcoming Reservations</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Reserve a vehicle from our marketplace for your upcoming travel plans.
                    </p>
                    <Link href="/customer/vehicles" className="inline-block mt-3">
                      <Button size="sm" variant="outline">
                        Browse Vehicles
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Widgets */}
          <div className="space-y-6">
            {/* Loyalty Widget */}
            <Card className="bg-slate-900 text-white border-slate-800 rounded-2xl overflow-hidden relative">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-400/30">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {loyalty?.tier || 'BRONZE'} TIER
                  </span>
                </div>

                <h3 className="text-base font-bold mt-4 tracking-tight">VeloRent Rewards</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Points earned automatically on completed rental checkouts.
                </p>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Points Balance</span>
                  <span className="text-2xl font-extrabold text-amber-400 tabular-nums">
                    {loyalty?.currentPoints.toLocaleString() || 0}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                  <Link
                    href="/customer/loyalty"
                    className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1"
                  >
                    View Loyalty Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>

            {/* Quick Alerts Widget */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" /> Notifications
                </CardTitle>
                <Link href="/customer/notifications" className="text-xs font-semibold text-blue-600 hover:underline">
                  Inbox
                </Link>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                {unreadNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {unreadNotifications.slice(0, 3).map((n) => (
                      <div key={n.id} className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 leading-tight">
                          <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{n.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">You are all caught up on system alerts.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
