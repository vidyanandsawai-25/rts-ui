'use client';

import React from 'react';
import { RotateCw } from 'lucide-react';

interface SummaryCardData {
    label: string;
    oldValue: string | number;
    newValue: string | number;
    difference: string | number;
    unit?: string;
    color: 'sky' | 'purple' | 'amber' | 'emerald';
}

interface TaxSummaryCardsProps {
    cards: SummaryCardData[];
}

const colorMap = {
    sky: {
        bg: 'bg-gradient-to-br from-sky-50 to-sky-100/50',
        ring: 'ring-sky-200/50',
        text: 'text-sky-600',
        dot: 'from-sky-400 to-sky-600',
        shadow: 'shadow-sky-200'
    },
    purple: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
        ring: 'ring-purple-200/50',
        text: 'text-purple-600',
        dot: 'from-purple-400 to-purple-600',
        shadow: 'shadow-purple-200'
    },
    amber: {
        bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
        ring: 'ring-amber-200/50',
        text: 'text-amber-600',
        dot: 'from-amber-400 to-amber-600',
        shadow: 'shadow-amber-200'
    },
    emerald: {
        bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
        ring: 'ring-emerald-200/50',
        text: 'text-emerald-600',
        dot: 'from-emerald-400 to-emerald-600',
        shadow: 'shadow-emerald-200'
    }
};

export function TaxSummaryCards({ cards }: TaxSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card, index) => {
                const colors = colorMap[card.color];
                const isPositive = typeof card.difference === 'string' 
                    ? !card.difference.includes('-') 
                    : card.difference >= 0;
                
                // Check if this is the "Use" card with CHANGED status
                const isChangedStatus = card.label === 'Use' && card.difference === 'CHANGED';

                return (
                    <div 
                        key={index}
                        className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300/90"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${colors.dot} shadow-sm ${colors.shadow}`} />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    {card.label}
                                </span>
                            </div>
                            {card.unit && (
                                <span className="rounded-md bg-slate-100/80 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/50">
                                    {card.unit}
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <div className="grid min-h-[80px] grid-cols-2 overflow-hidden rounded-lg border border-slate-200/80 shadow-inner">
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 px-3 pt-2.5 pb-5 transition-colors duration-200 group-hover:from-slate-100">
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Old</div>
                                    <div className="mt-1.5 text-[15px] font-medium leading-none text-slate-500">
                                        {card.oldValue}
                                    </div>
                                </div>

                                <div className={`${colors.bg} px-3 pt-2.5 pb-5 text-right ring-1 ring-inset ${colors.ring} transition-colors duration-200`}>
                                    <div className={`text-[9px] font-bold uppercase tracking-wider ${colors.text}`}>New</div>
                                    <div className="mt-1.5 text-[15px] font-bold leading-none text-slate-700">
                                        {card.newValue}
                                    </div>
                                </div>
                            </div>

                            <div className="absolute left-1/2 bottom-1 -translate-x-1/2">
                                <span className={`inline-flex items-center gap-1.5 rounded-md border ${isPositive ? 'border-emerald-200 bg-emerald-50/90 text-emerald-600' : 'border-purple-200 bg-purple-50/90 text-purple-700'} px-2.5 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-sm transition-colors duration-200`}>
                                    {isChangedStatus ? (
                                        <RotateCw className="h-3 w-3" />
                                    ) : (
                                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d={isPositive ? "M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" : "M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"} />
                                        </svg>
                                    )}
                                    {card.difference}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}