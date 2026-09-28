import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CreditCard, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { processPayment } from '@/lib/api/payments';
import { Payment } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: number;
  amount: number;
  onSuccess: (payment: Payment) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  rentalId,
  amount,
  onSuccess,
}) => {
  const [method, setMethod] = useState<'CARD' | 'UPI' | 'NET_BANKING' | 'CASH'>('CARD');
  const [paymentType, setPaymentType] = useState<'RENTAL_FEE' | 'SECURITY_DEPOSIT' | 'LATE_FEE' | 'DAMAGE_FEE'>('RENTAL_FEE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const payment = await processPayment(rentalId, amount, method, paymentType);
      onSuccess(payment);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment could not be processed.');
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
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Academic Payment Simulation</h3>
            <p className="text-xs text-slate-500">Rental #{rentalId} Settlement</p>
          </div>
        </div>

        {/* Academic Warning Notice */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Academic Simulation Mode:</strong> No actual financial transactions or payment cards are processed. Selecting a payment method and clicking &quot;Confirm Payment&quot; triggers the VeloRent backend PaymentService simulation.
          </p>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSimulatePayment} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Type</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as typeof paymentType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="RENTAL_FEE">Rental Fee</option>
              <option value="SECURITY_DEPOSIT">Security Deposit</option>
              <option value="LATE_FEE">Late Fee</option>
              <option value="DAMAGE_FEE">Damage Fee</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Simulated Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'CARD', label: 'Credit / Debit Card' },
                { id: 'UPI', label: 'Simulated UPI' },
                { id: 'NET_BANKING', label: 'Net Banking' },
                { id: 'CASH', label: 'Cash at Counter' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id as typeof method)}
                  className={`p-3 rounded-lg border text-left text-xs font-medium transition-all ${
                    method === item.id
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block uppercase tracking-wide">Total Payable Amount</span>
              <span className="text-xs text-slate-300">Backend Verified Rate</span>
            </div>
            <span className="text-xl font-extrabold text-emerald-400 tabular-nums">
              ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isProcessing}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm Simulated Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
