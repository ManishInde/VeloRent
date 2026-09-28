import React from 'react';
import { Payment } from '@/types';
import { PaymentStatusBadge } from '@/components/ui/StatusBadge';
import { CreditCard, Calendar, Hash, Tag } from 'lucide-react';

interface PaymentSummaryProps {
  payment: Payment;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ payment }) => {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900">Payment #{payment.id}</span>
            <p className="text-[10px] text-slate-500 font-mono">Txn: {payment.transactionId}</p>
          </div>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Type
          </span>
          <span className="font-semibold text-slate-700">{payment.type}</span>
        </div>
        <div>
          <span className="text-slate-400 flex items-center gap-1">
            <Hash className="w-3 h-3" /> Method
          </span>
          <span className="font-semibold text-slate-700">{payment.method}</span>
        </div>
        <div>
          <span className="text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date
          </span>
          <span className="font-medium text-slate-600">{payment.createdAt || 'Just now'}</span>
        </div>
        <div>
          <span className="text-slate-400">Amount</span>
          <span className="font-bold text-emerald-600 text-sm block tabular-nums">
            ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};
