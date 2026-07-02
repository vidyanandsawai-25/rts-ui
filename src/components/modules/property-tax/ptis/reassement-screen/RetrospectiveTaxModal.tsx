'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';

interface RetroTaxRow extends Record<string, unknown> {
    financeYear: string;
    days: number;
    generalTax: number;
    waterTax: number;
    waterBenefit: number;
    sewerageTax: number;
    spEduTax: number;
    employeeTax: number;
    treeTax: number;
    fireTax: number;
    lightTax: number;
    drainageTax: number;
    total: number;
}

interface RetrospectiveTaxModalProps {
    open: boolean;
    onClose: () => void;
    data?: RetroTaxRow[];
}

// Default mock data
const defaultRetroTaxData: RetroTaxRow[] = [
    {
        financeYear: '2016-17',
        days: 76,
        generalTax: 104,
        waterTax: 16,
        waterBenefit: 8,
        sewerageTax: 12,
        spEduTax: 21,
        employeeTax: 10,
        treeTax: 5,
        fireTax: 6,
        lightTax: 7,
        drainageTax: 9,
        total: 198
    },
    ...Array.from({ length: 8 }, (_, i) => {
        const startYear = 2017 + i;
        const endYear = 18 + i;
        const endYearStr = String(endYear).padStart(2, '0');
        return {
            financeYear: `${startYear}-${endYearStr}`,
            days: 365,
            generalTax: 500,
            waterTax: 75,
            waterBenefit: 40,
            sewerageTax: 60,
            spEduTax: 100,
            employeeTax: 50,
            treeTax: 25,
            fireTax: 30,
            lightTax: 35,
            drainageTax: 45,
            total: 960
        };
    })
];

const retroTaxColumns: Column<RetroTaxRow>[] = [
    { 
        key: 'financeYear', 
        label: 'Finance Year', 
        width: '100px', 
        align: 'center', 
        cellClassName: 'font-bold text-slate-800' 
    },
    { 
        key: 'days', 
        label: 'Days', 
        width: '60px', 
        align: 'center' 
    },
    { 
        key: 'generalTax', 
        label: 'General Tax', 
        width: '90px', 
        align: 'center' 
    },
    { 
        key: 'waterTax', 
        label: 'Water Tax', 
        width: '90px', 
        align: 'center' 
    },
    { 
        key: 'waterBenefit', 
        label: 'Water Benefit', 
        width: '100px', 
        align: 'center' 
    },
    { 
        key: 'sewerageTax', 
        label: 'Sewerage Tax', 
        width: '100px', 
        align: 'center' 
    },
    { 
        key: 'spEduTax', 
        label: 'Sp. Edu Tax', 
        width: '90px', 
        align: 'center' 
    },
    { 
        key: 'employeeTax', 
        label: 'Employee Tax', 
        width: '100px', 
        align: 'center' 
    },
    { 
        key: 'treeTax', 
        label: 'Tree Tax', 
        width: '70px', 
        align: 'center' 
    },
    { 
        key: 'fireTax', 
        label: 'Fire Tax', 
        width: '75px', 
        align: 'center' 
    },
    { 
        key: 'lightTax', 
        label: 'Light Tax', 
        width: '75px', 
        align: 'center' 
    },
    { 
        key: 'drainageTax', 
        label: 'Drainage Tax', 
        width: '90px', 
        align: 'center' 
    },
    { 
        key: 'total', 
        label: 'Total', 
        width: '90px', 
        align: 'right', 
        headerClassName: 'bg-sky-50/50 font-extrabold text-sky-950 pr-3', 
        cellClassName: 'bg-sky-50/20 font-black text-sky-900 pr-3' 
    }
];

export function RetrospectiveTaxModal({ 
    open, 
    onClose, 
    data = defaultRetroTaxData 
}: RetrospectiveTaxModalProps) {
    const modalFooter = (
        <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
        >
            Close
        </button>
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Retrospective Tax Details"
            subtitle="Historical tax assessment data"
            maxWidth="2xl"
            footer={modalFooter}
        >
            <div className="border border-sky-100 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-sky-50 text-sky-900 font-bold px-4 py-2 border-b border-sky-100 text-center text-sm flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-sky-600" />
                    Retrospective Tax Details Table
                </div>
                <div className="min-w-0">
                    <MasterTable
                        columns={retroTaxColumns}
                        data={data}
                        paginationConfig={{ enabled: false }}
                        tableClassName="w-full border-collapse text-xs text-center font-mono"
                        theadClassName="bg-slate-50 font-bold text-slate-800 border-b border-sky-100 [&_th]:p-2 [&_th]:border-r [&_th]:border-sky-100"
                        rowClassName={() => "hover:bg-slate-50/50 [&_td]:p-2 [&_td]:border-r [&_td]:border-sky-100"}
                        height="xs"
                    />
                </div>
            </div>
        </Modal>
    );
}