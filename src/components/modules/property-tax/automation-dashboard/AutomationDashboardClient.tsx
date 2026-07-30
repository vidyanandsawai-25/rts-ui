'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

import {
    ClipboardList,
    FileText,
    ThumbsUp,
    Scale,
    Layout as LayoutIcon,
    FileSearch,
    CheckCircle,
    FileCheck,
    Bell
} from 'lucide-react';

import { Props } from '@/types/automation-dashboard/automation-dashboard.type';
import { DashboardSummaryCards } from './SummaryCards/DashboardSummaryCards';
import { getTabColors } from './StageNavigationCard/TabColorList';
import { WorkflowTabButton } from './StageNavigationCard/TabCardStyles';

export function ClientWrapper({ children, workflowCardsData, serverData }: Props) {

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const router = useRouter();

    useEffect(() => {
        // Redirect to set workflowStageId for geo-sequencing on initial render
        if (pathname.includes('/geo-sequencing') && !searchParams.get('workflowStageId')) {
            const geoCard = workflowCardsData?.find(card => card.stageName === 'GeoSequencing');
            if (geoCard?.id) {
                router.replace(`${pathname}?workflowStageId=${geoCard.id}`);
            }
        }
    }, [pathname, searchParams, workflowCardsData, router]);

    const basePath = `/${locale}/property-tax/automation-dashboard`;

    const isIsolatedView = pathname.includes('/ward-wise-summary') ||
        pathname.includes('/property-details-dashboard') ||
        pathname.includes('/quality-check/update-common-details') ||
        pathname.includes('/send-to-approve') ||
        pathname.includes('/pending-structures-ward-wise');

    const getStageConfig = (stageName: string) => {
        switch (stageName) {
            case 'GeoSequencing': return { icon: ClipboardList, value: 'geo-sequencing' };
            case 'InternalSurvey': return { icon: FileSearch, value: 'internal-survey' };
            case 'DataEntry': return { icon: CheckCircle , value: 'quality-check' };
            case 'Assessment': return { icon: FileCheck , value: 'assessment' };
            case 'ApprovalByULB': return { icon: ThumbsUp, value: 'approval-by-ulb' };
            case 'NoticeDistribution': return { icon: Bell, value: 'notice-distribution' };
            case 'HearingAndAppeal': return { icon: Scale, value: 'hearing-appeals' };
            case 'BillDistribution': return { icon: FileText, value: 'bills-distribution' };
            case 'BillGeneration': return { icon: FileText, value: 'bill-generation' };
            default: return {
                icon: LayoutIcon,
                value: stageName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
            };
        }
    };

    const rawTabs = (workflowCardsData || []).map(card => {
        const config = getStageConfig(card.stageName);
        return {
            id: card.id,
            value: config.value,
            title: card.stageName,
            icon: config.icon,
            data: {
                structure: card.structureCount?.toString() || "0",
                unit: card.unitCount?.toString() || "0",
            }
        };
    });

    const activeTabObj = rawTabs?.find(t => pathname.includes(`/${t.value}`));
    const activeTab = activeTabObj ? activeTabObj.value : (rawTabs[0]?.value || '');

    return (
        <div className={`flex flex-col h-full ${isIsolatedView ? 'p-0' : 'gap-2 p-2'}`}>
            {!isIsolatedView && (
                <>
                    {/* TOP CARDS RENDERED IN CLIENT MODULE, USING SERVER DATA */}
                    <DashboardSummaryCards serverData={serverData} />

                    <div
                        className="grid gap-2 w-full no-scrollbar"
                        style={{ gridTemplateColumns: `repeat(${rawTabs.length}, minmax(0, 1fr))` }}
                    >
                        {rawTabs.map((tab) => {
                            const isActive = activeTab === tab.value;
                            const Icon = tab.icon;
                            const colors = getTabColors(tab.value);

                            return (
                                <div
                                    key={tab.value}
                                    onClick={() => router.push(`${basePath}/${tab.value}?workflowStageId=${tab.id}`)}
                                    className="min-w-0 w-full h-full text-left outline-none transition-transform active:scale-[0.98] block cursor-pointer"
                                >
                                    <WorkflowTabButton tab={tab} isActive={isActive} icon={Icon} colors={colors} />
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <div className={`flex-1 bg-white ${isIsolatedView ? '' : 'rounded-lg shadow-sm'}`}>
                {children}
            </div>
        </div>
    );
}
