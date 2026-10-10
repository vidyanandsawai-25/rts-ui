import React, { useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button, Label } from '@/components/common';
import { cn } from '@/lib/utils/cn';
import { ValidationErrorBanner } from "./ValidationErrorBanner";
import { DiscountSidebar } from "./DiscountSidebar";
import { DiscountDetailPane } from "./DiscountDetailPane";
import { UnitSelectionPanel } from "./UnitSelectionPanel";
import { DiscountAttributeState, DiscountState } from "@/types/discount.types";
import { useDiscountLevelState } from "@/hooks/useDiscountLevelState";
import { Loader2 } from "lucide-react";
import { PropertySocialDetailsDto } from "@/types/property-social-details.types";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { getLocalizedName } from "@/lib/utils/social-details";

interface DiscountPaneProps {
    discountData: DiscountState;
    incompleteDiscounts: { id: number; name: string }[];
    handleErrorTagClick: (id: number) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showActiveFirst: boolean;
    setShowActiveFirst: (val: boolean) => void;
    filteredDiscounts: DiscountAttributeState[];
    activeSelectedId: number | null;
    setSelectedId: (id: number) => void;
    handleToggleEnabled: (id: number, checked: boolean) => void;
    validationErrors: Record<number, string>;
    selectedDiscount: DiscountAttributeState | null | undefined;
    handleInputChange: (id: number, field: "intValue" | "decimalValue" | "textValue" | "dateValue" | "remark", value: string) => void;
    handleFileUpload: (id: number, file: File) => void;
    handleFileDelete: (id: number) => void;
    handleDeleteDiscount: (id: number) => void;
    isSaving: boolean;
    isDeleting?: boolean;
    hasChanges?: boolean;
    isFormValid?: boolean;
    onSave?: () => void;

    t: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    };
    levelState?: ReturnType<typeof useDiscountLevelState>;
    isSociety?: boolean;
    isWingLoading?: boolean;
    savedPropertyDetails?: PropertySocialDetailsDto[];
    propertyId?: string;
    societyDetailId?: number;
}

export interface UnitRow extends Record<string, unknown> {
    propertyDetailsId: number;
    propertyId?: number;
    unitNo: string;
    wingName: string;
    floorName: string;
    useName: string;
}

