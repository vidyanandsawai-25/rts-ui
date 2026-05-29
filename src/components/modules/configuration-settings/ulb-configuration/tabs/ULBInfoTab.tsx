'use client';

import { Building2, ChevronRight, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/ActionButton';
import { SaveButton } from '@/components/common/ActionButtons';
import {
  INDIAN_STATES,
  ULB_TYPES,
  getDistrictsForState,
  toOptions,
} from '@/config/ulb-configuration.config';
import type { ULBInfoTabProps } from '@/types/ulbconfig-master.types';
import { UlbInput, UlbSelect } from '../ULBFormField';
import { ULBContactAddressCard } from '../parts/ULBContactAddressCard';

const CARD_CLASS = 'flex h-full flex-col border-none bg-white/80 ring-1 ring-slate-200/60';
const TITLE_CLASS =
  'flex items-center gap-2 text-xs font-black uppercase tracking-tight text-slate-800';

export function ULBInfoTab({
  formData,
  t,
  onFieldChange,
  onStateChange,
  onSave,
  onNext,
  footerClassName,
}: ULBInfoTabProps) {
  const districtOptions = toOptions(getDistrictsForState(formData.state));

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
          <Card className={CARD_CLASS}>
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className={TITLE_CLASS}>
                <Building2 className="h-3.5 w-3.5 text-primary" />
                {t('sections.ulbDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 px-4 pb-4">
              <UlbInput
                label={t('fields.ulbName')}
                required
                placeholder={t('placeholders.ulbName')}
                value={formData.ulbName}
                onChange={(e) => onFieldChange('ulbName', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <UlbInput
                  label={t('fields.ulbCode')}
                  required
                  placeholder={t('placeholders.ulbCode')}
                  value={formData.ulbCode}
                  onChange={(e) => onFieldChange('ulbCode', e.target.value)}
                />
                <UlbSelect
                  label={t('fields.ulbType')}
                  required
                  options={toOptions(ULB_TYPES)}
                  value={formData.ulbType}
                  onChange={(v) => onFieldChange('ulbType', v)}
                  placeholder={t('placeholders.selectType')}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={CARD_CLASS}>
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className={TITLE_CLASS}>
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {t('sections.locationInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 px-4 pb-4">
              <UlbSelect
                label={t('fields.state')}
                required
                options={toOptions(INDIAN_STATES)}
                value={formData.state}
                onChange={onStateChange}
                placeholder={t('placeholders.selectState')}
              />
              <UlbSelect
                label={t('fields.district')}
                required
                options={districtOptions}
                value={formData.district}
                onChange={(v) => onFieldChange('district', v)}
                disabled={!formData.state}
                placeholder={formData.state ? t('placeholders.district') : t('placeholders.selectState')}
              />
              <UlbInput
                label={t('fields.pincode')}
                required
                placeholder={t('placeholders.pincode')}
                value={formData.pincode}
                onChange={(e) => onFieldChange('pincode', e.target.value)}
                className="max-w-[180px]"
              />
            </CardContent>
          </Card>

          <Card className={CARD_CLASS}>
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className={TITLE_CLASS}>
                <User className="h-3.5 w-3.5 text-primary" />
                {t('sections.contactInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 px-4 pb-4">
              <UlbInput
                label={t('fields.contactPerson')}
                required
                placeholder={t('placeholders.contactName')}
                value={formData.contactPerson}
                onChange={(e) => onFieldChange('contactPerson', e.target.value)}
              />
              <UlbInput
                label={t('fields.designation')}
                required
                placeholder={t('placeholders.designation')}
                value={formData.designation}
                onChange={(e) => onFieldChange('designation', e.target.value)}
              />
            </CardContent>
          </Card>

          <ULBContactAddressCard formData={formData} t={t} onFieldChange={onFieldChange} />
        </div>
      </div>

      <div className={`${footerClassName} justify-end`}>
        <SaveButton label={t('buttons.save')} onClick={onSave} className="h-11 rounded-xl px-6" />
        <Button
          onClick={onNext}
          className="flex h-11 items-center gap-2.5 rounded-xl bg-blue-700 px-8 font-black text-white hover:bg-blue-800"
        >
          {t('buttons.next')}
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}
