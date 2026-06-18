'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface UseChangeDetectionCompareProps {
  mode: 'slider' | 'side-by-side';
}

export function useChangeDetectionCompare({ mode }: UseChangeDetectionCompareProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom and Pan states
  const [zoom, setZoom] = useState(1);
  const [beforePan, setBeforePan] = useState({ x: 0, y: 0 });
  const [afterPan, setAfterPan] = useState({ x: 0, y: 0 });
  const [isPanningMode, setIsPanningMode] = useState(false);
  const [isSyncPan, setIsSyncPan] = useState(true);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [draggedImageType, setDraggedImageType] = useState<'before' | 'after' | 'both' | null>(null);
  
  const dragRef = useRef({ startX: 0, startY: 0, cw: 0, ch: 0, iw: 0, ih: 0 });

  const getClampingBounds = useCallback((zoomValue: number) => {
    const d = dragRef.current;
    if (!d.cw || !d.ch || !d.iw || !d.ih) return { maxX: 0, maxY: 0 };

    const containerRatio = d.cw / d.ch;
    const imageRatio = d.iw / d.ih;
    
    // object-cover scaling dimensions
    let imageWidth = d.cw;
    let imageHeight = d.ch;

    if (imageRatio > containerRatio) {
      imageWidth = d.ch * imageRatio;
    } else {
      imageHeight = d.cw / imageRatio;
    }

    return {
      maxX: Math.max(0, (imageWidth * zoomValue - d.cw) / 2),
      maxY: Math.max(0, (imageHeight * zoomValue - d.ch) / 2),
    };
  }, []);



  // Handle Drag / Pan movements
  useEffect(() => {
    if (!isDraggingHandle && !isDraggingImage) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (isDraggingHandle && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSliderPosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
      } else if (isDraggingImage && draggedImageType) {
        const dx = clientX - dragRef.current.startX;
        const dy = clientY - dragRef.current.startY;

        const updatePan = (prev: { x: number; y: number }) => {
          const newX = prev.x + dx;
          const newY = prev.y + dy;
          const { maxX, maxY } = getClampingBounds(zoom);
          return {
            x: Math.min(Math.max(newX, -maxX), maxX),
            y: Math.min(Math.max(newY, -maxY), maxY),
          };
        };

        if (draggedImageType === 'both') {
          setBeforePan(updatePan);
          setAfterPan(updatePan);
        } else if (draggedImageType === 'before') {
          setBeforePan(updatePan);
        } else {
          setAfterPan(updatePan);
        }
        dragRef.current.startX = clientX;
        dragRef.current.startY = clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onEnd = () => {
      setIsDraggingHandle(false);
      setIsDraggingImage(false);
      setDraggedImageType(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDraggingHandle, isDraggingImage, draggedImageType, zoom, getClampingBounds]);

  const startDragHelper = useCallback((clientX: number, clientY: number, target: HTMLElement, type?: 'before' | 'after') => {
    const rect = target.getBoundingClientRect();
    const isSlider = mode === 'slider';
    
    if (isSlider) {
      setIsDraggingHandle(true);
      if (containerRef.current) {
        const cRect = containerRef.current.getBoundingClientRect();
        setSliderPosition(Math.max(0, Math.min(100, ((clientX - cRect.left) / cRect.width) * 100)));
      }
      return;
    }

    if (isPanningMode && type) {
      const img = target.querySelector('img');
      dragRef.current = {
        startX: clientX,
        startY: clientY,
        cw: rect.width,
        ch: rect.height,
        iw: img?.naturalWidth || rect.width,
        ih: img?.naturalHeight || rect.height,
      };
      setDraggedImageType(isSyncPan ? 'both' : type);
      setIsDraggingImage(true);
    }
  }, [mode, isPanningMode, isSyncPan]);

  const handleStartDrag = useCallback((e: React.MouseEvent, type?: 'before' | 'after') => {
    startDragHelper(e.clientX, e.clientY, e.currentTarget as HTMLElement, type);
  }, [startDragHelper]);

  const handleTouchStart = useCallback((e: React.TouchEvent, type?: 'before' | 'after') => {
    if (e.touches.length > 0) {
      startDragHelper(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget as HTMLElement, type);
    }
  }, [startDragHelper]);

  const zoomIn = useCallback(() => setZoom(prev => Math.min(prev + 0.25, 4)), []);
  const zoomOut = useCallback(() => {
    setZoom(prev => {
      const nextZoom = Math.max(prev - 0.25, 1);
      const clamp = (p: { x: number; y: number }) => {
        const { maxX, maxY } = getClampingBounds(nextZoom);
        return {
          x: Math.min(Math.max(p.x, -maxX), maxX),
          y: Math.min(Math.max(p.y, -maxY), maxY),
        };
      };
      setBeforePan(clamp);
      setAfterPan(clamp);
      return nextZoom;
    });
  }, [getClampingBounds]);

  const resetZoomAndPan = useCallback(() => {
    setZoom(1);
    setBeforePan({ x: 0, y: 0 });
    setAfterPan({ x: 0, y: 0 });
  }, []);

  return {
    sliderPosition,
    zoom,
    beforePan,
    afterPan,
    isPanningMode,
    setIsPanningMode,
    isSyncPan,
    setIsSyncPan,
    containerRef,
    setIsDraggingHandle,
    isDraggingImage,
    zoomIn,
    zoomOut,
    resetZoomAndPan,
    handleStartDrag,
    handleTouchStart,
  };
}
