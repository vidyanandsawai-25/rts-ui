'use client';

import { useTranslations } from 'next-intl';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface SummaryCardData {
  label: string;
  oldValue: string | number;
  newValue: string | number;
  difference: string | number;
  unit?: string;
  color: 'sky' | 'purple' | 'amber' | 'emerald';
}

interface TaxSummaryCardsProps {
  cards: SummaryCardData[];
}

const colorMap = {
  sky: {
    text: 'text-blue-700',
    lightText: 'text-blue-600',
    bg: 'bg-blue-100/80',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  purple: {
    text: 'text-purple-700',
    lightText: 'text-purple-600',
    bg: 'bg-purple-100/80',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  amber: {
    text: 'text-orange-700',
    lightText: 'text-orange-600',
    bg: 'bg-orange-100/80',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  emerald: {
    text: 'text-emerald-700',
    lightText: 'text-emerald-600',
    bg: 'bg-emerald-100/80',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const getDiffColor = (diff: string | number) => {
  if (typeof diff === 'number') {
    if (diff > 0) return 'text-emerald-600 bg-emerald-100 border-emerald-200';
    if (diff < 0) return 'text-rose-600 bg-rose-100 border-rose-200';
    return 'text-gray-500 bg-gray-100 border-gray-200';
  }
  const normalized = diff.trim();
  if (normalized.startsWith('+')) return 'text-emerald-600 bg-emerald-100 border-emerald-200';
  if (normalized.startsWith('-')) return 'text-rose-600 bg-rose-100 border-rose-200';
  return 'text-gray-500 bg-gray-100 border-gray-200';
};

const getDiffIcon = (diff: string | number) => {
  if (typeof diff === 'number') {
    if (diff > 0) return <ArrowUp className="w-3 h-3" />;
    if (diff < 0) return <ArrowDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  }
  const normalized = diff.trim();
  if (normalized.startsWith('+')) return <ArrowUp className="w-3 h-3" />;
  if (normalized.startsWith('-')) return <ArrowDown className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
};

const getDiffValue = (diff: string | number) => {
  if (typeof diff === 'number') return Math.abs(diff);
  return diff.replace(/^[-+]/, '').trim();
};

export function TaxSummaryCards({ cards }: TaxSummaryCardsProps) {
  const t = useTranslations('reassessment');
  const changedStatus = t('summaryCards.changedStatus');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {cards.map((card, index) => {
        const colors = colorMap[card.color];
        const differenceText = String(card.difference);
        const isUseCard = card.color === 'purple';
        const isAreaCard = card.color === 'sky';
        const normalizedDiff = differenceText.trim().toLowerCase();
        const isChangedStatus =
          normalizedDiff === changedStatus.toLowerCase() ||
          differenceText.trim().toUpperCase() === 'CHANGED';

        return (
          <div
            key={`${card.label}-${index}`}
            className={`relative rounded-lg border ${colors.border} ${colors.bg} px-2.5 py-1.5 transition-all duration-200 hover:shadow-sm hover:border-gray-300`}
          >
            {/* Label row */}
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5">
                <div className={`w-1 h-2.5 rounded-full ${colors.dot} flex-shrink-0`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>
                  {card.label}
                </span>
              </div>
              
              {/* Status pill for use card */}
              {isUseCard && (
                <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  isChangedStatus 
                    ? 'bg-amber-100 text-amber-700 border-amber-200' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {isChangedStatus ? changedStatus : differenceText}
                </div>
              )}
            </div>

            {/* Values row */}
            <div className="flex items-center gap-1">
              {/* Old */}
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  {t('summaryCards.oldLabel')}:
                </span>
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {card.oldValue}{isAreaCard && card.unit ? ` ${card.unit}` : ''}
                </span>
              </div>

              {/* Arrow */}
              <span className="text-gray-400 text-[10px]">→</span>

              {/* New */}
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  {t('summaryCards.newLabel')}:
                </span>
                <span className={`text-xs font-bold ${colors.text} truncate`}>
                  {card.newValue}{isAreaCard && card.unit ? ` ${card.unit}` : ''}
                </span>
              </div>

              {/* Difference - only for non-use cards */}
              {!isUseCard && (
                <>
                  <div className="w-px h-6 bg-gray-200/50 mx-0.5" />
                  <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${getDiffColor(card.difference)}`}>
                    {getDiffIcon(card.difference)}
                    <span>
                      {getDiffValue(card.difference)}
                      {isAreaCard && card.unit ? ` ${card.unit}` : ''}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}