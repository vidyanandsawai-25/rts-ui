'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common';

interface ChangeDetectionHeaderProps {
  photoTypeName: string;
  onBackToGrid: () => void;
}

export function ChangeDetectionHeader({
  photoTypeName,
  onBackToGrid,
}: ChangeDetectionHeaderProps): React.ReactElement {
  const t = useTranslations('ptis');

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between px-6 py-3 bg-white border-b border-slate-200 text-slate-800 gap-3 z-10 flex-shrink-0 select-none">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToGrid}
          icon={ArrowLeft}
          className="!text-slate-700 hover:!text-slate-900 !p-1 cursor-pointer transition-colors !bg-slate-100 hover:!bg-slate-200 rounded"
        >
          {t('media.backToGrid')}
        </Button>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-600">{photoTypeName}</span>
      </div>
    </div>
  );
}
