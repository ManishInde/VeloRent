'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { PaymentStatusBadge } from '@/components/ui/StatusBadge';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCustomerRentals } from '@/lib/api/rentals';
import { getCustomerPayments } from '@/lib/api/payments';
import { Rental, Payment } from '@/types';
import { CreditCard, AlertCircle, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

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
        const [customerRentals, userPayments] = await Promise.all([
          getCustomerRentals(user.id),
          getCustomerPayments(user.id).catch(() => []),
        ]);
        if (mounted) {
          setRentals(customerRentals);
          setPaymentsList(userPayments);
        }
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

  const settledPaymentsByRental = useMemo(() => {
    const map = new Map<number, Payment>();
    for (const p of paymentsList) {
      if (
        p.status === 'COMPLETED' &&
        (p.type === 'BASE_RENT' || p.type === 'RENTAL_FEE')
      ) {
        map.set(p.rentalId, p);
      }
    }
    return map;
  }, [paymentsList]);

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
        {/* Editorial Payments Ledger Header */}
        <div className="mb-8 border-b border-[#111111]/15 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="micro-tag text-[#777770] block mb-1">
              FINANCIAL TRANSACTIONS
            </span>
            <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
              PAYMENT HISTORY
            </h1>
            <p className="text-sm text-[#555550] font-mono mt-1 max-w-xl">
              Rental settlement ledger and academic transaction processing receipts.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#777770]">
            <span className="w-2 h-2 bg-[#C7F000] border border-[#111111]" />
            <span>GATEWAY SIMULATION LIVE</span>
          </div>
        </div>

        {/* Academic Simulation Notice */}
        <div className="mb-8 p-4 bg-[#FAF8F5] border border-[#111111]/25 flex items-start gap-3 text-xs font-mono text-[#555550]">
          <Info className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
          <div>
            <strong className="block text-[#111111] uppercase font-bold mb-0.5">ACADEMIC PAYMENT SIMULATION:</strong>
            VeloRent uses a simulated PaymentService API. No real money, credit cards, or banking credentials are ever collected or processed.
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-none" />
            <Skeleton className="h-24 w-full rounded-none" />
          </div>
        ) : rentals.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-10 h-10 text-[#888880]" />}
            title="NO OUTSTANDING SETTLEMENTS"
            description="When you have an active or completed rental, payment settlements will be recorded in this ledger."
            action={
              <Link href="/customer/vehicles">
                <Button variant="primary" size="sm">
                  EXPLORE VEHICLES
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-8">
            {/* Executed Payments / Settlements */}
            {paymentsList.length > 0 && (
              <div>
                <span className="micro-tag text-[#777770] block mb-3">
                  01 / CONFIRMED SETTLEMENT RECEIPTS
                </span>
                <div className="space-y-2">
                  {paymentsList.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 bg-[#FFFFFF] border border-[#111111]/20 shadow-[2px_2px_0px_rgba(17,17,17,0.06)] flex items-center justify-between font-mono text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#111111]" />
                          <span className="font-bold text-[#111111] uppercase">TRANSACTION #{p.id}</span>
                          <PaymentStatusBadge status={p.status} />
                        </div>
                        <p className="text-[11px] text-[#777770] mt-1">TXN REF: {p.transactionId}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-lg font-black text-[#111111] block tabular-nums">
                          {formatINR(p.amount)}
                        </span>
                        <span className="text-[10px] text-[#888880] uppercase">{p.method} • {p.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rentals Requiring Settlement / Ledger Rows */}
            <div>
              <span className="micro-tag text-[#777770] block mb-3">
                02 / RENTAL SETTLEMENT ITEMS
              </span>
              <div className="bg-[#FFFFFF] border border-[#111111]/25 divide-y divide-[#111111]/15">
                {rentals.map((r, idx) => (
                  <div
                    key={r.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-display font-black text-xl text-[#888880] w-6 shrink-0 mt-0.5">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-[#111111] uppercase">
                            RENTAL SPECIMEN #{r.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FAF8F5] border border-[#111111]/20 uppercase">
                            {r.status}
                          </span>
                        </div>
                        <p className="text-[#666660] text-xs mt-1">
                          BOOKING #{r.bookingId} • START ODO: {r.startOdometerKm.toLocaleString()} KM
                          {r.distanceDrivenKm > 0 ? ` (+${r.distanceDrivenKm} KM DRIVEN)` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-[#888880] uppercase block">DUE CHARGE</span>
                        <span className="font-display text-base font-black text-[#111111]">
                          ₹1,500
                        </span>
                      </div>

                      {settledPaymentsByRental.has(r.id) ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C7F000] border border-[#111111] font-mono text-[10px] font-bold text-[#111111]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />
                          PAID
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenPayment(r.id)}
                        >
                          SETTLE
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
            existingPayment={settledPaymentsByRental.get(selectedRentalId) || null}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
