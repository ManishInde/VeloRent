'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookingCard } from '@/components/bookings/BookingCard';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { useAuth } from '@/lib/auth/AuthContext';
import { getMyBookings } from '@/lib/api/bookings';
import { getCustomerRentals } from '@/lib/api/rentals';
import { getCustomerLoyalty } from '@/lib/api/loyalty';
import { getUserNotifications } from '@/lib/api/notifications';
import { getRecommendations } from '@/lib/api/recommendations';
import { Booking, Rental, LoyaltyAccount, Recommendation, Notification } from '@/types';
import {
  Car,
  Calendar,
  KeyRound,
  Award,
  ArrowRight,
  Search,
  Sparkles,
  Bell,
  CheckCircle2,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
  const [recentRentals, setRecentRentals] = useState<Rental[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
        setRecentRentals(rts.slice(0, 4));

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
    if (searchQuery.trim()) {
      router.push(`/customer/vehicles?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <AppShell>
        <PageHeader
          title={`Welcome back, ${user?.name || 'Customer'}`}
          description="Manage your vehicle rentals, upcoming reservations, loyalty rewards, and system alerts."
          action={
            <Link href="/customer/vehicles">
              <Button leftIcon={<Car className="w-4 h-4" />}>Browse Marketplace</Button>
            </Link>
          }
        />

        {/* Quick Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-xl">
            <Input
              placeholder="Quick search vehicles by brand, model, or type..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Active Rentals"
            value={isLoading ? '—' : activeRentals.length}
            subtitle={activeRentals.length > 0 ? 'Vehicle in use' : 'No active rental'}
            icon={<KeyRound className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            title="Upcoming Bookings"
            value={isLoading ? '—' : upcomingBookings.length}
            subtitle={upcomingBookings.length > 0 ? 'Confirmed reservations' : 'No upcoming bookings'}
            icon={<Calendar className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            title="Loyalty Points"
            value={isLoading ? '—' : loyalty ? `${loyalty.currentPoints.toLocaleString()}` : '0'}
            subtitle={loyalty ? `${loyalty.tier} tier balance` : 'Standard account'}
            icon={<Award className="w-5 h-5 text-amber-500" />}
          />
          <StatCard
            title="Unread Alerts"
            value={isLoading ? '—' : unreadNotifications.length}
            subtitle={unreadNotifications.length > 0 ? 'Requires attention' : "You're all caught up"}
            icon={<Bell className="w-5 h-5 text-indigo-500" />}
          />
        </div>

        {/* Active Rental Highlight Panel */}
        {activeRentals.length > 0 && (
          <div className="mb-8 p-5 bg-linear-to-r from-emerald-900 to-slate-900 text-white rounded-2xl shadow-xl border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-400 text-slate-950 tracking-wider">
                  Active Vehicle Check-Out
                </span>
                <h3 className="text-base font-bold mt-1">Rental #{activeRentals[0].id} is Active</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Started at {activeRentals[0].startDateTime || 'Recent'} • Start Odometer: {activeRentals[0].startOdometerKm.toLocaleString()} km
                </p>
              </div>
            </div>

            <Link href={`/customer/rentals/${activeRentals[0].id}`}>
              <Button size="sm" variant="primary" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Manage & Return Vehicle
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Upcoming Bookings
                </CardTitle>
                <Link href="/customer/bookings" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBookings.map((b) => (
                      <BookingCard key={b.id} booking={b} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Calendar className="w-8 h-8 text-slate-400" />}
                    title="No upcoming bookings"
                    description="Reserve a vehicle to get started."
                    action={
                      <Link href="/customer/vehicles">
                        <Button size="sm" variant="outline">
                          Browse Vehicles
                        </Button>
                      </Link>
                    }
                  />
                )}
              </CardContent>
            </Card>

            {/* Recent Rentals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  Recent Rental Activity
                </CardTitle>
                <Link href="/customer/rentals" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                {isLoading ? (
                  <Skeleton className="h-20 w-full rounded-lg" />
                ) : recentRentals.length > 0 ? (
                  <div className="space-y-2.5">
                    {recentRentals.map((r) => (
                      <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">Rental #{r.id}</span>
                          <p className="text-[11px] text-slate-500">Booking #{r.bookingId} • {r.startDateTime || 'Active'}</p>
                        </div>
                        <Link href={`/customer/rentals/${r.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No recent rentals.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Loyalty Widget */}
            <Card className="bg-slate-900 text-white border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Award className="w-8 h-8 text-amber-400" />
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {loyalty?.tier || 'BRONZE'}
                  </span>
                </div>
                <h3 className="text-base font-bold mt-4 tracking-tight">VeloRent Rewards</h3>
                <p className="text-xs text-slate-400 mt-0.5">Points earned automatically on completed rentals.</p>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Points Balance</span>
                  <span className="text-2xl font-extrabold text-amber-400 tabular-nums">
                    {loyalty?.currentPoints.toLocaleString() || 0}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                  <Link href="/customer/loyalty" className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1">
                    Loyalty Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Unread Notifications Box */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" /> System Alerts
                </CardTitle>
                <Link href="/customer/notifications" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                  Inbox
                </Link>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                {unreadNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {unreadNotifications.slice(0, 3).map((n) => (
                      <div key={n.id} className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs">
                        <p className="font-bold text-slate-900 leading-tight">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 truncate">{n.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">You&apos;re all caught up.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommended Vehicles */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Recommended Vehicles
              </h3>
              <Link href="/customer/vehicles" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.vehicle.id} recommendation={rec} />
              ))}
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