export const DiscountPane: React.FC<DiscountPaneProps> = ({
    discountData,
    incompleteDiscounts,
    handleErrorTagClick,
    searchTerm,
    setSearchTerm,
    showActiveFirst,
    setShowActiveFirst,
    filteredDiscounts,
    activeSelectedId,
    setSelectedId,
    handleToggleEnabled,
    validationErrors,
    selectedDiscount,
    handleInputChange,
    handleFileUpload,
    handleFileDelete,
    handleDeleteDiscount,
    isSaving,
    isDeleting = false,
    hasChanges,
    isFormValid,
    onSave,

    savedPropertyDetails = [],
    t,
    levelState,
    isSociety = false,
    isWingLoading = false,
    propertyId,
    societyDetailId,
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isWingPending, startWingTransition] = useTransition();
    const { confirm } = useConfirm();
    const [deleteSelectionCount, setDeleteSelectionCount] = React.useState(0);

    const updateUrl = useCallback((params: URLSearchParams) => {
        const nextUrl = `${pathname}?${params.toString()}`;
        startWingTransition(() => {
            router.push(nextUrl, { scroll: false });
        });
    }, [pathname, router]);
    const isLoadingWing = isWingLoading || isWingPending;

    const handleEditUnit = useCallback((_row: unknown) => {
        if (activeSelectedId !== null) {
            setSelectedId(activeSelectedId);
        }
    }, [activeSelectedId, setSelectedId]);

    const handleUnitUrlUpdate = useCallback((params: URLSearchParams) => {
        updateUrl(params);
    }, [updateUrl]);

    const activeAttributeDisplayName = selectedDiscount
        ? getLocalizedName(selectedDiscount.socialAttributeCode, selectedDiscount.socialAttributeName, t as unknown as Parameters<typeof getLocalizedName>[2])
        : (activeSelectedId !== null && discountData[activeSelectedId]
            ? getLocalizedName(discountData[activeSelectedId].socialAttributeCode, discountData[activeSelectedId].socialAttributeName, t as unknown as Parameters<typeof getLocalizedName>[2])
            : undefined);


    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 flex flex-col flex-1 min-h-0 overflow-hidden relative p-1.5 md:p-2 w-full h-full">
            {/* Validation Error Banner */}
            {incompleteDiscounts.filter(d => {
                const item = discountData[d.id];
                return item ? (item.dataType.toUpperCase() === "BIT" ? item.bitValue === true : item.enabled) : false;
            }).length > 0 && (
                    <ValidationErrorBanner
                        incompleteDiscounts={incompleteDiscounts.filter(d => {
                            const item = discountData[d.id];
                            return item ? (item.dataType.toUpperCase() === "BIT" ? item.bitValue === true : item.enabled) : false;
                        })}
                        onTagClick={handleErrorTagClick}
                        t={t}
                    />
                )}



            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:overflow-hidden">
                {/* Left Sidebar */}
                <div className="lg:col-span-4 xl:col-span-3 h-auto lg:h-full lg:overflow-hidden">
                    <DiscountSidebar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        showActiveFirst={showActiveFirst}
                        onShowActiveChange={setShowActiveFirst}
                        discounts={filteredDiscounts}
                        selectedId={activeSelectedId}
                        onSelect={setSelectedId}
                        onToggleEnabled={(id, checked) => {
                            const item = discountData[id];
                            const isInheritedItem = Boolean(item?.isInherited && !item?.isOverridden);
                            const isSaved = !isInheritedItem && ((item?.propertySocialDetailId ?? 0) > 0 || (item?.documentBindingId ?? 0) > 0);
                            if (!checked && isSaved) {
                                confirm({
                                    title: t("discount.confirmDeleteDiscountTitle") || "Delete Discount & Data",
                                    description: `${t("discount.confirmToggleOffWarning") || "You have an active discount with details:"}\n${item?.socialAttributeName || ''}\n\n${t("discount.confirmDeleteDiscountDesc") || "Are you sure you want to delete this discount and all its associated data?"}`,
                                    confirmText: t("discount.confirmDeleteDiscountOk") || "Yes, Delete",
                                    cancelText: t("discount.confirmDeleteDiscountCancel") || "No, Cancel",
                                    variant: "delete",
                                    onConfirm: () => {
                                        handleDeleteDiscount(id);
                                        setSelectedId(id);
                                    }
                                });
                            } else {
                                handleToggleEnabled(id, checked);
                                setSelectedId(id);
                            }
                        }}
                        validationErrors={validationErrors}
                        level={(levelState?.level === 'Apartment' || levelState?.level === 'Wing' || levelState?.level === 'Unit') ? levelState.level : undefined}
                        t={t}
                    />
                </div>

                {/* Right Detail Pane */}
                <div className="relative lg:col-span-8 xl:col-span-9 h-full flex flex-col gap-2 overflow-hidden">
                    {/* Loading Overlay */}
                    {isLoadingWing && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl">
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 text-white rounded-lg shadow-md text-xs font-medium animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                <span>{t('building.fetchingWingData') || 'Fetching wing data...'}</span>
                            </div>
                        </div>
                    )}


                    {isSociety && levelState && levelState.level === 'Wing' && (
                        <div className="flex-shrink-0 space-y-1.5 bg-slate-50/60 p-2.5 rounded-lg border border-slate-200">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                {t('building.selectWing') || 'SELECT WING'}
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {levelState.wings.length > 0 ? (
                                    levelState.wings.map((wing) => {
                                        const isSelected = levelState.selectedWingDetailId === wing.wingDetailId;
                                        return (
                                            <Button
                                                key={wing.wingDetailId}
                                                size="xs"
                                                variant={isSelected ? 'success' : 'secondary'}
                                                onClick={() => {
                                                    levelState.setSelectedWingDetailId(wing.wingDetailId);
                                                    levelState.setWingFilter('all');
                                                    levelState.setFloorFilter('all');
                                                    levelState.setUseFilter('all');

                                                    const params = new URLSearchParams(searchParams.toString());
                                                    params.set("wingDetailId", String(wing.wingDetailId));
                                                    params.delete("unitPropertyId");
                                                    updateUrl(params);
                                                }}
                                                className={cn(
                                                    'px-4 font-semibold rounded-lg transition-all cursor-pointer border flex items-center gap-1.5',
                                                    isSelected
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                                )}
                                            >
                                                {isLoadingWing && isSelected && (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                                )}
                                                {wing.wingName}
                                            </Button>
                                        );
                                    })
                                ) : (
                                    <div className="text-xs text-slate-400 italic">
                                        {t('building.noWingsFound') || 'No wings found'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {isSociety && levelState && levelState.level === 'Unit' && Boolean(levelState.selectedWingDetailId && Number(levelState.selectedWingDetailId) > 0) && Boolean(levelState.filteredUnits && levelState.filteredUnits.length > 0) && (
                        <UnitSelectionPanel
                            levelState={levelState}
                            t={t}
                            savedPropertyDetails={savedPropertyDetails}
                            activeSelectedId={activeSelectedId}
                            activeAttributeName={activeAttributeDisplayName}
                            onEditUnit={handleEditUnit}
                            onUrlUpdate={handleUnitUrlUpdate}
                            showActions={true}
                            propertyId={propertyId}
                            societyDetailId={societyDetailId}
                            wingDetailId={levelState.selectedWingDetailId}
                            onDeleteSelectionChange={(selectedIds) => setDeleteSelectionCount(selectedIds.size)}
                        />
                    )}

                    <DiscountDetailPane
                        data={selectedDiscount}
                        onInputChange={(field, value) => {
                            if (activeSelectedId !== null) {
                                handleInputChange(activeSelectedId, field, value);
                            }
                        }}
                        onFileUpload={(file) => {
                            if (activeSelectedId !== null) {
                                handleFileUpload(activeSelectedId, file);
                            }
                        }}
                        onFileDelete={() => {
                            if (activeSelectedId !== null) {
                                handleFileDelete(activeSelectedId);
                            }
                        }}
                        onDeleteDiscount={() => {
                            if (activeSelectedId !== null) {
                                handleDeleteDiscount(activeSelectedId);
                            }
                        }}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                        hasChanges={hasChanges}
                        isFormValid={isFormValid}
                        onSave={onSave}
                        validationError={activeSelectedId !== null ? validationErrors[activeSelectedId] : undefined}
                        t={t}
                        isDeleteDisabled={levelState?.level === 'Unit' && deleteSelectionCount > 0}
                    />
                </div>
            </div>
        </div>
    );
};
