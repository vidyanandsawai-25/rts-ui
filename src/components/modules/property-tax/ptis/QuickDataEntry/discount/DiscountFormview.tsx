"use client"
import React from "react";
import { Tabs, SaveButton } from "@/components/common";
import { useTranslations } from "next-intl";
import { useDiscountForm } from "@/hooks/useDiscountForm";
import { DiscountCard } from "./DiscountCard";
import { DiscountApiResponse, DiscountKey } from "@/types/discount.types";

interface DiscountFormProps {
    initialDiscountData: DiscountApiResponse | null;
    propertyId: string;
}

const DiscountFormview: React.FC<DiscountFormProps> = ({
    initialDiscountData,
    propertyId
}) => {
    const t = useTranslations('quickDataEntry');
    const {
        discountData,
        isSaving,
        hasChanges,
        handleToggleChange,
        handleFileUpload,
        handleSave
    } = useDiscountForm(initialDiscountData, propertyId);

    const discountItems: { key: DiscountKey; label: string }[] = [
        { key: "solarPanel", label: t("discount.solarPanel") },
        { key: "solarHeater", label: t("discount.solarHeater") },
        { key: "rainwaterHarvesting", label: t("discount.rainwaterHarvesting") },
        { key: "wasteSegregation", label: t("discount.wasteSegregation") },
        { key: "wasteDisposal", label: t("discount.wasteDisposal") },
        { key: "greenCertified", label: t("discount.greenCertified") },
        { key: "fireFighting", label: t("discount.fireFighting") },
        { key: "evCharging", label: t("discount.evCharging") },
        { key: "womanOwner", label: t("discount.womanOwner") },
        { key: "exServicemanOwner", label: t("discount.exServicemanOwner") }
    ];

    return (
        <Tabs defaultValue="discount">
            <Tabs.TabPanel value="discount" className="mt-0 p-4">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-black">
                        {t("discount.title")}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                        {t("discount.description")}
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {discountItems.map((item) => (
                            <DiscountCard
                                key={item.key}
                                label={item.label}
                                data={discountData[item.key]}
                                onToggle={(checked) => handleToggleChange(item.key, checked)}
                                onFileUpload={(file) => handleFileUpload(item.key, file)}
                            />
                        ))}
                    </div>

                    {/* Save Button Section */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-pink-500">
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
    );
};

export default DiscountFormview;