'use client';

import Link from 'next/link';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { ReceiptText, Layers3, Calculator } from 'lucide-react';

interface Section {
    id: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    activeClass: string;
}

export function OldDetailsTabNav() {
    const pathname = usePathname();
    const params = useParams();
    const searchParams = useSearchParams();
    const t = useTranslations('quickDataEntry');

    const locale = params.locale as string;
    const propertyId = (params.propertyId as string) || "";
    
    // Get query parameters
    const wardNo = searchParams.get("wardNo") || "";
    const wardId = searchParams.get("wardId") || "";
    const propertyNo = searchParams.get("propertyNo") || "";
    const partitionNo = searchParams.get("partitionNo") || "";

    // Build query string
    const queryParams = new URLSearchParams();
    if (propertyId) queryParams.set('propertyId', propertyId);
    if (wardNo) queryParams.set('wardNo', wardNo);
    if (wardId) queryParams.set('wardId', wardId);
    if (propertyNo) queryParams.set('propertyNo', propertyNo);
    if (partitionNo) queryParams.set('partitionNo', partitionNo);

    const queryString = queryParams.toString();

    const sections: Section[] = [
        {
            id: 'old-taxation',
            label: t('tabs.OldTaxation'),
            href: 'old-taxation',
            icon: ReceiptText,
            activeClass: 'from-blue-500 to-blue-600 border-blue-700',
        },
        {
            id: 'floor-information',
            label: t('tabs.FloorInformation'),
            href: 'floor-information',
            icon: Layers3,
            activeClass: 'from-blue-500 to-blue-600 border-blue-700',
        },
        {
            id: 'taxation-breakdown',
            label: t('tabs.TaxationBreakdown'),
            href: 'taxation-breakdown',
            icon: Calculator,
            activeClass: 'from-blue-500 to-blue-600 border-blue-700',
        },
    ];

    return (
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 px-4 py-3 shadow-sm backdrop-blur">
            <nav className="flex flex-wrap gap-5">
                {sections.map((section) => {
                    const Icon = section.icon;

                    const sectionPath = `/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/OldDetails/${section.href}`;
                    const sectionHref = queryString ? `${sectionPath}?${queryString}` : sectionPath;

                    const isActive =
                        pathname === sectionPath || pathname.endsWith(`/${section.href}`);

                    return (
                        <Link
                            key={section.id}
                            href={sectionHref}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold transition-all duration-200',
                                'hover:-translate-y-0.5 hover:shadow-md',
                                isActive
                                    ? `bg-linear-to-br ${section.activeClass} text-white shadow-md`
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{section.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
