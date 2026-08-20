"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { Label, TextArea, SaveButton } from "@/components/common";
import { FlatSocialAttributeState, getLocalizedName } from "@/lib/utils/social-details";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";
import { DocumentAttachment } from "../building/DocumentAttachment";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { AttributeControl } from "./AttributeControl";
import { NestedAttributes } from "./NestedAttributes";
import { 
    SocialSelectPrompt, 
    SocialDisabledPrompt, 
    DisabledBanner 
} from "./SocialPanePlaceholders";

interface SocialDetailPaneProps {
    data: FlatSocialAttributeState | null | undefined;
    hierarchyData: SocialAttributeHierarchyDto | null | undefined;
    socialData: Record<number, FlatSocialAttributeState>;
    onInputChange: (attributeId: number, field: keyof FlatSocialAttributeState, value: string | number | boolean | null | undefined) => void;
    onPhotoUpload: (socialAttributeId: number, file: File) => void;
    onPhotoDelete: (socialAttributeId: number) => void;
    validationErrors?: Record<number, string>;
    isAttributeEnabled: (attr: FlatSocialAttributeState) => boolean;
    t: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    };
    onDeleteSocialDetail?: () => void;
    isSaving?: boolean;
    hasChanges?: boolean;
    onSave?: () => void;
}

