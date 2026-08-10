"use client";

import React from "react";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Input, ValidationMessage, Label } from "@/components/common";
import { CertificateData, FloorCertificateDto } from "@/types/building-permission.types";
import { mapTypeNameToKey } from "@/lib/utils/building-helpers";
import { DocumentAttachment } from "./DocumentAttachment";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { getCertificateLengthRule } from "@/lib/validation/building/validation-rules";
import FloorTable from "../floorSubmission/FloorTable";
import type { FloorResponse, ConstructionTypeResponse, TypeOfUseApiItem, SubFloorResponse, SubTypeOfUseResponse } from "@/types/floor-details.types";
import type { FloorData } from "@/types/room-details.types";

interface BuildingDetailPaneProps {
    data: CertificateData | null | undefined;
    propertyWideCert?: CertificateData | null;
    onInputChange: (field: "number" | "date", value: string) => void;
    onFileUpload: (file: File) => void;
    onFileDelete?: (certificateTypeId: number) => void;
    validationError?: string;
    fieldErrors?: { number?: string; date?: string; document?: string };
    t: (key: string, values?: Record<string, string | number | Date>) => string;
    floorData?: FloorResponse[];
    constructionTypeData?: ConstructionTypeResponse[];
    useData?: TypeOfUseApiItem[];
    subFloorData?: SubFloorResponse[];
    subTypeData?: SubTypeOfUseResponse[];
    initialFloors?: FloorData[];
    activeScope?: string;
    activeFloorId?: string | number | null;
    onScopeChange?: (scope: "Property" | "Floor", floorDetailsId: number | null) => void | Promise<void>;
    floors?: FloorCertificateDto[];
        isFloorLoading?: boolean;
    cameFromFloor?: boolean;
    onDeleteCertificate?: () => void;
    isSaving?: boolean;
}

