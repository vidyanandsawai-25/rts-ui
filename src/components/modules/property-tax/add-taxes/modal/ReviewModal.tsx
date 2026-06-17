'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, X } from 'lucide-react';
import { AddTaxesConsoleApi } from '@/types/add-taxes.types';

interface Props {
  api: AddTaxesConsoleApi;
}

const OP_LABELS: Record<string, string> = {
  AddTax: 'Add Tax',
  QuarterlyAdd: 'Quarterly Add',
  RemoveTax: 'Remove Tax',
  QuarterlyRemove: 'Quarterly Remove',
};

const SCOPE_LABELS: Record<string, string> = {
  all: 'All Properties',
  zone: 'Zone / Node',
  ward: 'Ward / Sector',
  building: 'Building Wise',
  property: 'Property Wise',
  range: 'Property Range',
};

export function ReviewModal({ api }: Props) {
  const t = useTranslations('addTaxes');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="review-modal-title" className="text-base font-bold text-gray-900">
            {t('review.title')}
          </h2>
          <button
            type="button"
            onClick={api.closeReview}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label={t('review.cancel')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 p-5">
          <p className="text-sm text-gray-500">{t('review.subtitle')}</p>

          {/* Summary grid */}
          <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200 text-sm">
            {(
              [
                { key: 'operation', value: api.operation ? (OP_LABELS[api.operation] ?? api.operation) : '—' },
                { key: 'financeYear', value: api.financeYear || '—' },
                { key: 'scope', value: SCOPE_LABELS[api.scopeType] ?? api.scopeType },
                { key: 'eligibleCount', value: (api.eligible ?? 0).toLocaleString() },
              ] as const
            ).map(({ key, value }) => (
              <div key={key} className="flex justify-between px-4 py-2.5">
                <dt className="text-gray-500">{t(`review.${key}`)}</dt>
                <dd className="font-semibold text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>
              {t('review.warning', { count: (api.eligible ?? 0).toLocaleString() })}
            </span>
          </div>

          {/* Options summary */}
          {(api.options.applyInterestPenalty || api.options.sendSms || api.options.sendEmail) && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-600">
              <p className="mb-1 font-semibold text-gray-700">{t('review.options')}</p>
              <ul className="list-inside list-disc space-y-0.5">
                {api.options.applyInterestPenalty && <li>{t('context.applyInterestPenalty')}</li>}
                {api.options.sendSms && <li>{t('context.sendSms')}</li>}
                {api.options.sendEmail && <li>{t('context.sendEmail')}</li>}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={api.closeReview}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('review.cancel')}
          </button>
          <button
            type="button"
            onClick={() => api.executeJob()}
            disabled={api.isExecuting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {api.isExecuting ? '...' : t('review.proceed')}
          </button>
        </div>
      </div>
    </div>
  );
}
