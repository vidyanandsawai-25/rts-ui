'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, Building2, FileText } from 'lucide-react';
import { Drawer } from '@/components/common/Drawer';

// Users, Layers, Percent, Building,

interface Tab {
    label: string;
    href: string;        // segment key, e.g. "Property"
    icon: React.ElementType;
}

const TABS: Tab[] = [
    { label: 'Property', href: 'Property', icon: Home },
    { label: 'Society', href: 'Society', icon: Building2 }
];

interface DrawerShellProps {
    children: React.ReactNode;
    locale: string;
}

export default function DrawerShell({ children, locale }: DrawerShellProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
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

    const handleClose = () => {
        const query = new URLSearchParams();
        if (wardNo) query.set('wardNo', wardNo);
        if (propertyNo) query.set('propertyNo', propertyNo);
        if (partitionNo) query.set('partitionNo', partitionNo);
        if (propertyId) query.set('propertyId', propertyId);

        const queryString = query.toString();
        router.push(`/${locale}/property-tax/ptis${queryString ? `?${queryString}` : ''}`);
    };

    const drawerTitle = (
        <div className="flex flex-col">
            <h2 className="text-[15px] font-bold leading-tight flex items-center gap-2 text-white">
                <FileText className="w-4 h-4 text-white" />
                {tCommon('app.assessmentSystem')}
            </h2>
            <div className="text-[10px] text-white mt-1 flex items-center gap-1 font-medium opacity-90">
                <span>{t('roomSubmission.info.ward')}: {wardNo || '—'}</span>
                <span className="mx-1">•</span>
                <span>{t('roomSubmission.info.property')}: {propertyNo || '—'}</span>
                <span className="mx-1">•</span>
                <span>{t('roomSubmission.info.partition')}: {partitionNo || '—'}</span>
            </div>
        </div>
    );

    return (
        <div className="quick-data-drawer-root">

            <style dangerouslySetInnerHTML={{
                __html: `
                .quick-data-drawer-root div.fixed.right-0 {
                    width: 97vw !important;
                }
                @media (min-width: 768px) {
                    .quick-data-drawer-root div.fixed.right-0 {
                        width: 1000px !important;
                    }
                }
                @media (min-width: 1024px) {
                    .quick-data-drawer-root div.fixed.right-0 {
                        width: 1100px !important;
                    }
                }
                @media (min-width: 1280px) {
                    .quick-data-drawer-root div.fixed.right-0 {
                        width: 1200px !important;
                    }
                }

                .quick-data-drawer-root div.fixed.right-0 > div:first-child {
                    background-color: #2563eb !important;
                    border-bottom: 1px solid #1d4ed8 !important;
                    padding-top: 10px !important;
                    padding-bottom: 10px !important;
                    display: flex !important;
                    align-items: center !important;
                }
                .quick-data-drawer-root div.fixed.right-0 > div:first-child h2 {
                    color: white !important;
                }
                .quick-data-drawer-root div.fixed.right-0 > div:first-child button {
                    color: white !important;
                    opacity: 0.8;
                }
                .quick-data-drawer-root div.fixed.right-0 > div:first-child button:hover {
                    opacity: 1;
                    background-color: rgba(255, 255, 255, 0.1) !important;
                }
                .quick-data-drawer-root div.fixed.right-0 > div:first-child .flex.items-start.gap-3 {
                    align-items: center !important;
                }
            `}} />

            <Drawer
                open={true}
                onClose={handleClose}
                title={!isRenterPage ? drawerTitle : null}
                width="xl"
            >
                {/* <div className="flex flex-col h-full bg-[#f4f7fe]"> */}
                <div className='bg-white border-slate-300 shadow-sm overflow-x-auto no-scrollbar'>
                    {!isRenterPage && (
                        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
                            <nav className="flex md:grid w-full grid-cols-7 gap-2">
                                {TABS.map((tab) => {
                                    const isActive = activeSegment === tab.href || pathname === `/${tab.href}`;
                                    const Icon = tab.icon;

                                    let activeStyles = '';
                                    switch (tab.href) {
                                        case 'Property': activeStyles = 'bg-blue-600 text-white border-blue-700 shadow-blue-100'; break;
                                        case 'Kyc': activeStyles = 'bg-green-600 text-white border-green-700 shadow-green-100'; break;
                                        case 'Society': activeStyles = 'bg-purple-600 text-white border-purple-700 shadow-purple-100'; break;
                                        case 'Building': activeStyles = 'bg-orange-600 text-white border-orange-700 shadow-orange-100'; break;
                                        case 'FloorSubmission': activeStyles = 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-100'; break;
                                        case 'Discount': activeStyles = 'bg-cyan-600 text-white border-cyan-700 shadow-cyan-100'; break;
                                        case 'OldDetails': activeStyles = 'bg-slate-600 text-white border-slate-700 shadow-slate-100'; break;
                                        default: activeStyles = 'bg-gray-600 text-white border-gray-700 shadow-gray-100';
                                    }

                                    return (
                                        <Link
                                            key={tab.href}
                                            href={`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/${tab.href}?${queryString}`}
                                            shallow={true}
                                            className={[
                                                'inline-flex gap-1 px-2 py-2 text-[11px] rounded-md border font-semibold transition-all hover:shadow-md',
                                                isActive
                                                    ? `${activeStyles} shadow-md`
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            ].join(' ')}
                                        >
                                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                            <span className="whitespace-nowrap">{tab.label}</span>
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
            </Drawer>
        </div>
    );
}