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
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto print:p-0 print:bg-white print:static"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-auto py-2 sm:py-4 print:p-0 print:m-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-0 right-1 sm:-top-3 sm:-right-3 z-20 p-2 rounded-full bg-slate-900/90 text-white shadow-xl hover:bg-slate-800 transition print:hidden cursor-pointer border border-white/20"
          aria-label="Close Receipt Modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Official Common Receipt Component */}
        <RTSPaymentReceipt receipt={receipt} />
      </div>
    </div>
  );
};
