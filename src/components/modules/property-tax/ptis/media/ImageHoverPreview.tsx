'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './ImageWithFallback';

interface ImageHoverPreviewProps {
  src: string;
  src2?: string;
  title: string;
  visible: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  beforeLabel?: string;
  afterLabel?: string;
  fallbackSrc?: string;
  fallbackSrc2?: string;
}

export function ImageHoverPreview({
  src,
  src2,
  title,
  visible,
  onMouseEnter,
  onMouseLeave,
  beforeLabel,
  afterLabel,
  fallbackSrc,
  fallbackSrc2,
}: ImageHoverPreviewProps): React.ReactElement | null {
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse up globally to prevent drag getting stuck if user releases mouse outside
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Handle wheel events to allow zoom and prevent default page scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !visible) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const minZoom = 1;
      const maxZoom = 4;

      setZoomScale((prev) => {
        let newZoom = prev - e.deltaY * 0.0035;
        if (newZoom < minZoom) newZoom = minZoom;
        if (newZoom > maxZoom) newZoom = maxZoom;

        // Reset pan offset if zoomed back to 1
        if (newZoom === 1) {
          setPanOffset({ x: 0, y: 0 });
        }
        return newZoom;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [visible]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1 || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const contentWidth = rect.width - 16; // 480px content area
    const contentHeight = rect.height; // 600px content area

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Constrain offset so the image doesn't pan past its borders
    const maxOffsetPrevX = ((zoomScale - 1) * contentWidth) / 2;
    const maxOffsetPrevY = ((zoomScale - 1) * contentHeight) / 2;

    const constrainedX = Math.max(-maxOffsetPrevX, Math.min(maxOffsetPrevX, dx));
    const constrainedY = Math.max(-maxOffsetPrevY, Math.min(maxOffsetPrevY, dy));

    setPanOffset({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!visible || !src) return null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="
        hidden lg:block
        absolute right-full top-[120px] pr-4 z-50
        w-[496px] h-[600px] pointer-events-auto
        animate-in fade-in slide-in-from-right-3 duration-200
      "
    >
      <div className="w-[480px] h-full rounded-2xl overflow-hidden shadow-2xl border-[3px] border-blue-600 bg-white relative select-none">
        <div
          className={`w-full h-full relative overflow-hidden bg-white ${
            zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
          style={{
            transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {src2 ? (
            <div className="grid grid-cols-2 h-full w-full relative bg-slate-900">
              {/* Left Side: Before */}
              <div className="relative h-full w-full overflow-hidden border-r border-slate-200 bg-slate-900">
                <ImageWithFallback
                  src={src}
                  fallbackSrc={fallbackSrc}
                  alt={`${beforeLabel || 'Before'} Satellite View`}
                  className="w-full h-full object-cover"
                  width={480}
                  height={1200}
                  priority
                />
                {/* Year Badge */}
                <div className="absolute top-4 left-4 z-10 bg-black/75 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-md backdrop-blur-[1px]">
                  {beforeLabel || '2018'}
                </div>
              </div>

              {/* Right Side: After */}
              <div className="relative h-full w-full overflow-hidden bg-slate-900">
                <ImageWithFallback
                  src={src2}
                  fallbackSrc={fallbackSrc2}
                  alt={`${afterLabel || 'After'} Satellite View`}
                  className="w-full h-full object-cover"
                  width={480}
                  height={1200}
                  priority
                />
                {/* Year Badge */}
                <div className="absolute top-4 left-4 z-10 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-md">
                  {afterLabel || '2026'}
                </div>
              </div>
            </div>
          ) : (
            <ImageWithFallback
              src={src}
              fallbackSrc={fallbackSrc}
              alt={title}
              className="w-full h-full object-cover"
              width={960}
              height={1200}
              priority
            />
          )}
        </div>

        {/* Caption Overlay - White text with a dark gradient backing at the bottom-left */}
        {/* Placed outside the zoomed container to keep it in place at normal scale */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 z-10 pointer-events-none">
          <p className="text-white text-sm font-semibold tracking-wide drop-shadow-md">{title}</p>
        </div>
      </div>
    </div>
  );
}
