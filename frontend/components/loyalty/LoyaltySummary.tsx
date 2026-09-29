import React from 'react';
import { LoyaltyAccount, LoyaltyTier } from '@/types';
import { Button } from '@/components/ui/Button';
import { Zap, ShieldCheck } from 'lucide-react';

interface LoyaltySummaryProps {
  loyalty: LoyaltyAccount;
  onOpenRedeem?: () => void;
}

const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  BRONZE: 500,
  SILVER: 1500,
  GOLD: 3000,
  PLATINUM: 3000,
};

const NEXT_TIERS: Record<LoyaltyTier, LoyaltyTier | null> = {
  BRONZE: 'SILVER',
  SILVER: 'GOLD',
  GOLD: 'PLATINUM',
  PLATINUM: null,
};

export const LoyaltySummary: React.FC<LoyaltySummaryProps> = ({ loyalty, onOpenRedeem }) => {
  const nextTier = NEXT_TIERS[loyalty.tier];
  const threshold = TIER_THRESHOLDS[loyalty.tier];
  const progressPct = nextTier ? Math.min(100, Math.round((loyalty.totalPointsEarned / threshold) * 100)) : 100;
  const pointsNeeded = nextTier ? Math.max(0, threshold - loyalty.totalPointsEarned) : 0;

  return (
    <div className="bg-[#111111] text-[#F4F1EA] border-2 border-[#111111] shadow-[6px_6px_0px_#7657FF] p-6 sm:p-8 relative overflow-hidden font-mono">
      {/* Top Header of Pass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#2E2E2A] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#C7F000]" />
            <span className="micro-tag text-white tracking-[0.25em]">
              VELORENT AUTOMOTIVE CLUB
            </span>
          </div>
          <h2 className="font-display text-2xl font-black uppercase text-white mt-1">
            MEMBERSHIP PASS
          </h2>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] text-[#888880] uppercase block">STATUS PASS</span>
          <span className="font-display text-sm font-black bg-[#C7F000] text-[#111111] px-2.5 py-0.5 uppercase tracking-wider inline-block mt-0.5">
            {loyalty.tier} MEMBER
          </span>
        </div>
      </div>

      {/* Main Points & Tier Display */}
      <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
        <div>
          <span className="micro-tag text-[#888880] block mb-1">CURRENT REWARD BALANCE</span>
          <div className="flex items-baseline gap-2">
            <span className="editorial-display text-5xl sm:text-6xl text-[#C7F000]">
              {loyalty.currentPoints.toLocaleString()}
            </span>
            <span className="font-display font-bold text-sm text-[#AAA8A0]">POINTS</span>
          </div>
          <span className="text-[11px] text-[#888880] mt-1 block">
            LIFETIME ACCRUED: {loyalty.totalPointsEarned.toLocaleString()} PTS
          </span>
        </div>

        {nextTier ? (
          <div className="p-4 bg-[#1C1C1A] border border-[#2E2E2A]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#AAA8A0] uppercase font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#C7F000]" /> NEXT TIER: {nextTier}
              </span>
              <span className="text-[#C7F000] font-bold">{pointsNeeded} PTS TO UNLOCK</span>
            </div>

            <div className="w-full h-2.5 bg-[#111111] border border-[#2E2E2A] overflow-hidden">
              <div
                className="h-full bg-[#C7F000] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-[#888880] mt-2 block">
              Earn {threshold} lifetime points to elevate to {nextTier} status.
            </span>
          </div>
        ) : (
          <div className="p-4 bg-[#1C1C1A] border border-[#2E2E2A]">
            <span className="text-xs text-[#C7F000] font-bold uppercase block">
              MAXIMUM TIER ACHIEVED
            </span>
            <span className="text-[11px] text-[#AAA8A0] mt-1 block">
              You possess top-tier Platinum automotive privileges including maximum 15% discount.
            </span>
          </div>
        )}
      </div>

      {/* Pass Footer & Redeem Action */}
      <div className="pt-5 border-t border-[#2E2E2A] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-[11px] text-[#888880] uppercase">
          <span>SERIAL: VR-PASS-{loyalty.customerId}-2026</span>
          <span>•</span>
          <span className="text-[#AAA8A0]">VERIFIED DRIVER</span>
        </div>

        {onOpenRedeem && (
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenRedeem}
            disabled={loyalty.currentPoints <= 0}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            REDEEM REWARDS
          </Button>
        )}
      </div>
    </div>
  );
};
