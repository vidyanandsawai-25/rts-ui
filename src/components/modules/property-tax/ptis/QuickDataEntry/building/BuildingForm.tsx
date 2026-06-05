"use client"

import { Tabs, SaveButton } from "@/components/common";
import { BuildingFormProps } from "@/types/building-permission.types";
import { useBuildingForm } from "@/hooks/useBuildingForm";
import { BuildingSidebar } from "./BuildingSidebar";
import { BuildingDetailPane } from "./BuildingDetailPane";
import { ValidationErrorBanner } from "./ValidationErrorBanner";

import React, { useMemo, useState, useCallback } from "react";

const BuildingForm: React.FC<BuildingFormProps> = ({
    initialBuildingPermission,
    propertyId,
}) => {
    const {
        buildingPermission,
        hasChanges,
        isSaving,
        validationErrors,
        incompleteCertificates,
        handleFileUpload,
        handleToggleEnabled,
        handleInputChange,
        handleSave,
        t
    } = useBuildingForm(initialBuildingPermission, propertyId);

    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showActiveFirst, setShowActiveFirst] = useState(false);

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

    // Derive selectedTypeId based on filtered list updates to avoid useEffect setState cascading renders
    const activeSelectedTypeId = useMemo(() => {
        if (selectedTypeId !== null) {
            const exists = filteredCertificates.some(c => c.certificateTypeId === selectedTypeId);
            if (exists) return selectedTypeId;
        }
        return filteredCertificates.length > 0 ? filteredCertificates[0].certificateTypeId : null;
    }, [filteredCertificates, selectedTypeId]);

    const selectedCert = activeSelectedTypeId !== null ? buildingPermission[activeSelectedTypeId] : null;

    /** When user clicks a tag in the error banner, scroll to and select that certificate */
    const handleErrorTagClick = useCallback((certificateTypeId: number) => {
        // Clear any active filter that might hide the certificate
        if (showActiveFirst) {
            setShowActiveFirst(false);
        }
        setSearchTerm("");

        // Select the certificate
        setSelectedTypeId(certificateTypeId);

        // Scroll the sidebar card into view with a slight delay for filter reset
        requestAnimationFrame(() => {
            const card = document.querySelector(`[data-certificate-id="${certificateTypeId}"]`);
            if (card && typeof card.scrollIntoView === "function") {
                card.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }, [showActiveFirst]);

    const handleSaveClick = useCallback(async () => {
        const result = await handleSave();
        if (result && !result.isValid && result.incompleteCertificates) {
            const activeIncomplete = result.incompleteCertificates.filter(
                (c) => buildingPermission[c.id]?.enabled
            );
            if (activeIncomplete.length > 0) {
                const firstInvalidId = activeIncomplete[0].id;
                setSelectedTypeId(firstInvalidId);
                requestAnimationFrame(() => {
                    const card = document.querySelector(`[data-certificate-id="${firstInvalidId}"]`);
                    if (card && typeof card.scrollIntoView === "function") {
                        card.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                });
            }
        }
    }, [handleSave, buildingPermission]);

    return (
        <>
            <Tabs defaultValue="building">
                <Tabs.TabPanel value="building" className="mt-0 p-0">
                    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-2 md:p-3">
                        <h3 className="text-base font-bold text-blue-800 mb-3 pb-1.5 border-b border-blue-200">
                            {t("building.title")}
                        </h3>

                        {/* Validation Error Banner with clickable tags */}
                        {incompleteCertificates.filter(c => buildingPermission[c.id]?.enabled).length > 0 && (
                            <ValidationErrorBanner
                                incompleteCertificates={incompleteCertificates.filter(c => buildingPermission[c.id]?.enabled)}
                                onTagClick={handleErrorTagClick}
                                t={t}
                            />
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                            {/* Left Sidebar */}
                            <div className="lg:col-span-5 xl:col-span-4">
                                <BuildingSidebar
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    showActiveFirst={showActiveFirst}
                                    onShowActiveChange={setShowActiveFirst}
                                    certificates={filteredCertificates}
                                    selectedTypeId={activeSelectedTypeId}
                                    onSelect={setSelectedTypeId}
                                    onToggleEnabled={handleToggleEnabled}
                                    validationErrors={validationErrors}
                                    t={t}
                                />
                            </div>

                            {/* Right Detail Pane */}
                            <div className="lg:col-span-7 xl:col-span-8">
                                <BuildingDetailPane
                                    data={selectedCert}
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
                                    validationError={activeSelectedTypeId !== null ? validationErrors[activeSelectedTypeId] : undefined}
                                    t={t}
                                />
                            </div>
                        </div>

                        {/* Save Button Section */}
                        <div className="flex justify-end mt-3 pt-2 border-t border-blue-100">
                            <SaveButton
                                onClick={handleSaveClick}
                                disabled={!hasChanges || isSaving}
                                isLoading={isSaving}
                                label={t("common.saveChanges") || "Save Changes"}
                            />
                        </div>
                    </div>
                </Tabs.TabPanel>
            </Tabs>
        </>
    );
};

export default BuildingForm;