export const SocialDetailPane: React.FC<SocialDetailPaneProps> = ({
    data,
    hierarchyData,
    socialData,
    onInputChange,
    onPhotoUpload,
    onPhotoDelete,
    validationErrors,
    isAttributeEnabled,
    t,
    onDeleteSocialDetail,
    isSaving = false,
    hasChanges = false,
    onSave,
}) => {
    const { confirm } = useConfirm();

    const isSocialDetailFilled = React.useMemo(() => {
        if (!data) return false;
        const hasFile = !!(data.documentGuid || data.documentUrl || data.pendingFile);
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
        return typeof data.id === "number" && data.id > 0;
    }, [data]);

    if (!data || !hierarchyData) {
        return <SocialSelectPrompt t={t as (key: string) => string} />;
    }

    const displayName = getLocalizedName(
        data.socialAttributeCode,
        data.socialAttributeName,
        t as unknown as (key: string) => string
    );

    const handleFileUploadWithConfirm = (file: File) => {
        if (!(data.documentGuid || data.documentBindingId)) {
            onPhotoUpload(data.socialAttributeId, file);
            return;
        }
        confirm({
            title: t("discount.confirmReplaceTitle") || "Replace Document",
            description: t("discount.confirmReplaceDesc") || "Are you sure you want to replace the existing document with a new one?",
            confirmText: t("discount.confirmReplaceOk") || "Yes, Replace",
            cancelText: t("discount.confirmReplaceCancel") || "No, Cancel",
            variant: "warning",
            onConfirm: () => onPhotoUpload(data.socialAttributeId, file)
        });
    };

    const handlePhotoDeleteWithConfirm = () => {
        confirm({
            title: t("discount.confirmDeleteTitle") || "Delete Document",
            description: t("discount.confirmDeleteDesc") || "Are you sure you want to delete the attached document? This action cannot be undone.",
            confirmText: t("discount.confirmDeleteOk") || "Yes, Delete",
            cancelText: t("discount.confirmDeleteCancel") || "No, Cancel",
            variant: "delete",
            onConfirm: () => onPhotoDelete(data.socialAttributeId)
        });
    };

    const handleDeleteSocialDetailWithConfirm = () => {
        if (onDeleteSocialDetail && data) {
            confirm({
                title: t("discount.confirmDeleteAttributeTitle") || "Delete Social Detail & Data",
                description: `${t("discount.confirmToggleOffWarning") || "You have an active attribute with details:"}\n${displayName}\n\n${t("discount.confirmDeleteAttributeDesc") || "Are you sure you want to delete this social detail and all its associated data?"}`,
                confirmText: t("discount.confirmDeleteAttributeOk") || "Yes, Delete",
                cancelText: t("discount.confirmDeleteAttributeCancel") || "No, Cancel",
                variant: "delete",
                onConfirm: () => {
                    if (onDeleteSocialDetail) onDeleteSocialDetail();
                }
            });
        }
    };

    const isEnabled = isAttributeEnabled(data);
    const hasAnyData = !!(
        data.intValue !== null ||
        data.decimalValue !== null ||
        data.textValue?.trim() ||
        data.dateValue?.trim() ||
        data.documentGuid?.trim() ||
        data.documentBindingId ||
        data.remark?.trim()
    );

    if (!isEnabled && !hasAnyData) {
        return <SocialDisabledPrompt displayName={displayName} t={t as (key: string) => string} />;
    }

    const isDisabled = !isEnabled;
    const isPhotoRequired = data.isPhotoRequired === true;

    const errorMsg = validationErrors?.[data.socialAttributeId];
    const docRequiredMsg = t("common.validation.documentRequired") || "Document is required.";
    const isPhotoInvalid = !!errorMsg && ((errorMsg.includes("required") && !data.documentGuid) || errorMsg === docRequiredMsg);

    let isRemarkError = false;
    let isValueInvalid = false;

    if (errorMsg && !isPhotoInvalid) {
        if ((data.dataType || "").toUpperCase() === "BIT") {
            isRemarkError = true;
        } else if (errorMsg.includes("500") || errorMsg.includes("Remark cannot exceed")) {
            isRemarkError = true;
        } else if (errorMsg === (t("property.validation.invalidCharacters") || "Contains invalid characters.")) {
            const textValueInvalid = (data.dataType || "").toUpperCase() === "VARCHAR" && data.textValue && !/^[^<>]*$/.test(String(data.textValue));
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

    return (
        <div
            className={`flex flex-col min-h-[300px] lg:h-full border rounded-xl shadow-sm p-4 justify-between transition-opacity ${
                isDisabled ? "bg-gray-50 border-gray-200 opacity-75" : "bg-white border-blue-100"
            }`}
        >
            <div className="space-y-5 overflow-y-auto pr-1">
                {isDisabled && <DisabledBanner t={t as (key: string) => string} />}

                <div className="pb-3 border-b border-blue-50 flex items-start justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold tracking-wider text-blue-500 uppercase block mb-1">
                            {t("discount.editingDiscount") || "Social Attribute Details"}
                        </span>
                        <h4 className="text-lg font-bold text-blue-900 leading-tight">{displayName}</h4>
                    </div>
                    {onDeleteSocialDetail && isSocialDetailFilled && isUpdateCase && !isDisabled && (
                        <button
                            type="button"
                            disabled={isDisabled || isSaving}
                            onClick={handleDeleteSocialDetailWithConfirm}
                            className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t("discount.deleteSocialDetail") || "Delete Detail & Data"}
                        </button>
                    )}
                </div>

                {/* Root value input if applicable */}
                {showValueInput && (
                    <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-xs font-bold text-slate-600">
                            {displayName}
                            {data.isRequiredWhenParentTrue && <span className="text-red-500 ml-0.5">*</span>}
                        </span>
                        <AttributeControl
                            attr={hierarchyData}
                            state={data}
                            isEnabled={!isDisabled}
                            hasError={isValueInvalid}
                            handleValueChange={onInputChange}
                        />
                        {isValueInvalid && (
                            <span className="text-red-500 text-[10px] font-semibold mt-1">{errorMsg}</span>
                        )}
                    </div>
                )}

                {/* Children attributes if any */}
                {hierarchyData.children && hierarchyData.children.length > 0 && (
                    <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
                        <h5 className="text-xs font-bold text-slate-700 border-b border-slate-200/60 pb-1 mb-2">
                            {t("discount.complexFieldsTitle") || "Detailed Attributes"}
                        </h5>
                        <NestedAttributes
                            attrs={hierarchyData.children}
                            socialData={socialData}
                            errors={validationErrors || {}}
                            isAttributeEnabled={isAttributeEnabled}
                            handleValueChange={onInputChange}
                        />
                    </div>
                )}

                {/* Photo Upload Dropzone */}
                <div className="space-y-1.5 w-full">
                    <Label className="text-sm font-bold text-blue-800">
                        {t("discount.uploadDocument") || "Photo Attachment"}
                        {isPhotoRequired && <span className="text-red-500 ml-0.5">*</span>}
                    </Label>
                    <DocumentAttachment
                        documentGuid={data.documentGuid || undefined}
                        hasDocumentBinding={!!data.documentBindingId}
                        isUploading={data.isUploading}
                        isDeleting={data.isDeleting}
                        isDisabled={isDisabled}
                        isDocumentInvalid={isPhotoInvalid}
                        onFileUpload={handleFileUploadWithConfirm}
                        onFileDelete={handlePhotoDeleteWithConfirm}
                        t={t as (key: string, values?: Record<string, string | number>) => string}
                        label={displayName}
                        pendingFile={data.pendingFile}
                        allowedFormats={t("discount.allowedImageFormats") || "PNG, JPG (Max 5MB)"}
                    />

                    {isPhotoInvalid && (
                        <span className="text-red-500 text-[10px] font-semibold mt-1 block">{errorMsg}</span>
                    )}
                </div>

                {/* Remark Textarea */}
                <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-blue-800">
                            {t("discount.remark") || "Remark"}
                        </Label>
                        {(data.remark || "").trim() !== "" && (
                            <button
                                type="button"
                                onClick={() => onInputChange(data.socialAttributeId, "remark", "")}
                                disabled={isDisabled}
                                className="px-2.5 py-0.5 text-[10px] md:text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-400 active:bg-red-200 shadow-sm"
                            >
                                {t("commonbuttonmessages.clear") || "Clear"}
                            </button>
                        )}
                    </div>
                    <TextArea
                        value={data.remark || ""}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[<>]/g, "");
                            onInputChange(data.socialAttributeId, "remark", val);
                        }}
                        placeholder={t("discount.remarkPlaceholder") || "Enter remark..."}
                        disabled={isDisabled}
                        rows={2}
                        maxLength={500}
                        showCharCount
                        charCountLabel="characters"
                        className={`resize-y font-semibold ${isRemarkError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    />
                    {isRemarkError && (
                        <span className="text-red-500 text-[10px] font-semibold mt-1 block">{errorMsg}</span>
                    )}
                </div>
            </div>

            <div className="pt-2.5 border-t border-blue-50 mt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {t("discount.verifyDetailsNote") || "Verify details & photo attachment before saving changes."}
                    </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {onDeleteSocialDetail && isSocialDetailFilled && isUpdateCase && !isDisabled && (
                        <button
                            type="button"
                            disabled={isDisabled || isSaving}
                            onClick={handleDeleteSocialDetailWithConfirm}
                            className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t("discount.deleteSocialDetail") || "Delete Detail & Data"}
                        </button>
                    )}
                    {onSave && (
                        <SaveButton
                            onClick={onSave}
                            disabled={!hasChanges || isSaving}
                            isLoading={isSaving}
                            label={t("common.saveChanges") || "Save Changes"}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
