"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";

import { Button, Drawer } from "@/components/common";

interface DocumentFormPreviewProps {
  file: File | null;
  open: boolean;
  onClose: () => void;
}

function getDocumentKind(file: File): "image" | "pdf" | "other" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return "pdf";
  return "other";
}

/** Browser preview for a document selected locally in a dynamic service form. */
export default function DocumentFormPreview({ file, open, onClose }: DocumentFormPreviewProps) {
  const t = useTranslations("rts.applicationDashboard.drawer");
  const tProcessDrawer = useTranslations("rts.applicationDashboard.processDrawer");
  const tCommon = useTranslations("common");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open || !file) return;

    let isActive = true;
    const reader = new FileReader();
    reader.onload = () => {
      if (isActive && typeof reader.result === "string") {
        setPreviewUrl(reader.result);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    };
    reader.readAsDataURL(file);

    return () => {
      isActive = false;
    };
  }, [file, open]);

  if (!file) return null;

  const documentKind = getDocumentKind(file);

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
      onClose={onClose}
      width="md"
      hideHeader
      className="z-[210]"
      bodyClassName="relative overflow-hidden p-0"
      footer={
        <div className="flex w-full items-center justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} className="rounded-lg text-xs font-bold">
            {tCommon("buttons.close")}
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
              <p className="truncate text-sm font-extrabold">{file.name}</p>
              <p className="text-[11px] font-semibold text-blue-100">{tProcessDrawer("documents")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tCommon("buttons.close")}
            title={tCommon("buttons.close")}
            className="rounded-lg p-2 text-blue-100 transition hover:bg-white/15 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <main className="relative min-h-0 flex-1 overflow-hidden bg-slate-100">
          {previewUrl && documentKind === "image" ? (
            <div
              className={`flex h-full w-full touch-none items-center justify-center overflow-hidden bg-slate-950/90 ${
                zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
              }`}
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
              {/* A data URL is required because the selected file has not been submitted yet. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={file.name}
                draggable={false}
                className="max-h-full max-w-full select-none object-contain"
                style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})` }}
              />
              <div className="absolute right-4 top-4 flex items-center gap-1 rounded-lg border border-white/20 bg-slate-900/80 p-1 text-white shadow-lg">
                <button type="button" onClick={() => updateZoom(-1)} disabled={zoom <= 1} className="rounded p-2 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40" title={tProcessDrawer("zoomOut")}>
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-w-11 text-center text-xs font-bold">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => updateZoom(1)} disabled={zoom >= 5} className="rounded p-2 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40" title={tProcessDrawer("zoomIn")}>
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button type="button" onClick={resetImage} className="rounded p-2 hover:bg-white/15" title={tProcessDrawer("resetImage")}>
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : previewUrl && documentKind === "pdf" ? (
            <iframe title={file.name} src={previewUrl} className="h-full w-full border-0 bg-white" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <FileText className="h-12 w-12 text-slate-400" />
              <p className="mt-3 text-sm font-bold text-slate-700">{t("unsupportedPreview")}</p>
              <p className="mt-1 text-xs text-slate-500">{file.name}</p>
            </div>
          )}
        </main>
      </div>
    </Drawer>
  );

  // The service form lives below the fixed citizen header. Portal the preview to
  // the document body so the shared drawer is positioned against the viewport.
  return typeof document === "undefined" ? null : createPortal(drawer, document.body);
}
