'use client';

import React from 'react';
import { ImageWithFallback } from './ImageWithFallback';

interface ImageHoverPreviewProps {
  src: string;
  src2?: string;
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
  src2,
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
        {src2 ? (
          <div className="grid grid-cols-2 h-full w-full relative">
            {/* Left Side: Before */}
            <div className="relative h-full w-full overflow-hidden border-r border-slate-200 bg-slate-900">
              <ImageWithFallback
                src={src}
                alt="2018 Satellite View"
                className="w-full h-full object-cover"
                width={480}
                height={1200}
                priority
              />
              {/* Year Badge */}
              <div className="absolute top-4 left-4 z-10 bg-black/75 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-md backdrop-blur-[1px]">
                2018
              </div>
            </div>

            {/* Right Side: After */}
            <div className="relative h-full w-full overflow-hidden bg-slate-900">
              <ImageWithFallback
                src={src2}
                alt="2026 Satellite View"
                className="w-full h-full object-cover"
                width={480}
                height={1200}
                priority
              />
              {/* Year Badge */}
              <div className="absolute top-4 left-4 z-10 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-md">
                2026
              </div>
            </div>
          </div>
        ) : (
          <ImageWithFallback
            src={src}
            alt={title}
            className="w-full h-full object-cover"
            width={960}
            height={1200}
            priority
          />
        )}

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
