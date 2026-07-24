 

import { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface WorkflowTabButtonProps {
    tab: {
        title: string;
        data: { structure: string; unit: string };
    };
    isActive: boolean;
    icon: LucideIcon;
    colors: {
        iconBgActive: string;
        bgActive: string;
        iconTextInactive: string;
    };
}

export function WorkflowTabButton({ tab, isActive, icon: Icon, colors }: WorkflowTabButtonProps) {
    const t = useTranslations('automationDashboard.summaryCards.metrics');

    return (
        <div
            className={`w-full h-24 min-w-0 transition-all duration-300 rounded-xl p-2 border-2 relative overflow-hidden bg-white group hover:shadow-lg hover:-translate-y-0.5 flex flex-col ${isActive ? "shadow-lg" : "shadow-sm border-slate-300"
                }`}
            style={
                isActive
                    ? {
                        borderColor: colors.iconBgActive,
                        boxShadow: `0 6px 16px rgba(0,0,0,0.14), 0 0 0 3px ${colors.iconBgActive}`,
                    }
                    : undefined
            }
        >
            {/* Active: clear tint so card is obviously selected */}
            {isActive && (
                <div
                    className="absolute inset-0 rounded-xl pointer-events-none z-0"
                    style={{ backgroundColor: colors.iconBgActive, opacity: 0.18 }}
                />
            )}

            <div className="flex flex-col h-full justify-between relative z-10 text-left min-w-0 w-full">
                {/* Icon + heading row */}
                <div className="flex items-center gap-2 min-w-0 w-full" style={{ color: colors.iconBgActive }}>
                    <div
                        className="p-1.5 rounded-lg flex-shrink-0 transition-all duration-300 group-hover:scale-105 shadow border-2"
                        style={{
                            background: isActive ? colors.iconBgActive : colors.bgActive,
                            borderColor: colors.iconBgActive,
                        }}
                    >
                        <Icon
                            className="h-4 w-4 transition-transform duration-300"
                            style={{ color: isActive ? '#fff' : colors.iconBgActive }}
                            strokeWidth={2.25}
                        />
                    </div>
                    <p
                        className="text-sm truncate leading-tight font-bold min-w-0 flex-1"
                        style={{ color: colors.iconBgActive, fontWeight: 700 }}
                        title={tab.title}
                    >
                        {tab.title}
                    </p>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-2 justify-center mt-auto pt-1 w-full">
                    <div className="text-center flex-1">
                        <p className="text-[9px] font-bold mb-0.5 text-slate-600">{t('structure')}</p>
                        <p className="text-sm font-bold text-slate-900">{tab.data.structure}</p>
                    </div>
                    <div className="h-6 w-px bg-slate-300 flex-shrink-0" />
                    <div className="text-center flex-1">
                        <p className="text-[9px] font-bold mb-0.5 text-slate-600">{t('unit')}</p>
                        <p className="text-sm font-bold text-slate-900">{tab.data.unit}</p>
                    </div>
                </div>
            </div>

            {/* Active: thick left bar */}
            {isActive && (
                <div
                    className="absolute left-0 top-0 bottom-0 w-2.5 rounded-l-xl z-10 shadow-sm"
                    style={{ backgroundColor: colors.iconBgActive }}
                    aria-hidden
                />
            )}
        </div>
    );
}
