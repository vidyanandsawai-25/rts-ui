"use client";

import React, { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Button, Label, Badge, SearchInput, Select, MasterTable, Checkbox } from '@/components/common';
import type { Column } from '@/components/common';
import { cn } from '@/lib/utils/cn';
import { ValidationErrorBanner } from "./ValidationErrorBanner";
import { DiscountSidebar } from "./DiscountSidebar";
import { DiscountDetailPane } from "./DiscountDetailPane";
import { DiscountAttributeState, DiscountState } from "@/types/discount.types";
import { useDiscountLevelState } from "@/hooks/useDiscountLevelState";

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
    hasChanges?: boolean;
    onSave?: () => void;

    t: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    };
    levelState?: ReturnType<typeof useDiscountLevelState>;
    isSociety?: boolean;
}

export interface UnitRow extends Record<string, unknown> {
    propertyDetailsId: number;
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
    hasChanges,
    onSave,

    t,
    levelState,
    isSociety = false
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateUrl = (params: URLSearchParams) => {
        const nextUrl = `${pathname}?${params.toString()}`;
        router.push(nextUrl, { scroll: false });
    };

    const unitTableColumns = useMemo<Column<UnitRow>[]>(() => {
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

    const unitTableData = useMemo<UnitRow[]>(() => {
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
                <div className="lg:col-span-5 xl:col-span-4 h-auto lg:h-full lg:overflow-hidden">
                    <DiscountSidebar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        showActiveFirst={showActiveFirst}
                        onShowActiveChange={setShowActiveFirst}
                        discounts={filteredDiscounts}
                        selectedId={activeSelectedId}
                        onSelect={setSelectedId}
                        onToggleEnabled={handleToggleEnabled}
                        validationErrors={validationErrors}
                        t={t}
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
                                                    params.set("wingDetailId", String(wing.wingDetailId));
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
                        hasChanges={hasChanges}
                        onSave={onSave}
                        validationError={activeSelectedId !== null ? validationErrors[activeSelectedId] : undefined}
                        t={t}
                    />
                </div>
            </div>
        </div>
    );
};
