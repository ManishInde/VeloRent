'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoyaltySummary } from '@/components/loyalty/LoyaltySummary';
import { LoyaltyRedeemModal } from '@/components/loyalty/LoyaltyRedeemModal';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCustomerLoyalty } from '@/lib/api/loyalty';
import { LoyaltyAccount, LoyaltyRedeemResponse, LoyaltyTier } from '@/types';
import { Award, Zap, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const TIER_BENEFITS: Record<LoyaltyTier, { multiplier: string; discount: string; features: string[] }> = {
  BRONZE: {
    multiplier: '1.0x',
    discount: '0%',
    features: ['Base reward point accrual on every rental', 'Standard customer support'],
  },
  SILVER: {
    multiplier: '1.25x',
    discount: '5%',
    features: ['25% bonus points on rentals', 'Priority customer service queue', '5% rental discount'],
  },
  GOLD: {
    multiplier: '1.5x',
    discount: '10%',
    features: ['50% bonus points on rentals', '10% rental discount', 'Free cancellation flex-pass'],
  },
  PLATINUM: {
    multiplier: '2.0x',
    discount: '15%',
    features: ['2x points accrual rate', '15% instant rental discount', 'Complimentary vehicle upgrades'],
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
        <PageHeader
          title="Loyalty Rewards & Tiers"
          description="View your VeloRent rewards tier, point balance, and redeem points against rental subtotals."
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {redeemSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block text-emerald-950">Points Redeemed Successfully!</strong>
              Redeemed {redeemSuccess.pointsRedeemed} points for ₹{redeemSuccess.discountINR.toLocaleString()} rental discount. Remaining balance: {redeemSuccess.currentPoints} pts.
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : loyalty ? (
          <div className="space-y-6">
            {/* Loyalty Account Banner */}
            <LoyaltySummary loyalty={loyalty} onOpenRedeem={() => setIsRedeemOpen(true)} />

            {/* Tier Benefits Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> VeloRent Membership Tier Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const).map((tier) => {
                    const isCurrent = loyalty.tier === tier;
                    const benefits = TIER_BENEFITS[tier];
                    return (
                      <div
                        key={tier}
                        className={`p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/50 shadow-xs'
                            : 'bg-white border-slate-200 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900">{tier}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-slate-950">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                          Earn Rate: <strong className="text-slate-800">{benefits.multiplier}</strong> • Discount: <strong className="text-slate-800">{benefits.discount}</strong>
                        </p>
                        <ul className="space-y-1.5 text-[11px] text-slate-600">
                          {benefits.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Point Accrual Policy Info */}
            <div className="p-4 bg-slate-100 border border-slate-200 text-slate-600 text-xs rounded-xl flex items-start gap-2.5">
              <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Backend Point Accrual Policy:</strong> Loyalty points are calculated and awarded by the VeloRent C++ LoyaltyEngine upon completion of valid rental transactions. Manual point creation is strictly prohibited.
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
