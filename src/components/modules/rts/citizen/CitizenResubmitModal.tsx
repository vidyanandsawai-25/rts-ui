"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Paperclip,
  RotateCcw,
  Send,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  citizenResubmitApplicationAction,
  uploadCitizenDocumentAction,
} from "@/app/[locale]/service/dashboard/actions";
import type { ApplicationAnswerGroup, ApplicationAnswerItem } from "@/lib/utils/rts/application-answers";

export interface CitizenResubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  applicationNo: string;
  serviceName?: string;
  officerRemark?: string;
  answerGroups?: ApplicationAnswerGroup[];
  onSuccess: () => void;
}

export default function CitizenResubmitModal({
  isOpen,
  onClose,
  applicationId,
  applicationNo,
  serviceName,
  officerRemark,
  answerGroups = [],
  onSuccess,
}: CitizenResubmitModalProps) {
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
        initial[field.fieldDefinitionId] = {
          fieldDefinitionId: field.fieldDefinitionId,
          fieldLabel: field.label || (field as any).fieldLabel || `Field ${field.fieldDefinitionId}`,
          fieldType: field.fieldType || "Text",
          textValue: field.displayValue === "—" ? "" : (field.displayValue || (field as any).textValue || ""),
          numberValue: (field as any).numberValue ?? null,
          dateValue: (field as any).dateValue ?? null,
          booleanValue: (field as any).booleanValue ?? null,
          documentGuid: field.documentGuid ?? (field as any).documentGuid ?? null,
          documentName: (field as any).documentName ?? null,
        };
      }
    }
    return initial;
  });

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">अर्ज दुरुस्ती व पुन: सादरीकरण</h2>
              <p className="text-xs text-orange-100 font-medium">
                {serviceName ? `${serviceName} • ` : ""}अर्जाचा क्रमांक: {applicationNo}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Officer Remark Alert Box */}
          {officerRemark && (
            <div className="rounded-xl border border-orange-200 bg-orange-50/90 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-orange-950">अधिकाऱ्याचा शेरा / त्रुटी तपशील:</h3>
                  <p className="text-xs text-orange-900 leading-relaxed font-medium bg-white/80 p-2.5 rounded-lg border border-orange-200">
                    "{officerRemark}"
                  </p>
                  <p className="text-[11px] text-orange-700">
                    कृपया वरील शेऱ्यानुसार खालील माहिती दुरुस्त करा किंवा आवश्यक कागदपत्रे पुन्हा अपलोड करा.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields for Correction */}
          <form id="resubmit-form" onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              अर्जातील माहिती व कागदपत्रे दुरुस्ती (Correct Application Fields)
            </h3>

            {answerGroups.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                कोणतीही अतिरिक्त माहिती आढळली नाही. कृपया खाली आपला शेरा लिहून पुन्हा सादर करा.
              </p>
            ) : (
              answerGroups.map((group, gIdx) => {
                const groupFields = group.answers || (group as any).fields || [];
                const groupName = group.groupTitle || (group as any).groupName || `Group ${gIdx + 1}`;
                return (
                  <div key={gIdx} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <h4 className="text-xs font-bold text-slate-800">{groupName}</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {groupFields.map((field: ApplicationAnswerItem | any) => {
                        const current = fieldValues[field.fieldDefinitionId];
                        const label = field.label || field.fieldLabel || `Field ${field.fieldDefinitionId}`;
                        const isDoc =
                          field.fieldType?.toLowerCase().includes("file") ||
                          field.fieldType?.toLowerCase().includes("doc") ||
                          field.fieldType?.toLowerCase().includes("upload") ||
                          Boolean(field.documentGuid);

                        if (isDoc) {
                          return (
                            <div
                              key={field.fieldDefinitionId}
                              className="sm:col-span-2 rounded-lg border border-slate-200 bg-white p-3 space-y-2"
                            >
                              <label className="block text-xs font-bold text-slate-800">
                                {label}
                              </label>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                                  <span className="text-xs text-slate-700 truncate font-medium">
                                    {current?.documentName || current?.textValue || "कागदपत्र उपलब्ध आहे"}
                                  </span>
                                </div>
                              <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-300 rounded-lg cursor-pointer transition-colors shrink-0">
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
                        );
                      }

                      return (
                        <div key={field.fieldDefinitionId} className="space-y-1">
                          <label className="block text-xs font-bold text-slate-800">
                            {field.fieldLabel}
                          </label>
                          <input
                            type="text"
                            value={current?.textValue ?? ""}
                            onChange={(e) => handleTextChange(field.fieldDefinitionId, e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

            {/* Citizen Remark */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-slate-800">
                नागरिकाचा शेरा / पूर्ततेचा तपशील (Your Remarks / Explanation):
              </label>
              <textarea
                rows={2}
                value={citizenRemark}
                onChange={(e) => setCitizenRemark(e.target.value)}
                placeholder="उदा. अधिकाऱ्याच्या सूचनेनुसार आवश्यक कागदपत्रे जोडून अर्ज पुन्हा सादर करत आहे."
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            रद्द करा
          </button>
          <button
            type="submit"
            form="resubmit-form"
            disabled={isSubmitting || uploadingFieldId !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-orange-600/20 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 transition-all cursor-pointer"
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
      </div>
    </div>
  );
}
