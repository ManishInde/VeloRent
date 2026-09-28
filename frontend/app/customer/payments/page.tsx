'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { PaymentStatusBadge } from '@/components/ui/StatusBadge';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCustomerRentals } from '@/lib/api/rentals';
import { Rental, Payment } from '@/types';
import { CreditCard, KeyRound, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export default function CustomerPaymentsPage() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal target
  const [selectedRentalId, setSelectedRentalId] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchPaymentData = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const customerRentals = await getCustomerRentals(user.id);
        if (mounted) setRentals(customerRentals);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load payment information.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchPaymentData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleOpenPayment = (rentalId: number) => {
    setSelectedRentalId(rentalId);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (newPayment: Payment) => {
    setPaymentsList((prev) => [newPayment, ...prev]);
  };

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <AppShell>
        <PageHeader
          title="My Payments"
          description="View rental transaction histories and execute academic simulated payments."
        />

        {/* Academic Warning Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-950 font-bold mb-0.5">Academic Payment Simulation:</strong>
            VeloRent uses a simulated PaymentService API. No real money, credit cards, CVVs, or banking credentials are ever collected or processed.
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : rentals.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-10 h-10 text-slate-400" />}
            title="No payments or active rental balances."
            description="When you have an active or completed rental, payment settlements will be listed here."
            action={
              <Link href="/customer/vehicles">
                <Button variant="outline" size="sm">
                  Browse Vehicles
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Executed Payments / Settlements */}
            {paymentsList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Confirmed Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0 space-y-3">
                  {paymentsList.map((p) => (
                    <div key={p.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Payment #{p.id}</span>
                          <PaymentStatusBadge status={p.status} />
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">Txn ID: {p.transactionId}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-emerald-600 block tabular-nums">
                          ₹{p.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">{p.method} • {p.type}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Rentals Requiring Payment / Settlement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-600" /> Rental Settlement Items
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-3">
                {rentals.map((r) => (
                  <div key={r.id} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Rental #{r.id}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Start: {r.startDateTime || 'Active'} | Odometer: {r.startOdometerKm.toLocaleString()} km
                        {r.distanceDrivenKm > 0 ? ` (${r.distanceDrivenKm} km driven)` : ''}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      leftIcon={<CreditCard className="w-4 h-4" />}
                      onClick={() => handleOpenPayment(r.id)}
                    >
                      Pay Now
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Simulated Payment Modal */}
        {selectedRentalId && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedRentalId(null);
            }}
            rentalId={selectedRentalId}
            amount={1500}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
