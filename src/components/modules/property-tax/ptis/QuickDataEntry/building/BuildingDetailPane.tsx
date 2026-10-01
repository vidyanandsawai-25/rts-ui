"use client";

import React from "react";
import { AlertCircle, Loader2, Building2, Layers, ArrowLeft } from "lucide-react";
import { Input, ValidationMessage, Label, DeleteButton, SaveButton } from "@/components/common";
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
    onToggleEnabled?: (checked: boolean) => void;
    onCopyFromProperty?: () => void;
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
    onDeleteCertificate?: () => void | Promise<unknown>;
    isSaving?: boolean;
    isDeletingCertificate?: boolean;
    hasChanges?: boolean;
    saveError?: string;
    deleteError?: string;
    onSave?: () => void | Promise<unknown>;
}

export const BuildingDetailPane: React.FC<BuildingDetailPaneProps> = ({
    data,
    propertyWideCert,
    onInputChange,
    onFileUpload,
    onFileDelete,
    onToggleEnabled: _onToggleEnabled,
    onCopyFromProperty: _onCopyFromProperty,
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
    isDeletingCertificate = false,
    hasChanges = false,
    saveError,
    deleteError,
    onSave,
}) => {
    const { confirm } = useConfirm();
    const [localIsDeleting, setLocalIsDeleting] = React.useState(false);
    const [actionError, setActionError] = React.useState<string | null>(null);
    const isDeleting = isDeletingCertificate || localIsDeleting;

    const currentContextKey = `${data?.certificateTypeId}-${activeScope}-${activeFloorId}`;
    const [prevContextKey, setPrevContextKey] = React.useState(currentContextKey);
    if (prevContextKey !== currentContextKey) {
        setPrevContextKey(currentContextKey);
        setActionError(null);
    }

    const displayData = React.useMemo(() => {
        if (activeScope === "Floor" && data && !data.enabled && propertyWideCert) {
            const hasFloorData = Boolean(
                data.number?.trim() ||
                data.date?.trim() ||
                data.documentGuid ||
                data.propertyCertificateId ||
                data.pendingFile ||
                data.fileName
            );
            if (!hasFloorData) {
                return {
                    ...data,
                    number: propertyWideCert.number || "",
                    date: propertyWideCert.date || "",
                    documentGuid: propertyWideCert.documentGuid || "",
                    fileName: propertyWideCert.fileName || "",
                };
            }
        }
        return data;
    }, [activeScope, data, propertyWideCert]);

    const selectedFloorObj = React.useMemo(() => {
        if (activeScope !== "Floor" || activeFloorId === null || activeFloorId === undefined) return null;
        return (initialFloors || []).find(f =>
            Number(f.id) === Number(activeFloorId) ||
            Number((f as unknown as { propertyDetailsId?: number }).propertyDetailsId) === Number(activeFloorId)
        ) || null;
    }, [activeScope, activeFloorId, initialFloors]);

    const selectedFloorName = React.useMemo(() => {
        if (!selectedFloorObj) return activeFloorId ? `Floor #${activeFloorId}` : "";
        const name = selectedFloorObj.floor || selectedFloorObj.floorDescription || "";
        const sub = selectedFloorObj.subFloor || selectedFloorObj.subFloorDescription || "";
        return `${name}${sub ? ` - ${sub}` : ""}`.trim() || `Floor #${activeFloorId}`;
    }, [selectedFloorObj, activeFloorId]);

    const maxDate = React.useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, []);

    const minDate = React.useMemo(() => {
        let targetConstructionYear: number | null = null;
        if (activeScope === 'Floor' && activeFloorId !== undefined && activeFloorId !== null) {
            const activeFloor = floors.find(f => f.propertyDetailsId === activeFloorId);
            if (activeFloor?.constructionYear) {
                targetConstructionYear = parseInt(activeFloor.constructionYear, 10);
            }
        } else {
            if (floors && floors.length > 0) {
                const years = floors
                    .map(f => f.constructionYear ? parseInt(f.constructionYear, 10) : null)
                    .filter((y): y is number => y !== null && !isNaN(y));
                if (years.length > 0) {
                    targetConstructionYear = Math.min(...years);
                }
            }
        }
        return (targetConstructionYear && !isNaN(targetConstructionYear)) ? `${targetConstructionYear}-01-01` : undefined;
    }, [activeScope, activeFloorId, floors]);

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
        return (initialFloors || [])
            .filter((f) => {
                const raw = f as unknown as Record<string, unknown>;
                const floorDesc = String(f.floor || f.floorDescription || raw.floorName || "").trim().toLowerCase();
                const conTyp = String(f.conTyp || f.constructionTypeDescription || raw.constructionTypeName || "").trim().toLowerCase();
                const use = String(f.use || f.typeOfUseDescription || raw.useName || "").trim().toLowerCase();
                const subUse = String(f.subTyp || f.subTypeOfUseDescription || raw.subUseName || "").trim().toLowerCase();
                const floorId = String(f.floorId || f.floorID || "");
                const isOpenPlot = floorDesc === "open plot" || floorDesc === "op" || floorDesc.includes("open plot") ||
                    conTyp === "open plot" || conTyp === "op" || conTyp.includes("open plot") ||
                    use.includes("खुला भूखंड") || use.includes("open plot") ||
                    subUse.includes("खुला भूखंड") || subUse.includes("open plot") ||
                    floorId === "77" || raw.isOpenPlot === true || raw.isPlotCategory === true;
                return !isOpenPlot;
            })
            .map((f) => {
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
                onConfirm: async () => {
                    setLocalIsDeleting(true);
                    setActionError(null);
                    try {
                        const res = await onDeleteCertificate();
                        if (res && typeof res === "object" && (res as { success?: boolean }).success === false) {
                            const errorMsg = (res as { message?: string; error?: string }).error || (res as { message?: string; error?: string }).message || t("building.deleteError") || "Failed to delete certificate";
                            setActionError(errorMsg);
                        }
                    } catch (err: unknown) {
                        const errorMsg = err instanceof Error ? err.message : (t("building.deleteError") || "Failed to delete certificate");
                        setActionError(errorMsg);
                    } finally {
                        setLocalIsDeleting(false);
                    }
                }
            });
        }
    };

    const handleSaveClick = async () => {
        if (!onSave || isSaving || isDeleting || isDisabled || !hasChanges) return;
        setActionError(null);
        try {
            const res = await onSave();
            if (res && typeof res === "object" && (res as { success?: boolean }).success === false) {
                const errorMsg = (res as { message?: string; error?: string }).error || (res as { message?: string; error?: string }).message || t("building.saveError") || "Failed to save changes";
                setActionError(errorMsg);
            }
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : (t("building.saveError") || "Failed to save changes");
            setActionError(errorMsg);
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
    const isDisabled = !data.enabled;
    const isNumberInvalid = fieldErrors ? !!fieldErrors.number : !!validationError && (
        !displayData.number?.trim() || /\s/.test(displayData.number) || validationError.includes("Certificate Number")
    );
    const isDateInvalid = fieldErrors ? !!fieldErrors.date : !!validationError && !displayData.date?.trim();
    const isDocumentInvalid = fieldErrors ? !!fieldErrors.document : !!validationError && !displayData.documentGuid?.trim();

    return (
        <div className="flex flex-col h-auto min-h-full border rounded-xl shadow-sm pt-3 px-4 pb-4 justify-between bg-white border-blue-100">
            <div>
                {/* Header with Title and Scope Badge */}
                <div className="pb-2.5 border-b border-blue-50 mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-blue-900 leading-tight">{displayName}</h4>
                        {activeScope === "Floor" ? (
                            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                                <Layers className="w-3 h-3 text-amber-600" />
                                {selectedFloorName} ({t("building.scopeFloorBadge") || "Floor Scope"})
                            </span>
                        ) : (
                            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-blue-600" />
                                {t("building.scopePropertyBadge") || "Entire Property"}
                            </span>
                        )}
                    </div>
                </div>

                {/* Scope Explanation & Quick Action Card */}
                <div className="bg-slate-50 border border-blue-100 rounded-xl p-2.5 mb-3 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                {t("building.activeScopeLabel") || "Active Scope"}:
                            </span>
                            {activeScope === "Floor" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-500 text-white shadow-2xs whitespace-nowrap">
                                    <Layers className="w-3.5 h-3.5 shrink-0" />
                                    <span>{selectedFloorName}</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-white text-blue-900 border border-blue-200 shadow-2xs whitespace-nowrap">
                                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    <span>{t("building.scopeProperty") || "Entire Property"}</span>
                                </span>
                            )}
                            <span className="text-xs text-slate-600 ml-1">
                                {activeScope === "Floor"
                                    ? (t("building.floorScopeNotice") || "Customizing certificate for this floor (overrides property-level certificate).")
                                    : (t("building.propertyScopeNotice") || "Details entered below apply to the entire property (all floors).")}
                            </span>
                        </div>

                        {activeScope === "Floor" && onScopeChange && (
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => !isSaving && onScopeChange("Property", null)}
                                    className="whitespace-nowrap shrink-0 inline-flex flex-row items-center gap-1.5 text-xs font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 hover:text-blue-800 shadow-2xs h-8 px-3 rounded-lg cursor-pointer transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    <span>{t("building.clearSelection") || "Back to Entire Property"}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floors Overview Table Header */}
                <div className="mb-2 flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        {t("building.floorsOverview") || "Floors Overview"}
                        <span className="text-[11px] font-normal text-slate-500">
                            ({t("building.clickFloorHint") || "Click a floor below to view or customize floor-wise certificate"})
                        </span>
                    </Label>
                    {floorsWithCertDates.length > 0 && (
                        <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {floorsWithCertDates.length} {floorsWithCertDates.length === 1 ? (t("building.floorCountSingular") || "Floor") : (t("building.floorCountPlural") || "Floors")}
                        </span>
                    )}
                </div>

                {/* Floor details table relocation */}
                <div className="mb-3">
                    <FloorTable
                        t={t}
                        filteredFloors={floorsWithCertDates}
                        floorSearch=""
                        setFloorSearch={() => {}}
                        selectedFloor={activeFloorId !== null ? floorsWithCertDates.find(f =>
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
                                if (activeScope === "Floor" && Number(activeFloorId) === Number(targetId)) {
                                    onScopeChange("Property", null);
                                } else {
                                    onScopeChange("Floor", Number(targetId));
                                }
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
                ) : (
                    <>
                        {/* Certificate Form Context Header */}
                        <div className="pt-1 pb-2 mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100">
                            <div>
                                <h5 className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
                                    {activeScope === "Floor" ? (
                                        <>
                                            <Layers className="w-4 h-4 text-amber-600" />
                                            <span>{t("building.floorCertificateDetailsTitle") || "Floor Certificate Details"}: <span className="text-amber-700">{selectedFloorName}</span></span>
                                        </>
                                    ) : (
                                        <>
                                            <Building2 className="w-4 h-4 text-blue-700" />
                                            <span>{t("building.propertyCertificateDetailsTitle") || "Property-Level Certificate Details"}</span>
                                        </>
                                    )}
                                </h5>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    {activeScope === "Floor"
                                        ? (t("building.floorDetailsDesc") || `These certificate details will be saved specifically for ${selectedFloorName} (overriding property certificate).`)
                                        : (t("building.propertyDetailsDesc") || "These certificate details apply to the entire property (all constructed floors).")}
                                </p>
                            </div>
                        </div>

                        {/* Document Attachment Section */}
                        <div className="mt-1 space-y-1.5 mb-3">
                            <Label className="text-sm font-bold text-blue-800">
                                {t("building.documentAttachment", { name: displayName || "Document" }) || "Document Attachment"}
                                <span className="text-red-500 ml-0.5">*</span>
                            </Label>
                            <DocumentAttachment
                                documentGuid={displayData.documentGuid}
                                fileName={displayData.fileName}
                                isUploading={displayData.isUploading}
                                isDeleting={displayData.isDeleting}
                                isDisabled={false}
                                isDocumentInvalid={isDocumentInvalid}
                                documentError={fieldErrors?.document || validationError}
                                onFileUpload={handleFileUploadWithConfirm}
                                onFileDelete={onFileDelete ? handleFileDeleteWithConfirm : undefined}
                                t={t}
                                label={displayName}
                                pendingFile={displayData.pendingFile}
                            />
                        </div>

                        {/* Certificate Number & Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-blue-800">
                                    {t("building.certificateNumber", { name: displayName || "Document" }) || "Certificate Number"}
                                    <span className="text-red-500 ml-0.5">*</span>
                                </Label>
                                <Input
                                    value={displayData.number}
                                    onChange={(e) => {
                                        onInputChange("number", e.target.value.replace(/\s+/g, ""));
                                        setActionError(null);
                                    }}
                                    onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                                    placeholder={t("building.certificateNumberPlaceholder", { name: displayName || "document" })}
                                    maxLength={lengthRule.max}
                                    className={`h-10 text-sm placeholder:text-gray-400 focus:ring-1 shadow-sm transition-colors font-semibold ${
                                        isNumberInvalid 
                                            ? "bg-white text-gray-800 border-red-500 focus:border-red-500 focus:ring-red-500" 
                                            : "bg-white text-gray-800 border-blue-200 focus:border-blue-600 focus:ring-blue-600 hover:border-blue-300"
                                    }`}
                                />
                                {isNumberInvalid && <ValidationMessage message={fieldErrors?.number || validationError} />}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-blue-800">
                                    {t("building.certificateDate", { name: displayName || "Document" })}
                                    <span className="text-red-500 ml-0.5">*</span>
                                </Label>
                                <Input
                                    type="date"
                                    min={minDate}
                                    max={maxDate}
                                    value={displayData.date}
                                    onChange={(e) => {
                                        onInputChange("date", e.target.value);
                                        setActionError(null);
                                    }}
                                    placeholder={t("building.certificateDatePlaceholder", { name: displayName || "document" })}
                                    className={`h-10 text-sm placeholder:text-gray-400 [&::-webkit-datetime-edit]:text-gray-800 focus:ring-1 shadow-sm transition-colors font-semibold ${
                                        isDateInvalid 
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

            {(actionError || saveError || deleteError) && (
                <div className="mb-2 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs text-red-700">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="font-semibold">{actionError || saveError || deleteError}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setActionError(null)}
                        className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="pt-2.5 border-t border-blue-50 mt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0 animate-pulse" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {t("building.verifyDetailsNote") || "Verify document details & file attachment before saving changes."}
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    {onDeleteCertificate && isCertificateFilled && isUpdateCase && !isDisabled && (
                        <DeleteButton
                            size="xs"
                            aria-label={t("building.deleteCertificate") || "Delete Certificate & Data"}
                            disabled={isDisabled || isSaving || isDeleting}
                            isLoading={isDeleting}
                            onClick={handleDeleteCertificateWithConfirm}
                        >
                            {t("building.deleteCertificate") || "Delete Certificate & Data"}
                        </DeleteButton>
                    )}
                    {onSave && (
                        <SaveButton
                            onClick={handleSaveClick}
                            disabled={!hasChanges || isSaving || isDeleting || isDisabled}
                            isLoading={isSaving}
                            label={t("common.saveChanges") || "Save Changes"}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};