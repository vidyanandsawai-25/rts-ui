/* eslint-disable @typescript-eslint/no-explicit-any */
import { IndianRupee, TrendingUp, CheckCircle2 } from 'lucide-react';
import { MainCardsData } from '@/types/automation-dashboard/automation-maincard/automation-maincart.type';
import { formatIndianNumber } from '@/lib/utils/format';
import { useTranslations } from 'next-intl';

const StandardMetrics = ({ value1, value2, value3, demandColor, t }: { value1?: string | number, value2?: string | number, value3?: string | number, demandColor: string, t: any }) => {
  const labelClass = "text-[11px] text-slate-500 uppercase font-bold tracking-tight mb-1";
  const valueClass = "text-[18px] text-slate-900 font-bold leading-none";
  return (
    <div className="flex items-center justify-between gap-2 w-full mt-1">
      <div className="text-center flex-1">
        <p className={labelClass}>{t('metrics.structure')}</p>
        <p className={valueClass}>{value1 || '0'}</p>
      </div>
      <div className="w-px h-8 bg-slate-200" />
      <div className="text-center flex-1">
        <p className={labelClass}>{t('metrics.unit')}</p>
        <p className={valueClass}>{value2 || '0'}</p>
      </div>
      <div className="w-px h-8 bg-slate-200" />
      <div className="text-center flex-1">
        <p className={labelClass}>{t('metrics.demand')}</p>
        <p className={`text-[17px] font-bold leading-none ${demandColor}`}>{value3 || '0'}</p>
      </div>
    </div>
  );
};

const AssessmentSubCard = ({ title, data, theme, t }: { title: string, data: any, theme: 'emerald' | 'amber', t: any }) => {
  const colors = theme === 'emerald'
    ? { bg: 'bg-emerald-50/70', border: 'border-emerald-100', title: 'text-emerald-700', label: 'text-emerald-600/70', value: 'text-emerald-700', divider: 'bg-emerald-200' }
    : { bg: 'bg-amber-50/70', border: 'border-amber-100', title: 'text-amber-700', label: 'text-amber-600/70', value: 'text-amber-800', divider: 'bg-amber-200' };

  const labelClass = `text-[9px] font-bold ${colors.label} mb-0.5 uppercase`;
  const valueClass = `text-[12px] font-bold ${colors.value}`;

  return (
    <div className={`${colors.bg} rounded-lg px-2 py-1.5 border ${colors.border} flex flex-col justify-center`}>
      <p className={`text-[10px] font-bold ${colors.title} mb-1 uppercase tracking-wide`}>{title}</p>
      <div className="flex items-center justify-between gap-2 w-full mt-1">
        <div className="text-center flex-1">
          <p className={labelClass}>{t('metrics.structure')}</p>
          <p className={valueClass}>{data?.count || '0'}</p>
        </div>
        <div className={`w-px h-6 ${colors.divider}`} />
        <div className="text-center flex-1">
          <p className={labelClass}>{t('metrics.units')}</p>
          <p className={valueClass}>{data?.units || '0'}</p>
        </div>
        <div className={`w-px h-6 ${colors.divider}`} />
        <div className="text-center flex-1">
          <p className={labelClass}>{t('metrics.demand')}</p>
          <p className={valueClass}>{data?.demand || '0'}</p>
        </div>
      </div>
    </div>
  );
};

export function DashboardSummaryCards({ serverData: apiStats }: { serverData?: MainCardsData | null }) {
  
  const t = useTranslations('automationDashboard.summaryCards');

  const hasValidApiStats =
    apiStats &&
    apiStats.previouslyRegistered &&
    apiStats.assessmentApproved &&
    apiStats.additionalRevenueGenerated;

  if (!hasValidApiStats) {
    return (
      <div className="mb-2 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          {[
            { title: t('titles.previouslyRegistered'), icon: IndianRupee, border: "border-l-purple-500" },
            { title: t('titles.assessmentApproved'), icon: CheckCircle2, border: "border-l-emerald-500" },
            { title: t('titles.additionalRevenue'), icon: TrendingUp, border: "border-l-teal-500" },
          ].map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`relative overflow-hidden bg-white border border-slate-200 border-l-4 ${card.border} rounded-xl p-4 shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg flex-shrink-0 bg-slate-100">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-[13px] text-slate-700 font-medium truncate">{card.title}</h3>
                </div>
                <p className="text-sm text-slate-500">{t('noData')}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const prev = apiStats.previouslyRegistered;
  const approved = apiStats.assessmentApproved;
  const additional = apiStats.additionalRevenueGenerated;

  const formatCurrencyIA = (val: number | undefined) => {
    if (val === undefined || val === null || isNaN(val)) return "₹0.00";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${formatIndianNumber(val)}`;
  };

  const kpiCards = [
    {
      title: t('titles.previouslyRegistered'),
      borderColor: "border-l-purple-500",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      icon: IndianRupee,
      content: (
        <StandardMetrics
          value1={formatIndianNumber(prev.structureCount ?? prev.propertyCount)}
          value2={formatIndianNumber(prev.propertyCount ?? prev.unitCount)}
          value3={formatCurrencyIA(prev.demand)}
          demandColor="text-purple-600"
          t={t}
        />
      )
    },
    {
      title: t('titles.assessmentApproved'),
      borderColor: "border-l-emerald-500",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      icon: CheckCircle2,
      content: (
        <div className="grid grid-cols-2 gap-2 mt-1">
          <AssessmentSubCard
            title={t('titles.assessed')}
            data={{
              count: formatIndianNumber(approved.assessed?.structureCount),
              units: formatIndianNumber(approved.assessed?.unitCount),
              demand: formatCurrencyIA(approved.assessed?.demand)
            }}
            theme="emerald"
            t={t}
          />
          <AssessmentSubCard
            title={t('titles.unassessed')}
            data={{
              count: formatIndianNumber(approved.unassessed?.structureCount),
              units: formatIndianNumber(approved.unassessed?.unitCount),
              demand: formatCurrencyIA(approved.unassessed?.demand)
            }}
            theme="amber"
            t={t}
          />
        </div>
      )
    },
    {
      title: t('titles.additionalRevenue'),
      borderColor: "border-l-teal-500",
      iconBg: "bg-gradient-to-br from-teal-500 to-teal-600",
      icon: TrendingUp,
      content: (
        <StandardMetrics
          value1={formatIndianNumber(additional.structureCount)}
          value2={formatIndianNumber(additional.unitCount)}
          value3={formatCurrencyIA(additional.demand)}
          demandColor="text-teal-600"
          t={t}
        />
      )
    },
  ];

  return (
    <div className="mb-2 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
        {kpiCards?.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden w-full flex flex-col bg-white border border-slate-200 border-l-4 ${card.borderColor} rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`${card?.iconBg} p-1.5 rounded-lg flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-[13px] text-slate-700 font-medium truncate">{card?.title}</h3>
              </div>

              {card?.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}