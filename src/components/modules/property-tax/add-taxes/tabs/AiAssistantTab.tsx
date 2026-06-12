'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { AddTaxesConsoleApi } from '@/types/add-taxes.types';

interface Props {
  api: AddTaxesConsoleApi;
}

export function AiAssistantTab({ api }: Props) {
  const t = useTranslations('addTaxes');

  return (
    <div className="flex flex-col gap-4">
      {/* Input card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-bold text-gray-900">{t('ai.title')}</h2>
        <p className="mt-0.5 text-xs text-gray-500">{t('ai.description')}</p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={api.aiInput}
            onChange={(e) => api.setAiInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && api.parseAiRequest()}
            placeholder={t('ai.inputPlaceholder')}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => api.parseAiRequest()}
            disabled={api.isParsing || !api.aiInput.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {api.isParsing ? '...' : t('ai.parseRequest')}
          </button>
        </div>
      </div>

      {/* Parsed result card */}
      {api.aiParsed && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-gray-900">{t('ai.parsedTitle')}</h2>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                { label: t('ai.parsedScope'), value: api.aiParsed.scope, highlight: false },
                { label: t('ai.parsedOperation'), value: api.aiParsed.operation, highlight: false },
                { label: t('ai.parsedEligible'), value: String(api.aiParsed.eligibleRecords), highlight: false },
                { label: t('ai.parsedStatus'), value: api.aiParsed.status, highlight: true },
              ] satisfies { label: string; value: string; highlight: boolean }[]
            ).map(({ label, value, highlight }) => (
              <div key={label} className="rounded-md border border-gray-100 bg-gray-50 p-2.5">
                <p className="text-xs text-gray-500">{label}</p>
                <p
                  className={cn(
                    'mt-0.5 text-sm font-semibold',
                    highlight && value === 'Allowed' ? 'text-green-700' : 'text-gray-900',
                  )}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => api.setAiInput('')}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('ai.editRequest')}
            </button>
            <button
              type="button"
              onClick={() => api.openReview()}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('ai.confirmProceed')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
