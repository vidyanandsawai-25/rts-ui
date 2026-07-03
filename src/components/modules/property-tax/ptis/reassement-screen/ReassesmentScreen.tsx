'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import {
    ArrowUpRight,
    TrendingUp,
    FileText,
    Clock,
    Layers,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import { RetrospectiveTaxModal } from './RetrospectiveTaxModal';
import { Section129Modal } from './Section129Modal';
import { OldFloorDetails } from './components/OldFloorDetails';
import { NewFloorDetails } from './components/NewFloorDetails';
import { TaxSummaryCards } from './components/TaxSummaryCards';
import type {
    MappedFloorDetail,
    ReassessmentTaxRow,
    MappedRetrospectiveColumn,
    MappedRetrospectiveRow,
    ReassessmentPhoto,
} from '@/types/reassessment.types';

// ============================================
// INTERFACES
// ============================================

interface TaxColumn {
    key: string;
    label: string;
    displayOrder: number;
}

interface DynamicTaxRow extends Record<string, unknown> {
    taxes: string;
    totalTax: string;
    isTotal?: boolean;
    isAdditional?: boolean;
    [key: string]: unknown;
}

interface ReassesmentScreenProps {
    oldFloorDetails?: MappedFloorDetail[];
    newFloorDetails?: MappedFloorDetail[];
    taxColumns?: TaxColumn[];
    taxRows?: ReassessmentTaxRow[];
    retrospectiveTaxColumns?: MappedRetrospectiveColumn[];
    retrospectiveTaxRows?: MappedRetrospectiveRow[];
    retrospectiveError?: string;
    error?: string;
    isLoading?: boolean;
    photos?: ReassessmentPhoto[];
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ReassesmentScreen({
    oldFloorDetails = [],
    newFloorDetails = [],
    taxColumns = [],
    taxRows = [],
    retrospectiveTaxColumns = [],
    retrospectiveTaxRows = [],
    retrospectiveError,
    error,
    isLoading = false,
    photos = [],
}: ReassesmentScreenProps) {
    // Modal states
    const [showRetroModal, setShowRetroModal] = useState(false);
    const [showSec129Modal, setShowSec129Modal] = useState(false);

    // Auto scrolling states
    const [isOldAutoScrolling, setIsOldAutoScrolling] = useState(false);
    const [isNewAutoScrolling, setIsNewAutoScrolling] = useState(false);

    // Scroll direction trackers
    const oldScrollDirectionRef = useRef<number>(1);
    const newScrollDirectionRef = useRef<number>(1);

    // ============================================
    // AUTO-SCROLL EFFECTS
    // ============================================

    // Auto scroll effect for Old Floor Details
    useEffect(() => {
        if (!isOldAutoScrolling) return;
        const el = document.querySelector("#old-table-container .overflow-auto") as HTMLElement;
        if (!el) return;
        let frameId: number;

        const smoothScroll = () => {
            const maxScroll = el.scrollWidth - el.clientWidth;
            if (maxScroll <= 0) return;

            if (el.scrollLeft >= maxScroll - 1) {
                oldScrollDirectionRef.current = -1;
            } else if (el.scrollLeft <= 1) {
                oldScrollDirectionRef.current = 1;
            }

            el.scrollLeft = Math.max(0, Math.min(maxScroll, el.scrollLeft + oldScrollDirectionRef.current));
            frameId = requestAnimationFrame(smoothScroll);
        };

        frameId = requestAnimationFrame(smoothScroll);
        return () => cancelAnimationFrame(frameId);
    }, [isOldAutoScrolling]);

    // Auto scroll effect for New Floor Details
    useEffect(() => {
        if (!isNewAutoScrolling) return;
        const el = document.querySelector("#new-table-container .overflow-auto") as HTMLElement;
        if (!el) return;
        let frameId: number;

        const smoothScroll = () => {
            const maxScroll = el.scrollWidth - el.clientWidth;
            if (maxScroll <= 0) return;

            if (el.scrollLeft >= maxScroll - 1) {
                newScrollDirectionRef.current = -1;
            } else if (el.scrollLeft <= 1) {
                newScrollDirectionRef.current = 1;
            }

            el.scrollLeft = Math.max(0, Math.min(maxScroll, el.scrollLeft + newScrollDirectionRef.current));
            frameId = requestAnimationFrame(smoothScroll);
        };

        frameId = requestAnimationFrame(smoothScroll);
        return () => cancelAnimationFrame(frameId);
    }, [isNewAutoScrolling]);

    // ============================================
    // FORMAT HELPERS
    // ============================================

    const formatCurrency = (value: number): string => {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(2)}Cr`;
        } else if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString('en-IN')}`;
    };

