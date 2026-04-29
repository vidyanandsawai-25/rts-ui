'use client'

import Link from 'next/link';
import { usePathname, useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Building2, Home } from 'lucide-react';
import { Tab } from '@/types/property-basic-details.types';

const TABS: Tab[] = [
    { label: 'Property', href: 'Property', icon: Home },
    { label: 'Society', href: 'Society', icon: Building2 },
    { label: 'OldDetails', href: 'OldDetails/old-taxation', icon: Building2 },
];

const TAB_GRADIENT_CLASSES: Record<string, string> = {
    Property: 'from-blue-500 to-blue-600 border-blue-700',
    Society: 'from-purple-500 to-purple-600 border-purple-700',
    OldDetails: 'from-purple-500 to-purple-600 border-purple-700',
};

export function TabNavigation() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const routeParams = useParams();
    const t = useTranslations("quickDataEntry");

    const locale = (routeParams.locale as string) || 'en';
    const propertyId = (routeParams.propertyId as string) || searchParams.get('propertyId') || "";
    const wardNo = searchParams.get("wardNo") || "";
    const wardId = searchParams.get("wardId") || "";
    const propertyNo = searchParams.get("propertyNo") || "";
    const partitionNo = searchParams.get("partitionNo") || "";

    const activeSegment = pathname.split('/').pop() ?? '';

    const params = new URLSearchParams();
    if (propertyId) params.set('propertyId', propertyId);
    if (wardNo) params.set('wardNo', wardNo);
    if (wardId) params.set('wardId', wardId);
    if (propertyNo) params.set('propertyNo', propertyNo);
    if (partitionNo) params.set('partitionNo', partitionNo);

    const queryString = params.toString();

    return (
        <div className="bg-white border-b-2 border-slate-300 px-3 py-2 shadow-sm overflow-x-auto no-scrollbar">
            <nav className="flex md:grid w-full grid-cols-7 gap-1.5 h-auto p-1 rounded-lg">
                {TABS.map((tab) => {
                    const baseTabPath = `/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}`;
                    const tabPath = `${baseTabPath}/${tab.href}`;
                    const tabHref = queryString ? `${tabPath}?${queryString}` : tabPath;
                    const isActive = activeSegment === tab.href || pathname === tabPath;
                    const Icon = tab.icon;

                    const gradientClass =
                        TAB_GRADIENT_CLASSES[tab.href] ?? 'from-gray-500 to-gray-600 border-gray-700';

                    return (
                        <Link
                            key={tab.href}
                            href={tabHref}
                            className={[
                                'inline-flex items-center gap-1 px-2 py-2 text-[11px] rounded-md border font-semibold transition-all hover:shadow-md',
                                isActive
                                    ? `bg-linear-to-br ${gradientClass} text-white shadow-lg`
                                    : 'bg-white text-gray-600 border-gray-300'
                            ].join(' ')}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{t(`tabs.${tab.label}`)}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}