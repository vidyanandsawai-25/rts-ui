"use client";
import { memo } from "react";
import { Eye, EyeOff, FileText } from "lucide-react";
import { Button, Input, ToggleSwitch } from "@/components/common";
import { Label } from "@/components/common/label";
import { CertificateData } from "@/types/building-permission.types";
import { getViewDocumentUrl } from "@/lib/utils/document-utils";

interface BuildingCertificateItemProps {
    label: string;
    data: CertificateData;
    onToggle: (checked: boolean) => void;
    onInputChange: (field: 'number' | 'date', value: string) => void;
    onFileUpload: (file: File) => void;
    t: (key: string) => string;
}

export const BuildingCertificateItem = memo(({
    label,
    data,
    onToggle,
    onInputChange,
    onFileUpload,
    t
}: BuildingCertificateItemProps) => {
    const handleViewDocument = (documentGuid?: string) => {
        if (!documentGuid) return;
        const url = getViewDocumentUrl(documentGuid);
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <div
            className={`relative border rounded-xl p-4 transition-all duration-300 ${data.enabled
                ? "bg-white border-blue-600 shadow-sm ring-1 ring-blue-600"
                : "bg-gray-50 border-gray-200 shadow-sm opacity-70 hover:opacity-100 hover:border-gray-300"
                }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <span className={`text-xs font-bold ${data.enabled ? "text-blue-800" : "text-gray-500"}`}>
                    {label}
                </span>

                <div className="flex items-center gap-2">
                    {data.enabled && data.documentGuid ? (
                        <button
                            type="button"
                            aria-label={t('building.viewDocument')}
                            className="p-0 bg-transparent border-0 focus:outline-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewDocument(data.documentGuid);
                            }}
                        >
                            <Eye
                                size={16}
                                className="text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
                            />
                        </button>
                    ) : (
                        <EyeOff size={16} className="text-gray-400" />
                    )}

                    <ToggleSwitch
                        checked={data.enabled}
                        onChange={onToggle}
                        showPopup={false}
                    />
                </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className={`text-[10px] font-semibold ${data.enabled ? "text-blue-800" : "text-gray-500"}`}>
                        {t("building.certificateNumber")}
                    </Label>
                    <Input
                        disabled={!data.enabled}
                        value={data.number}
                        onChange={(e) => onInputChange('number', e.target.value)}
                        placeholder={t("building.certificateNumberPlaceholder")}
                        className={`h-8 text-[11px] transition-colors font-medium ${data.enabled
                            ? "border-blue-400 bg-white text-gray-800 placeholder:text-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm hover:border-blue-500"
                            : "border-gray-300 bg-gray-50 text-gray-400 placeholder:text-gray-400 cursor-not-allowed opacity-75"
                            }`}
                    />
                </div>

                <div className="space-y-1">
                    <Label className={`text-[10px] font-semibold ${data.enabled ? "text-blue-800" : "text-gray-500"}`}>
                        {t("building.certificateDate")}
                    </Label>
                    <Input
                        type="date"
                        disabled={!data.enabled}
                        value={data.date}
                        onChange={(e) => onInputChange('date', e.target.value)}
                        placeholder={t("building.certificateDatePlaceholder")}
                        className={`h-8 text-[11px] transition-colors font-medium ${data.enabled
                            ? "border-blue-400 bg-white text-gray-800 placeholder:text-gray-400 [&::-webkit-datetime-edit]:text-gray-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm hover:border-blue-500"
                            : "border-gray-300 bg-gray-50 text-gray-400 placeholder:text-gray-400 [&::-webkit-datetime-edit]:text-gray-400 cursor-not-allowed opacity-75"
                            }`}
                    />
                </div>

                {/* Document Upload & View */}
                <div className={`col-span-2 mt-2 pt-3 border-t ${data.enabled ? "border-blue-200" : "border-gray-100"}`}>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col min-w-0">
                            <Label className={`text-[10px] font-semibold block mb-1 truncate ${data.enabled ? "text-blue-800" : "text-gray-500"}`}>
                                {t("building.uploadDocument")}
                            </Label>
                            <label
                                className={`w-full flex items-center justify-center h-8 gap-2 border-2 border-dashed rounded-md transition-all cursor-pointer text-[10px] px-2 ${data.enabled
                                    ? "border-blue-500 bg-white hover:bg-gray-50 hover:border-blue-600 text-blue-800 font-semibold shadow-sm"
                                    : "border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed opacity-75"
                                    }`}
                            >
                                <FileText size={14} className={`flex-shrink-0 ${data.enabled ? "text-blue-600" : "text-gray-300"}`} />
                                <span className="truncate flex-1 min-w-0 text-center">
                                    {data.isUploading
                                        ? t("building.uploading")
                                        : data.documentGuid
                                            ? t("building.documentUploaded")
                                            : t("building.uploadDocument")}
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    disabled={!data.enabled || data.isUploading}
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

                        <div className="flex flex-col min-w-0">
                            <Label className={`text-[10px] font-semibold block mb-1 opacity-0 pointer-events-none`}>
                                {t("building.viewDocument")}
                            </Label>
                            <Button
                                size="sm"
                                disabled={!data.enabled || !data.documentGuid || data.isUploading}
                                className={`h-8 w-full justify-center px-2 text-[10px] flex items-center gap-1.5 border rounded-md font-semibold transition-all duration-300
                                      ${data.enabled && data.documentGuid
                                        ? "bg-blue-700 border-blue-700 text-white hover:bg-blue-700 shadow-md active:scale-95"
                                        : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-70"
                                    }`}
                                onClick={() => handleViewDocument(data.documentGuid)}
                            >
                                <Eye
                                    size={14}
                                    className={
                                        data.enabled && data.documentGuid ? "text-blue-100" : "text-gray-400"
                                    }
                                />
                                {t("building.viewDocument")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

BuildingCertificateItem.displayName = "BuildingCertificateItem";
