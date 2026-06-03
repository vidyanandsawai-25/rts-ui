"use client";

import React from "react";
import { Tabs, SaveButton } from "@/components/common";
import { useTranslations } from "next-intl";
import { useDiscountForm } from "@/hooks/useDiscountForm";
import { DiscountCard } from "./DiscountCard";
import { SocialDetailsForm } from "./SocialDetailsForm";
import { DiscountApiResponse, DiscountKey } from "@/types/discount.types";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";

interface DiscountFormProps {
    initialDiscountData: DiscountApiResponse | null;
    initialSocialData: PropertySocialInfoResponseDto | null;
    propertyId: string;
}

const DiscountFormview: React.FC<DiscountFormProps> = ({
    initialDiscountData,
    initialSocialData,
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
        <Tabs defaultValue="social" variant="pills" size="sm" className="w-full p-4">
            <Tabs.TabList className="mb-4 bg-slate-100 p-1.5 rounded-xl max-w-md border border-slate-200">
                <Tabs.Tab value="social" className="w-1/2 justify-center py-2 text-xs font-bold cursor-pointer">
                    {t("discount.socialTitle")}
                </Tabs.Tab>
                <Tabs.Tab value="discount" className="w-1/2 justify-center py-2 text-xs font-bold cursor-pointer">
                    {t("discount.title")}
                </Tabs.Tab>
            </Tabs.TabList>

            {/* Social Information Tab */}
            <Tabs.TabPanel value="social" className="mt-0">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                    <h3 className="text-sm font-bold text-black mb-1">
                        {t("discount.socialTitle")}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                        {t("discount.socialDescription")}
                    </p>
                    <SocialDetailsForm
                        key={initialSocialData ? JSON.stringify(initialSocialData) : "empty"}
                        initialSocialData={initialSocialData}
                        propertyId={propertyId}
                    />
                </div>
            </Tabs.TabPanel>

            {/* Discount Information Tab */}
            <Tabs.TabPanel value="discount" className="mt-0">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                    <h3 className="text-sm font-bold text-black mb-1">
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
                    <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
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