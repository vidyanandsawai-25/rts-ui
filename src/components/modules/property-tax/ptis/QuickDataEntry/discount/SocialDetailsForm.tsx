"use client";

import React from "react";
import { useSocialDetailsForm } from "@/hooks/useSocialDetailsForm";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";
import { useDiscountLevelState } from "@/hooks/useDiscountLevelState";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SocialSidebar } from "./SocialSidebar";
import { SocialDetailPane } from "./SocialDetailPane";
import { SocialValidationErrorBanner } from "./SocialValidationErrorBanner";
import { getLocalizedName } from "@/lib/utils/social-details";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";

import { Button, Label, Badge, SearchInput, Select, MasterTable, Checkbox } from "@/components/common";
import type { Column } from "@/components/common";
import { cn } from "@/lib/utils/cn";
import { SocialAttribute } from "@/types/social-attribute.types";

export interface UnitRow extends Record<string, unknown> {
    propertyDetailsId: number;
    unitNo: string;
    wingName: string;
    floorName: string;
    useName: string;
}

const checkIfSocialAttributeActiveInInitial = (
    attributes: SocialAttributeHierarchyDto[] | undefined,
    targetId: number
): boolean => {
    if (!attributes) return false;
    for (const attr of attributes) {
        if (attr.id === targetId) {
            return typeof attr.propertySocialDetailId === "number" && attr.propertySocialDetailId > 0 && attr.bitValue === true;
        }
        if (attr.children && attr.children.length > 0) {
            const found = checkIfSocialAttributeActiveInInitial(attr.children, targetId);
            if (found) return true;
        }
    }
    return false;
};

interface SocialDetailsFormProps {
    initialSocialData: PropertySocialInfoResponseDto | null;
    propertyId: string;
    levelState?: ReturnType<typeof useDiscountLevelState>;
    isSociety?: boolean;
    socialMasterAttributes?: SocialAttribute[];
}

