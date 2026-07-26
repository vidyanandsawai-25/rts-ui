'use client'

import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import { Drawer } from '@/components/common/Drawer';
import { useTranslations } from 'next-intl';
import { FileText, MapPin, Hash, Layers, Tag } from 'lucide-react';
import { TabNavigation } from "./TabNavigation";
import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';
import { useConfirm } from '@/components/common/ConfirmProvider';

const RETURN_TAB_BY_QDE_SEGMENT: Record<string, string> = {
    property: 'propertydetails',
    kyc: 'kycdetails',
    society: 'societydetails',
    building: 'buildingpermission',
    discount: 'discountdetails',
    olddetails: 'olddetails',
};

export function QuickDataEntryClientWrapper({ children, categoryName, propertyDescription }: { children: ReactNode; categoryName?: string; propertyDescription?: string }) {
    return (
        <QuickDataEntryContent categoryName={categoryName} propertyDescription={propertyDescription}>
            {children}
        </QuickDataEntryContent>
    );
}

function QuickDataEntryContent({
    children,
    categoryName,
    propertyDescription,
}: { children: ReactNode; categoryName?: string; propertyDescription?: string }) {
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
    const valuationTab = searchParams.get("valuationTab") || "";
    const appartmentTab = searchParams.get("appartmentTab") || "";
    const subTab = searchParams.get("subTab") || "";
    const showDetails = searchParams.get("showDetails") || "";
    const rateableExpands = searchParams.getAll("rateableExpand");
    const capitalExpands = searchParams.getAll("capitalExpand");
    const dualExpands = searchParams.getAll("dualExpand");
    const parentPropertyId = searchParams.get("parentPropertyId") || "";
    const appartmentPartition = searchParams.get("appartmentPartition") || "";

    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const qdeIndex = pathSegments.findIndex((segment) => segment.toLowerCase() === 'quickdataentry');
    const qdeTabSegment = qdeIndex >= 0 ? (pathSegments[qdeIndex + 2] || '').toLowerCase() : '';
    const derivedReturnTab = RETURN_TAB_BY_QDE_SEGMENT[qdeTabSegment] || '';
    const resolvedReturnTab = returnTab || derivedReturnTab;

    const { confirm } = useConfirm();

    const handleClose = () => {
        const doClose = () => {
            const params = new URLSearchParams();
            if (parentPropertyId) {
                params.set('propertyId', parentPropertyId);
            } else if (propertyId) {
                params.set('propertyId', propertyId);
            }
            if (wardNo) params.set('wardNo', wardNo);
            if (wardId) params.set('wardId', wardId);
            if (propertyNo) params.set('propertyNo', propertyNo);
            if (partitionNo) params.set('partitionNo', partitionNo);
            if (resolvedReturnTab) params.set('tab', resolvedReturnTab);
            if (valuationTab) params.set('valuationTab', valuationTab);
            if (appartmentTab) params.set('appartmentTab', appartmentTab);
            if (subTab) params.set('subTab', subTab);
            if (showDetails) params.set('showDetails', showDetails);
            if (appartmentPartition) params.set('appartmentPartition', appartmentPartition);
            if (parentPropertyId) params.set('parentPropertyId', parentPropertyId);
            rateableExpands.forEach(v => params.append('rateableExpand', v));
            capitalExpands.forEach(v => params.append('capitalExpand', v));
            dualExpands.forEach(v => params.append('dualExpand', v));

            router.push(`/${locale}/property-tax/ptis?${params}`);
        };

        const win = typeof window !== 'undefined' ? (window as unknown as { __buildingFormHasChanges?: boolean; __discountFormHasChanges?: boolean; __socialFormHasChanges?: boolean }) : {};
        const hasBuildingChanges = !!win.__buildingFormHasChanges;
        const hasDiscountChanges = !!win.__discountFormHasChanges || !!win.__socialFormHasChanges;

        if (hasBuildingChanges || hasDiscountChanges) {
            const title = hasBuildingChanges 
                ? (t('building.unsavedChangesTitle') || 'Unsaved Changes')
                : (t('discount.unsavedChangesTitle') || 'Unsaved Changes');

            const description = hasBuildingChanges
                ? (t('building.unsavedChangesDesc') || 'You have unsaved changes in the Building Permission tab. Do you want to discard them, or continue editing?')
                : (t('discount.unsavedChangesDesc') || 'You have unsaved changes in the Discount & Social Data tab. Do you want to discard them, or continue editing?');

            const continueButton = hasBuildingChanges
                ? (t('building.continueButton') || 'Continue Editing')
                : (t('discount.continueButton') || 'Continue Editing');

            const discardButton = hasBuildingChanges
                ? (t('building.discardConfirmButton') || 'Discard Changes')
                : (t('discount.discardConfirmButton') || 'Discard Changes');

            confirm({
                variant: 'warning',
                title,
                description,
                confirmText: continueButton,
                cancelText: discardButton,
                onConfirm: () => {
                    // Do nothing, stays on screen
                },
                onCancel: () => {
                    const e = typeof window !== 'undefined' ? (window.event as Event | undefined) : null;
                    const target = e?.target as HTMLElement | null;
                    const isSafeDismiss = e && (
                        e.type === 'keydown' ||
                        (e.type === 'click' && !target?.closest?.('button')) ||
                        target?.closest?.('button')?.getAttribute?.('aria-label') === 'Close'
                    );

                    if (isSafeDismiss) {
                        return;
                    }

                    win.__buildingFormHasChanges = false;
                    win.__discountFormHasChanges = false;
                    win.__socialFormHasChanges = false;
                    doClose();
                }
            });
        } else {
            doClose();
        }
    };

    const isRenterPage = pathname ? pathname.toLowerCase().includes("/renter") : false;

    const drawerClassName = cn(
        "quick-data-entry-wrapper",
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
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 lg:gap-6">
            <h2 className="flex items-center gap-2 text-[15px] font-bold leading-tight text-white">
                <FileText className="h-4 w-4 text-white" />
                {t('roomSubmission.quickDataEntry')}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-white border border-white/10 backdrop-blur-xs transition-colors hover:bg-white/15">
                    <MapPin className="h-3 w-3 text-white/80" />
                    <span>{t('roomSubmission.info.ward')}: {wardNo || '—'}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-white border border-white/10 backdrop-blur-xs transition-colors hover:bg-white/15">
                    <Hash className="h-3 w-3 text-white/80" />
                    <span>{t('roomSubmission.info.property')}: {propertyNo || '—'}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-white border border-white/10 backdrop-blur-xs transition-colors hover:bg-white/15">
                    <Layers className="h-3 w-3 text-white/80" />
                    <span>{t('roomSubmission.info.partition')}: {appartmentPartition || partitionNo || '—'}</span>
                </div>
                {categoryName && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-white border border-white/20 backdrop-blur-xs transition-colors hover:bg-white/20">
                        <Tag className="h-3 w-3 text-white/95" />
                        <span>{t('floor.propertyCategory')}: {categoryName}</span>
                    </div>
                )}
                {propertyDescription && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-white border border-white/20 backdrop-blur-xs transition-colors hover:bg-white/20">
                        <Tag className="h-3 w-3 text-white/95" />
                        <span>{t('property.propertyDescription')}: {propertyDescription}</span>
                    </div>
                )}
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