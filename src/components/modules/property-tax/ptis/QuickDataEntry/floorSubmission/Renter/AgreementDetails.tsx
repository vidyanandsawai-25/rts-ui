"use client";

import React, { useState, useRef, memo, useMemo, useEffect, useCallback } from 'react';
import { Button, Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { Upload, Eye, Loader2, Calendar, Download } from "lucide-react";
import { useTranslations } from "next-intl";

import { Swal } from "@/lib/utils/alerts";
import { extractAgreementData } from '@/lib/utils/renterUtils';
import { AgreementDocumentViewer } from "./AgreementDocumentViewer";
import { RenterFormData } from '@/types/renter.types';
import { toast } from 'sonner';

interface AgreementDetailsProps {
  formData: RenterFormData | null;
  setFormData: React.Dispatch<React.SetStateAction<RenterFormData | null>>;
}

const toDisplayDate = (val: string) => {
  if (!val) return "";
  // If it's already in yyyy-mm-dd format, convert to dd-mm-yyyy
  const ymdMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) return `${ymdMatch[3]}-${ymdMatch[2]}-${ymdMatch[1]}`;
  return val;
};

const toValueDate = (val: string) => {
  if (!val) return "";
  const parts = val.split('-');
  // If it's a full dd-mm-yyyy, convert to yyyy-mm-dd for the state
  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return val;
};

const formatManualDate = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  let res = "";
  if (digits.length > 0) res += digits.slice(0, 2);
  if (digits.length > 2) res += "-" + digits.slice(2, 4);
  if (digits.length > 4) res += "-" + digits.slice(4, 8);
  return res;
};

// ─── Validation Helpers ───────────────────────────────────────────────────────

/** Agreement ID: allow only letters and digits */
const isValidAgreementId = (val: string) => /^[a-zA-Z0-9]*$/.test(val);

/** Renter Name: allow only letters, spaces, and dots (for abbreviations like "Mr.") */
const isValidRenterName = (val: string) => /^[a-zA-Z\s.]*$/.test(val);

/** Check if a DD-MM-YYYY string is a real calendar date */
const isValidDate = (ddmmyyyy: string): boolean => {
  const match = ddmmyyyy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return false;
  const [, dd, mm, yyyy] = match;
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  const year = parseInt(yyyy, 10);
  if (month < 1 || month > 12 || day < 1 || year < 1900) return false;
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getFullYear() === year && dateObj.getMonth() === month - 1 && dateObj.getDate() === day;
};

const fieldLabelClassName = 'text-xs leading-snug tracking-normal !font-semibold text-slate-700';
const errorClassName = 'text-[10px] text-red-500 font-medium mt-0.5 animate-in fade-in duration-200';
const errorBorderClassName = 'border-red-400 focus:ring-red-100';

