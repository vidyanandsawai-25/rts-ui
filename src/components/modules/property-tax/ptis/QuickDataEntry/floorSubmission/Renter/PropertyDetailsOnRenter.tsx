'use client';
import React from 'react';

import { Label } from "@/components/common/label";
import { Building2 } from "lucide-react";
import { useTranslations } from 'next-intl';

interface PropertyInfo {
    propertyName?: string;
    floorNumber?: string;
    zone?: string;
}

export const PropertyDetailsOnRenter = React.memo(({ propertyInfo }: { propertyInfo?: PropertyInfo }) => {
    const t = useTranslations('quickDataEntry');
    const displayInfo = {
        propertyName: (propertyInfo?.propertyName && propertyInfo.propertyName.trim() !== '/') 
            ? propertyInfo.propertyName 
            : "-",
        floorNumber: propertyInfo?.floorNumber || "-",
        zone: propertyInfo?.zone || "-",
    };

    return (
        <div className="flex items-center justify-between gap-6 flex-1">
            {/* Property Info Badges - Compact */}
            <div className="flex items-center gap-6">
                {/* Property */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md ring-2 ring-white">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <Label className="text-[8px] text-indigo-500 font-bold uppercase tracking-widest block">
                            {t('floor.renterSection.property')}
                        </Label>
                        <div className="text-xs font-bold text-gray-900 leading-tight">
                            {displayInfo.propertyName}
                        </div>
                    </div>
                </div>

                {/* Floor */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md ring-2 ring-white">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <Label className="text-[8px] text-teal-600 font-bold uppercase tracking-widest block">
                            {t('floor.renterSection.floor')}
                        </Label>
                        <div className="text-xs font-bold text-gray-900 leading-tight">
                            {displayInfo.floorNumber}
                        </div>
                    </div>
                </div>

                {/* Zone */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-md ring-2 ring-white">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <Label className="text-[8px] text-orange-500 font-bold uppercase tracking-widest block">
                            {t('floor.renterSection.zone')}
                        </Label>
                        <div className="text-xs font-bold text-gray-900 leading-tight">
                            {displayInfo.zone}
                        </div>
                    </div>
                </div>
            </div>

            {/* Title - Right Side */}
            <div className="flex flex-col gap-1 items-end min-w-[200px]">
                <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 shrink-0">
                    {t('floor.renterSection.renterPropertyDetails')}
                </div>
            </div>
        </div>
    );
});

PropertyDetailsOnRenter.displayName = 'PropertyDetailsOnRenter';