export const BuildingDetailPane: React.FC<BuildingDetailPaneProps> = ({
    data,
    propertyWideCert,
    onInputChange,
    onFileUpload,
    onFileDelete,
    validationError,
    fieldErrors,
    t,
    floorData = [],
    constructionTypeData = [],
    useData = [],
    subFloorData = [],
    subTypeData = [],
    initialFloors = [],
    floors = [],
    activeScope = 'Property',
    activeFloorId = null,
    onScopeChange,
    isFloorLoading = false,
    onDeleteCertificate,
    isSaving = false,
}) => {
    const { confirm } = useConfirm();

    const displayData = React.useMemo(() => {
        if (activeScope === "Floor" && data && !data.enabled && propertyWideCert) {
            return {
                ...data,
                number: propertyWideCert.number || "",
                date: propertyWideCert.date || "",
                documentGuid: propertyWideCert.documentGuid || "",
                fileName: propertyWideCert.fileName || "",
            };
        }
        return data;
    }, [activeScope, data, propertyWideCert]);

    const maxDate = React.useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, []);

    const lengthRule = React.useMemo(() => {
        return getCertificateLengthRule(data?.certificateTypeName || undefined);
    }, [data?.certificateTypeName]);

    const isUpdateCase = React.useMemo(() => {
        if (!displayData) return false;
        return typeof displayData.propertyCertificateId === "number" && displayData.propertyCertificateId > 0;
    }, [displayData]);

    const isCertificateFilled = React.useMemo(() => {
        if (!displayData) return false;
        const hasFile = !!(displayData.documentGuid || displayData.fileName || displayData.pendingFile);
        const hasNumber = !!displayData.number?.trim();
        const hasDate = !!displayData.date?.trim();
        return hasFile && hasNumber && hasDate;
    }, [displayData]);

    const floorsWithCertDates = React.useMemo(() => {
        return (initialFloors || []).map((f) => {
            const fId = f.id ?? (f as unknown as { propertyDetailsId?: number }).propertyDetailsId;
            const certFloor = (floors || []).find(
                (fc) => fc.propertyDetailsId === Number(fId)
            );
            return {
                ...f,
                ccDate: certFloor?.ccDate || (f as unknown as { ccDate?: string }).ccDate || null,
                ocDate: certFloor?.ocDate || (f as unknown as { ocDate?: string }).ocDate || null,
            };
        });
    }, [initialFloors, floors]);

    const handleFileUploadWithConfirm = (file: File) => {
        if (data && data.documentGuid) {
            confirm({
                title: t("building.confirmReplaceTitle") || "Replace Document",
                description: t("building.confirmReplaceDesc") || "Are you sure you want to replace the existing document with a new one?",
                confirmText: t("building.confirmReplaceOk") || "Yes, Replace",
                cancelText: t("building.confirmReplaceCancel") || "No, Cancel",
                variant: "warning",
                onConfirm: () => onFileUpload(file)
            });
        } else {
            onFileUpload(file);
        }
    };

    const handleFileDeleteWithConfirm = () => {
        if (onFileDelete && data) {
            confirm({
                title: t("building.confirmDeleteTitle") || "Delete Document",
                description: t("building.confirmDeleteDesc") || "Are you sure you want to delete the attached document? This action cannot be undone.",
                confirmText: t("building.confirmDeleteOk") || "Yes, Delete",
                cancelText: t("building.confirmDeleteCancel") || "No, Cancel",
                variant: "delete",
                onConfirm: () => onFileDelete(data.certificateTypeId)
            });
        }
    };

    const handleDeleteCertificateWithConfirm = () => {
        if (onDeleteCertificate && displayData) {
            const hasNum = !!displayData.number?.trim();
            const hasDt = !!displayData.date?.trim();
            const detailsList: string[] = [];
            if (hasNum) detailsList.push(`${t("building.number") || "Number"}: ${displayData.number}`);
            if (hasDt) detailsList.push(`${t("building.date") || "Date"}: ${displayData.date}`);

            confirm({
                title: t("building.confirmDeleteCertificateTitle") || "Delete Certificate & Data",
                description: `${t("building.confirmToggleOffWarning") || "You have an attached certificate with details:"}\n${displayName}${detailsList.length > 0 ? ` (${detailsList.join(", ")})` : ""}\n\n${t("building.confirmDeleteCertificateDesc") || "Are you sure you want to delete this certificate and all its associated data?"}`,
                confirmText: t("building.confirmDeleteCertificateOk") || "Yes, Delete",
                cancelText: t("building.confirmDeleteCertificateCancel") || "No, Cancel",
                variant: "delete",
                onConfirm: onDeleteCertificate
            });
        }
    };

    if (!data || !displayData) {
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

    const hasAnyData = !!(data.number?.trim() || data.date?.trim() || data.documentGuid?.trim());

    const isDisabled = !data.enabled;
    const isNumberInvalid = fieldErrors ? !!fieldErrors.number : !!validationError && (
        !displayData.number?.trim() || /\s/.test(displayData.number) || validationError.includes("Certificate Number")
    );
    const isDateInvalid = fieldErrors ? !!fieldErrors.date : !!validationError && !displayData.date?.trim();
    const isDocumentInvalid = fieldErrors ? !!fieldErrors.document : !!validationError && !displayData.documentGuid?.trim();

    return (
        <div className={`flex flex-col h-auto min-h-full border rounded-xl shadow-sm pt-3 px-4 pb-4 justify-between transition-opacity ${
            isDisabled ? "bg-gray-50 border-gray-200 opacity-75" : "bg-white border-blue-100"
        }`}>
            <div>
                <div className="pb-2 border-b border-blue-50 mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-col">
                        <h4 className="text-lg font-bold text-blue-900 leading-tight">{displayName}</h4>
                        {activeScope === "Floor" && activeFloorId !== null && (
                            <span className="text-xs font-bold text-blue-600 mt-1">
                                {t("building.selectedFloor") || "Selected Floor"}: {
                                    (() => {
                                        const selectedFloorObj = initialFloors.find(f =>
                                            Number(f.id) === Number(activeFloorId) ||
                                            Number((f as unknown as { propertyDetailsId?: number }).propertyDetailsId) === Number(activeFloorId)
                                        );
                                        return selectedFloorObj 
                                            ? `${selectedFloorObj.floor || ""}${selectedFloorObj.subFloor ? ` - ${selectedFloorObj.subFloor}` : ""}`
                                            : `Floor #${activeFloorId}`;
                                    })()
                                }
                            </span>
                        )}
                    </div>
                    {activeScope === "Floor" && onScopeChange && (
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => !isSaving && onScopeChange("Property", null)}
                            className={`px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg transition-colors ${
                                isSaving ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-blue-100 cursor-pointer"
                            }`}
                        >
                            {t("building.clearSelection") || "Clear Selection"}
                        </button>
                    )}
                </div>

                {/* Floor details table relocation */}
                <div className="mb-3">
                    <FloorTable
                        t={t}
                        filteredFloors={floorsWithCertDates}
                        floorSearch=""
                        setFloorSearch={() => {}}
                        selectedFloor={activeFloorId !== null ? initialFloors.find(f =>
                            Number(f.id) === Number(activeFloorId) ||
                            Number((f as unknown as { propertyDetailsId?: number }).propertyDetailsId) === Number(activeFloorId)
                        ) || null : null}
                        setSelectedFloor={() => {}}
                        isAddingNewFloor={false}
                        setIsAddingNewFloor={() => {}}
                        handleAddFloor={() => {}}
                        handleOpenDataEntrySameAs={() => {}}
                        viewOnly={true}
                        updateUrlParams={() => {}}
                        handleDeleteFloor={() => {}}
                        startTransition={(fn) => fn()}
                        setFormErrors={() => {}}
                        floorLookup={floorData}
                        subFloorLookup={subFloorData}
                        constructionLookup={constructionTypeData}
                        useLookup={useData}
                        subTypeData={subTypeData}
                        setEditingFloorForm={() => {}}
                        isBuildingPermissionView={true}
                        onRowClick={(floor: FloorData) => {
                            if (isSaving) return;
                            const targetId = floor.id ?? (floor as unknown as { propertyDetailsId?: number }).propertyDetailsId;
                            if (onScopeChange && targetId !== undefined && targetId !== null) {
                                onScopeChange("Floor", Number(targetId));
                            }
                        }}
                    />
                </div>

                <hr className="border-slate-200 mb-3" />

                {isFloorLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 bg-slate-50 border border-slate-200 rounded-xl">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                        <p className="text-xs font-semibold text-slate-500">
                            {t("building.loadingFloorDetails") || "Loading floor details..."}
                        </p>
                    </div>
                ) : (!data.enabled && !hasAnyData && !propertyWideCert) ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-xl text-center my-1">
                        <AlertCircle size={28} className="text-blue-500 mb-2" />
                        <p className="text-xs font-semibold text-gray-500 max-w-md">
                            {t("building.enableCertificatePrompt") || "This certificate type is currently disabled. Toggle it active in the sidebar list to edit details and attach documents."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mt-2.5 space-y-1.5 mb-3">
                            <Label className="text-sm font-bold text-blue-800">{t("building.documentAttachment", { name: displayName || "Document" }) || "Document Attachment"}<span className="text-red-500 ml-0.5">*</span></Label>
                            <DocumentAttachment
                                documentGuid={displayData.documentGuid}
                                fileName={displayData.fileName}
                                isUploading={displayData.isUploading}
                                isDeleting={displayData.isDeleting}
                                isDisabled={isDisabled}
                                isDocumentInvalid={isDocumentInvalid}
                                documentError={fieldErrors?.document || validationError}
                                onFileUpload={handleFileUploadWithConfirm}
                                onFileDelete={onFileDelete ? handleFileDeleteWithConfirm : undefined}
                                t={t}
                                label={displayName}
                                pendingFile={displayData.pendingFile}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-blue-800">{t("building.certificateNumber", { name: displayName || "Document" })}<span className="text-red-500 ml-0.5">*</span></Label>
                                <Input
                                    value={displayData.number}
                                    onChange={(e) => onInputChange("number", e.target.value.replace(/\s+/g, ""))}
                                    onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                                    placeholder={t("building.certificateNumberPlaceholder", { name: displayName || "document" })}
                                    disabled={isDisabled}
                                    maxLength={lengthRule.max}
                                    className={`h-10 text-sm placeholder:text-gray-400 focus:ring-1 shadow-sm transition-colors font-semibold ${
                                        isDisabled
                                            ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                                            : isNumberInvalid 
                                                ? "bg-white text-gray-800 border-red-500 focus:border-red-500 focus:ring-red-500" 
                                                : "bg-white text-gray-800 border-blue-200 focus:border-blue-600 focus:ring-blue-600 hover:border-blue-300"
                                    }`}
                                />
                                {isNumberInvalid && <ValidationMessage message={fieldErrors?.number || validationError} />}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-blue-800">{t("building.certificateDate", { name: displayName || "Document" })}<span className="text-red-500 ml-0.5">*</span></Label>
                                <Input
                                    type="date"
                                    max={maxDate}
                                    value={displayData.date}
                                    onChange={(e) => onInputChange("date", e.target.value)}
                                    placeholder={t("building.certificateDatePlaceholder", { name: displayName || "document" })}
                                    disabled={isDisabled}
                                    className={`h-10 text-sm placeholder:text-gray-400 [&::-webkit-datetime-edit]:text-gray-800 focus:ring-1 shadow-sm transition-colors font-semibold ${
                                        isDisabled
                                            ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                                            : isDateInvalid 
                                                ? "bg-white text-gray-800 border-red-500 focus:border-red-500 focus:ring-red-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
                                                : "bg-white text-gray-800 border-blue-200 focus:border-blue-600 focus:ring-blue-600 hover:border-blue-300 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                    }`}
                                />
                                {isDateInvalid && <ValidationMessage message={fieldErrors?.date || validationError} />}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="pt-2.5 border-t border-blue-50 mt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {t("building.verifyDetailsNote") || "Verify document details & file attachment before saving changes."}
                    </span>
                </div>
                {onDeleteCertificate && isCertificateFilled && isUpdateCase && !isDisabled && (
                    <button
                        type="button"
                        disabled={isDisabled}
                        onClick={handleDeleteCertificateWithConfirm}
                        className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t("building.deleteCertificate") || "Delete Certificate & Data"}
                    </button>
                )}
            </div>
        </div>
    );
};