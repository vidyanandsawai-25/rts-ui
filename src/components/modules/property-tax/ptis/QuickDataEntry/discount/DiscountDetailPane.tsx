"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Label, TextArea } from "@/components/common";
import { DiscountAttributeState } from "@/types/discount.types";
import { DocumentAttachment } from "../building/DocumentAttachment";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { DiscountValueInput } from "./DiscountValueInput";

interface DiscountDetailPaneProps {
    data: DiscountAttributeState | null | undefined;
    onInputChange: (field: "intValue" | "decimalValue" | "textValue" | "dateValue" | "remark", value: string) => void;
    onFileUpload: (file: File) => void;
    validationError?: string;
    t: (key: string, values?: Record<string, string | number>) => string;
}

export const DiscountDetailPane: React.FC<DiscountDetailPaneProps> = ({
    data,
    onInputChange,
    onFileUpload,
    validationError,
    t,
}) => {
    const { confirm } = useConfirm();

    const handleFileUploadWithConfirm = (file: File) => {
        if (data && (data.documentGuid || data.documentBindingId)) {
            confirm({
                title: t("discount.confirmReplaceTitle") || "Replace Document",
                description: t("discount.confirmReplaceDesc") || "Are you sure you want to replace the existing document with a new one?",
                confirmText: t("discount.confirmReplaceOk") || "Yes, Replace",
                cancelText: t("discount.confirmReplaceCancel") || "No, Cancel",
                variant: "warning",
                onConfirm: () => {
                    onFileUpload(file);
                }
            });
        } else {
            onFileUpload(file);
        }
    };
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] lg:h-[calc(100vh-220px)] bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                <AlertCircle size={36} className="text-gray-400 mb-3" />
                <p className="text-sm font-bold text-gray-500">
                    {t("discount.selectDiscountPrompt") || "Select a discount attribute from the sidebar to edit details"}
                </p>
            </div>
        );
    }

    const translated = t(`discount.socialAttributes.${data.socialAttributeCode}`);
    const displayName = translated && !translated.includes("discount.socialAttributes")
        ? translated
        : data.socialAttributeName;

    const tWithHas = t as unknown as { has?: (key: string) => boolean };
    const hasRemark = typeof tWithHas.has === "function" && tWithHas.has("discount.remark");
    const hasRemarkPlaceholder = typeof tWithHas.has === "function" && tWithHas.has("discount.remarkPlaceholder");


    const hasAnyData = (data.intValue !== null && data.intValue !== undefined) ||
        (data.decimalValue !== null && data.decimalValue !== undefined) ||
        (data.textValue && data.textValue.trim() !== "") ||
        (data.dateValue && data.dateValue.trim() !== "") ||
        (data.documentGuid && data.documentGuid.trim() !== "") ||
        (!!data.documentBindingId) ||
        (data.remark && data.remark.trim() !== "");

    if (!data.enabled && !hasAnyData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] lg:h-[calc(100vh-220px)] bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <AlertCircle size={36} className="text-blue-500 mb-3" />
                <h4 className="text-base font-bold text-gray-800 mb-2">{displayName}</h4>
                <p className="text-sm font-semibold text-gray-500 max-w-sm">
                    {t("discount.enableDiscountPrompt") || "This discount type is currently disabled. Toggle it active in the sidebar list to edit details and attach documents."}
                </p>
            </div>
        );
    }

    const isDisabled = !data.enabled;
    const docRequiredMsg = t("common.validation.documentRequired") || "Document is required.";
    const isDocumentInvalid = !!validationError && validationError === docRequiredMsg;
    const isValueInvalid = !!validationError && !isDocumentInvalid;

    const dataTypeUpper = (data.dataType || "").toUpperCase();
    const showValueInput = dataTypeUpper !== "BIT";

    const inputClassName = `h-10 text-sm placeholder:text-gray-400 focus:ring-1 shadow-sm transition-colors font-semibold ${
        isDisabled
            ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
            : isValueInvalid 
                ? "bg-white text-gray-800 border-red-500 focus:border-red-500 focus:ring-red-500" 
                : "bg-white text-gray-800 border-blue-200 focus:border-blue-600 focus:ring-blue-600 hover:border-blue-300"
    }`;

    return (
        <div className={`flex flex-col min-h-[500px] lg:h-[calc(100vh-220px)] border rounded-xl shadow-sm p-4 justify-between transition-opacity ${
            isDisabled ? "bg-gray-50 border-gray-200 opacity-75" : "bg-white border-blue-100"
        }`}>
            <div className="space-y-5 overflow-y-auto pr-1">
                {isDisabled && (
                    <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-amber-800">
                            {t("discount.disabledWithDataNote") || "This discount is currently disabled. Toggle it active to edit details."}
                        </span>
                    </div>
                )}
                <div className="pb-3 border-b border-blue-50">
                    <span className="text-xs font-bold tracking-wider text-blue-500 uppercase block mb-1">
                        {t("discount.editingDiscount") || "Discount Details"}
                    </span>
                    <h4 className="text-lg font-bold text-blue-900 leading-tight">{displayName}</h4>
                </div>

                {showValueInput && (
                    <DiscountValueInput
                        data={data}
                        isDisabled={isDisabled}
                        inputClassName={inputClassName}
                        onInputChange={onInputChange}
                        isValueInvalid={isValueInvalid}
                        validationError={validationError}
                        t={t}
                    />
                )}

                <div className="space-y-1.5 w-full">
                    <Label className="text-sm font-bold text-blue-800">{t("discount.uploadDocument") || "Document Attachment"}<span className="text-red-500 ml-0.5">*</span></Label>
                    <DocumentAttachment
                        documentGuid={data.documentGuid || undefined}
                        documentUrl={data.documentUrl || undefined}
                        hasDocumentBinding={!!data.documentBindingId}
                        isUploading={data.isUploading}
                        isDisabled={isDisabled}
                        isDocumentInvalid={isDocumentInvalid}
                        onFileUpload={handleFileUploadWithConfirm}
                        t={t}
                    />
                </div>

                <div className="space-y-1.5 w-full">
                    <Label className="text-sm font-bold text-blue-800">
                        {hasRemark ? t("discount.remark") : "Remark"}
                    </Label>
                    <TextArea
                        value={data.remark || ""}
                        onChange={(e) => onInputChange("remark", e.target.value)}
                        placeholder={hasRemarkPlaceholder ? t("discount.remarkPlaceholder") : "Enter remark..."}
                        disabled={isDisabled}
                        rows={2}
                        className="resize-none font-semibold"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-blue-50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {t("discount.verifyDetailsNote") || "Verify details & file attachment before saving changes."}
                </span>
            </div>
        </div>
    );
};
