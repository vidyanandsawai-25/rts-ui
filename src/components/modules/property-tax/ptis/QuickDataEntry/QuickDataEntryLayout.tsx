
'use client'
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Building2, FileText, Home } from 'lucide-react';
import { Drawer } from '@/components/common/Drawer';
import { cn } from '@/lib/utils/cn';
import { Tab } from '@/types/property-basic-details.types';

const TABS: Tab[] = [
    { label: 'Property', href: 'Property', icon: Home },
    { label: 'Society', href: 'Society', icon: Building2 },
];

const DRAWER_CLASSNAME = cn(
    "[&_div.fixed.right-0]:!w-[97vw]",
    "md:[&_div.fixed.right-0]:!w-[1000px]",
    "lg:[&_div.fixed.right-0]:!w-[1100px]",
    "xl:[&_div.fixed.right-0]:!w-[1200px]",
    "[&_div.fixed.right-0>div:first-child]:!bg-blue-600",
    "[&_div.fixed.right-0>div:first-child_h2]:!text-white"
);

export default function QuickDataEntryLayout({ children }: { children: React.ReactNode }) {

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const propertyId = (Array.isArray(params.propertyId) ? params.propertyId[0] : params.propertyId) || searchParams.get("propertyId") || "";
    const wardNo = searchParams.get("wardNo") || "";
    const propertyNo = searchParams.get("propertyNo") || "";
    const partitionNo = searchParams.get("partitionNo") || "";

    const queryString = new URLSearchParams({
        propertyId,
        wardNo,
        propertyNo,
        partitionNo,
    }).toString();

    const t = useTranslations("quickDataEntry");
    const isRenterPage = pathname.includes("/Renter");

    const handleClose = () => {
        router.push(
            `/${locale}/property-tax/ptis?${queryString}`
        );
    };

    const activeSegment = pathname.split('/').pop() ?? '';

    const drawerTitle = (
        <div className="flex flex-col">
            <h2 className="flex items-center gap-2 text-[15px] font-bold leading-tight text-white">
                <FileText className="h-4 w-4 text-white" />
                {t('roomSubmission.quickDataEntry')}
            </h2>
            <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-white opacity-90">
                <span>{t('roomSubmission.info.ward')}: {wardNo || '—'}</span>
                <span className="mx-1">•</span>
                <span>{t('roomSubmission.info.property')}: {propertyNo || '—'}</span>
                <span className="mx-1">•</span>
                <span>{t('roomSubmission.info.partition')}: {partitionNo || '—'}</span>
            </div>
        </div>
    );

    return (
        <div className={DRAWER_CLASSNAME}>
            <Drawer
                open={true}
                onClose={handleClose}
                title={!isRenterPage ? drawerTitle : null}
                width="xl"
            >
                <div className="flex h-full flex-col overflow-hidden border-slate-300 bg-white shadow-sm">
                    {!isRenterPage && (
                        <div className="bg-white border-b-2 border-slate-300 px-3 py-2 shadow-sm overflow-x-auto no-scrollbar">
                            <nav className="flex md:grid w-full grid-cols-7 gap-1.5 h-auto p-1 rounded-lg">
                                {TABS.map((tab) => {

                                    const currentPath = pathname.split('?')[0];
                                    const baseTabPath = `/${currentPath.split('/').filter(Boolean).slice(0, -1).join('/')}`;
                                    const tabPath = `${baseTabPath}/${tab.href}`;
                                    const tabHref = queryString ? `${tabPath}?${queryString}` : tabPath;
                                    const isActive = activeSegment === tab.href || pathname === tabPath;
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
                    )}

                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </Drawer>
        </div>
    );
}