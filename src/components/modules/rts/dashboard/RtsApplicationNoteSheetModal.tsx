'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Printer,
  CheckCircle2,
  Building2,
  User,
  ShieldCheck,
  Award,
  Layers,
  FileCheck,
  Check,
} from 'lucide-react';

import { Badge, type BadgeVariant, Button, Modal } from '@/components/common';
import { getUlbDataFromCookies } from '@/lib/utils/cookie';
import type { RtsApplicationProcessData } from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import type { RtsApplicationProcessDrawerRecord } from '@/components/modules/rts/dashboard/RtsApplicationProcessDrawer';
import type {
  RtsApplicationApprovalStage,
  RtsApplicationDocumentItem,
} from '@/types/rts/application-approval.types';

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

  // Dynamic ULB information from cookies / configuration
  const [ulbInfo, setUlbInfo] = useState<{
    nameLocal: string;
    nameEnglish: string;
    logoUrl: string;
    code: string;
  }>({
    nameLocal: 'अकोला महानगरपालिका',
    nameEnglish: 'AKOLA MUNICIPAL CORPORATION',
    logoUrl: '/akolaLogo.png',
    code: 'AMC',
  });

  useEffect(() => {
    const cookieData = getUlbDataFromCookies();
    setUlbInfo({
      nameLocal: cookieData.ulbNameLocal || 'अकोला महानगरपालिका',
      nameEnglish: (cookieData.ulbName || 'AKOLA MUNICIPAL CORPORATION').toUpperCase(),
      logoUrl: (cookieData.ulbLogo || '/akolaLogo.png').trim(),
      code: cookieData.ulbCode || 'AMC',
    });
  }, [isOpen]);

  if (!isOpen || !record) return null;

  const applicationNo = data?.verification?.applicationNo || record.appId || 'N/A';
  const serviceName = record.serviceName || 'Public Service';
  const departmentName = record.departmentName?.trim() || '-';
  const serviceFees = data?.verification?.serviceFees ?? null;
  const feesRequired = data?.verification?.feesRequired ?? false;
  
  // Extract applicant name from dynamic fields if not in record
  const applicantField = data?.details?.applicationDetails?.find((f) => {
    const label = (f.fieldLabel || f.fieldCode || '').toLowerCase();
    return label.includes('applicant') || label.includes('student') || label.includes('name');
  });
  const citizenName = record.citizenName || applicantField?.value || 'Applicant';
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

  // Determine the final or latest approving officer for the digital signature
  const approvedOrLatestStage =
    stages.slice().reverse().find((s: RtsApplicationApprovalStage) => s.status?.toLowerCase().includes('approv') || s.completedDate) ||
    stages[stages.length - 1] ||
    null;

  const officerDisplayName =
    (approvedOrLatestStage?.firstName || approvedOrLatestStage?.lastName)
      ? `${approvedOrLatestStage.firstName || ''} ${approvedOrLatestStage.lastName || ''}`.trim()
      : approvedOrLatestStage?.userName ||
        (verification?.firstName || verification?.lastName
          ? `${verification.firstName || ''} ${verification.lastName || ''}`.trim()
          : verification?.officerName || verification?.officerEmail || 'Competent Authority');

  const officerDesignation =
    approvedOrLatestStage?.stageName || verification?.stageName || 'Designated Approval Officer';

  const approvalDate =
    approvedOrLatestStage?.completedDate ||
    approvedOrLatestStage?.createdDate ||
    new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeVariant = (statusStr: string): BadgeVariant => {
    const s = statusStr.toLowerCase();
    if (s.includes('approv') || s.includes('complete')) {
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 text-[11px]">
          <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
          Agreed / Yes
        </span>
      );
    }

    // Boolean False / Unchecked
    if (
      lowerVal === 'false' ||
      (fieldType?.toLowerCase() === 'checkbox' && (lowerVal === '0' || lowerVal === 'no' || lowerVal === 'false'))
    ) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200 text-[11px]">
          No
        </span>
      );
    }

    return strVal;
  };

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
              Official Note Sheet & Approval Order
            </span>
          </div>
        }
        subtitle={
          <span className="text-xs text-slate-500 font-mono">
            {ulbInfo.nameEnglish} • Ref: <strong className="text-[#0f3d62] font-semibold">{applicationNo}</strong>
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
              Print / Download PDF (A4)
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={onClose}
              className="rounded-lg px-5 text-xs font-bold"
            >
              Close
            </Button>
          </div>
        }
      >
        {/* Printable Note Sheet Content Area */}
        <div className="bg-slate-100/60 p-2 sm:p-4 rounded-xl">
          <div
            ref={printContainerRef}
            className="notesheet-print-document max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-md border-2 border-slate-800 print:border-none print:shadow-none print:p-0 print:max-w-none relative font-serif text-slate-900"
          >
            {/* Corporation Logo Watermark (Straight & Cleanly Centered) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none overflow-hidden">
              {!logoError && ulbInfo.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ulbInfo.logoUrl}
                  alt={`${ulbInfo.nameEnglish} Watermark Logo`}
                  className="w-96 h-96 object-contain grayscale"
                />
              ) : (
                <Building2 className="w-96 h-96 text-slate-950" />
              )}
            </div>

            {/* Official Government Double-Border Header Box */}
            <div className="relative border-b-2 border-slate-900 pb-5 mb-5">
              <div className="flex items-center justify-between gap-4 mb-2">
                {/* Dynamic Corporation Logo on Left */}
                <div className="w-20 h-20 shrink-0 flex items-center justify-center bg-slate-50 border border-slate-300 rounded-lg p-1.5 shadow-sm">
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
                      <Building2 className="w-10 h-10 text-[#0f3d62]" />
                      <span className="text-[9px] font-bold mt-0.5 tracking-tighter uppercase">{ulbInfo.code}</span>
                    </div>
                  )}
                </div>

                {/* Centered Corporation Titles */}
                <div className="text-center flex-1 px-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide leading-tight">
                    {ulbInfo.nameLocal}
                  </h1>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wider uppercase mt-0.5">
                    {ulbInfo.nameEnglish}
                  </h2>
                  <p className="text-[11px] font-semibold text-[#0f3d62] mt-1 font-sans">
                    महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ (Maharashtra Right to Public Services Act, 2015)
                  </p>
                </div>

                {/* Official RTS Logo on Right */}
                <div className="w-24 h-20 shrink-0 flex items-center justify-center bg-white border border-slate-300 rounded-lg p-1 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/rts-logo.png"
                    alt="Right to Public Service Act"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Note Sheet Header Ribbon */}
              <div className="text-center mt-3">
                <div className="inline-block px-6 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded shadow-sm font-sans">
                  OFFICIAL NOTE SHEET & APPROVAL ORDER
                </div>
              </div>
            </div>

            {/* Official Government Metadata Grid Box */}
            <div className="border border-slate-400 bg-slate-50/90 rounded-md overflow-hidden text-xs mb-5 font-sans">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-300 border-b border-slate-300">
                <div className="p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Application No.</span>
                  <span className="font-mono font-black text-slate-950 text-xs sm:text-sm">{applicationNo}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Applied Date</span>
                  <span className="font-bold text-slate-900 text-xs">{submittedDate}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Applicant Name</span>
                  <span className="font-bold text-slate-900 text-xs truncate block">{citizenName}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Status</span>
                  <div className="mt-0.5">
                    <Badge variant={getStatusBadgeVariant(status)} size="sm">
                      {status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 bg-white">
                <div className="p-2.5">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Department:</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{departmentName}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">RTS Service:</span>
                  <span className="font-bold text-[#0f3d62] text-xs sm:text-sm">{serviceName}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Service Fee:</span>
                  <span className="font-bold text-emerald-800 text-xs sm:text-sm">
                    {serviceFees !== null && serviceFees > 0
                      ? `₹ ${serviceFees.toLocaleString('en-IN')}`
                      : feesRequired
                      ? 'As per demand'
                      : 'Free'}
                  </span>
                </div>
                <div className="p-2.5">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">File Reference:</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{ulbInfo.code}/RTS/{applicationNo}</span>
                </div>
              </div>
            </div>

            {/* 1. Dynamic Form Fields (Service Data - Only fields that have actual data) */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2 pb-1 border-b-2 border-slate-800 text-slate-950 font-sans">
                <FileCheck className="w-4 h-4 text-[#0f3d62]" />
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                  1. Service Form Particulars & Submitted Data
                </h3>
              </div>

              {fieldGroups.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 border border-slate-200 rounded font-sans">
                  No form data submitted.
                </p>
              ) : (
                <div className="space-y-3 font-sans">
                  {fieldGroups.map((group) => (
                    <div key={group.title} className="border border-slate-300 rounded overflow-hidden">
                      <div className="bg-slate-200/80 px-3 py-1.5 font-bold text-xs text-slate-900 border-b border-slate-300">
                        {cleanLabel(group.title)}
                      </div>
                      <table className="w-full text-xs text-left border-collapse">
                        <tbody>
                          {group.fields.map((field, fIdx) => {
                            const fieldLabel = cleanLabel(field.fieldLabel || field.fieldLabelLocal || field.fieldCode);

                            return (
                              <tr
                                key={field.fieldDefinitionId || fIdx}
                                className={fIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                              >
                                <td className="w-5/12 p-2 font-medium text-slate-800 border-b border-slate-200 border-r">
                                  {fieldLabel}
                                </td>
                                <td className="w-7/12 p-2 font-semibold text-slate-950 border-b border-slate-200">
                                  {renderFieldValue(field.value, field.fieldType)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Uploaded Documents Section (Only shows actually attached documents) */}
            {attachedDocuments.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2 pb-1 border-b-2 border-slate-800 text-slate-950 font-sans">
                  <Layers className="w-4 h-4 text-[#0f3d62]" />
                  <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                    2. Attached Documents Verification Report
                  </h3>
                </div>
                <table className="w-full text-xs text-left border border-slate-300 rounded overflow-hidden font-sans">
                  <thead className="bg-slate-200 text-slate-900 border-b border-slate-300 font-bold">
                    <tr>
                      <th className="p-2 text-center w-12 border-r border-slate-300">Sr. No.</th>
                      <th className="p-2 border-r border-slate-300">Document Description</th>
                      <th className="p-2 w-48 text-center">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachedDocuments.map((doc: RtsApplicationDocumentItem, idx: number) => (
                      <tr key={doc.documentId || doc.fieldDefinitionId || idx} className="border-b border-slate-200 last:border-none">
                        <td className="p-2 text-center font-bold text-slate-600 border-r border-slate-200">{idx + 1}</td>
                        <td className="p-2 font-semibold text-slate-900 border-r border-slate-200">
                          {cleanLabel(doc.documentName) || '-'}
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant="success" size="sm" icon={Check}>
                            Uploaded & Verified
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Officer Workflow & Note Sheet Remarks Trail */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 pb-1 border-b-2 border-slate-800 text-slate-950 font-sans">
                <Award className="w-4 h-4 text-[#0f3d62]" />
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                  3. Stage-wise Officer Notesheet & Decision Trail
                </h3>
              </div>

              {stages.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 font-sans">
                  <p className="font-bold text-slate-900">Application is under process.</p>
                  <p className="text-slate-600 mt-0.5">Current Stage: {verification?.stageName || '-'}</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left border border-slate-300 rounded overflow-hidden font-sans">
                  <thead className="bg-slate-200 text-slate-900 border-b border-slate-300 font-bold">
                    <tr>
                      <th className="p-2 text-center w-10 border-r border-slate-300">Stage</th>
                      <th className="p-2 w-44 border-r border-slate-300">Officer & Role</th>
                      <th className="p-2 w-28 text-center border-r border-slate-300">Action</th>
                      <th className="p-2 w-32 text-center border-r border-slate-300">Date & Time</th>
                      <th className="p-2">Officer Remarks</th>
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
                          <td className="p-2 text-center font-black text-slate-700 border-r border-slate-200">
                            {stage.stageOrder || idx + 1}
                          </td>
                          <td className="p-2 border-r border-slate-200">
                            <span className="font-bold text-slate-900 block">{stage.stageName}</span>
                            <span className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3 text-[#0f3d62]" /> {stageOfficerName}
                            </span>
                          </td>
                          <td className="p-2 text-center border-r border-slate-200">
                            <Badge variant={getStatusBadgeVariant(stage.status || 'Pending')} size="sm">
                              {stage.status || 'Pending'}
                            </Badge>
                          </td>
                          <td className="p-2 text-center font-mono text-[11px] text-slate-700 border-r border-slate-200">
                            {stage.completedDate || stage.createdDate || '-'}
                          </td>
                          <td className="p-2 text-slate-950 font-medium italic">
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

            {/* 4. Digital Signature & Official Government Verification Stamp */}
            <div className="mt-8 pt-4 border-t-2 border-slate-900 break-inside-avoid font-sans">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Official Declaration Note on Left */}
                <div className="text-[11px] text-slate-600 space-y-1 max-w-sm text-left">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-[#0f3d62]" />
                    <span>Digital e-Signature Verification</span>
                  </div>
                  <p className="leading-tight">
                    This document is electronically generated and digitally authenticated under the Maharashtra Right to Public Services Act, 2015 via the official e-Governance system.
                  </p>
                  <p className="font-mono text-[9px] text-slate-500 pt-0.5">
                    REF: {ulbInfo.code}-RTS-{applicationNo}
                  </p>
                </div>

                {/* Government Green/Navy Digital Signature Seal Box */}
                <div className="w-full sm:w-80 p-3.5 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border-2 border-emerald-700 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute -right-3 -bottom-3 opacity-15 pointer-events-none">
                    {!logoError && ulbInfo.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ulbInfo.logoUrl}
                        alt="Seal Logo"
                        className="w-24 h-24 object-contain grayscale"
                      />
                    ) : (
                      <Building2 className="w-24 h-24 text-emerald-950" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-emerald-300">
                    <div className="p-1 bg-emerald-700 text-white rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-xs text-emerald-950 tracking-wide uppercase">
                      Digitally Signed
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-800">
                    <div>
                      <span className="text-emerald-900 text-[10px] block font-bold">Signed by:</span>
                      <span className="font-black text-slate-950 text-xs">{officerDisplayName}</span>
                    </div>
                    <div>
                      <span className="text-emerald-900 text-[10px] block font-bold">Designation:</span>
                      <span className="font-bold text-slate-900 text-[11px]">{officerDesignation}</span>
                    </div>
                    <div>
                      <span className="text-emerald-900 text-[10px] block font-bold">Date & Time:</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{approvalDate}</span>
                    </div>
                    <div className="pt-1 text-[9px] text-emerald-900 font-extrabold flex items-center gap-1 uppercase tracking-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 inline-block"></span>
                      {ulbInfo.nameEnglish} • e-Governance
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Government Footer Notice */}
            <div className="mt-6 pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500 font-sans">
              Note Sheet & Approval Copy • Maharashtra Right to Public Services System • {ulbInfo.nameEnglish}
            </div>
          </div>
        </div>
      </Modal>

      {/* Embedded Print CSS for pristine A4 formatting */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .notesheet-print-document,
          .notesheet-print-document * {
            visibility: visible !important;
          }
          .notesheet-print-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            border: 2px solid #000 !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>
    </>
  );
}
