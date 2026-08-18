'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { PaymentReceiptResult } from '@/lib/api/rts/rtspayment.service';
import { RTSPaymentReceipt } from '../common/RTSPaymentReceipt';

interface PaymentReceiptModalProps {
  receipt: PaymentReceiptResult;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ receipt, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8">
        {/* Close Button on top right */}
        <button
          onClick={onClose}
          type="button"
          className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition print:hidden cursor-pointer"
          aria-label="Close Receipt Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Common Receipt Component */}
        <RTSPaymentReceipt receipt={receipt} />
      </div>
    </div>
  );
};
