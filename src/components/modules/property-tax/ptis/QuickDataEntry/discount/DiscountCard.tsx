import React from "react";
import { Button, ToggleSwitch } from "@/components/common";
import { Label } from "@/components/common/label";
import { Eye, EyeOff, Upload, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { viewDocumentClient } from "@/lib/utils/document-client-utils";
import { toast } from "sonner";
import { DiscountAttributeState } from "@/types/discount.types";


interface DiscountCardProps {
    label: string;
    data: DiscountAttributeState;
    onToggle: (checked: boolean) => void;
    onFileUpload: (file: File) => void;
}

export const DiscountCard: React.FC<DiscountCardProps> = ({
    label,
    data,
    onToggle,
    onFileUpload
}) => {
    const t = useTranslations('quickDataEntry');
    const locale = useLocale();
    const [isViewing, setIsViewing] = React.useState(false);

    const handleViewDocument = async (documentGuid?: string) => {
        if (!documentGuid) return;
        setIsViewing(true);
        try {
            await viewDocumentClient(documentGuid, locale);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to view document");
        } finally {
            setIsViewing(false);
        }
    };

    return (
        <div
            className={`relative border rounded-xl p-4 transition-all duration-300 ease-out transform group ${data.enabled
                ? "bg-white border-blue-500 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] ring-1 ring-blue-100 hover:shadow-[0_8px_25px_-5px_rgba(59,130,246,0.25)] hover:border-blue-600 hover:-translate-y-1"
                : "bg-white border-gray-200 shadow-sm opacity-80 hover:opacity-100 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5"
                }`}
        >
            <div className="flex justify-between items-center mb-4">
                <span className={`text-xs font-bold ${data.enabled ? "text-blue-800" : "text-gray-500"}`}>
                    {label}
                </span>

                <div className="flex items-center gap-2">
                    {data.enabled && data.documentGuid ? (
                        <button
                            type="button"
                            disabled={isViewing || data.isUploading}
                            aria-label={t('discount.viewDocument')}
                            className="p-0 bg-transparent border-0 focus:outline-none disabled:opacity-50"
                            onClick={() => handleViewDocument(data.documentGuid || undefined)}
                        >
                            {isViewing ? (
                                <Loader2
                                    size={16}
                                    className="text-blue-600 animate-spin"
                                />
                            ) : (
                                <Eye
                                    size={16}
                                    aria-hidden="true"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                />
                            )}
                        </button>
                    ) : (
                        <EyeOff size={16} className="text-gray-400" />
                    )}

                    <div className="[&_button:not(:disabled)]:cursor-pointer">
                        <ToggleSwitch
                            checked={data.enabled}
                            onChange={onToggle}
                            showPopup={false}
                        />
                    </div>
                </div>
            </div>
            <div className={`col-span-2 mt-2 pt-3 border-t ${data.enabled ? "border-blue-200" : "border-gray-100"}`}>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 overflow-hidden">
                        <Label className={`text-[10px] font-semibold block mb-1 ${data.enabled ? "text-blue-800" : "text-gray-500"}`}>
                            {t("discount.uploadDocument")}
                        </Label>
                        <div className="flex items-center gap-2">
                            <label
                                className={`flex-1 flex items-center justify-center h-8 gap-2 border-2 border-dashed rounded-md transition-all cursor-pointer text-[10px] px-2 ${data.enabled
                                    ? "border-blue-500 bg-white hover:bg-gray-50 hover:border-blue-600 text-blue-800 font-semibold shadow-sm"
                                    : "border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed opacity-75"
                                    }`}
                            >
                                {data.isUploading ? (
                                    <Loader2 size={14} className="animate-spin text-blue-600" />
                                ) : (
                                    <Upload size={14} className={data.enabled ? "text-blue-600" : "text-gray-300"} />
                                )}
                                <span className="truncate max-w-[120px]">
                                    {data.isUploading
                                        ? t("discount.uploading")
                                        : data.documentGuid
                                            ? t("discount.documentUploaded")
                                            : t("discount.uploadDocument")}
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    disabled={!data.enabled || data.isUploading || isViewing}
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

                    <div className="pt-[18px]">
                        <Button
                            size="sm"
                            disabled={!data.enabled || !data.documentGuid || data.isUploading || isViewing}
                            isLoading={isViewing}
                            icon={Eye}
                            className={`h-8 px-3 text-[10px] flex items-center gap-1.5 border rounded-md font-semibold transition-all duration-300
                                  ${data.enabled && data.documentGuid
                                    ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95"
                                    : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-70"
                                }`}
                            onClick={() => handleViewDocument(data.documentGuid || undefined)}
                        >
                            {t("discount.viewDocument")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
