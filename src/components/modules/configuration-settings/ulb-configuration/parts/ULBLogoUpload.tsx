'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Building2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/ActionButton';
import { IMAGE_CONSTRAINTS } from '@/config/ulb-configuration.config';
import type { ULBLogoUploadProps } from '@/types/ulbconfig-master.types';

const { MAX_LOGO_BYTES } = IMAGE_CONSTRAINTS;

export function ULBLogoUpload({ logoUrl, onLogoChange }: ULBLogoUploadProps) {
  const t = useTranslations('ulb_configuration');
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('messages.invalidImageFile'));
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error(t('messages.logoSizeExceeded'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onLogoChange(result);
      setFileName(file.name);
      toast.success(t('messages.logoUploadSuccess'));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="flex w-[300px] flex-shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-white">
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-indigo-400" />
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
          <Building2 className="h-4 w-4 text-indigo-600" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
          {t('sections.logoUpload')}
        </span>
        <Badge className="ml-auto border-none bg-rose-50 px-2 text-[9px] font-black uppercase text-rose-600">
          {t('fields.required')}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          aria-hidden
        />

        {logoUrl ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => inputRef.current?.click()}
              className="relative mb-6 flex aspect-square h-auto w-full max-w-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 hover:border-indigo-300"
            >
              <Image
                src={logoUrl}
                alt={t('sections.logoUpload')}
                width={200}
                height={200}
                className="max-h-full max-w-full object-contain"
                unoptimized
              />
            </Button>
            <div className="w-full text-center">
              <p className="truncate px-2 text-sm font-bold text-slate-700">
                {fileName ?? t('messages.logoUploaded')}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">
                {t('messages.logoIdentityHint')}
              </p>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-[280px] h-auto w-full flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50/50 to-slate-100/50 hover:border-indigo-300"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-md">
              <Upload className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-slate-600">{t('messages.clickToUploadLogo')}</p>
            <p className="mt-2 text-xs text-slate-400">{t('messages.logoFormatHint')}</p>
          </Button>
        )}
      </div>
    </div>
  );
}
