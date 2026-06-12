import { useState, useCallback } from 'react';
import type { AdditionalImage } from '@/components/modules/property-tax/ptis/media/MediaImageCards';

export interface UsePhotoPlanGalleryProps {
  images: AdditionalImage[];
  initialIndex: number;
  open: boolean;
}

export function usePhotoPlanGallery({
  images,
  initialIndex,
  open,
}: UsePhotoPlanGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialIndex);
  const [rotation, setRotation] = useState(0);

  // Adjusting state during rendering (React-approved getDerivedStateFromProps replacement)
  // Uses state instead of ref to track previous value — refs cannot be read during render
  const [prevOpen, setPrevOpen] = useState(open);
  if (open && !prevOpen) {
    setSelectedImageIndex(initialIndex);
    setRotation(0);
  }
  if (open !== prevOpen) {
    setPrevOpen(open);
  }

  const handleSelect = useCallback((index: number) => {
    setRotation(0);
    setSelectedImageIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    setRotation(0);
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setRotation(0);
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleRotateLeft = useCallback(() => {
    setRotation((r) => (r - 90 + 360) % 360);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setRotation(0);
  }, []);

  return {
    selectedImageIndex,
    rotation,
    handleSelect,
    handleNext,
    handlePrev,
    handleRotateLeft,
    handleRotateRight,
    handleReset,
  };
}
