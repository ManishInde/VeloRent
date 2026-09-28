import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Award, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { redeemLoyaltyPoints } from '@/lib/api/loyalty';
import { LoyaltyRedeemResponse } from '@/types';

interface LoyaltyRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  currentPoints: number;
  rentalSubtotal: number;
  onSuccess: (result: LoyaltyRedeemResponse) => void;
}

export const LoyaltyRedeemModal: React.FC<LoyaltyRedeemModalProps> = ({
  isOpen,
  onClose,
  customerId,
  currentPoints,
  rentalSubtotal,
  onSuccess,
}) => {
  const [pointsToRedeem, setPointsToRedeem] = useState<string>('100');
  const [subtotal, setSubtotal] = useState<string>(rentalSubtotal > 0 ? rentalSubtotal.toString() : '1000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const pts = parseInt(pointsToRedeem, 10);
    const sub = parseFloat(subtotal);

    if (isNaN(pts) || pts <= 0) {
      setError('Please enter a valid positive points amount.');
      return;
    }

    if (pts > currentPoints) {
      setError(`Insufficient points. Your current balance is ${currentPoints} points.`);
      return;
    }

    if (isNaN(sub) || sub <= 0) {
      setError('Please enter a valid rental subtotal.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await redeemLoyaltyPoints(customerId, pts, sub);
      onSuccess(result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Loyalty redemption failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Redeem Loyalty Points</h3>
            <p className="text-xs text-slate-500">Backend Authoritative Redemption</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Available Points Balance:</span>
            <span className="font-extrabold text-amber-600 tabular-nums">{currentPoints} pts</span>
          </div>

          <Input
            label="Points to Redeem"
            type="number"
            min={1}
            max={currentPoints}
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(e.target.value)}
            helperText="Backend LoyaltyEngine validates redemption eligibility."
          />

          <Input
            label="Rental Subtotal (₹)"
            type="number"
            min={1}
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
            helperText="Rental amount to apply points discount against."
          />

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isProcessing}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit Redemption
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
