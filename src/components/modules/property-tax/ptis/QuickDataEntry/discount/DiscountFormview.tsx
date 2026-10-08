"use client";

import React, { useMemo, useState, useCallback, useTransition, useEffect } from "react";
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
import { SocialAttribute } from "@/types/social-attribute.types";
import { useDiscountLevelState } from "@/hooks/useDiscountLevelState";
import { UnitSelectionItem, WingOption } from "@/types/building-permission.types";
import { PropertySocialDetailsDto } from "@/types/property-social-details.types";
interface DiscountFormProps {
    initialDiscountData: PropertyDiscountInfoResponseDto | null;
    initialSocialData: PropertySocialInfoResponseDto | null;
    propertyId: string;
    isSociety?: boolean;
    discountMasterAttributes?: SocialAttribute[];
    socialMasterAttributes?: SocialAttribute[];
    wings?: WingOption[];
    units?: UnitSelectionItem[];
    savedPropertyDetails?: PropertySocialDetailsDto[];
    societyDetailId?: number;
    wingDetailId?: number;
}

const DiscountFormview: React.FC<DiscountFormProps> = ({
    initialDiscountData,
    initialSocialData,
    propertyId,
    isSociety = false,
    societyDetailId: propSocietyDetailId,
    wingDetailId: propWingDetailId,
    discountMasterAttributes = [],
    socialMasterAttributes = [],
    wings = [],
    units = [],
    savedPropertyDetails = [],
}) => {
    const t = useTranslations('quickDataEntry');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { confirm } = useConfirm();
    const [isPendingTransition, startTransition] = useTransition();

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
                    startTransition(() => {
                        router.push(`${pathname}?${params.toString()}`);
                    });
                }
            });
        } else {
            const params = new URLSearchParams(searchParams.toString());
            params.set("view", String(value));
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
            });
        }
    }, [searchParams, router, pathname, activeTab, confirm, t]);
    const isWingWise = searchParams.get('isWingWise') === 'true';
    const levelParam = searchParams.get('level') as "Apartment" | "Wing" | "Unit" | null;
    const societyDetailId = searchParams.get('societyDetailId') || searchParams.get('societyId');
    const wingDetailId = searchParams.get('wingDetailId') || searchParams.get('wingId');
    const initialWingDetailId = wingDetailId ? Number(wingDetailId) : (propWingDetailId ?? (wings && wings.length > 0 ? wings[0].wingDetailId : null));
    const unitPropertyIdParam = searchParams.get('unitPropertyId');
    const initialUnitPropertyId = unitPropertyIdParam ? Number(unitPropertyIdParam) : null;

    const effectiveSocietyDetailId = (propSocietyDetailId && Number(propSocietyDetailId) > 0 ? Number(propSocietyDetailId) : null) ?? (societyDetailId && Number(societyDetailId) > 0 ? Number(societyDetailId) : null);
    const hasSocietyDetailId = Boolean(effectiveSocietyDetailId && effectiveSocietyDetailId > 0);

    const hasWingsAvailable = Array.isArray(wings) && wings.length > 0;
    const effectiveWingDetailId = (propWingDetailId && Number(propWingDetailId) > 0 ? Number(propWingDetailId) : null) ?? (initialWingDetailId && initialWingDetailId > 0 ? initialWingDetailId : null);
    const hasWingDetailId = Boolean(hasWingsAvailable && effectiveWingDetailId && effectiveWingDetailId > 0);

    const showApartmentTab = hasSocietyDetailId && !isWingWise;
    const showWingTab = hasWingDetailId;
    const showLevelSelector = isSociety && Boolean(showApartmentTab || showWingTab);

    const rawInitialLevel = levelParam || (isWingWise ? 'Wing' : 'Apartment');
    const effectiveInitialLevel: "Apartment" | "Wing" | "Unit" =
        rawInitialLevel === 'Apartment' && !showApartmentTab
            ? (showWingTab ? 'Wing' : 'Unit')
            : rawInitialLevel === 'Wing' && !showWingTab
            ? 'Unit'
            : rawInitialLevel;

    const levelState = useDiscountLevelState({
        propertyId,
        initialLevel: effectiveInitialLevel,
        initialWingDetailId,
        initialUnitPropertyId,
        isSociety,
        wings,
        units,
        savedPropertyDetails
    });

    const handleLevelChange = useCallback((level: "Apartment" | "Wing" | "Unit") => {
        levelState.setLevel(level);
        const params = new URLSearchParams(searchParams.toString());
        params.set("level", level);
        if (level !== 'Unit') {
            params.delete("unitPropertyId");
        }
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [levelState, searchParams, router, pathname]);

    const currentLevel = levelState?.level;
    useEffect(() => {
        if (!currentLevel) return;
        if (currentLevel === 'Apartment' && !showApartmentTab) {
            handleLevelChange(showWingTab ? 'Wing' : 'Unit');
        } else if (currentLevel === 'Wing' && !showWingTab) {
            handleLevelChange('Unit');
        }
    }, [currentLevel, showApartmentTab, showWingTab, handleLevelChange]);

    const editingUnitId = useMemo(() => {
        if (!levelState || levelState.level !== 'Unit') return null;
        if (levelState.selectedUnitIds.size === 1) {
            return Array.from(levelState.selectedUnitIds)[0];
        }
        if (initialUnitPropertyId && initialUnitPropertyId > 0) {
            return initialUnitPropertyId;
        }
        return null;
    }, [levelState, initialUnitPropertyId]);

    const {
        discountData,
        isSaving,
        isDeleting,
        hasChanges,
        isFormValid,
        validationErrors,
        incompleteDiscounts,
        handleToggleEnabled,
        handleInputChange,
        handleFileUpload,
        handleFileDelete,
        handleDeleteDiscount,
        handleSave
    } = useDiscountForm(initialDiscountData, propertyId, discountMasterAttributes, {
        level: (levelState?.level === 'Apartment' || levelState?.level === 'Wing' || levelState?.level === 'Unit') ? levelState.level : undefined,
        societyDetailId: societyDetailId || (propSocietyDetailId ? String(propSocietyDetailId) : null),
        wingDetailId: levelState && (levelState.level === 'Wing' || levelState.level === 'Unit')
            ? (levelState.selectedWingDetailId ? String(levelState.selectedWingDetailId) : wingDetailId)
            : wingDetailId,
        propertyIds: levelState ? Array.from(levelState.selectedUnitIds).join(",") : undefined,
        isSociety: isSociety,
        selectedUnitCount: levelState ? levelState.selectedUnitIds.size : undefined,
        totalUnitCount: levelState ? levelState.filteredUnits.length : undefined,
        savedPropertyDetails,
        editingUnitId,
    });

    const [selectedId, setSelectedId] = useState<number | null>(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const paramId = urlParams.get("socialAttributeId");
            if (paramId && !isNaN(Number(paramId))) return Number(paramId);
        }
        return searchParams.get("socialAttributeId") ? Number(searchParams.get("socialAttributeId")) : null;
    });
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
        setSelectedId(id);
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            params.set("socialAttributeId", id.toString());
            window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
        }
    }, [pathname]);

    const handleToggleEnabledWrapped = useCallback((id: number, checked: boolean) => {
        handleToggleEnabled(id, checked);
        setSelectedId(id);
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            params.set("socialAttributeId", id.toString());
            window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
        }
    }, [handleToggleEnabled, pathname]);

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
            <Tabs value={activeTab} onChange={handleTabChange} variant="pills" size="sm" className="w-full p-2 sm:p-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-2.5 gap-2">
                    <Tabs.TabList className="bg-slate-100 p-1.5 rounded-xl min-w-[300px] w-full sm:w-auto border border-slate-200">
                        <Tabs.Tab value="discount" className="w-1/2 justify-center py-2 text-xs font-bold cursor-pointer">
                            {t("discount.title")}
                        </Tabs.Tab>
                        <Tabs.Tab value="social" className="w-1/2 justify-center py-2 text-xs font-bold cursor-pointer">
                            {t("discount.socialTitle")}
                        </Tabs.Tab>
                    </Tabs.TabList>

                    {showLevelSelector && (
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                            {showApartmentTab && (
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
                            {showWingTab && (
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
                            )}
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
                <Tabs.TabPanel value="discount" className="h-[calc(100vh-175px)] flex flex-col mt-0 overflow-hidden">
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
                        isDeleting={isDeleting}
                        hasChanges={hasChanges}
                        isFormValid={isFormValid}
                        onSave={handleSaveClick}
                        t={t}
                        levelState={levelState}
                        isSociety={isSociety}
                        isWingLoading={isPendingTransition}
                        savedPropertyDetails={savedPropertyDetails}
                        propertyId={propertyId}
                        societyDetailId={propSocietyDetailId || (societyDetailId ? Number(societyDetailId) : undefined)}
                    />
                </Tabs.TabPanel>

                {/* Social Information Tab */}
                <Tabs.TabPanel value="social" className="h-[calc(100vh-175px)] flex flex-col mt-0 overflow-hidden">
                    <SocialDetailsForm
                        initialSocialData={initialSocialData}
                        propertyId={propertyId}
                        levelState={levelState}
                        isSociety={isSociety}
                        societyDetailId={propSocietyDetailId}
                        socialMasterAttributes={socialMasterAttributes}
                        isWingLoading={isPendingTransition}
                        savedPropertyDetails={savedPropertyDetails}
                    />
                </Tabs.TabPanel>
            </Tabs>
        </>
    );
};

export default DiscountFormview;
