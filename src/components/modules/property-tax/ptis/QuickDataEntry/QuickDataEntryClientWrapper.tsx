'use client'

import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import { Drawer } from '@/components/common/Drawer';
import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';
import { TabNavigation } from "./TabNavigation";
import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

function QuickDataEntryContent({
    children,
}: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const routeParams = useParams();
    const t = useTranslations('quickDataEntry');

    const locale = routeParams.locale as string;
    const propertyId = (routeParams.propertyId as string) || searchParams.get('propertyId') || "";
    const wardNo = searchParams.get("wardNo") || "";
    const wardId = searchParams.get("wardId") || "";
    const propertyNo = searchParams.get("propertyNo") || "";
    const partitionNo = searchParams.get("partitionNo") || "";
    const returnTab = searchParams.get("returnTab") || "";

    const handleClose = () => {
        const params = new URLSearchParams();
        if (propertyId) params.set('propertyId', propertyId);
        if (wardNo) params.set('wardNo', wardNo);
        if (wardId) params.set('wardId', wardId);
        if (propertyNo) params.set('propertyNo', propertyNo);
        if (partitionNo) params.set('partitionNo', partitionNo);
        if (returnTab) params.set('tab', returnTab);

        router.push(`/${locale}/property-tax/ptis?${params}`);
    };

    const isRenterPage = pathname ? pathname.toLowerCase().includes("/renter") : false;

    const drawerClassName = cn(
        "[&_div.fixed.right-0]:!w-[97vw]",
        "md:[&_div.fixed.right-0]:!w-[1000px]",
        "lg:[&_div.fixed.right-0]:!w-[1100px]",
        "xl:[&_div.fixed.right-0]:!w-[1200px]",
        !isRenterPage && "[&_div.fixed.right-0>div:first-child]:!bg-blue-600",
        !isRenterPage && "[&_div.fixed.right-0>div:first-child_h2]:!text-white",
        !isRenterPage && "[&_div.fixed.right-0>div:first-child_button_svg]:!text-white",
        !isRenterPage && "[&_div.fixed.right-0>div:first-child_button]:hover:!bg-blue-700"
    );

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
        <div className={drawerClassName}>
            <Drawer open={true} onClose={handleClose} title={drawerTitle} width="xl" hideHeader={isRenterPage}>
                <div className="flex h-full flex-col overflow-hidden border-slate-300 bg-white shadow-sm">
                    {!isRenterPage && (
                        <TabNavigation />
                    )}
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </Drawer>
        </div>
    );
}

export function QuickDataEntryClientWrapper({ children }: { children: ReactNode }) {
    return (
        <QuickDataEntryContent>
            {children}
        </QuickDataEntryContent>
    );
}