    const formatNumber = (value: number): string => {
        return value.toLocaleString('en-IN');
    };

    // ============================================
    // DYNAMIC TAX TABLE GENERATION
    // ============================================

    // Helper renderers for Detailed Taxes Table Grid
    const numericTaxRender = (val: unknown, row: DynamicTaxRow): React.ReactNode => {
        const numVal = typeof val === 'number' ? val : 0;
        return (
            <span className={cn(
                "font-mono",
                row.isTotal ? "text-blue-900" : row.isAdditional ? "text-sky-700" : ""
            )}>
                {formatNumber(numVal)}
            </span>
        );
    };

    const totalTaxRender = (val: unknown, row: DynamicTaxRow): React.ReactNode => {
        const displayVal = typeof val === 'string' || typeof val === 'number' ? val : '';
        return (
            <span className={cn(
                "font-mono pr-2",
                row.isTotal ? "text-blue-950 font-black" : "text-slate-800 font-extrabold"
            )}>
                {displayVal}
            </span>
        );
    };

    const taxesLabelRender = (val: unknown, row: DynamicTaxRow): React.ReactNode => {
        const displayVal = typeof val === 'string' || typeof val === 'number' ? val : '';
        return (
            <span className={cn(
                "font-sans font-bold",
                row.isTotal ? "text-blue-900" : row.isAdditional ? "text-sky-700" : "text-gray-500"
            )}>
                {displayVal}
            </span>
        );
    };

    // Generate dynamic columns from tax data
    const detailedTaxesColumns: Column<DynamicTaxRow>[] = [
        { 
            key: 'taxes', 
            label: 'Taxes', 
            width: '140px', 
            align: 'left', 
            render: taxesLabelRender
        },
        ...taxColumns.map((col) => ({
            key: col.key,
            label: col.label,
            width: '100px',
            align: 'center' as const,
            render: numericTaxRender
        })),
        { 
            key: 'totalTax', 
            label: 'Total Tax (₹)', 
            width: '120px', 
            align: 'right' as const, 
            headerClassName: 'bg-slate-100 font-black text-right pr-3', 
            render: totalTaxRender
        }
    ];

    // Transform tax rows to table format
    const detailedTaxesData: DynamicTaxRow[] = taxRows.map((row) => {
        const rowData: DynamicTaxRow = {
            taxes: row.label,
            totalTax: formatCurrency(row.totalTax),
            isTotal: row.rowType === 'total',
            isAdditional: row.rowType === 'additional',
        };
        
        // Add each tax column value
        Object.entries(row.taxes).forEach(([key, value]) => {
            rowData[key] = value;
        });
        
        return rowData;
    });

    // ============================================
    // SUMMARY CARDS DATA (Calculated from tax data)
    // ============================================

    // Calculate summary from floor details and tax data
    const calculateTotalArea = (floors: MappedFloorDetail[]) => 
        floors.reduce((sum, f) => sum + (f.carpetAreaSqM || 0), 0);

    const oldTotalArea = calculateTotalArea(oldFloorDetails);
    const newTotalArea = calculateTotalArea(newFloorDetails);
    const areaDiff = newTotalArea - oldTotalArea;

    const oldTotalRV = oldFloorDetails.reduce((sum, f) => sum + (f.rv || 0), 0);
    const newTotalRV = newFloorDetails.reduce((sum, f) => sum + (f.rv || 0), 0);
    const rvDiff = newTotalRV - oldTotalRV;

    const oldTotalTax = taxRows.find(r => r.rowType === 'old')?.totalTax || 0;
    const newTotalTax = taxRows.find(r => r.rowType === 'total')?.totalTax || 0;
    const taxDiff = newTotalTax - oldTotalTax;

