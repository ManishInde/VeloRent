import React from 'react';
import { LoyaltyAccount, LoyaltyTier } from '@/types';
import { Award, Zap, ShieldCheck } from 'lucide-react';

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
    <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight">VeloRent Rewards</h3>
            <p className="text-xs text-slate-400">Backend Authoritative Points</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
          {loyalty.tier}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wide block">Current Balance</span>
          <span className="text-3xl font-extrabold text-amber-400 tabular-nums">
            {loyalty.currentPoints.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Available for redemption</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wide block">Lifetime Earned</span>
          <span className="text-2xl font-bold text-slate-200 tabular-nums">
            {loyalty.totalPointsEarned.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Total accrued points</span>
        </div>
      </div>

      {nextTier && (
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Progress to {nextTier}
            </span>
            <span className="text-amber-300 font-semibold">{pointsNeeded} pts to go</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {onOpenRedeem && (
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onOpenRedeem}
            disabled={loyalty.currentPoints <= 0}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-4 h-4" /> Redeem Points
          </button>
        </div>
      )}
    </div>
  );
};
