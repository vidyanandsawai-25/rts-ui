'use client';

import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/ActionButton';
import { CancelButton, SaveButton } from '@/components/common/ActionButtons';
import type { ULBLogoImagesTabProps } from '@/types/ulbconfig-master.types';
import { ULBLogoUpload } from '../parts/ULBLogoUpload';
import { ULBImageGallery } from '../parts/ULBImageGallery';

export function ULBLogoImagesTab({
  t,
  logoUrl,
  onLogoChange,
  onSave,
  onPrevious,
  onNext,
  isSaving,
  footerClassName,
}: ULBLogoImagesTabProps) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="flex min-h-[420px] gap-4 lg:min-h-[480px]">
          <ULBLogoUpload logoUrl={logoUrl} onLogoChange={onLogoChange} />
          <ULBImageGallery />
        </div>
      </div>

      <div className={`${footerClassName} justify-end`}>
        <CancelButton label={t('buttons.previous')} onClick={onPrevious} className="h-11 rounded-xl px-6" />
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
          {t('buttons.next')}
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}
