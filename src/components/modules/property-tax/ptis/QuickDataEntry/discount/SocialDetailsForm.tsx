"use client";

import React, { useTransition } from "react";
import { useSocialDetailsForm } from "@/hooks/useSocialDetailsForm";
import { PropertySocialInfoResponseDto, PropertySocialDetailsDto } from "@/types/property-social-details.types";
import { useDiscountLevelState } from "@/hooks/useDiscountLevelState";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SocialSidebar } from "./SocialSidebar";
import { SocialDetailPane } from "./SocialDetailPane";
import { SocialValidationErrorBanner } from "./SocialValidationErrorBanner";
import { UnitSelectionPanel } from "./UnitSelectionPanel";
import { getLocalizedName } from "@/lib/utils/social-details";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";

import { Button, Label } from "@/components/common";
import { cn } from "@/lib/utils/cn";
import { SocialAttribute } from "@/types/social-attribute.types";
import { Loader2 } from "lucide-react";
import { useConfirm } from "@/components/common/ConfirmProvider";

export interface UnitRow extends Record<string, unknown> {
    propertyDetailsId: number;
    propertyId?: number;
    unitNo: string;
    wingName: string;
    floorName: string;
    useName: string;
}

interface SocialDetailsFormProps {
    initialSocialData: PropertySocialInfoResponseDto | null;
    propertyId: string;
    levelState?: ReturnType<typeof useDiscountLevelState>;
    isSociety?: boolean;
    societyDetailId?: number;
    socialMasterAttributes?: SocialAttribute[];
    isWingLoading?: boolean;
    savedPropertyDetails?: PropertySocialDetailsDto[];
}

