'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { RoleBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCustomerById } from '@/lib/api/customers';
import { Customer } from '@/types';
import { Mail, Phone, ShieldCheck, KeyRound, Info, AlertCircle } from 'lucide-react';

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
        <PageHeader
          title="User Profile & Verification"
          description="View your registered customer credentials, contact information, and license verification details."
        />

        {/* Read-Only Notice */}
        <div className="mb-6 p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-slate-900 font-bold mb-0.5">Verified Profile Information:</strong>
            Your profile details and driving license credentials are verified against the VeloRent customer registry. Profile updates must be submitted via authorized customer support.
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 max-w-3xl">
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
        ) : profile || user ? (
          <div className="max-w-3xl space-y-6">
            {/* Account Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center border-2 border-blue-500/30 shadow-xs shrink-0">
                    {(profile?.fullName || user?.fullName || 'C')
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {profile?.fullName || user?.fullName}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                        <ShieldCheck className="w-3 h-3 text-blue-600" /> Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customer ID <span className="font-mono font-semibold text-slate-700">#{profile?.id || user?.id}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <RoleBadge role={user?.role || 'CUSTOMER'} />
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                  </span>
                  <p className="text-xs font-bold text-slate-900">{profile?.email || user?.email}</p>
                </div>

                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Phone
                  </span>
                  <p className="text-xs font-bold text-slate-900">{profile?.phone || 'Verified on profile'}</p>
                </div>

                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Account Standing
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {profile?.accountStatus || user?.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <KeyRound className="w-3.5 h-3.5 text-blue-500" /> Total Completed Trips
                  </span>
                  <p className="text-xs font-extrabold text-slate-900 tabular-nums">
                    {profile?.totalRentals ?? 0} rentals completed
                  </p>
                </div>
              </div>
            </div>

            {/* License Verification Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Driving License Verification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Registered License Number
                  </span>
                  <p className="font-bold text-xs text-slate-900 font-mono">
                    {profile?.drivingLicenseNumber || 'Verified on Registration'}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    License Expiry Validity
                  </span>
                  <p className="font-bold text-xs text-slate-800 font-mono">
                    {profile?.licenseExpiry || '2030-01-01'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </AppShell>
    </ProtectedRoute>
  );
}
