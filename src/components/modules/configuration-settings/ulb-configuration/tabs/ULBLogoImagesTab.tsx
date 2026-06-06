'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/ActionButton';
import { SaveButton } from '@/components/common/ActionButtons';
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
        <Button
          onClick={onPrevious}
          icon={ChevronLeft}
          className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-blue-700 bg-blue-700 px-6 font-semibold text-white shadow-sm hover:bg-blue-700 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
        >
          {t('buttons.previous')}
        </Button>
        <SaveButton
          label={t('buttons.save')}
          onClick={onSave}
          disabled={isSaving}
          className="h-11 rounded-xl px-6"
        />
        <Button
          onClick={onNext}
          disabled={isSaving}
          icon={ChevronRight}
          iconPosition="right"
          className="inline-flex h-11 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-blue-700 px-8 font-black text-white hover:bg-blue-800"
        >
          {t('buttons.next')}
        </Button>
      </div>
    </>
  );
}
