import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { CreditCard, CheckCircle2, AlertCircle, Info, X, ShieldCheck } from 'lucide-react';
import { processPayment, getRentalPayments } from '@/lib/api/payments';
import { Payment } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: number;
  amount: number;
  onSuccess: (payment: Payment) => void;
  existingPayment?: Payment | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  rentalId,
  amount,
  onSuccess,
  existingPayment,
}) => {
  const [method, setMethod] = useState<'CARD' | 'UPI' | 'NET_BANKING' | 'CASH'>('CARD');
  const [paymentType, setPaymentType] = useState<'RENTAL_FEE' | 'SECURITY_DEPOSIT' | 'LATE_FEE' | 'DAMAGE_FEE'>('RENTAL_FEE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authoritative duplicate payment state from backend
  const isPropSettled = Boolean(existingPayment && existingPayment.status === 'COMPLETED');
  const [isFetchedSettled, setIsFetchedSettled] = useState(false);
  const [fetchedPayment, setFetchedPayment] = useState<Payment | null>(null);

  const isAlreadySettled = isPropSettled || isFetchedSettled;
  const settledPayment = (isPropSettled ? existingPayment : fetchedPayment) || null;

  useEffect(() => {
    if (!isOpen || !rentalId || isPropSettled) return;

    let isMounted = true;

    getRentalPayments(rentalId)
      .then((payments) => {
        if (!isMounted) return;
        const completedBasePayment = payments.find(
          (p) =>
            p.status === 'COMPLETED' &&
            (p.type === 'BASE_RENT' || p.type === 'RENTAL_FEE')
        );
        if (completedBasePayment) {
          setIsFetchedSettled(true);
          setFetchedPayment(completedBasePayment);
        } else {
          setIsFetchedSettled(false);
          setFetchedPayment(null);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen, rentalId, isPropSettled]);

  if (!isOpen) return null;

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAlreadySettled) return;

    setIsProcessing(true);
    setError(null);

    try {
      const payment = await processPayment(rentalId, amount, method, paymentType);
      onSuccess(payment);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment could not be processed.';
      const isDuplicateError =
        msg.toLowerCase().includes('already been paid') ||
        msg.toLowerCase().includes('duplicate payment');

      if (isDuplicateError) {
        setIsFetchedSettled(true);
        // Refresh authoritative payments to display transaction details
        getRentalPayments(rentalId)
          .then((payments) => {
            const p = payments.find(
              (item) =>
                item.status === 'COMPLETED' &&
                (item.type === 'BASE_RENT' || item.type === 'RENTAL_FEE')
            );
            if (p) setFetchedPayment(p);
          })
          .catch(() => {});
      } else {
        setError(msg);
      }
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
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="micro-tag text-[#777770]">TRANSACTION TERMINAL</span>
            <h3 className="font-display font-black text-base uppercase text-[#111111] mt-0.5">
              PAYMENT SETTLEMENT #{rentalId}
            </h3>
          </div>
        </div>

        {/* Academic Warning Notice */}
        <div className="mt-4 p-3 bg-[#FAF8F5] border border-[#111111]/15 flex items-start gap-2.5 text-[11px] text-[#555550]">
          <Info className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
          <p>
            <strong>ACADEMIC SIMULATION:</strong> No actual financial credentials are required or processed. Triggering payment invokes backend PaymentService simulation.
          </p>
        </div>

        {/* Settled State: User-friendly duplicate payment handling */}
        {isAlreadySettled ? (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-[#FAF8F5] border-2 border-[#111111] space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#111111]" />
                <span className="px-2.5 py-0.5 bg-[#C7F000] border border-[#111111] font-display font-black text-xs uppercase text-[#111111]">
                  RENTAL FEE ALREADY SETTLED
                </span>
              </div>
              <p className="text-xs text-[#555550] leading-relaxed">
                The base rental fee for Rental #{rentalId} has already been paid in full. Duplicate payment attempts are blocked to safeguard transaction integrity.
              </p>

              {settledPayment && (
                <div className="p-3 bg-white border border-[#111111]/20 font-mono text-[11px] space-y-1.5 mt-2">
                  <div className="flex justify-between">
                    <span className="text-[#888880]">TRANSACTION REF:</span>
                    <span className="font-bold text-[#111111]">
                      {settledPayment.transactionId || `#PAY-${settledPayment.id}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888880]">SETTLED AMOUNT:</span>
                    <span className="font-bold text-[#111111]">
                      ₹{settledPayment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888880]">PAYMENT METHOD:</span>
                    <span className="font-bold text-[#111111]">{settledPayment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888880]">SETTLEMENT STATUS:</span>
                    <span className="font-bold text-[#111111]">{settledPayment.status}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button type="button" variant="primary" size="sm" onClick={onClose}>
                CLOSE
              </Button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mt-3 p-3 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSimulatePayment} className="mt-5 space-y-4">
              <div>
                <label className="block micro-tag text-[#777770] mb-1">PAYMENT CLASSIFICATION</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as typeof paymentType)}
                  className="w-full p-2.5 bg-white border border-[#111111]/30 font-mono text-xs text-[#111111] focus:outline-none"
                >
                  <option value="RENTAL_FEE">RENTAL FEE</option>
                  <option value="SECURITY_DEPOSIT">SECURITY DEPOSIT</option>
                  <option value="LATE_FEE">LATE FEE</option>
                  <option value="DAMAGE_FEE">DAMAGE FEE</option>
                </select>
              </div>

              <div>
                <label className="block micro-tag text-[#777770] mb-1">SELECT METHOD</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'CARD', label: 'CREDIT / DEBIT CARD' },
                    { id: 'UPI', label: 'SIMULATED UPI' },
                    { id: 'NET_BANKING', label: 'NET BANKING' },
                    { id: 'CASH', label: 'CASH AT COUNTER' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id as typeof method)}
                      className={`p-2.5 border text-left text-[11px] font-bold font-display uppercase transition-all cursor-pointer ${
                        method === item.id
                          ? 'border-[#111111] bg-[#111111] text-[#C7F000]'
                          : 'border-[#111111]/20 bg-white text-[#555550] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#111111] text-white border border-[#111111] flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-[#888880] uppercase tracking-wider block">SETTLEMENT AMOUNT</span>
                  <span className="text-[10px] text-[#AAA8A0]">BACKEND VERIFIED</span>
                </div>
                <span className="font-display font-black text-2xl text-[#C7F000] tabular-nums">
                  ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isProcessing}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  CONFIRM SIMULATED PAYMENT
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
