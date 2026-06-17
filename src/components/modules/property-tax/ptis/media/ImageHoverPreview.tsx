'use client';

import React from 'react';
import { ImageWithFallback } from './ImageWithFallback';

interface ImageHoverPreviewProps {
  src: string;
  title: string;
  visible: boolean;
}

/**
 * Floating preview panel that appears to the left of the media sidebar
 * when hovering over an image card. Matches the Figma design:
 * - Thick, vibrant blue border
 * - Vertical tall format with increased width (480px x 600px)
 * - Uses object-contain with white background to display floor plans fully without crop
 * - Caption overlay at the bottom left
 */
export function ImageHoverPreview({
  src,
  title,
  visible,
}: ImageHoverPreviewProps): React.ReactElement | null {
  if (!visible || !src) return null;

  return (
    <div
      className="
        hidden lg:block
        absolute right-full top-[120px] mr-4 z-50
        w-[480px] h-[600px] pointer-events-none
        animate-in fade-in slide-in-from-right-3 duration-200
      "
    >
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-[3px] border-blue-600 bg-white relative">
        <ImageWithFallback
          src={src}
          alt={title}
          className="w-full h-full object-cover"
          width={960}
          height={1200}
          priority
        />

        {/* Caption Overlay - White text with a dark gradient backing at the bottom-left */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 z-10">
          <p className="text-white text-sm font-semibold tracking-wide drop-shadow-md">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
