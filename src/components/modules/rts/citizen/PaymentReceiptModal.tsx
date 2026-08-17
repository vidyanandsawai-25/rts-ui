'use client';

import React from 'react';
import { CheckCircle2, Printer, X, ShieldCheck } from 'lucide-react';
import type { PaymentReceiptResult } from '@/lib/api/rts/rtspayment.service';

interface PaymentReceiptModalProps {
  receipt: PaymentReceiptResult;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ receipt, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = receipt.paymentDate
    ? new Date(receipt.paymentDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 print:m-0 print:w-full print:max-w-none print:shadow-none">

        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Official Payment Receipt</h3>
              <p className="text-emerald-100 text-xs font-medium">शासन ई-पावती / Government e-Receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors print:hidden"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-6 space-y-6">

          {/* Organization & Success Header */}
          <div className="text-center pb-5 border-b border-slate-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Payment Successful!</h4>
            <p className="text-xs text-slate-500 font-medium">{receipt.departmentName} • {receipt.departmentNameLocal || receipt.departmentName}</p>
            <p className="text-xs text-slate-400">Right to Services Act (RTS) Portal</p>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Receipt No. / पावती क्र.</span>
              <span className="font-bold text-slate-800 text-sm tracking-wide">{receipt.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-medium block">Date & Time / दिनांक</span>
              <span className="font-bold text-slate-800">{formattedDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Application No. / अर्ज क्र.</span>
              <span className="font-bold text-slate-800 text-sm">{receipt.applicationNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-medium block">Payment Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {receipt.paymentStatus}
              </span>
            </div>
          </div>

          {/* Service & Breakdown Details */}
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500 font-medium">Department / विभाग</span>
              <span className="font-semibold text-slate-800 text-right">{receipt.departmentName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500 font-medium">Service / सेवा</span>
              <span className="font-semibold text-slate-800 text-right max-w-[260px] truncate">{receipt.serviceName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500 font-medium">Gateway Ref / Transaction ID</span>
              <span className="font-mono text-xs text-slate-700">{receipt.gatewayPaymentId || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500 font-medium">Payment Mode</span>
              <span className="font-medium text-slate-700">{receipt.paymentMode || receipt.paymentGateway}</span>
            </div>
            <div className="flex justify-between items-center pt-3 pb-1 text-base font-bold text-slate-900 border-t-2 border-slate-200">
              <span>Total Amount Paid / एकूण शुल्क</span>
              <span className="text-xl text-emerald-600 font-extrabold">₹{Number(receipt.amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-dashed border-slate-200">
            This is a computer-generated official receipt and requires no physical signature.
            <br />
            ही संगणकीकृत पावती असून स्वाक्षरीची आवश्यकता नाही.
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Print करा
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            Done / पूर्ण झाले
          </button>
        </div>

      </div>
    </div>
  );
};