    // Determine if use type changed
    const oldUses = [...new Set(oldFloorDetails.map(f => f.use))].join(', ') || 'N/A';
    const newUses = [...new Set(newFloorDetails.map(f => f.use))].join(', ') || 'N/A';
    const useChanged = oldUses !== newUses;

    const summaryCardsData = [
        {
            label: 'Carpet Area',
            oldValue: `${oldTotalArea.toFixed(2)}`,
            newValue: `${newTotalArea.toFixed(2)}`,
            difference: `${areaDiff >= 0 ? '+' : ''}${areaDiff.toFixed(2)}`,
            unit: 'm²',
            color: 'sky' as const
        },
        {
            label: 'Type of Use',
            oldValue: oldUses.length > 20 ? oldUses.substring(0, 20) + '...' : oldUses,
            newValue: newUses.length > 20 ? newUses.substring(0, 20) + '...' : newUses,
            difference: useChanged ? 'CHANGED' : 'SAME',
            unit: 'Type',
            color: 'purple' as const
        },
        {
            label: 'RV',
            oldValue: formatCurrency(oldTotalRV),
            newValue: formatCurrency(newTotalRV),
            difference: `${rvDiff >= 0 ? '+' : ''}${formatCurrency(rvDiff)}`,
            unit: '₹',
            color: 'amber' as const
        },
        {
            label: 'Total Tax',
            oldValue: formatCurrency(oldTotalTax),
            newValue: formatCurrency(newTotalTax),
            difference: `${taxDiff >= 0 ? '+' : ''}${formatCurrency(taxDiff)}`,
            unit: '₹',
            color: 'emerald' as const
        }
    ];

    // ============================================
    // RENDER
    // ============================================

    // Show error state
    if (error) {
        return (
            <div className="w-full bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-500" />
                    <div>
                        <p className="text-sm font-semibold">Error Loading Reassessment Data</p>
                        <p className="text-sm mt-0.5">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="w-full bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading reassessment data...</span>
                </div>
            </div>
        );
    }

