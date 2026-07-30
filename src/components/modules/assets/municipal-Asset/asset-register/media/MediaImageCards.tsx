import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/common';
import { ImageWithFallback } from './ImageWithFallback';

import { MediaImageCardProps } from '@/types/asset/asset-register/media.types';

/**
 * Reusable image card with download button and label overlay.
 */
export function MediaImageCard({
  src,
  alt,
  label,
  fullSrc,
  hoverBorderColor = 'hover:border-blue-500',
  onMouseEnter,
  onMouseLeave,
  priority,
}: MediaImageCardProps): React.ReactElement {
  return (
    <div
      className={`relative group bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-300 shadow-md ${hoverBorderColor} hover:border-4 transition-all cursor-pointer w-full h-[200px]`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ImageWithFallback
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
        width={400}
        height={300}
        priority={priority}
      />

      {/* Action buttons (visible on hover) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="secondary"
          size="xs"
          className="h-7 w-7 p-0 shadow-lg cursor-pointer"
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
          <Download className="w-3.5 h-3.5 cursor-pointer" />
        </Button>
      </div>

      {/* Bottom label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pointer-events-none">
        <p className="text-white text-xs">{label}</p>
      </div>
    </div>
  );
}
