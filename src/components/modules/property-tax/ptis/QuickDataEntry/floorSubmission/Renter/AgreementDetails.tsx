'use client';

import React, { useState, useRef, memo, useMemo, useEffect, useCallback } from 'react';
import { Button, Input } from '@/components/common';
import { Label } from '@/components/common/label';
import { Select } from '@/components/common/select';
import { Upload, Eye, Loader2, Calendar, Download, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

import { Swal } from '@/lib/utils/alerts';
import { extractAgreementData } from '@/lib/utils/renter/renterUtils';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';
import { RenterFormData, RenterFormDataDetails } from '@/types/renter/renter.types';
import { toast } from 'sonner';
import { globalUploadDocumentAction, globalDeleteDocumentAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/document.actions';
import { getDocumentBlobUrl } from '@/lib/utils/document-client-utils';
import {
  validateRenterForm,
  ExistingFloorData,
  type CurrentFloorContext,
} from '@/lib/utils/renter/renter-validation';
import { capitalizeEachWord } from '@/lib/utils/input-sanitization';

interface AgreementDetailsProps {
  formData: RenterFormData;
  setFormData: React.Dispatch<React.SetStateAction<RenterFormData>>;
  existingFloors?: ExistingFloorData[];
  currentFloorContext?: CurrentFloorContext;
  wardNo?: string;
  propertyNo?: string;
  partitionNo?: string;
}

const toDisplayDate = (val: string) => {
  if (!val) return '';
  // If it's already in yyyy-mm-dd format, convert to dd-mm-yyyy
  const ymdMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) return `${ymdMatch[3]}-${ymdMatch[2]}-${ymdMatch[1]}`;
  const parts = val.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return val;
};

const toValueDate = (val: string) => {
  if (!val) return '';
  const parts = val.split('-');
  // If it's a full dd-mm-yyyy, convert to yyyy-mm-dd for the state
  if (
    parts.length === 3 &&
    parts[0].length === 2 &&
    parts[1].length === 2 &&
    parts[2].length === 4
  ) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return val;
};

const formatManualDate = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  let res = '';
  if (digits.length > 0) res += digits.slice(0, 2);
  if (digits.length > 2) res += '-' + digits.slice(2, 4);
  if (digits.length > 4) res += '-' + digits.slice(4, 8);
  return res;
};

// ─── Validation Helpers ───────────────────────────────────────────────────────

/** Agreement No: alphanumeric, hyphen, and underscore, up to 8 characters */
const isValidAgreementId = (val: string) => /^[A-Za-z0-9_-]*$/.test(val);

const fieldLabelClassName = 'text-xs leading-snug tracking-normal !font-semibold text-slate-700';
const errorClassName =
  'text-[10px] text-red-500 font-medium absolute top-full left-0 mt-0.5 whitespace-nowrap animate-in fade-in duration-200';
const errorBorderClassName = 'border-red-400 focus:ring-red-100';

