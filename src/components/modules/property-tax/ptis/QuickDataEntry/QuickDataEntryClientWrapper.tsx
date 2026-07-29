'use client'

import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import { Drawer } from '@/components/common/Drawer';
import { useTranslations } from 'next-intl';
import { ReactNode, useState, useEffect } from 'react';
import { FileText, MapPin, Hash, Layers, Tag } from 'lucide-react';
import { TabNavigation } from "./TabNavigation";
import { cn } from '@/lib/utils/cn';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { QDE_TO_MAIN_MAP } from '@/lib/utils/qde-tab-mapping';

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
    const remainingSegments = qdeIndex >= 0 ? pathSegments.slice(qdeIndex + 2) : [];
    const matchedSegment = remainingSegments.map(s => s.toLowerCase()).find(s => QDE_TO_MAIN_MAP[s]);
    const derivedReturnTab = (matchedSegment ? QDE_TO_MAIN_MAP[matchedSegment] : '') || '';
    const resolvedReturnTab = returnTab || derivedReturnTab || 'olddetails';

    const { confirm } = useConfirm();

    const [isFormSaving, setIsFormSaving] = useState(false);

    useEffect(() => {
        const handleSavingState = (e: Event) => {
            const customEvent = e as CustomEvent<{ isSaving: boolean }>;
            setIsFormSaving(!!customEvent.detail?.isSaving);
        };
        window.addEventListener('ntis:form-saving-state', handleSavingState);
        return () => {
            window.removeEventListener('ntis:form-saving-state', handleSavingState);
        };
    }, []);

    useEffect(() => {
        if (!isFormSaving) return;

        const blockMouseEvent = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        };

        window.addEventListener('click', blockMouseEvent, true);
        window.addEventListener('mousedown', blockMouseEvent, true);
        window.addEventListener('pointerdown', blockMouseEvent, true);

        return () => {
            window.removeEventListener('click', blockMouseEvent, true);
            window.removeEventListener('mousedown', blockMouseEvent, true);
            window.removeEventListener('pointerdown', blockMouseEvent, true);
        };
    }, [isFormSaving]);

    const handleClose = () => {
        const win = typeof window !== 'undefined' ? (window as unknown as {
            __buildingFormIsSaving?: boolean;
            __buildingFormHasChanges?: boolean;
            __discountFormHasChanges?: boolean;
            __socialFormHasChanges?: boolean;
            __buildingFormIncompleteDetails?: string[] | null;
            __showBuildingUnsavedChangesModal?: ((onDiscard: () => void) => void) | null;
        }) : {} as Record<string, never>;

        const isSavingActive = isFormSaving || (typeof window !== 'undefined' && (
            !!(window as unknown as { __buildingFormIsSaving?: boolean }).__buildingFormIsSaving ||
            !!(window as unknown as { __isQuickDataEntrySaving?: boolean }).__isQuickDataEntrySaving
        ));

        if (isSavingActive) {
            return;
        }

        const doClose = () => {
            const winObj = typeof window !== 'undefined' ? (window as unknown as { __ptisHasSavedChanges?: boolean }) : {};
            const hasSavedChanges = !!winObj.__ptisHasSavedChanges;

            const isSameOriginReferrer = typeof document !== 'undefined' && document.referrer && new URL(document.referrer, window.location.href).origin === window.location.origin;

            if (!hasSavedChanges && isSameOriginReferrer && typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
            } else {
                if (typeof window !== 'undefined') {
                    (window as unknown as { __ptisHasSavedChanges?: boolean }).__ptisHasSavedChanges = false;
                }
                const params = new URLSearchParams();
                if (propertyId) params.set('propertyId', propertyId);
                if (wardNo) params.set('wardNo', wardNo);
                if (wardId) params.set('wardId', wardId);
                if (propertyNo) params.set('propertyNo', propertyNo);
                if (partitionNo) params.set('partitionNo', partitionNo);
                if (resolvedReturnTab) params.set('tab', resolvedReturnTab);
                if (valuationTab) params.set('valuationTab', valuationTab);
                if (appartmentTab) params.set('appartmentTab', appartmentTab);
                if (subTab) params.set('subTab', subTab);
                if (showDetails) params.set('showDetails', showDetails);
                if (parentPropertyId) params.set('parentPropertyId', parentPropertyId);
                rateableExpands.forEach(v => params.append('rateableExpand', v));
                capitalExpands.forEach(v => params.append('capitalExpand', v));
                dualExpands.forEach(v => params.append('dualExpand', v));

                router.push(`/${locale}/property-tax/ptis?${params}`);
            }
        };

        const hasBuildingChanges = !!win.__buildingFormHasChanges;
        const hasDiscountChanges = !!win.__discountFormHasChanges || !!win.__socialFormHasChanges;

        const onDiscard = () => {
            win.__buildingFormHasChanges = false;
            win.__discountFormHasChanges = false;
            win.__socialFormHasChanges = false;
            doClose();
        };

        if (hasBuildingChanges && win.__showBuildingUnsavedChangesModal) {
            win.__showBuildingUnsavedChangesModal(onDiscard);
            return;
        }

        if (hasBuildingChanges || hasDiscountChanges) {
            const title = hasBuildingChanges
                ? (t('building.unsavedChangesTitle') || 'Unsaved Changes')
                : (t('discount.unsavedChangesTitle') || 'Unsaved Changes');

            let description = hasBuildingChanges
                ? (t('building.unsavedChangesDesc') || 'You have unsaved changes in the Building Permission tab. Do you want to discard them, or continue editing?')
                : (t('discount.unsavedChangesDesc') || 'You have unsaved changes in the Discount & Social Data tab. Do you want to discard them, or continue editing?');

            if (hasBuildingChanges && win.__buildingFormIncompleteDetails && Array.isArray(win.__buildingFormIncompleteDetails)) {
                const incompleteMsg = t('building.incompleteFloorsWarning') || 'The following floor(s) have incomplete certificate information:';
                description = `${description}\n\n⚠️ ${incompleteMsg}\n• ${win.__buildingFormIncompleteDetails.join('\n• ')}`;
            }

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
    const isBusy = isFormSaving || (typeof window !== 'undefined' && !!(window as unknown as { __buildingFormIsSaving?: boolean }).__buildingFormIsSaving);

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
            {isBusy && (
                <div
                    className="fixed inset-0 z-[99999] bg-transparent cursor-wait select-none pointer-events-auto"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                />
            )}
            <Drawer open={true} onClose={handleClose} title={drawerTitle} width="xl" hideHeader={isRenterPage}>
                <div className="flex flex-col border-slate-300 bg-white shadow-sm min-h-[calc(100vh-60px)]">
                    {!isRenterPage && (
                        <TabNavigation />
                    )}
                    <div className="flex-1 flex flex-col">
                        {children}
                    </div>
                </div>
            </Drawer>
        </div>
    );
}