export const SocialDetailsForm: React.FC<SocialDetailsFormProps> = ({
    initialSocialData,
    propertyId,
    levelState,
    isSociety,
    socialMasterAttributes = []
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations("quickDataEntry");

    const updateUrl = (params: URLSearchParams) => {
        const nextUrl = `${pathname}?${params.toString()}`;
        router.push(nextUrl, { scroll: false });
    };
    const societyDetailId = searchParams.get('societyDetailId');
    const wingDetailId = searchParams.get('wingDetailId');
    const { confirm } = useConfirm();
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
        handleSave,
        revertSocialAttribute
    } = useSocialDetailsForm(initialSocialData, propertyId, socialMasterAttributes, {
        level: levelState?.level,
        societyDetailId,
        wingDetailId: levelState && (levelState.level === 'Wing' || levelState.level === 'Unit')
            ? (levelState.selectedWingDetailId ? String(levelState.selectedWingDetailId) : wingDetailId)
            : wingDetailId,
        propertyIds: levelState ? Array.from(levelState.selectedUnitIds).join(",") : undefined,
        isSociety
    });

    const [selectedId, setSelectedId] = React.useState<number | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showActiveFirst, setShowActiveFirst] = React.useState(false);

    const buildHierarchyFromMaster = React.useCallback((rootId: number) => {
        const flatSource = socialMasterAttributes.length > 0
            ? socialMasterAttributes
            : (initialSocialData?.socialAttributes || []).flatMap((attr) => [attr]);

        const buildNode = (attributeId: number): SocialAttributeHierarchyDto | null => {
            const flatAttr = flatSource.find((attr) => attr.id === attributeId);
            const state = socialData[attributeId];
            if (!flatAttr || !state) return null;

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
                propertySocialDetailId: state.id ?? undefined,
                bitValue: state.bitValue,
                intValue: state.intValue as number | null,
                decimalValue: state.decimalValue as number | null,
                textValue: state.textValue,
                dateValue: state.dateValue,
                documentBindingId: state.documentBindingId,
                remark: state.remark,
                photoTypeId: undefined,
                isPhotoRequired: flatAttr.isPhotoRequired,
                isDocumentRequired: flatAttr.isDocumentRequired,
                isActive: flatAttr.isActive,
                documentGuid: state.documentGuid ?? null,
                photoBindingId: state.photoBindingId,
                photoGuid: state.photoGuid,
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
        if (activeSelectedId !== null && activeSelectedId !== id) {
            revertSocialAttribute(activeSelectedId);
        }
        setSelectedId(id);
        const params = new URLSearchParams(searchParams.toString());
        params.set("socialAttributeId", id.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [activeSelectedId, revertSocialAttribute, searchParams, pathname, router]);

    const handleToggleEnabledWrapped = React.useCallback((id: number, checked: boolean) => {
        const item = socialData[id];
        const existsAndActiveInDb = checkIfSocialAttributeActiveInInitial(initialSocialData?.socialAttributes, id);

        if (!checked && existsAndActiveInDb) {
            const displayName = getLocalizedName(item.socialAttributeCode, item.socialAttributeName, t as unknown as Parameters<typeof getLocalizedName>[2]);
            confirm({
                title: t("discount.confirmDeleteAttributeTitle") || "Delete Social Detail & Data",
                description: `${t("discount.confirmToggleOffWarning") || "You have active details:"}\n${displayName}\n\n${t("discount.confirmDeleteAttributeDesc") || "Are you sure you want to delete this social detail and all its associated data?"}`,
                confirmText: t("discount.confirmDeleteAttributeOk") || "Yes, Delete",
                cancelText: t("discount.confirmDeleteAttributeCancel") || "No, Cancel",
                variant: "delete",
                onConfirm: async () => {
                    await handleDeleteSocialDetail(id);
                    handleSelectAttribute(id);
                },
                onCancel: () => {
                    // Leaves toggle state active/unchanged
                }
            });
        } else {
            handleToggleEnabled(id, checked);
            handleSelectAttribute(id);
        }
    }, [handleToggleEnabled, socialData, handleDeleteSocialDetail, confirm, t, initialSocialData?.socialAttributes, handleSelectAttribute]);

    const selectedAttribute = activeSelectedId !== null ? socialData[activeSelectedId] : null;

    const selectedHierarchy = React.useMemo(() => {
        if (activeSelectedId === null) return null;
        const initialHierarchy = initialSocialData?.socialAttributes?.find(attr => attr.id === activeSelectedId);
        if (initialHierarchy) return initialHierarchy;
        return buildHierarchyFromMaster(activeSelectedId);
    }, [initialSocialData?.socialAttributes, activeSelectedId, buildHierarchyFromMaster]);

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
        if (result && !result.isValid && result.errors) {
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
    }, [handleSave, socialData, handleSelectAttribute]);

    const activeIncompleteAttributes = React.useMemo(() => {
        return incompleteAttributes.filter(d => socialData[d.id]?.bitValue === true);
    }, [incompleteAttributes, socialData]);

    const unitTableColumns = React.useMemo<Column<UnitRow>[]>(() => {
        if (!levelState) return [];
        return [
            {
                key: 'propertyDetailsId',
                label: (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={levelState.isAllUnitsSelected}
                            onCheckedChange={levelState.toggleAllUnits}
                        />
                    </div>
                ),
                width: '40px',
                align: 'center',
                render: (_, row) => (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={levelState.selectedUnitIds.has(row.propertyDetailsId as number)}
                            onCheckedChange={() => levelState.toggleUnitSelection(row.propertyDetailsId as number)}
                        />
                    </div>
                ),
            },
            {
                key: 'unitNo',
                label: 'UNIT',
                render: (val) => <span className="font-bold text-blue-900">{String(val || '')}</span>,
            },
            {
                key: 'wingName',
                label: 'WING',
                render: (val) => <span className="font-semibold text-slate-700">{String(val || '')}</span>,
            },
            {
                key: 'floorName',
                label: 'FLOOR',
                render: (val) => <span className="text-slate-600">{String(val || '')}</span>,
            },
            {
                key: 'useName',
                label: 'USE',
                render: (val) => (
                    <Badge variant="secondary" size="sm" className="bg-blue-100 text-blue-800 font-semibold">
                        {String(val || 'Residential')}
                    </Badge>
                ),
            },
        ];
    }, [levelState]);

    const unitTableData = React.useMemo<UnitRow[]>(() => {
        if (!levelState) return [];
        return levelState.filteredUnits.map((u) => ({
            propertyDetailsId: u.propertyDetailsId,
            unitNo: u.unitNo,
            wingName: u.wingName,
            floorName: u.floorName,
            useName: u.useName || 'Residential',
        }));
    }, [levelState]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 flex flex-col flex-1 min-h-0 overflow-hidden relative p-2.5 md:p-3 w-full h-full">
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
                <div className="lg:col-span-5 xl:col-span-4 h-auto lg:h-full lg:overflow-hidden">
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
                        t={t as unknown as {
                            (key: string, values?: Record<string, string | number | Date>): string;
                            has?: (key: string) => boolean;
                        }}
                    />
                </div>

                {/* Right Detail Pane */}
                <div className="lg:col-span-7 xl:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-1 flex flex-col gap-3">
                    {isSociety && levelState && (levelState.level === 'Wing' || levelState.level === 'Unit') && (
                        <div className="flex-shrink-0 space-y-2 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
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
                                                    updateUrl(params);
                                                }}
                                                className={cn(
                                                    'px-4 font-semibold rounded-lg transition-all cursor-pointer border',
                                                    isSelected
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                                )}
                                            >
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

                    {isSociety && levelState && levelState.level === 'Unit' && (
                        <div className="flex-shrink-0 space-y-2 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                    {t('building.selectUnits') || 'SELECT UNITS'}
                                </Label>
                                <Badge variant="secondary" size="sm" className="bg-white text-slate-600 font-semibold border border-slate-200">
                                    {t('building.unitsSelected', { count: levelState.selectedUnitIds.size }) || `${levelState.selectedUnitIds.size} ${levelState.selectedUnitIds.size === 1 ? 'unit' : 'units'} selected`}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                <div className="relative sm:col-span-1">
                                    <SearchInput
                                        placeholder={t('building.searchUnitPlaceholder') || 'Search unit...'}
                                        value={levelState.unitSearchQuery}
                                        onChange={levelState.setUnitSearchQuery}
                                        className="w-full mb-0 text-xs"
                                    />
                                </div>
                                <Select
                                    options={levelState.wings.map((w) => ({ label: w.wingName, value: String(w.wingDetailId) }))}
                                    value={levelState.selectedWingDetailId ? String(levelState.selectedWingDetailId) : ''}
                                    onChange={(_, val) => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        if (val === 'all') {
                                            levelState.setSelectedWingDetailId(null);
                                            params.delete("wingDetailId");
                                        } else {
                                            const nextWingDetailId = Number(val);
                                            levelState.setSelectedWingDetailId(nextWingDetailId);
                                            params.set("wingDetailId", String(nextWingDetailId));
                                        }
                                        updateUrl(params);
                                    }}
                                    selectSize="sm"
                                    className="text-xs"
                                />
                                <Select
                                    options={[
                                        { label: t('building.allFloors') || 'All Floors', value: 'all' },
                                        ...levelState.availableFloors.map((fl) => ({ label: fl, value: fl })),
                                    ]}
                                    value={levelState.floorFilter}
                                    onChange={(_, val) => levelState.setFloorFilter(val)}
                                    selectSize="sm"
                                    className="text-xs"
                                />
                                <Select
                                    options={[
                                        { label: t('building.allUses') || 'All Uses', value: 'all' },
                                        ...levelState.availableUses.map((us) => ({ label: us, value: us })),
                                    ]}
                                    value={levelState.useFilter}
                                    onChange={(_, val) => levelState.setUseFilter(val)}
                                    selectSize="sm"
                                    className="text-xs"
                                />
                            </div>

                            <MasterTable<UnitRow>
                                columns={unitTableColumns}
                                data={unitTableData}
                                isPagination={false}
                                emptyText={t('building.noUnitsMatch') || 'No units match the selected filters'}
                                maxBodyHeightClassName="max-h-48"
                                onScroll={(e) => {
                                    const target = e.currentTarget;
                                    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 30) {
                                        levelState.loadNextUnitsPage();
                                    }
                                }}
                                getRowKey={(row) => row.propertyDetailsId as number}
                                onRowClick={(row) => levelState.toggleUnitSelection(row.propertyDetailsId as number)}
                                rowClassName={(row) =>
                                    levelState.selectedUnitIds.has(row.propertyDetailsId as number) ? 'bg-blue-50/60' : ''
                                }
                            />
                            {levelState.isLoadingMoreUnits && (
                                <div className="py-1.5 text-center text-xs text-blue-600 font-medium flex items-center justify-center gap-2 bg-blue-50/40 rounded-lg">
                                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>{t('building.loadingNextUnits') || 'Loading next 10 units...'}</span>
                                </div>
                            )}
                        </div>
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
                    />
                </div>
            </div>
        </div>
    );
};
