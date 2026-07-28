"use client"

import { Tabs, SaveButton, useConfirm } from "@/components/common";
import { BuildingFormProps, FloorCertificateDto } from "@/types/building-permission.types";
import { useBuildingForm } from "@/hooks/useBuildingForm";
import { BuildingSidebar } from "./BuildingSidebar";
import { BuildingDetailPane } from "./BuildingDetailPane";
import { ValidationErrorBanner } from "./ValidationErrorBanner";
import { mapTypeNameToKey } from "@/lib/utils/building-helpers";

import { SaveDetailsConfirmModal } from "./SaveDetailsConfirmModal";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AlertCircle } from "lucide-react";


const BuildingForm: React.FC<BuildingFormProps> = ({
    initialBuildingPermission,
    initialFloorCertificates,
    propertyId,
    floorData = [],
    constructionTypeData = [],
    useData = [],
    subFloorData = [],
    subTypeData = [],
    initialFloors = [],
}) => {
    const filteredInitialFloors = useMemo(() => {
        return (initialFloors || []).filter(floor => {
            const floorVal = String(floor.floor ?? "").trim().toLowerCase();
            const floorDescVal = String(floor.floorDescription ?? "").trim().toLowerCase();
            const floorIdVal = String(floor.floorId ?? floor.floorID ?? "").trim().toLowerCase();
            const floorCodeVal = String(floor.floorCode ?? "").trim().toLowerCase();

            const isOpenPlot = 
                floorVal === "open plot" || 
                floorVal === "op" || 
                floorDescVal === "open plot" || 
                floorDescVal === "op" || 
                floorIdVal === "op" || 
                floorCodeVal === "op";
            return !isOpenPlot;
        });
    }, [initialFloors]);

    const filteredInitialFloorCertificates = useMemo(() => {
        if (!initialFloorCertificates) return null;
        
        const isFloorOpenPlot = (f: FloorCertificateDto) => {
            const floorDesc = String(f.floorDescription ?? "").trim().toLowerCase();
            return floorDesc === "open plot" || floorDesc === "op";
        };

        const filteredOtherFloors = (initialFloorCertificates.otherFloors || []).filter(
            f => !isFloorOpenPlot(f)
        );

        let filteredSelectedFloor = initialFloorCertificates.selectedFloor;
        if (filteredSelectedFloor && isFloorOpenPlot(filteredSelectedFloor)) {
            filteredSelectedFloor = null;
        }

        return {
            ...initialFloorCertificates,
            selectedFloor: filteredSelectedFloor,
            otherFloors: filteredOtherFloors
        };
    }, [initialFloorCertificates]);

    const {
        buildingPermission,
        hasChanges,
        isSaving,
        validationErrors,
        fieldErrors,
        incompleteCertificates,
        handleFileUpload,
        handleFileDelete,
        handleToggleEnabled,
        handleInputChange,
        handleDeleteCertificate,
        handleSave,
        t,
        floors,
        selectedTypeId,
        setSelectedTypeId,
        activeScope,
        activeFloorId,
        selectFloorOrPropertyScope,
        isFloorLoading,
        propertyCertificatesState,
        incompleteFloors
    } = useBuildingForm(initialBuildingPermission, filteredInitialFloorCertificates, propertyId);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [cameFromFloor] = useState(() => {
        return searchParams.get('activeScope') === 'Floor' || !!searchParams.get('activeFloorId') || !!searchParams.get('selectedPropertyDetailsId') || !!searchParams.get('floorId');
    });

    const hasInitializedRef = React.useRef(false);

    // Sync scope and floor ID from URL parameters once on mount
    useEffect(() => {
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;
        const urlScope = searchParams.get('activeScope');
        const urlFloorId = searchParams.get('activeFloorId') || searchParams.get('selectedPropertyDetailsId') || searchParams.get('floorId');
        if (urlFloorId || urlScope === 'Floor') {
            const parsedFloorId = urlFloorId ? Number(urlFloorId) : null;
            if (parsedFloorId !== null && !isNaN(parsedFloorId)) {
                selectFloorOrPropertyScope('Floor', parsedFloorId);
            }
        }
    }, [searchParams, selectFloorOrPropertyScope]);

    // Keep URL parameters in sync with active local state changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlScope = params.get('activeScope');
        const urlFloorId = params.get('activeFloorId') || params.get('selectedPropertyDetailsId') || params.get('floorId');

        const currentUrlFloorId = urlFloorId ? Number(urlFloorId) : null;
        const currentUrlScope = urlScope || 'Property';

        if (activeScope !== currentUrlScope || activeFloorId !== currentUrlFloorId) {
            if (activeScope === 'Floor' && activeFloorId !== null) {
                params.set('activeScope', 'Floor');
                params.set('activeFloorId', String(activeFloorId));
            } else {
                params.delete('activeScope');
                params.delete('activeFloorId');
                params.delete('selectedPropertyDetailsId');
                params.delete('floorId');
            }
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [activeScope, activeFloorId, pathname, router]);


    const [isUnsavedWarningOpen, setIsUnsavedWarningOpen] = useState(false);
    const [unsavedWarningCallback, setUnsavedWarningCallback] = useState<(() => void) | null>(null);

    useEffect(() => {
        const win = typeof window !== 'undefined' ? (window as unknown as {
            __showBuildingUnsavedChangesModal?: ((onDiscard: () => void) => void) | null;
        }) : null;
        if (win) {
            win.__showBuildingUnsavedChangesModal = (onDiscard: () => void) => {
                setUnsavedWarningCallback(() => onDiscard);
                setIsUnsavedWarningOpen(true);
            };
        }
        return () => {
            if (win) {
                win.__showBuildingUnsavedChangesModal = null;
            }
        };
    }, []);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmData, setConfirmData] = useState<{
        certificateName: string;
        certificateNumber: string;
        certificateDate: string;
        targetFloors: FloorCertificateDto[];
        isPropertyWideGlobal: boolean;
        onConfirm: (selectedFloorIds?: number[]) => void;
    } | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [showActiveFirst, setShowActiveFirst] = useState(false);
    const [customSelectedTypeId, setCustomSelectedTypeId] = useState<number | null>(null);

    const sortedCertificates = useMemo(() => {
        return Object.values(buildingPermission).sort(
            (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
        );
    }, [buildingPermission]);

    const filteredCertificates = useMemo(() => {
        const searched = sortedCertificates.filter((cert) => {
            return cert.certificateTypeName
                ? cert.certificateTypeName.toLowerCase().includes(searchTerm.toLowerCase())
                : true;
        });

        if (showActiveFirst) {
            return [...searched].sort((a, b) => {
                if (a.enabled && !b.enabled) return -1;
                if (!a.enabled && b.enabled) return 1;
                return (a.displayOrder || 0) - (b.displayOrder || 0);
            });
        }

        return searched;
    }, [sortedCertificates, searchTerm, showActiveFirst]);

    const activeSelectedTypeId = useMemo(() => {
        const targetId = customSelectedTypeId !== null ? customSelectedTypeId : selectedTypeId;
        if (targetId !== null) {
            const exists = filteredCertificates.some(c => c.certificateTypeId === targetId);
            if (exists) return targetId;
        }
        return filteredCertificates.length > 0 ? filteredCertificates[0].certificateTypeId : null;
    }, [filteredCertificates, selectedTypeId, customSelectedTypeId]);

    React.useEffect(() => {
        setSelectedTypeId(activeSelectedTypeId);
    }, [activeSelectedTypeId, setSelectedTypeId]);

    const selectedCert = activeSelectedTypeId !== null ? buildingPermission[activeSelectedTypeId] : null;
    const propertyWideCert = activeSelectedTypeId !== null ? propertyCertificatesState[activeSelectedTypeId] : null;

    const { confirm } = useConfirm();

    const handleToggleEnabledWithConfirm = useCallback((typeId: number, checked: boolean) => {
        setCustomSelectedTypeId(typeId);
        const cert = buildingPermission[typeId];

        if (!checked && cert && cert.enabled) {
            const hasNum = !!(cert.number && cert.number.trim() !== "");
            const hasDt = !!(cert.date && cert.date.trim() !== "");
            const hasDoc = !!(cert.documentGuid || cert.fileName || cert.pendingFile);
            const hasBackendId = typeof cert.propertyCertificateId === 'number' && cert.propertyCertificateId > 0;

            const hasDetails = hasNum || hasDt || hasDoc || hasBackendId;

            if (hasDetails) {
                const certKey = mapTypeNameToKey(cert.certificateTypeName || "");
                const displayName = certKey && t(`building.${certKey}`) && t(`building.${certKey}`) !== `building.${certKey}`
                    ? t(`building.${certKey}`)
                    : cert.certificateTypeName;

                const detailsList: string[] = [];
                if (hasNum) detailsList.push(`${t("building.number") || "Number"}: ${cert.number}`);
                if (hasDt) detailsList.push(`${t("building.date") || "Date"}: ${cert.date}`);

                confirm({
                    title: t("building.confirmDeleteCertificateTitle") || "Delete Certificate & Data",
                    description: (
                        <span className="flex flex-col gap-1 items-center text-center -my-1">
                            <span className="text-xs text-gray-700 font-medium leading-snug">
                                {t("building.confirmToggleOffWarning") || "You have an attached certificate with details:"}
                            </span>
                            <span className="bg-blue-50 border border-blue-200 rounded-xl py-1.5 px-3 text-center my-0.5 shadow-2xs w-full max-w-[340px] flex flex-col gap-0.5 items-center">
                                <span className="font-bold text-blue-950 block text-xs leading-tight">
                                    {displayName}
                                </span>
                                {detailsList.map((detail, idx) => (
                                    <span key={idx} className="text-xs text-blue-800 font-semibold block leading-tight">
                                        {detail}
                                    </span>
                                ))}
                            </span>
                            <span className="text-xs text-gray-700 font-medium leading-snug">
                                {t("building.confirmToggleOffDesc") || "Disabling this will delete the certificate data and attachment. Do you want to delete this certificate?"}
                            </span>
                        </span>
                    ) as unknown as string,
                    confirmText: t("building.confirmDeleteCertificateOk") || "Yes, Delete",
                    cancelText: t("building.confirmDeleteCertificateCancel") || "No, Cancel",
                    variant: "delete",
                    onConfirm: async () => {
                        await handleDeleteCertificate(typeId);
                    }
                });
                return;
            }
        }

        handleToggleEnabled(typeId, checked);
    }, [buildingPermission, confirm, handleDeleteCertificate, handleToggleEnabled, t]);

    const handleErrorTagClick = useCallback((certificateTypeId: number) => {
        if (showActiveFirst) {
            setShowActiveFirst(false);
        }
        setSearchTerm("");
        setCustomSelectedTypeId(certificateTypeId);

        requestAnimationFrame(() => {
            const card = document.querySelector(`[data-certificate-id="${certificateTypeId}"]`);
            if (card && typeof card.scrollIntoView === "function") {
                card.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }, [showActiveFirst]);

    const handleSaveClick = useCallback(async () => {
        if (activeSelectedTypeId === null) return;
        const activeCert = buildingPermission[activeSelectedTypeId];
        if (!activeCert) return;

        // 1. Dry run validation first
        const validationResult = await handleSave({ dryRun: true });
        if (validationResult && !validationResult.isValid) {
            if (validationResult.incompleteCertificates) {
                const activeIncomplete = (validationResult.incompleteCertificates || []).filter(
                    (c) => buildingPermission[c.id]?.enabled
                );
                if (activeIncomplete.length > 0) {
                    const firstInvalidId = activeIncomplete[0].id;
                    setCustomSelectedTypeId(firstInvalidId);
                    requestAnimationFrame(() => {
                        const card = document.querySelector(`[data-certificate-id="${firstInvalidId}"]`);
                        if (card && typeof card.scrollIntoView === "function") {
                            card.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                    });
                }
            }
            return;
        }

        // 2. Prepare floor lists
        let targetFloors: FloorCertificateDto[] = [];
        let isPropertyWideGlobal = false;
        let applyToRemaining = false;

        if (activeScope === "Floor") {
            const selectedFloor = floors.find(f => f.propertyDetailsId === activeFloorId);
            targetFloors = selectedFloor ? [selectedFloor] : [];
        } else {
            const certKey = mapTypeNameToKey(activeCert.certificateTypeName || "");
            const remainingFloors = (floors || []).filter(f => {
                if (certKey === "commencementCertificate") return !f.ccDate && !f.ccCertificateNo;
                if (certKey === "occupancyCertificate") return !f.ocDate && !f.ocCertificateNo;
                if (certKey === "electricBill") return !f.electricBillDate && !f.electricBillNo;
                return false;
            });

            if (remainingFloors.length > 0) {
                targetFloors = remainingFloors;
                applyToRemaining = true;
            } else {
                isPropertyWideGlobal = true;
            }
        }

        const proceedSave = async (selectedFloorIds?: number[]) => {
            const result = await handleSave({
                skipPropertyWideConfirmation: true,
                applyToRemaining,
                selectedFloorIds
            });
            return result;
        };

        const certKey = mapTypeNameToKey(activeCert.certificateTypeName || "");
        const displayName = certKey && t(`building.${certKey}`) && t(`building.${certKey}`) !== `building.${certKey}`
            ? t(`building.${certKey}`)
            : activeCert.certificateTypeName;

        const onConfirmAction = async (selectedFloorIds?: number[]) => {
            setIsConfirmOpen(false);
            await proceedSave(selectedFloorIds);
        };

        setConfirmData({
            certificateName: displayName || "",
            certificateNumber: activeCert.number || "",
            certificateDate: activeCert.date || "",
            targetFloors,
            isPropertyWideGlobal,
            onConfirm: onConfirmAction
        });
        setIsConfirmOpen(true);
    }, [activeScope, activeFloorId, activeSelectedTypeId, buildingPermission, floors, handleSave, t]);



    return (
        <Tabs defaultValue="building" className="flex-1 flex flex-col min-h-0 h-full lg:h-[calc(100vh-125px)] max-h-[calc(100vh-125px)] overflow-hidden">
            <Tabs.TabPanel value="building" className="mt-0 p-0 flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                <div className="bg-white rounded-xl border border-blue-100 flex flex-col flex-1 min-h-0 h-full overflow-hidden relative">
                    {/* Header Area */}
                    <div className="p-2.5 md:p-3 pb-0 flex-shrink-0 space-y-2">
                        <h3 className="text-base font-bold text-blue-800 pb-1.5 border-b border-blue-200">
                            {t("building.title")}
                        </h3>

                        {incompleteCertificates.filter(c => buildingPermission[c.id]?.enabled).length > 0 && (
                            <div className="flex-shrink-0">
                                <ValidationErrorBanner
                                    incompleteCertificates={incompleteCertificates.filter(c => buildingPermission[c.id]?.enabled)}
                                    onTagClick={handleErrorTagClick}
                                    t={t}
                                />
                            </div>
                        )}
                    </div>

                    {/* Down section: Certificates list & Upload pane */}
                    <div className="flex-1 min-h-0 p-2.5 md:p-3 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
                        <div className="lg:col-span-4 xl:col-span-3 h-full min-h-0 overflow-hidden">
                            <BuildingSidebar
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                showActiveFirst={showActiveFirst}
                                onShowActiveChange={setShowActiveFirst}
                                certificates={filteredCertificates}
                                selectedTypeId={activeSelectedTypeId}
                                onSelect={setCustomSelectedTypeId}
                                onToggleEnabled={(typeId, checked) => {
                                    handleToggleEnabledWithConfirm(typeId, checked);
                                }}
                                validationErrors={validationErrors}
                                t={t}
                            />
                        </div>

                        <div className="lg:col-span-8 xl:col-span-9 h-full min-h-0 overflow-y-auto pr-1">
                            <div className="flex flex-col gap-3 min-h-full">
                                {selectedCert && (
                                    (() => {
                                        const isDisabled = !selectedCert.enabled;
                                        const hasAnyData = !!(selectedCert.number?.trim() || selectedCert.date?.trim() || selectedCert.documentGuid?.trim());
                                        
                                        if (activeScope === "Floor" && isDisabled) {
                                            return (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                                                    <AlertCircle size={16} className="text-blue-600 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-blue-800">
                                                        {t("building.usingPropertyWideNote") || "Showing property-wide certificate. Toggle it active on the sidebar to override for this floor."}
                                                    </span>
                                                </div>
                                            );
                                        } else if (isDisabled && hasAnyData) {
                                            return (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                                                    <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-amber-800">
                                                        {t("building.disabledWithDataNote") || "This document is currently disabled. Toggle it active to edit details."}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()
                                )}

                                <div className="flex-1">
                                    <BuildingDetailPane
                                        data={selectedCert}
                                        propertyWideCert={propertyWideCert}
                                        onInputChange={(field, value) => {
                                            if (activeSelectedTypeId !== null) {
                                                handleInputChange(activeSelectedTypeId, field, value);
                                            }
                                        }}
                                        onFileUpload={(file) => {
                                            if (activeSelectedTypeId !== null) {
                                                handleFileUpload(activeSelectedTypeId, file);
                                            }
                                        }}
                                        onFileDelete={(id) => {
                                            handleFileDelete(id);
                                        }}
                                        onDeleteCertificate={() => {
                                            if (activeSelectedTypeId !== null) {
                                                handleDeleteCertificate(activeSelectedTypeId);
                                            }
                                        }}
                                        validationError={activeSelectedTypeId !== null ? validationErrors[activeSelectedTypeId] : undefined}
                                        fieldErrors={activeSelectedTypeId !== null ? fieldErrors[activeSelectedTypeId] : undefined}
                                        t={t}
                                        floorData={floorData}
                                        constructionTypeData={constructionTypeData}
                                        useData={useData}
                                        subFloorData={subFloorData}
                                        subTypeData={subTypeData}
                                        initialFloors={filteredInitialFloors}
                                        activeScope={activeScope}
                                        activeFloorId={activeFloorId}
                                        onScopeChange={selectFloorOrPropertyScope}
                                        floors={floors}
                                        isFloorLoading={isFloorLoading}
                                        cameFromFloor={cameFromFloor}
                                        isSaving={isSaving}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save changes button fixed in the bottom corner */}
                <div className="flex justify-end p-2.5 md:p-3 bg-slate-50 border-t border-blue-100 flex-shrink-0 z-20">
                    <SaveButton
                        onClick={handleSaveClick}
                        disabled={!hasChanges || isSaving}
                        isLoading={isSaving}
                        label={t("common.saveChanges") || "Save Changes"}
                    />
                </div>
            </Tabs.TabPanel>

            {isConfirmOpen && confirmData && (
                <SaveDetailsConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmData.onConfirm}
                    certificateName={confirmData.certificateName}
                    certificateNumber={confirmData.certificateNumber}
                    certificateDate={confirmData.certificateDate}
                    targetFloors={confirmData.targetFloors}
                    isPropertyWideGlobal={confirmData.isPropertyWideGlobal}
                    t={t}
                />
            )}

            {isUnsavedWarningOpen && (
                <SaveDetailsConfirmModal
                    isOpen={isUnsavedWarningOpen}
                    onClose={() => setIsUnsavedWarningOpen(false)}
                    onConfirm={() => {
                        setIsUnsavedWarningOpen(false);
                        if (unsavedWarningCallback) {
                            unsavedWarningCallback();
                        }
                    }}
                    isUnsavedWarning={true}
                    incompleteFloors={incompleteFloors}
                    t={t}
                />
            )}
        </Tabs>
    );
};

export default BuildingForm;