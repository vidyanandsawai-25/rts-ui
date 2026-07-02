"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Label, TextArea } from "@/components/common";
import { FlatSocialAttributeState, getLocalizedName } from "@/lib/utils/social-details";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";
import { DocumentAttachment } from "../building/DocumentAttachment";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { AttributeControl } from "./AttributeControl";
import { NestedAttributes } from "./NestedAttributes";
import { checkSocialRequiredFields } from "@/lib/validations/social-details.validation";

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
}) => {
    const { confirm } = useConfirm();

    if (!data || !hierarchyData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] lg:h-[calc(100vh-220px)] bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                <AlertCircle size={36} className="text-gray-400 mb-3" />
                <p className="text-sm font-bold text-gray-500">
                    {t("discount.selectDiscountPrompt") || "Select a social attribute from the sidebar to edit details"}
                </p>
            </div>
        );
    }

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

    const displayName = getLocalizedName(
        data.socialAttributeCode,
        data.socialAttributeName,
        t as unknown as (key: string) => string
    );

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
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] lg:h-[calc(100vh-340px)] bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <AlertCircle size={36} className="text-blue-500 mb-3" />
                <h4 className="text-base font-bold text-gray-800 mb-2">{displayName}</h4>
                <p className="text-sm font-semibold text-gray-500 max-w-sm">
                    {t("discount.enableDiscountPrompt") || "This attribute is currently disabled. Toggle it active in the sidebar list to edit details and attach photos."}
                </p>
            </div>
        );
    }

    const isDisabled = !isEnabled;
    const isPhotoRequired = data.isPhotoRequired === true;

    const errorMsg = validationErrors?.[data.socialAttributeId];
    const isPhotoInvalid = !!errorMsg && errorMsg.includes("required") && !data.documentGuid;
    const isValueInvalid = !!errorMsg && !isPhotoInvalid;

    const isRequiredFieldMissing = data
        ? !!checkSocialRequiredFields(data.socialAttributeId, socialData, t)
        : false;

    const dataTypeUpper = (data.dataType || "").toUpperCase();
    const showValueInput = dataTypeUpper !== "BIT";

    return (
        <div className={`flex flex-col min-h-[300px] lg:h-[calc(100vh-340px)] border rounded-xl shadow-sm p-4 justify-between transition-opacity ${
            isDisabled ? "bg-gray-50 border-gray-200 opacity-75" : "bg-white border-blue-100"
        }`}>
            <div className="space-y-5 overflow-y-auto pr-1">
                {isDisabled && (
                    <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-amber-800">
                            {t("discount.disabledWithDataNote") || "This attribute is currently disabled. Toggle it active to edit details."}
                        </span>
                    </div>
                )}
                
                <div className="pb-3 border-b border-blue-50">
                    <span className="text-xs font-bold tracking-wider text-blue-500 uppercase block mb-1">
                        {t("discount.editingDiscount") || "Social Attribute Details"}
                    </span>
                    <h4 className="text-lg font-bold text-blue-900 leading-tight">{displayName}</h4>
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
                            <span className="text-red-500 text-[10px] font-semibold mt-1">
                                {errorMsg}
                            </span>
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
                        isDisabled={isDisabled || isRequiredFieldMissing}
                        isDocumentInvalid={isPhotoInvalid}
                        onFileUpload={handleFileUploadWithConfirm}
                        onFileDelete={handlePhotoDeleteWithConfirm}
                        t={t as (key: string, values?: Record<string, string | number>) => string}
                        label={displayName}
                    />
                    {isRequiredFieldMissing && !isDisabled && (
                        <p className="text-xs font-semibold text-amber-600 mt-1">
                            {t("discount.fillRequiredBeforeUploadHint") || "Please enter the required details above to enable document upload."}
                        </p>
                    )}
                    {isPhotoInvalid && (
                        <span className="text-red-500 text-[10px] font-semibold mt-1 block">
                            {errorMsg}
                        </span>
                    )}
                </div>

                {/* Remark Textarea */}
                <div className="space-y-1.5 w-full">
                    <Label className="text-sm font-bold text-blue-800">
                        {t("discount.remark") || "Remark"}
                    </Label>
                    <TextArea
                        value={data.remark || ""}
                        onChange={(e) => onInputChange(data.socialAttributeId, "remark", e.target.value)}
                        placeholder={t("discount.remarkPlaceholder") || "Enter remark..."}
                        disabled={isDisabled}
                        rows={2}
                        className="resize-none font-semibold"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-blue-50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {t("discount.verifyDetailsNote") || "Verify details & photo attachment before saving changes."}
                </span>
            </div>
        </div>
    );
};
