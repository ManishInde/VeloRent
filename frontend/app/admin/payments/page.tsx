'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PaymentStatusBadge } from '@/components/ui/StatusBadge';
import { processPayment } from '@/lib/api/payments';
import { Payment } from '@/types';
import { CreditCard, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [rentalId, setRentalId] = useState<string>('1');
  const [amount, setAmount] = useState<string>('1500');
  const [method, setMethod] = useState<string>('CARD');
  const [paymentType, setPaymentType] = useState<string>('RENTAL_FEE');

  const [executedPayment, setExecutedPayment] = useState<Payment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const rId = parseInt(rentalId, 10);
    const amt = parseFloat(amount);

    if (isNaN(rId) || rId <= 0) {
      setError('Please enter a valid numeric Rental ID.');
      return;
    }

    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid positive payment amount.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setExecutedPayment(null);

    try {
      const payment = await processPayment(rId, amt, method, paymentType);
      setExecutedPayment(payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell>
        <PageHeader
          title="Payment Settlement & Audit Control"
          description="Process academic simulated payment settlements, record rental fees, deposits, or damage adjustments."
        />

        {/* Academic Warning Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-950 font-bold mb-0.5">Academic Payment System:</strong>
            VeloRent payment operations interact directly with the C++ simulated PaymentService. No credit cards, CVVs, or real financial gateways are connected.
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 max-w-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Execute Simulated Settlement
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-4">
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Rental ID"
                    type="number"
                    min={1}
                    value={rentalId}
                    onChange={(e) => setRentalId(e.target.value)}
                    required
                  />
                  <Input
                    label="Amount (₹)"
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Simulated Payment Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="UPI">Simulated UPI</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="CASH">Counter Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Classification</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="RENTAL_FEE">Rental Fee</option>
                    <option value="SECURITY_DEPOSIT">Security Deposit</option>
                    <option value="LATE_FEE">Late Fee</option>
                    <option value="DAMAGE_CHARGE">Damage Charge</option>
                    <option value="REFUND">Refund Adjustment</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full"
                    isLoading={isProcessing}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Confirm & Execute Payment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Executed Payment Result Card */}
          {executedPayment && (
            <Card className="border-2 border-emerald-500/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transaction Confirmed
                </CardTitle>
                <PaymentStatusBadge status={executedPayment.status} />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 space-y-3">
                <div className="p-4 bg-emerald-50 rounded-xl space-y-2 text-xs text-emerald-950">
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Payment ID:</span>
                    <span className="font-bold">#{executedPayment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Transaction ID:</span>
                    <span className="font-mono font-bold">{executedPayment.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Rental Reference:</span>
                    <span className="font-bold">#{executedPayment.rentalId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Payment Method:</span>
                    <span className="font-semibold">{executedPayment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Classification:</span>
                    <span className="font-semibold">{executedPayment.type}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-200/60 flex justify-between items-baseline">
                    <span className="font-bold text-emerald-900">Total Amount Paid:</span>
                    <span className="text-xl font-extrabold text-emerald-800 tabular-nums">
                      ₹{executedPayment.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