const AgreementDetails = memo(
  ({ formData, setFormData, existingFloors = [], currentFloorContext, wardNo, propertyNo, partitionNo }: AgreementDetailsProps) => {
    const t = useTranslations('quickDataEntry');
    const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
    const [showDocumentPreview, setShowDocumentPreview] = useState(false);
    const [isProcessingOCR, setIsProcessingOCR] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const taxLiabilityOptions = useMemo(() => [
      { label: t('floor.renterSection.self'), value: 'Self' },
      { label: t('floor.renterSection.renter'), value: 'Renter' },
    ], [t]);

    // ─── Field-Level Validation Errors (Reactive & Touched-Driven) ─────────────
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

    const markTouched = useCallback((field: string) => {
      setTouchedFields((prev) => ({ ...prev, [field]: true }));
    }, []);

    const agreementDateRef = useRef<HTMLInputElement>(null);
    const fromDateRef = useRef<HTMLInputElement>(null);
    const toDateRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
    const [isViewing, setIsViewing] = useState(false);

    const handleViewDocument = async () => {
      if (uploadedDocument) {
        const url = URL.createObjectURL(uploadedDocument);
        setPreviewUrl(url);
        setShowDocumentPreview(true);
        return;
      }
      const guid = formData?.renterDetails?.documentGuid;
      if (!guid) return;
      setIsViewing(true);
      try {
        const { url } = await getDocumentBlobUrl(guid);
        setPreviewUrl(url);
        setShowDocumentPreview(true);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to view document");
      } finally {
        setIsViewing(false);
      }
    };

    const handleClosePreview = () => {
      setShowDocumentPreview(false);
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(undefined);
    };

    // Clean up preview URL on unmount or file changes
    useEffect(() => {
      return () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    }, [previewUrl]);

    const handleDeleteDocument = useCallback(async () => {
      const guid = formData?.renterDetails?.documentGuid;
      if (!guid) {
        setUploadedDocument(null);
        return;
      }
      setIsDeleting(true);
      try {
        const res = await globalDeleteDocumentAction(guid);
        if (res.success) {
          setFormData((prev) => ({
            ...prev,
            renterDetails: {
              ...prev.renterDetails,
              documentBindingId: undefined,
              documentGuid: undefined,
            },
          }));
          setUploadedDocument(null);
          toast.success('Document removed successfully.');
        } else {
          toast.error(res.error || 'Failed to remove document.');
        }
      } catch (_e) {
        toast.error('Failed to remove document.');
      } finally {
        setIsDeleting(false);
      }
    }, [formData?.renterDetails?.documentGuid, setFormData]);

    const triggerDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
      if (ref.current) {
        try {
          if (typeof ref.current.showPicker === 'function') ref.current.showPicker();
          else ref.current.click();
        } catch (_e) {
          ref.current.click();
        }
      }
    };

    // Centralized, reactive form validation triggered on-the-fly as user enters data
    useEffect(() => {
      if (!formData?.renterDetails) return;

      const validationErrors = validateRenterForm(
        formData.renterDetails,
        currentFloorContext,
        existingFloors
      );
      const nextErrors: Record<string, string> = {};
      const relevantFields = [
        'taxLiability',
        'agreementId',
        'agreementDate',
        'renterName',
        'agreementDateFrom',
        'agreementDateTo',
        'rentAmount',
        'selfDeclarationAmount',
      ];

      relevantFields.forEach((field) => {
        const err = validationErrors.find((e) => e.field === field);
        if (err) {
          const val = formData.renterDetails?.[field as keyof RenterFormDataDetails];
          const isEmpty = !val || (typeof val === 'string' && !val.trim());

          // For date fields, hide invalid-format errors while manually typing partial inputs (length < 10)
          if (
            field === 'agreementDate' ||
            field === 'agreementDateFrom' ||
            field === 'agreementDateTo'
          ) {
            const displayVal = (() => {
              if (field === 'agreementDate')
                return toDisplayDate(formData.renterDetails?.agreementDate || '');
              if (field === 'agreementDateFrom')
                return toDisplayDate(formData.renterDetails?.agreementDateFrom || '');
              if (field === 'agreementDateTo')
                return toDisplayDate(formData.renterDetails?.agreementDateTo || '');
              return '';
            })();

            if (displayVal.length > 0 && displayVal.length < 10) {
              return; // Silence partial typing errors
            }

            if (isEmpty) {
              if (touchedFields[field]) nextErrors[field] = err.message;
            } else {
              nextErrors[field] = err.message;
            }
          } else {
            if (isEmpty) {
              if (touchedFields[field]) nextErrors[field] = err.message;
            } else {
              nextErrors[field] = err.message;
            }
          }
        }
      });

      setFieldErrors(nextErrors);
    }, [formData?.renterDetails, touchedFields, currentFloorContext, existingFloors]);

    const processOCR = async (file: File) => {
      setIsProcessingOCR(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let worker: any = null;
      try {
        Swal.fire({
          icon: 'info',
          title: 'Analyzing...',
          text: 'Extracting details',
          timer: 1000,
          showConfirmButton: false,
        });

        // Dynamically load Tesseract from CDN if not already loaded
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).Tesseract) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        const imageUrl = URL.createObjectURL(file);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        worker = await (window as any).Tesseract.createWorker('eng', 1);
        const result = await worker.recognize(imageUrl);
        const extractedData = extractAgreementData(result?.data?.text || '');
        if (Object.keys(extractedData).length > 0) {
          setFormData((prev) => {
            return {
              ...prev,
              renterDetails: {
                ...prev.renterDetails,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(extractedData as any),
              },
            };
          });
          Swal.fire({ icon: 'success', title: 'Success!', timer: 1000, showConfirmButton: false });
        }
        URL.revokeObjectURL(imageUrl);
      } catch (_e) {
        toast.error(
          t('floor.renterSection.ocrError') || 'Failed to process document. Please try again.'
        );
      } finally {
        if (worker) await worker.terminate();
        setIsProcessingOCR(false);
      }
    };

    return (
      <div className="bg-white/60 border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col gap-5">
        {/* Row 1: Document, Tax Liability, Agreement No, Agreement Date, Renter Name, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-nowrap gap-4 items-start">
          {/* Document Upload */}
          <div
            className={cn(
              "flex flex-col gap-1.5 shrink-0",
              uploadedDocument
                ? "col-span-1 sm:col-span-2 lg:w-[220px]"
                : formData?.renterDetails?.documentGuid
                ? "col-span-1 sm:col-span-2 lg:w-[140px]"
                : "col-span-1 sm:col-span-1 lg:w-[60px]"
            )}
          >
            <Label className={fieldLabelClassName}>{t('floor.renterSection.document')}</Label>
            <div className="flex items-center gap-1">
              <Input
                id="doc-upload"
                type="file"
                naked
                className="hidden"
                tabIndex={-1}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const allowedTypes = [
                      'application/pdf',
                      'image/jpeg',
                      'image/jpg',
                      'image/png',
                    ];
                    const fileExt = file.name.split('.').pop()?.toLowerCase();
                    const isAllowedType =
                      allowedTypes.includes(file.type) ||
                      ['pdf', 'jpg', 'jpeg', 'png'].includes(fileExt || '');

                    if (!isAllowedType) {
                      toast.error('Only PDF, JPG, JPEG, or PNG files are allowed.');
                      e.target.value = '';
                      return;
                    }

                    if (file.name.length > 100) {
                      toast.error('File name is too long.');
                      e.target.value = '';
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('File size should not exceed 5 MB.');
                      e.target.value = '';
                      return;
                    }

                    setIsUploading(true);
                    const fileData = new FormData();
                    fileData.append('File', file);
                    fileData.append('DepartmentId', '1');
                    fileData.append('ModuleId', '1');
                    fileData.append('ReferenceTableName', 'RenterMast');
                    fileData.append('ReferenceTableId', String(formData.id || 0));
                    fileData.append('ReferencePropertyName', 'Id');
                    fileData.append('BindingPurpose', 'Renter Agreement');
                    fileData.append('IsPrimaryDocument', 'true');

                    globalUploadDocumentAction(fileData)
                      .then((res) => {
                        if (res.success && res.data) {
                          const uploadRes = res.data as { documentBindingId?: number; documentGuid?: string };
                          setFormData((prev) => ({
                            ...prev,
                            renterDetails: {
                              ...prev.renterDetails,
                              documentBindingId: uploadRes.documentBindingId,
                              documentGuid: uploadRes.documentGuid,
                            },
                          }));
                          toast.success('Document uploaded successfully.');
                          setUploadedDocument(file);
                          if (file.type.startsWith('image/')) {
                            processOCR(file);
                          }
                        } else {
                          toast.error(res.error || 'Failed to upload document.');
                        }
                      })
                      .catch(() => {
                        toast.error('Failed to upload document.');
                      })
                      .finally(() => {
                        setIsUploading(false);
                      });
                  }
                }}
              />
              <Button
                type="button"
                disabled={isUploading}
                onClick={() => document.getElementById('doc-upload')?.click()}
                className="w-10 h-10 p-0 bg-blue-500 rounded-md shrink-0"
              >
                {isUploading || isProcessingOCR ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Upload className="w-5 h-5 text-white" />
                )}
              </Button>
              {(uploadedDocument || formData?.renterDetails?.documentGuid) && (
                <Button
                  variant="secondary"
                  disabled={isViewing}
                  onClick={handleViewDocument}
                  className="h-10 w-10 p-0 rounded-md border-gray-200 bg-white shrink-0"
                >
                  {isViewing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-blue-500" />
                  )}
                </Button>
              )}
              {(uploadedDocument || formData?.renterDetails?.documentGuid) && (
                <Button
                  variant="secondary"
                  disabled={isDeleting}
                  onClick={handleDeleteDocument}
                  className="h-10 w-10 p-0 rounded-md border-red-200 bg-white text-red-500 hover:bg-red-50 shrink-0"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
              {uploadedDocument && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-10 px-2 text-[10px] gap-1 font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    const documentUrl = URL.createObjectURL(uploadedDocument);
                    const link = document.createElement('a');
                    link.href = documentUrl;
                    link.download = uploadedDocument.name || 'agreement-document';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(documentUrl);
                  }}
                >
                  <Download className="w-3.5 h-3.5" /> {t('floor.renterSection.download')}
                </Button>
              )}
            </div>
          </div>

          {/* Tax Liability */}
          <div className="col-span-1 lg:w-[110px] shrink-0 flex flex-col gap-1.5 relative">
            <Label className={fieldLabelClassName}>
              {t('floor.renterSection.taxLiability')} <span className="text-red-500">*</span>
            </Label>
            <Select
              options={taxLiabilityOptions}
              value={formData?.renterDetails?.taxLiability || ''}
              onChange={(_, val) => {
                setFormData((prev) => {
                  return {
                    ...prev,
                    renterDetails: { ...prev.renterDetails, taxLiability: val },
                  };
                });
                markTouched('taxLiability');
              }}
              onBlur={() => markTouched('taxLiability')}
              className={cn(
                "h-10 text-xs font-medium w-full text-slate-700 [&>button]:!text-xs [&>button]:!px-2.5 [&>button>span]:!text-xs",
                fieldErrors.taxLiability && "[&>button]:!border-red-400 [&>button]:focus:!ring-red-100"
              )}
            />
            {fieldErrors.taxLiability && (
              <p className={errorClassName}>{fieldErrors.taxLiability}</p>
            )}
          </div>

          {/* Agreement No — Alphanumeric only */}
          <div className="col-span-1 lg:w-[100px] shrink-0 flex flex-col gap-1.5 relative">
            <Label className={fieldLabelClassName}>
              {t('floor.renterSection.agreementId')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              inputMode="text"
              maxLength={8}
              value={formData?.renterDetails?.agreementId || ''}
              onChange={(e) => {
                const val = e.target.value.slice(0, 8);
                if (!isValidAgreementId(val)) {
                  markTouched('agreementId');
                  return;
                }
                setFormData((prev) => {
                  return { ...prev, renterDetails: { ...prev.renterDetails, agreementId: val } };
                });
                markTouched('agreementId');
              }}
              onBlur={() => markTouched('agreementId')}
              className={`h-10 text-xs font-medium w-full text-slate-700 ${fieldErrors.agreementId ? errorBorderClassName : ''}`}
            />
            {fieldErrors.agreementId && <p className={errorClassName}>{fieldErrors.agreementId}</p>}
          </div>

          {/* Agreement Date — DD-MM-YYYY */}
          <div className="col-span-1 lg:w-[125px] shrink-0 flex flex-col gap-1.5 relative">
            <Label className={fieldLabelClassName}>
              {t('floor.renterSection.agreementDate')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="date"
                ref={agreementDateRef}
                naked
                tabIndex={-1}
                className="absolute inset-0 opacity-0 pointer-events-none"
                value={formData?.renterDetails?.agreementDate || ''}
                onChange={(e) => {
                  setFormData((prev) => {
                    return {
                      ...prev,
                      renterDetails: { ...prev.renterDetails, agreementDate: e.target.value },
                    };
                  });
                  markTouched('agreementDate');
                }}
              />
              <Input
                type="text"
                placeholder="dd-mm-yyyy"
                maxLength={10}
                value={toDisplayDate(formData?.renterDetails?.agreementDate || '')}
                onChange={(e) => {
                  const formatted = formatManualDate(e.target.value).slice(0, 10);
                  setFormData((prev) => {
                    return {
                      ...prev,
                      renterDetails: {
                        ...prev.renterDetails,
                        agreementDate: toValueDate(formatted),
                      },
                    };
                  });
                  if (formatted.length === 10) {
                    markTouched('agreementDate');
                  }
                }}
                onBlur={() => markTouched('agreementDate')}
                className={`h-10 text-xs font-medium pr-8 w-full text-slate-700 ${fieldErrors.agreementDate ? errorBorderClassName : ''}`}
              />
              <Calendar
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                tabIndex={-1}
                onClick={() => triggerDatePicker(agreementDateRef)}
              />
            </div>
            {fieldErrors.agreementDate && (
              <p className={errorClassName}>{fieldErrors.agreementDate}</p>
            )}
          </div>

          {/* Renter Name — Alphabets only */}
          <div className="col-span-1 lg:flex-[2] lg:min-w-[180px] flex flex-col gap-1.5 relative">
            <Label className={fieldLabelClassName}>
              {t('floor.renterSection.renterName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              maxLength={100}
              value={formData?.renterDetails?.renterName || ''}
              onChange={(e) => {
                const rawVal = e.target.value;
                // Prevent non-alphabetic, non-space characters in real time (typing and paste)
                const filtered = rawVal.replace(/[^A-Za-z\u0900-\u097F ]/g, '');
                // Trim leading spaces, collapse multiple spaces, slice to 100 max chars
                const val = filtered
                  .replace(/^\s+/, '')
                  .replace(/\s{2,}/g, ' ')
                  .slice(0, 100);
                const capitalized = capitalizeEachWord(val);

                setFormData((prev) => {
                  return {
                    ...prev,
                    renterDetails: { ...prev.renterDetails, renterName: capitalized },
                  };
                });
                markTouched('renterName');
              }}
              onBlur={() => {
                markTouched('renterName');
                setFormData((prev) => {
                  if (!prev || !prev.renterDetails?.renterName) return prev;
                  return {
                    ...prev,
                    renterDetails: {
                      ...prev.renterDetails,
                      renterName: capitalizeEachWord(prev.renterDetails.renterName.trim()),
                    },
                  };
                });
              }}
              className={`h-10 text-xs font-medium w-full text-slate-700 ${fieldErrors.renterName ? errorBorderClassName : ''}`}
            />
            {fieldErrors.renterName && <p className={errorClassName}>{fieldErrors.renterName}</p>}
          </div>

          {/* Duration (From - To) — DD-MM-YYYY, From < To */}
          <div
            className={cn(
              "flex flex-col gap-1.5 relative",
              uploadedDocument ? "col-span-1 sm:col-span-2 lg:flex-[1.5] lg:min-w-[250px]" : "col-span-1 sm:col-span-1 lg:flex-[1.5] lg:min-w-[250px]"
            )}
          >
            <Label className={fieldLabelClassName}>
              {t('floor.renterSection.durationFromTo')} <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2 h-10 relative">
              <div
                className={`flex items-center bg-white border rounded-md px-2 h-full flex-1 min-w-0 ${fieldErrors.agreementDateFrom ? 'border-red-400' : 'border-gray-200'}`}
              >
                <Input
                  type="text"
                  placeholder="dd-mm-yyyy"
                  naked
                  maxLength={10}
                  value={toDisplayDate(formData?.renterDetails?.agreementDateFrom || '')}
                  onChange={(e) => {
                    const formatted = formatManualDate(e.target.value).slice(0, 10);
                    setFormData((prev) => {
                      return {
                        ...prev,
                        renterDetails: {
                          ...prev.renterDetails,
                          agreementDateFrom: toValueDate(formatted),
                        },
                      };
                    });
                    if (formatted.length === 10) {
                      markTouched('agreementDateFrom');
                    }
                  }}
                  onBlur={() => markTouched('agreementDateFrom')}
                  className="border-none bg-transparent h-8 p-0 text-xs font-medium flex-1 outline-none min-w-0 text-slate-700"
                />
                <Calendar
                  className="w-4 h-4 text-gray-400 cursor-pointer shrink-0"
                  tabIndex={-1}
                  onClick={() => triggerDatePicker(fromDateRef)}
                />
              </div>
              <span className="text-xs font-medium text-slate-500 shrink-0">
                {t('floor.renterSection.to')}
              </span>
              <div
                className={`flex items-center bg-white border rounded-md px-2 h-full flex-1 min-w-0 ${fieldErrors.agreementDateTo ? 'border-red-400' : 'border-gray-200'}`}
              >
                <Input
                  type="text"
                  placeholder="dd-mm-yyyy"
                  naked
                  maxLength={10}
                  value={toDisplayDate(formData?.renterDetails?.agreementDateTo || '')}
                  onChange={(e) => {
                    const formatted = formatManualDate(e.target.value).slice(0, 10);
                    setFormData((prev) => {
                      return {
                        ...prev,
                        renterDetails: {
                          ...prev.renterDetails,
                          agreementDateTo: toValueDate(formatted),
                        },
                      };
                    });
                    if (formatted.length === 10) {
                      markTouched('agreementDateTo');
                    }
                  }}
                  onBlur={() => markTouched('agreementDateTo')}
                  className="border-none bg-transparent h-8 p-0 text-xs font-medium flex-1 outline-none min-w-0 text-slate-700"
                />
                <Calendar
                  className="w-4 h-4 text-gray-400 cursor-pointer shrink-0"
                  tabIndex={-1}
                  onClick={() => triggerDatePicker(toDateRef)}
                />
              </div>
              <Input
                type="date"
                ref={fromDateRef}
                naked
                tabIndex={-1}
                className="absolute inset-0 opacity-0 pointer-events-none"
                min={formData?.renterDetails?.agreementDate || ''}
                value={formData?.renterDetails?.agreementDateFrom || ''}
                onChange={(e) => {
                  setFormData((prev) => {
                    return {
                      ...prev,
                      renterDetails: { ...prev.renterDetails, agreementDateFrom: e.target.value },
                    };
                  });
                  markTouched('agreementDateFrom');
                }}
              />
              <Input
                type="date"
                ref={toDateRef}
                naked
                tabIndex={-1}
                className="absolute inset-0 opacity-0 pointer-events-none"
                min={
                  formData?.renterDetails?.agreementDateFrom ||
                  formData?.renterDetails?.agreementDate ||
                  ''
                }
                value={formData?.renterDetails?.agreementDateTo || ''}
                onChange={(e) => {
                  setFormData((prev) => {
                    return {
                      ...prev,
                      renterDetails: { ...prev.renterDetails, agreementDateTo: e.target.value },
                    };
                  });
                  markTouched('agreementDateTo');
                }}
              />
            </div>
            {fieldErrors.agreementDateFrom && (
              <p className={errorClassName}>{fieldErrors.agreementDateFrom}</p>
            )}
            {fieldErrors.agreementDateTo && (
              <p className={cn(errorClassName, "left-auto right-0 text-right")}>{fieldErrors.agreementDateTo}</p>
            )}
          </div>
        </div>

        {/* Row 2: Rent Agreement(Monthly), Self Declaration(Monthly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {/* Rent Agreement(Monthly) */}
          <div className="lg:col-span-2 flex flex-col gap-1.5 relative">
            <Label className={fieldLabelClassName}>
              {t('floor.renterSection.rentAgreementMonthly')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              maxLength={13}
              value={formData?.renterDetails?.rentAmount || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== '' && !/^\d*(\.\d{0,2})?$/.test(val)) return; // Block negative, positive, more than 2 decimal places, and non-numeric
                const integerPart = val.split('.')[0];
                if (integerPart.length > 10) return; // Prevent typing more than 10 digits before decimal
                setFormData((prev) => {
                  return { ...prev, renterDetails: { ...prev.renterDetails, rentAmount: val } };
                });
                markTouched('rentAmount');
              }}
              onBlur={() => markTouched('rentAmount')}
              className={`h-10 w-full font-medium text-xs text-slate-700 ${fieldErrors.rentAmount ? errorBorderClassName : ''}`}
            />
            {fieldErrors.rentAmount && <p className={errorClassName}>{fieldErrors.rentAmount}</p>}
          </div>

          {/* Self Declaration(Monthly) */}
          <div className="lg:col-span-2 flex flex-col gap-1.5 relative">
            <Label className={fieldLabelClassName}>
              {t('floor.renterSection.selfDeclarationMonthly')}
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              maxLength={13}
              value={formData?.renterDetails?.selfDeclarationAmount || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== '' && !/^\d*(\.\d{0,2})?$/.test(val)) return; // Block negative, positive, more than 2 decimal places, and non-numeric
                const integerPart = val.split('.')[0];
                if (integerPart.length > 10) return; // Prevent typing more than 10 digits before decimal
                setFormData((prev) => {
                  return {
                    ...prev,
                    renterDetails: { ...prev.renterDetails, selfDeclarationAmount: val },
                  };
                });
                markTouched('selfDeclarationAmount');
              }}
              onBlur={() => markTouched('selfDeclarationAmount')}
              className={`h-10 w-full font-medium text-xs text-slate-700 ${fieldErrors.selfDeclarationAmount ? errorBorderClassName : ''}`}
            />
            {fieldErrors.selfDeclarationAmount && (
              <p className={errorClassName}>{fieldErrors.selfDeclarationAmount}</p>
            )}
          </div>
        </div>

        <DocumentViewerModal
          isOpen={showDocumentPreview}
          onClose={handleClosePreview}
          fileUrl={previewUrl || ''}
          fileName={uploadedDocument?.name || 'agreement_document.pdf'}
          label={t('floor.renterSection.agreementPreview')}
          wardNo={wardNo}
          propertyNo={propertyNo}
          partitionNo={partitionNo}
        />
      </div>
    );
  }
);

AgreementDetails.displayName = 'AgreementDetails';
export default AgreementDetails;
