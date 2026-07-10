'use client';

import { Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, Button } from '@/components/common';
import { ImageWithFallback } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import type { ULBImageCardProps } from '@/types/ulbconfig-master.types';

export function ULBImageCard({
  title,
  imageUrl,
  imageId,
  isUploading,
  required = false,
  onTriggerUploadOrReplace,
  onTriggerDelete,
  helpText,
  icon: Icon,
  iconBgColor = 'bg-indigo-50',
  iconTextColor = 'text-indigo-600',
}: ULBImageCardProps) {
  const t = useTranslations('ulb_configuration');

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-white">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-4 py-2.5">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBgColor}`}>
          <Icon className={`h-3.5 w-3.5 ${iconTextColor}`} />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700">
          {title}
        </span>
        {required ? (
          <Badge className="ml-auto border-none bg-rose-50 px-2 py-0.5 text-[8px] font-black uppercase text-rose-600">
            {t('fields.required')}
          </Badge>
        ) : (
          <Badge className="ml-auto border-none bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase text-slate-500">
            {t('fields.optional')}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 justify-center items-center">
        {imageUrl ? (
          <div className="flex flex-1 flex-col items-center justify-center w-full">
            <div className="relative mb-3 w-full max-w-[140px] aspect-square flex items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                disabled={isUploading}
                onClick={onTriggerUploadOrReplace}
                className="flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-2 hover:border-blue-300 transition-colors animate-in fade-in duration-200"
              >
                <ImageWithFallback
                  src={imageUrl}
                  alt={title}
                  width={140}
                  height={140}
                  className="max-h-full max-w-full object-contain"
                />
              </Button>
              {imageId && (
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerDelete();
                  }}
                  disabled={isUploading}
                  className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-rose-500 p-0 text-white shadow-md hover:bg-rose-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                  title="Remove Image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {helpText && (
              <div className="w-full text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {helpText}
                </p>
              </div>
            )}
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            disabled={isUploading}
            onClick={onTriggerUploadOrReplace}
            className="flex min-h-[120px] aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50/50 to-slate-100/50 hover:border-blue-300 transition-colors"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm border border-slate-100">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold text-slate-600">
              {isUploading ? t('messages.uploading') || 'Uploading...' : 'Click to Upload'}
            </p>
          </Button>
        )}
      </div>
    </div>
  );
}
