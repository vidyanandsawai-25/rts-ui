'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button, SaveButton } from '@/components/common';
import { useTaxCalculationGuidelineForm } from '@/hooks/configuration-settings/tax-calculation-guideline/useTaxCalculationGuidelineForm';
import type { TaxCalculationGuidelineModuleProps } from '@/types/tax-calculation-guideline.types';
import type { TaxCalculationGuidelineFormData } from '@/types/tax-calculation-guideline.types';

import { GeneralSettingsSection } from './sections/GeneralSettingsSection';
import { CertificateDatePrioritySection } from './sections/CertificateDatePrioritySection';
import { CcOcRulesSection } from './sections/CcOcRulesSection';
import { ElectricBillRulesSection } from './sections/ElectricBillRulesSection';
import { RetrospectiveRulesSection } from './sections/RetrospectiveRulesSection';
import { OtherSettingsSection } from './sections/OtherSettingsSection';
import { TaxGuidelineNoteFooter } from './TaxGuidelineNoteFooter';

/**
 * Client orchestrator for the CC / OC / Electric Bill – Tax Calculation
 * Guideline configuration screen.
 *
 * Renders all sections in order and wires them through the custom hook.
 */
export default function TaxCalculationGuidelineClient({
  initialDto,
  fetchError,
  statusCode,
}: TaxCalculationGuidelineModuleProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { formData, isSaving, isUpdate, handleChange, handleUpdate } = useTaxCalculationGuidelineForm({
    initialDto,
  });

  /** Unified onChange passed to every section component */
  const onChange = useCallback(
    <S extends keyof TaxCalculationGuidelineFormData, K extends keyof TaxCalculationGuidelineFormData[S]>(
      section: S,
      field: K,
      value: TaxCalculationGuidelineFormData[S][K]
    ) => {
      handleChange(section, field, value);
    },
    [handleChange]
  );

  const sectionProps = { formData, onChange };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col gap-0 bg-[#f5f8ff]">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {t('title')}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            id="tax-guideline-cancel-btn"
            type="button"
            variant="secondary"
            onClick={() => window.history.back()}
            className="h-9 rounded-lg px-5 text-sm font-medium"
          >
            {t('buttons.cancel')}
          </Button>
          <SaveButton
            id="tax-guideline-save-btn"
            label={isSaving ? (isUpdate ? t('buttons.updating') : t('buttons.saving')) : (isUpdate ? t('buttons.update') : t('buttons.save'))}
            onClick={() => { void handleUpdate(); }}
            disabled={isSaving}
            className="h-9 rounded-lg px-6 text-sm font-semibold"
          />
        </div>
      </div>

      {/* ── Non-scrollable body ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col gap-4">
        {fetchError && (
          <div className="shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{t('errors.unableToLoad')}:</span>
              <span>{fetchError}</span>
              {statusCode ? <span className="opacity-60">{t('errors.httpStatus', { status: statusCode })}</span> : null}
            </div>
            <span className="text-[10px] bg-red-100 px-2 py-0.5 rounded text-red-600 font-semibold uppercase">
              {t('errors.offlineMode')}
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0 flex-1">
          {/* Left Column */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-0">
              <GeneralSettingsSection {...sectionProps} />
            </div>
            <div className="flex-1 min-h-0">
              <CcOcRulesSection {...sectionProps} />
            </div>
            <div className="flex-1 min-h-0">
              <RetrospectiveRulesSection {...sectionProps} />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-0">
              <CertificateDatePrioritySection {...sectionProps} />
            </div>
            <div className="flex-1 min-h-0">
              <ElectricBillRulesSection {...sectionProps} />
            </div>
            <div className="flex-1 min-h-0">
              <OtherSettingsSection {...sectionProps} />
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <TaxGuidelineNoteFooter />
        </div>
      </div>
    </div>
  );
}
