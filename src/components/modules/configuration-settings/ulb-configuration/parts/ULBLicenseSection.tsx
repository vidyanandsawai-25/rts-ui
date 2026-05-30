'use client';

import { Bell, Clock, Key, RefreshCw, Shield } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/ActionButton';
import {
  LICENSE_DURATION_OPTIONS,
  LICENSE_TYPES,
  SUPPORT_TYPES,
  toOptions,
} from '@/config/ulb-configuration.config';
import { formatExpiryDate } from '@/lib/utils/ulb-configuration.utils';
import type { ULBLicenseSectionProps } from '@/types/ulbconfig-master.types';
import { UlbInput, UlbInputMd, UlbSelectMd } from '../ULBFormField';

const PRESET_DURATIONS = ['1', '3', '6', '12', '18', '24', '36', '48', '60', '999'];

function isCustomDuration(duration: string): boolean {
  return duration === 'custom' || (duration !== '' && !PRESET_DURATIONS.includes(duration));
}

export function ULBLicenseSection({
  formData,
  masterRenewalAlerts,
  t,
  onFieldChange,
  onLicenseFieldChange,
  onGenerateLicenseKey,
  onFieldBlur,
  getFieldError,
}: ULBLicenseSectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
      <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">{t('sections.licenseConfiguration')}</h3>
            <p className="text-xs text-slate-500">{t('sections.licenseConfigurationHint')}</p>
          </div>
        </div>
        {formData.licenseEndDate && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2">
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600">{t('fields.expires')}</p>
              <p className="text-sm font-black text-slate-800">{formatExpiryDate(formData.licenseEndDate)}</p>
            </div>
            <Badge className="border-amber-300 bg-amber-100 text-[9px] font-black text-amber-700">
              {formData.licenseDuration === '999' ? t('status.lifetime') : t('status.standard')}
            </Badge>
          </div>
        )}
      </header>

      <div className="grid grid-cols-12 gap-x-8 gap-y-5 p-5">
        <div className="col-span-5 space-y-4">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">{t('sections.licenseDetails')}</span>
          </div>
          <UlbSelectMd label={t('fields.licenseType')} required options={toOptions(LICENSE_TYPES)} value={formData.licenseType} error={getFieldError('licenseType')} onChange={(v) => onFieldChange('licenseType', v)} onBlur={() => onFieldBlur('licenseType')} placeholder={t('placeholders.selectPeriod')} />
          <div className="flex items-end gap-2">
            <UlbInput label={t('fields.licenseKey')} required placeholder={t('placeholders.licenseKey')} value={formData.licenseKey} readOnly fullWidth error={getFieldError('licenseKey')} onBlur={() => onFieldBlur('licenseKey')} className="bg-slate-50 font-mono text-xs font-bold tracking-wider text-blue-600" />
            <Button size="sm" variant="secondary" onClick={onGenerateLicenseKey} aria-label="Generate license key" className="mb-0.5">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <UlbSelectMd label={t('fields.supportType')} required options={toOptions(SUPPORT_TYPES)} value={formData.supportType} error={getFieldError('supportType')} onChange={(v) => onFieldChange('supportType', v)} onBlur={() => onFieldBlur('supportType')} placeholder={t('placeholders.selectPeriod')} />
        </div>

        <div className="col-span-1 flex justify-center">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
        </div>

        <div className="col-span-6 space-y-4">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">{t('sections.durationLimits')}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <UlbInputMd label={t('fields.licenseStartDate')} required type="date" value={formData.licenseStartDate} error={getFieldError('licenseStartDate')} onChange={(e) => onLicenseFieldChange('licenseStartDate', e.target.value)} onBlur={() => onFieldBlur('licenseStartDate')} />
            {isCustomDuration(formData.licenseDuration) ? (
              <div className="flex items-end gap-2">
                <UlbInputMd label={t('fields.licenseDuration')} required type="number" min={1} max={120} placeholder={t('placeholders.months')} value={formData.licenseDuration === 'custom' ? '' : formData.licenseDuration} error={getFieldError('licenseDuration')} onChange={(e) => onLicenseFieldChange('licenseDuration', e.target.value)} onBlur={() => onFieldBlur('licenseDuration')} fullWidth />
                <Button variant="secondary" size="sm" onClick={() => onLicenseFieldChange('licenseDuration', '12')} className="mb-0.5">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <UlbSelectMd label={t('fields.licenseDuration')} required options={LICENSE_DURATION_OPTIONS} value={formData.licenseDuration} error={getFieldError('licenseDuration')} onChange={(v) => onLicenseFieldChange('licenseDuration', v)} onBlur={() => onFieldBlur('licenseDuration')} placeholder={t('placeholders.selectPeriod')} />
            )}
          </div>
        </div>
      </div>

      {masterRenewalAlerts.length > 0 && (
        <div className="border-t border-slate-100 px-5 pt-4 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold uppercase text-slate-500">{t('sections.renewalAlerts')}</span>
            </div>
            <div className="flex gap-2">
              {masterRenewalAlerts.slice(0, 4).map((alert, idx) => (
                <span
                  key={idx}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                    alert.triggered ? 'border-amber-200 bg-amber-100 text-amber-700' : 'border-slate-200 bg-slate-100 text-slate-500'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${alert.triggered ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  {alert.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
