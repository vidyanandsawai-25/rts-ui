"use client";

import React from "react";
import { Eye, FileText, UploadCloud, ShieldCheck, Download } from "lucide-react";
import { Button, ValidationMessage, Badge } from "@/components/common";
import { getViewDocumentUrl, getDownloadDocumentUrl } from "@/lib/utils/document-utils";

interface DocumentAttachmentProps {
    documentGuid?: string;
    fileName?: string;
    isUploading?: boolean;
    isDisabled: boolean;
    isDocumentInvalid: boolean;
    onFileUpload: (file: File) => void;
    t: (key: string) => string;
}

export const DocumentAttachment: React.FC<DocumentAttachmentProps> = ({
    documentGuid,
    fileName,
    isUploading,
    isDisabled,
    isDocumentInvalid,
    onFileUpload,
    t,
}) => {
    const handleViewDocument = () => {
        if (documentGuid) window.open(getViewDocumentUrl(documentGuid), "_blank", "noopener,noreferrer");
    };

    const handleDownloadDocument = () => {
        if (documentGuid) window.open(getDownloadDocumentUrl(documentGuid), "_blank", "noopener,noreferrer");
    };

    if (!documentGuid) {
        return (
            <div className="space-y-1.5 w-full">
                <label
                    className={`w-full flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl transition-all p-4 text-center relative group
                        ${isDisabled
                            ? "border-gray-300 bg-gray-100/50 text-gray-500 cursor-not-allowed"
                            : isUploading
                                ? "border-blue-400 bg-blue-50/20 text-blue-800 animate-pulse cursor-not-allowed"
                                : isDocumentInvalid
                                    ? "border-red-400 bg-red-50/5 hover:bg-red-50/20 hover:border-red-500 text-red-800 shadow-sm cursor-pointer"
                                    : "border-blue-200 bg-blue-50/5 hover:bg-blue-50/20 hover:border-blue-500 text-blue-800 shadow-sm cursor-pointer"
                        }`}
                >
                    <UploadCloud
                        size={32}
                        className={`mb-2 transition-transform duration-300 ${
                            isUploading
                                ? "animate-bounce"
                                : isDocumentInvalid
                                    ? "text-red-500 group-hover:scale-110"
                                    : "text-blue-500 group-hover:scale-110"
                        }`}
                    />
                    <span className={`text-sm font-bold block mb-1 ${isDocumentInvalid ? "text-red-900" : "text-blue-900"}`}>
                        {isUploading ? t("building.uploading") || "Uploading file..." : t("building.dragAndDrop") || "Click to select or drag & drop"}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">{t("building.allowedFormats") || "PDF, PNG, JPG (Max 5MB)"}</span>
                    <input
                        type="file"
                        className="hidden"
                        disabled={isDisabled || isUploading}
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                                onFileUpload(file);
                                e.target.value = "";
                            }
                        }}
                    />
                </label>
                {isDocumentInvalid && <ValidationMessage message={t("common.validation.documentRequired")} />}
            </div>
        );
    }

    return (
        <div className="border border-blue-100 rounded-xl bg-blue-50/10 p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0 shadow-sm border border-blue-100/50">
                    <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-blue-950 truncate mb-1">{fileName || "document_uploaded.pdf"}</p>
                    <div className="flex items-center gap-1.5">
                        <Badge
                            variant="success"
                            size="sm"
                            icon={ShieldCheck}
                            className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold"
                        >
                            {t("building.activeAttachment") || "Active Attachment"}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                    disabled={isDisabled || isUploading}
                    variant="primary"
                    size="sm"
                    icon={Eye}
                    className="text-sm font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg cursor-pointer"
                    onClick={handleViewDocument}
                >
                    {t("building.viewDocument") || "View Document"}
                </Button>
                <Button
                    disabled={isDisabled || isUploading}
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    className="text-sm font-bold border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50/40 hover:border-blue-500 cursor-pointer"
                    onClick={handleDownloadDocument}
                >
                    {t("building.downloadDocument") || "Download Document"}
                </Button>
                <label
                    className={`h-8 px-3 text-sm font-bold flex items-center gap-2 border border-blue-200 text-blue-700 rounded-lg transition-all bg-white shadow-sm whitespace-nowrap ${
                        isDisabled || isUploading ? "opacity-50 pointer-events-none cursor-not-allowed" : "cursor-pointer hover:bg-blue-50/40 hover:border-blue-500"
                    }`}
                >
                    <UploadCloud size={14} />
                    <span>{t("building.replaceDocument") || "Replace File"}</span>
                    <input
                        type="file"
                        className="hidden"
                        disabled={isDisabled || isUploading}
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                                onFileUpload(file);
                                e.target.value = "";
                            }
                        }}
                    />
                </label>
            </div>
        </div>
    );
};
