"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

/* =========================
   TYPES
========================= */

export interface ImageViewerImage {
  src: string;
  alt?: string;
  title?: string;
}

export interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  images: ImageViewerImage[];
  initialIndex?: number;
  showDownload?: boolean;
  showRotate?: boolean;
  showZoom?: boolean;
  showNavigation?: boolean;
  maxZoom?: number;
  minZoom?: number;
  zoomStep?: number;
  className?: string;
}

/* =========================
   CONSTANTS
========================= */

const DEFAULT_MAX_ZOOM = 3;
const DEFAULT_MIN_ZOOM = 0.5;
const DEFAULT_ZOOM_STEP = 0.25;
const ROTATION_STEP = 90;

/* =========================
   COMPONENT
========================= */

export function ImageViewer({
  open,
  onClose,
  images,
  initialIndex = 0,
  showDownload = true,
  showRotate = true,
  showZoom = true,
  showNavigation = true,
  maxZoom = DEFAULT_MAX_ZOOM,
  minZoom = DEFAULT_MIN_ZOOM,
  zoomStep = DEFAULT_ZOOM_STEP,
  className,
}: ImageViewerProps): React.ReactElement | null {
  const t = useTranslations("common");

  // State
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const prevIndexRef = useRef(currentIndex);

  // Refs
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  // Update onClose ref
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /* =========================
     HANDLERS
  ========================= */

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + zoomStep, maxZoom));
  }, [zoomStep, maxZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - zoomStep, minZoom));
  }, [zoomStep, minZoom]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + ROTATION_STEP) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleDownload = useCallback(async () => {
    const currentImage = images[currentIndex];
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage.src);
      if (!response.ok) {
        throw new Error(`Failed to download image (HTTP ${response.status})`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentImage.title || `image-${currentIndex + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // Silent fail - user will see download not working
    }
  }, [images, currentIndex]);

  const handleFitToScreen = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const image = imageRef.current;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;

    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    setZoom(scale);
    setPosition({ x: 0, y: 0 });
  }, []);

  /* =========================
     DRAG HANDLERS
  ========================= */

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [zoom, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  /* =========================
     TOUCH HANDLERS
  ========================= */

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (zoom <= 1 || e.touches.length !== 1) return;
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    },
    [zoom, position]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  /* =========================
     WHEEL HANDLER (ZOOM)
  ========================= */

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!showZoom) return;
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
      setZoom((prev) => {
        const newZoom = prev + delta;
        return Math.max(minZoom, Math.min(maxZoom, newZoom));
      });
    },
    [showZoom, zoomStep, minZoom, maxZoom]
  );

  // Reset state when image changes
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      prevIndexRef.current = currentIndex;
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setIsImageLoaded(false);
    }
  }, [currentIndex]);

  // Update initial index when opened
  useEffect(() => {
    if (open && currentIndex !== initialIndex) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex(initialIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialIndex]);

  // Prevent body scroll when modal is open and has a valid image
  useEffect(() => {
    const hasImage = images && images.length > 0 && currentIndex >= 0 && currentIndex < images.length;
    if (!open || !hasImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, images, currentIndex]);

  // Focus trapping and restoration
  useEffect(() => {
    const hasImage = images && images.length > 0 && currentIndex >= 0 && currentIndex < images.length;
    if (!open || !hasImage) return;

    lastActiveElement.current = document.activeElement as HTMLElement;

    const viewer = viewerRef.current;
    if (!viewer) return;

    const focusableSelectors =
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

    // Wait a brief tick for the DOM to render and focus elements to be available
    const focusTimeout = setTimeout(() => {
      const focusableElements = Array.from(
        viewer.querySelectorAll<HTMLElement>(focusableSelectors)
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 0);

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Tab") {
        const focusableElements = Array.from(
          viewer.querySelectorAll<HTMLElement>(focusableSelectors)
        );
        if (focusableElements.length === 0) return;

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimeout);
      document.removeEventListener("keydown", handleKeyDown);
      lastActiveElement.current?.focus();
    };
  }, [open, images, currentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const hasImage = images && images.length > 0 && currentIndex >= 0 && currentIndex < images.length;
    if (!open || !hasImage) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      switch (e.key) {
        case "Escape":
          onCloseRef.current();
          break;
        case "ArrowLeft":
          if (showNavigation && images.length > 1) {
            handlePrevious();
          }
          break;
        case "ArrowRight":
          if (showNavigation && images.length > 1) {
            handleNext();
          }
          break;
        case "+":
        case "=":
          if (showZoom) {
            handleZoomIn();
          }
          break;
        case "-":
        case "_":
          if (showZoom) {
            handleZoomOut();
          }
          break;
        case "r":
        case "R":
          if (showRotate) {
            handleRotate();
          }
          break;
        case "0":
          handleReset();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, showZoom, showRotate, showNavigation, images, currentIndex, handleZoomIn, handleZoomOut, handleRotate, handleReset, handlePrevious, handleNext]);

  /* =========================
     RENDER
  ========================= */

  if (!open) return null;

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  const hasMultipleImages = images.length > 1;

  return (
    <div
      ref={viewerRef}
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label={t("imageViewer.title")}
      data-testid="image-viewer"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity"
        onClick={() => onCloseRef.current()}
        data-testid="image-viewer-backdrop"
      />

      {/* Main Container */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/90">
          <div className="flex-1">
            {currentImage.title && (
              <h2 className="text-white font-semibold text-lg truncate">
                {currentImage.title}
              </h2>
            )}
            {hasMultipleImages && (
              <p className="text-white/70 text-sm">
                {currentIndex + 1} / {images.length}
              </p>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {showZoom && (
              <>
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= minZoom}
                  className={cn(
                    "p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label={t("imageViewer.zoomOut")}
                  data-testid="zoom-out-button"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-sm min-w-[4rem] text-center" data-testid="zoom-level">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= maxZoom}
                  className={cn(
                    "p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label={t("imageViewer.zoomIn")}
                  data-testid="zoom-in-button"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </>
            )}

            {showRotate && (
              <button
                onClick={handleRotate}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label={t("imageViewer.rotate")}
                data-testid="rotate-button"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label={t("imageViewer.reset")}
              data-testid="reset-button"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={handleFitToScreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label={t("imageViewer.fitToScreen")}
              data-testid="fit-to-screen-button"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {showDownload && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label={t("imageViewer.download")}
                data-testid="download-button"
              >
                <Download className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => onCloseRef.current()}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label={t("imageViewer.close")}
              data-testid="close-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div
          ref={containerRef}
          className="relative flex-1 flex items-center justify-center overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{
            cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          }}
          data-testid="image-container"
        >
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={currentImage.src}
            alt={currentImage.alt || currentImage.title || t("imageViewer.image")}
            className={cn(
              "max-w-none transition-opacity duration-300",
              isImageLoaded ? "opacity-100" : "opacity-0"
            )}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center",
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageLoaded(true)}
            draggable={false}
            data-testid="viewer-image"
          />
        </div>

        {/* Navigation Arrows */}
        {showNavigation && hasMultipleImages && (
          <>
            <button
              onClick={handlePrevious}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                "p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              )}
              aria-label={t("imageViewer.previous")}
              data-testid="previous-button"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                "p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              )}
              aria-label={t("imageViewer.next")}
              data-testid="next-button"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black text-white/90 text-xs px-4 py-2 rounded-lg">
          <span className="hidden sm:inline">
            {t("imageViewer.keyboardShortcuts")}
          </span>
          <span className="sm:hidden">{t("imageViewer.tapToNavigate")}</span>
        </div>
      </div>
    </div>
  );
}
