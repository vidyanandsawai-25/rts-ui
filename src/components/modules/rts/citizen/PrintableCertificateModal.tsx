"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Printer,
  ShieldCheck,
  User,
  Calendar,
  Layers,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button, Modal, OfficialCertificateSheet } from "@/components/common";
import { getIssuedCertificateAction } from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import type { RTSIssuedCertificate } from "@/types/rts/certificate.types";
import { useFormatter, useTranslations } from "next-intl";

interface PrintableCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationNo?: string;
  applicationId?: number;
  certificateNo?: string;
}

interface PreviewControlsProps {
  zoom: number;
  labels: {
    zoomOut: string;
    zoomIn: string;
    resetView: string;
  };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

function PreviewControls({ zoom, labels, onZoomIn, onZoomOut, onReset }: PreviewControlsProps) {
  const minimumZoom = 0.65;

  return (
    <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-lg border border-white/20 bg-slate-900/85 p-1 text-white shadow-lg">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= minimumZoom}
        className="rounded p-2 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
        title={labels.zoomOut}
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <span className="min-w-11 text-center text-xs font-bold">{Math.round(zoom * 100)}%</span>
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= 2.5}
        className="rounded p-2 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
        title={labels.zoomIn}
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded p-2 transition hover:bg-white/15"
        title={labels.resetView}
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function PrintableCertificateModal({
  isOpen,
  onClose,
  applicationNo,
  applicationId,
  certificateNo,
}: PrintableCertificateModalProps) {
  const t = useTranslations("rts.applicationDashboard.processDrawer.certificateViewer");
  const format = useFormatter();

  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<RTSIssuedCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImage, setIsImage] = useState<boolean>(true);
  const [previewZoom, setPreviewZoom] = useState(0.65);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const isManual = certificate?.certificateType === 2;
  const lookupKey = applicationNo || (applicationId ? String(applicationId) : "") || certificateNo || "";

  const docViewUrl = certificate?.documentGuid
    ? `/api/rts/documents/${certificate.documentGuid}/view`
    : certificate?.documentDownloadUrl || "";

  const docDownloadUrl = certificate?.documentDownloadUrl ||
    (certificate?.documentGuid ? `/api/rts/documents/${certificate.documentGuid}/download` : "#");

  useEffect(() => {
    if (!isOpen || !lookupKey) return;

    const fetchCertificate = async () => {
      setLoading(true);
      setError(null);
      setIsImage(true);
      setPreviewZoom(0.65);
      setPreviewPosition({ x: 0, y: 0 });
      setIsDraggingPreview(false);
      try {
        const res = await getIssuedCertificateAction(lookupKey);

        if (res && res.success && res.data) {
          setCertificate(res.data);
        } else {
          setError(res?.error || t("notFound"));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t("loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [isOpen, lookupKey, t]);

  const resetPreview = () => {
    setPreviewZoom(0.65);
    setPreviewPosition({ x: 0, y: 0 });
    setIsDraggingPreview(false);
  };

  const updatePreviewZoom = (direction: 1 | -1) => {
    setPreviewZoom((current) => {
      const next = Math.min(2.5, Math.max(0.65, Number((current + direction * 0.15).toFixed(2))));
      if (next === 0.65) setPreviewPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const beginPreviewDrag = (clientX: number, clientY: number) => {
    if (previewZoom <= 0.65) return;
    setIsDraggingPreview(true);
    dragStart.current = { x: clientX - previewPosition.x, y: clientY - previewPosition.y };
  };

  const movePreviewDrag = (clientX: number, clientY: number) => {
    if (!isDraggingPreview) return;
    setPreviewPosition({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
  };

  const handlePrint = () => {
    if (isManual && docViewUrl) {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${certificate?.certificateNo || t("certificateFallback")}</title>
            <meta charset="utf-8" />
            <style>
              @page { size: A4 portrait; margin: 8mm; }
              body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Segoe UI', Arial, sans-serif; background: #fff; text-align: center; }
              .header { font-size: 13px; font-weight: bold; margin-bottom: 6px; color: #1e293b; }
              img { max-width: 100%; max-height: 92vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <div class="header">${certificate?.serviceName || t("officialCertificateFallback")} | ${certificate?.certificateNo || ""}</div>
            <img src="${docViewUrl}" alt="${t("certificateFallback")}" onload="setTimeout(() => window.print(), 500)" />
          </body>
        </html>
      `);
      printWindow.document.close();
      return;
    }

    if (!certificate?.mergedHtmlContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${certificate.certificateNo}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            * {
              font-family: 'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif;
              box-sizing: border-box;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print { display: none !important; }
            }
            .official-certificate-sheet {
              border: 5px double #0f172a !important;
              box-shadow: none !important;
            }
          </style>
        </head>
        <body class="bg-white text-slate-900 p-2 md:p-4">
          ${certificate.mergedHtmlContent}
          <script>
            setTimeout(() => {
              window.print();
            }, 600);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isManual ? t("manualTitle") : t("issuedTitle")}
      maxWidth="xl"
      contentClassName="max-w-6xl h-[min(90vh,900px)]"
      bodyClassName="!overflow-hidden !p-0 !bg-slate-100"
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* Actions Bar */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap justify-between items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${
              isManual
                ? "bg-amber-50 text-amber-900 border-amber-300"
                : "bg-emerald-50 text-emerald-800 border-emerald-300"
            }`}>
              <ShieldCheck className={`w-3.5 h-3.5 ${isManual ? "text-amber-600" : "text-emerald-600"}`} />
              {isManual ? t("manualBadge") : t("issuedBadge")}
            </span>
            {certificate && (
              <span className="text-xs font-mono text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {t("certificateNumber")}: {certificate.certificateNo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isManual && certificate && docViewUrl && (
              <a
                href={docViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-300 rounded-xl px-3 py-1.5 transition-all shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                {t("openInNewTab")}
              </a>
            )}

            {isManual && certificate && docDownloadUrl && (
              <a
                href={docDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm rounded-xl px-3.5 py-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                {t("download")}
              </a>
            )}

            {(certificate?.mergedHtmlContent || (isManual && docViewUrl)) && (
              <Button
                onClick={handlePrint}
                disabled={loading || !certificate}
                icon={Printer}
                className="bg-[#4b70a6] hover:bg-[#3d5a8a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm rounded-xl px-3.5 py-1.5"
              >
                {t("print")}
              </Button>
            )}
          </div>
        </div>

        {/* Compact Statutory Notice Bar for Manual Certificate */}
        {isManual && (
          <div className="bg-amber-50/90 border-b border-amber-300 px-4 sm:px-6 py-2 flex items-center gap-2.5 text-amber-950 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-900 leading-tight">
              {certificate?.departmentCollectionNotice || t("collectionNotice")}
            </p>
          </div>
        )}

        {/* One preview canvas owns navigation; zoomed certificates are panned rather than nested-scrollable. */}
        <div className="relative flex-1 min-h-0 overflow-hidden bg-slate-100">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 m-auto">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <span className="text-xs font-semibold">{t("loading")}</span>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-lg border border-slate-200 max-w-md m-auto">
              <ShieldCheck className="w-10 h-10 text-amber-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 mb-1">{t("unavailableTitle")}</h4>
              <p className="text-xs text-slate-500">{error}</p>
            </div>
          ) : isManual && certificate ? (
            <div className="flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4">
              {/* Responsive Document Viewer: Image or PDF */}
              {docViewUrl ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-2 sm:p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      {t("uploadedCertificate")}
                    </span>
                    <a
                      href={docViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#4b70a6] hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {t("viewFullSize")}
                    </a>
                  </div>

                  <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-950/90">
                    {isImage ? (
                      <div
                        className={`flex h-full w-full touch-none items-center justify-center overflow-hidden ${previewZoom > 0.65 ? (isDraggingPreview ? "cursor-grabbing" : "cursor-grab") : ""}`}
                        onWheel={(event) => {
                          event.preventDefault();
                          updatePreviewZoom(event.deltaY < 0 ? 1 : -1);
                        }}
                        onMouseDown={(event) => beginPreviewDrag(event.clientX, event.clientY)}
                        onMouseMove={(event) => movePreviewDrag(event.clientX, event.clientY)}
                        onMouseUp={() => setIsDraggingPreview(false)}
                        onMouseLeave={() => setIsDraggingPreview(false)}
                        onTouchStart={(event) => {
                          if (event.touches.length === 1) beginPreviewDrag(event.touches[0].clientX, event.touches[0].clientY);
                        }}
                        onTouchMove={(event) => {
                          if (event.touches.length === 1) movePreviewDrag(event.touches[0].clientX, event.touches[0].clientY);
                        }}
                        onTouchEnd={() => setIsDraggingPreview(false)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={docViewUrl}
                          alt={certificate.certificateNo || t("certificateFallback")}
                          draggable={false}
                          className="max-h-full max-w-full select-none object-contain"
                          style={{ transform: `translate(${previewPosition.x}px, ${previewPosition.y}px) scale(${previewZoom})` }}
                          onError={() => setIsImage(false)}
                        />
                        <PreviewControls
                          zoom={previewZoom}
                          labels={{ zoomOut: t("zoomOut"), zoomIn: t("zoomIn"), resetView: t("resetView") }}
                          onZoomIn={() => updatePreviewZoom(1)}
                          onZoomOut={() => updatePreviewZoom(-1)}
                          onReset={resetPreview}
                        />
                      </div>
                    ) : (
                      <iframe
                        src={docViewUrl}
                        className="h-full w-full border-0 bg-white"
                        title={t("manualDocumentTitle")}
                      />
                    )}
                  </div>
                </div>
              ) : null}

              {/* Compact Verification Metadata Strip */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-600" /> {t("service")}
                  </span>
                  <p className="font-bold text-slate-800 truncate" title={certificate.serviceName}>
                    {certificate.serviceName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-600" /> {t("applicant")}
                  </span>
                  <p className="font-bold text-slate-800 truncate" title={certificate.applicantName}>
                    {certificate.applicantName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-600" /> {t("issuedDate")}
                  </span>
                  <p className="font-bold text-slate-800">
                    {certificate.issuedAt ? format.dateTime(new Date(certificate.issuedAt), { dateStyle: "medium" }) : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600" /> {t("status")}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    {t("officiallyIssued")}
                  </span>
                </div>
              </div>
            </div>
          ) : certificate?.mergedHtmlContent ? (
            <div
              className={`relative flex h-full w-full touch-none items-center justify-center overflow-hidden bg-slate-950/90 p-4 ${previewZoom > 0.65 ? (isDraggingPreview ? "cursor-grabbing" : "cursor-grab") : ""}`}
              onWheel={(event) => {
                event.preventDefault();
                updatePreviewZoom(event.deltaY < 0 ? 1 : -1);
              }}
              onMouseDown={(event) => beginPreviewDrag(event.clientX, event.clientY)}
              onMouseMove={(event) => movePreviewDrag(event.clientX, event.clientY)}
              onMouseUp={() => setIsDraggingPreview(false)}
              onMouseLeave={() => setIsDraggingPreview(false)}
              onTouchStart={(event) => {
                if (event.touches.length === 1) beginPreviewDrag(event.touches[0].clientX, event.touches[0].clientY);
              }}
              onTouchMove={(event) => {
                if (event.touches.length === 1) movePreviewDrag(event.touches[0].clientX, event.touches[0].clientY);
              }}
              onTouchEnd={() => setIsDraggingPreview(false)}
            >
              <div
                className="w-[794px] shrink-0 origin-center select-none"
                style={{ transform: `translate(${previewPosition.x}px, ${previewPosition.y}px) scale(${previewZoom})` }}
              >
                <OfficialCertificateSheet htmlContent={certificate.mergedHtmlContent} />
              </div>
              <PreviewControls
                zoom={previewZoom}
                labels={{ zoomOut: t("zoomOut"), zoomIn: t("zoomIn"), resetView: t("resetView") }}
                onZoomIn={() => updatePreviewZoom(1)}
                onZoomOut={() => updatePreviewZoom(-1)}
                onReset={resetPreview}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
