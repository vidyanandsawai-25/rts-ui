"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Building,
  Download,
  Eye,
  FileCheck,
  FileText,
  Loader2,
  MapPin,
  Paperclip,
  RotateCcw,
  Send,
  Upload,
  User,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  citizenResubmitApplicationAction,
  uploadCitizenDocumentAction,
} from "@/app/[locale]/service/dashboard/actions";
import { Drawer } from "@/components/common";
import {
  downloadRtsDocument,
  getCitizenRtsDocumentDownloadUrl,
  getCitizenRtsDocumentViewUrl,
} from "@/lib/api/rts/rtsdocument.client";
import type { ApplicationAnswerGroup, ApplicationAnswerItem } from "@/lib/utils/rts/application-answers";
import type { RtsApplicationDocumentItem } from "@/types/rts/application-approval.types";

export interface CitizenResubmitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  applicationNo: string;
  serviceName?: string;
  officerRemark?: string;
  answerGroups?: ApplicationAnswerGroup[];
  documents?: RtsApplicationDocumentItem[];
  onSuccess: () => void;
}

const GROUP_ICON_MAP: Record<string, LucideIcon> = {
  applicant: User,
  user: User,
  personal: User,
  property: Building,
  location: MapPin,
  address: MapPin,
  document: Paperclip,
  upload: Upload,
  file: Paperclip,
  tree: FileText,
  service: FileText,
  declaration: FileCheck,
};

function getGroupIcon(groupTitle: string): LucideIcon {
  const normalized = groupTitle.toLowerCase();
  for (const [key, icon] of Object.entries(GROUP_ICON_MAP)) {
    if (normalized.includes(key)) {
      return icon;
    }
  }
  return FileText;
}

