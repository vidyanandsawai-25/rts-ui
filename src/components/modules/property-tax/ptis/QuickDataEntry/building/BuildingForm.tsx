"use client"

import { Tabs, SaveButton } from "@/components/common";
import { BuildingFormProps, BuildingKey } from "@/types/building-permission.types";
import { useBuildingForm } from "@/hooks/useBuildingForm";
import { BuildingCertificateItem } from "./BuildingCertificateItem";

import React from "react";

const BuildingForm: React.FC<BuildingFormProps> = ({
    initialBuildingPermission,
    propertyId,
}) => {
    const {
        buildingPermission,
        hasChanges,
        isSaving,
        handleFileUpload,
        handleToggleEnabled,
        handleInputChange,
        handleSave,
        t
    } = useBuildingForm(initialBuildingPermission, propertyId);

    const certificateItems: { key: BuildingKey; label: string }[] = [
        { key: "buildingPermit", label: t("building.buildingPermit") || "Building Permit" },
        { key: "commencementCertificate", label: t("building.commencementCertificate") },
        { key: "occupancyCertificate", label: t("building.occupancyCertificate") },
        { key: "possessionCertificate", label: t("building.possessionCertificate") },
        { key: "index2", label: t("building.index2") },
        { key: "electricBill", label: t("building.electricBill") },
        { key: "buildCompletionCertificate", label: t("building.buildCompletionCertificate") || "Build Completion Certificate" },
    ];

    return (
        <>
            <Tabs defaultValue="building">
                <Tabs.TabPanel value="building" className="mt-0 p-4">
                    <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-4">
                        <h3 className="text-sm font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">
                            {t("building.title")}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {certificateItems.map((item) => (
                                <BuildingCertificateItem
                                    key={item.key}
                                    label={item.label}
                                    data={buildingPermission[item.key]}
                                    onToggle={(checked) => handleToggleEnabled(item.key, checked)}
                                    onInputChange={(field, value) => handleInputChange(item.key, field, value)}
                                    onFileUpload={(file) => handleFileUpload(item.key, file)}
                                    t={t}
                                />
                            ))}
                        </div>

                        {/* Save Button Section */}
                        <div className="flex justify-end mt-6 pt-4 border-t border-blue-100">
                            <SaveButton
                                onClick={handleSave}
                                disabled={!hasChanges}
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