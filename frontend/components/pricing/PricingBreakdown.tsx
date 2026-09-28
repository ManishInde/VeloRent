import React from 'react';
import { PricingQuote } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Receipt, Loader2 } from 'lucide-react';

interface PricingLineProps {
  label: string;
  amount: number;
  isDiscount?: boolean;
  isBold?: boolean;
}

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const PricingLine: React.FC<PricingLineProps> = ({ label, amount, isDiscount, isBold }) => {
  if (amount === 0 && !isBold) return null;
  return (
    <div className={`flex items-center justify-between py-1.5 ${isBold ? 'border-t border-slate-200 mt-2 pt-3' : ''}`}>
      <span className={`text-xs ${isBold ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{label}</span>
      <span className={`text-xs tabular-nums font-semibold ${isDiscount ? 'text-emerald-600' : isBold ? 'text-lg text-slate-900' : 'text-slate-800'}`}>
        {isDiscount && amount > 0 ? '-' : ''}{isDiscount && amount > 0 ? formatINR(amount) : formatINR(Math.abs(amount))}
      </span>
    </div>
  );
};

export interface PricingBreakdownProps {
  quote: PricingQuote | null;
  isLoading: boolean;
  error?: string | null;
}

export const PricingBreakdown: React.FC<PricingBreakdownProps> = ({ quote, isLoading, error }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            Calculating your price...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-7 w-1/2 mt-3" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50/30">
        <CardContent className="p-5">
          <p className="text-xs text-rose-700 font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!quote) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Receipt className="w-4 h-4 text-blue-600" />
          Rental Price Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="space-y-0.5">
          <PricingLine label={`Base rate (${formatINR(quote.baseRatePerDay)}/day x ${quote.durationDays} days)`} amount={quote.subtotal} />
          <PricingLine label="Demand adjustment" amount={quote.demandAdjustment} />
          <PricingLine label="Category surcharge" amount={quote.categorySurchargeAmount} />
          <PricingLine label="Long-rental discount" amount={quote.durationDiscount} isDiscount />
          <PricingLine label="Loyalty discount" amount={quote.loyaltyDiscount} isDiscount />
          <PricingLine label="Total Amount" amount={quote.finalPrice} isBold />
        </div>
        {quote.explanation && (
          <p className="mt-3 text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {quote.explanation}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
