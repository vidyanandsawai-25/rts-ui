'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  Clock,
  Download,
  Eye,
  FileText,
  LoaderCircle,
  Paperclip,
  Upload,
  User,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { Button, Input, Label, Modal, TextArea } from '@/components/common';
import {
  getRtsStageDocumentsAction,
  uploadRtsStageDocumentAction,
} from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import {
  getAdminRtsDocumentDownloadUrl,
  getAdminRtsDocumentViewUrl,
} from '@/lib/api/rts/rtsdocument.client';
import type { RtsStageDocumentItem } from '@/types/rts/application-approval.types';
import RtsApplicationDocumentView from './RtsApplicationDocumentView';

interface RtsApplicationStageDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  applicationNo: string;
  applicantName?: string;
  canUpload: boolean;
  onDocumentUploaded?: () => void;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ACCEPTED_FILE_EXTENSIONS = '.pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx';

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDateTime(isoString: string | null | undefined, locale: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat(locale === 'mr' ? 'mr-IN' : 'en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return isoString;
  }
}

export default function RtsApplicationStageDocumentsModal({
  isOpen,
  onClose,
  applicationId,
  applicationNo,
  applicantName,
  canUpload,
  onDocumentUploaded,
}: RtsApplicationStageDocumentsModalProps) {
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<RtsStageDocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, startTransition] = useTransition();

  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [remarks, setRemarks] = useState('');

  // Active preview state
  const [previewDoc, setPreviewDoc] = useState<{
    guid: string;
    name: string;
    title?: string;
  } | null>(null);

  const fetchDocuments = async () => {
    if (!applicationId || applicationId <= 0) return;
    setIsLoading(true);
    try {
      const res = await getRtsStageDocumentsAction(applicationId);
      if (res.success && res.data) {
        setDocuments(res.data);
      }
    } catch {
      // silently fail or leave empty
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchDocuments();
      setSelectedFile(null);
      setDocumentTitle('');
      setRemarks('');
      setPreviewDoc(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, applicationId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(
        locale === 'mr'
          ? 'निवडलेली फाईल 20 MB पेक्षा कमी आकाराची असावी.'
          : 'Selected file must be 20 MB or smaller.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    if (!documentTitle.trim()) {
      // Auto-populate title with filename without extension
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setDocumentTitle(nameWithoutExt);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error(locale === 'mr' ? 'कृपया कागदपत्र फाईल निवडा.' : 'Please select a document file.');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('applicationId', String(applicationId));
        formData.append('file', selectedFile);
        formData.append('documentTitle', documentTitle.trim() || selectedFile.name);
        formData.append('remarks', remarks.trim());

        const res = await uploadRtsStageDocumentAction(formData);

        if (!res.success || !res.document) {
          toast.error(
            res.error ||
              (locale === 'mr' ? 'कागदपत्र अपलोड अयशस्वी.' : 'Failed to upload document.')
          );
          return;
        }

        toast.success(
          locale === 'mr'
            ? 'कागदपत्र यशस्वीरीत्या अपलोड झाले.'
            : 'Document uploaded successfully.'
        );

        // Reset form
        setSelectedFile(null);
        setDocumentTitle('');
        setRemarks('');
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Add newly uploaded doc to list
        setDocuments((prev) => [res.document!, ...prev]);

        onDocumentUploaded?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error uploading document');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        title={
          locale === 'mr'
            ? 'तपासणी कागदपत्रे (Scrutiny Documents)'
            : 'Stage Scrutiny Documents'
        }
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Top Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                {locale === 'mr' ? 'अर्ज क्रमांक' : 'Application No'}:
              </p>
              <p className="text-sm font-extrabold text-blue-950">{applicationNo}</p>
            </div>
            {applicantName && (
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500">
                  {locale === 'mr' ? 'अर्जदार' : 'Applicant'}:
                </p>
                <p className="text-sm font-bold text-slate-800">{applicantName}</p>
              </div>
            )}
          </div>

          {/* Upload Form Section (If current officer stage has permission) */}
          {canUpload && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 border-b border-indigo-200 pb-2">
                <Upload className="h-4 w-4 text-indigo-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-indigo-950">
                  {locale === 'mr' ? 'नवीन कागदपत्र अपलोड करा' : 'Upload New Scrutiny Document'}
                </h3>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="stageDocFile" className="text-xs font-bold text-slate-800">
                      {locale === 'mr' ? 'फाईल निवडा' : 'Select File'}{' '}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <input
                      ref={fileInputRef}
                      id="stageDocFile"
                      type="file"
                      accept={ACCEPTED_FILE_EXTENSIONS}
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="mt-1 block w-full text-xs font-medium text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-indigo-700 focus:outline-none"
                    />
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">
                      PDF, JPG, PNG, DOCX (कमाल: 20 MB)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="stageDocTitle" className="text-xs font-bold text-slate-800">
                      {locale === 'mr' ? 'कागदपत्राचे नाव / शीर्षक' : 'Document Title / Name'}{' '}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="stageDocTitle"
                      fullWidth
                      placeholder={
                        locale === 'mr'
                          ? 'उदा. स्थल पाहणी अहवाल, तांत्रिक शेरा'
                          : 'e.g. Site Inspection Report, NOC'
                      }
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      disabled={isUploading}
                      className="mt-1 text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stageDocRemarks" className="text-xs font-bold text-slate-800">
                    {locale === 'mr' ? 'शेरा / टिप्पणी (पर्यायी)' : 'Remarks / Notes (Optional)'}
                  </Label>
                  <TextArea
                    id="stageDocRemarks"
                    rows={2}
                    placeholder={
                      locale === 'mr'
                        ? 'कागदपत्राबाबत आवश्यक शेरा किंवा टिप्पणी लिहा...'
                        : 'Enter any remarks or observations regarding this document...'
                    }
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={isUploading}
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    icon={isUploading ? LoaderCircle : Upload}
                    className="rounded-lg bg-indigo-600 px-5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm"
                  >
                    {isUploading
                      ? locale === 'mr'
                        ? 'अपलोड होत आहे...'
                        : 'Uploading...'
                      : locale === 'mr'
                        ? 'कागदपत्र अपलोड करा'
                        : 'Upload Document'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Uploaded Documents List Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
                  {locale === 'mr'
                    ? 'अपलोड केलेली तपासणी कागदपत्रे'
                    : 'Uploaded Scrutiny Documents'}
                </h3>
                <span className="inline-flex h-5 items-center justify-center rounded-full bg-blue-100 px-2 text-[10px] font-extrabold text-blue-800">
                  {documents.length}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-xs font-bold text-slate-500">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-blue-600" />
                {locale === 'mr' ? 'कागदपत्रे लोड होत आहेत...' : 'Loading documents...'}
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-10 text-center">
                <FileText className="mb-2 h-8 w-8 text-slate-400" />
                <p className="text-xs font-bold text-slate-600">
                  {locale === 'mr'
                    ? 'कोणतीही तपासणी कागदपत्रे उपलब्ध नाहीत.'
                    : 'No scrutiny documents uploaded yet.'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {canUpload
                    ? locale === 'mr'
                      ? 'नवीन कागदपत्र जोडण्यासाठी वरील फॉर्म वापरा.'
                      : 'Use the form above to upload scrutiny documents.'
                    : locale === 'mr'
                      ? 'तपासणी अधिकाऱ्याने अद्याप कागदपत्रे जोडलेली नाहीत.'
                      : 'The scrutiny officer has not attached any documents yet.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {documents.map((doc, idx) => (
                  <div
                    key={doc.bindingId || doc.documentGuid || idx}
                    className="flex flex-col gap-2 p-3 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700 shadow-xs">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-extrabold text-slate-900">
                            {doc.documentTitle || doc.originalFileName || doc.fileName}
                          </p>
                          <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                            ({formatFileSize(doc.fileSizeBytes)})
                          </span>
                        </div>

                        {doc.originalFileName && doc.originalFileName !== doc.documentTitle && (
                          <p className="truncate text-[11px] font-medium text-slate-500">
                            {doc.originalFileName}
                          </p>
                        )}

                        {/* Officer Info & Timestamp */}
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500">
                          <span className="flex items-center gap-1 text-slate-700 font-bold">
                            <User className="h-3 w-3 text-indigo-600" />
                            {doc.uploadedByFullName || doc.uploadedByUserName || 'Officer'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {formatDateTime(doc.uploadedDate, locale)}
                          </span>
                        </div>

                        {/* Remarks if any */}
                        {doc.remarks && (
                          <div className="mt-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
                            <span className="font-bold text-slate-800">
                              {locale === 'mr' ? 'शेरा:' : 'Remarks:'}
                            </span>{' '}
                            {doc.remarks}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2 sm:self-center">
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        icon={Eye}
                        onClick={() =>
                          setPreviewDoc({
                            guid: doc.documentGuid,
                            name: doc.originalFileName || doc.fileName || 'Document',
                            title: doc.documentTitle || undefined,
                          })
                        }
                        className="rounded-lg px-2.5 text-[11px] font-bold text-blue-700 hover:bg-blue-50 border-blue-200"
                      >
                        {locale === 'mr' ? 'पहा' : 'View'}
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        icon={Download}
                        onClick={() =>
                          window.open(
                            getAdminRtsDocumentDownloadUrl(doc.documentGuid),
                            '_blank'
                          )
                        }
                        className="rounded-lg px-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                      >
                        {locale === 'mr' ? 'डाउनलोड' : 'Download'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end border-t border-slate-200 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-lg px-5 text-xs font-bold"
            >
              {locale === 'mr' ? 'बंद करा' : 'Close'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document Preview Drawer/Modal if an officer clicks "पहा / View" */}
      {previewDoc && (
        <RtsApplicationDocumentView
          open={Boolean(previewDoc)}
          fileUrl={getAdminRtsDocumentViewUrl(previewDoc.guid)}
          downloadUrl={getAdminRtsDocumentDownloadUrl(previewDoc.guid)}
          fileName={previewDoc.name}
          label={previewDoc.title || previewDoc.name}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </>
  );
}
