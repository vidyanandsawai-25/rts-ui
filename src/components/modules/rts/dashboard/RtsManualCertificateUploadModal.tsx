'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  AlertCircle,
  Download,
  FileCheck2,
  FileText,
  LoaderCircle,
  RotateCcw,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button, Modal } from '@/components/common';
import { useConfirm } from '@/components/common/ConfirmProvider';
import {
  uploadManualCertificateDocumentAction,
  verifyAndSendToApproveAction,
} from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import {
  downloadRtsDocument,
  getAdminRtsDocumentDownloadUrl,
  getAdminRtsDocumentViewUrl,
} from '@/lib/api/rts/rtsdocument.client';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = /\.(pdf|png|jpe?g|doc|docx)$/i;
type PreviewType = 'image' | 'pdf' | 'unsupported' | null;

interface RtsManualCertificateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproved: () => void;
  applicationId: number;
  applicationNo: string;
}

function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getPreviewType(fileName: string, contentType: string): PreviewType {
  if (contentType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (contentType.startsWith('image/') || /\.(png|jpe?g)$/i.test(fileName)) return 'image';
  return 'unsupported';
}

export default function RtsManualCertificateUploadModal({
  isOpen,
  onClose,
  onApproved,
  applicationId,
  applicationNo,
}: RtsManualCertificateUploadModalProps) {
  const t = useTranslations('rts.applicationDashboard.processDrawer');
  const { confirm } = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, startTransition] = useTransition();
  const [officerRemark, setOfficerRemark] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState<{
    guid: string;
    fileName: string;
    fileSizeBytes: number;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<PreviewType>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const activeFileName = uploadedDocument?.fileName || file?.name || '';

  useEffect(() => {
    if (!isOpen || (!file && !uploadedDocument)) return;
    let active = true;
    let objectUrl: string | null = null;
    const loadPreview = async () => {
      try {
        await Promise.resolve();
        if (uploadedDocument) {
          const response = await fetch(getAdminRtsDocumentViewUrl(uploadedDocument.guid), {
            credentials: 'same-origin',
          });
          if (!response.ok) throw new Error(t('previewRequestFailed', { status: response.status }));
          const blob = await response.blob();
          if (!blob.size) throw new Error(t('previewEmpty'));
          objectUrl = URL.createObjectURL(blob);
          if (active) {
            setPreviewUrl(objectUrl);
            setPreviewType(getPreviewType(uploadedDocument.fileName, blob.type));
          }
        } else if (file) {
          objectUrl = URL.createObjectURL(file);
          if (active) {
            setPreviewUrl(objectUrl);
            setPreviewType(getPreviewType(file.name, file.type));
          }
        }
      } catch (error) {
        if (active)
          setPreviewError(error instanceof Error ? error.message : t('previewLoadFailed'));
      } finally {
        if (active) setIsPreviewLoading(false);
      }
    };
    void loadPreview();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, isOpen, t, uploadedDocument]);

  const resetAndClose = () => {
    setFile(null);
    setUploadedDocument(null);
    setOfficerRemark('');
    setPreviewUrl(null);
    setPreviewType(null);
    setPreviewError(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    onClose();
  };
  const removeLocalFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setPreviewType(null);
    setPreviewError(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    if (inputRef.current) inputRef.current.value = '';
  };
  const selectFile = (nextFile: File | null) => {
    if (!nextFile) return;
    if (!ACCEPTED_EXTENSIONS.test(nextFile.name)) {
      toast.error(t('manualCertificateFileTypeInvalid'));
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error(t('manualCertificateFileSizeInvalid'));
      return;
    }
    setUploadedDocument(null);
    setPreviewUrl(null);
    setPreviewType(null);
    setPreviewError(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setIsPreviewLoading(true);
    setFile(nextFile);
  };
  const downloadActiveFile = async () => {
    try {
      if (uploadedDocument) {
        await downloadRtsDocument({
          url: getAdminRtsDocumentDownloadUrl(uploadedDocument.guid),
          fallbackFileName: uploadedDocument.fileName,
          errorMessage: t('downloadFailed'),
        });
      } else if (file) {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('downloadFailed'));
    }
  };
  const resetImage = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };
  const updateZoom = (direction: 1 | -1) =>
    setZoom((current) => {
      const next = Math.min(5, Math.max(1, Number((current + direction * 0.25).toFixed(2))));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  const uploadSelectedFile = () => {
    if (!file) {
      toast.error(t('manualCertificateFileRequired'));
      return;
    }
    confirm({
      variant: 'warning',
      title: t('confirmManualCertificateUploadTitle'),
      description: t('confirmManualCertificateUploadDescription', {
        applicationNo,
        fileName: file.name,
      }),
      confirmText: t('uploadCertificate'),
      onConfirm: async () => {
        const formData = new FormData();
        formData.set('file', file);
        startTransition(async () => {
          const result = await uploadManualCertificateDocumentAction(formData);
          if (!result.success || !result.documentGuid) {
            toast.error(result.error || t('manualCertificateUploadFailed'));
            return;
          }
          setPreviewUrl(null);
          setPreviewType(null);
          setPreviewError(null);
          setIsPreviewLoading(true);
          setUploadedDocument({
            guid: result.documentGuid,
            fileName: result.fileName || file.name,
            fileSizeBytes: result.fileSizeBytes || file.size,
          });
          toast.success(t('manualCertificateUploadSuccess'));
        });
      },
    });
  };
  const uploadAndApproveCertificate = () => {
    const remark = officerRemark.trim();
    if (!remark) {
      toast.error(t('manualCertificateRemarkRequired'));
      return;
    }
    if (!uploadedDocument && !file) {
      toast.error(t('manualCertificateFileRequired'));
      return;
    }

    confirm({
      variant: 'warning',
      title: t('confirmManualCertificateApprovalTitle'),
      description: t('confirmManualCertificateApprovalDescription', { applicationNo }),
      confirmText: t('uploadCertificateAndApprove'),
      onConfirm: async () => {
        startTransition(async () => {
          let certificate = uploadedDocument;
          if (!certificate && file) {
            const formData = new FormData();
            formData.set('file', file);
            const uploadResult = await uploadManualCertificateDocumentAction(formData);
            if (!uploadResult.success || !uploadResult.documentGuid) {
              toast.error(uploadResult.error || t('manualCertificateUploadFailed'));
              return;
            }
            certificate = {
              guid: uploadResult.documentGuid,
              fileName: uploadResult.fileName || file.name,
              fileSizeBytes: uploadResult.fileSizeBytes || file.size,
            };
            setPreviewUrl(null);
            setPreviewType(null);
            setPreviewError(null);
            setIsPreviewLoading(true);
            setUploadedDocument(certificate);
          }
          if (!certificate) return;

          const approvalResult = await verifyAndSendToApproveAction(
            applicationId,
            remark,
            certificate.guid
          );
          if (!approvalResult.success) {
            toast.error(approvalResult.message || t('actionFailed'));
            return;
          }
          toast.success(approvalResult.message || t('manualCertificateApprovalSuccess'));
          onApproved();
          resetAndClose();
        });
      },
    });
  };
  const hasPreviewSource = Boolean(file || uploadedDocument);

  return (
    <Modal
      open={isOpen}
      onClose={resetAndClose}
      title={t('manualCertificateUploadTitle')}
      subtitle={t('manualCertificateUploadSubtitle', { applicationNo })}
      maxWidth="2xl"
      contentClassName="!max-h-none"
      bodyClassName="!overflow-visible !p-2"
      footer={
        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={resetAndClose}>
            {t('close')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Upload}
            disabled={!file || isUploading || Boolean(uploadedDocument)}
            onClick={uploadSelectedFile}
          >
            {isUploading ? t('uploadingCertificate') : t('uploadCertificate')}
          </Button>
          <Button
            type="button"
            variant="success"
            size="sm"
            icon={FileCheck2}
            disabled={isUploading || (!file && !uploadedDocument)}
            onClick={uploadAndApproveCertificate}
          >
            {isUploading ? t('processingApproval') : t('uploadCertificateAndApprove')}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {t('manualCertificateReviewTitle')}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {t('manualCertificateReviewDescription')}
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label
              htmlFor="manual-certificate-officer-remark"
              className="text-sm font-bold text-slate-800"
            >
              {t('officerRemark')}
            </label>
            <textarea
              id="manual-certificate-officer-remark"
              value={officerRemark}
              disabled={isUploading}
              onChange={(event) => setOfficerRemark(event.target.value)}
              placeholder={t('manualCertificateRemarkPlaceholder')}
              rows={8}
              className="mt-3 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {t('manualCertificateRemarkHint')}
            </p>
          </section>
        </div>
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
          />
          {!hasPreviewSource && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-9 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
            >
              <Upload className="h-7 w-7 text-blue-600" />
              <span className="mt-3 text-sm font-bold text-slate-800">
                {t('selectManualCertificate')}
              </span>
              <span className="mt-1 text-xs text-slate-500">{t('manualCertificateFileRules')}</span>
            </button>
          )}
          {hasPreviewSource && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm">
              <header className="flex items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 px-3 py-2 text-white">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-blue-300" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{activeFileName}</p>
                    <p className="text-[10px] text-slate-400">
                      {uploadedDocument
                        ? formatFileSize(uploadedDocument.fileSizeBytes)
                        : file
                          ? formatFileSize(file.size)
                          : ''}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="xs"
                    variant="secondary"
                    icon={Download}
                    onClick={downloadActiveFile}
                  >
                    {t('download')}
                  </Button>
                  {!uploadedDocument && (
                    <Button
                      type="button"
                      size="xs"
                      variant="danger"
                      icon={Trash2}
                      onClick={removeLocalFile}
                    >
                      {t('remove')}
                    </Button>
                  )}
                </div>
              </header>
                <main className="relative flex h-[min(76vh,43rem)] min-h-[22rem] items-center justify-center overflow-hidden bg-slate-950">
                {isPreviewLoading ? (
                  <div className="flex flex-col items-center gap-3 text-slate-300">
                    <LoaderCircle className="h-7 w-7 animate-spin text-blue-400" />
                    <p className="text-xs font-medium">{t('loadingPreview')}</p>
                  </div>
                ) : previewUrl && previewType === 'pdf' ? (
                  <iframe
                    src={previewUrl}
                    title={activeFileName}
                    className="h-full w-full border-0 bg-white"
                  />
                ) : previewUrl && previewType === 'image' ? (
                  <div
                    className={`flex h-full w-full touch-none items-center justify-center overflow-hidden ${zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                    onWheel={(event) => {
                      event.preventDefault();
                      updateZoom(event.deltaY < 0 ? 1 : -1);
                    }}
                    onMouseDown={(event) => {
                      if (zoom <= 1) return;
                      setIsDragging(true);
                      dragStart.current = {
                        x: event.clientX - position.x,
                        y: event.clientY - position.y,
                      };
                    }}
                    onMouseMove={(event) => {
                      if (!isDragging) return;
                      setPosition({
                        x: event.clientX - dragStart.current.x,
                        y: event.clientY - dragStart.current.y,
                      });
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt={activeFileName}
                      draggable={false}
                      className="max-h-full max-w-full select-none object-contain"
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                      }}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-white/20 bg-slate-900/85 p-1 text-white shadow-lg">
                      <button
                        type="button"
                        onClick={() => updateZoom(-1)}
                        disabled={zoom <= 1}
                        className="rounded p-2 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                        title={t('zoomOut')}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </button>
                      <span className="min-w-11 text-center text-xs font-bold">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => updateZoom(1)}
                        disabled={zoom >= 5}
                        className="rounded p-2 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                        title={t('zoomIn')}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={resetImage}
                        className="rounded p-2 hover:bg-white/15"
                        title={t('resetImage')}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 px-6 text-center text-slate-300">
                    <AlertCircle className="h-9 w-9 text-amber-400" />
                    <p className="max-w-sm text-sm font-semibold">
                      {previewError || t('previewUnsupported')}
                    </p>
                  </div>
                )}
              </main>
            </section>
          )}
          {uploadedDocument && (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-900">
                {t('manualCertificateUploadSuccess')}
              </p>
              <p className="mt-1 truncate text-xs font-mono text-emerald-800">
                {uploadedDocument.guid}
              </p>
              <p className="mt-2 text-xs leading-5 text-emerald-700">
                {t('manualCertificateGuidPendingAssociation')}
              </p>
            </section>
          )}
        </div>
      </div>
    </Modal>
  );
}