export const SocialDetailsForm: React.FC<SocialDetailsFormProps> = ({
    initialSocialData,
    propertyId,
    levelState,
    isSociety,
    societyDetailId: propSocietyDetailId,
    socialMasterAttributes = [],
    isWingLoading = false,
    savedPropertyDetails = []
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations("quickDataEntry");
    const [isWingPending, startWingTransition] = useTransition();
    const { confirm } = useConfirm();

    const updateUrl = React.useCallback((params: URLSearchParams) => {
        const nextUrl = `${pathname}?${params.toString()}`;
        startWingTransition(() => {
            router.push(nextUrl, { scroll: false });
        });
    }, [pathname, router]);
    const isLoadingWing = isWingLoading || isWingPending;
    const societyDetailId = searchParams.get('societyDetailId') || (propSocietyDetailId ? String(propSocietyDetailId) : null);
    const wingDetailId = searchParams.get('wingDetailId');
    const editingUnitId = React.useMemo(() => {
        if (!levelState || levelState.level !== 'Unit') return null;
        if (levelState.selectedUnitIds.size === 1) {
            return Array.from(levelState.selectedUnitIds)[0];
        }
        const unitParam = searchParams.get('unitPropertyId');
        if (unitParam && !isNaN(Number(unitParam))) {
            return Number(unitParam);
        }
        return null;
    }, [levelState, searchParams]);

    const {
        socialData,
        isSaving,
        hasChanges,
        validationErrors,
        incompleteAttributes,
        isAttributeEnabled,
        handleInputChange,
        handleToggleEnabled,
        handlePhotoUpload,
        handlePhotoDelete,
        handleDeleteSocialDetail,
        handleSave
    } = useSocialDetailsForm(initialSocialData, propertyId, socialMasterAttributes, {
        level: (levelState?.level === 'Apartment' || levelState?.level === 'Wing' || levelState?.level === 'Unit') ? levelState.level : undefined,
        societyDetailId,
        wingDetailId: levelState && (levelState.level === 'Wing' || levelState.level === 'Unit')
            ? (levelState.selectedWingDetailId ? String(levelState.selectedWingDetailId) : wingDetailId)
            : wingDetailId,
        propertyIds: levelState ? Array.from(levelState.selectedUnitIds).join(",") : undefined,
        isSociety,
        selectedUnitCount: levelState ? levelState.selectedUnitIds.size : undefined,
        totalUnitCount: levelState ? levelState.filteredUnits.length : undefined,
        savedPropertyDetails,
        editingUnitId,
    });

    const [selectedId, setSelectedId] = React.useState<number | null>(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const paramId = urlParams.get("socialAttributeId");
            if (paramId && !isNaN(Number(paramId))) return Number(paramId);
        }
        return searchParams.get("socialAttributeId") ? Number(searchParams.get("socialAttributeId")) : null;
    });
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showActiveFirst, setShowActiveFirst] = React.useState(false);
    const [deleteSelectionCount, setDeleteSelectionCount] = React.useState(0);

    const buildHierarchyFromMaster = React.useCallback((rootId: number) => {
        const flatSource = socialMasterAttributes.length > 0
            ? socialMasterAttributes
            : (initialSocialData?.socialAttributes || []).flatMap((attr) => [attr]);

        const buildNode = (attributeId: number): SocialAttributeHierarchyDto | null => {
            const flatAttr = flatSource.find((attr) => attr.id === attributeId);
            if (!flatAttr) return null;
            const state = socialData[attributeId];

            const children = flatSource
                .filter((attr) => attr.parentAttributeId === attributeId)
                .map((child) => buildNode(child.id))
                .filter((child): child is SocialAttributeHierarchyDto => child !== null);

            return {
                id: flatAttr.id,
                socialAttributeCode: flatAttr.socialAttributeCode,
                socialAttributeName: flatAttr.socialAttributeName,
                dataType: flatAttr.dataType,
                unit: flatAttr.unit,
                displayOrder: flatAttr.displayOrder,
                parentAttributeId: flatAttr.parentAttributeId,
                isRequiredWhenParentTrue: flatAttr.isRequiredWhenParentTrue,
                isDiscountApplicable: flatAttr.isDiscountApplicable,
                propertySocialDetailId: state?.id ?? undefined,
                bitValue: state?.bitValue ?? (flatAttr.dataType.toUpperCase() === "BIT" ? false : null),
                intValue: (state?.intValue as number | null) ?? null,
                decimalValue: (state?.decimalValue as number | null) ?? null,
                textValue: state?.textValue ?? null,
                dateValue: state?.dateValue ?? null,
                documentBindingId: state?.documentBindingId ?? null,
                remark: state?.remark ?? null,
                photoTypeId: undefined,
                isPhotoRequired: flatAttr.isPhotoRequired,
                isDocumentRequired: flatAttr.isDocumentRequired,
                isActive: flatAttr.isActive,
                documentGuid: state?.documentGuid ?? null,
                photoBindingId: state?.photoBindingId ?? null,
                photoGuid: state?.photoGuid ?? null,
                children,
            };
        };

        return buildNode(rootId);
    }, [initialSocialData?.socialAttributes, socialData, socialMasterAttributes]);

    // List of root attributes
    const rootAttributes = React.useMemo(() => {
        const sourceData = socialMasterAttributes.length > 0
            ? socialMasterAttributes
            : (initialSocialData?.socialAttributes || []);

        return sourceData
            .map((attr) => socialData[attr.id])
            .filter(attr => attr && !attr.parentAttributeId);
    }, [initialSocialData, socialMasterAttributes, socialData]);

    const filteredAttributes = React.useMemo(() => {
        let list = [...rootAttributes];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter((attr) => {
                const displayName = getLocalizedName(attr.socialAttributeCode, attr.socialAttributeName, t);
                return displayName.toLowerCase().includes(term);
            });
        }
        if (showActiveFirst) {
            list = [...list].sort((a, b) => {
                const aEnabled = a.bitValue === true;
                const bEnabled = b.bitValue === true;
                if (aEnabled && !bEnabled) return -1;
                if (!aEnabled && bEnabled) return 1;
                return 0;
            });
        }
        return list;
    }, [rootAttributes, searchTerm, showActiveFirst, t]);

    const activeSelectedId = React.useMemo(() => {
        if (selectedId !== null) {
            const exists = filteredAttributes.some(d => d.socialAttributeId === selectedId);
            if (exists) return selectedId;
        }
        return filteredAttributes.length > 0 ? filteredAttributes[0].socialAttributeId : null;
    }, [filteredAttributes, selectedId]);

    const handleSelectAttribute = React.useCallback((id: number) => {
        setSelectedId(id);
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            params.set("socialAttributeId", id.toString());
            window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
        }
    }, [pathname]);

    const handleToggleEnabledWrapped = React.useCallback((id: number, checked: boolean) => {
        const updateState = () => {
            setSelectedId(id);
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                params.set("socialAttributeId", id.toString());
                window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
            }
        };

        const isSaved = (socialData[id]?.id ?? 0) > 0 || (socialData[id]?.documentBindingId ?? 0) > 0;
        if (!checked && isSaved) {
            confirm({
                title: t("discount.confirmDeleteAttributeTitle") || "Delete Social Data",
                description: `${t("discount.confirmToggleOffWarning") || "You have an active social data with details:"}\n${socialData[id].socialAttributeName || ''}\n\n${t("discount.confirmDeleteAttributeDesc") || "Are you sure you want to delete this social data?"}`,
                confirmText: t("discount.confirmDeleteAttributeOk") || "Yes, Delete",
                cancelText: t("discount.confirmDeleteAttributeCancel") || "No, Cancel",
                variant: "delete",
                onConfirm: () => {
                    handleDeleteSocialDetail(id);
                    updateState();
                }
            });
        } else {
            handleToggleEnabled(id, checked);
            updateState();
        }
    }, [handleToggleEnabled, handleDeleteSocialDetail, pathname, socialData, confirm, t]);

    const selectedAttribute = activeSelectedId !== null ? socialData[activeSelectedId] : null;

    const selectedHierarchy = React.useMemo(() => {
        if (activeSelectedId === null) return null;
        const masterHierarchy = buildHierarchyFromMaster(activeSelectedId);
        if (masterHierarchy) return masterHierarchy;
        return initialSocialData?.socialAttributes?.find(attr => attr.id === activeSelectedId) || null;
    }, [activeSelectedId, buildHierarchyFromMaster, initialSocialData?.socialAttributes]);

    const handleErrorTagClick = React.useCallback((id: number) => {
        if (showActiveFirst) {
            setShowActiveFirst(false);
        }
        setSearchTerm("");
        handleSelectAttribute(id);

        requestAnimationFrame(() => {
            const card = document.querySelector(`[data-certificate-id="${id}"]`);
            if (card && typeof card.scrollIntoView === "function") {
                card.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }, [showActiveFirst, handleSelectAttribute]);

    const handleSaveClick = React.useCallback(async () => {
        const result = await handleSave();
        if (result && result.success) {
            router.refresh();
        } else if (result && !result.isValid && result.errors) {
            const firstInvalidIdStr = Object.keys(result.errors)[0];
            if (firstInvalidIdStr) {
                const firstInvalidId = Number(firstInvalidIdStr);
                const findRootParentId = (attrId: number): number => {
                    const attr = socialData[attrId];
                    if (attr && attr.parentAttributeId) {
                        return findRootParentId(attr.parentAttributeId);
                    }
                    return attrId;
                };
                const rootParentId = findRootParentId(firstInvalidId);
                handleSelectAttribute(rootParentId);
                requestAnimationFrame(() => {
                    const card = document.querySelector(`[data-certificate-id="${rootParentId}"]`);
                    if (card && typeof card.scrollIntoView === "function") {
                        card.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                });
            }
        }
    }, [handleSave, socialData, handleSelectAttribute, router]);

    const activeIncompleteAttributes = React.useMemo(() => {
        return incompleteAttributes.filter(d => socialData[d.id]?.bitValue === true);
    }, [incompleteAttributes, socialData]);

    const handleEditUnit = React.useCallback((_row: unknown) => {
        if (activeSelectedId !== null) {
            handleSelectAttribute(activeSelectedId);
        }
    }, [activeSelectedId, handleSelectAttribute]);

    const handleUnitUrlUpdate = React.useCallback((params: URLSearchParams) => {
        updateUrl(params);
    }, [updateUrl]);

    const activeAttributeDisplayName = selectedAttribute
        ? getLocalizedName(selectedAttribute.socialAttributeCode, selectedAttribute.socialAttributeName, t)
        : (activeSelectedId !== null && socialData[activeSelectedId]
            ? getLocalizedName(socialData[activeSelectedId].socialAttributeCode, socialData[activeSelectedId].socialAttributeName, t)
            : undefined);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 flex flex-col flex-1 min-h-0 overflow-hidden relative p-1.5 md:p-2 w-full h-full">
            {/* Validation Error Banner */}
            {activeIncompleteAttributes.length > 0 && (
                <SocialValidationErrorBanner
                    incompleteAttributes={activeIncompleteAttributes}
                    onTagClick={handleErrorTagClick}
                    t={t as unknown as (key: string) => string}
                />
            )}



            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:overflow-hidden">
                {/* Left Sidebar */}
                <div className="lg:col-span-4 xl:col-span-3 h-auto lg:h-full lg:overflow-hidden">
                    <SocialSidebar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        showActiveFirst={showActiveFirst}
                        onShowActiveChange={setShowActiveFirst}
                        attributes={filteredAttributes}
                        socialData={socialData}
                        selectedId={activeSelectedId}
                        onSelect={handleSelectAttribute}
                        onToggleEnabled={handleToggleEnabledWrapped}
                        validationErrors={validationErrors}
                        level={levelState?.level}
                        t={t as unknown as {
                            (key: string, values?: Record<string, string | number | Date>): string;
                            has?: (key: string) => boolean;
                        }}
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
                                                    params.set("wingDetailId", wing.wingDetailId.toString());
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
                            t={t as unknown as (key: string, values?: Record<string, string | number | Date>) => string}
                            savedPropertyDetails={savedPropertyDetails.length > 0 ? savedPropertyDetails : (initialSocialData?.socialAttributes || [])}
                            activeSelectedId={activeSelectedId}
                            activeAttributeName={activeAttributeDisplayName}
                            onEditUnit={handleEditUnit}
                            onUrlUpdate={handleUnitUrlUpdate}
                            showActions={true}
                            propertyId={propertyId}
                            societyDetailId={societyDetailId ? Number(societyDetailId) : (propSocietyDetailId ? Number(propSocietyDetailId) : undefined)}
                            wingDetailId={levelState.selectedWingDetailId}
                            onDeleteSelectionChange={(selectedIds) => setDeleteSelectionCount(selectedIds.size)}
                        />
                    )}

                    <SocialDetailPane
                        data={selectedAttribute}
                        hierarchyData={selectedHierarchy}
                        socialData={socialData}
                        onInputChange={handleInputChange}
                        onPhotoUpload={handlePhotoUpload}
                        onPhotoDelete={handlePhotoDelete}
                        onDeleteSocialDetail={() => {
                            if (activeSelectedId !== null) {
                                handleDeleteSocialDetail(activeSelectedId);
                            }
                        }}
                        isSaving={isSaving}
                        hasChanges={hasChanges}
                        onSave={handleSaveClick}
                        validationErrors={validationErrors}
                        isAttributeEnabled={isAttributeEnabled}
                        t={t as unknown as {
                            (key: string, values?: Record<string, string | number | Date>): string;
                            has?: (key: string) => boolean;
                        }}
                        isDeleteDisabled={levelState?.level === 'Unit' && deleteSelectionCount > 0}
                    />
                </div>
            </div>
        </div>
    );
};
