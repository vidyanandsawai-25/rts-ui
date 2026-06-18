'use client';

import React, { useState, useRef } from 'react';
import { ChangeDetectionHeader } from './ChangeDetectionHeader';
import type { PhotoCategory } from './PhotoPlanSidebar';
import type { AdditionalImage } from './MediaImageCards';
import { useChangeDetectionCompare } from '@/hooks/ptis/photoplan/useChangeDetectionCompare';
import { useChangeDetectionUpload } from '@/hooks/ptis/photoplan/useChangeDetectionUpload';
import { ChangeDetectionToolbar } from './ChangeDetectionToolbar';
import { ChangeDetectionSliderView } from './ChangeDetectionSliderView';
import { ChangeDetectionSideBySideView } from './ChangeDetectionSideBySideView';

interface ChangeDetectionCompareProps {
  activeCategory: PhotoCategory;
  onBackToGrid: () => void;
  onImagesChange: (newImages: AdditionalImage[]) => void;
  propertyId?: number;
}

type CompareMode = 'slider' | 'side-by-side';

export function ChangeDetectionCompare({
  activeCategory, onBackToGrid, onImagesChange, propertyId,
}: ChangeDetectionCompareProps): React.ReactElement {
  const [mode, setMode] = useState<CompareMode>('slider');
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const {
    sliderPosition, zoom, beforePan, afterPan, isPanningMode, setIsPanningMode,
    isSyncPan, setIsSyncPan, containerRef,
    isDraggingImage, setIsDraggingHandle,
    zoomIn, zoomOut, resetZoomAndPan, handleStartDrag, handleTouchStart,
  } = useChangeDetectionCompare({ mode });

  const {
    isUploading, handleUploadOrReplaceImage, handleDeleteImage,
  } = useChangeDetectionUpload({ activeCategory, propertyId, onImagesChange });

  const beforeImage = activeCategory.images[0]?.src || '/images/thane-earth-2018.jpg';
  const afterImage = activeCategory.images[1]?.src || '/images/thane-earth-2026.jpg';
  const hasCustomBefore = activeCategory.images[0]?.propertyPhotoId !== 9998;
  const hasCustomAfter = activeCategory.images[1]?.propertyPhotoId !== 9999;

  const onFileChange = (type: 'before' | 'after') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleUploadOrReplaceImage(file, type);
    e.target.value = '';
  };

  const getTransformStyle = (panState: { x: number; y: number }) => ({
    transform: `translate(${panState.x}px, ${panState.y}px) scale(${zoom})`,
    transformOrigin: 'center',
    transition: isDraggingImage ? 'none' : 'transform 0.15s ease-out',
  });

  const beforeTransformStyle = getTransformStyle(beforePan);
  const afterTransformStyle = getTransformStyle(afterPan);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 select-none relative">
      {isUploading && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white" />
        </div>
      )}

      <input type="file" ref={beforeInputRef} onChange={onFileChange('before')} className="hidden" accept="image/*" />
      <input type="file" ref={afterInputRef} onChange={onFileChange('after')} className="hidden" accept="image/*" />

      <ChangeDetectionHeader
        photoTypeName={activeCategory.photoTypeName}
        onBackToGrid={onBackToGrid}
        mode={mode}
        setMode={setMode}
        isPanningMode={isPanningMode}
        setIsPanningMode={setIsPanningMode}
        isSyncPan={isSyncPan}
        setIsSyncPan={setIsSyncPan}
        zoom={zoom}
        beforePan={beforePan}
        afterPan={afterPan}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoomAndPan={resetZoomAndPan}
      />

      {/* Main Image Compare Container */}
      <div className="flex-1 p-4 sm:p-8 flex items-center justify-center overflow-hidden">
        {mode === 'slider' ? (
          <ChangeDetectionSliderView
            containerRef={containerRef}
            isPanningMode={isPanningMode}
            handleStartDrag={handleStartDrag}
            handleTouchStart={handleTouchStart}
            beforeImage={beforeImage}
            afterImage={afterImage}
            beforeTransformStyle={beforeTransformStyle}
            afterTransformStyle={afterTransformStyle}
            hasCustomBefore={hasCustomBefore}
            hasCustomAfter={hasCustomAfter}
            sliderPosition={sliderPosition}
            setIsDraggingHandle={setIsDraggingHandle}
          />
        ) : (
          <ChangeDetectionSideBySideView
            isPanningMode={isPanningMode}
            handleStartDrag={handleStartDrag}
            handleTouchStart={handleTouchStart}
            beforeImage={beforeImage}
            afterImage={afterImage}
            beforePan={beforePan}
            afterPan={afterPan}
            zoom={zoom}
            hasCustomBefore={hasCustomBefore}
            hasCustomAfter={hasCustomAfter}
            isDraggingImage={isDraggingImage}
          />
        )}
      </div>

      {/* Bottom Upload Toolbar */}
      <ChangeDetectionToolbar
        photoTypeName={activeCategory.photoTypeName}
        beforeInputRef={beforeInputRef}
        afterInputRef={afterInputRef}
        hasCustomBefore={hasCustomBefore}
        hasCustomAfter={hasCustomAfter}
        handleDeleteImage={handleDeleteImage}
      />
    </div>
  );
}
