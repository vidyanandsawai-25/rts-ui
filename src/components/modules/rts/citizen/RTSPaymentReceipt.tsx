'use client';

import React from 'react';
import {
  Printer,
  CreditCard,
  User,
  Phone,
  Mail,
  Receipt,
  ShieldCheck,
  Layers,
  Banknote,
  CheckCircle2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/common';
import { getUlbDataFromCookies } from '@/lib/utils/cookie';
import type { PaymentReceiptResult } from '@/lib/api/rts/rtspayment.service';

function formatReceiptDate(value?: string): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
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
  const ulbName = receipt.ulbNameLocal || cookieUlb.ulbNameLocal || receipt.ulbName || cookieUlb.ulbName || 'महानगरपालिका';
  const ulbLogo = receipt.ulbLogo || cookieUlb.ulbLogo || '/images/logo.png';

  const isOffline =
    (receipt.paymentMode && /cash|cheque|dd|pos|challan/i.test(receipt.paymentMode)) ||
    (receipt.paymentGateway && /counter|offline/i.test(receipt.paymentGateway)) ||
    Boolean(receipt.counterOfficerName);

  const channelText = isOffline ? 'नागरी सुविधा केंद्र (CFC काऊंटर)' : 'ऑनलाइन नागरिक पोर्टल';
  const paymentModeText = isOffline ? 'रोख (Cash)' : (receipt.paymentMode || 'ऑनलाइन / UPI');
  const amountFormatted = Number(receipt.amount || 0).toFixed(2);
  const baseAmountFormatted = Number(receipt.baseAmount || receipt.amount || 0).toFixed(2);
  const lateFeeFormatted = Number(receipt.lateFeeAmount || 0).toFixed(2);
  const discountFormatted = Number(receipt.discountAmount || 0).toFixed(2);

  const amountInWordsMr = receipt.amountInWordsLocal || `${receipt.amount} रुपये फक्त`;

  const origin = window.location.origin;
  const qrUrl = `${origin}/mr/service/verify-certificate/${encodeURIComponent(receipt.applicationNo || '')}`;
  const qrImgTag = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrUrl)}`;

  const deptName = receipt.departmentNameLocal || receipt.departmentName || '-';
  const srvName = receipt.serviceNameLocal || receipt.serviceName || '-';

  const html = `
    <!DOCTYPE html>
    <html lang="mr">
      <head>
        <title>पावती_${receipt.receiptNo || receipt.applicationNo}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", Arial, sans-serif;
          }
          body {
            background: #ffffff;
            color: #0f172a;
            padding: 10px;
            font-size: 11.5px;
            line-height: 1.45;
          }
          .receipt-container {
            border: 2px solid #0f3675;
            border-radius: 12px;
            overflow: hidden;
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            position: relative;
          }
          .watermark-bg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 280px;
            height: 280px;
            opacity: 0.05;
            pointer-events: none;
            background-image: url('${ulbLogo}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 0;
          }
          .receipt-content {
            position: relative;
            z-index: 1;
          }
          .receipt-header {
            background: #0f3675;
            color: #ffffff;
            padding: 14px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0a2552;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-box {
            width: 54px;
            height: 54px;
            background: #ffffff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 3px;
            border: 1px solid #94a3b8;
          }
          .logo-box img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .header-center h1 {
            font-size: 17px;
            font-weight: 900;
            color: #ffffff;
            margin-bottom: 1px;
          }
          .header-center .sub-head {
            font-size: 11px;
            color: #bfdbfe;
            font-weight: 700;
          }
          .header-center .tag-line {
            color: #fde047;
            font-size: 11.5px;
            font-weight: 800;
            margin-top: 2px;
          }
          .header-right {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .qr-box {
            background: #ffffff;
            padding: 4px;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            text-align: center;
          }
          .qr-box img {
            width: 52px;
            height: 52px;
            display: block;
          }
          .qr-box .qr-label {
            font-size: 7.5px;
            font-weight: 800;
            color: #0f3675;
            margin-top: 1px;
          }
          .status-badge {
            background: #059669;
            color: #ffffff;
            padding: 5px 10px;
            border-radius: 6px;
            font-weight: 900;
            font-size: 11px;
            letter-spacing: 0.5px;
            text-align: center;
            border: 1px solid #34d399;
          }
          .service-banner {
            background: #f1f5f9;
            border-bottom: 1px solid #cbd5e1;
            padding: 8px 16px;
            font-size: 11px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .service-banner .dept-srv {
            font-weight: 700;
            color: #1e293b;
          }
          .service-banner .dept-srv strong {
            color: #0f3675;
            font-weight: 900;
          }
          .receipt-body {
            padding: 14px 18px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 12px;
          }
          .meta-item .label {
            font-size: 9px;
            font-weight: 800;
            color: #64748b;
            margin-bottom: 2px;
            display: block;
          }
          .meta-item .value {
            font-size: 11.5px;
            font-weight: 800;
            color: #0f172a;
            word-break: break-all;
          }
          .meta-item .highlight {
            color: #0f3675;
          }
          .meta-item .success {
            color: #047857;
          }
          .section-card {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 12px;
            background: #ffffff;
          }
          .section-title {
            font-size: 10.5px;
            font-weight: 800;
            color: #334155;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          .info-item .label {
            font-size: 9.5px;
            color: #64748b;
            font-weight: 600;
          }
          .info-item .value {
            font-size: 11.5px;
            font-weight: 800;
            color: #0f172a;
          }
          .fee-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #94a3b8;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 12px;
          }
          .fee-table th {
            background: #e2e8f0;
            padding: 7px 10px;
            font-size: 10.5px;
            font-weight: 800;
            color: #0f172a;
            text-align: left;
            border-bottom: 1px solid #94a3b8;
            border-right: 1px solid #cbd5e1;
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
            border-bottom: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
          }
          .fee-table td:last-child {
            border-right: none;
          }
          .fee-table td.amount {
            text-align: right;
            font-weight: 800;
          }
          .fee-table tr.total-row td {
            border-top: 2px solid #0f172a;
            font-size: 12.5px;
            font-weight: 900;
            color: #047857;
            background: #f1f5f9;
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
          .audit-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 10px;
            margin-bottom: 10px;
          }
          .audit-item .label {
            color: #64748b;
            font-size: 9px;
            font-weight: 700;
          }
          .audit-item .value {
            font-weight: 800;
            color: #1e293b;
          }
          .footer-note {
            border-top: 1px dashed #94a3b8;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9.5px;
            color: #64748b;
          }
          .footer-note .disclaimer {
            max-width: 600px;
            line-height: 1.35;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="watermark-bg"></div>
          <div class="receipt-content">
            <div class="receipt-header">
              <div class="header-left">
                <div class="logo-box">
                  <img src="${ulbLogo}" alt="मानचिन्ह" onerror="this.style.display='none'" />
                </div>
                <div class="header-center">
                  <h1>${ulbName}</h1>
                  <div class="sub-head">महाराष्ट्र शासन • महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५</div>
                  <div class="tag-line">शासकीय शुल्क ई-पावती</div>
                </div>
              </div>
              <div class="header-right">
                <div class="qr-box">
                  <img src="${qrImgTag}" alt="QR Code" />
                  <div class="qr-label">पडताळणी QR</div>
                </div>
                <div class="status-badge">
                  <div>✔ शुल्क प्राप्त</div>
                </div>
              </div>
            </div>

            <div class="service-banner">
              <div class="dept-srv">
                विभाग: <strong>${deptName}</strong>
              </div>
              <div class="dept-srv">
                सेवा: <strong>${srvName}</strong>
              </div>
            </div>

            <div class="receipt-body">
              <div class="meta-grid">
                <div class="meta-item">
                  <span class="label">पावती क्रमांक</span>
                  <span class="value highlight">${receipt.receiptNo || '-'}</span>
                </div>
                <div class="meta-item">
                  <span class="label">अर्ज क्रमांक</span>
                  <span class="value">${receipt.applicationNo || '-'}</span>
                </div>
                <div class="meta-item">
                  <span class="label">पावती दिनांक व वेळ</span>
                  <span class="value">${formattedDate}</span>
                </div>
                <div class="meta-item">
                  <span class="label">पेमेंट पद्धत</span>
                  <span class="value success">${paymentModeText}</span>
                </div>
              </div>

              <div class="section-card">
                <div class="section-title">
                  <span>अर्जदाराचा तपशील</span>
                  <span style="font-size: 9px; color: #64748b;">${channelText}</span>
                </div>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">अर्जदाराचे संपूर्ण नाव:</span>
                    <span class="value">${receipt.customerName || 'नागरिक अर्जदार'}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">मोबाईल क्रमांक:</span>
                    <span class="value">${receipt.customerMobile || '-'}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">ईमेल आयडी:</span>
                    <span class="value">${customerEmail || '-'}</span>
                  </div>
                </div>
              </div>

              <table class="fee-table">
                <thead>
                  <tr>
                    <th style="width: 45px; text-align: center;">अ.क्र.</th>
                    <th>सेवा व शासकीय शुल्क तपशील</th>
                    <th style="width: 140px;">लेखाशीर्ष (Budget Head)</th>
                    <th class="amount" style="width: 120px;">रक्कम (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="text-align: center; font-weight: 700;">१</td>
                    <td>
                      <div style="font-weight: 800; color: #0f172a;">${srvName}</div>
                      <div style="font-size: 10px; color: #64748b; margin-top: 1px;">${deptName}</div>
                    </td>
                    <td style="font-family: monospace; font-size: 10.5px; color: #475569;">140-10-01 (RTS Fee)</td>
                    <td class="amount">₹${baseAmountFormatted}</td>
                  </tr>
                  <tr>
                    <td style="text-align: center; color: #64748b;">२</td>
                    <td style="color: #64748b; font-size: 10.5px;">विलंब शुल्क / दंड</td>
                    <td style="font-family: monospace; font-size: 10px; color: #94a3b8;">140-10-02</td>
                    <td class="amount" style="color: #64748b;">₹${lateFeeFormatted}</td>
                  </tr>
                  <tr>
                    <td style="text-align: center; color: #64748b;">३</td>
                    <td style="color: #64748b; font-size: 10.5px;">सूट / सवलत</td>
                    <td style="font-family: monospace; font-size: 10px; color: #94a3b8;">140-10-03</td>
                    <td class="amount" style="color: #047857;">- ₹${discountFormatted}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding-right: 15px;">एकूण भरलेली शासकीय रक्कम:</td>
                    <td class="amount">₹${amountFormatted}</td>
                  </tr>
                </tbody>
              </table>

              <div class="words-card">
                <div><strong>अक्षरी रक्कम:</strong> ${amountInWordsMr}</div>
              </div>

              <div class="audit-grid">
                <div class="audit-item">
                  <span class="label">व्यवहार संदर्भ क्र.</span>
                  <span class="value">${receipt.transactionNo || `TXN${receipt.transactionId || '-'}`}</span>
                </div>
                <div class="audit-item">
                  <span class="label">गेटवे संदर्भ क्र.</span>
                  <span class="value">${receipt.gatewayPaymentId || receipt.bankRefNo || (isOffline ? 'काऊंटर रोख' : 'ऑनलाइन गेटवे')}</span>
                </div>
                <div class="audit-item">
                  <span class="label">पेमेंट स्त्रोत</span>
                  <span class="value">${isOffline ? 'नागरी सुविधा केंद्र' : 'नागरिक पोर्टल'}</span>
                </div>
                <div class="audit-item">
                  <span class="label">शुल्क संकलन केंद्र</span>
                  <span class="value">${receipt.counterOfficerName || `${ulbName}`}</span>
                </div>
              </div>

              <div class="footer-note">
                <div class="disclaimer">
                  <p><strong>टीप:</strong> सदर पावती संगणकीकृत अधिकृत शासकीय ई-पावती असून यावर स्वाक्षरीची आवश्यकता नाही.</p>
                  <p>महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ अंतर्गत अधिकृतपणे ग्राह्य व वैध आहे.</p>
                </div>
                <div style="text-align: right; font-weight: 700; color: #0f3675;">
                  ${ulbName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
  if (!iframeDoc) return;

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  printIframe.onload = () => {
    setTimeout(() => {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printIframe);
      }, 1000);
    }, 300);
  };
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
  className = '',
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
  const ulbName = receipt.ulbNameLocal || cookieUlb.ulbNameLocal || receipt.ulbName || cookieUlb.ulbName || 'महानगरपालिका';
  const ulbLogo = receipt.ulbLogo || cookieUlb.ulbLogo || '/images/logo.png';

  const isOffline =
    (receipt.paymentMode && /cash|cheque|dd|pos|challan/i.test(receipt.paymentMode)) ||
    (receipt.paymentGateway && /counter|offline/i.test(receipt.paymentGateway)) ||
    Boolean(receipt.counterOfficerName);

  const channelText = isOffline ? 'नागरी सुविधा केंद्र (CFC काऊंटर)' : 'ऑनलाइन नागरिक पोर्टल';
  const paymentModeText = isOffline ? 'रोख (Cash)' : (receipt.paymentMode || 'ऑनलाइन / UPI');
  const amountFormatted = Number(receipt.amount || 0).toFixed(2);
  const baseAmountFormatted = Number(receipt.baseAmount || receipt.amount || 0).toFixed(2);
  const lateFeeFormatted = Number(receipt.lateFeeAmount || 0).toFixed(2);
  const discountFormatted = Number(receipt.discountAmount || 0).toFixed(2);

  const amountInWordsMr = receipt.amountInWordsLocal || `${receipt.amount} रुपये फक्त`;

  const deptName = receipt.departmentNameLocal || receipt.departmentName || '-';
  const srvName = receipt.serviceNameLocal || receipt.serviceName || '-';

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `${origin}/mr/service/verify-certificate/${encodeURIComponent(receipt.applicationNo || '')}`;

  return (
    <div
      className={`relative w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#0F3675] ${className}`}
    >
      {/* Background Municipal Watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage: `url(${ulbLogo})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '300px 300px',
        }}
      />

      <div className="relative z-10">
        {/* Header Banner - Official Municipal Identity */}
        <div className="bg-[#0F3675] px-4 sm:px-6 py-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#0A2552]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-sm border border-slate-200">
              <img src={ulbLogo} alt={ulbName} className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg tracking-tight leading-tight text-white">
                {ulbName}
              </h2>
              <p className="text-[11px] font-semibold text-blue-200">
                महाराष्ट्र शासन • महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५
              </p>
              <p className="text-[11.5px] text-amber-300 font-bold flex items-center gap-1.5 mt-0.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>शासकीय शुल्क ई-पावती</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:self-center shrink-0">
            {/* Dynamic Scannable QR Code */}
            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-xs flex flex-col items-center justify-center shrink-0">
              <QRCodeSVG value={qrUrl} size={48} level="M" />
              <span className="text-[7.5px] font-extrabold text-[#0F3675] mt-0.5">पडताळणी QR</span>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black bg-emerald-600 text-white border border-emerald-400 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>शुल्क प्राप्त</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Department & Service Bar */}
        <div className="bg-slate-100 px-4 sm:px-6 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
          <div>
            <span className="text-slate-500 font-semibold">विभाग: </span>
            <strong className="text-[#0F3675] font-extrabold">{deptName}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">सेवा: </span>
            <strong className="text-[#0F3675] font-extrabold">{srvName}</strong>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-4 sm:p-6 space-y-4 text-slate-800 bg-white/95">
          {/* Receipt Identification Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">पावती क्रमांक</span>
              <span className="font-mono font-extrabold text-[#0F3675] text-xs sm:text-sm break-all">{receipt.receiptNo || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">अर्ज क्रमांक</span>
              <span className="font-mono font-extrabold text-slate-800 text-xs sm:text-sm break-all">{receipt.applicationNo || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">पावती दिनांक व वेळ</span>
              <span className="font-semibold text-slate-700 text-xs">{formattedDate}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">पेमेंट पद्धत</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1 text-xs">
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>{paymentModeText}</span>
              </span>
            </div>
          </div>

          {/* Citizen Details Section */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
            <div className="text-xs font-bold text-slate-600 flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0F3675] shrink-0" />
                <span>अर्जदाराचा तपशील</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                {channelText}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-0.5">
              <div>
                <span className="text-slate-400 block font-medium text-[11px]">अर्जदाराचे नाव:</span>
                <span className="font-bold text-slate-900 text-xs break-words">{receipt.customerName || 'नागरिक अर्जदार'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium text-[11px]">मोबाईल क्र.:</span>
                <span className="font-mono font-semibold text-slate-800 flex items-center gap-1 text-xs">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{receipt.customerMobile || '-'}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium text-[11px]">ईमेल आयडी:</span>
                <span className="font-mono text-slate-700 text-xs break-all block flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{customerEmail || '-'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Service & Fee Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>सेवा व शासकीय शुल्क तपशील</span>
              </div>
              <span>रक्कम (₹)</span>
            </div>

            <div className="p-3.5 space-y-2.5 text-xs bg-white">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm block break-words">
                    {srvName}
                  </span>
                  <span className="text-slate-500 font-medium text-[11px] block break-words mt-0.5">
                    {deptName}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm shrink-0">
                  ₹{baseAmountFormatted}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-500 text-[11px]">
                <span>विलंब शुल्क / दंड:</span>
                <span className="font-mono font-medium">₹{lateFeeFormatted}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>सूट / सवलत:</span>
                <span className="font-mono font-medium text-emerald-600">- ₹{discountFormatted}</span>
              </div>

              {/* Total Paid Row */}
              <div className="pt-2.5 border-t-2 border-slate-800 flex justify-between items-center text-xs sm:text-sm font-bold text-slate-900">
                <div className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-700" />
                  <span>एकूण भरलेली शासकीय रक्कम:</span>
                </div>
                <span className="text-base sm:text-lg font-black text-emerald-700 font-mono shrink-0">
                  ₹{amountFormatted}
                </span>
              </div>

              {/* Amount in words */}
              <div className="bg-emerald-50/80 p-2.5 sm:p-3 rounded-lg border border-emerald-200 text-xs space-y-0.5">
                <span className="text-emerald-950 font-bold block text-[11px] sm:text-xs">
                  अक्षरी रक्कम: <span className="font-medium text-emerald-900">{amountInWordsMr}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Reference & Audit Trail */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-200/80 pb-1.5">
              <span>देयक व व्यवहार संदर्भ</span>
              <span className="font-semibold text-[#0F3675]">{channelText}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 font-medium block text-[10px]">पेमेंट पद्धत:</span>
                <span className="font-bold text-emerald-800 block text-xs">{paymentModeText}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px]">व्यवहार संदर्भ क्र.:</span>
                <span className="font-mono font-semibold text-slate-800 break-all block">{receipt.transactionNo || `TXN${receipt.transactionId || '-'}`}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px]">गेटवे संदर्भ क्र.:</span>
                <span className="font-mono font-semibold text-slate-800 break-all block">{receipt.gatewayPaymentId || receipt.instrumentNo || (isOffline ? 'काऊंटर रोख' : 'ऑनलाइन गेटवे')}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px]">बँक संदर्भ क्र.:</span>
                <span className="font-mono font-semibold text-slate-800 break-all block">
                  {receipt.bankName ? `${receipt.bankName}${receipt.instrumentNo ? ` (${receipt.instrumentNo})` : ''}` : (receipt.bankRefNo || receipt.payerVpaOrAccount || 'पडताळणीकृत')}
                </span>
              </div>
            </div>

            {receipt.counterOfficerName && (
              <div className="border-t border-slate-200/80 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <span className="text-slate-500 font-medium">शुल्क स्वीकारणारे अधिकारी:</span>
                <span className="font-bold text-[#0F3675] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {receipt.counterOfficerName} (नागरी सुविधा केंद्र)
                </span>
              </div>
            )}

            {receipt.remarks && (
              <div className="border-t border-slate-200/80 pt-1.5 text-[10.5px] text-slate-500">
                <span className="font-medium text-slate-600">शेरा: </span>
                <span>{receipt.remarks}</span>
              </div>
            )}
          </div>

          {/* Official Seal & Computer Generated Disclaimer */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-white border border-slate-200 text-slate-700 shrink-0">
                <QRCodeSVG value={qrUrl} size={36} level="M" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ऑनलाइन अधिकृत पडताळणीकृत</span>
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  डिजिटल शासकीय ई-पावती • <span className="text-[#0F3675] font-semibold">{ulbName}</span>
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right text-[10.5px] text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-700">सदर पावती संगणकीकृत अधिकृत शासकीय ई-पावती असून स्वाक्षरीची आवश्यकता नाही.</p>
              <p>महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ अंतर्गत पूर्णपणे वैध आहे.</p>
            </div>
          </div>
        </div>

        {/* Action Footer Bar - Print / Download */}
        {showActions && (
          <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
              लोकसेवा हक्क पोर्टल • {ulbName}
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                type="button"
                onClick={handleDefaultPrint}
                icon={Printer}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#0F3675] hover:bg-[#0A2552] rounded-xl transition shadow cursor-pointer"
              >
                पावती प्रिंट करा
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RTSPaymentReceipt;
