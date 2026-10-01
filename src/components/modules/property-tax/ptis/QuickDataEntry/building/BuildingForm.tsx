"use client"

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs } from "@/components/common";
import { BuildingFormProps } from "@/types/building-permission.types";
import { useBuildingForm } from "@/hooks/useBuildingForm";
import { BuildingPermissionSection } from "./BuildingPermissionSection";
import { BuildingSidebar } from "./BuildingSidebar";
import { BuildingDetailPane } from "./BuildingDetailPane";
import type { WingOption, UnitSelectionItem, ApplicationLevel } from "@/types/building-permission.types";

import { toast } from "sonner";
import { useLocale } from "next-intl";
import { 
    postApartmentQcCertificateRecordAction, 
    deletePropertyCertificateRecordAction 
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Building/action";
import { useConfirm } from '@/components/common/ConfirmProvider';


const BuildingForm: React.FC<BuildingFormProps> = ({
    initialBuildingPermission,
    initialFloorBuildingPermission,
    initialFloorCertificates,
    initialActiveScope,
    initialActiveFloorId,
    initialSelectedTypeId,
    propertyId,
    isSociety = true,
    societyDetailId,
    wingDetailId,
    floorData = [],
    constructionTypeData = [],
    useData = [],
    subFloorData = [],
    subTypeData = [],
    initialFloors = [],
    initialWings = [],
    initialUnits = [],
    initialCertificateTypes = [],
    initialCertificateGrid = null,
    propertyConstructionYear,
}) => {
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [showActiveFirst, setShowActiveFirst] = useState(false);
    const { confirm } = useConfirm();

    useEffect(() => {
        const handleCompleted = (e: Event) => {
            const customEvent = e as CustomEvent<{ societyDetailId?: number | null }>;
            if (
                !customEvent.detail?.societyDetailId ||
                !societyDetailId ||
                customEvent.detail.societyDetailId === societyDetailId
            ) {
                router.refresh();
            }
        };

        window.addEventListener("tax-recalculation-completed", handleCompleted);
        return () => {
            window.removeEventListener("tax-recalculation-completed", handleCompleted);
        };
    }, [router, societyDetailId]);

    const {
        buildingPermission,
        hasChanges,
        isSaving,
        handleFileUpload,
        handleFileDelete,
        handleToggleEnabled,
        handleCopyFromPropertyCert,
        handleInputChange,
        handleDeleteCertificate,
        handleSave,
        selectedTypeId,
        setSelectedTypeId,
        activeScope,
        activeFloorId,
        selectFloorOrPropertyScope,
        floors,
        isFloorLoading,
        validationErrors,
        fieldErrors,
        propertyCertificatesState,
        t,
    } = useBuildingForm(
        initialBuildingPermission,
        initialFloorCertificates || null,
        propertyId,
        initialFloors,
        initialFloorBuildingPermission,
        initialActiveScope,
        initialActiveFloorId,
        initialSelectedTypeId
    );

    const [isSectionSaving, setIsSectionSaving] = useState(false);

    const handleToggleWithConfirm = (typeId: number, checked: boolean) => {
        if (checked) {
            handleToggleEnabled(typeId, true);
            return;
        }

        const cert = buildingPermission[typeId];
        const hasData = cert && (
            !!cert.propertyCertificateId ||
            !!cert.documentGuid ||
            !!cert.number ||
            !!cert.date ||
            !!cert.pendingFile
        );
        
        if (!hasData) {
            handleToggleEnabled(typeId, false);
            return;
        }

        const typeObj = initialCertificateTypes.find(c => c.certificateTypeId === typeId);
        const certTypeName = typeObj?.certificateTypeName || 'Certificate';
        
        const detailsLines: string[] = [];
        if (activeScope === 'Floor') {
             detailsLines.push(`Scope: Floor Level`);
        } else {
             detailsLines.push(`Scope: Property Level`);
        }
        detailsLines.push(`Certificate: ${certTypeName}`);
        if (cert.number) detailsLines.push(`Cert No: #${cert.number}`);
        if (cert.date) {
            const displayDate = cert.date.includes('T') ? cert.date.split('T')[0] : cert.date;
            detailsLines.push(`Date: ${displayDate}`);
        }
        if (cert.fileName) detailsLines.push(`Document: ${cert.fileName}`);
        else if (cert.pendingFile) detailsLines.push(`Document: ${cert.pendingFile.name}`);

        const descriptionText = `${t('building.confirmToggleOffWarning') || 'You have an attached certificate with details:'}\n\n${detailsLines.map(l => `• ${l}`).join('\n')}\n\n${t('building.confirmDeleteCertificateDesc') || 'Are you sure you want to delete this certificate and all its associated data?'}`;

        confirm({
            variant: 'warning',
            size: 'lg',
            title: t('building.confirmDeleteCertificateTitle') || 'Delete Certificate & Data',
            description: descriptionText,
            confirmText: t('building.confirmDeleteCertificateOk') || 'Yes, Delete',
            cancelText: t('building.confirmDeleteCertificateCancel') || 'No, Cancel',
            onConfirm: async () => {
                if (!cert.propertyCertificateId && !cert.documentGuid) {
                    handleToggleEnabled(typeId, false);
                    handleInputChange(typeId, 'number', '');
                    handleInputChange(typeId, 'date', '');
                    handleFileDelete(typeId);
                    return;
                }
                
                setIsSectionSaving(true);
                try {
                    await handleDeleteCertificate(typeId);
                } finally {
                    setIsSectionSaving(false);
                }
            }
        });
    };

    const wingOptions: WingOption[] = useMemo(() => {
        const map = new Map<string, WingOption>();
        (initialFloors || []).forEach((f, idx) => {
            const rawItem = f as unknown as Record<string, unknown>;
            const rawWing = rawItem.societyWingName || rawItem.wingName || rawItem.wingDescription || rawItem.wing || rawItem.societyWing || rawItem.wingNo || rawItem.blockName;
            if (typeof rawWing === "string" && rawWing.trim().length > 0) {
                const wingName = rawWing.trim();
                const wingDetailId = Number(rawItem.wingDetailId || rawItem.societyWingId || rawItem.wingId || rawItem.wingMasterId || idx + 1);
                if (!map.has(wingName)) {
                    map.set(wingName, {
                        wingDetailId,
                        wingName,
                    });
                }
            }
        });
        return Array.from(map.values());
    }, [initialFloors]);

    const unitOptions: UnitSelectionItem[] = useMemo(() => {
        return (initialFloors || []).map((f) => {
            const propertyDetailsId = f.id ?? (f as unknown as { propertyDetailsId?: number }).propertyDetailsId ?? 0;
            const rawWing = f.wing || (f as unknown as { wingName?: string }).wingName;
            const wingName = typeof rawWing === "string" ? rawWing : "A Wing";
            const wingDetailId = f.wingDetailId || 1;
            const floorName = typeof f.floor === "string" ? f.floor : String(f.floorDescription || "1st Floor");
            const useName = typeof f.use === "string" ? f.use : "Residential";
            const unitNo = f.flatNo || f.flatNumber || f.unitNo || `Unit ${propertyDetailsId}`;
            return {
                propertyDetailsId: Number(propertyDetailsId),
                unitNo: String(unitNo),
                wingDetailId: Number(wingDetailId),
                wingName,
                floorName: String(floorName),
                useName: String(useName),
                isSelected: false,
                constructionYear: (f as unknown as { constructionYear?: string | number }).constructionYear,
            };
        });
    }, [initialFloors]);

    const firstAvailableTypeId = useMemo(() => {
        const sorted = Object.values(buildingPermission).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        return sorted.length > 0 ? sorted[0].certificateTypeId : null;
    }, [buildingPermission]);

    const activeSelectedTypeId = selectedTypeId !== null ? selectedTypeId : firstAvailableTypeId;
    const selectedCert = activeSelectedTypeId !== null ? buildingPermission[activeSelectedTypeId] : null;

    const allCertificatesList = useMemo(() => {
        return Object.values(buildingPermission).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }, [buildingPermission]);

    const filteredCertificates = useMemo(() => {
        let result = [...allCertificatesList];

        if (showActiveFirst) {
            result.sort((a, b) => {
                const aFilled = !!(a.number && a.date && (a.documentGuid || a.fileName || a.pendingFile));
                const bFilled = !!(b.number && b.date && (b.documentGuid || b.fileName || b.pendingFile));
                if (aFilled && !bFilled) return -1;
                if (!aFilled && bFilled) return 1;
                return 0;
            });
        }

        if (searchTerm.trim() !== "") {
            const lower = searchTerm.toLowerCase();
            result = result.filter(c => 
                c.certificateTypeName?.toLowerCase().includes(lower) ||
                c.number?.toLowerCase().includes(lower)
            );
        }

        return result;
    }, [allCertificatesList, showActiveFirst, searchTerm]);

    const propertyWideCert = useMemo(() => {
        if (activeScope === "Floor" && activeSelectedTypeId !== null) {
            return propertyCertificatesState[activeSelectedTypeId] || null;
        }
        return null;
    }, [activeScope, activeSelectedTypeId, propertyCertificatesState]);

    const urlLevel = searchParams.get('level') as ApplicationLevel | null;
    const urlCertTypeId = searchParams.get('certificateTypeId') || searchParams.get('certTypeId');
    const urlCertTypeCode = searchParams.get('certificateTypeCode') || searchParams.get('certType');

    let effectiveCertTypeId = activeSelectedTypeId || 3;
    if (urlCertTypeId && !isNaN(Number(urlCertTypeId))) {
        effectiveCertTypeId = Number(urlCertTypeId);
    } else if (urlCertTypeCode) {
        const matched = initialCertificateTypes.find(
            (ct) => ct.certificateTypeCode?.toLowerCase() === urlCertTypeCode.toLowerCase()
        );
        if (matched?.certificateTypeId) {
            effectiveCertTypeId = matched.certificateTypeId;
        }
    }

    const effectiveLevel: ApplicationLevel =
        urlLevel === 'Apartment' || urlLevel === 'Wing' || urlLevel === 'Unit'
            ? urlLevel
            : activeScope === 'Floor'
            ? 'Unit'
            : 'Apartment';

    return (
        <Tabs defaultValue="building" className="flex-1 flex flex-col min-h-0 h-full lg:h-[calc(100vh-125px)] max-h-[calc(100vh-125px)] overflow-hidden">
            <Tabs.TabPanel value="building" className="mt-0 p-0 flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                {isSociety ? (
                    <BuildingPermissionSection
                        propertyId={propertyId}
                        societyId={societyDetailId ?? null}
                        wingDetailId={wingDetailId ?? null}
                        wings={initialWings.length > 0 ? initialWings : wingOptions}
                        units={initialUnits.length > 0 ? initialUnits : unitOptions}
                        certificateTypes={initialCertificateTypes}
                        initialCertificateGrid={initialCertificateGrid}
                        initialLevel={effectiveLevel}
                        initialCertificateTypeId={effectiveCertTypeId}
                        initialData={selectedCert}
                        isSaving={isSaving || isSectionSaving}
                        propertyConstructionYear={propertyConstructionYear}
                        onDelete={(certTypeId) => handleDeleteCertificate(certTypeId)}
                        onDeleteRecord={async (params) => {
                            setIsSectionSaving(true);
                            try {
                                const urlSocietyDetailId = searchParams.get('societyDetailId') || searchParams.get('societyId');
                                const effectiveSocietyDetailId = params.societyDetailId ?? societyDetailId ?? (urlSocietyDetailId ? Number(urlSocietyDetailId) : null);
                                const res = await deletePropertyCertificateRecordAction(locale, propertyId, {
                                    ...params,
                                    societyDetailId: effectiveSocietyDetailId,
                                });
                                if (res.success) {
                                    toast.success(res.message || t("building.deleteSuccess") || "Certificate deleted successfully!");
                                } else {
                                    toast.error(res.error || res.message || "Failed to delete certificate.");
                                }
                                return res;
                            } finally {
                                setIsSectionSaving(false);
                            }
                        }}
                        onSave={async (payload) => {
                            setIsSectionSaving(true);
                            try {
                                handleToggleEnabled(payload.certificateTypeId, true);
                                if (payload.certificateDate) {
                                    handleInputChange(payload.certificateTypeId, "date", payload.certificateDate);
                                }
                                if (payload.certificateNumber) {
                                    handleInputChange(payload.certificateTypeId, "number", payload.certificateNumber);
                                }
                                if (payload.attachedFiles && payload.attachedFiles.length > 0) {
                                    handleFileUpload(payload.certificateTypeId, payload.attachedFiles[0]);
                                }

                                const urlSocietyDetailId = searchParams.get('societyDetailId') || searchParams.get('societyId');
                                const urlWingDetailId = searchParams.get('wingDetailId') || searchParams.get('wingId');
                                const floorWingDetailId = initialFloors.length > 0 ? (initialFloors[0] as unknown as { wingDetailId?: number; societyWingId?: number }).wingDetailId || (initialFloors[0] as unknown as { societyWingId?: number }).societyWingId : null;

                                const wingSocId = (initialWings.find((w) => (w as unknown as { societyDetailId?: number; societyId?: number }).societyDetailId || (w as unknown as { societyDetailId?: number; societyId?: number }).societyId) as unknown as { societyDetailId?: number; societyId?: number } | undefined);
                                const fallbackSocDetailId = wingSocId?.societyDetailId || wingSocId?.societyId || null;

                                const effectiveSocietyDetailId = isSociety
                                    ? (societyDetailId ?? (urlSocietyDetailId ? Number(urlSocietyDetailId) : (fallbackSocDetailId ? Number(fallbackSocDetailId) : null)))
                                    : null;
                                const parsedPropId = Number(propertyId);
                                const finalUnitIds = (payload.selectedUnitIds && payload.selectedUnitIds.length > 0)
                                    ? payload.selectedUnitIds
                                    : (!isNaN(parsedPropId) && parsedPropId > 0 ? [parsedPropId] : []);

                                const firstWingOptionId = initialWings.length > 0 ? initialWings[0].wingDetailId : (wingOptions.length > 0 ? wingOptions[0].wingDetailId : null);
                                let effectiveWingDetailId: number | null = null;
                                if (isSociety && effectiveSocietyDetailId && effectiveSocietyDetailId > 0) {
                                    effectiveWingDetailId = payload.selectedWingDetailId ?? (wingDetailId ?? (urlWingDetailId ? Number(urlWingDetailId) : (floorWingDetailId ?? firstWingOptionId)));
                                    if (payload.level === 'Unit' && finalUnitIds.length > 0) {
                                        const matchedFloor = initialFloors.find((f) => {
                                            const pId = f.id ?? (f as unknown as { propertyDetailsId?: number }).propertyDetailsId ?? (f as unknown as { propertyId?: number }).propertyId;
                                            return pId === finalUnitIds[0];
                                        });
                                        const matchedWingId = (matchedFloor as unknown as { wingDetailId?: number; societyWingId?: number })?.wingDetailId || (matchedFloor as unknown as { societyWingId?: number })?.societyWingId;
                                        if (matchedWingId) {
                                            effectiveWingDetailId = Number(matchedWingId);
                                        }
                                    }
                                }

                                const hasNewFile = Boolean(payload.attachedFiles && payload.attachedFiles.length > 0);
                                const isFileModified = payload.isFileModified ?? hasNewFile;

                                if (effectiveSocietyDetailId && effectiveSocietyDetailId > 0) {
                                    // Society / Wing / Unit level save with background tax recalculation
                                    const payloadObj: Record<string, unknown> = {
                                        level: payload.level,
                                        selectedWingDetailId: effectiveWingDetailId,
                                        selectedUnitIds: finalUnitIds,
                                        isAllUnitsSelected: (payload as unknown as { isAllUnitsSelected?: boolean }).isAllUnitsSelected,
                                        certificateTypeId: payload.certificateTypeId,
                                        certificateDate: payload.certificateDate,
                                        certificateNumber: payload.certificateNumber,
                                        status: payload.status,
                                        societyDetailId: effectiveSocietyDetailId,
                                        isFileModified,
                                        hasNewDocument: hasNewFile,
                                        preserveExistingDocument: !isFileModified && Boolean(payload.hasExistingDocument || payload.documentGuid),
                                    };

                                    if (payload.documentGuid) {
                                        payloadObj.documentGuid = payload.documentGuid;
                                        payloadObj.existingDocumentGuid = payload.documentGuid;
                                    }
                                    if (hasNewFile && payload.attachedFiles[0]) {
                                        payloadObj.fileName = payload.attachedFiles[0].name;
                                    } else if (payload.fileName) {
                                        payloadObj.fileName = payload.fileName;
                                    }
                                    if (payload.propertyCertificateId) {
                                        payloadObj.propertyCertificateId = payload.propertyCertificateId;
                                    }

                                    const formData = new FormData();
                                    formData.append("payload", JSON.stringify(payloadObj));
                                    if (hasNewFile && payload.attachedFiles[0]) {
                                        formData.append("file", payload.attachedFiles[0]);
                                    }

                                    const res = await postApartmentQcCertificateRecordAction(locale, propertyId, formData);

                                    if (res && res.success) {
                                        toast.success(res.message || t("building.saveSuccess") || "Certificate saved successfully! Tax recalculation is running in the background.");
                                        router.refresh();
                                        return res;
                                    } else if (res && !res.success) {
                                        toast.error(res.error || res.message || "Failed to save certificate record.");
                                        return res;
                                    }
                                    return res;
                                } else {
                                    // Standalone property-wide certificate save
                                    const certNo = payload.certificateNumber?.trim() 
                                        || buildingPermission[payload.certificateTypeId]?.number 
                                        || undefined;
                                    const certDate = payload.certificateDate 
                                        || buildingPermission[payload.certificateTypeId]?.date 
                                        || undefined;

                                    await handleSave({ 
                                        skipPropertyWideConfirmation: true,
                                        onlyCertificateTypeId: payload.certificateTypeId,
                                        overrideData: {
                                            date: certDate,
                                            number: certNo,
                                            pendingFile: hasNewFile ? payload.attachedFiles[0] : undefined,
                                            propertyDetailsId: null,
                                            entityType: "P",
                                            societyDetailId: null,
                                            wingDetailId: null,
                                            documentGuid: payload.documentGuid,
                                            existingDocumentGuid: payload.documentGuid,
                                            propertyCertificateId: payload.propertyCertificateId,
                                            isFileModified,
                                        }
                                    });
                                }
                            } finally {
                                setIsSectionSaving(false);
                            }
                        }}
                    />
                ) : (
                    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden p-3 gap-3">
                        <h2 className="text-base font-bold text-blue-900 border-b border-slate-100 pb-2">
                            {t("building.title") || "Building Permissions & Documents"}
                        </h2>
                        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
                            {/* Left Sidebar */}
                            <div className="lg:col-span-4 xl:col-span-3 h-full min-h-0 overflow-y-auto">
                                <BuildingSidebar
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    showActiveFirst={showActiveFirst}
                                    onShowActiveChange={setShowActiveFirst}
                                    certificates={filteredCertificates}
                                    selectedTypeId={selectedTypeId}
                                    onSelect={setSelectedTypeId}
                                    onToggleEnabled={handleToggleWithConfirm}
                                    validationErrors={validationErrors}
                                    t={t}
                                />
                            </div>

                            {/* Right Detail Pane */}
                            <div className="lg:col-span-8 xl:col-span-9 h-full min-h-0 overflow-y-auto">
                                <BuildingDetailPane
                                    data={selectedCert}
                                    propertyWideCert={propertyWideCert}
                                    onInputChange={(field, val) => activeSelectedTypeId !== null && handleInputChange(activeSelectedTypeId, field, val)}
                                    onFileUpload={(file) => activeSelectedTypeId !== null && handleFileUpload(activeSelectedTypeId, file)}
                                    onFileDelete={(typeId) => handleFileDelete(typeId)}
                                    onToggleEnabled={(checked) => activeSelectedTypeId !== null && handleToggleWithConfirm(activeSelectedTypeId, checked)}
                                    onCopyFromProperty={() => activeSelectedTypeId !== null && handleCopyFromPropertyCert(activeSelectedTypeId)}
                                    validationError={activeSelectedTypeId !== null ? validationErrors[activeSelectedTypeId] : undefined}
                                    fieldErrors={activeSelectedTypeId !== null ? fieldErrors[activeSelectedTypeId] : undefined}
                                    t={t}
                                    floorData={floorData}
                                    constructionTypeData={constructionTypeData}
                                    useData={useData}
                                    subFloorData={subFloorData}
                                    subTypeData={subTypeData}
                                    initialFloors={initialFloors}
                                    activeScope={activeScope}
                                    activeFloorId={activeFloorId}
                                    onScopeChange={(scope, floorId) => selectFloorOrPropertyScope(scope, floorId)}
                                    floors={floors}
                                    isFloorLoading={isFloorLoading}
                                    isSaving={isSaving}
                                    hasChanges={hasChanges}
                                    onDeleteCertificate={async () => {
                                        if (activeSelectedTypeId !== null) {
                                            return await handleDeleteCertificate(activeSelectedTypeId);
                                        }
                                    }}
                                    onSave={async () => {
                                        const urlSocietyDetailId = searchParams.get('societyDetailId') || searchParams.get('societyId');
                                        const urlWingDetailId = searchParams.get('wingDetailId') || searchParams.get('wingId');
                                        const effectiveSocietyDetailId = societyDetailId ?? (urlSocietyDetailId ? Number(urlSocietyDetailId) : null);
                                        const effectiveWingDetailId = urlWingDetailId ? Number(urlWingDetailId) : null;
                                        return await handleSave({
                                            overrideData: {
                                                societyDetailId: effectiveSocietyDetailId,
                                                wingDetailId: effectiveWingDetailId,
                                            }
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Tabs.TabPanel>
        </Tabs>
    );
};

export default BuildingForm;