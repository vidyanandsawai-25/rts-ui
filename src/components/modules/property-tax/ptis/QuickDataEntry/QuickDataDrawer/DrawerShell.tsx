'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
// import { closeDrawer } from '@/app/[locale]/property-tax/ptis/actions';
import {
    Home,
    Users,
    Building2,
    Layers,
    Percent,
    FileText,
    Building,
    X,
} from 'lucide-react';

interface Tab {
    label: string;
    href: string;        // segment key, e.g. "Property"
    icon: React.ElementType;
}

const TABS: Tab[] = [
    { label: 'Property', href: 'Property', icon: Home },
    { label: 'KYC', href: 'Kyc', icon: Users },
    { label: 'Society', href: 'Society', icon: Building2 },
    { label: 'Building Permission', href: 'Building', icon: Building },
    { label: 'Floor', href: 'FloorSubmission', icon: Layers },
    { label: 'Discount', href: 'Discount', icon: Percent },
    { label: 'Old Details', href: 'OldDetails', icon: FileText },
];

interface DrawerShellProps {
    children: React.ReactNode;
    locale: string;
}

export default function DrawerShell({ children, locale }: DrawerShellProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations("quickDataEntry");
    const tCommon = useTranslations("common");

    const wardNo = searchParams.get('wardNo') ?? '';
    const propertyNo = searchParams.get('propertyNo') ?? '';
    const partitionNo = searchParams.get('partitionNo') ?? '';
    const propertyId = searchParams.get('propertyId') ?? '';

    const queryString = new URLSearchParams({ propertyId, wardNo, propertyNo, partitionNo, }).toString();

    // Determine which segment is active
    const activeSegment = pathname.split('/').pop() ?? '';

    // Hide header and tabs on Renter page
    const isRenterPage = pathname.includes('/Renter');

    return (
        <>
            {/* Overlay — clicking it closes the drawer */}
            <form
                // action={closeDrawer} 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="wardNo" value={wardNo} />
                <input type="hidden" name="propertyNo" value={propertyNo} />
                <input type="hidden" name="partitionNo" value={partitionNo} />
                <input type="hidden" name="propertyId" value={propertyId} />
                <button type="submit" className="w-full h-full cursor-default" aria-label="Close drawer" />
            </form>

            <div className="fixed top-0 right-0 h-full w-full md:w-[90%] lg:w-[1200px] bg-white shadow-2xl z-[70] flex flex-col">

                {!isRenterPage && (
                    <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between border-b border-blue-700 shadow-md">
                        <div>
                            <h2 className="text-base font-semibold leading-tight flex items-center gap-1">
                                <FileText className="w-4 h-4 opacity-80" />
                                {tCommon('app.assessmentSystem')}
                            </h2>
                            {/* Breadcrumb - Correcting to show actual values */}
                            <p className="text-xs text-blue-200 mt-0.5 flex items-center gap-1">
                                <span>{t('roomSubmission.info.ward')}: {wardNo || '—'}</span>
                                •
                                <span>{t('roomSubmission.info.property')}: {propertyNo || '—'}</span>
                                •
                                <span>{t('roomSubmission.info.partition')}: {partitionNo || '—'}</span>
                            </p>
                        </div>

                        {/* Close button */}
                        <form
                        // action={closeDrawer}
                        >
                            <input type="hidden" name="locale" value={locale} />
                            <input type="hidden" name="wardNo" value={wardNo} />
                            <input type="hidden" name="propertyNo" value={propertyNo} />
                            <input type="hidden" name="partitionNo" value={partitionNo} />
                            <input type="hidden" name="propertyId" value={propertyId} />
                            <button
                                type="submit"
                                className="text-white/80 hover:text-white hover:bg-white/10 rounded p-1 transition-colors"
                                aria-label={tCommon('buttons.close')}
                            >
                                <X size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {!isRenterPage && (
                    <div className="bg-white border-b-2 border-slate-300 px-3 py-2 shadow-sm overflow-x-auto no-scrollbar">
                        <nav className="flex md:grid w-full grid-cols-7 gap-1.5 h-auto p-1 rounded-lg">
                            {TABS.map((tab) => {
                                // const isActive = activeSegment === tab.href || pathname === `${baseDrawerPath}/${tab.href}`;
                                const isActive = activeSegment === tab.href || pathname === `/${tab.href}`;
                                const Icon = tab.icon;

                                // Set gradient colors per tab
                                let gradientClass = '';
                                switch (tab.href) {
                                    case 'Property':
                                        gradientClass = 'from-blue-500 to-blue-600 border-blue-700';
                                        break;
                                    case 'Kyc':
                                        gradientClass = 'from-green-500 to-green-600 border-green-700';
                                        break;
                                    case 'Society':
                                        gradientClass = 'from-purple-500 to-purple-600 border-purple-700';
                                        break;
                                    case 'Building':
                                        gradientClass = 'from-orange-500 to-orange-600 border-orange-700';
                                        break;
                                    case 'FloorSubmission':
                                        gradientClass = 'from-indigo-500 to-indigo-600 border-indigo-700';
                                        break;
                                    case 'Discount':
                                        gradientClass = 'from-cyan-500 to-cyan-600 border-cyan-700';
                                        break;
                                    case 'OldDetails':
                                        gradientClass = 'from-slate-500 to-slate-600 border-slate-700';
                                        break;
                                    default:
                                        gradientClass = 'from-gray-500 to-gray-600 border-gray-700';
                                }

                                return (
                                    <Link
                                        key={tab.href}
                                        href={`${tab.href}?${queryString}`}
                                        shallow={true} // Next.js 13 App Router: preserves layout & only updates segment
                                        className={[
                                            'inline-flex items- gap-1 px-2 py-2 text-[11px] rounded-md border font-semibold transition-all hover:shadow-md',
                                            isActive
                                                ? `bg-gradient-to-br ${gradientClass} text-white shadow-lg`
                                                : 'bg-white text-gray-600 border-gray-300'
                                        ].join(' ')}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </>
    );
}
