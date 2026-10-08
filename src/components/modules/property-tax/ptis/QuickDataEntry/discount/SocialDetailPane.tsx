"use client";

import React from "react";
import { Trash2, Info, Loader2 } from "lucide-react";
import { Label, TextArea, SaveButton } from "@/components/common";
import { FlatSocialAttributeState, getLocalizedName } from "@/lib/utils/social-details";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";
import { DocumentAttachment } from "../building/DocumentAttachment";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { AttributeControl } from "./AttributeControl";
import { NestedAttributes } from "./NestedAttributes";
import { SocialSelectPrompt } from "./SocialPanePlaceholders";

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
    isDeleting?: boolean;
    hasChanges?: boolean;
    isFormValid?: boolean;
    onSave?: () => void;
    isDeleteDisabled?: boolean;
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
    isDeleting = false,
    hasChanges = false,
    isFormValid,
    onSave,
    isDeleteDisabled = false,
}) => {
    const { confirm } = useConfirm();

    const isSocialDetailFilled = React.useMemo(() => {
        if (!data) return false;
        if (data.isInherited && data.bitValue) return true;
        const hasFile = !!(data.documentGuid || data.documentUrl || data.photoGuid || data.documentBindingId || data.photoBindingId || data.pendingFile);
        const isBitType = data.dataType?.toUpperCase() === "BIT";
        if (isBitType) {
            return hasFile || !!data.remark?.trim() || data.bitValue === true;
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
        return (
            (typeof data.id === "number" && data.id > 0) ||
            (data.isInherited && data.bitValue !== false) ||
            data.isOverridden
        );
    }, [data]);

    const isSpecialToggle = React.useMemo(() => {
        if (!data) return false;
        const code = (data.socialAttributeCode || "").toUpperCase();
        return code === "ROAD_WIDTH" || 
               code.includes("WATER_CONN") || 
               code.includes("TREE");
    }, [data]);

    const isValueRequired = React.useMemo(() => {
        if (!data) return false;
        return Boolean(data.isRequiredWhenParentTrue || (isSpecialToggle && data.bitValue === true));
    }, [data, isSpecialToggle]);

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
            let title = t("discount.confirmDeleteAttributeTitle") || "Delete Social Detail & Data";
            let description = `${t("discount.confirmToggleOffWarning") || "You have an active attribute with details:"}\n${displayName}\n\n${t("discount.confirmDeleteAttributeDesc") || "Are you sure you want to delete this social detail and all its associated data?"}`;

            if (data.isOverridden) {
                title = t("discount.confirmDeleteOverrideTitle") || "Delete Level Override";
                description = `${displayName}\n\n${t("discount.confirmDeleteOverrideDesc") || "You have modified this inherited attribute. Deleting this will remove the custom override for this level and revert back to inherited settings.\n\nAre you sure you want to delete this override?"}`;
            } else if (
                (data.inheritedFrom || '').toUpperCase() === 'WING' ||
                (data.inheritanceLevel || '').toUpperCase() === 'WING' ||
                ((data.entityType || '').toUpperCase() === 'W' && data.isInherited)
            ) {
                title = t("discount.confirmDeleteWingTitle") || "Delete Wing Level Detail";
                description = `${displayName}\n\n${t("discount.confirmDeleteSocialWingDesc") || "This social attribute is applied at Wing Level.\n\nDeleting it will remove this attribute from this Wing and all its units.\n\nAre you sure you want to delete this Wing Level attribute?"}`;
            } else if (
                (data.inheritedFrom || '').toUpperCase() === 'APARTMENT' ||
                (data.inheritanceLevel || '').toUpperCase() === 'APARTMENT' ||
                ((data.entityType || '').toUpperCase() === 'S' && data.isInherited)
            ) {
                title = t("discount.confirmDeleteApartmentTitle") || "Delete Apartment Level Detail";
                description = `${displayName}\n\n${t("discount.confirmDeleteSocialApartmentDesc") || "This social attribute is applied at Apartment Level.\n\nDeleting it will remove this attribute from the entire Apartment level (affecting all wings and units).\n\nAre you sure you want to delete this Apartment Level attribute?"}`;
            } else if ((data.entityType || '').toUpperCase() === 'W') {
                title = t("discount.confirmDeleteWingTitle") || "Delete Wing Level Detail";
                description = `${displayName}\n\n${t("discount.confirmDeleteSocialWingDesc") || "This social attribute is applied at Wing Level.\n\nDeleting it will remove this attribute from this Wing and all its units.\n\nAre you sure you want to delete this Wing Level attribute?"}`;
            } else if ((data.entityType || '').toUpperCase() === 'S') {
                title = t("discount.confirmDeleteApartmentTitle") || "Delete Apartment Level Detail";
                description = `${displayName}\n\n${t("discount.confirmDeleteSocialApartmentDesc") || "This social attribute is applied at Apartment Level.\n\nDeleting it will remove this attribute from the entire Apartment level (affecting all wings and units).\n\nAre you sure you want to delete this Apartment Level attribute?"}`;
            } else {
                title = t("discount.confirmDeleteUnitTitle") || "Delete Unit Level Detail";
                description = `${displayName}\n\n${t("discount.confirmDeleteSocialUnitDesc") || "This social attribute is applied at Unit Level.\n\nDeleting it will remove this attribute for the selected unit(s).\n\nAre you sure you want to delete this Unit Level attribute?"}`;
            }

            confirm({
                title,
                description,
                confirmText: t("discount.confirmDeleteAttributeOk") || "Yes, Delete",
                cancelText: t("discount.confirmDeleteAttributeCancel") || "No, Cancel",
                variant: "delete",
                onConfirm: () => {
                    if (onDeleteSocialDetail) onDeleteSocialDetail();
                }
            });
        }
    };

    const isPhotoRequired = data.isPhotoRequired === true;

    const errorMsg = validationErrors?.[data.socialAttributeId];
    const tHas = typeof (t as { has?: (key: string) => boolean }).has === "function";
    const docRequiredMsg = (tHas && (t as { has: (key: string) => boolean }).has("common.validation.documentRequired"))
        ? t("common.validation.documentRequired")
        : "Document is required.";
    const photoRequiredMsg = (tHas && (t as { has: (key: string) => boolean }).has("discount.socialValidation.photoRequired"))
        ? t("discount.socialValidation.photoRequired")
        : "Photo is required.";

    const isPhotoInvalid = !!errorMsg && (
        errorMsg === docRequiredMsg ||
        errorMsg === photoRequiredMsg ||
        errorMsg.toLowerCase().includes("photo is required") ||
        errorMsg.toLowerCase().includes("document is required")
    );

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
    const isDisabled = !isAttributeEnabled(data);
    const canDelete = !isDisabled && !isDeleteDisabled;

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
                                    ? (t("discount.inheritedFromApartmentNote") || "This social attribute is inherited from Apartment level. Modifying details or toggling it off will create an override.")
                                    : (t("discount.inheritedFromWingNote") || "This social attribute is inherited from Wing level. Modifying details or toggling it off will create an override.")}
                        </span>
                    </div>
                )}

                {isDisabled && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-xs font-semibold mb-2">
                        <Info size={16} className="text-amber-600 shrink-0" />
                        <span>
                            {t("discount.enableDiscountPrompt") ||
                                "This social attribute is currently disabled. Toggle it active in the sidebar list to edit details and attach documents."}
                        </span>
                    </div>
                )}

                <div className="pb-2 border-b border-blue-50">
                    <span className="text-[11px] font-bold tracking-wider text-blue-500 uppercase block mb-0.5">
                        {t("discount.editingDiscount") || "Social Attribute Details"}
                    </span>
                    <h4 className="text-base font-bold text-blue-900 leading-tight">{displayName}</h4>
                </div>

                {/* Root value input if applicable */}
                {showValueInput && (
                    <div className="flex flex-col gap-1 w-full">
                        <span className="text-xs font-bold text-slate-600">
                            {displayName}
                            {isValueRequired && <span className="text-red-500 ml-0.5">*</span>}
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
                    <div className="p-2 bg-slate-50/50 border border-slate-100 rounded-lg space-y-2">
                        <h5 className="text-xs font-bold text-slate-700 border-b border-slate-200/60 pb-1 mb-1.5">
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
                <div className="space-y-1 w-full">
                    <Label className="text-sm font-bold text-blue-800">
                        {t("discount.uploadDocument") || "Photo Attachment"}
                        {isPhotoRequired && <span className="text-red-500 ml-0.5">*</span>}
                    </Label>
                    <DocumentAttachment
                        documentGuid={data.documentGuid || undefined}
                        fileName={data.fileName || undefined}
                        hasDocumentBinding={!!data.documentBindingId}
                        isUploading={data.isUploading}
                        isDeleting={data.isDeleting}
                        isDisabled={isDisabled}
                        isDocumentInvalid={isPhotoInvalid}
                        onFileUpload={handleFileUploadWithConfirm}
                        onFileDelete={canDelete && (data.documentGuid || data.documentBindingId || data.photoBindingId || data.pendingFile) ? handlePhotoDeleteWithConfirm : undefined}
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
                <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-blue-800">
                            {t("discount.remark") || "Remark"}
                        </Label>
                        {(data.remark || "").trim() !== "" && !isDisabled && (
                            <button
                                type="button"
                                onClick={() => onInputChange(data.socialAttributeId, "remark", "")}
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
                            onInputChange(data.socialAttributeId, "remark", val);
                        }}
                        placeholder={t("discount.remarkPlaceholder") || "Enter remark..."}
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

            <div className="pt-2 border-t border-blue-100 mt-1 flex items-center justify-between gap-2 shrink-0 bg-white z-10">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0 animate-pulse" aria-hidden="true" role="presentation" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {t("discount.verifyDetailsNote") || "Verify details & photo attachment before saving changes."}
                    </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {onDeleteSocialDetail && isSocialDetailFilled && isUpdateCase && canDelete && (
                        <button
                            type="button"
                            disabled={isDisabled || isSaving || isDeleting || !canDelete}
                            onClick={handleDeleteSocialDetailWithConfirm}
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
                                    <span>{t("discount.deleteSocialDetail") || "Delete Detail & Data"}</span>
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
