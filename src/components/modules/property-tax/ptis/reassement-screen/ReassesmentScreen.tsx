'use client';

import { useState, useEffect, useRef } from 'react';
import {
    ArrowUpRight,
    TrendingUp,
    FileText,
    Clock,
    Layers
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import { RetrospectiveTaxModal } from './RetrospectiveTaxModal';
import { Section129Modal } from './Section129Modal';
import { OldFloorDetails } from './components/OldFloorDetails';
import { NewFloorDetails } from './components/NewFloorDetails';
import { TaxSummaryCards } from './components/TaxSummaryCards';

// ============================================
// INTERFACES
// ============================================

interface FloorDetail extends Record<string, unknown> {
    floor: string;
    conYear: string;
    asstYear: string;
    constType: string;
    use: string;
    carpetAreaSqFt: number;
    carpetAreaSqM: number;
    builtUpAreaSqFt: number;
    builtUpAreaSqM: number;
    rate: number;
    renter: string;
    taxLiability: string;
    rentMy: number;
    rentalValue: number;
    depreciation: number;
    alv: number;
    mr: number;
    rv: number;
    status?: 'Same' | 'Changed' | 'New';
    bgClass?: string;
}

interface TaxDetailRow extends Record<string, unknown> {
    taxes: string;
    generalTax: number;
    waterTax: number;
    waterBenefitTax: number;
    sewerageTax: number;
    spEduTax: number;
    employeeTax: number;
    treeTax: number;
    fireTax: number;
    lightTax: number;
    drainTax: number;
    totalTax: string;
    isTotal?: boolean;
    isAdditional?: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ReassesmentScreen() {
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
    // MOCK DATA
    // ============================================

    // Mock data for Old Floor Details
    const oldFloorDetails: FloorDetail[] = [
        {
            floor: 'G',
            conYear: '2000',
            asstYear: '2024',
            constType: 'A',
            use: 'Residential',
            carpetAreaSqFt: 500,
            carpetAreaSqM: 46.45,
            builtUpAreaSqFt: 650,
            builtUpAreaSqM: 60.39,
            rate: 850,
            renter: 'Self Occupied',
            taxLiability: '',
            rentMy: 0,
            rentalValue: 0,
            depreciation: 5000,
            alv: 45000,
            mr: 2250,
            rv: 42750
        },
        {
            floor: '1',
            conYear: '2000',
            asstYear: '2024',
            constType: 'A',
            use: 'Residential',
            carpetAreaSqFt: 300,
            carpetAreaSqM: 27.87,
            builtUpAreaSqFt: 400,
            builtUpAreaSqM: 37.16,
            rate: 750,
            renter: 'Ravi Kumar',
            taxLiability: 'Self',
            rentMy: 15000,
            rentalValue: 180000,
            depreciation: 3000,
            alv: 177000,
            mr: 8850,
            rv: 168150
        }
    ];

    // Mock data for New Floor Details
    const newFloorDetails: FloorDetail[] = [
        {
            floor: 'G',
            conYear: '2000',
            asstYear: '2024',
            constType: 'A',
            use: 'Residential',
            carpetAreaSqFt: 500,
            carpetAreaSqM: 46.45,
            builtUpAreaSqFt: 650,
            builtUpAreaSqM: 60.39,
            rate: 850,
            renter: 'Self Occupied',
            taxLiability: '',
            rentMy: 0,
            rentalValue: 0,
            depreciation: 5000,
            alv: 45000,
            mr: 2250,
            rv: 42750,
            status: 'Same',
            bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        },
        {
            floor: '1',
            conYear: '2000',
            asstYear: '2024',
            constType: 'A',
            use: 'Commercial',
            carpetAreaSqFt: 500,
            carpetAreaSqM: 46.45,
            builtUpAreaSqFt: 650,
            builtUpAreaSqM: 60.39,
            rate: 950,
            renter: 'Self Occupied',
            taxLiability: 'Self',
            rentMy: 25000,
            rentalValue: 300000,
            depreciation: 4000,
            alv: 296000,
            mr: 14800,
            rv: 281200,
            status: 'Changed',
            bgClass: 'bg-amber-50 text-amber-800 border-amber-200'
        },
        {
            floor: '2',
            conYear: '2024',
            asstYear: '2024',
            constType: 'A',
            use: 'Residential',
            carpetAreaSqFt: 250,
            carpetAreaSqM: 23.23,
            builtUpAreaSqFt: 320,
            builtUpAreaSqM: 29.73,
            rate: 900,
            renter: 'Self Occupied',
            taxLiability: 'Self',
            rentMy: 20000,
            rentalValue: 240000,
            depreciation: 2000,
            alv: 238000,
            mr: 11900,
            rv: 226100,
            status: 'New',
            bgClass: 'bg-rose-50 text-rose-800 border-rose-200'
        }
    ];

    // ============================================
    // DETAILED TAXES TABLE
    // ============================================

    // Helper renderers for Detailed Taxes Table Grid
    const numericTaxRender = (val: any, row: TaxDetailRow) => {
        return (
            <span className={cn(
                "font-mono",
                row.isTotal ? "text-blue-900" : row.isAdditional ? "text-sky-700" : ""
            )}>
                {val}
            </span>
        );
    };

    const totalTaxRender = (val: any, row: TaxDetailRow) => {
        return (
            <span className={cn(
                "font-mono pr-2",
                row.isTotal ? "text-blue-950 font-black" : "text-slate-800 font-extrabold"
            )}>
                {val}
            </span>
        );
    };

    const taxesLabelRender = (val: any, row: TaxDetailRow) => {
        return (
            <span className={cn(
                "font-sans font-bold",
                row.isTotal ? "text-blue-900" : row.isAdditional ? "text-sky-700" : "text-gray-500"
            )}>
                {val}
            </span>
        );
    };

    const detailedTaxesColumns: Column<TaxDetailRow>[] = [
        { 
            key: 'taxes', 
            label: 'Taxes', 
            width: '140px', 
            align: 'left', 
            render: taxesLabelRender
        },
        { 
            key: 'generalTax', 
            label: 'General Tax (₹)', 
            width: '95px', 
            align: 'center', 
            render: numericTaxRender
        },
        { 
            key: 'waterTax', 
            label: 'Water Tax (₹)', 
            width: '95px', 
            align: 'center', 
            render: numericTaxRender
        },
        { 
            key: 'waterBenefitTax', 
            label: 'Water Benefit Tax (₹)', 
            width: '125px', 
            align: 'center', 
            render: numericTaxRender
        },
        { 
            key: 'sewerageTax', 
            label: 'Sewerage Tax (₹)', 
            width: '110px', 
            align: 'center', 
            render: numericTaxRender
        },
        { 
            key: 'spEduTax', 
            label: 'Sp. Edu. Tax (₹)', 
            width: '105px', 
            align: 'center', 
            render: numericTaxRender
        },
        { 
            key: 'employeeTax', 
            label: 'Employee (₹)', 
            width: '100px', 
            align: 'center', 
            render: numericTaxRender
        },
        { 
            key: 'treeTax', 
            label: 'Tree (₹)', 
            width: '80px', 
            align: 'center', 
            render: numericTaxRender
        },
        { 
            key: 'fireTax', 
            label: 'Fire (₹)', 
            width: '80px', 
            align: 'center', 
            render: numericTaxRender
        },
        { 
            key: 'lightTax', 
            label: 'Light (₹)', 
            width: '80px', 
            align: 'center', 
            render: numericTaxRender
        },
        { 
            key: 'drainTax', 
            label: 'Drain (₹)', 
            width: '80px', 
            align: 'center', 
            render: numericTaxRender
        },
        { 
            key: 'totalTax', 
            label: 'Total Tax (₹)', 
            width: '100px', 
            align: 'right', 
            headerClassName: 'bg-slate-100 font-black text-right pr-3', 
            render: totalTaxRender
        }
    ];

    const detailedTaxesData: TaxDetailRow[] = [
        {
            taxes: 'Old Taxes',
            generalTax: 1000,
            waterTax: 150,
            waterBenefitTax: 80,
            sewerageTax: 120,
            spEduTax: 200,
            employeeTax: 100,
            treeTax: 50,
            fireTax: 50,
            lightTax: 75,
            drainTax: 90,
            totalTax: '1,915'
        },
        {
            taxes: 'Additional Revenue',
            generalTax: 500,
            waterTax: 75,
            waterBenefitTax: 40,
            sewerageTax: 60,
            spEduTax: 100,
            employeeTax: 50,
            treeTax: 25,
            fireTax: 30,
            lightTax: 35,
            drainTax: 45,
            totalTax: '960',
            isAdditional: true
        },
        {
            taxes: 'Total Tax',
            generalTax: 1500,
            waterTax: 225,
            waterBenefitTax: 120,
            sewerageTax: 180,
            spEduTax: 300,
            employeeTax: 150,
            treeTax: 75,
            fireTax: 80,
            lightTax: 110,
            drainTax: 135,
            totalTax: '2,875',
            isTotal: true
        }
    ];

    // ============================================
    // SUMMARY CARDS DATA (Original Design)
    // ============================================

    const summaryCardsData = [
        {
            label: 'Area',
            oldValue: '97.55',
            newValue: '150.51',
            difference: '+52.96',
            unit: 'm²',
            color: 'sky' as const
        },
        {
            label: 'Use',
            oldValue: 'Residential',
            newValue: 'Commercial',
            difference: 'CHANGED',
            unit: 'Type',
            color: 'purple' as const
        },
        {
            label: 'RV',
            oldValue: '₹210,900',
            newValue: '₹550,050',
            difference: '+₹339,150',
            unit: '₹',
            color: 'amber' as const
        },
        {
            label: 'Total Tax',
            oldValue: '₹222,000',
            newValue: '₹579,000',
            difference: '+₹357,000',
            unit: '₹',
            color: 'emerald' as const
        }
    ];

    // ============================================
    // RENDER
    // ============================================

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
                                <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-100">
                                    <img
                                        src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80"
                                        alt="Old Property Front"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Front View</div>
                                </div>
                                <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-[#0f2342]">
                                    <img
                                        src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgjDJ8MXn6JTzeP1HNLC4BUgUax6wNhHfZGFOcJNIY0oOlTO4F7PgzZRBQUky16pSvdpIUk0uZ8x10E8b0MiJ4GiyaSSXJmJYVBZ7kJDdLOIApmsqU9WMqRIfTf6_pX7eXh_af2_CbmXsi4VPhKoNkCy2p1AzuUM_1iP_MEDTnd0NU4GJdJNkOvx9VaY9o/s2482/PLAN_page-0001.jpg"
                                        alt="Old Blueprints"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Floor Plan</div>
                                </div>
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
                                <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-100">
                                    <img
                                        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80"
                                        alt="New Property"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">New View</div>
                                </div>
                                <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-150">
                                    <img
                                        src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQl0jsSf7-3Wv3SjTp0eBoxR6NXuu9bj8lDLoShgR9VS0IKCZVr3k5C77MlRnxx-A29pla-B5aWeJllEdBJTy2It-OXgxlBwQvnAEVgkOVN5RJDJ8UES8AbAYXOYTQPgblkkF44-lQDm5b9CFy4qrWzPXnZ8qJeQb0LTxXQlex5XM_Psz3y2w_tbdH4aI/s2482/PLAN_page-0001%20(1).jpg"
                                        alt="New Drafting"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Survey Plan</div>
                                </div>
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

                {/* Summary Cards - Original Design */}
                <TaxSummaryCards cards={summaryCardsData} />

                {/* Detailed Taxes Table Grid */}
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
            </div>

            {/* ==========================================
                MODALS
                ========================================== */}

            {/* Retrospective Tax Details Modal */}
            <RetrospectiveTaxModal
                open={showRetroModal}
                onClose={() => setShowRetroModal(false)}
            />

            {/* Section 129 Progressive Calc Modal */}
            <Section129Modal
                open={showSec129Modal}
                onClose={() => setShowSec129Modal(false)}
            />
        </div>
    );
}