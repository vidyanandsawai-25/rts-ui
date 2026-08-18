'use client';

import React from 'react';
import {
  Printer,
  ShieldCheck,
  Building2,
  QrCode,
  CreditCard,
  User,
  Phone
} from 'lucide-react';
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
    <div className={`w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 print:m-0 print:w-full print:max-w-none print:shadow-none print:border-none ${className}`}>
      {/* Header Banner - Official Municipal Color */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 px-6 py-5 text-white flex items-center justify-between print:bg-none print:text-slate-900 print:border-b-2 print:border-slate-800 print:px-0 print:py-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 print:border-slate-800 print:text-slate-900">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg md:text-xl tracking-tight leading-tight">
              {ulbNameMr}
            </h2>
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider print:text-slate-600">
              {ulbNameEn} • Right to Services (RTS)
            </p>
            <p className="text-[11px] text-amber-300 font-medium print:text-slate-700">
              शासकीय शुल्क ई-पावती / Official Government e-Receipt
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end print:flex">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 print:bg-emerald-100 print:text-emerald-800 print:border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PAYMENT SUCCESS</span>
          </span>
          <span className="text-[10px] text-blue-200 font-mono mt-1 print:text-slate-500">
            RTS ACT 2015
          </span>
        </div>
      </div>

      {/* Printable Receipt Body */}
      <div className="p-6 md:p-8 space-y-6 text-slate-800 print:p-2 print:space-y-4">
        {/* Receipt Identification Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs print:border print:border-slate-300 print:bg-slate-50">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt No. / पावती क्र.</span>
            <span className="font-mono font-extrabold text-blue-900 text-sm">{receipt.receiptNo}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application / अर्ज क्र.</span>
            <span className="font-mono font-extrabold text-slate-800 text-sm">{receipt.applicationNo}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date & Time / दिनांक</span>
            <span className="font-semibold text-slate-700">{formattedDate}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Mode / माध्यम</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>{receipt.paymentMode || receipt.paymentGateway || 'Online'}</span>
            </span>
          </div>
        </div>

        {/* Citizen Details Section */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5 print:border-slate-300">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Applicant Information / अर्जदाराचा तपशील</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div>
              <span className="text-slate-400 block font-medium">Applicant Name / नाव:</span>
              <span className="font-bold text-slate-900 text-sm">{receipt.customerName || 'Citizen Applicant'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Mobile No. / मोबाईल:</span>
              <span className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{receipt.customerMobile || 'N/A'}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Email / ईमेल:</span>
              <span className="font-mono text-slate-700 truncate block">
                {receipt.customerEmail || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Service & Fee Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden print:border-slate-300">
          <div className="bg-slate-100/80 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-between border-b border-slate-200">
            <span>Service Particulars / सेवा तपशील</span>
            <span>Amount / रक्कम (₹)</span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {receipt.serviceNameLocal || receipt.serviceName}
                </span>
                <span className="text-slate-500 font-medium">
                  {receipt.serviceName} • {receipt.departmentName}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm">
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
            <div className="pt-3 border-t-2 border-slate-800 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Total Amount Paid / एकूण भरलेली रक्कम:</span>
              <span className="text-lg font-black text-emerald-700 font-mono">
                ₹{Number(receipt.amount).toFixed(2)}
              </span>
            </div>

            {/* Amount in words */}
            <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/70 text-xs">
              <span className="text-emerald-900 font-bold block">
                अक्षरी रक्कम: <span className="font-medium text-emerald-800">{receipt.amountInWordsLocal || `${receipt.amount} रुपये फक्त`}</span>
              </span>
              <span className="text-emerald-800 text-[11px]">
                In Words: <span className="font-semibold">{receipt.amountInWords || `${receipt.amount} Rupees Only`}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Reference & Audit Trail */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 print:bg-white print:border-slate-300">
          <div>
            <span className="text-slate-400 font-medium block">Gateway Payment ID</span>
            <span className="font-mono font-semibold text-slate-800 truncate block">{receipt.gatewayPaymentId || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Transaction Ref No</span>
            <span className="font-mono font-semibold text-slate-800 truncate block">{receipt.transactionNo || `TXN${receipt.transactionId}`}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Bank Ref / Account</span>
            <span className="font-mono font-semibold text-slate-800 truncate block">{receipt.bankRefNo || receipt.payerVpaOrAccount || 'Confirmed'}</span>
          </div>
        </div>

        {/* Official Seal & Computer Generated Disclaimer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 print:text-slate-600">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px]">Online Verified & Digitally Authenticated</p>
              <p className="text-[10px] text-slate-400 leading-tight">
                Scan QR or track at: <span className="text-blue-600 font-mono">citizen.scipl.info.in</span>
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[10px] text-slate-400 leading-relaxed">
            <p className="font-semibold text-slate-600">This is a computer-generated official receipt.</p>
            <p>ही अधिकृत संगणकीकृत पावती असून स्वाक्षरीची आवश्यकता नाही.</p>
          </div>
        </div>
      </div>

      {/* Action Footer Bar (Print / Download) - Hidden in Print View */}
      {showActions && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between print:hidden">
          <div className="text-xs text-slate-500 font-medium">
            RTS Public Portal • Akola Municipal Corporation
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDefaultPrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Print Receipt / पावती प्रिंट करा</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
