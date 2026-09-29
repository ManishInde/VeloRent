'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCustomerById } from '@/lib/api/customers';
import { Customer } from '@/types';
import { Mail, Phone, ShieldCheck, KeyRound, Info, AlertCircle, Award, Star } from 'lucide-react';

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProfileData = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const customer = await getCustomerById(user.id);
        if (mounted) setProfile(customer);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load profile details.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProfileData();
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <AppShell>
        {/* Editorial Driver Header */}
        <div className="mb-8 border-b border-[#111111]/15 pb-6">
          <span className="micro-tag text-[#777770] block mb-1">
            01 / DRIVER DOSSIER
          </span>
          <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
            DRIVER IDENTITY
          </h1>
          <p className="text-sm text-[#555550] font-mono mt-1 max-w-xl">
            Verified driver identity card, license verification, and account telemetry.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 max-w-4xl">
            <Skeleton className="h-64 w-full rounded-none" />
            <Skeleton className="h-44 w-full rounded-none" />
          </div>
        ) : profile || user ? (
          <div className="max-w-4xl space-y-8">
            {/* Driver Identity Card */}
            <div className="bg-[#111111] text-[#F4F1EA] border-2 border-[#111111] shadow-[6px_6px_0px_#111111] p-6 sm:p-8 relative overflow-hidden font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2E2E2A] gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#C7F000] text-[#111111] font-display font-black text-2xl flex items-center justify-center border border-[#111111] shrink-0">
                    {(profile?.fullName || user?.fullName || 'VR')
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="micro-tag text-[#C7F000]">VERIFIED DRIVER</span>
                      <span className="text-[#888880]">•</span>
                      <span className="text-[10px] text-[#AAA8A0]">ID #{profile?.id || user?.id}</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white mt-0.5">
                      {profile?.fullName || user?.fullName}
                    </h2>
                  </div>
                </div>

                <div>
                  <span className="font-display text-xs font-black bg-[#C7F000] text-[#111111] px-3 py-1 uppercase tracking-wider">
                    {user?.role || 'CUSTOMER'}
                  </span>
                </div>
              </div>

              {/* Identity Telemetry Grid */}
              <div className="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs border-b border-[#2E2E2A]">
                <div className="p-3 bg-[#1C1C1A] border border-[#2E2E2A]">
                  <span className="text-[9px] text-[#888880] uppercase block flex items-center gap-1.5 mb-1">
                    <Mail className="w-3.5 h-3.5 text-[#AAA8A0]" /> EMAIL ADDRESS
                  </span>
                  <p className="text-white font-bold truncate">{profile?.email || user?.email}</p>
                </div>

                <div className="p-3 bg-[#1C1C1A] border border-[#2E2E2A]">
                  <span className="text-[9px] text-[#888880] uppercase block flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-[#AAA8A0]" /> TELEPHONE
                  </span>
                  <p className="text-white font-bold">{profile?.phone || 'VERIFIED ON FILE'}</p>
                </div>

                <div className="p-3 bg-[#1C1C1A] border border-[#2E2E2A]">
                  <span className="text-[9px] text-[#888880] uppercase block flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C7F000]" /> ACCOUNT STATUS
                  </span>
                  <p className="text-[#C7F000] font-bold uppercase">{profile?.accountStatus || 'ACTIVE'}</p>
                </div>

                <div className="p-3 bg-[#1C1C1A] border border-[#2E2E2A]">
                  <span className="text-[9px] text-[#888880] uppercase block flex items-center gap-1.5 mb-1">
                    <KeyRound className="w-3.5 h-3.5 text-[#AAA8A0]" /> TOTAL COMPLETED
                  </span>
                  <p className="text-white font-bold tabular-nums">{profile?.totalRentals ?? 0} TRIPS</p>
                </div>
              </div>

              {/* License Strip */}
              <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-[9px] text-[#888880] uppercase block">MOTOR DRIVING LICENSE</span>
                  <span className="font-display font-bold text-sm text-white tracking-widest">
                    {profile?.drivingLicenseNumber || 'DL-2024-VELORENT-VERIFIED'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#888880] uppercase block">VALIDITY PERIOD</span>
                  <span className="text-[#AAA8A0] font-bold">{profile?.licenseExpiry || '2030-01-01'}</span>
                </div>
              </div>
            </div>

            {/* Quick Links To Driver Subsystems */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/customer/rentals" className="p-5 bg-[#FFFFFF] border border-[#111111]/25 hover:border-[#111111] shadow-[2px_2px_0px_rgba(17,17,17,0.06)] hover:shadow-[4px_4px_0px_#111111] transition-all group block">
                <KeyRound className="w-5 h-5 text-[#111111] mb-2" />
                <h4 className="font-display font-bold text-sm uppercase text-[#111111] group-hover:text-[#7657FF] transition-colors">
                  01 / YOUR GARAGE
                </h4>
                <p className="text-[11px] font-mono text-[#666660] mt-1">
                  Active checkouts & drop-offs &rarr;
                </p>
              </Link>

              <Link href="/customer/loyalty" className="p-5 bg-[#FFFFFF] border border-[#111111]/25 hover:border-[#111111] shadow-[2px_2px_0px_rgba(17,17,17,0.06)] hover:shadow-[4px_4px_0px_#111111] transition-all group block">
                <Award className="w-5 h-5 text-[#111111] mb-2" />
                <h4 className="font-display font-bold text-sm uppercase text-[#111111] group-hover:text-[#7657FF] transition-colors">
                  02 / MEMBERSHIP PASS
                </h4>
                <p className="text-[11px] font-mono text-[#666660] mt-1">
                  Points, tiers & discount benefits &rarr;
                </p>
              </Link>

              <Link href="/customer/reviews" className="p-5 bg-[#FFFFFF] border border-[#111111]/25 hover:border-[#111111] shadow-[2px_2px_0px_rgba(17,17,17,0.06)] hover:shadow-[4px_4px_0px_#111111] transition-all group block">
                <Star className="w-5 h-5 text-[#111111] mb-2" />
                <h4 className="font-display font-bold text-sm uppercase text-[#111111] group-hover:text-[#7657FF] transition-colors">
                  03 / RIDE REVIEWS
                </h4>
                <p className="text-[11px] font-mono text-[#666660] mt-1">
                  Ratings on completed journeys &rarr;
                </p>
              </Link>
            </div>

            {/* Read-Only Registry Notice */}
            <div className="p-4 bg-[#FAF8F5] border border-[#111111]/25 text-xs font-mono text-[#666660] flex items-start gap-3">
              <Info className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
              <span>
                <strong>CUSTOMER REGISTRY POLICY:</strong> Profile information and driving license credentials are verified against the VeloRent central registry. Identity updates require authorized administrative confirmation.
              </span>
            </div>
          </div>
        ) : null}
      </AppShell>
    </ProtectedRoute>
  );
}
