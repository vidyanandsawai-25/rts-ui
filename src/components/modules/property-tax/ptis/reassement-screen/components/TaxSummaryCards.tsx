'use client';

import { useTranslations } from 'next-intl';

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
    label: 'text-blue-600',
    newValue: 'text-blue-600',
  },
  purple: {
    label: 'text-purple-600',
    newValue: 'text-purple-600',
  },
  amber: {
    label: 'text-orange-600',
    newValue: 'text-orange-600',
  },
  emerald: {
    label: 'text-emerald-600',
    newValue: 'text-emerald-600',
  },
};

const getDiffColor = (diff: string | number) => {
  if (typeof diff === 'number') {
    if (diff > 0) return 'text-emerald-600';
    if (diff < 0) return 'text-rose-600';
    return 'text-gray-500';
  }

  const normalized = diff.trim();
  if (normalized.startsWith('+')) return 'text-emerald-600';
  if (normalized.startsWith('-')) return 'text-rose-600';
  return 'text-gray-500';
};

const getDiffArrow = (diff: string | number) => {
  if (typeof diff === 'number') {
    if (diff > 0) return '↑ ';
    if (diff < 0) return '↓ ';
    return '';
  }

  const normalized = diff.trim();
  if (normalized.startsWith('+')) return '↑ ';
  if (normalized.startsWith('-')) return '↓ ';
  return '';
};

export function TaxSummaryCards({ cards }: TaxSummaryCardsProps) {
  const t = useTranslations('reassessment');
  const changedStatus = t('summaryCards.changedStatus');

  return (
    <div className="flex flex-wrap items-center justify-start gap-2.5">
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
            className="flex items-center gap-2 rounded-lg border border-blue-100 bg-white p-1.5 px-3 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            {isUseCard ? (
              <>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-purple-600 font-extrabold text-[10px]">{card.label}</span>
                  <span className="text-[8px] xl:text-[9px] font-black px-1 py-0.5 rounded-sm uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200 leading-none mt-0.5">
                    {isChangedStatus ? changedStatus : differenceText}
                  </span>
                </div>
                <div className="border-l border-gray-200 h-7 mx-0.5" />
                <div className="flex flex-col text-[9.5px] xl:text-[10px] text-gray-500 leading-tight">
                  <span>{t('summaryCards.oldLabel')}:{' '}<span className="font-semibold text-gray-700">{card.oldValue}</span></span>
                  <span>{t('summaryCards.newLabel')}:{' '}<span className="font-semibold text-purple-600">{card.newValue}</span></span>
                </div>
              </>
            ) : (
              <>
                <span className={`font-extrabold text-xs ${colors.label}`}>{card.label}</span>
                <div className="border-l border-gray-200 h-7 mx-0.5" />
                <div className="flex flex-col text-[9.5px] xl:text-[10px] text-gray-500 leading-tight">
                  <span>{t('summaryCards.oldLabel')}:{' '}<span className="font-semibold text-gray-700">{card.oldValue}{isAreaCard && card.unit ? ' ' + card.unit : ''}</span></span>
                  <span>{t('summaryCards.newLabel')}:{' '}<span className={`font-semibold ${colors.newValue}`}>{card.newValue}{isAreaCard && card.unit ? ' ' + card.unit : ''}</span></span>
                </div>
                <div className="border-l border-gray-200 h-7 mx-0.5" />
                <span
                  className={`font-extrabold text-[10px] xl:text-xs flex items-center shrink-0 ${getDiffColor(card.difference)}`}
                >
                  {getDiffArrow(card.difference)}
                  {typeof card.difference === 'number'
                    ? Math.abs(card.difference)
                    : differenceText.replace(/^[-+]/, '')}
                  {isAreaCard && card.unit ? ' ' + card.unit : ''}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
