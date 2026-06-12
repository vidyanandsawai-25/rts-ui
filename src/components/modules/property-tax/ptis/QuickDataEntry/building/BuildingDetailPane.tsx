"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Input, ValidationMessage, Label } from "@/components/common";
import { CertificateData } from "@/types/building-permission.types";
import { mapTypeNameToKey } from "@/lib/utils/building-helpers";
import { DocumentAttachment } from "./DocumentAttachment";
import { useConfirm } from "@/components/common/ConfirmProvider";

interface BuildingDetailPaneProps {
    data: CertificateData | null | undefined;
    onInputChange: (field: "number" | "date", value: string) => void;
    onFileUpload: (file: File) => void;
    validationError?: string;
    t: (key: string) => string;
}

export const BuildingDetailPane: React.FC<BuildingDetailPaneProps> = ({
    data,
    onInputChange,
    onFileUpload,
    validationError,
    t,
}) => {
    const { confirm } = useConfirm();

    const handleFileUploadWithConfirm = (file: File) => {
        if (data && data.documentGuid) {
            confirm({
                title: t("building.confirmReplaceTitle") || "Replace Document",
                description: t("building.confirmReplaceDesc") || "Are you sure you want to replace the existing document with a new one?",
                confirmText: t("building.confirmReplaceOk") || "Yes, Replace",
                cancelText: t("building.confirmReplaceCancel") || "No, Cancel",
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
                    {t("building.selectCertificatePrompt") || "Select a certificate from the sidebar to edit details"}
                </p>
            </div>
        );
    }

    const key = mapTypeNameToKey(data.certificateTypeName || "");
    const displayName = key && t(`building.${key}`) && t(`building.${key}`) !== `building.${key}`
        ? t(`building.${key}`)
        : data.certificateTypeName;

    const hasAnyData = (data.number && data.number.trim() !== "") ||
        (data.date && data.date.trim() !== "") ||
        (data.documentGuid && data.documentGuid.trim() !== "");

    if (!data.enabled && !hasAnyData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] lg:h-[calc(100vh-220px)] bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <AlertCircle size={36} className="text-blue-500 mb-3" />
                <h4 className="text-base font-bold text-gray-800 mb-2">{displayName}</h4>
                <p className="text-sm font-semibold text-gray-500 max-w-sm">
                    {t("building.enableCertificatePrompt") || "This certificate type is currently disabled. Toggle it active in the sidebar list to edit details and attach documents."}
                </p>
            </div>
        );
    }

    const isDisabled = !data.enabled;
    const isNumberInvalid = !!validationError && (
        (!data.number || data.number.trim() === "") ||
        /\s/.test(data.number ?? "") ||
        validationError.includes("Certificate Number")
    );
    const isDateInvalid = !!validationError && (!data.date || data.date.trim() === "");
    const isDocumentInvalid = !!validationError && (!data.documentGuid || data.documentGuid.trim() === "");

    return (
        <div className={`flex flex-col min-h-[500px] lg:h-[calc(100vh-220px)] border rounded-xl shadow-sm p-4 justify-between transition-opacity ${
            isDisabled ? "bg-gray-50 border-gray-200 opacity-75" : "bg-white border-blue-100"
        }`}>
            <div>
                {isDisabled && (
                    <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-amber-800">
                            {t("building.disabledWithDataNote") || "This certificate is currently disabled. Toggle it active to edit details."}
                        </span>
                    </div>
                )}
                <div className="pb-4 border-b border-blue-50 mb-6">
                    <span className="text-xs font-bold tracking-wider text-blue-500 uppercase block mb-1">
                        {t("building.editingCertificate") || "Certificate Details"}
                    </span>
                    <h4 className="text-lg font-bold text-blue-900 leading-tight">{displayName}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-bold text-blue-800">{t("building.certificateNumber")}<span className="text-red-500 ml-0.5">*</span></Label>
                        <Input
                            value={data.number}
                            onChange={(e) => onInputChange("number", e.target.value)}
                            placeholder={t("building.certificateNumberPlaceholder")}
                            disabled={isDisabled}
                            className={`h-10 text-sm placeholder:text-gray-400 focus:ring-1 shadow-sm transition-colors font-semibold ${
                                isDisabled
                                    ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                                    : isNumberInvalid 
                                        ? "bg-white text-gray-800 border-red-500 focus:border-red-500 focus:ring-red-500" 
                                        : "bg-white text-gray-800 border-blue-200 focus:border-blue-600 focus:ring-blue-600 hover:border-blue-300"
                            }`}
                        />
                        {isNumberInvalid && <ValidationMessage message={validationError} />}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-bold text-blue-800">{t("building.certificateDate")}<span className="text-red-500 ml-0.5">*</span></Label>
                        <Input
                            type="date"
                            value={data.date}
                            onChange={(e) => onInputChange("date", e.target.value)}
                            placeholder={t("building.certificateDatePlaceholder")}
                            disabled={isDisabled}
                            className={`h-10 text-sm placeholder:text-gray-400 [&::-webkit-datetime-edit]:text-gray-800 focus:ring-1 shadow-sm transition-colors font-semibold ${
                                isDisabled
                                    ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                                    : isDateInvalid 
                                        ? "bg-white text-gray-800 border-red-500 focus:border-red-500 focus:ring-red-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                                        : "bg-white text-gray-800 border-blue-200 focus:border-blue-600 focus:ring-blue-600 hover:border-blue-300 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            }`}
                        />
                        {isDateInvalid && <ValidationMessage message={validationError} />}
                    </div>
                </div>

                <div className="mt-6 space-y-2">
                    <Label className="text-sm font-bold text-blue-800">{t("building.documentAttachment") || "Document Attachment"}<span className="text-red-500 ml-0.5">*</span></Label>
                    <DocumentAttachment
                        documentGuid={data.documentGuid}
                        fileName={data.fileName}
                        isUploading={data.isUploading}
                        isDisabled={isDisabled}
                        isDocumentInvalid={isDocumentInvalid}
                        onFileUpload={handleFileUploadWithConfirm}
                        t={t}
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-blue-50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {t("building.verifyDetailsNote") || "Verify certificate details & file attachment before saving changes."}
                </span>
            </div>
        </div>
    );
};
