"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Building,
  ChevronDown,
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
  getServiceFieldDefinitionsForResubmitAction,
  uploadCitizenDocumentAction,
} from "@/app/[locale]/service/dashboard/actions";
import { Drawer } from "@/components/common";
import {
  downloadRtsDocument,
  getCitizenRtsDocumentDownloadUrl,
  getCitizenRtsDocumentViewUrl,
} from "@/lib/api/rts/rtsdocument.client";
import type { ApplicationAnswerGroup } from "@/lib/utils/rts/application-answers";
import type { RtsApplicationDocumentItem } from "@/types/rts/application-approval.types";
import type { RtsFieldDefinitionApiItem } from "@/types/rts/field-definition.types";

export interface CitizenResubmitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  applicationNo: string;
  serviceId?: number;
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

function parseOptions(optionsJson?: string | null): { label: string; value: string }[] {
  if (!optionsJson) return [];
  try {
    const parsed = JSON.parse(optionsJson);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => {
        if (typeof item === "string") return { label: item, value: item };
        return {
          label: item.label || item.name || item.text || String(item.value || item.id),
          value: String(item.value ?? item.id ?? item.label),
        };
      });
    }
    if (typeof parsed === "object") {
      return Object.entries(parsed).map(([value, label]) => ({
        label: String(label),
        value,
      }));
    }
  } catch {
    // If comma-separated
    return optionsJson.split(",").map((s) => {
      const trimmed = s.trim();
      return { label: trimmed, value: trimmed };
    });
  }
  return [];
}

