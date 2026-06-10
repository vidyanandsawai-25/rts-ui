'use client';

import React from 'react';
import { Download, Images } from 'lucide-react';
import { Button } from '@/components/common/ActionButton';
import { ImageWithFallback } from './ImageWithFallback';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/common/Badge';

export interface AdditionalImage {
  src: string;
  fullSrc: string;
  alt: string;
  title: string;
  isCustom?: boolean;
  isNamed?: boolean;
  photoTypeId?: number;
  photoTypeCode?: string;
  propertyPhotoId?: number;
  hasPhoto?: boolean;
  remarks?: string;
  displayOrder?: number;
  file?: File;
  documentGuid?: string;
  downloadUrl?: string;
}

interface MediaImageCardProps {
  src: string;
  alt: string;
  label: string;
  fullSrc?: string;
  badgeText?: string;
  hoverBorderColor?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

/**
 * Reusable image card with download button and label overlay.
 */
export function MediaImageCard({
  src,
  alt,
  label,
  fullSrc,
  badgeText,
  hoverBorderColor = 'hover:border-blue-500',
  onClick,
  children,
}: MediaImageCardProps): React.ReactElement {
  return (
    <div
      className={`relative group bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-300 shadow-md ${hoverBorderColor} hover:border-4 transition-all cursor-pointer flex-1 min-h-0`}
      onClick={onClick}
    >
      <ImageWithFallback
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
        width={400}
        height={300}
      />

      {/* Action buttons (visible on hover) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {children}
        <Button
          variant="secondary"
          size="xs"
          className="h-7 w-7 p-0 shadow-lg"
          aria-label="Download image"
          onClick={(e) => {
            e.stopPropagation();
            const link = document.createElement('a');
            link.href = fullSrc || src;
            link.download = `${label.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Bottom label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pointer-events-none">
        <p className="text-white text-xs">{label}</p>
      </div>

      {/* Optional badge (e.g. "+6 More") */}
      {badgeText && (
        <Badge
          variant="default"
          size="sm"
          className="absolute top-2 left-2 bg-blue-600 text-white font-semibold shadow-lg animate-pulse"
        >
          {badgeText}
        </Badge>
      )}
    </div>
  );
}

interface AdditionalImagesGridProps {
  images: AdditionalImage[];
  onImageClick?: (index: number) => void;
  onClose?: () => void;
}

/**
 * Expandable grid section for additional property images.
 */
export function AdditionalImagesGrid({
  images,
  onImageClick,
}: AdditionalImagesGridProps): React.ReactElement {
  const t = useTranslations('ptis');
  return (
    <>
      {/* Divider */}
      <div className="border-t-2 border-blue-400 flex-shrink-0 shadow-sm" />

      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-blue-50 to-slate-50 rounded-md border border-blue-200">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-900">{t('media.additionalImages')}</span>
        </div>
      </div>

      {/* Image cards */}
      <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-60 scrollbar-thin">
        {images.map((image, index) => (
          <div
            key={image.propertyPhotoId || `${image.alt}-${index}`}
            className="relative group bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200 shadow-md hover:border-blue-400 transition-all cursor-pointer h-24 flex-shrink-0 animate-in fade-in slide-in-from-top-2 duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onImageClick?.(index)}
          >
            <ImageWithFallback
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
              width={200}
              height={150}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1 pointer-events-none">
              <p className="text-white text-[8px] truncate">{image.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom divider */}
      <div className="border-t-2 border-blue-400 flex-shrink-0 shadow-sm" />
    </>
  );
}
