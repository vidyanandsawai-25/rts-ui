'use client';
 
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Settings, Award, Zap, RotateCcw, Disc, ShieldCheck, Database, SlidersHorizontal, Layers, Calculator, RefreshCw } from 'lucide-react';
import { Button, SaveButton } from '@/components/common';
import { useTaxCalculationGuidelineForm } from '@/hooks/configuration-settings/tax-calculation-guideline/useTaxCalculationGuidelineForm';
import type { TaxCalculationGuidelineModuleProps } from '@/types/tax-calculation-guideline.types';
import { DynamicGuidelineField } from './TaxFormField';
import { TaxGuidelineNoteFooter } from './TaxGuidelineNoteFooter';
 
/** Visual config per section group key. */
const SECTION_CONFIGS: Record<string, {
  gradient: string;
  /** Lucide icon element rendered in the gradient header. */
  icon: ReactNode;
  /** Number of columns in the inner field grid. */
  cols: 2 | 3 | 4;
  /**
   * When true, toggle/BIT fields span both columns so that the
   * remaining non-toggle fields pair up correctly below them.
   * Useful for sections like Partial Policy where you want
   * CC Partial | CC Full, OC Partial | OC Full, etc.
   */
  colSpanToggle?: boolean;
}> = {
  // GENERAL: { gradient: 'from-blue-500 to-violet-600', icon: <Settings className="w-4 h-4" />, cols: 2 },
  // DATE_PRIORITY: { gradient: 'from-purple-500 to-indigo-600', icon: <Award className="w-4 h-4" />, cols: 2 },
  // CC_OC: { gradient: 'from-emerald-500 to-teal-600', icon: <Settings className="w-4 h-4" />, cols: 4 },
  // CC: { gradient: 'from-blue-500 to-purple-600', icon: <Disc className="w-4 h-4" />, cols: 3 },
  // OC: { gradient: 'from-orange-400 to-amber-500', icon: <Disc className="w-4 h-4" />, cols: 3 },
  // ELECTRIC_BILL: { gradient: 'from-orange-400 to-amber-600', icon: <Zap className="w-4 h-4" />, cols: 3 },
  // RETROSPECTIVE: { gradient: 'from-pink-500 to-rose-600', icon: <RotateCcw className="w-4 h-4" />, cols: 3 },
  // // Advanced sections – distinct colorful gradients
  // SCOPE: { gradient: 'from-teal-500 to-cyan-600', icon: <SlidersHorizontal className="w-4 h-4" />, cols: 2 },
  // VALIDATION: { gradient: 'from-indigo-500 to-blue-600', icon: <ShieldCheck className="w-4 h-4" />, cols: 2 },
  // PRORATION: { gradient: 'from-green-500 to-emerald-600', icon: <Calculator className="w-4 h-4" />, cols: 2 },
  // PARTIAL_POLICY: { gradient: 'from-violet-500 to-purple-600', icon: <Layers className="w-4 h-4" />, cols: 4 },
  // PERSISTENCE: { gradient: 'from-amber-500 to-orange-600', icon: <Database className="w-4 h-4" />, cols: 2 },
  // RECALCULATION: { gradient: 'from-rose-500 to-red-600', icon: <RefreshCw className="w-4 h-4" />, cols: 2 },
 
 
  GENERAL: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <Settings className="w-4 h-4" />, cols: 2 },
  DATE_PRIORITY: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <Award className="w-4 h-4" />, cols: 2 },
  CC_OC: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <Settings className="w-4 h-4" />, cols: 4 },
  CC: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <Disc className="w-4 h-4" />, cols: 3 },
  OC: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <Disc className="w-4 h-4" />, cols: 3 },
  ELECTRIC_BILL: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <Zap className="w-4 h-4" />, cols: 3 },
  RETROSPECTIVE: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <RotateCcw className="w-4 h-4" />, cols: 3 },
  // Advanced sections – distinct colorful gradients
  SCOPE: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <SlidersHorizontal className="w-4 h-4" />, cols: 2 },
  VALIDATION: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <ShieldCheck className="w-4 h-4" />, cols: 2 },
  PRORATION: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <Calculator className="w-4 h-4" />, cols: 2 },
  PARTIAL_POLICY: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <Layers className="w-4 h-4" />, cols: 4 },
  PERSISTENCE: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <Database className="w-4 h-4" />, cols: 2 },
  RECALCULATION: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <RefreshCw className="w-4 h-4" />, cols: 2 },
  RECALCULATE: { gradient: "from-[#4F73A8] to-[#5D7FB3]", icon: <RefreshCw className="w-4 h-4" />, cols: 2 },
};
 
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
  policyConfigs,
}: TaxCalculationGuidelineModuleProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { formData, isSaving, isUpdate, onChangeGuideline, handleUpdate } = useTaxCalculationGuidelineForm({
    initialDto,
  });
 
  const { dynamicGuidelines = [], generalSettings } = formData;
 
  const isCertTaxDisabled = !generalSettings.enableCertificateBasedTax;
 
  // Determine if a field should be disabled conditionally based on business rules
  const isFieldDisabled = (code: string) => {
    if (code === 'ENABLE_CERTIFICATE_BASED_TAX') return false;
    if (isCertTaxDisabled) return true;
 
    // CC & OC Rules conditional disable
    if ([
      'IGNORE_CC_TO_OC_IF_WITHIN_VALUE', 'IGNORE_CC_TO_OC_IF_WITHIN_TYPE', 'CC_OC_GAP_COMPARISON',
      'CC_OC_GAP_WITHIN_ACTION', 'CC_OC_GAP_EXCEEDED_ACTION', 'INVALID_CC_OC_DATE_ORDER_ACTION',
      'CC_PERIOD_MULTIPLIER', 'OC_PERIOD_MULTIPLIER', 'ENABLE_CURRENT_FY_PARTIAL_POLICY',
      'CC_PARTIAL_POLICY_CODE', 'CC_FULL_POLICY_CODE', 'OC_PARTIAL_POLICY_CODE', 'OC_FULL_POLICY_CODE'
    ].includes(code)) {
      const splitVal = dynamicGuidelines.find(g => g.guidelineCode === 'ENABLE_CC_TO_OC_SPLIT')?.guidelineValue;
      const isSplitOff = splitVal !== 'true' && splitVal !== '1';
      return isSplitOff;
    }
 
    // Electric Bill Rules conditional disable
    if ([
      'ELECTRIC_BILL_CERTIFICATE_CODES', 'ELECTRIC_BILL_ADD_MONTHS', 'ELECTRIC_BILL_MULTIPLIER',
      'ELECTRIC_BILL_MINIMUM_FINANCIAL_YEAR', 'ELECTRIC_BILL_PARTIAL_POLICY_CODE', 'ELECTRIC_BILL_FULL_POLICY_CODE'
    ].includes(code)) {
      const ebDateRule = dynamicGuidelines.find(g => g.guidelineCode === 'ELECTRIC_BILL_DATE_RULE')?.guidelineValue;
      const isEbDisabled = !ebDateRule || ebDateRule === 'Select' || ebDateRule === 'NO_TAX';
      return isEbDisabled;
    }
 
    // Retrospective Rules conditional disable
    if ([
      'NO_DATE_RULE', 'LOOKBACK_YEARS', 'RETROSPECTIVE_CURRENT_YEAR_COUNT',
      'RETROSPECTIVE_PENDING_YEAR_COUNT_MODE', 'DEFAULT_RETROSPECTIVE_MULTIPLIER'
    ].includes(code)) {
      const retroVal = dynamicGuidelines.find(g => g.guidelineCode === 'ENABLE_RETROSPECTIVE_TAX')?.guidelineValue;
      const isRetroOff = retroVal !== 'true' && retroVal !== '1';
      return isRetroOff;
    }
 
    // Proration Rules conditional disable
    if ([
      'PRORATION_METHOD', 'CURRENT_YEAR_PRORATION_START_RULE'
    ].includes(code)) {
      const prorationVal = dynamicGuidelines.find(g => g.guidelineCode === 'ENABLE_CURRENT_YEAR_PRORATION')?.guidelineValue;
      const isProrationOff = prorationVal !== 'true' && prorationVal !== '1';
      return isProrationOff;
    }
 
    return false;
  };

  // Map backend GuidelineGroup strings (e.g., "General Settings", "CC & OC Rules") to internal section keys
  const GROUP_KEY_MAP: Record<string, string> = {
    'General Settings': 'GENERAL',
    'GENERAL': 'GENERAL',
    'Certificate Date Priority': 'DATE_PRIORITY',
    'DATE_PRIORITY': 'DATE_PRIORITY',
    'CC & OC Rules': 'CC_OC',
    'CC_OC': 'CC_OC',
    'Tax Multipliers': 'CC_OC',
    'Electric Bill Rules': 'ELECTRIC_BILL',
    'ELECTRIC_BILL': 'ELECTRIC_BILL',
    'CC Rules': 'CC',
    'CC': 'CC',
    'OC Rules': 'OC',
    'OC': 'OC',
    'Retrospective Rules': 'RETROSPECTIVE',
    'RETROSPECTIVE': 'RETROSPECTIVE',
    'Finance Year Settings': 'GENERAL',
    'Current Year Proration': 'PRORATION',
    'PRORATION': 'PRORATION',
    'Tax Persistence': 'PERSISTENCE',
    'PERSISTENCE': 'PERSISTENCE',
    'Recalculation Triggers': 'RECALCULATE',
    'RECALCULATION': 'RECALCULATE',
    'Policy Codes': 'PARTIAL_POLICY',
    'PARTIAL_POLICY': 'PARTIAL_POLICY',
    'Scope Settings': 'SCOPE',
    'SCOPE': 'SCOPE',
    'Validation': 'VALIDATION',
    'VALIDATION': 'VALIDATION',
  };

  // Group guidelines by mapped section key
  const groupedGuidelines: Record<string, typeof dynamicGuidelines> = {};
  for (const item of dynamicGuidelines) {
    if (item.isActive === false) continue;
    if (!item.guidelineCode) continue;
    const rawGroup = item.guidelineGroup;
    if (!rawGroup || rawGroup.trim() === '') continue;
    const group = GROUP_KEY_MAP[rawGroup.trim()] || rawGroup.trim();
    if (!groupedGuidelines[group]) {
      groupedGuidelines[group] = [];
    }
    groupedGuidelines[group].push(item);
  }
 
  // Sort each group's items by DisplayOrder
  for (const group of Object.keys(groupedGuidelines)) {
    groupedGuidelines[group].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }
 
  const renderGroupSection = (groupKey: string, titleKey: string) => {
    const guidelines = groupedGuidelines[groupKey] || [];
    if (guidelines.length === 0) return null;
 
    const cfg = SECTION_CONFIGS[groupKey] ?? {
      gradient: 'from-[#4F73A8] to-[#5D7FB3]',
      icon: <Settings className="w-4 h-4" />,
      cols: 2 as const,
    };
 
    const colClass =
      cfg.cols === 4
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        : cfg.cols === 3
          ? 'grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2';

    const isToggleCode = (code: string, dataType?: string | null) =>
      dataType === 'BIT' ||
      code.startsWith('ENABLE_') ||
      code.startsWith('SAVE_') ||
      code.startsWith('ALLOW_') ||
      [
        'CERTIFICATE_REQUIRE_NO_AND_DATE', 'APPLY_ONLY_TAXABLE_CERT_TYPES',
        'DO_NOT_UPDATE_NETTAX', 'RECALCULATE_ON_CERTIFICATE_SAVE',
        'RECALCULATE_ON_CERTIFICATE_DELETE',
      ].includes(code);
 
    return (
      <div key={groupKey} className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className={`bg-gradient-to-r ${cfg.gradient} px-4 py-2.5 flex items-center gap-2 rounded-t-xl`}>
          <span className="text-white opacity-90">{cfg.icon}</span>
          <h2 className="text-sm font-bold text-white tracking-wide">
            {t.has(titleKey) ? t(titleKey) : groupKey}
          </h2>
        </div>

        <div className={`grid ${colClass} gap-x-4 gap-y-4 px-4 py-4`}>
          {guidelines.map((guideline) => {
            const spanFull =
              cfg.colSpanToggle === true &&
              isToggleCode(guideline.guidelineCode!, guideline.dataType);
 
            return (
              <div
                key={guideline.guidelineCode}
                className={`flex flex-col${spanFull ? ' col-span-full' : ''}`}
              >
                <DynamicGuidelineField
                  guideline={guideline}
                  value={guideline.guidelineValue}
                  onChange={(val) => onChangeGuideline?.(guideline.guidelineCode!, val)}
                  disabled={isFieldDisabled(guideline.guidelineCode!)}
                  t={t}
                  policyConfigs={policyConfigs}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };
 
  // ─── Render ────────────────────────────────────────────────────────────────
 
  return (
    <div className="flex h-full min-h-screen flex-col gap-0 bg-[#f0f4ff] relative">
      {/* ── Page Header (Sticky) ───────────────────────────────────────────── */}
      <div className="sticky top-20 z-20 flex shrink-0 items-start justify-between border-b border-slate-200/90 bg-white/95 backdrop-blur-sm px-6 py-4 shadow-md transition-shadow">
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
 
      {/* ── Scrollable body ────────────────────────────────────────────────── */}
      <div className="flex-1 px-6 py-5 flex flex-col gap-5">
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
 
        {/* ── Two-column main grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Left Column */}
          <div className="flex flex-col gap-5">
            {renderGroupSection('GENERAL', 'sections.generalSettings')}
            {renderGroupSection('CC_OC', 'sections.ccOcRules')}
            {renderGroupSection('OC', 'sections.ocRules')}
            {renderGroupSection('RETROSPECTIVE', 'sections.retrospectiveRules')}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5">
            {renderGroupSection('DATE_PRIORITY', 'sections.datePriority')}
            {renderGroupSection('ELECTRIC_BILL', 'sections.electricBillRules')}
            {renderGroupSection('CC', 'sections.ccRules')}
          </div>
        </div>

        {/* ── Dynamic unmapped groups (if any custom group is added in DB) ── */}
        {(() => {
          const knownGroups = new Set([
            'GENERAL', 'DATE_PRIORITY', 'CC_OC', 'CC', 'OC', 'ELECTRIC_BILL',
            'RETROSPECTIVE', 'SCOPE', 'VALIDATION', 'PRORATION', 'PERSISTENCE',
            'RECALCULATE', 'RECALCULATION', 'PARTIAL_POLICY'
          ]);
          const unmappedGroups = Object.keys(groupedGuidelines).filter((g) => !knownGroups.has(g));
          if (unmappedGroups.length === 0) return null;

          return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {unmappedGroups.map((group) => (
                <div key={group}>
                  {renderGroupSection(group, group)}
                </div>
              ))}
            </div>
          );
        })()}

        {/* ── Collapsible Advanced Settings ───────────────────────────────── */}
        <details className="group bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-300">
          <summary className="flex items-center justify-between px-5 py-3.5 font-bold text-sm text-slate-800 cursor-pointer list-none select-none">
            <span>{t('sections.advancedSettings')}</span>
            <span className="transition group-open:rotate-180">
              <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" className="text-slate-500 w-4 h-4"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
          </summary>
          <div className="px-5 pb-5 pt-1 border-t border-slate-100 flex flex-col gap-5">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-1">
              <div className="flex flex-col gap-5">
                {renderGroupSection('SCOPE', 'sections.scopeSettings')}
                {renderGroupSection('VALIDATION', 'sections.certificateValidation')}
                {renderGroupSection('PRORATION', 'sections.prorationRules')}
              </div>
              <div className="flex flex-col gap-5">
                {renderGroupSection('PERSISTENCE', 'sections.persistenceSettings')}
                {renderGroupSection('RECALCULATE', 'sections.recalculationSettings') || renderGroupSection('RECALCULATION', 'sections.recalculationSettings')}
                {renderGroupSection('PARTIAL_POLICY', 'sections.partialPolicy')}
              </div>
            </div>
          </div>
        </details>
 
        <div className="shrink-0">
          <TaxGuidelineNoteFooter />
        </div>
      </div>
    </div>
  );
}