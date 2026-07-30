
'use client';

import { useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Drawer } from '@/components/common/Drawer';
import { MapPin, Building2, Search, Send, FileText, Check, User, X, Network } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface TrackingStage {
    stage: string;
    status: 'Completed' | 'In Progress' | 'Pending';
    date?: string;
    submittedBy?: string;
    approvedBy?: string;
}

export interface PropertyTrackingData {
    propertyNo: string;
    ownerName: string;
    tracking: TrackingStage[];
}

interface TrackingPropertyData {
    propertyNo: { new: string; old?: string; };
    owner?: string;
}

export const PropertyTrackingDrawer = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const t = useTranslations('automationDashboard.tracking');

    const pathZoneId = params?.zoneId as string;
    const propertyId = params?.propertyId as string;
    const stage = searchParams.get('stage') || 'geoSequencing';
    const workflowStageId = searchParams.get('workflowStageId');

    // Find the property data dynamically
    const selectedProperty: TrackingPropertyData | null = useMemo(() => {
        if (!propertyId) return null;
        return {} as TrackingPropertyData; // Replaced dummyPropertyData
    }, [propertyId]);
    const source = searchParams.get('source') || 'division';

    const handleClose = () => {
        // Go back to the dashboard page under /property-details-dashboard/[zoneId]
        const sourceParam = source ? `&source=${source}` : '';
        const returnUrlParam = searchParams.get('returnUrl') ? `&returnUrl=${encodeURIComponent(searchParams.get('returnUrl')!)}` : '';
        router.push(`/${locale}/property-tax/automation-dashboard/property-details-dashboard/${pathZoneId}?zoneId=${pathZoneId}&stage=${stage}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}${sourceParam}${returnUrlParam}`);
    };

    // Tracking stages data matching the screenshot
    const trackingStages: TrackingStage[] = [
        {
            stage: 'Geo-sequencing',
            status: 'Completed',
            date: '5 Jun 2025 • 12:40 pm',
            submittedBy: 'AMAR SHRIRAM DATIR',
        },
        {
            stage: 'Internal Survey',
            status: 'Pending',
            date: '- - -',
            submittedBy: '-',
        },
        {
            stage: 'Quality Analyst',
            status: 'Pending',
            date: '- - -',
            submittedBy: '-',
        },
        {
            stage: 'Submitted',
            status: 'Pending',
            date: '- - -',
            submittedBy: '-',
        },
        {
            stage: 'ULB',
            status: 'Pending',
            date: '- - -',
            approvedBy: '-',
        },
    ];

    const completedCount = trackingStages.filter(s => s.status === 'Completed').length;
    const totalCount = trackingStages.length;

    return (
        <Drawer
            open={true}
            onClose={handleClose}
            width="md"
            hideHeader={true}
        >
            <div className="flex flex-col h-[calc(100vh-2px)] bg-[#F8FAFF] overflow-hidden select-none font-sans">
                {/* Header Card */}
                <div className="bg-white m-4 p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#1A56DB] p-2.5 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/10">
                                <Network className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-slate-800 font-bold text-lg leading-tight">{t('title')}</h3>
                                <span className="text-slate-400 text-xs mt-1 font-medium flex items-center gap-1.5">
                                    <span>{selectedProperty?.propertyNo.new || 'MUMAJOR1-2'}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>{selectedProperty?.owner || 'The Holder'}</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1 rounded-full border border-slate-200">
                                {completedCount} / {totalCount} {t('completed')}
                            </span>
                            <button
                                onClick={handleClose}
                                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar Section */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">PROGRESS</span>
                            <span className="text-blue-600 bg-blue-50 border border-blue-100 text-[11px] font-semibold rounded-full px-2.5 py-0.5">
                                {t('current')}: {t('internalSurvey')}
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex flex-col">
                            {trackingStages.map((stage, idx) => {
                                const isCompleted = stage.status === 'Completed';
                                const isLast = idx === trackingStages.length - 1;

                                return (
                                    <div key={idx} className="flex relative">
                                        {/* Left: Icon & Wavy Connecting Line */}
                                        <div className="w-16 flex flex-col items-center flex-shrink-0 relative">
                                            {/* Circular Icon Container */}
                                            <div className={cn(
                                                "w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white shadow-sm z-10 transition-colors duration-300 relative",
                                                isCompleted ? "border-emerald-400 bg-emerald-50 text-emerald-500" :
                                                    idx === 1 ? "border-blue-400 bg-blue-50 text-blue-600" : // Highlight current stage
                                                        "border-slate-200 bg-slate-50 text-slate-300"
                                            )}>
                                                {idx === 0 && <MapPin className="w-5 h-5" />}
                                                {idx === 1 && <Building2 className="w-5 h-5" />}
                                                {idx === 2 && <Search className="w-5 h-5" />}
                                                {idx === 3 && <Send className="w-5 h-5" />}
                                                {idx === 4 && <FileText className="w-5 h-5" />}

                                                {/* Checkmark Badge on Completed */}
                                                {isCompleted && (
                                                    <span className="absolute bottom-0 right-0 bg-[#10B981] text-white p-0.5 rounded-full border border-white shadow-sm">
                                                        <Check className="w-2.5 h-2.5 stroke-[4px]" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Wavy Connector Line */}
                                            {!isLast && (
                                                <div className="absolute top-10 bottom-0 left-1/2 -translate-x-1/2 w-8 h-[calc(100%-20px)] pointer-events-none z-0">
                                                    <svg className="w-full h-full" viewBox="0 0 32 100" preserveAspectRatio="none">
                                                        <path
                                                            d={idx % 2 === 0 ? "M 16 0 C 32 25, 0 75, 16 100" : "M 16 0 C 0 25, 32 75, 16 100"}
                                                            fill="none"
                                                            stroke={isCompleted ? "#2DD4BF" : "#CBD5E1"}
                                                            strokeWidth={isCompleted ? "3" : "2"}
                                                            strokeDasharray={isCompleted ? undefined : "4 4"}
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Stage Details */}
                                        <div className={cn("flex-1 pb-10 pl-2", isLast && "pb-2")}>
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-[15px] font-bold text-slate-800">
                                                    {stage.stage}
                                                </h4>
                                                <span className={cn(
                                                    "text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase",
                                                    isCompleted ? "bg-emerald-100 text-emerald-700" :
                                                        idx === 1 ? "bg-blue-100 text-blue-700" :
                                                            "bg-slate-100 text-slate-500"
                                                )}>
                                                    {isCompleted ? t('completedStatus') : t('pendingStatus')}
                                                </span>
                                            </div>

                                            <p className="text-[12px] font-semibold text-slate-400 mt-1">
                                                {stage.date}
                                            </p>

                                            <div className="flex items-center gap-1.5 mt-2 text-[12px] font-semibold text-slate-400">
                                                <User className="w-3.5 h-3.5 text-slate-300" />
                                                <span>
                                                    {stage.approvedBy ? t('approvedBy') : t('submittedBy')} {stage.submittedBy || stage.approvedBy}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </Drawer>
    );
};
