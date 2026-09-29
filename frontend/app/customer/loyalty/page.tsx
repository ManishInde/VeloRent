'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoyaltySummary } from '@/components/loyalty/LoyaltySummary';
import { LoyaltyRedeemModal } from '@/components/loyalty/LoyaltyRedeemModal';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCustomerLoyalty } from '@/lib/api/loyalty';
import { LoyaltyAccount, LoyaltyRedeemResponse, LoyaltyTier } from '@/types';
import { Award, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const TIER_BENEFITS: Record<LoyaltyTier, { multiplier: string; discount: string; features: string[] }> = {
  BRONZE: {
    multiplier: '1.0x',
    discount: '0%',
    features: ['Base reward point accrual on every rental', 'Standard customer concierge support'],
  },
  SILVER: {
    multiplier: '1.25x',
    discount: '5%',
    features: ['25% bonus points on rentals', 'Priority customer service queue', '5% instant rental discount'],
  },
  GOLD: {
    multiplier: '1.5x',
    discount: '10%',
    features: ['50% bonus points on rentals', '10% instant rental discount', 'Free cancellation flex-pass'],
  },
  PLATINUM: {
    multiplier: '2.0x',
    discount: '15%',
    features: ['2x points accrual rate', '15% instant rental discount', 'Complimentary vehicle category upgrades'],
  },
};

export default function CustomerLoyaltyPage() {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<LoyaltyRedeemResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchLoyaltyData = async () => {
      if (!user) return;
      try {
        const account = await getCustomerLoyalty(user.id);
        if (mounted) {
          setLoyalty(account);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load loyalty account.');
          setIsLoading(false);
        }
      }
    };

    fetchLoyaltyData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleRedeemSuccess = (result: LoyaltyRedeemResponse) => {
    setRedeemSuccess(result);
    setLoyalty(result);
  };

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <AppShell>
        {/* Editorial Loyalty Header */}
        <div className="mb-8 border-b border-[#111111]/15 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="micro-tag text-[#777770] block mb-1">
              05 / MEMBERSHIP PRIVILEGES
            </span>
            <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl text-[#111111]">
              VELORENT PASS
            </h1>
            <p className="text-sm text-[#555550] font-mono mt-1 max-w-xl">
              Automatic tier privileges, bonus accruals, and instant checkout discounts.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#777770]">
            <span className="w-2 h-2 bg-[#7657FF]" />
            <span>CLUB STATUS ACTIVE</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {redeemSuccess && (
          <div className="mb-8 p-5 bg-[#C7F000] border-2 border-[#111111] text-[#111111] font-mono text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <strong className="font-display font-black text-sm uppercase block">
                POINTS REDEEMED SUCCESSFULLY
              </strong>
              <span>
                Redeemed {redeemSuccess.pointsRedeemed} points for ₹{redeemSuccess.discountINR.toLocaleString()} rental credit. Remaining balance: {redeemSuccess.currentPoints} pts.
              </span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-none" />
            <Skeleton className="h-40 w-full rounded-none" />
          </div>
        ) : loyalty ? (
          <div className="space-y-8">
            {/* Membership Pass Component */}
            <LoyaltySummary loyalty={loyalty} onOpenRedeem={() => setIsRedeemOpen(true)} />

            {/* Tier Benefits Breakdown */}
            <div className="bg-[#FFFFFF] border border-[#111111]/25 p-6 sm:p-8 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
              <span className="micro-tag text-[#777770] block mb-4">
                MEMBERSHIP TIERS & PRIVILEGES
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const).map((tier) => {
                  const isCurrent = loyalty.tier === tier;
                  const benefits = TIER_BENEFITS[tier];
                  return (
                    <div
                      key={tier}
                      className={clsx(
                        'p-5 border transition-all font-mono text-xs flex flex-col justify-between',
                        isCurrent
                          ? 'bg-[#111111] text-[#F4F1EA] border-[#111111] shadow-[4px_4px_0px_#C7F000]'
                          : 'bg-[#FAF8F5] text-[#111111] border-[#111111]/15'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={clsx('font-display font-black text-base uppercase', isCurrent ? 'text-[#C7F000]' : 'text-[#111111]')}>
                            {tier}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 bg-[#C7F000] text-[#111111] text-[9px] font-black uppercase">
                              CURRENT
                            </span>
                          )}
                        </div>

                        <div className={clsx('py-2 border-y my-3 text-[11px]', isCurrent ? 'border-[#2E2E2A]' : 'border-[#111111]/10')}>
                          <div>EARN: <strong className={isCurrent ? 'text-white' : 'text-[#111111]'}>{benefits.multiplier}</strong></div>
                          <div>DISCOUNT: <strong className={isCurrent ? 'text-[#C7F000]' : 'text-[#111111]'}>{benefits.discount}</strong></div>
                        </div>

                        <ul className="space-y-2 text-[11px]">
                          {benefits.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-snug">
                              <ShieldCheck className={clsx('w-3.5 h-3.5 shrink-0 mt-0.5', isCurrent ? 'text-[#C7F000]' : 'text-[#111111]')} />
                              <span className={isCurrent ? 'text-[#AAA8A0]' : 'text-[#555550]'}>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Point Accrual Policy Strip */}
            <div className="p-4 bg-[#FAF8F5] border border-[#111111]/25 text-[#555550] text-xs font-mono flex items-start gap-3">
              <Award className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#111111] uppercase font-bold">AUTOMATED ACCRUAL POLICY:</strong> Loyalty points are awarded by the VeloRent LoyaltyEngine upon return of valid rentals. Points never expire as long as your driver profile is active.
              </span>
            </div>
          </div>
        ) : null}

        {/* Loyalty Redemption Modal */}
        {loyalty && (
          <LoyaltyRedeemModal
            isOpen={isRedeemOpen}
            onClose={() => setIsRedeemOpen(false)}
            customerId={loyalty.customerId}
            currentPoints={loyalty.currentPoints}
            rentalSubtotal={1000}
            onSuccess={handleRedeemSuccess}
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
