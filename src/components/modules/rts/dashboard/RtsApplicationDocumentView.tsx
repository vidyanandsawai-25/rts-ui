'use client';

import { AlertCircle, Download, FileText, LoaderCircle, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import { Button, Drawer } from '@/components/common';
import { downloadRtsDocument } from '@/lib/api/rts/rtsdocument.client';

interface RtsApplicationDocumentViewProps {
  open: boolean;
  fileUrl: string;
  downloadUrl: string;
  fileName: string;
  label?: string;
  onClose?: () => void;
}

export default function RtsApplicationDocumentView({
  open,
  fileUrl,
  downloadUrl,
  fileName,
  label,
  onClose,
}: RtsApplicationDocumentViewProps) {
  const router = useRouter();
  const t = useTranslations('rts.applicationDashboard.processDrawer');
  const tCommon = useTranslations('common');
  const title = label || fileName;
  // Route-driven admin previews use browser back; nested consumers can close locally.
  const handleClose = onClose ?? (() => router.back());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'unsupported' | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleDownload = async () => {
    try {
      await downloadRtsDocument({
        url: downloadUrl,
        fallbackFileName: fileName,
        errorMessage: t('downloadFailed'),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('downloadFailed'));
    }
  };

  useEffect(() => {
    if (!open || !fileUrl) return;

    let active = true;
    let objectUrl: string | null = null;

    const loadPreview = async () => {
      setPreviewUrl(null);
      setPreviewError(null);
      setPreviewType(null);
      setZoom(1);
      setPosition({ x: 0, y: 0 });

      try {
        const response = await fetch(fileUrl, { credentials: 'same-origin' });
        if (!response.ok) {
          throw new Error(t('previewRequestFailed', { status: response.status }));
        }

        const blob = await response.blob();
        if (!blob.size) throw new Error(t('previewEmpty'));

        objectUrl = URL.createObjectURL(blob);
        if (active) {
          setPreviewUrl(objectUrl);
          if (blob.type === 'application/pdf') {
            setPreviewType('pdf');
          } else if (blob.type.startsWith('image/')) {
            setPreviewType('image');
          } else {
            setPreviewType('unsupported');
          }
        }
      } catch (error) {
        if (active) {
          setPreviewError(error instanceof Error ? error.message : t('previewLoadFailed'));
        }
      }
    };

    void loadPreview();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileUrl, open, t]);

  const resetImage = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const updateZoom = (direction: 1 | -1) => {
    setZoom((current) => {
      const next = Math.min(5, Math.max(1, Number((current + direction * 0.25).toFixed(2))));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const drawer = (
    <Drawer
      open={open}
      onClose={handleClose}
      width="md"
      hideHeader
      className="z-[210]"
      bodyClassName="relative overflow-hidden"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button type="button" size="sm" variant="secondary" icon={Download} onClick={handleDownload}>
            {t('download')}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={handleClose}>
            {tCommon('buttons.close')}
          </Button>
        </div>
      }
    >
      <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-slate-100">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b-2 border-blue-200 bg-[#143D7D] px-5 py-3 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{title}</p>
              <p className="text-[11px] font-semibold text-blue-100">{t('documents')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={tCommon('buttons.close')}
            title={tCommon('buttons.close')}
            className="rounded-lg p-2 text-blue-100 transition hover:bg-white/15 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <main className="relative min-h-0 flex-1 overflow-hidden bg-slate-100">
          {previewUrl && previewType === 'pdf' ? (
            <iframe src={previewUrl} title={title} className="h-full w-full border-0 bg-white" />
          ) : previewUrl && previewType === 'image' ? (
            <div
              className={`flex h-full w-full touch-none items-center justify-center overflow-hidden bg-slate-950/90 ${zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
              onWheel={(event) => {
                event.preventDefault();
                updateZoom(event.deltaY < 0 ? 1 : -1);
              }}
              onMouseDown={(event) => {
                if (zoom <= 1) return;
                setIsDragging(true);
                dragStart.current = { x: event.clientX - position.x, y: event.clientY - position.y };
              }}
              onMouseMove={(event) => {
                if (!isDragging) return;
                setPosition({ x: event.clientX - dragStart.current.x, y: event.clientY - dragStart.current.y });
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={(event) => {
                if (zoom <= 1 || event.touches.length !== 1) return;
                const touch = event.touches[0];
                setIsDragging(true);
                dragStart.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
              }}
              onTouchMove={(event) => {
                if (!isDragging || event.touches.length !== 1) return;
                const touch = event.touches[0];
                setPosition({ x: touch.clientX - dragStart.current.x, y: touch.clientY - dragStart.current.y });
              }}
              onTouchEnd={() => setIsDragging(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={title}
                draggable={false}
                className="max-h-full max-w-full select-none object-contain"
                style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})` }}
              />
              <div className="absolute right-4 top-4 flex items-center gap-1 rounded-lg border border-white/20 bg-slate-900/80 p-1 text-white shadow-lg">
                <button type="button" onClick={() => updateZoom(-1)} disabled={zoom <= 1} className="rounded p-2 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40" title={t('zoomOut')}>
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-w-11 text-center text-xs font-bold">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => updateZoom(1)} disabled={zoom >= 5} className="rounded p-2 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40" title={t('zoomIn')}>
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button type="button" onClick={resetImage} className="rounded p-2 hover:bg-white/15" title={t('resetImage')}>
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : previewError || previewType === 'unsupported' ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="h-10 w-10 text-rose-500" />
              <p className="max-w-sm text-sm font-semibold text-slate-700">{previewError ?? t('previewUnsupported')}</p>
              <Button type="button" size="sm" variant="secondary" icon={Download} onClick={handleDownload}>
                {t('download')}
              </Button>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
              <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">{t('loadingPreview')}</p>
            </div>
          )}
        </main>
      </div>
    </Drawer>
  );

  // Keep nested document previews above the fixed citizen portal header.
  return typeof document === 'undefined' ? null : createPortal(drawer, document.body);
}
