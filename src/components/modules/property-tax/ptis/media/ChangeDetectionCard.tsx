'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ChangeDetectionCardProps {
  beforeImageSrc?: string;
  afterImageSrc?: string;
  beforeLabel?: string;
  afterLabel?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function ChangeDetectionCard({
  beforeImageSrc = '/images/thane-earth-2018.jpg',
  afterImageSrc = '/images/thane-earth-2026.jpg',
  beforeLabel = '2018',
  afterLabel = '2026',
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ChangeDetectionCardProps): React.ReactElement {
  const t = useTranslations('ptis');

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        relative h-[200px] lg:h-[220px] w-full rounded-lg overflow-hidden
        border border-slate-200/80 shadow-md transition-all duration-300
        hover:shadow-lg hover:border-blue-400 bg-white
        ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''}
      `}
    >
      {/* 50/50 split container */}
      <div className="grid grid-cols-2 h-full w-full relative">
        {/* Left Side: Before */}
        <div className="relative h-full w-full overflow-hidden group/before border-r border-slate-200">
          <Image
            src={beforeImageSrc}
            alt={`${beforeLabel} Satellite View`}
            fill
            sizes="(max-width: 768px) 50vw, 100px"
            priority
            className="object-cover transition-transform duration-500 group-hover/before:scale-110"
          />
          {/* Year Badge */}
          <div className="absolute top-2 left-2 z-10 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-[1px]">
            {beforeLabel}
          </div>
        </div>

        {/* Right Side: After */}
        <div className="relative h-full w-full overflow-hidden group/after">
          <Image
            src={afterImageSrc}
            alt={`${afterLabel} Satellite View`}
            fill
            sizes="(max-width: 768px) 50vw, 100px"
            priority
            className="object-cover transition-transform duration-500 group-hover/after:scale-110"
          />
          {/* Year Badge (Emerald highlight to indicate new/updated) */}
          <div className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            {afterLabel}
          </div>
        </div>
      </div>

      {/* Bottom overlay banner spanning both halves */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex items-end pointer-events-none select-none">
        <span className="text-white text-xs lg:text-sm font-bold tracking-wide drop-shadow-md">
          {t('media.changeDetection') || 'Change Detection'}
        </span>
      </div>
    </div>
  );
}
