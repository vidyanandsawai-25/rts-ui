'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './ImageWithFallback';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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
    const contentWidth = rect.width - 16;
    const contentHeight = rect.height;

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

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => {
      if (prev > 1) {
        setPanOffset({ x: 0, y: 0 });
        return 1;
      }
      return 2;
    });
  };

  if (!visible || !src) return null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="
        hidden lg:block
        absolute right-full top-0 bottom-0 pr-3 z-50
        w-[496px] max-h-[calc(100vh-140px)] pointer-events-none
        animate-in fade-in slide-in-from-right-3 duration-200
      "
    >
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-[3px] border-blue-600 bg-slate-950 relative select-none flex flex-col">
        {/* Floating Control Toolbar */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20 shadow-lg text-white">
          <span className="text-[11px] font-bold text-slate-200 px-1 select-none">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomScale <= 1}
            className="p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomScale >= 4}
            className="p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomScale > 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Viewport Content */}
        <div
          onDoubleClick={handleDoubleClick}
          className={`w-full h-full relative overflow-hidden bg-slate-950 ${
            zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
          style={{
            transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {src2 ? (
            <div className="grid grid-cols-2 h-full w-full relative bg-slate-950">
              {/* Left Side: Before */}
              <div className="relative h-full w-full overflow-hidden border-r border-slate-800 bg-slate-950 flex items-center justify-center">
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
                <div className="absolute top-3 left-3 z-10 bg-black/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md backdrop-blur-xs border border-white/10">
                  {beforeLabel || '2018'}
                </div>
              </div>

              {/* Right Side: After */}
              <div className="relative h-full w-full overflow-hidden bg-slate-950 flex items-center justify-center">
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
                <div className="absolute top-3 left-3 z-10 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md border border-emerald-400/30">
                  {afterLabel || '2026'}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative bg-slate-950 flex items-center justify-center">
              <ImageWithFallback
                src={src}
                fallbackSrc={fallbackSrc}
                alt={title}
                className="w-full h-full object-cover"
                width={960}
                height={1200}
                priority
              />
            </div>
          )}
        </div>

        {/* Caption Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 z-10 pointer-events-none flex items-center justify-between">
          <p className="text-white text-xs sm:text-sm font-semibold tracking-wide drop-shadow-md truncate">
            {title}
          </p>
          <span className="text-[10px] text-slate-300 font-medium bg-black/60 px-2 py-0.5 rounded border border-white/10 ml-2 shrink-0 backdrop-blur-xs">
            {zoomScale > 1 ? 'Drag to Pan' : 'Scroll / Dbl-Click to Zoom'}
          </span>
        </div>
      </div>
    </div>
  );
}