    // Show empty state if no data
    if (oldFloorDetails.length === 0 && newFloorDetails.length === 0 && taxRows.length === 0) {
        return (
            <div className="w-full bg-[#f8fafc] p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-center py-12 text-gray-500">
                    <FileText className="h-6 w-6 mr-2" />
                    <span>No reassessment data available</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#f8fafc] p-4 flex flex-col gap-6 rounded-xl border border-gray-200">

            {/* ==========================================
                TOP PANELS CONTAINER
                ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ==========================================
                    LEFT PANEL: Municipal Registration
                    ========================================== */}
                <div className="bg-white rounded-xl shadow-md border border-sky-100 overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 px-4 py-3 flex justify-between items-center">
                        <h3 className="font-bold text-sky-900 text-sm md:text-base flex items-center gap-2">
                            <Layers className="h-4 w-4 text-sky-600" />
                            Details as per Municipal Corp. Registration
                        </h3>
                    </div>

                    <div className="p-4 flex flex-col gap-4 flex-grow">
                        {/* Photos */}
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 mb-2">Photograph as per Municipal Corp. Registration</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {(() => {
                                    const oldPropertyPhoto = photos.find(p => p.type === 'OLD_PROPERTY_PHOTO');
                                    const oldPlanPhoto = photos.find(p => p.type === 'OLD_PLAN_PHOTO');
                                    return (
                                        <>
                                            <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-100 flex items-center justify-center">
                                                {oldPropertyPhoto ? (
                                                    <ImageWithFallback 
                                                        src={`/api/documents/${oldPropertyPhoto.documentGuid}/view`}
                                                        alt="Old Property Photo"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Old Property Photo</span>
                                                )}
                                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Old Property Photo</div>
                                            </div>
                                            <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-[#0f2342] flex items-center justify-center">
                                                {oldPlanPhoto ? (
                                                    <ImageWithFallback 
                                                        src={`/api/documents/${oldPlanPhoto.documentGuid}/view`}
                                                        alt="Old Plan Photo"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-gray-300 text-xs">Old Plan Photo</span>
                                                )}
                                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Old Plan Photo</div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Old Floor Details */}
                        <OldFloorDetails
                            data={oldFloorDetails}
                            isAutoScrolling={isOldAutoScrolling}
                            onToggleAutoScroll={() => setIsOldAutoScrolling(!isOldAutoScrolling)}
                        />
                    </div>
                </div>

                {/* ==========================================
                    RIGHT PANEL: New Survey
                    ========================================== */}
                <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-4 py-3 flex justify-between items-center">
                        <h3 className="font-bold text-blue-900 text-sm md:text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            Details as per New Survey
                        </h3>
                    </div>

                    <div className="p-4 flex flex-col gap-4 flex-grow">
                        {/* Photos */}
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 mb-2">Photograph as per New Survey</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {(() => {
                                    const newPropertyPhoto = photos.find(p => p.type === 'NEW_PROPERTY_PHOTO');
                                    const newPlanPhoto = photos.find(p => p.type === 'NEW_PLAN_PHOTO');
                                    return (
                                        <>
                                            <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-100 flex items-center justify-center">
                                                {newPropertyPhoto ? (
                                                    <ImageWithFallback 
                                                        src={`/api/documents/${newPropertyPhoto.documentGuid}/view`}
                                                        alt="New Property Photo"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">New Property Photo</span>
                                                )}
                                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">New Property Photo</div>
                                            </div>
                                            <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-150 flex items-center justify-center">
                                                {newPlanPhoto ? (
                                                    <ImageWithFallback 
                                                        src={`/api/documents/${newPlanPhoto.documentGuid}/view`}
                                                        alt="New Plan Photo"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">New Plan Photo</span>
                                                )}
                                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">New Plan Photo</div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* New Floor Details */}
                        <NewFloorDetails
                            data={newFloorDetails}
                            isAutoScrolling={isNewAutoScrolling}
                            onToggleAutoScroll={() => setIsNewAutoScrolling(!isNewAutoScrolling)}
                        />
                    </div>
                </div>

            </div>

            {/* ==========================================
                BOTTOM PANEL: Tax Details & Reassessment Summary
                ========================================== */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-sky-950 text-base flex items-center gap-2">
                        <FileText className="h-5 w-5 text-sky-600" />
                        Tax Details & Reassessment Summary
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowRetroModal(true)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-98 transition-all shadow-sm"
                        >
                            <Clock className="h-3.5 w-3.5" />
                            Retrospective Details
                        </button>
                        <button
                            onClick={() => setShowSec129Modal(true)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-98 transition-all shadow-sm"
                        >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            Section 129 Progressive Calc
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <TaxSummaryCards cards={summaryCardsData} />

                {/* Detailed Taxes Table Grid - Dynamic */}
                {detailedTaxesData.length > 0 && (
                <div className="min-w-0">
                    <MasterTable
                        columns={detailedTaxesColumns}
                        data={detailedTaxesData}
                        paginationConfig={{ enabled: false }}
                        tableClassName="w-full border-collapse text-left text-xs"
                        theadClassName="bg-slate-50 text-slate-900 font-bold border-b border-gray-200 text-center [&_th]:whitespace-nowrap [&_th]:p-3 [&_th]:border-r [&_th]:border-gray-200"
                        rowClassName={(row) => cn(
                            "divide-y divide-gray-200 text-gray-700 font-semibold [&_td]:p-1.5 [&_td]:border-r [&_td]:border-gray-200",
                            row.isTotal ? "bg-blue-50 [&_td]:border-blue-100" : "hover:bg-slate-50/50"
                        )}
                    />
                </div>
                )}
            </div>

            {/* ==========================================
                MODALS
                ========================================== */}

            {/* Retrospective Tax Details Modal */}
            <RetrospectiveTaxModal
                open={showRetroModal}
                onClose={() => setShowRetroModal(false)}
                columns={retrospectiveTaxColumns}
                rows={retrospectiveTaxRows}
                error={retrospectiveError}
            />

            {/* Section 129 Progressive Calc Modal */}
            <Section129Modal
                open={showSec129Modal}
                onClose={() => setShowSec129Modal(false)}
            />
        </div>
    );
}