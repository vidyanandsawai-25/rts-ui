'use client';

import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/ActionButton';
import { CancelButton, SaveButton } from '@/components/common/ActionButtons';
import type { ULBProjectLicenseTabProps } from '@/types/ulbconfig-master.types';
import { ULBProjectInfoSection } from '../parts/ULBProjectInfoSection';
import { ULBLicenseSection } from '../parts/ULBLicenseSection';

export function ULBProjectLicenseTab({
  formData,
  masterRenewalAlerts,
  t,
  onFieldChange,
  onLicenseFieldChange,
  onGenerateLicenseKey,
  onSave,
  onPrevious,
  onNext,
  isSaving,
  footerClassName,
}: ULBProjectLicenseTabProps) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <ULBProjectInfoSection formData={formData} t={t} onFieldChange={onFieldChange} />
        <ULBLicenseSection
          formData={formData}
          masterRenewalAlerts={masterRenewalAlerts}
          t={t}
          onFieldChange={onFieldChange}
          onLicenseFieldChange={onLicenseFieldChange}
          onGenerateLicenseKey={onGenerateLicenseKey}
        />
      </div>

      <div className={`${footerClassName} justify-between`}>
        <CancelButton label={t('buttons.previous')} onClick={onPrevious} className="h-11 rounded-xl px-6" />
        <div className="flex items-center gap-3">
          <SaveButton
            label={t('buttons.save')}
            onClick={onSave}
            disabled={isSaving}
            className="h-11 rounded-xl px-6"
          />
          <Button
            onClick={onNext}
            disabled={isSaving}
            className="flex h-11 items-center gap-2.5 rounded-xl bg-blue-700 px-8 font-black text-white hover:bg-blue-800"
          >
            {t('buttons.continueToDepartments')}
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
}