const AgreementDetails = memo(({ formData, setFormData }: AgreementDetailsProps) => {
  const t = useTranslations('quickDataEntry');
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  // ─── Field-Level Validation Errors ────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const agreementDateRef = useRef<HTMLInputElement>(null);
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);

  // Memoize object URL to prevent new URL on every render and revoke when file changes
  const documentPreviewUrl = useMemo(() => {
    if (!uploadedDocument) return undefined;
    return URL.createObjectURL(uploadedDocument);
  }, [uploadedDocument]);

  useEffect(() => {
    return () => {
      if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl);
    };
  }, [documentPreviewUrl]);

  const triggerDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
        try {
            if (typeof ref.current.showPicker === 'function') ref.current.showPicker();
            else ref.current.click();
        } catch (_e) { ref.current.click(); }
    }
  };

  // ─── Validation Logic ──────────────────────────────────────────────────────

  const setError = useCallback((field: string, msg: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: msg }));
  }, []);

  const clearError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  /** Validate a complete DD-MM-YYYY date field on blur */
  const validateDateField = useCallback((fieldName: string, displayVal: string) => {
    if (!displayVal) {
      clearError(fieldName);
      return;
    }
    // Must be exactly DD-MM-YYYY (10 chars)
    if (displayVal.length < 10) {
      setError(fieldName, 'Please enter a complete date in DD-MM-YYYY format');
      return;
    }
    if (!isValidDate(displayVal)) {
      setError(fieldName, 'Invalid date. Please enter a valid date in DD-MM-YYYY format');
      return;
    }
    clearError(fieldName);
  }, [setError, clearError]);

  /** Cross-validate From < To whenever either changes */
  const validateDateRange = useCallback(() => {
    const fromDisplay = toDisplayDate(formData?.renterDetails?.agreementDateFrom || "");
    const toDisplay = toDisplayDate(formData?.renterDetails?.agreementDateTo || "");

    // Only cross-validate when both are complete dates
    if (fromDisplay.length === 10 && toDisplay.length === 10 && isValidDate(fromDisplay) && isValidDate(toDisplay)) {
      const fromVal = formData?.renterDetails?.agreementDateFrom;
      const toVal = formData?.renterDetails?.agreementDateTo;
      if (fromVal && toVal && new Date(fromVal) >= new Date(toVal)) {
        setError('agreementDateTo', 'To date must be after From date');
        return;
      }
      clearError('agreementDateTo');
    }
  }, [formData?.renterDetails?.agreementDateFrom, formData?.renterDetails?.agreementDateTo, setError, clearError]);

  // Re-validate date range whenever from/to changes
  useEffect(() => {
    validateDateRange();
  }, [validateDateRange]);

  const processOCR = async (file: File) => {
    setIsProcessingOCR(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let worker: any = null;
    try {
      Swal.fire({ icon: "info", title: "Analyzing...", text: "Extracting details", timer: 1000, showConfirmButton: false });
      
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
      const extractedData = extractAgreementData(result?.data?.text || "");
      if (Object.keys(extractedData).length > 0) {
        setFormData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            renterDetails: {
              ...prev.renterDetails,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...extractedData as any
            }
          };
        });
        Swal.fire({ icon: "success", title: "Success!", timer: 1000, showConfirmButton: false });
      }
      URL.revokeObjectURL(imageUrl);
    } catch (_e) {
      toast.error(t('floor.renterSection.ocrError') || 'Failed to process document. Please try again.');
    } finally {
      if (worker) await worker.terminate();
      setIsProcessingOCR(false);
    }
  };

  return (
    <div className="bg-white/60 border border-gray-200 p-4 rounded-xl shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Document Upload */}
        <div className="lg:col-span-1 flex flex-col gap-1.5">
          <Label className={fieldLabelClassName}>{t('floor.renterSection.document')}</Label>
          <div className="flex items-center gap-1">
            <Input id="doc-upload" type="file" naked className="hidden" tabIndex={-1} onChange={e => {
              const file = e.target.files?.[0];
              if (file) { setUploadedDocument(file); if (file.type.startsWith("image/")) processOCR(file); }
            }} />
            <Button type="button" onClick={() => document.getElementById('doc-upload')?.click()} className="w-10 h-10 p-0 bg-blue-500 rounded-md shrink-0">
              {isProcessingOCR ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Upload className="w-5 h-5 text-white" />}
            </Button>
            {uploadedDocument && (
              <Button variant="secondary" onClick={() => setShowDocumentPreview(true)} className="h-10 w-10 p-0 rounded-md border-gray-200 bg-white shrink-0">
                <Eye className="w-4 h-4 text-blue-500" />
              </Button>
            )}
            {uploadedDocument && (
                <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-10 px-2 text-[10px] gap-1 font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                        const documentUrl = URL.createObjectURL(uploadedDocument);
                        const link = document.createElement("a");
                        link.href = documentUrl;
                        link.download = uploadedDocument.name || "agreement-document";
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

        {/* Agreement ID — Alphanumeric only */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <Label className={fieldLabelClassName}>{t('floor.renterSection.agreementId')}</Label>
          <Input 
            value={formData?.renterDetails?.agreementId || ""} 
            onChange={e => {
              const val = e.target.value;
              if (!isValidAgreementId(val)) {
                setError('agreementId', 'Only letters and numbers are allowed');
                return; // Block the input
              }
              clearError('agreementId');
              setFormData(prev => {
                if (!prev) return null;
                return { ...prev, renterDetails: { ...prev.renterDetails, agreementId: val } };
              });
            }}
            className={`h-10 text-xs font-medium w-full text-slate-700 ${fieldErrors.agreementId ? errorBorderClassName : ''}`} 
          />
          {fieldErrors.agreementId && <p className={errorClassName}>{fieldErrors.agreementId}</p>}
        </div>

        {/* Agreement Date — DD-MM-YYYY */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <Label className={fieldLabelClassName}>{t('floor.renterSection.agreementDate')}</Label>
          <div className="relative">
            <Input type="date" ref={agreementDateRef} naked tabIndex={-1} className="absolute inset-0 opacity-0 pointer-events-none" value={formData?.renterDetails?.agreementDate || ""} onChange={e => {
              setFormData(prev => {
                if (!prev) return null;
                return { ...prev, renterDetails: { ...prev.renterDetails, agreementDate: e.target.value } };
              });
              clearError('agreementDate');
            }} />
            <Input 
              type="text" 
              placeholder="dd-mm-yyyy" 
              value={toDisplayDate(formData?.renterDetails?.agreementDate || "")} 
              onChange={e => {
                const formatted = formatManualDate(e.target.value);
                setFormData(prev => {
                  if (!prev) return null;
                  return { ...prev, renterDetails: { ...prev.renterDetails, agreementDate: toValueDate(formatted) } };
                });
                if (formatted.length < 10) clearError('agreementDate');
              }}
              onBlur={() => validateDateField('agreementDate', toDisplayDate(formData?.renterDetails?.agreementDate || ""))}
              className={`h-10 text-xs font-medium pr-8 w-full text-slate-700 ${fieldErrors.agreementDate ? errorBorderClassName : ''}`} 
            />
            <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer" tabIndex={-1} onClick={() => triggerDatePicker(agreementDateRef)} />
          </div>
          {fieldErrors.agreementDate && <p className={errorClassName}>{fieldErrors.agreementDate}</p>}
        </div>

        {/* Renter Name — Alphabets only */}
        <div className="lg:col-span-3 flex flex-col gap-1.5">
          <Label className={fieldLabelClassName}>{t('floor.renterSection.renterName')} <span className="text-red-500">*</span></Label>
          <Input 
            value={formData?.renterDetails?.renterName || ""} 
            onChange={e => {
              const val = e.target.value;
              if (!isValidRenterName(val)) {
                setError('renterName', 'Only alphabets are allowed (no numbers or symbols)');
                return; // Block the input
              }
              clearError('renterName');
              setFormData(prev => {
                if (!prev) return null;
                return { ...prev, renterDetails: { ...prev.renterDetails, renterName: val } };
              });
            }} 
            className={`h-10 text-xs font-medium w-full text-slate-700 ${fieldErrors.renterName ? errorBorderClassName : ''}`} 
          />
          {fieldErrors.renterName && <p className={errorClassName}>{fieldErrors.renterName}</p>}
        </div>

        {/* Duration (From - To) — DD-MM-YYYY, From < To */}
        <div className="lg:col-span-4 flex flex-col gap-1.5">
          <Label className={fieldLabelClassName}>{t('floor.renterSection.durationFromTo')} <span className="text-red-500">*</span></Label>
          <div className="flex items-center gap-2 h-10 relative">
            <div className={`flex items-center bg-white border rounded-md px-2 h-full flex-1 min-w-0 ${fieldErrors.agreementDateFrom ? 'border-red-400' : 'border-gray-200'}`}>
              <Input type="text" placeholder="dd-mm-yyyy" naked value={toDisplayDate(formData?.renterDetails?.agreementDateFrom || "")} onChange={e => {
                const formatted = formatManualDate(e.target.value);
                setFormData(prev => {
                  if (!prev) return null;
                  return { ...prev, renterDetails: { ...prev.renterDetails, agreementDateFrom: toValueDate(formatted) } };
                });
                if (formatted.length < 10) clearError('agreementDateFrom');
              }} 
              onBlur={() => validateDateField('agreementDateFrom', toDisplayDate(formData?.renterDetails?.agreementDateFrom || ""))}
              className="border-none bg-transparent h-8 p-0 text-xs font-medium flex-1 outline-none min-w-0 text-slate-700" />
              <Calendar className="w-4 h-4 text-gray-400 cursor-pointer shrink-0" tabIndex={-1} onClick={() => triggerDatePicker(fromDateRef)} />
            </div>
            <span className="text-xs font-medium text-slate-500 shrink-0">{t('floor.renterSection.to')}</span>
            <div className={`flex items-center bg-white border rounded-md px-2 h-full flex-1 min-w-0 ${fieldErrors.agreementDateTo ? 'border-red-400' : 'border-gray-200'}`}>
              <Input type="text" placeholder="dd-mm-yyyy" naked value={toDisplayDate(formData?.renterDetails?.agreementDateTo || "")} onChange={e => {
                const formatted = formatManualDate(e.target.value);
                setFormData(prev => {
                  if (!prev) return null;
                  return { ...prev, renterDetails: { ...prev.renterDetails, agreementDateTo: toValueDate(formatted) } };
                });
                if (formatted.length < 10) clearError('agreementDateTo');
              }} 
              onBlur={() => {
                validateDateField('agreementDateTo', toDisplayDate(formData?.renterDetails?.agreementDateTo || ""));
              }}
              className="border-none bg-transparent h-8 p-0 text-xs font-medium flex-1 outline-none min-w-0 text-slate-700" />
              <Calendar className="w-4 h-4 text-gray-400 cursor-pointer shrink-0" tabIndex={-1} onClick={() => triggerDatePicker(toDateRef)} />
            </div>
            <Input type="date" ref={fromDateRef} naked tabIndex={-1} className="absolute inset-0 opacity-0 pointer-events-none" value={formData?.renterDetails?.agreementDateFrom || ""} onChange={e => {
              setFormData(prev => {
                if (!prev) return null;
                return { ...prev, renterDetails: { ...prev.renterDetails, agreementDateFrom: e.target.value } };
              });
              clearError('agreementDateFrom');
            }} />
            <Input type="date" ref={toDateRef} naked tabIndex={-1} className="absolute inset-0 opacity-0 pointer-events-none" value={formData?.renterDetails?.agreementDateTo || ""} onChange={e => {
              setFormData(prev => {
                if (!prev) return null;
                return { ...prev, renterDetails: { ...prev.renterDetails, agreementDateTo: e.target.value } };
              });
              clearError('agreementDateTo');
            }} />
          </div>
          {fieldErrors.agreementDateFrom && <p className={errorClassName}>{fieldErrors.agreementDateFrom}</p>}
          {fieldErrors.agreementDateTo && <p className={errorClassName}>{fieldErrors.agreementDateTo}</p>}
        </div>

        {/* Rent Agreement(Monthly) */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <Label className={fieldLabelClassName}>{t('floor.renterSection.rentAgreementMonthly')} <span className="text-red-500">*</span></Label>
          <Input type="number" min="0" value={formData?.renterDetails?.rentAmount || ""} onChange={e => {
            const val = e.target.value;
            if (val && Number(val) < 0) return; // Block negative
            setFormData(prev => {
              if (!prev) return null;
              return { ...prev, renterDetails: { ...prev.renterDetails, rentAmount: val } };
            });
          }} className="h-10 w-full font-medium text-xs text-slate-700" />
        </div>
      </div>

      <AgreementDocumentViewer open={showDocumentPreview} onClose={() => setShowDocumentPreview(false)} documentUrl={documentPreviewUrl} fileName={uploadedDocument?.name} />
    </div>
  );
});

AgreementDetails.displayName = 'AgreementDetails';
export default AgreementDetails;
