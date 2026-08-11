"use client";

import { Download, FileWarning, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

interface RtsApplicationDocumentPreviewProps {
  documentName: string;
  fileUrl: string;
  mimeType: string;
  isDownloading: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function RtsApplicationDocumentPreview({
  documentName,
  fileUrl,
  mimeType,
  isDownloading,
  onClose,
  onDownload,
}: RtsApplicationDocumentPreviewProps) {
  const t = useTranslations("rts.applicationDashboard.drawer");
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const normalizedMimeType = mimeType.toLowerCase();
  const isPdf = normalizedMimeType.includes("pdf");
  const isImage = normalizedMimeType.startsWith("image/");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label={t("closePreview")}
        className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={documentName}
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-[#143D7D] px-4 py-3 text-white sm:px-5">
          <h2 className="min-w-0 truncate text-sm font-bold">{documentName}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closePreview")}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4 sm:p-6">
          {isImage ? (
            // Blob URLs are created from authenticated API responses and cannot use Next image optimization.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fileUrl}
              alt={documentName}
              className="mx-auto max-h-[70vh] max-w-full rounded-lg object-contain shadow-sm"
            />
          ) : isPdf ? (
            <iframe
              title={documentName}
              src={fileUrl}
              className="h-[70vh] w-full rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <FileWarning className="mb-3 size-9 text-amber-500" />
              <p className="text-sm font-bold text-slate-800">{t("unsupportedPreview")}</p>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                {t("unsupportedPreviewDescription")}
              </p>
              <button
                type="button"
                onClick={onDownload}
                disabled={isDownloading}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#143D7D] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0f3267] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="size-4" />
                {isDownloading ? t("downloading") : t("download")}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body
  );
}