export default function CitizenResubmitDrawer({
  isOpen,
  onClose,
  applicationId,
  applicationNo,
  serviceId,
  serviceName,
  officerRemark,
  answerGroups = [],
  documents = [],
  onSuccess,
}: CitizenResubmitDrawerProps) {
  const [citizenRemark, setCitizenRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(false);
  const [fieldDefinitions, setFieldDefinitions] = useState<RtsFieldDefinitionApiItem[]>([]);
  const [uploadingFieldId, setUploadingFieldId] = useState<number | null>(null);

  // Editable field values mapped by fieldDefinitionId
  const [fieldValues, setFieldValues] = useState<
    Record<
      number,
      {
        fieldDefinitionId: number;
        fieldLabel: string;
        fieldCode?: string;
        fieldType: string;
        fieldGroup: string;
        isRequired: boolean;
        options: { label: string; value: string }[];
        textValue: string;
        numberValue?: number | null;
        dateValue?: string | null;
        booleanValue?: boolean | null;
        documentGuid?: string | null;
        documentName?: string | null;
      }
    >
  >({});

  // 1. Fetch official service field definitions when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    // Detect serviceId if not explicitly passed
    let effectiveServiceId = serviceId;
    if (!effectiveServiceId) {
      for (const group of answerGroups) {
        const first = (group.answers || [])[0] as any;
        if (first?.serviceId) {
          effectiveServiceId = first.serviceId;
          break;
        }
      }
    }

    if (effectiveServiceId && effectiveServiceId > 0) {
      setIsLoadingDefinitions(true);
      void getServiceFieldDefinitionsForResubmitAction(effectiveServiceId)
        .then((res) => {
          if (res.success && res.data) {
            setFieldDefinitions(res.data);
          }
        })
        .finally(() => {
          setIsLoadingDefinitions(false);
        });
    }
  }, [isOpen, serviceId, answerGroups]);

  // 2. Merge field definitions, answerGroups, and documents into unified field state
  useEffect(() => {
    const state: Record<number, any> = {};

    // Map existing submitted values
    const existingValuesMap = new Map<number, { textValue: string; documentGuid?: string; documentName?: string }>();
    for (const group of answerGroups) {
      for (const field of group.answers || (group as any).fields || []) {
        const rawVal = field.displayValue === "—" ? "" : (field.displayValue || (field as any).textValue || "");
        existingValuesMap.set(field.fieldDefinitionId, {
          textValue: rawVal,
          documentGuid: field.documentGuid ?? (field as any).documentGuid,
          documentName: (field as any).documentName,
        });
      }
    }

    // Map existing documents
    const docMap = new Map<number, RtsApplicationDocumentItem>();
    for (const doc of documents) {
      if (doc.fieldDefinitionId) {
        docMap.set(doc.fieldDefinitionId, doc);
      }
    }

    // If we have API field definitions, use them as primary structure
    if (fieldDefinitions.length > 0) {
      for (const def of fieldDefinitions) {
        if (!def.isActive) continue;

        const existing = existingValuesMap.get(def.id);
        const existingDoc = docMap.get(def.id);
        const fType = (def.fieldType || "text").toLowerCase();
        const rawText = existing?.textValue || def.defaultValue || "";
        const parsedOpts = parseOptions(def.optionsJson);

        state[def.id] = {
          fieldDefinitionId: def.id,
          fieldLabel: def.fieldLabel || def.fieldCode || `Field ${def.id}`,
          fieldCode: def.fieldCode,
          fieldType: fType,
          fieldGroup: def.fieldGroup || "General Details",
          isRequired: Boolean(def.isRequired),
          options: parsedOpts,
          textValue: rawText,
          numberValue: fType === "number" ? Number(rawText) || null : null,
          dateValue: fType === "date" ? rawText : null,
          booleanValue: fType === "checkbox" || fType === "boolean" ? rawText === "true" || rawText === "True" || rawText === "1" : null,
          documentGuid: existingDoc?.documentGuid || existing?.documentGuid || null,
          documentName: existingDoc?.documentName || existing?.documentName || (existing?.documentGuid ? "कागदपत्र संलग्न आहे" : null),
        };
      }
    } else {
      // Fallback to answerGroups
      for (const group of answerGroups) {
        const gName = group.groupTitle || "General Details";
        for (const field of group.answers || (group as any).fields || []) {
          const rawVal = field.displayValue === "—" ? "" : (field.displayValue || (field as any).textValue || "");
          const fType = (field.fieldType || "text").toLowerCase();
          const existingDoc = docMap.get(field.fieldDefinitionId);

          state[field.fieldDefinitionId] = {
            fieldDefinitionId: field.fieldDefinitionId,
            fieldLabel: field.label || (field as any).fieldLabel || `Field ${field.fieldDefinitionId}`,
            fieldCode: field.fieldCode || (field as any).fieldCode,
            fieldType: fType,
            fieldGroup: gName,
            isRequired: (field as any).isRequired ?? false,
            options: [],
            textValue: rawVal,
            numberValue: typeof rawVal === "number" ? rawVal : null,
            dateValue: rawVal && rawVal.includes("-") ? rawVal : null,
            booleanValue: rawVal === "true" || rawVal === "True",
            documentGuid: existingDoc?.documentGuid || field.documentGuid || (field as any).documentGuid || null,
            documentName: existingDoc?.documentName || (field as any).documentName || null,
          };
        }
      }

      // Also append any documents from documents list if not already in state
      for (const doc of documents) {
        const docDefId = doc.fieldDefinitionId || (doc.documentId ? 90000 + doc.documentId : 99999);
        if (!state[docDefId]) {
          state[docDefId] = {
            fieldDefinitionId: docDefId,
            fieldLabel: doc.documentName || "कागदपत्र (Uploaded Document)",
            fieldCode: "document",
            fieldType: "file",
            fieldGroup: "Documents / Uploads (आवश्यक कागदपत्रे)",
            isRequired: Boolean(doc.isRequired),
            options: [],
            textValue: doc.documentName || "",
            documentGuid: doc.documentGuid || null,
            documentName: doc.documentName || null,
          };
        }
      }
    }

    setFieldValues(state);
  }, [fieldDefinitions, answerGroups, documents]);

  // Group fields into categorized sections
  const groupedFields = useMemo(() => {
    const groups: { title: string; fields: any[] }[] = [];
    const map = new Map<string, any[]>();

    for (const field of Object.values(fieldValues)) {
      const gTitle = field.fieldGroup || "General Details";
      if (!map.has(gTitle)) {
        map.set(gTitle, []);
      }
      map.get(gTitle)!.push(field);
    }

    for (const [title, fList] of map.entries()) {
      groups.push({
        title,
        fields: fList,
      });
    }

    return groups;
  }, [fieldValues]);

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
        numberValue: f.numberValue ?? (f.fieldType === "number" ? Number(f.textValue) || null : null),
        dateValue: f.dateValue || (f.fieldType === "date" ? f.textValue : null),
        booleanValue: f.booleanValue ?? (f.fieldType === "checkbox" ? f.textValue === "true" : null),
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
                त्रुटी दुरुस्ती व पुन: सादरीकरण
              </span>
            </div>
            <h2 className="text-sm font-black leading-snug text-slate-800 truncate mt-0.5">
              {serviceName || "अर्ज दुरुस्ती"}
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

        {isLoadingDefinitions && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 p-4 text-xs font-medium text-blue-700 border border-blue-100">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            अर्जाची डायनॅमिक रचना आणि कागदपत्रांची यादी लोड होत आहे...
          </div>
        )}

        {/* Dynamic Form Sections */}
        <form id="citizen-resubmit-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                अर्जातील माहिती व कागदपत्रे (Application Details & Documents)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                आवश्यक त्या फील्ड्समध्ये बदल करा. कागदपत्रे बदलण्यासाठी 'नवीन फाईल निवडा' बटण वापरा.
              </p>
            </div>
          </div>

          {groupedFields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">
              कोणतीही अतिरिक्त माहिती आढळली नाही.
            </div>
          ) : (
            groupedFields.map((group, gIdx) => {
              const GroupIcon = getGroupIcon(group.title);

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
                      {group.title}
                    </h4>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {group.fields.map((field: any) => {
                      const fType = (field.fieldType || "text").toLowerCase();
                      const isDoc =
                        fType.includes("file") ||
                        fType.includes("doc") ||
                        fType.includes("upload") ||
                        Boolean(field.documentGuid);

                      // 1. Document / File Upload Field
                      if (isDoc) {
                        return (
                          <div
                            key={field.fieldDefinitionId}
                            className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-slate-800">
                                {field.fieldLabel}
                                {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {field.isRequired ? "अनिवार्य कागदपत्र (Mandatory)" : "ऐच्छिक कागदपत्र (Optional)"}
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                                  <Paperclip className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="text-xs font-bold text-slate-800 truncate"
                                    title={field.documentName || field.textValue || "कागदपत्र संलग्न आहे"}
                                  >
                                    {field.documentName || field.textValue || (field.documentGuid ? "कागदपत्र संलग्न आहे" : "कागदपत्र अपलोड केलेले नाही")}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {field.documentGuid ? "अपलोड केलेले कागदपत्र उपलब्ध आहे" : "कृपया नवीन फाईल निवडून अपलोड करा"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {field.documentGuid && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => window.open(getCitizenRtsDocumentViewUrl(field.documentGuid), "_blank")}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      पहा
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => void handleDocumentDownload(field.documentGuid, field.fieldLabel)}
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
                                    : field.documentGuid
                                    ? "कागदपत्र बदला"
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

                      // 2. Select / Dropdown Field
                      if ((fType === "select" || fType === "dropdown") && field.options && field.options.length > 0) {
                        return (
                          <div key={field.fieldDefinitionId} className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-800">
                              {field.fieldLabel}
                              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <div className="relative">
                              <select
                                value={field.textValue ?? ""}
                                onChange={(e) => handleTextChange(field.fieldDefinitionId, e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition shadow-2xs pr-8"
                              >
                                <option value="">-- निवडा (Select) --</option>
                                {field.options.map((opt: any, optIdx: number) => (
                                  <option key={optIdx} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                            </div>
                          </div>
                        );
                      }

                      // 3. Radio Options
                      if (fType === "radio" && field.options && field.options.length > 0) {
                        return (
                          <div key={field.fieldDefinitionId} className="sm:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-slate-800">
                              {field.fieldLabel}
                              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <div className="flex flex-wrap gap-4">
                              {field.options.map((opt: any, optIdx: number) => (
                                <label
                                  key={optIdx}
                                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`radio-${field.fieldDefinitionId}`}
                                    value={opt.value}
                                    checked={field.textValue === opt.value}
                                    onChange={(e) => handleTextChange(field.fieldDefinitionId, e.target.value)}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300"
                                  />
                                  {opt.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // 4. Textarea / Longtext
                      if (fType === "textarea" || fType === "longtext") {
                        return (
                          <div key={field.fieldDefinitionId} className="sm:col-span-2 space-y-1.5">
                            <label className="block text-xs font-bold text-slate-800">
                              {field.fieldLabel}
                              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <textarea
                              rows={3}
                              value={field.textValue ?? ""}
                              onChange={(e) => handleTextChange(field.fieldDefinitionId, e.target.value)}
                              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition shadow-2xs"
                            />
                          </div>
                        );
                      }

                      // 5. Standard Text / Number / Date / Email / Phone Input
                      return (
                        <div key={field.fieldDefinitionId} className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {field.fieldLabel}
                            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <input
                            type={
                              fType === "number"
                                ? "number"
                                : fType === "date"
                                ? "date"
                                : fType === "email"
                                ? "email"
                                : fType === "tel" || fType === "mobile"
                                ? "tel"
                                : "text"
                            }
                            value={field.textValue ?? ""}
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
