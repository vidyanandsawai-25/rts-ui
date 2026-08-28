'use client';

import React from 'react';
import {
  Printer,
  Building2,
  QrCode,
  CreditCard,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  Layers,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/common';
import { getUlbDataFromCookies } from '@/lib/utils/cookie';
import type { PaymentReceiptResult } from '@/lib/api/rts/rtspayment.service';

function formatReceiptDate(value?: string): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

function getReceiptEmail(value?: string): string {
  const email = value?.trim() ?? '';
  return /@citizen\.portal$/i.test(email) ? '' : email;
}

export function printReceiptElement(receipt: PaymentReceiptResult) {
  if (typeof window === 'undefined') return;

  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = 'none';
  document.body.appendChild(printIframe);

  const formattedDate = formatReceiptDate(receipt.paymentDate);
  const customerEmail = getReceiptEmail(receipt.customerEmail);

  const cookieUlb = getUlbDataFromCookies();
  const ulbNameEn = receipt.ulbName || cookieUlb.ulbName || 'MUNICIPAL CORPORATION';
  const ulbNameMr = receipt.ulbNameLocal || cookieUlb.ulbNameLocal || 'महानगरपालिका';
  let ulbLogo = receipt.ulbLogo || cookieUlb.ulbLogo || '/images/rts-logo.png';
  if (ulbLogo && !ulbLogo.startsWith('http://') && !ulbLogo.startsWith('https://') && !ulbLogo.startsWith('/')) {
    ulbLogo = `/api/UlbImageMaster/${ulbLogo}/view`;
  }

  const isOffline =
    (receipt.paymentMode && /cash|cheque|dd|pos|challan/i.test(receipt.paymentMode)) ||
    (receipt.paymentGateway && /counter|offline/i.test(receipt.paymentGateway)) ||
    Boolean(receipt.counterOfficerName);

  const channelText = receipt.channel || (isOffline ? 'CFC Municipal Counter (नागरी सुविधा केंद्र)' : 'Online Citizen Portal (ऑनलाइन नागरिक पोर्टल)');
  const amountFormatted = Number(receipt.amount || 0).toFixed(2);
  const baseAmountFormatted = Number(receipt.baseAmount || receipt.amount || 0).toFixed(2);
  const lateFeeFormatted = Number(receipt.lateFeeAmount || 0).toFixed(2);
  const discountFormatted = Number(receipt.discountAmount || 0).toFixed(2);

  const amountInWordsEn = receipt.amountInWords || `${receipt.amount} Rupees Only`;
  const amountInWordsMr = receipt.amountInWordsLocal || `${receipt.amount} रुपये फक्त`;

  const html = `
    <!DOCTYPE html>
    <html lang="mr">
      <head>
        <title>Receipt_${receipt.receiptNo || receipt.applicationNo}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          body {
            background: #ffffff;
            color: #0f172a;
            padding: 10px;
            font-size: 11.5px;
            line-height: 1.35;
          }
          .receipt-box {
            border: 2px solid #1e3a8a;
            border-radius: 10px;
            overflow: hidden;
            max-width: 780px;
            margin: 0 auto;
            background: #ffffff;
          }
          .receipt-header {
            background: #143d7d;
            color: #ffffff;
            padding: 14px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0f2e5e;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .logo-box {
            width: 52px;
            height: 52px;
            background: #ffffff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 1px solid #cbd5e1;
            padding: 2px;
          }
          .logo-box img {
            width: 46px;
            height: 46px;
            object-fit: contain;
          }
          .header-title h1 {
            font-size: 18px;
            font-weight: 900;
            margin-bottom: 1px;
            letter-spacing: -0.2px;
            color: #ffffff;
          }
          .header-title .corp-en {
            font-size: 11px;
            font-weight: 700;
            color: #bfdbfe;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .header-title .sub-title {
            color: #fde047;
            font-size: 11.5px;
            font-weight: 700;
            margin-top: 2px;
          }
          .service-context {
            margin-top: 5px;
            display: flex;
            flex-wrap: wrap;
            gap: 3px 10px;
            color: #dbeafe;
            font-size: 9.5px;
            font-weight: 700;
          }
          .service-context strong {
            color: #ffffff;
          }
          .header-right {
            text-align: right;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 3px;
          }
          .header-badge {
            background: #059669;
            color: #ffffff;
            padding: 5px 12px;
            border-radius: 9999px;
            font-weight: 900;
            font-size: 11px;
            letter-spacing: 0.5px;
            border: 1px solid #34d399;
            display: inline-block;
          }
          .rts-tag {
            font-size: 9.5px;
            color: #93c5fd;
            font-weight: 600;
          }
          .receipt-body {
            padding: 16px 18px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
            margin-bottom: 12px;
          }
          .meta-item .label {
            font-size: 9px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            display: block;
            margin-bottom: 2px;
          }
          .meta-item .value {
            font-size: 11.5px;
            font-weight: 800;
            color: #0f172a;
            word-break: break-all;
          }
          .meta-item .highlight {
            color: #1e3a8a;
          }
          .meta-item .success {
            color: #047857;
          }
          .section-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
            margin-bottom: 12px;
            background: #ffffff;
          }
          .section-title {
            font-size: 10.5px;
            font-weight: 800;
            text-transform: uppercase;
            color: #334155;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 4px;
            margin-bottom: 8px;
            letter-spacing: 0.4px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .info-item .label {
            font-size: 9.5px;
            color: #64748b;
            display: block;
            margin-bottom: 1px;
          }
          .info-item .value {
            font-size: 11.5px;
            font-weight: 700;
            color: #0f172a;
            word-break: break-word;
          }
          .fee-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 12px;
          }
          .fee-table th {
            background: #f1f5f9;
            padding: 8px 10px;
            font-size: 10.5px;
            font-weight: 800;
            color: #1e293b;
            text-align: left;
            border-bottom: 1px solid #cbd5e1;
            border-right: 1px solid #e2e8f0;
          }
          .fee-table th:last-child {
            border-right: none;
          }
          .fee-table th.amount {
            text-align: right;
          }
          .fee-table td {
            padding: 8px 10px;
            font-size: 11.5px;
            border-bottom: 1px solid #f1f5f9;
            border-right: 1px solid #f1f5f9;
          }
          .fee-table td:last-child {
            border-right: none;
          }
          .fee-table td.amount {
            text-align: right;
            font-weight: 700;
          }
          .fee-table tr.total-row td {
            border-top: 2px solid #0f172a;
            border-bottom: none;
            font-size: 13px;
            font-weight: 900;
            color: #047857;
            background: #f8fafc;
          }
          .words-card {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 12px;
            font-size: 11px;
            color: #065f46;
          }
          .words-card strong {
            font-weight: 800;
          }
          .audit-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 10px;
            color: #475569;
            margin-bottom: 12px;
          }
          .audit-item span.label {
            color: #94a3b8;
            display: block;
            margin-bottom: 1px;
          }
          .audit-item span.value {
            font-weight: 700;
            color: #1e293b;
            word-break: break-all;
          }
          .footer-note {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px dashed #cbd5e1;
            padding-top: 10px;
            font-size: 9.5px;
            color: #64748b;
          }
          .footer-note .verify-tag {
            font-weight: 800;
            color: #1e3a8a;
          }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="receipt-header">
            <div class="header-left">
              <div class="logo-box">
                <img src="${ulbLogo}" alt="Logo" onerror="this.style.display='none'" />
              </div>
              <div class="header-title">
                <h1>${ulbNameMr}</h1>
                <div class="corp-en">${ulbNameEn} • महाराष्ट्र शासन</div>
                <div class="sub-title">शासकीय शुल्क ई-पावती / Official Government e-Receipt</div>
                <div class="service-context">
                  <span>Department / विभाग: <strong>${receipt.departmentNameLocal || receipt.departmentName || ''}</strong></span>
                  <span>Service / सेवा: <strong>${receipt.serviceNameLocal || receipt.serviceName || ''}</strong></span>
                </div>
              </div>
            </div>
            <div class="header-right">
              <div class="header-badge">✓ PAYMENT SUCCESS</div>
              <div class="rts-tag">RTS ACT 2015 / लोकसेवा हक्क</div>
            </div>
          </div>

          <div class="receipt-body">
            <div class="meta-grid">
              <div class="meta-item">
                <span class="label">Receipt No. / पावती क्र.</span>
                <span class="value highlight">${receipt.receiptNo || 'N/A'}</span>
              </div>
              <div class="meta-item">
                <span class="label">Application / अर्ज क्र.</span>
                <span class="value">${receipt.applicationNo || 'N/A'}</span>
              </div>
              <div class="meta-item">
                <span class="label">Receipt Date / दिनांक</span>
                <span class="value">${formattedDate}</span>
              </div>
              <div class="meta-item">
                <span class="label">Payment Mode / माध्यम</span>
                <span class="value success">${receipt.paymentMode || (isOffline ? 'Cash / रोख' : 'Online Gateway')}</span>
              </div>
            </div>

            <div class="section-card">
              <div class="section-title">
                <span>Applicant Information / अर्जदाराचा तपशील</span>
                <span style="font-size: 9px; color: #64748b;">${channelText}</span>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Applicant Name / अर्जदाराचे नाव:</span>
                  <span class="value">${receipt.customerName || 'Citizen Applicant'}</span>
                </div>
                <div class="info-item">
                  <span class="label">Mobile No. / मोबाईल क्र.:</span>
                  <span class="value">${receipt.customerMobile || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="label">Email ID / ईमेल आयडी:</span>
                  <span class="value">${customerEmail}</span>
                </div>
              </div>
            </div>

            <table class="fee-table">
              <thead>
                <tr>
                  <th style="width: 45px;">अ.क्र.</th>
                  <th>सेवा व शुल्क तपशील / Fee Head Particulars</th>
                  <th style="width: 120px;">लेखाशीर्ष (Ledger)</th>
                  <th class="amount" style="width: 120px;">रक्कम / Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="text-align: center; font-weight: 700;">1</td>
                  <td>
                    <div style="font-weight: 800; color: #0f172a;">${receipt.serviceNameLocal || receipt.serviceName}</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 1px;">${receipt.serviceName} • ${receipt.departmentName}</div>
                  </td>
                  <td style="font-family: monospace; font-size: 10px; color: #475569;">140-10-01 (RTS Fee)</td>
                  <td class="amount">₹${baseAmountFormatted}</td>
                </tr>
                <tr>
                  <td style="text-align: center;">2</td>
                  <td style="color: #64748b; font-size: 10.5px;">विलंब शुल्क / दंड (Late Fee / Penalty)</td>
                  <td style="font-family: monospace; font-size: 10px; color: #94a3b8;">140-10-02</td>
                  <td class="amount" style="color: #64748b;">₹${lateFeeFormatted}</td>
                </tr>
                <tr>
                  <td style="text-align: center;">3</td>
                  <td style="color: #64748b; font-size: 10.5px;">सूट / सवलत (Discount / Rebate)</td>
                  <td style="font-family: monospace; font-size: 10px; color: #94a3b8;">140-10-03</td>
                  <td class="amount" style="color: #047857;">- ₹${discountFormatted}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding-right: 14px;">Total Amount Paid / एकूण भरलेली शासकीय रक्कम:</td>
                  <td class="amount">₹${amountFormatted}</td>
                </tr>
              </tbody>
            </table>

            <div class="words-card">
              <div><strong>अक्षरी रक्कम (मराठी):</strong> ${amountInWordsMr}</div>
              <div style="margin-top: 2px;"><strong>In Words (English):</strong> ${amountInWordsEn}</div>
            </div>

            <div class="audit-grid" style="grid-template-columns: repeat(2, 1fr); gap: 10px;">
              <div class="audit-item">
                <span class="label">Payment Mode & Channel / माध्यम व चॅनेल:</span>
                <span class="value" style="color: #047857;">${receipt.paymentMode || (isOffline ? 'Cash / रोख' : 'Online Gateway')} • ${channelText}</span>
              </div>
              <div class="audit-item">
                <span class="label">Transaction No. / व्यवहार क्र.:</span>
                <span class="value">${receipt.transactionNo || `TXN${receipt.transactionId || ''}`}</span>
              </div>
              <div class="audit-item">
                <span class="label">Gateway / Payment Ref ID:</span>
                <span class="value">${receipt.gatewayPaymentId || receipt.instrumentNo || (isOffline ? 'COUNTER_COLLECTION' : 'ONLINE_GATEWAY')}</span>
              </div>
              <div class="audit-item">
                <span class="label">Bank / Instrument / Account Ref:</span>
                <span class="value">${receipt.bankName ? `${receipt.bankName}${receipt.instrumentNo ? ` (क्र. ${receipt.instrumentNo})` : ''}` : (receipt.bankRefNo || receipt.payerVpaOrAccount || 'Verified')}</span>
              </div>
              ${receipt.counterOfficerName ? `
                <div class="audit-item" style="grid-column: span 2; border-top: 1px dashed #cbd5e1; padding-top: 5px; margin-top: 2px;">
                  <span class="label">शुल्क स्वीकारणारे अधिकारी / Collected By:</span>
                  <span class="value" style="color: #1e3a8a;">${receipt.counterOfficerName} (CFC नागरी सुविधा केंद्र काऊंटर)</span>
                </div>
              ` : ''}
              ${receipt.remarks ? `
                <div class="audit-item" style="grid-column: span 2; font-size: 9.5px; color: #64748b;">
                  <span class="label">शेरा / Remarks:</span>
                  <span class="value" style="font-weight: 500;">${receipt.remarks}</span>
                </div>
              ` : ''}
            </div>

            <div class="footer-note">
              <div>
                <span class="verify-tag">✓ Online Verified & Authenticated</span>
                <div style="font-size: 9px; color: #94a3b8;">Digital e-Receipt • citizen.scipl.info.in</div>
              </div>
              <div style="text-align: right;">
                <div>This is a computer-generated official receipt.</div>
                <div>ही अधिकृत संगणकीकृत पावती असून स्वाक्षरीची आवश्यकता नाही.</div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const doc = printIframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
      } catch (err) {
        console.error('Print failed:', err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        }, 1500);
      }
    }, 400);
  }
}

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
      printReceiptElement(receipt);
    }
  };

  const formattedDate = formatReceiptDate(receipt.paymentDate);
  const customerEmail = getReceiptEmail(receipt.customerEmail);

  const cookieUlb = getUlbDataFromCookies();
  const ulbNameEn = receipt.ulbName || cookieUlb.ulbName || 'MUNICIPAL CORPORATION';
  const ulbNameMr = receipt.ulbNameLocal || cookieUlb.ulbNameLocal || 'महानगरपालिका';
  let ulbLogo = receipt.ulbLogo || cookieUlb.ulbLogo || '/images/rts-logo.png';
  if (ulbLogo && !ulbLogo.startsWith('http://') && !ulbLogo.startsWith('https://') && !ulbLogo.startsWith('/')) {
    ulbLogo = `/api/UlbImageMaster/${ulbLogo}/view`;
  }

  const isOffline =
    (receipt.paymentMode && /cash|cheque|dd|pos|challan/i.test(receipt.paymentMode)) ||
    (receipt.paymentGateway && /counter|offline/i.test(receipt.paymentGateway)) ||
    Boolean(receipt.counterOfficerName);

  const channelText = receipt.channel || (isOffline ? 'CFC Municipal Counter (नागरी सुविधा केंद्र काऊंटर)' : 'Online Citizen Portal (ऑनलाइन नागरिक पोर्टल)');
  const amountFormatted = Number(receipt.amount || 0).toFixed(2);
  const baseAmountFormatted = Number(receipt.baseAmount || receipt.amount || 0).toFixed(2);
  const lateFeeFormatted = Number(receipt.lateFeeAmount || 0).toFixed(2);
  const discountFormatted = Number(receipt.discountAmount || 0).toFixed(2);

  const amountInWordsEn = receipt.amountInWords || `${receipt.amount} Rupees Only`;
  const amountInWordsMr = receipt.amountInWordsLocal || `${receipt.amount} रुपये फक्त`;

  return (
    <div
      className={`w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#143D7D] ${className}`}
    >
      {/* Header Banner - Official Municipal Identity */}
      <div className="bg-[#143D7D] px-4 sm:px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#0f2e5e]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-sm border border-slate-200">
            {ulbLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ulbLogo} alt={ulbNameEn} className="w-10 h-10 object-contain" />
            ) : (
              <Building2 className="w-6 h-6 text-[#143D7D]" />
            )}
          </div>
          <div>
            <h2 className="font-black text-base sm:text-lg tracking-tight leading-tight text-white">
              {ulbNameMr}
            </h2>
            <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider">
              {ulbNameEn} • महाराष्ट्र शासन
            </p>
            <p className="text-[11px] text-amber-300 font-bold flex items-center gap-1.5 mt-0.5">
              <Receipt className="w-3.5 h-3.5" />
              <span>शासकीय शुल्क ई-पावती / Official Government e-Receipt</span>
            </p>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-semibold text-blue-100">
              <span>
                Department / विभाग:{' '}
                <strong className="font-extrabold text-white">
                  {receipt.departmentNameLocal || receipt.departmentName || ''}
                </strong>
              </span>
              <span>
                Service / सेवा:{' '}
                <strong className="font-extrabold text-white">
                  {receipt.serviceNameLocal || receipt.serviceName || ''}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white border border-emerald-400 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>PAYMENT SUCCESS</span>
          </span>
          <span className="text-[10px] text-blue-200 font-mono mt-1">
            RTS ACT 2015 / लोकसेवा हक्क
          </span>
        </div>
      </div>

      {/* Receipt Body */}
      <div className="p-4 sm:p-6 space-y-4 text-slate-800 bg-white">
        {/* Receipt Identification Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt No. / पावती क्र.</span>
            <span className="font-mono font-extrabold text-blue-900 text-xs sm:text-sm break-all">{receipt.receiptNo || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application / अर्ज क्र.</span>
            <span className="font-mono font-extrabold text-slate-800 text-xs sm:text-sm break-all">{receipt.applicationNo || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt Date / दिनांक</span>
            <span className="font-semibold text-slate-700 text-xs">{formattedDate}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Mode / माध्यम</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1 text-xs">
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>{receipt.paymentMode || (isOffline ? 'Cash / रोख' : 'Online Gateway')}</span>
            </span>
          </div>
        </div>

        {/* Citizen Details Section */}
        <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Applicant Information / अर्जदाराचा तपशील</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 lowercase first-letter:uppercase">
              {channelText}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-0.5">
            <div>
              <span className="text-slate-400 block font-medium text-[11px]">Applicant Name / अर्जदाराचे नाव:</span>
              <span className="font-bold text-slate-900 text-xs break-words">{receipt.customerName || 'Citizen Applicant'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium text-[11px]">Mobile No. / मोबाईल क्र.:</span>
              <span className="font-mono font-semibold text-slate-800 flex items-center gap-1 text-xs">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{receipt.customerMobile || 'N/A'}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium text-[11px]">Email / ईमेल:</span>
              <span className="font-mono text-slate-700 text-xs break-all block flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{customerEmail}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Service & Fee Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Service & Fee Particulars / सेवा व शासकीय शुल्क तपशील</span>
            </div>
            <span>Amount / रक्कम (₹)</span>
          </div>

          <div className="p-3.5 space-y-2.5 text-xs bg-white">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm block break-words">
                  {receipt.serviceNameLocal || receipt.serviceName}
                </span>
                <span className="text-slate-500 font-medium text-[11px] block break-words mt-0.5">
                  {receipt.serviceName} • {receipt.departmentName}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm shrink-0">
                ₹{baseAmountFormatted}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-500 text-[11px]">
              <span>विलंब शुल्क / दंड (Late Fee / Penalty):</span>
              <span className="font-mono font-medium">₹{lateFeeFormatted}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>सूट / सवलत (Discount / Rebate):</span>
              <span className="font-mono font-medium text-emerald-600">- ₹{discountFormatted}</span>
            </div>

            {/* Total Paid Row */}
            <div className="pt-2.5 border-t-2 border-slate-800 flex justify-between items-center text-xs sm:text-sm font-bold text-slate-900">
              <div className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-700" />
                <span>Total Amount Paid / एकूण भरलेली शासकीय रक्कम:</span>
              </div>
              <span className="text-base sm:text-lg font-black text-emerald-700 font-mono shrink-0">
                ₹{amountFormatted}
              </span>
            </div>

            {/* Amount in words */}
            <div className="bg-emerald-50/80 p-2.5 sm:p-3 rounded-lg border border-emerald-200 text-xs space-y-0.5">
              <span className="text-emerald-950 font-bold block text-[11px] sm:text-xs">
                अक्षरी रक्कम (मराठी): <span className="font-medium text-emerald-900">{amountInWordsMr}</span>
              </span>
              <span className="text-emerald-900 text-[10.5px] block">
                In Words (English): <span className="font-semibold">{amountInWordsEn}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Reference & Audit Trail */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-200/80 pb-1.5">
            <span>Payment & Resource Details / देयक व साधन संदर्भ</span>
            <span className="font-semibold text-blue-800 lowercase first-letter:uppercase">{channelText}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Payment Mode / पद्धत:</span>
              <span className="font-bold text-emerald-800 block text-xs">{receipt.paymentMode || (isOffline ? 'Cash / रोख' : 'Online Gateway')}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Transaction No. / व्यवहार क्र.:</span>
              <span className="font-mono font-semibold text-slate-800 break-all block">{receipt.transactionNo || `TXN${receipt.transactionId || ''}`}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Payment Ref / Gateway ID:</span>
              <span className="font-mono font-semibold text-slate-800 break-all block">{receipt.gatewayPaymentId || receipt.instrumentNo || (isOffline ? 'COUNTER_PAYMENT' : 'ONLINE_GATEWAY')}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Bank / Instrument Ref:</span>
              <span className="font-mono font-semibold text-slate-800 break-all block">
                {receipt.bankName ? `${receipt.bankName}${receipt.instrumentNo ? ` (${receipt.instrumentNo})` : ''}` : (receipt.bankRefNo || receipt.payerVpaOrAccount || 'Verified')}
              </span>
            </div>
          </div>

          {receipt.counterOfficerName && (
            <div className="border-t border-slate-200/80 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
              <span className="text-slate-500 font-medium">शुल्क स्वीकारणारे अधिकारी (Collected By):</span>
              <span className="font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                {receipt.counterOfficerName} (CFC नागरी सुविधा केंद्र काऊंटर)
              </span>
            </div>
          )}

          {receipt.remarks && (
            <div className="border-t border-slate-200/80 pt-1.5 text-[10.5px] text-slate-500">
              <span className="font-medium text-slate-600">शेरा / Remarks: </span>
              <span>{receipt.remarks}</span>
            </div>
          )}
        </div>

        {/* Official Seal & Computer Generated Disclaimer */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Online Verified & Authenticated</span>
              </p>
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
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            RTS Public Portal • {ulbNameEn}
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              type="button"
              onClick={handleDefaultPrint}
              icon={Printer}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#143D7D] hover:bg-[#0f2e5e] rounded-xl transition shadow cursor-pointer"
            >
              Print Receipt / पावती प्रिंट करा
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
