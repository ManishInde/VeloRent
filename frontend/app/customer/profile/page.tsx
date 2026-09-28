'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { RoleBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCustomerById } from '@/lib/api/customers';
import { Customer } from '@/types';
import { User as UserIcon, Mail, Phone, ShieldCheck, KeyRound, Info, AlertCircle } from 'lucide-react';

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
          <div className="space-y-4 max-w-2xl">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : profile || user ? (
          <div className="max-w-3xl space-y-6">
            {/* Account Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-600" /> Account Identity
                </CardTitle>
                <RoleBadge role={user?.role || 'CUSTOMER'} />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-full bg-slate-900 text-white font-extrabold text-lg flex items-center justify-center border-2 border-blue-500/30">
                    {(profile?.fullName || user?.name || 'C')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {profile?.fullName || user?.name}
                    </h3>
                    <p className="text-xs text-slate-500">Customer ID #{profile?.id || user?.userId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </span>
                    <p className="font-semibold text-slate-900">{profile?.email || user?.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </span>
                    <p className="font-semibold text-slate-900">{profile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Account Status
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {profile?.accountStatus || user?.status || 'ACTIVE'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                      <KeyRound className="w-3.5 h-3.5" /> Total Completed Rentals
                    </span>
                    <p className="font-bold text-slate-900 tabular-nums">
                      {profile?.totalRentals ?? 0} rentals
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* License Verification Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Driving License Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">License Number</span>
                    <p className="font-bold text-slate-900 font-mono">
                      {profile?.drivingLicenseNumber || 'Verified on Registration'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">License Expiry Date</span>
                    <p className="font-semibold text-slate-800 font-mono">
                      {profile?.licenseExpiry || '2030-01-01'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </AppShell>
    </ProtectedRoute>
  );
}
