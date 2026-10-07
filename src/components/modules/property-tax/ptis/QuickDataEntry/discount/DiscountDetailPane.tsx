"use client";

import React from "react";
import { AlertCircle, Trash2, Info, Loader2 } from "lucide-react";
import { Label, TextArea, SaveButton } from "@/components/common";
import { DiscountAttributeState } from "@/types/discount.types";
import { DocumentAttachment } from "../building/DocumentAttachment";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { DiscountValueInput } from "./DiscountValueInput";
import { getLocalizedName } from "@/lib/utils/social-details";
import { isAttributeActive } from "@/lib/utils/discount-helpers";

interface DiscountDetailPaneProps {
    data: DiscountAttributeState | null | undefined;
    onInputChange: (field: "intValue" | "decimalValue" | "textValue" | "dateValue" | "remark", value: string) => void;
    onFileUpload: (file: File) => void;
    onFileDelete?: () => void;
    onDeleteDiscount?: () => void;
    validationError?: string;
    isSaving?: boolean;
    isDeleting?: boolean;
    hasChanges?: boolean;
    isFormValid?: boolean;
    onSave?: () => void;
    isDeleteDisabled?: boolean;
    t: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    };
}

export const DiscountDetailPane: React.FC<DiscountDetailPaneProps> = ({
    data,
    onInputChange,
    onFileUpload,
    onFileDelete,
    onDeleteDiscount,
    validationError,
    isSaving = false,
    isDeleting = false,
    hasChanges = false,
    isFormValid,
    onSave,
    isDeleteDisabled = false,
    t,
}) => {
    const { confirm } = useConfirm();

    const displayName = data
        ? getLocalizedName(
            data.socialAttributeCode,
            data.socialAttributeName,
            t as unknown as Parameters<typeof getLocalizedName>[2]
        )
        : "";

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

    const handleFileDeleteWithConfirm = () => {
        confirm({
            title: t("discount.confirmDeleteTitle") || "Delete Document",
            description: t("discount.confirmDeleteDesc") || "Are you sure you want to delete the attached document? This action cannot be undone.",
            confirmText: t("discount.confirmDeleteOk") || "Yes, Delete",
            cancelText: t("discount.confirmDeleteCancel") || "No, Cancel",
            variant: "delete",
            onConfirm: () => {
                if (onFileDelete) onFileDelete();
            }
        });
    };

    const isDiscountFilled = React.useMemo(() => {
        if (!data) return false;
        const hasFile = !!(data.documentGuid || data.fileName || data.pendingFile);
        const isBitType = data.dataType?.toUpperCase() === "BIT";
        if (isBitType) {
            return hasFile || !!data.remark?.trim();
        }
        const hasVal = !!(
            data.intValue !== null && data.intValue !== undefined ||
            data.decimalValue !== null && data.decimalValue !== undefined ||
            data.textValue?.trim() || data.dateValue?.trim()
        );
        return hasFile || hasVal || !!data.remark?.trim();
    }, [data]);

    const isUpdateCase = React.useMemo(() => {
        if (!data) return false;
        return typeof data.propertySocialDetailId === "number" && data.propertySocialDetailId > 0;
    }, [data]);

    const handleDeleteDiscountWithConfirm = () => {
        if (onDeleteDiscount && data) {
            confirm({
                title: t("discount.confirmDeleteDiscountTitle") || "Delete Discount & Data",
                description: `${t("discount.confirmToggleOffWarning") || "You have an active discount with details:"}\n${displayName}\n\n${t("discount.confirmDeleteDiscountDesc") || "Are you sure you want to delete this discount and all its associated data?"}`,
                confirmText: t("discount.confirmDeleteDiscountOk") || "Yes, Delete",
                cancelText: t("discount.confirmDeleteDiscountCancel") || "No, Cancel",
                variant: "delete",
                onConfirm: () => {
                    if (onDeleteDiscount) onDeleteDiscount();
                }
            });
        }
    };

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] lg:h-full bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                <AlertCircle size={36} className="text-gray-400 mb-3" />
                <p className="text-sm font-bold text-gray-500">
                    {t("discount.selectDiscountPrompt") || "Select a discount attribute from the sidebar to edit details"}
                </p>
            </div>
        );
    }

    const tWithHas = t as unknown as { has?: (key: string) => boolean };
    const hasRemark = typeof tWithHas.has === "function" && tWithHas.has("discount.remark");
    const hasRemarkPlaceholder = typeof tWithHas.has === "function" && tWithHas.has("discount.remarkPlaceholder");

    const isDisabled = !isAttributeActive(data);
    const docRequiredMsg = t("common.validation.documentRequired") || "Document is required.";
    const isDocumentInvalid = !!validationError && validationError === docRequiredMsg;

    let isRemarkError = false;
    let isValueInvalid = false;

    if (validationError && !isDocumentInvalid) {
        if ((data.dataType || "").toUpperCase() === "BIT") {
            isRemarkError = true;
        } else if (
            validationError.includes("500") ||
            validationError.includes("Remark cannot exceed")
        ) {
            isRemarkError = true;
        } else if (
            validationError === (t("property.validation.invalidCharacters") || "Contains invalid characters.")
        ) {
            const textValueInvalid =
                (data.dataType || "").toUpperCase() === "VARCHAR" &&
                data.textValue &&
                !/^[^<>]*$/.test(data.textValue);
            if (textValueInvalid) {
                isValueInvalid = true;
            } else {
                isRemarkError = true;
            }
        } else {
            isValueInvalid = true;
        }
    }

    const showValueInput = (data.dataType || "").toUpperCase() !== "BIT";

    const inputClassName = `h-10 text-sm placeholder:text-gray-400 focus:ring-1 shadow-sm transition-colors font-semibold ${
        isValueInvalid
            ? "bg-white text-gray-800 border-red-500 focus:border-red-500 focus:ring-red-500"
            : "bg-white text-gray-800 border-blue-200 focus:border-blue-600 focus:ring-blue-600 hover:border-blue-300"
    }`;

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 border border-blue-100 rounded-xl shadow-sm p-2.5 sm:p-3 justify-between transition-opacity overflow-hidden relative bg-white">
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
                {data.isInherited && (
                    <div className={`flex items-center gap-2 px-3 py-2 mb-2 rounded-lg border ${
                        data.isOverridden
                            ? "bg-amber-50 border-amber-200 text-amber-800"
                            : "bg-indigo-50 border-indigo-200 text-indigo-800"
                    }`}>
                        <Info size={16} className={data.isOverridden ? "text-amber-600 shrink-0" : "text-indigo-600 shrink-0"} />
                        <span className="text-xs font-semibold">
                            {data.isOverridden
                                ? (t("discount.overridePendingNote") || "You have modified this inherited attribute. Saving will create an override record exclusively for this level.")
                                : ((data.inheritedFrom || '').toUpperCase() === 'APARTMENT' || (data.inheritedFrom || '').toUpperCase() === 'SOCIETY' || (data.entityType || '').toUpperCase() === 'S')
                                    ? (t("discount.inheritedFromApartmentNote") || "This discount is inherited from Apartment level. Modifying details or toggling it off will create an override.")
                                    : (t("discount.inheritedFromWingNote") || "This discount is inherited from Wing level. Modifying details or toggling it off will create an override.")}
                        </span>
                    </div>
                )}

                {isDisabled && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-xs font-semibold mb-2">
                        <Info size={16} className="text-amber-600 shrink-0" />
                        <span>
                            {t("discount.enableDiscountPrompt") ||
                                "This discount type is currently disabled. Toggle it active in the sidebar list to edit details and attach documents."}
                        </span>
                    </div>
                )}

                <div className="pb-2 border-b border-blue-50">
                    <span className="text-[11px] font-bold tracking-wider text-blue-500 uppercase block mb-0.5">
                        {t("discount.editingDiscount") || "Discount Details"}
                    </span>
                    <h4 className="text-base font-bold text-blue-900 leading-tight">{displayName}</h4>
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

                <div className="space-y-1 w-full">
                    <Label className="text-sm font-bold text-blue-800">
                        {t("discount.uploadDocument") || "Document Attachment"}
                        {data.isDocumentRequired === true && <span className="text-red-500 ml-0.5">*</span>}
                    </Label>
                    <DocumentAttachment
                        documentGuid={data.documentGuid || undefined}
                        fileName={data.fileName || undefined}
                        documentUrl={data.documentUrl || undefined}
                        hasDocumentBinding={!!data.documentBindingId}
                        isUploading={data.isUploading}
                        isDeleting={data.isDeleting}
                        isDisabled={isDisabled}
                        isDocumentInvalid={isDocumentInvalid}
                        onFileUpload={handleFileUploadWithConfirm}
                        onFileDelete={handleFileDeleteWithConfirm}
                        t={t}
                        label={displayName}
                        pendingFile={data.pendingFile}
                    />
                </div>

                <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-blue-800">
                            {hasRemark ? t("discount.remark") : "Remark"}
                        </Label>
                        {(data.remark || "").trim() !== "" && !isDisabled && (
                            <button
                                type="button"
                                onClick={() => onInputChange("remark", "")}
                                className="px-2.5 py-0.5 text-[10px] md:text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-400 active:bg-red-200 shadow-sm"
                            >
                                {t("commonbuttonmessages.clear") || "Clear"}
                            </button>
                        )}
                    </div>
                    <TextArea
                        value={data.remark || ""}
                        disabled={isDisabled}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[<>]/g, "");
                            onInputChange("remark", val);
                        }}
                        placeholder={hasRemarkPlaceholder ? t("discount.remarkPlaceholder") : "Enter remark..."}
                        rows={2}
                        maxLength={500}
                        showCharCount
                        charCountLabel="characters"
                        className={`resize-y font-semibold ${isRemarkError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    />
                    {isRemarkError && (
                        <span className="text-red-500 text-[10px] font-semibold mt-1 block">
                            {validationError}
                        </span>
                    )}
                </div>
            </div>

            <div className="pt-2 border-t border-blue-100 mt-1 flex items-center justify-between gap-2 shrink-0 bg-white z-10">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0 animate-pulse" aria-hidden="true" role="presentation" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {t("discount.verifyDetailsNote") || "Verify details & file attachment before saving changes."}
                    </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {onDeleteDiscount && isDiscountFilled && isUpdateCase && !isDisabled && !isDeleteDisabled && (
                        <button
                            type="button"
                            disabled={isDisabled || isSaving || isDeleting || isDeleteDisabled}
                            onClick={handleDeleteDiscountWithConfirm}
                            className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                                    <span>{t("commonbuttonmessages.deleting") || "Deleting..."}</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{t("discount.deleteDiscount") || "Delete Discount & Data"}</span>
                                </>
                            )}
                        </button>
                    )}
                    {onSave && (
                        <SaveButton
                            onClick={onSave}
                            disabled={!hasChanges || (isFormValid !== undefined && !isFormValid) || isSaving || isDeleting}
                            isLoading={isSaving}
                            label={t("common.saveChanges") || "Save Changes"}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
