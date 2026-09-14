"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, Button } from "@/components/common";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Building2, Home, Store } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useDiscountForm } from "@/hooks/useDiscountForm";
import { DiscountPane } from "./DiscountPane";
import { SocialDetailsForm } from "./SocialDetailsForm";
import { PropertyDiscountInfoResponseDto } from "@/types/discount.types";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";
import { getFilteredDiscounts } from "@/lib/utils/discount-helpers";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { getLocalizedName } from "@/lib/utils/social-details";
import { SocialAttribute } from "@/types/social-attribute.types";
import { useDiscountLevelState } from "@/hooks/useDiscountLevelState";
import { UnitSelectionItem, WingOption } from "@/types/building-permission.types";
interface DiscountFormProps {
    initialDiscountData: PropertyDiscountInfoResponseDto | null;
    initialSocialData: PropertySocialInfoResponseDto | null;
    propertyId: string;
    isSociety?: boolean;
    discountMasterAttributes?: SocialAttribute[];
    socialMasterAttributes?: SocialAttribute[];
    wings?: WingOption[];
    units?: UnitSelectionItem[];
}

const DiscountFormview: React.FC<DiscountFormProps> = ({
    initialDiscountData,
    initialSocialData,
    propertyId,
    isSociety = false,
    discountMasterAttributes = [],
    socialMasterAttributes = [],
    wings = [],
    units = [],
}) => {
    const t = useTranslations('quickDataEntry');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { confirm } = useConfirm();

    const activeTab = searchParams.get("view") || "discount";

    const handleTabChange = useCallback((value: string | number) => {
        const win = typeof window !== 'undefined' ? (window as unknown as { __discountFormHasChanges?: boolean; __socialFormHasChanges?: boolean }) : {};
        const hasChanges = activeTab === "discount" ? !!win.__discountFormHasChanges : !!win.__socialFormHasChanges;

        if (hasChanges) {
            confirm({
                variant: 'warning',
                title: t('discount.unsavedChangesTitle') || 'Unsaved Changes',
                description: t('discount.unsavedChangesDesc') || 'You have unsaved changes in the Discount & Social Data tab. Do you want to discard them, or continue editing?',
                confirmText: t('discount.continueButton') || 'Continue Editing',
                cancelText: t('discount.discardConfirmButton') || 'Discard Changes',
                onConfirm: () => {
                    // Do nothing, stays on the current tab
                },
                onCancel: () => {
                    const localWin = typeof window !== 'undefined' ? (window as unknown as { __discountFormHasChanges?: boolean; __socialFormHasChanges?: boolean }) : null;
                    if (localWin) {
                        localWin.__discountFormHasChanges = false;
                        localWin.__socialFormHasChanges = false;
                    }
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("view", String(value));
                    router.push(`${pathname}?${params.toString()}`);
                }
            });
        } else {
            const params = new URLSearchParams(searchParams.toString());
            params.set("view", String(value));
            router.push(`${pathname}?${params.toString()}`);
        }
    }, [searchParams, router, pathname, activeTab, confirm, t]);
    const isWingWise = searchParams.get('isWingWise') === 'true';
    const levelParam = searchParams.get('level') as "Apartment" | "Wing" | "Unit" | null;
    const societyDetailId = searchParams.get('societyDetailId');
    const wingDetailId = searchParams.get('wingDetailId');
    const initialWingDetailId = wingDetailId ? Number(wingDetailId) : null;

    const levelState = useDiscountLevelState({
        propertyId,
        initialLevel: levelParam || (isWingWise ? 'Wing' : 'Apartment'),
        initialWingDetailId,
        isSociety, 
        wings,
        units
    });

    const handleLevelChange = useCallback((level: "Apartment" | "Wing" | "Unit") => {
        levelState.setLevel(level);
        const params = new URLSearchParams(searchParams.toString());
        params.set("level", level);
        router.push(`${pathname}?${params.toString()}`);
    }, [levelState, searchParams, router, pathname]);

    const {
        discountData,
        isSaving,
        hasChanges,
        validationErrors,
        incompleteDiscounts,
        handleToggleEnabled,
        handleInputChange,
        handleFileUpload,
        handleFileDelete,
        handleDeleteDiscount,
        handleSave,
        revertDiscount
    } = useDiscountForm(initialDiscountData, propertyId, discountMasterAttributes, {
        level: levelState?.level,
        societyDetailId,
        wingDetailId: levelState && (levelState.level === 'Wing' || levelState.level === 'Unit') 
            ? (levelState.selectedWingDetailId ? String(levelState.selectedWingDetailId) : wingDetailId) 
            : wingDetailId,
        propertyIds: levelState ? Array.from(levelState.selectedUnitIds).join(",") : undefined,
        isSociety: isSociety
    });

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showActiveFirst, setShowActiveFirst] = useState(false);

    const activeSelectedId = useMemo(() => {
        if (selectedId !== null) {
            const exists = discountData[selectedId];
            if (exists) return selectedId;
        }
        const rootDiscounts = discountMasterAttributes.length > 0
            ? discountMasterAttributes
            : (initialDiscountData?.discountAttributes || []);
        return rootDiscounts.length > 0 ? rootDiscounts[0].id : null;
    }, [discountData, selectedId, initialDiscountData?.discountAttributes, discountMasterAttributes]);

    const handleSelectDiscount = useCallback((id: number) => {
        if (activeSelectedId !== null && activeSelectedId !== id) {
            revertDiscount(activeSelectedId);
        }
        setSelectedId(id);
        const params = new URLSearchParams(searchParams.toString());
        params.set("socialAttributeId", id.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [activeSelectedId, revertDiscount, searchParams, pathname, router]);

    const handleToggleEnabledWrapped = useCallback((id: number, checked: boolean) => {
        const item = discountData[id];
        const initialItem = initialDiscountData?.discountAttributes?.find(x => x.id === id);
        const existsAndActiveInDb = initialItem && typeof initialItem.propertySocialDetailId === "number" && initialItem.propertySocialDetailId > 0 && initialItem.bitValue === true;

        if (!checked && existsAndActiveInDb) {
            const displayName = getLocalizedName(item.socialAttributeCode, item.socialAttributeName, t as unknown as Parameters<typeof getLocalizedName>[2]);
            confirm({
                title: t("discount.confirmDeleteDiscountTitle") || "Delete Discount & Data",
                description: `${t("discount.confirmToggleOffWarning") || "You have active details:"}\n${displayName}\n\n${t("discount.confirmDeleteDiscountDesc") || "Are you sure you want to delete this discount and all its associated data?"}`,
                confirmText: t("discount.confirmDeleteDiscountOk") || "Yes, Delete",
                cancelText: t("discount.confirmDeleteDiscountCancel") || "No, Cancel",
                variant: "delete",
                onConfirm: async () => {
                    await handleDeleteDiscount(id);
                    handleSelectDiscount(id);
                },
                onCancel: () => {
                    // Leaves toggle state active/unchanged
                }
            });
        } else {
            handleToggleEnabled(id, checked);
            handleSelectDiscount(id);
        }
    }, [handleToggleEnabled, discountData, handleDeleteDiscount, confirm, t, initialDiscountData?.discountAttributes, handleSelectDiscount]);

    const filteredDiscounts = useMemo(() => {
        return getFilteredDiscounts(discountData, searchTerm, showActiveFirst, t);
    }, [discountData, searchTerm, showActiveFirst, t]);

    const selectedDiscount = activeSelectedId !== null ? discountData[activeSelectedId] : null;

    const handleErrorTagClick = useCallback((id: number) => {
        if (showActiveFirst) {
            setShowActiveFirst(false);
        }
        setSearchTerm("");
        handleSelectDiscount(id);

        requestAnimationFrame(() => {
            const card = document.querySelector(`[data-certificate-id="${id}"]`);
            if (card && typeof card.scrollIntoView === "function") {
                card.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }, [showActiveFirst, handleSelectDiscount]);

    const handleSaveClick = useCallback(async () => {
        if (isSociety && levelState) {
            if (levelState.level === 'Wing' && !levelState.selectedWingDetailId) {
                toast.error(t('building.errors.selectWingRequired') || 'Please select a wing.');
                return;
            }
            if (levelState.level === 'Unit' && levelState.selectedUnitIds.size === 0) {
                toast.error(t('building.selectUnits') || 'Please select at least one unit.');
                return;
            }
        }

        const result = await handleSave();
        if (result && !result.isValid && result.incompleteDiscounts) {
            const activeIncomplete = result.incompleteDiscounts.filter(
                (d) => {
                    const item = discountData[d.id];
                    return item ? (item.dataType.toUpperCase() === "BIT" ? item.bitValue === true : item.enabled) : false;
                }
            );
            if (activeIncomplete.length > 0) {
                const firstInvalidId = activeIncomplete[0].id;
                handleSelectDiscount(firstInvalidId);
                requestAnimationFrame(() => {
                    const card = document.querySelector(`[data-certificate-id="${firstInvalidId}"]`);
                    if (card && typeof card.scrollIntoView === "function") {
                        card.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                });
            }
        }
    }, [handleSave, discountData, handleSelectDiscount, isSociety, levelState, t]);

    return (
        <>
            <Tabs value={activeTab} onChange={handleTabChange} variant="pills" size="sm" className="w-full p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <Tabs.TabList className="bg-slate-100 p-1.5 rounded-xl min-w-[300px] w-full sm:w-auto border border-slate-200">
                        <Tabs.Tab value="discount" className="w-1/2 justify-center py-2 text-xs font-bold cursor-pointer">
                            {t("discount.title")}
                        </Tabs.Tab>
                        <Tabs.Tab value="social" className="w-1/2 justify-center py-2 text-xs font-bold cursor-pointer">
                            {t("discount.socialTitle")}
                        </Tabs.Tab>
                    </Tabs.TabList>

                    {isSociety && levelState && (
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                            {searchParams.get('isWingWise') !== 'true' && (
                                <Button
                                size="xs"
                                variant={levelState.level === 'Apartment' ? 'primary' : 'ghost'}
                                icon={Building2}
                                onClick={() => handleLevelChange('Apartment')}
                                className={cn(
                                    'font-bold cursor-pointer rounded-lg transition-all',
                                    levelState.level === 'Apartment'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                                )}
                            >
                                {t('building.apartmentLevel') || 'Apartment Level'}
                            </Button>
                            )}
                            <Button
                                size="xs"
                                variant={levelState.level === 'Wing' ? 'primary' : 'ghost'}
                                icon={Home}
                                onClick={() => handleLevelChange('Wing')}
                                className={cn(
                                    'font-bold cursor-pointer rounded-lg transition-all',
                                    levelState.level === 'Wing'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                                )}
                            >
                                {t('building.wingLevel') || 'Wing Level'}
                            </Button>
                            <Button
                                size="xs"
                                variant={levelState.level === 'Unit' ? 'primary' : 'ghost'}
                                icon={Store}
                                onClick={() => handleLevelChange('Unit')}
                                className={cn(
                                    'font-bold cursor-pointer rounded-lg transition-all',
                                    levelState.level === 'Unit'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                                )}
                            >
                                {t('building.unitLevel') || 'Unit Level'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Discount Information Tab */}
                <Tabs.TabPanel value="discount" className="h-[calc(100vh-275px)] min-h-[500px] flex flex-col mt-0">
                    <DiscountPane
                        discountData={discountData}
                        incompleteDiscounts={incompleteDiscounts}
                        handleErrorTagClick={handleErrorTagClick}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        showActiveFirst={showActiveFirst}
                        setShowActiveFirst={setShowActiveFirst}
                        filteredDiscounts={filteredDiscounts}
                        activeSelectedId={activeSelectedId}
                        setSelectedId={handleSelectDiscount}
                        handleToggleEnabled={handleToggleEnabledWrapped}
                        validationErrors={validationErrors}
                        selectedDiscount={selectedDiscount}
                        handleInputChange={handleInputChange}
                        handleFileUpload={handleFileUpload}
                        handleFileDelete={handleFileDelete}
                        handleDeleteDiscount={handleDeleteDiscount}
                        isSaving={isSaving}
                        hasChanges={hasChanges}
                        onSave={handleSaveClick}
                        t={t}
                        levelState={levelState}
                        isSociety={isSociety}
                    />
                </Tabs.TabPanel>

                {/* Social Information Tab */}
                <Tabs.TabPanel value="social" className="h-[calc(100vh-275px)] min-h-[500px] flex flex-col mt-0">
                    <SocialDetailsForm
                        initialSocialData={initialSocialData}
                        propertyId={propertyId}
                        levelState={levelState}
                        isSociety={isSociety}
                        socialMasterAttributes={socialMasterAttributes}
                    />
                </Tabs.TabPanel>
            </Tabs>
        </>
    );
};

export default DiscountFormview;
