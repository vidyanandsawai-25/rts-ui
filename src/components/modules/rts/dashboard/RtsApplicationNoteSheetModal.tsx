'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Printer,
  Building2,
  User,
  Award,
  Layers,
  FileCheck,
  Check,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLocale } from 'next-intl';

import { Badge, type BadgeVariant, Button, Modal } from '@/components/common';
import { getUlbDataFromCookies } from '@/lib/utils/cookie';
import {
  fetchDscMetadataAction,
  fetchTrackApplicationHistoryAction,
  type RTSTrackApplicationHistoryItem,
  type RtsApplicationProcessData,
} from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import type { RtsApplicationProcessDrawerRecord } from '@/components/modules/rts/dashboard/RtsApplicationProcessDrawer';
import type {
  RtsApplicationApprovalStage,
  RtsApplicationDocumentItem,
} from '@/types/rts/application-approval.types';
import type { DigitalSignatureMetadata } from '@/types/rts/certificate.types';

export interface RtsApplicationNoteSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: RtsApplicationProcessDrawerRecord | null;
  data: RtsApplicationProcessData | null;
}

export default function RtsApplicationNoteSheetModal({
  isOpen,
  onClose,
  record,
  data,
}: RtsApplicationNoteSheetModalProps) {
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [logoError, setLogoError] = useState(false);
  const locale = useLocale();

  // Dynamic ULB information from cookies / configuration
  const [ulbInfo, setUlbInfo] = useState<{
    nameLocal: string;
    nameEnglish: string;
    logoUrl: string;
    sealUrl: string;
    code: string;
    address: string;
  }>(() => {
    const cookieData = getUlbDataFromCookies();
    return {
      nameLocal: cookieData.ulbNameLocal || cookieData.ulbName || '',
      nameEnglish: (cookieData.ulbName || '').toUpperCase(),
      logoUrl: (cookieData.ulbLogo || '/images/logo.png').trim(),
      sealUrl: '/images/ulb-seal.png',
      code: cookieData.ulbCode || '',
      address: cookieData.ulbAddress || '',
    };
  });

  // Dynamic Digital Signature Metadata
  const [dscMetadata, setDscMetadata] = useState<DigitalSignatureMetadata | null>(null);
  // Dynamic Real-time Audit History from rts.TrackApplicationHistory
  const [trackHistory, setTrackHistory] = useState<RTSTrackApplicationHistoryItem[]>([]);

  useEffect(() => {
    if (!isOpen || !record) return;

    const cookieData = getUlbDataFromCookies();
    setUlbInfo({
      nameLocal: cookieData.ulbNameLocal || cookieData.ulbName || '',
      nameEnglish: (cookieData.ulbName || '').toUpperCase(),
      logoUrl: (cookieData.ulbLogo || '/images/logo.png').trim(),
      sealUrl: '/images/ulb-seal.png',
      code: cookieData.ulbCode || '',
      address: cookieData.ulbAddress || '',
    });

    // Fetch live DSC certificate metadata from backend
    fetchDscMetadataAction().then((res) => {
      if (res.success && res.data) {
        setDscMetadata(res.data);
      }
    });

    // Fetch live Audit History from rts.TrackApplicationHistory
    const appIdNum = record.applicationId || (typeof (record as any).id === 'number' ? (record as any).id : parseInt(String((record as any).id || ''), 10)) || 0;
    if (appIdNum > 0) {
      fetchTrackApplicationHistoryAction(appIdNum).then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setTrackHistory(res.data);
        }
      });
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const applicationNo = data?.verification?.applicationNo || record.appId || 'N/A';
  const serviceName = record.serviceName || 'Public Service';
  const departmentName = record.departmentName?.trim() || '-';

  // Extract payment history and fees from trackHistory, verification, or record
  const paymentHistoryItem = trackHistory.find(
    (h) =>
      h.action?.toLowerCase().includes('payment') ||
      h.remark?.includes('₹') ||
      h.remark?.toLowerCase().includes('fee') ||
      h.remark?.toLowerCase().includes('receipt')
  );

  const extractedFeeFromHistory = (() => {
    if (!paymentHistoryItem?.remark) return null;
    const match = paymentHistoryItem.remark.match(/₹\s*([\d,]+(?:\.\d+)?)/);
    if (match && match[1]) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    const matchRs = paymentHistoryItem.remark.match(/(?:Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)/i);
    if (matchRs && matchRs[1]) {
      return parseFloat(matchRs[1].replace(/,/g, ''));
    }
    return null;
  })();

  const serviceFees =
    (data?.verification?.serviceFees !== null && data?.verification?.serviceFees !== undefined && data?.verification.serviceFees > 0)
      ? data.verification.serviceFees
      : extractedFeeFromHistory !== null
      ? extractedFeeFromHistory
      : (record as any)?.serviceFees ?? (record as any)?.amountPaid ?? (record as any)?.fees ?? null;

  const feesRequired = data?.verification?.feesRequired ?? (serviceFees !== null && serviceFees > 0) ?? false;

  // Extract applicant name from dynamic fields if not in record
  const applicantField = data?.details?.applicationDetails?.find((f) => {
    const label = (f.fieldLabel || f.fieldCode || '').toLowerCase();
    return label.includes('applicant') || label.includes('student') || label.includes('name');
  });
  const citizenName = record.citizenName || applicantField?.value || 'नागरिक';
  const submittedDate = record.submittedDate || 'N/A';
  const status = data?.verification?.applicationStatus || record.applicationStatus || 'Pending';
  const stages: RtsApplicationApprovalStage[] = data?.stages?.approvalStages || [];
  const verification = data?.verification || null;

  // Gather ONLY fields that have actual filled data (filter out empty / unentered fields)
  const fieldGroups = (() => {
    const groups = new Map<string, NonNullable<RtsApplicationProcessData['details']>['applicationDetails']>();
    for (const field of data?.details?.applicationDetails ?? []) {
      if (field.value === null || field.value === undefined || String(field.value).trim() === '') {
        continue;
      }
      const title = field.fieldGroup || 'General Details';
      const fields = groups.get(title) ?? [];
      fields.push(field);
      groups.set(title, fields);
    }
    return Array.from(groups.entries())
      .filter(([, fields]) => fields.length > 0)
      .map(([title, fields]) => ({
        title,
        fields: [...fields].sort((a, b) => a.displayOrder - b.displayOrder),
      }));
  })();

  // Gather ONLY actually attached / uploaded documents
  const attachedDocuments: RtsApplicationDocumentItem[] = (data?.details?.documents || []).filter(
    (doc: RtsApplicationDocumentItem) => doc.isUploaded && Boolean(doc.documentGuid)
  );

  // Determine the final approving officer for the main bottom DSC badge from track history or stages
  const lastApprovedHistory = trackHistory.slice().reverse().find(
    (h) => h.isDigitallySigned || h.action?.includes('DigitalSign') || h.action?.includes('Approved') || h.status === 'Approved'
  );

  const approvedOrLatestStage =
    stages.slice().reverse().find((s: RtsApplicationApprovalStage) => s.status?.toLowerCase().includes('approv') || s.completedDate) ||
    stages[stages.length - 1] ||
    null;

  const finalOfficerName =
    lastApprovedHistory?.actionByOfficerName ||
    lastApprovedHistory?.actionByUserName ||
    (approvedOrLatestStage?.firstName || approvedOrLatestStage?.lastName
      ? `${approvedOrLatestStage.firstName || ''} ${approvedOrLatestStage.lastName || ''}`.trim()
      : approvedOrLatestStage?.userName ||
        (verification?.firstName || verification?.lastName
          ? `${verification.firstName || ''} ${verification.lastName || ''}`.trim()
          : verification?.officerName || verification?.officerEmail || 'सक्षम प्राधिकारी'));

  const finalOfficerDesignation =
    lastApprovedHistory?.stageName ||
    approvedOrLatestStage?.stageName ||
    verification?.stageName ||
    'सक्षम प्राधिकारी (Designated Approval Officer)';

  const approvalDate =
    lastApprovedHistory?.createdDate
      ? new Date(lastApprovedHistory.createdDate).toLocaleDateString(locale === 'mr' ? 'mr-IN' : 'en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : approvedOrLatestStage?.completedDate ||
        approvedOrLatestStage?.createdDate ||
        new Date().toLocaleDateString(locale === 'mr' ? 'mr-IN' : 'en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

  // Pristine Isolated A4 Print Function (Bypasses modal viewport scroll offsets, strictly budgeted to 1-2 pages)
  const handlePrint = () => {
    const el = printContainerRef.current;
    if (!el) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NoteSheet_${applicationNo}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            * {
              font-family: 'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif;
              box-sizing: border-box;
            }
            @page {
              size: A4 portrait;
              margin: 4mm 6mm;
            }
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .notesheet-print-document {
                border: 1.5px solid #0f172a !important;
                box-shadow: none !important;
                padding: 2mm 2.5mm !important;
                max-width: 100% !important;
                width: 100% !important;
                border-radius: 0 !important;
                zoom: 87% !important; /* Responsive auto-fit scaling according to data density */
              }
              table td, table th {
                padding: 1px 3px !important;
                font-size: 8.8px !important;
                line-height: 1.15 !important;
              }
              .mb-2\\.5, .mb-3\\.5, .mb-4 {
                margin-bottom: 3.5px !important;
              }
              .space-y-1\\.5 > :not([hidden]) ~ :not([hidden]),
              .space-y-2 > :not([hidden]) ~ :not([hidden]) {
                margin-top: 2px !important;
              }
              table {
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              .break-inside-avoid {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background: white;">
          <div style="width: 100%; max-width: 794px; margin: 0 auto; padding: 0;">
            ${el.outerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  const getStatusBadgeVariant = (statusStr: string): BadgeVariant => {
    const s = statusStr.toLowerCase();
    if (s.includes('approv') || s.includes('complete') || s.includes('verified') || s.includes('done')) {
      return 'success';
    }
    if (s.includes('reject')) {
      return 'destructive';
    }
    if (s.includes('return') || s.includes('revert')) {
      return 'warning';
    }
    return 'default';
  };

  const cleanLabel = (text?: string | null): string => {
    if (!text) return '';
    return text
      .replace(/\s*\(\s*optional\s*\)/gi, '')
      .replace(/\s*\(\s*auto\s*\)/gi, '')
      .replace(/\s*\(\s*ऐच्छिक\s*\)/gi, '')
      .replace(/\s*\(\s*पर्यायी\s*\)/gi, '')
      .replace(/\s*\(\s*अनिवार्य\s*\)/gi, '')
      .replace(/\s*\(\s*mandatory\s*\)/gi, '')
      .replace(/\s*\(\s*स्वयं\s*\)/gi, '')
      .replace(/\s*\[\s*optional\s*\]/gi, '')
      .replace(/\s*\[\s*auto\s*\]/gi, '')
      .replace(/\s*\[\s*ऐच्छिक\s*\]/gi, '')
      .replace(/\s*\[\s*पर्यायी\s*\]/gi, '')
      .replace(/\s*\[\s*mandatory\s*\]/gi, '')
      .trim();
  };

  const renderFieldValue = (val: unknown, fieldType?: string) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-slate-400 font-normal italic">-</span>;
    }

    const strVal = String(val).trim();
    const lowerVal = strVal.toLowerCase();

    // Boolean True / Checkbox checked / Declaration Agreed
    if (
      lowerVal === 'true' ||
      (fieldType?.toLowerCase() === 'checkbox' && (lowerVal === '1' || lowerVal === 'yes' || lowerVal === 'true'))
    ) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 text-[10px]">
          <Check className="w-3 h-3 text-emerald-700 stroke-[2.5]" />
          मान्य / Agreed (Yes)
        </span>
      );
    }

    // Boolean False / Unchecked
    if (
      lowerVal === 'false' ||
      (fieldType?.toLowerCase() === 'checkbox' && (lowerVal === '0' || lowerVal === 'no' || lowerVal === 'false'))
    ) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200 text-[10px]">
          नाही (No)
        </span>
      );
    }

    return strVal;
  };

  const qrVerificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${locale}/service/verify-certificate/${encodeURIComponent(applicationNo)}`
    : `https://akolacity.gov.in/${locale}/service/verify-certificate/${encodeURIComponent(applicationNo)}`;

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        maxWidth="xl"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#0f3d62]/10 text-[#0f3d62] border border-[#0f3d62]/20 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-slate-800">
              अधिकृत टिपणी पत्रक व मंजुरी नोंद (Official RTS Note Sheet)
            </span>
          </div>
        }
        subtitle={
          <span className="text-xs text-slate-500 font-mono">
            {ulbInfo.nameLocal} • अर्ज क्र: <strong className="text-[#0f3d62] font-semibold">{applicationNo}</strong>
          </span>
        }
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <Button
              variant="contained"
              size="xs"
              icon={Printer}
              onClick={handlePrint}
              className="bg-[#0f3d62] hover:bg-[#0c314f] text-white font-semibold rounded-lg px-5 py-2 shadow-sm flex items-center gap-1.5"
            >
              टिपणी प्रिंट / Save PDF (A4)
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={onClose}
              className="rounded-lg px-5 text-xs font-bold"
            >
              बंद करा (Close)
            </Button>
          </div>
        }
      >
        {/* Printable Note Sheet Content Area */}
        <div className="bg-slate-100/60 p-2 sm:p-3 rounded-xl flex justify-center">
          <div
            ref={printContainerRef}
            className="notesheet-print-document w-full max-w-[794px] bg-white p-4 sm:p-5 rounded-xl shadow-md border-2 border-slate-900 print:border-none print:shadow-none print:p-0 print:max-w-none relative font-serif text-slate-900 text-[10.5px]"
          >
            {/* Corporation Logo Watermark (Prominent & Elegantly Centered) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.045] select-none overflow-hidden">
              {!logoError && ulbInfo.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ulbInfo.logoUrl}
                  alt={`${ulbInfo.nameEnglish} Watermark Logo`}
                  className="w-[400px] h-[400px] object-contain grayscale"
                />
              ) : (
                <Building2 className="w-[400px] h-[400px] text-slate-950" />
              )}
            </div>

            {/* Official Government Double-Border Header Box */}
            <div className="relative border-b-2 border-slate-900 pb-2 mb-2.5">
              <div className="flex items-center justify-between gap-3 mb-1">
                {/* Dynamic Corporation Logo on Left (Dignified Size) */}
                <div className="w-16 h-16 shrink-0 flex items-center justify-center bg-slate-50 border border-slate-300 rounded-lg p-1 shadow-xs">
                  {!logoError && ulbInfo.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ulbInfo.logoUrl}
                      alt={`${ulbInfo.nameEnglish} Logo`}
                      className="max-h-full max-w-full object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-700">
                      <Building2 className="w-8 h-8 text-[#0f3d62]" />
                      <span className="text-[8px] font-bold mt-0.5 tracking-tighter uppercase">{ulbInfo.code}</span>
                    </div>
                  )}
                </div>

                {/* Centered Corporation Titles */}
                <div className="text-center flex-1 px-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide leading-tight">
                    {ulbInfo.nameLocal}
                  </h1>
                  <h2 className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase mt-0.5">
                    {ulbInfo.nameEnglish}
                  </h2>
                  <p className="text-[10px] font-semibold text-[#0f3d62] mt-0.5 font-sans">
                    महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ (Right to Public Services Act, 2015)
                  </p>
                </div>

                {/* Official RTS Logo on Right (Dignified Size) */}
                <div className="w-20 h-16 shrink-0 flex items-center justify-center bg-white border border-slate-300 rounded-lg p-1 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/rts-logo.png"
                    alt="Right to Public Service Act"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Note Sheet Header Ribbon */}
              <div className="text-center mt-1">
                <div className="inline-block px-4 py-0.5 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest rounded shadow-xs font-sans">
                  अधिकृत कार्यालयीन टिपणी व मंजुरी आदेश (OFFICIAL NOTE SHEET)
                </div>
              </div>
            </div>

            {/* Official Government Metadata Grid Box (Compact 4-column) */}
            <div className="border border-slate-400 bg-slate-50/90 rounded-md overflow-hidden text-[10.5px] mb-2.5 font-sans">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-300 border-b border-slate-300">
                <div className="p-1.5">
                  <span className="text-slate-500 block text-[8.5px] uppercase font-bold">अर्ज क्रमांक (App No.)</span>
                  <span className="font-mono font-black text-slate-950 text-xs">{applicationNo}</span>
                </div>
                <div className="p-1.5">
                  <span className="text-slate-500 block text-[8.5px] uppercase font-bold">अर्जाचा दिनांक (Applied Date)</span>
                  <span className="font-bold text-slate-900 text-[10.5px]">{submittedDate}</span>
                </div>
                <div className="p-1.5">
                  <span className="text-slate-500 block text-[8.5px] uppercase font-bold">अर्जदाराचे नाव (Applicant)</span>
                  <span className="font-bold text-slate-900 text-[10.5px] truncate block">{citizenName}</span>
                </div>
                <div className="p-1.5">
                  <span className="text-slate-500 block text-[8.5px] uppercase font-bold">सद्यस्थिती (Status)</span>
                  <div className="mt-0.5">
                    <Badge variant={getStatusBadgeVariant(status)} size="sm">
                      {status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 bg-white">
                <div className="p-1.5">
                  <span className="text-slate-500 text-[8.5px] uppercase font-bold block">संबंधित विभाग (Department):</span>
                  <span className="font-bold text-slate-900 text-[10.5px]">{departmentName}</span>
                </div>
                <div className="p-1.5">
                  <span className="text-slate-500 text-[8.5px] uppercase font-bold block">लोकसेवा (RTS Service):</span>
                  <span className="font-bold text-[#0f3d62] text-[10.5px]">{serviceName}</span>
                </div>
                <div className="p-1.5">
                  <span className="text-slate-500 text-[8.5px] uppercase font-bold block">शासकीय शुल्क (Fee):</span>
                  <span className="font-bold text-emerald-800 text-[10.5px]">
                    {serviceFees !== null && serviceFees > 0 ? (
                      <span>
                        ₹ {serviceFees.toLocaleString(locale === 'mr' ? 'mr-IN' : 'en-IN')}
                        {paymentHistoryItem ? ' (Paid)' : ''}
                      </span>
                    ) : feesRequired ? (
                      'शुल्क लागू (As per demand)'
                    ) : (
                      'विनामूल्य (Free)'
                    )}
                  </span>
                </div>
                <div className="p-1.5">
                  <span className="text-slate-500 text-[8.5px] uppercase font-bold block">फाइल संदर्भ (Ref):</span>
                  <span className="font-mono font-bold text-slate-800 text-[10.5px]">{ulbInfo.code}/RTS/{applicationNo}</span>
                </div>
              </div>
            </div>

            {/* 1. Dynamic Form Fields (Paired 4-column compact grid to save 50% vertical height) */}
            <div className="mb-2.5">
              <div className="flex items-center gap-1.5 mb-1 pb-0.5 border-b border-slate-800 text-slate-950 font-sans">
                <FileCheck className="w-3.5 h-3.5 text-[#0f3d62]" />
                <h3 className="font-bold text-[11px] uppercase tracking-wide">
                  १. अर्जाचा तपशील व भरलेली माहिती (Application Particulars & Submitted Data)
                </h3>
              </div>

              {fieldGroups.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic p-1.5 bg-slate-50 border border-slate-200 rounded font-sans">
                  कोणतीही अतिरिक्त माहिती उपलब्ध नाही.
                </p>
              ) : (
                <div className="space-y-1.5 font-sans">
                  {fieldGroups.map((group) => {
                    // Pair fields in chunks of 2 for a 4-column compact table
                    const pairedFields: Array<[typeof group.fields[0], typeof group.fields[0] | null]> = [];
                    for (let i = 0; i < group.fields.length; i += 2) {
                      pairedFields.push([group.fields[i], group.fields[i + 1] || null]);
                    }

                    return (
                      <div key={group.title} className="border border-slate-300 rounded overflow-hidden">
                        <div className="bg-slate-200/80 px-2 py-0.5 font-bold text-[10px] text-slate-900 border-b border-slate-300">
                          {cleanLabel(group.title)}
                        </div>
                        <table className="w-full text-[10px] text-left border-collapse">
                          <tbody>
                            {pairedFields.map(([field1, field2], rowIdx) => {
                              const label1 = cleanLabel(field1.fieldLabel || field1.fieldLabelLocal || field1.fieldCode);
                              const label2 = field2 ? cleanLabel(field2.fieldLabel || field2.fieldLabelLocal || field2.fieldCode) : null;

                              return (
                                <tr
                                  key={rowIdx}
                                  className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                                >
                                  {/* Field 1 */}
                                  <td className="w-1/4 p-1 font-medium text-slate-700 border-b border-slate-200 border-r text-[9.5px]">
                                    {label1}
                                  </td>
                                  <td className={`p-1 font-semibold text-slate-950 border-b border-slate-200 ${field2 ? 'w-1/4 border-r' : 'w-3/4'}`} colSpan={field2 ? 1 : 3}>
                                    {renderFieldValue(field1.value, field1.fieldType)}
                                  </td>

                                  {/* Field 2 (if exists) */}
                                  {field2 && (
                                    <>
                                      <td className="w-1/4 p-1 font-medium text-slate-700 border-b border-slate-200 border-r text-[9.5px]">
                                        {label2}
                                      </td>
                                      <td className="w-1/4 p-1 font-semibold text-slate-950 border-b border-slate-200">
                                        {renderFieldValue(field2.value, field2.fieldType)}
                                      </td>
                                    </>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Uploaded Documents Section (Compact) */}
            {attachedDocuments.length > 0 && (
              <div className="mb-2.5">
                <div className="flex items-center gap-1.5 mb-1 pb-0.5 border-b border-slate-800 text-slate-950 font-sans">
                  <Layers className="w-3.5 h-3.5 text-[#0f3d62]" />
                  <h3 className="font-bold text-[11px] uppercase tracking-wide">
                    २. सोबत जोडलेली कागदपत्रे पडताळणी अहवाल (Attached Documents Verification)
                  </h3>
                </div>
                <table className="w-full text-[10px] text-left border border-slate-300 rounded overflow-hidden font-sans">
                  <thead className="bg-slate-200 text-slate-900 border-b border-slate-300 font-bold">
                    <tr>
                      <th className="p-1 text-center w-8 border-r border-slate-300">अ.क्र.</th>
                      <th className="p-1 border-r border-slate-300">कागदपत्राचा तपशील (Document Name)</th>
                      <th className="p-1 w-40 text-center">पडताळणी स्थिती (Status)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachedDocuments.map((doc: RtsApplicationDocumentItem, idx: number) => (
                      <tr key={doc.documentId || doc.fieldDefinitionId || idx} className="border-b border-slate-200 last:border-none">
                        <td className="p-1 text-center font-bold text-slate-600 border-r border-slate-200">{idx + 1}</td>
                        <td className="p-1 font-semibold text-slate-900 border-r border-slate-200">
                          {cleanLabel(doc.documentName) || '-'}
                        </td>
                        <td className="p-1 text-center">
                          <Badge variant="success" size="sm" icon={Check}>
                            अपलोड व पडताळणी पूर्ण
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Stage-wise Officer Decisions & Verified Digital Signatures (Unified Master Audit Table) */}
            <div className="mb-2.5">
              <div className="flex items-center gap-1.5 mb-1 pb-0.5 border-b border-slate-800 text-slate-950 font-sans">
                <Award className="w-3.5 h-3.5 text-[#0f3d62]" />
                <h3 className="font-bold text-[11px] uppercase tracking-wide">
                  ३. टप्पानिहाय अधिकारी टिप्पणी व डिजिटल मान्यता नोंद (Stage-wise Officer Remarks & Verified Signatures)
                </h3>
              </div>

              {trackHistory.length > 0 ? (
                <table className="w-full text-[10px] text-left border border-slate-300 rounded overflow-hidden font-sans">
                  <thead className="bg-slate-200 text-slate-900 border-b border-slate-300 font-bold">
                    <tr>
                      <th className="p-1 text-center w-7 border-r border-slate-300">#</th>
                      <th className="p-1 w-40 border-r border-slate-300">कार्यावाही / टप्पा</th>
                      <th className="p-1 w-32 border-r border-slate-300">अधिकारी / वापरकर्ता</th>
                      <th className="p-1 w-20 text-center border-r border-slate-300">स्थिती</th>
                      <th className="p-1 w-28 text-center border-r border-slate-300">दिनांक व वेळ</th>
                      <th className="p-1">अधिकारी शेरा व डिजिटल स्वाक्षरी नोंद (Remarks)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackHistory.map((item: RTSTrackApplicationHistoryItem, idx: number) => {
                      const officerName = item.actionByOfficerName || item.actionByUserName || 'नागरिक / प्रणाली';
                      const formattedDate = new Date(item.createdDate).toLocaleDateString(locale === 'mr' ? 'mr-IN' : 'en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      const isOfficerAction = item.actionByUserId !== null && item.actionByUserId !== undefined && item.action !== 'Submitted';

                      return (
                        <tr key={item.id || idx} className="border-b border-slate-200 last:border-none hover:bg-slate-50/70">
                          <td className="p-1 text-center font-bold text-slate-700 border-r border-slate-200">
                            {idx + 1}
                          </td>
                          <td className="p-1 border-r border-slate-200">
                            <span className="font-bold text-slate-900 block leading-tight">{item.action}</span>
                            {item.stageName && item.stageName !== item.action && (
                              <span className="text-[8.5px] text-slate-500 block">{item.stageName}</span>
                            )}
                          </td>
                          <td className="p-1 border-r border-slate-200">
                            <span className="text-[10px] font-semibold text-slate-900 flex items-center gap-1">
                              <User className="w-2.5 h-2.5 text-[#0f3d62] shrink-0" /> {officerName}
                            </span>
                          </td>
                          <td className="p-1 text-center border-r border-slate-200">
                            <Badge variant={getStatusBadgeVariant(item.status || 'Pending')} size="sm">
                              {item.status || 'Pending'}
                            </Badge>
                          </td>
                          <td className="p-1 text-center font-mono text-[9px] text-slate-700 border-r border-slate-200 whitespace-nowrap">
                            {formattedDate}
                          </td>
                          <td className="p-1 text-slate-950 font-medium">
                            <div className="flex flex-col gap-0.5">
                              {isOfficerAction && (
                                <div className="inline-flex items-center gap-1 text-[9px] text-emerald-800 font-bold">
                                  <Lock className="w-2 h-2 text-emerald-700" />
                                  <span>{item.isDigitallySigned ? '✔ DSC Digitally Signed' : '✔ e-Sign Verified'}</span>
                                </div>
                              )}
                              {item.remark ? (
                                <span className="text-slate-800 italic text-[9.5px]">“{item.remark}”</span>
                              ) : (
                                <span className="text-slate-400 not-italic">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : stages.length === 0 ? (
                <div className="p-1.5 bg-slate-50 border border-slate-300 rounded text-[10px] text-slate-700 font-sans">
                  <p className="font-bold text-slate-900">अर्ज सध्या प्रक्रियेत आहे.</p>
                  <p className="text-slate-600 mt-0.5">सध्याचा टप्पा: {verification?.stageName || '-'}</p>
                </div>
              ) : (
                <table className="w-full text-[10px] text-left border border-slate-300 rounded overflow-hidden font-sans">
                  <thead className="bg-slate-200 text-slate-900 border-b border-slate-300 font-bold">
                    <tr>
                      <th className="p-1 text-center w-7 border-r border-slate-300">#</th>
                      <th className="p-1 w-36 border-r border-slate-300">अधिकारी व पदनाम</th>
                      <th className="p-1 w-20 text-center border-r border-slate-300">कार्यावाही / स्थिती</th>
                      <th className="p-1 w-24 text-center border-r border-slate-300">दिनांक व वेळ</th>
                      <th className="p-1">अधिकारी टिप्पणी / शेरा (Remarks)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stages.map((stage: RtsApplicationApprovalStage, idx: number) => {
                      const stageOfficerName =
                        (stage.firstName || stage.lastName)
                          ? `${stage.firstName || ''} ${stage.lastName || ''}`.trim()
                          : stage.userName || stage.assignedToName || '-';

                      return (
                        <tr key={stage.approvalFlowStageId || idx} className="border-b border-slate-200 last:border-none">
                          <td className="p-1 text-center font-bold text-slate-700 border-r border-slate-200">
                            {stage.stageOrder || idx + 1}
                          </td>
                          <td className="p-1 border-r border-slate-200">
                            <span className="font-bold text-slate-900 block">{stage.stageName}</span>
                            <span className="text-[9.5px] text-slate-600 flex items-center gap-1 mt-0.5">
                              <User className="w-2.5 h-2.5 text-[#0f3d62]" /> {stageOfficerName}
                            </span>
                          </td>
                          <td className="p-1 text-center border-r border-slate-200">
                            <Badge variant={getStatusBadgeVariant(stage.status || 'Pending')} size="sm">
                              {stage.status || 'Pending'}
                            </Badge>
                          </td>
                          <td className="p-1 text-center font-mono text-[9px] text-slate-700 border-r border-slate-200">
                            {stage.completedDate || stage.createdDate || '-'}
                          </td>
                          <td className="p-1 text-slate-950 font-medium italic text-[9.5px]">
                            {stage.remark ? (
                              <span className="text-slate-900 font-semibold not-italic">“{stage.remark}”</span>
                            ) : (
                              <span className="text-slate-400 not-italic">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* 4. Final Approving Authority DSC Signature Block & Official Municipal Seal (Single Master Block) */}
            <div className="mt-2.5 pt-2 border-t-2 border-slate-900 break-inside-avoid font-sans">
              <div className="flex items-center gap-1.5 mb-1.5 text-slate-950">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <h3 className="font-bold text-[11px] uppercase tracking-wide">
                  ४. सक्षम प्राधिकारी अंतिम डिजिटल स्वाक्षरी व अधिकृत शिक्का (Official DSC Approval & Seal)
                </h3>
              </div>

              {/* Master DSC Digital Signature Box & Seal Stamp */}
              <div className="p-2.5 bg-gradient-to-r from-slate-50 via-emerald-50/50 to-slate-50 border border-slate-400 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2.5">
                {/* Left: Department & Corporation Note */}
                <div className="text-left text-[9.5px] text-slate-700 space-y-0.5 max-w-xs">
                  <div className="font-bold text-slate-950 text-[10.5px]">
                    {ulbInfo.nameLocal}
                  </div>
                  <div className="text-slate-600 font-medium">
                    {departmentName} • {serviceName}
                  </div>
                  <div className="text-slate-500 font-mono text-[8.5px]">
                    {ulbInfo.address}
                  </div>
                </div>

                {/* Center: Official Seal Stamp */}
                <div className="center-seal text-center shrink-0">
                  <div className="inline-block text-center">
                    {ulbInfo.sealUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ulbInfo.sealUrl}
                        alt="Official Municipal Seal"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain transform -rotate-6 filter drop-shadow-xs inline-block"
                        onError={() => setLogoError(true)}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[9px] font-bold text-slate-500">
                        OFFICIAL SEAL
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Master DSC Digital Signature Box */}
                <div className="right-digital-sign text-right w-full sm:w-auto">
                  <div className="digital-signature-card bg-emerald-50/95 border-2 border-emerald-600 p-2 rounded-lg text-left inline-block shadow-xs min-w-[230px] font-sans text-xs">
                    <div className="flex items-center justify-between text-emerald-900 font-bold text-[10px] pb-1 border-b border-emerald-300 mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-700 font-black text-xs">✔</span>
                        <span>Digitally Signed (DSC)</span>
                      </div>
                      <span className="text-[7.5px] bg-emerald-200 text-emerald-950 px-1 py-0.2 rounded font-mono font-bold">
                        CCA Verified
                      </span>
                    </div>

                    <div className="font-extrabold text-slate-950 text-[10.5px] leading-tight">
                      {dscMetadata?.signerName || ulbInfo.nameEnglish}
                    </div>

                    <div className="text-[9.5px] text-slate-700 font-semibold mt-0.5">
                      सक्षम प्राधिकारी: <span className="text-slate-950 font-bold">{finalOfficerName}</span>
                    </div>
                    <div className="text-[9px] text-slate-600 font-medium">
                      {finalOfficerDesignation}
                    </div>

                    <div className="text-[8px] text-slate-600 font-mono mt-1 border-t border-emerald-200/70 pt-0.5 space-y-0.2">
                      <div>Date: <span className="font-bold text-slate-800">{approvalDate} IST</span></div>
                      <div className="text-[7.5px] text-slate-500 truncate" title={`Serial: ${dscMetadata?.serialNumber || '0190D769'}`}>
                        Cert Serial: {dscMetadata?.serialNumber || '0190D769'} • {dscMetadata?.issuer || 'e-Mudhra Sub CA'}
                      </div>
                    </div>

                    <div className="text-[8px] text-emerald-900 font-bold mt-1 flex items-center gap-1 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-300">
                      <Lock className="w-2 h-2 text-emerald-700 shrink-0" />
                      <span>e-Sign Verified & Authentic (Official RTS)</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-900 mt-0.5">{finalOfficerDesignation}</div>
                  <div className="text-[9px] text-slate-600">{ulbInfo.nameLocal}</div>
                </div>
              </div>
            </div>

            {/* Official QR Verification & Legal Notice Footer */}
            <div className="mt-2.5 pt-1.5 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-slate-500 font-sans break-inside-avoid">
              <div className="flex items-center gap-1.5">
                <div className="inline-flex flex-col items-center justify-center p-0.5 bg-white border border-slate-300 rounded shadow-2xs text-center shrink-0">
                  <div className="w-9 h-9 bg-white flex items-center justify-center">
                    <QRCodeSVG
                      value={qrVerificationUrl}
                      size={32}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-[6px] text-slate-700 font-bold">Scan to Verify</span>
                </div>
                <div className="text-left leading-tight max-w-md">
                  <p className="font-bold text-slate-700 text-[9.5px]">महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५</p>
                  <p className="text-[8px] text-slate-500">
                    सदर टिपणी/आदेश पत्रक IT Act 2000 च्या कलम ६ नुसार अधिकृत ई-गव्हर्नन्स सिस्टीमद्वारे डिजिटल स्वाक्षरीने प्रमाणित केलेले असून प्रत्यक्ष सही-शिक्क्याची आवश्यकता नाही.
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right text-[8px] text-slate-400 font-mono">
                REF: {ulbInfo.code}-RTS-{applicationNo} • Page 1 of 1
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