export default function CitizenResubmitDrawer({
  isOpen,
  onClose,
  applicationId,
  applicationNo,
  serviceName,
  officerRemark,
  answerGroups = [],
  documents: _documents = [],
  onSuccess,
}: CitizenResubmitDrawerProps) {
  const [citizenRemark, setCitizenRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFieldId, setUploadingFieldId] = useState<number | null>(null);

  // Initialize editable field values from answerGroups
  const [fieldValues, setFieldValues] = useState<
    Record<
      number,
      {
        fieldDefinitionId: number;
        fieldLabel: string;
        fieldCode?: string;
        fieldType: string;
        textValue: string;
        numberValue?: number | null;
        dateValue?: string | null;
        booleanValue?: boolean | null;
        documentGuid?: string | null;
        documentName?: string | null;
      }
    >
  >(() => {
    const initial: Record<number, any> = {};
    for (const group of answerGroups) {
      const fields = group.answers || (group as any).fields || [];
      for (const field of fields) {
        const rawVal = field.displayValue === "—" ? "" : (field.displayValue || (field as any).textValue || "");
        initial[field.fieldDefinitionId] = {
          fieldDefinitionId: field.fieldDefinitionId,
          fieldLabel: field.label || (field as any).fieldLabel || `Field ${field.fieldDefinitionId}`,
          fieldCode: field.fieldCode || (field as any).fieldCode,
          fieldType: (field.fieldType || "Text").toLowerCase(),
          textValue: rawVal,
          numberValue: (field as any).numberValue ?? (typeof rawVal === "number" ? rawVal : null),
          dateValue: (field as any).dateValue ?? (rawVal && rawVal.includes("-") ? rawVal : null),
          booleanValue: (field as any).booleanValue ?? (rawVal === "true" || rawVal === "True"),
          documentGuid: field.documentGuid ?? (field as any).documentGuid ?? null,
          documentName: (field as any).documentName ?? null,
        };
      }
    }
    return initial;
  });

  // Keep fieldValues synced if answerGroups change
  React.useEffect(() => {
    if (answerGroups.length > 0) {
      const initial: Record<number, any> = {};
      for (const group of answerGroups) {
        const fields = group.answers || (group as any).fields || [];
        for (const field of fields) {
          const rawVal = field.displayValue === "—" ? "" : (field.displayValue || (field as any).textValue || "");
          initial[field.fieldDefinitionId] = {
            fieldDefinitionId: field.fieldDefinitionId,
            fieldLabel: field.label || (field as any).fieldLabel || `Field ${field.fieldDefinitionId}`,
            fieldCode: field.fieldCode || (field as any).fieldCode,
            fieldType: (field.fieldType || "Text").toLowerCase(),
            textValue: rawVal,
            numberValue: (field as any).numberValue ?? null,
            dateValue: (field as any).dateValue ?? null,
            booleanValue: (field as any).booleanValue ?? (rawVal === "true" || rawVal === "True"),
            documentGuid: field.documentGuid ?? (field as any).documentGuid ?? null,
            documentName: (field as any).documentName ?? null,
          };
        }
      }
      setFieldValues(initial);
    }
  }, [answerGroups]);

  const handleTextChange = (fieldDefId: number, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldDefId]: {
        ...prev[fieldDefId],
        textValue: value,
      },
    }));
  };

  const handleFileUpload = async (fieldDefId: number, file: File) => {
    setUploadingFieldId(fieldDefId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadCitizenDocumentAction(formData);
      if (res.success && res.documentGuid) {
        setFieldValues((prev) => ({
          ...prev,
          [fieldDefId]: {
            ...prev[fieldDefId],
            documentGuid: res.documentGuid,
            documentName: file.name,
            textValue: file.name,
          },
        }));
        toast.success(`कागदपत्र यशस्वीरित्या अपलोड झाले: ${file.name}`);
      } else {
        toast.error(res.error || "कागदपत्र अपलोड करण्यात अडचण आली.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "कागदपत्र अपलोड अयशस्वी.");
    } finally {
      setUploadingFieldId(null);
    }
  };

  const handleDocumentDownload = async (guid: string, label: string) => {
    try {
      await downloadRtsDocument({
        url: getCitizenRtsDocumentDownloadUrl(guid),
        fallbackFileName: `${label.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        errorMessage: "कागदपत्र डाउनलोड अयशस्वी झाले.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "कागदपत्र डाउनलोड अयशस्वी.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId) {
      toast.error("अर्जाचा आयडी उपलब्ध नाही.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = Object.values(fieldValues).map((f) => ({
        fieldDefinitionId: f.fieldDefinitionId,
        textValue: f.textValue || null,
        numberValue: f.numberValue ?? null,
        dateValue: f.dateValue || null,
        booleanValue: f.booleanValue ?? null,
        documentGuid: f.documentGuid || null,
      }));

      const res = await citizenResubmitApplicationAction(
        applicationId,
        citizenRemark || "Application corrected and resubmitted by citizen",
        payload
      );

      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "अर्ज पुन्हा सादर करताना त्रुटी आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width="xl"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 shadow-xs border border-orange-200">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded bg-orange-100 px-2 py-0.5 font-mono text-[10px] font-bold text-orange-900 border border-orange-200">
                {applicationNo}
              </span>
              <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                त्रुटी दुरुस्ती
              </span>
            </div>
            <h2 className="text-sm font-black leading-snug text-slate-800 truncate mt-0.5">
              {serviceName || "अर्ज दुरुस्ती व पुन: सादरीकरण"}
            </h2>
          </div>
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-end gap-3 px-2 py-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            रद्द करा
          </button>
          <button
            type="submit"
            form="citizen-resubmit-form"
            disabled={isSubmitting || uploadingFieldId !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 px-6 py-2 text-xs font-bold text-white shadow-md shadow-orange-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                सादर होत आहे...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                दुरुस्ती करून पुन्हा सादर करा
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        {/* Officer Remark Alert Card */}
        {officerRemark && (
          <section className="rounded-2xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 via-amber-50/50 to-orange-50 p-5 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm mt-0.5">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wide text-orange-950">
                    अधिकाऱ्याचा शेरा / दुरुस्तीचे कारण (Officer Remark):
                  </h3>
                  <span className="text-[10px] font-bold text-orange-800 bg-orange-200/80 px-2 py-0.5 rounded-full">
                    तातडीने पूर्तता आवश्यक
                  </span>
                </div>
                <div className="rounded-xl border border-orange-200 bg-white/95 p-3 text-xs text-orange-950 font-bold shadow-xs">
                  “{officerRemark}”
                </div>
                <p className="text-[11px] font-medium text-orange-900 leading-relaxed">
                  कृपया वरील शेऱ्यानुसार खालील फॉर्ममधील आवश्यक माहिती दुरुस्त करा किंवा संबंधित कागदपत्रे पुन्हा अपलोड करून अर्ज पुन्हा सादर करा.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Form Sections */}
        <form id="citizen-resubmit-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                अर्जातील माहिती व भरलेला तपशील (Application Particulars)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                आवश्यक त्या फील्ड्समध्ये दुरुस्ती करा. कागदपत्रे बदलण्यासाठी 'नवीन फाईल निवडा' बटण वापरा.
              </p>
            </div>
          </div>

          {answerGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">
              कोणतीही अतिरिक्त माहिती आढळली नाही.
            </div>
          ) : (
            answerGroups.map((group, gIdx) => {
              const groupFields = group.answers || (group as any).fields || [];
              const groupName = group.groupTitle || (group as any).groupName || `Section ${gIdx + 1}`;
              const GroupIcon = getGroupIcon(groupName);

              return (
                <section
                  key={gIdx}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 space-y-4"
                >
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0f3d62]/10 text-[#0f3d62]">
                      <GroupIcon className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                      {groupName}
                    </h4>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {groupFields.map((field: ApplicationAnswerItem | any) => {
                      const current = fieldValues[field.fieldDefinitionId];
                      const label = field.label || field.fieldLabel || `Field ${field.fieldDefinitionId}`;
                      const fieldType = (field.fieldType || "text").toLowerCase();

                      const isDoc =
                        fieldType.includes("file") ||
                        fieldType.includes("doc") ||
                        fieldType.includes("upload") ||
                        Boolean(field.documentGuid) ||
                        Boolean(current?.documentGuid);

                      if (isDoc) {
                        const docGuid = current?.documentGuid || field.documentGuid;
                        return (
                          <div
                            key={field.fieldDefinitionId}
                            className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-slate-800">
                                {label}
                              </label>
                              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                कागदपत्र (Document)
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                                  <Paperclip className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-800 truncate" title={current?.documentName || current?.textValue || "कागदपत्र उपलब्ध आहे"}>
                                    {current?.documentName || current?.textValue || "कागदपत्र संलग्न आहे"}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {docGuid ? "अपलोड केलेले कागदपत्र" : "नवीन फाईल अपलोड करा"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {docGuid && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => window.open(getCitizenRtsDocumentViewUrl(docGuid), "_blank")}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      पहा
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => void handleDocumentDownload(docGuid, label)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}

                                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-lg cursor-pointer transition-all shadow-2xs">
                                  {uploadingFieldId === field.fieldDefinitionId ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Upload className="h-3.5 w-3.5" />
                                  )}
                                  {uploadingFieldId === field.fieldDefinitionId
                                    ? "अपलोड होत आहे..."
                                    : "नवीन फाईल निवडा"}
                                  <input
                                    type="file"
                                    className="hidden"
                                    disabled={uploadingFieldId === field.fieldDefinitionId}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) void handleFileUpload(field.fieldDefinitionId, file);
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (fieldType === "textarea" || fieldType === "longtext") {
                        return (
                          <div key={field.fieldDefinitionId} className="sm:col-span-2 space-y-1.5">
                            <label className="block text-xs font-bold text-slate-800">
                              {label}
                            </label>
                            <textarea
                              rows={3}
                              value={current?.textValue ?? ""}
                              onChange={(e) => handleTextChange(field.fieldDefinitionId, e.target.value)}
                              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition shadow-2xs"
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={field.fieldDefinitionId} className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {label}
                          </label>
                          <input
                            type={
                              fieldType === "number"
                                ? "number"
                                : fieldType === "date"
                                ? "date"
                                : fieldType === "email"
                                ? "email"
                                : fieldType === "tel" || fieldType === "mobile"
                                ? "tel"
                                : "text"
                            }
                            value={current?.textValue ?? ""}
                            onChange={(e) => handleTextChange(field.fieldDefinitionId, e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition shadow-2xs"
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}

          {/* Citizen Reply / Remarks Section */}
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-5 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#0f3d62]" />
              <label className="block text-xs font-black uppercase tracking-wide text-slate-900">
                नागरिकाचा शेरा / पूर्ततेचा तपशील (Your Remarks / Explanation):
              </label>
            </div>
            <textarea
              rows={3}
              value={citizenRemark}
              onChange={(e) => setCitizenRemark(e.target.value)}
              placeholder="उदा. अधिकाऱ्याच्या सूचनेनुसार चालू महिन्याचे विजेचे बिल व आवश्यक कागदपत्रे जोडून अर्ज पुन्हा सादर करत आहे."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition shadow-2xs"
            />
            <p className="text-[10.5px] text-slate-500 font-medium">
              टीप: आपण सादर केलेला शेरा अधिकाऱ्याला नोट शीट व पडताळणी विंडोमध्ये स्पष्टपणे दिसेल.
            </p>
          </section>
        </form>
      </div>
    </Drawer>
  );
}
