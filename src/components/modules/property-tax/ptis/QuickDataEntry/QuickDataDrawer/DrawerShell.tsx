'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
    Building2,
    FileText,
    Home,
    User,
    Building,
    Layers,
    Percent
} from 'lucide-react';
import { Drawer } from '@/components/common/Drawer';
import { cn } from '@/lib/utils/cn';

interface Tab {
    label: string;      // translation key in tabs namespace
    href: string;       // segment key, e.g. "Property"
    icon: React.ElementType;
}

const TABS: Tab[] = [
    { label: 'Property', href: 'Property', icon: Home },
    { label: 'Kyc', href: 'Kyc', icon: User },
    { label: 'Society', href: 'Society', icon: Building2 },
    { label: 'BuildingPermission', href: 'Building', icon: Building },
    { label: 'FloorSubmission', href: 'FloorSubmission', icon: Layers },
    { label: 'Discount', href: 'Discount', icon: Percent },
    { label: 'OldDetails', href: 'OldDetails', icon: FileText },
];

interface DrawerShellProps {
    children: React.ReactNode;
    locale: string;
}

export default function DrawerShell({ children, locale }: DrawerShellProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Scoped translations
    const t = useTranslations("quickDataEntry");
    const tTabs = useTranslations("quickDataEntry.tabs");
    const tCommon = useTranslations("common");

    const wardNo = searchParams.get('wardNo') ?? '';
    const propertyNo = searchParams.get('propertyNo') ?? '';
    const partitionNo = searchParams.get('partitionNo') ?? '';
    const propertyId = searchParams.get('propertyId') ?? '';

    const queryString = new URLSearchParams({
        propertyId,
        wardNo,
        propertyNo,
        partitionNo
    }).toString();

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
        <div className={cn(
            "[&_div.fixed.right-0]:!w-[97vw]",
            "md:[&_div.fixed.right-0]:!w-[1000px]",
            "lg:[&_div.fixed.right-0]:!w-[1100px]",
            "xl:[&_div.fixed.right-0]:!w-[1200px]",
            "[&_div.fixed.right-0>div:first-child]:!bg-[#2563eb]",
            "[&_div.fixed.right-0>div:first-child]:!border-b",
            "[&_div.fixed.right-0>div:first-child]:!border-[#1d4ed8]",
            "[&_div.fixed.right-0>div:first-child]:!pt-[10px]",
            "[&_div.fixed.right-0>div:first-child]:!pb-[10px]",
            "[&_div.fixed.right-0>div:first-child]:!flex",
            "[&_div.fixed.right-0>div:first-child]:!items-center",
            "[&_div.fixed.right-0>div:first-child_h2]:!text-white",
            "[&_div.fixed.right-0>div:first-child_button]:!text-white",
            "[&_div.fixed.right-0>div:first-child_button]:opacity-80",
            "[&_div.fixed.right-0>div:first-child_button]:hover:opacity-100",
            "[&_div.fixed.right-0>div:first-child_button]:hover:!bg-white/10",
            "[&_div.fixed.right-0>div:first-child_.flex.items-start.gap-3]:!items-center"
        )}>

            <Drawer
                open={true}
                onClose={handleClose}
                title={!isRenterPage ? drawerTitle : null}
                width="xl"
            >
                <div className='bg-white flex flex-col h-full border-slate-300 shadow-sm overflow-hidden'>
                    {!isRenterPage && (
                        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm overflow-x-auto no-scrollbar">
                            <nav className="flex items-center gap-2 min-w-max md:grid md:grid-cols-7">
                                {TABS.map((tab) => {
                                    const isActive = pathname.split('/').some(segment => segment.toLowerCase() === tab.href.toLowerCase());
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
                                            className={cn(
                                                'inline-flex items-center justify-center gap-2 px-4 py-2 text-[12px] rounded-md border font-bold transition-all hover:shadow-md h-[36px]',
                                                isActive
                                                    ? `${activeStyles} shadow-md`
                                                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            )}
                                        >
                                            <Icon className={cn("w-4 h-4", isActive ? 'text-white' : 'text-gray-400')} />
                                            <span className="whitespace-nowrap">{tTabs(tab.label)}</span>
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