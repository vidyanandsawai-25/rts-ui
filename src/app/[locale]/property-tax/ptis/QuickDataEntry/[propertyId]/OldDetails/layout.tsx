'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { ReceiptText, Layers3, Calculator } from 'lucide-react';

export default function OldDetailsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const params = useParams();

    const locale = params.locale as string;
    const propertyId = params.propertyId as string;
    const t = useTranslations('quickDataEntry');

    const sections = [
        {
            id: 'old-taxation',
            label: t('tabs.OldTaxation'),
            href: 'old-taxation',
            icon: ReceiptText,
            activeClass: 'from-blue-500 to-indigo-600 border-blue-600',
        },
        {
            id: 'floor-information',
            label: t('tabs.FloorInformation'),
            href: 'floor-information',
            icon: Layers3,
            activeClass: 'from-emerald-500 to-teal-600 border-emerald-600',
        },
        {
            id: 'taxation-breakdown',
            label: t('tabs.TaxationBreakdown'),
            href: 'taxation-breakdown',
            icon: Calculator,
            activeClass: 'from-orange-500 to-amber-600 border-orange-600',
        },
    ];

    return (
        <div className="flex h-full flex-col bg-white ">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 px-4 py-3 shadow-sm backdrop-blur">
                <nav className="flex flex-wrap gap-5">
                    {sections.map((section) => {
                        const Icon = section.icon;

                        const sectionPath = `/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/OldDetails/${section.href}`;

                        const isActive =
                            pathname === sectionPath || pathname.endsWith(`/${section.href}`);

                        return (
                            <Link
                                key={section.id}
                                href={sectionPath}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold transition-all duration-200',
                                    'hover:-translate-y-0.5 hover:shadow-md',
                                    isActive
                                        ? `bg-gradient-to-br ${section.activeClass} text-white shadow-md`
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

            <div className="flex-1 overflow-y-auto bg-white p-4">
                {children}
            </div>
        </div>
    );
}