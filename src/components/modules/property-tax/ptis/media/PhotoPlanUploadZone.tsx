'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/common';
import { useTranslations } from 'next-intl';

interface PhotoPlanUploadZoneProps {
  title: string;
  onUpload: () => void;
}

export function PhotoPlanUploadZone({
  title,
  onUpload,
}: PhotoPlanUploadZoneProps): React.ReactElement {
  const t = useTranslations('ptis');

  return (
    <div
      onClick={onUpload}
      className="w-[480px] h-[360px] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-slate-100/50 hover:border-blue-500 transition-all cursor-pointer p-6"
    >
      <div className="p-4 bg-white rounded-full border border-slate-200 text-slate-500 transition-colors shadow-sm">
        <Upload className="w-8 h-8" />
      </div>
      <div className="text-center">
        <h5 className="text-slate-700 text-sm font-semibold mb-1">{t('media.noImageUploaded')}</h5>
        <p className="text-slate-500 text-xs max-w-xs mx-auto">
          {t('media.clickToUpload', { title })}
        </p>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onUpload();
        }}
        icon={Upload}
        className="!bg-blue-600 hover:!bg-blue-700 !text-white mt-2 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
      >
        {t('media.uploadImage')}
      </Button>
    </div>
  );
}
