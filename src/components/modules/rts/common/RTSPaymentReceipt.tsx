'use client';

import React from 'react';
import {
  Printer,
  Building2,
  QrCode,
  CreditCard,
  User,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/common';
import type { PaymentReceiptResult } from '@/lib/api/rts/rtspayment.service';

interface RTSPaymentReceiptProps {
  receipt: PaymentReceiptResult;
  onPrint?: () => void;
  showActions?: boolean;
  className?: string;
}

export const RTSPaymentReceipt: React.FC<RTSPaymentReceiptProps> = ({
  receipt,
  onPrint,
  showActions = true,
  className = ''
}) => {
  const handleDefaultPrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formattedDate = receipt.paymentDate
    ? new Date(receipt.paymentDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      })
    : new Date().toLocaleString('en-IN');

  const ulbNameEn = receipt.ulbName || 'Akola Municipal Corporation';
  const ulbNameMr = receipt.ulbNameLocal || 'अकोला महानगरपालिका';

  return (
    <div className={`w-full max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200/90 print:m-0 print:w-full print:max-w-none print:shadow-none print:border-none print:rounded-none ${className}`}>
      {/* Header Banner - Official Municipal Identity */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 px-4 sm:px-6 py-4 sm:py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:bg-none print:text-slate-900 print:border-b-2 print:border-slate-800 print:px-0 print:py-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 print:border-slate-800 print:text-slate-900">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="font-black text-base sm:text-xl tracking-tight leading-tight">
              {ulbNameMr}
            </h2>
            <p className="text-[11px] sm:text-xs font-semibold text-blue-200 uppercase tracking-wider print:text-slate-600">
              {ulbNameEn} • Right to Services (RTS)
            </p>
            <p className="text-[10px] sm:text-[11px] text-amber-300 font-medium print:text-slate-700">
              शासकीय शुल्क ई-पावती / Official Government e-Receipt
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 print:bg-emerald-100 print:text-emerald-800 print:border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>PAYMENT SUCCESS</span>
          </span>
          <span className="text-[10px] text-blue-200 font-mono mt-0.5 sm:mt-1 print:text-slate-500">
            RTS ACT 2015
          </span>
        </div>
      </div>

      {/* Printable Receipt Body */}
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 text-slate-800 print:p-2 print:space-y-4">
        {/* Receipt Identification Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 text-xs print:border print:border-slate-300 print:bg-slate-50">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt No. / पावती क्र.</span>
            <span className="font-mono font-extrabold text-blue-900 text-xs sm:text-sm break-all">{receipt.receiptNo}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application / अर्ज क्र.</span>
            <span className="font-mono font-extrabold text-slate-800 text-xs sm:text-sm break-all">{receipt.applicationNo}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date & Time / दिनांक</span>
            <span className="font-semibold text-slate-700 text-xs sm:text-sm">{formattedDate}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Mode / माध्यम</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1 text-xs sm:text-sm">
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>{receipt.paymentMode || receipt.paymentGateway || 'Online'}</span>
            </span>
          </div>
        </div>

        {/* Citizen Details Section */}
        <div className="border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 bg-white space-y-2 print:border-slate-300">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Applicant Information / अर्जदाराचा तपशील</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs pt-1">
            <div>
              <span className="text-slate-400 block font-medium text-[11px]">Applicant Name / नाव:</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm break-words">{receipt.customerName || 'Citizen Applicant'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium text-[11px]">Mobile No. / मोबाईल:</span>
              <span className="font-mono font-semibold text-slate-800 flex items-center gap-1 text-xs sm:text-sm">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{receipt.customerMobile || 'N/A'}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium text-[11px]">Email / ईमेल:</span>
              <span className="font-mono text-slate-700 text-xs break-all block">
                {receipt.customerEmail || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Service & Fee Table */}
        <div className="border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden print:border-slate-300">
          <div className="bg-slate-100/90 px-3.5 sm:px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-between border-b border-slate-200">
            <span>Service Particulars / सेवा तपशील</span>
            <span>Amount / रक्कम (₹)</span>
          </div>

          <div className="p-3.5 sm:p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm block break-words">
                  {receipt.serviceNameLocal || receipt.serviceName}
                </span>
                <span className="text-slate-500 font-medium text-[11px] sm:text-xs block break-words">
                  {receipt.serviceName} • {receipt.departmentName}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm shrink-0">
                ₹{Number(receipt.amount).toFixed(2)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-500 text-[11px]">
              <span>Portal Convenience Charges / पोर्टल शुल्क:</span>
              <span className="font-medium text-emerald-600 font-mono">₹0.00 (मोफत)</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Applicable Taxes / कर:</span>
              <span className="font-mono">₹0.00</span>
            </div>

            {/* Total Paid Row */}
            <div className="pt-2.5 border-t-2 border-slate-800 flex justify-between items-center text-xs sm:text-sm font-bold text-slate-900">
              <span>Total Amount Paid / एकूण भरलेली रक्कम:</span>
              <span className="text-base sm:text-lg font-black text-emerald-700 font-mono shrink-0">
                ₹{Number(receipt.amount).toFixed(2)}
              </span>
            </div>

            {/* Amount in words */}
            <div className="bg-emerald-50/70 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-emerald-200/70 text-xs space-y-0.5">
              <span className="text-emerald-900 font-bold block text-[11px] sm:text-xs">
                अक्षरी रक्कम: <span className="font-medium text-emerald-800">{receipt.amountInWordsLocal || `${receipt.amount} रुपये फक्त`}</span>
              </span>
              <span className="text-emerald-800 text-[10px] sm:text-[11px] block">
                In Words: <span className="font-semibold">{receipt.amountInWords || `${receipt.amount} Rupees Only`}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Reference & Audit Trail */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 text-[11px] text-slate-600 print:bg-white print:border-slate-300">
          <div>
            <span className="text-slate-400 font-medium block text-[10px]">Gateway Payment ID</span>
            <span className="font-mono font-semibold text-slate-800 break-all block">{receipt.gatewayPaymentId || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px]">Transaction Ref No</span>
            <span className="font-mono font-semibold text-slate-800 break-all block">{receipt.transactionNo || `TXN${receipt.transactionId}`}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px]">Bank Ref / Account</span>
            <span className="font-mono font-semibold text-slate-800 break-all block">{receipt.bankRefNo || receipt.payerVpaOrAccount || 'Confirmed'}</span>
          </div>
        </div>

        {/* Official Seal & Computer Generated Disclaimer */}
        <div className="pt-3 sm:pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 print:text-slate-600">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
              <QrCode className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px]">Online Verified & Authenticated</p>
              <p className="text-[10px] text-slate-400 leading-tight">
                Digital e-Receipt • <span className="text-blue-600 font-mono">citizen.scipl.info.in</span>
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[10px] text-slate-400 leading-relaxed">
            <p className="font-semibold text-slate-600">This is a computer-generated official receipt.</p>
            <p>ही अधिकृत संगणकीकृत पावती असून स्वाक्षरीची आवश्यकता नाही.</p>
          </div>
        </div>
      </div>

      {/* Action Footer Bar - Print / Download */}
      {showActions && (
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 print:hidden">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            RTS Public Portal • Akola Municipal Corporation
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              type="button"
              onClick={handleDefaultPrint}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt / पावती प्रिंट करा</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
