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
    <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border-2 border-[#111111] max-w-md w-full p-6 sm:p-7 shadow-[6px_6px_0px_#111111] relative font-mono text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#888880] hover:text-[#111111] cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-[#111111]/15">
          <div className="w-9 h-9 bg-[#C7F000] text-[#111111] border border-[#111111] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="micro-tag text-[#777770]">AUTOMOTIVE CLUB PRIVILEGES</span>
            <h3 className="font-display font-black text-base uppercase text-[#111111] mt-0.5">
              REDEEM REWARD POINTS
            </h3>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="p-3 bg-[#FAF8F5] border border-[#111111]/15 flex items-center justify-between text-xs font-mono">
            <span className="text-[#666660]">AVAILABLE BALANCE:</span>
            <span className="font-bold text-[#111111] bg-[#C7F000] px-1.5 py-0.5 border border-[#111111]">{currentPoints} PTS</span>
          </div>

          <Input
            label="POINTS TO REDEEM"
            type="number"
            min={1}
            max={currentPoints}
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(e.target.value)}
            helperText="Backend LoyaltyEngine validates redemption eligibility."
            className="font-mono text-xs"
          />

          <Input
            label="RENTAL SUBTOTAL (₹)"
            type="number"
            min={1}
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
            helperText="Rental amount to apply points discount against."
            className="font-mono text-xs"
          />

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
              CANCEL
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isProcessing}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              CONFIRM REDEMPTION
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
