"use client";

import React, { useState, useRef, memo, useMemo, useEffect, useCallback } from 'react';
import { Button, Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { Upload, Eye, Loader2, Calendar, Download } from "lucide-react";
import { useTranslations } from "next-intl";

import { Swal } from "@/lib/utils/alerts";
import { extractAgreementData } from '@/lib/utils/renterUtils';
import { AgreementDocumentViewer } from "./AgreementDocumentViewer";
import { RenterFormData, RenterFormDataDetails } from '@/types/renter.types';
import { toast } from 'sonner';
import { validateRenterForm, ExistingFloorData, type CurrentFloorContext } from '@/lib/utils/renter-validation';

interface AgreementDetailsProps {
  formData: RenterFormData;
  setFormData: React.Dispatch<React.SetStateAction<RenterFormData>>;
  existingFloors?: ExistingFloorData[];
  currentFloorContext?: CurrentFloorContext;
}

const toDisplayDate = (val: string) => {
  if (!val) return "";
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

/** Agreement ID: digits only, up to 8 characters */
const isValidAgreementId = (val: string) => /^\d*$/.test(val);

const fieldLabelClassName = 'text-xs leading-snug tracking-normal !font-semibold text-slate-700';
const errorClassName = 'text-[10px] text-red-500 font-medium mt-0.5 animate-in fade-in duration-200';
const errorBorderClassName = 'border-red-400 focus:ring-red-100';

const AgreementDetails = memo(({ formData, setFormData, existingFloors = [], currentFloorContext }: AgreementDetailsProps) => {
  const t = useTranslations('quickDataEntry');
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  // ─── Field-Level Validation Errors (Reactive & Touched-Driven) ─────────────
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const markTouched = useCallback((field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  }, []);

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

  // Centralized, reactive form validation triggered on-the-fly as user enters data
  useEffect(() => {
    if (!formData?.renterDetails) return;

    const validationErrors = validateRenterForm(formData.renterDetails, currentFloorContext, existingFloors);
    const nextErrors: Record<string, string> = {};
    const relevantFields = ['agreementId', 'agreementDate', 'renterName', 'agreementDateFrom', 'agreementDateTo', 'rentAmount'];

    relevantFields.forEach(field => {
      const err = validationErrors.find(e => e.field === field);
      if (err) {
        const val = formData.renterDetails?.[field as keyof RenterFormDataDetails];
        const isEmpty = !val || (typeof val === 'string' && !val.trim());

        // For date fields, hide invalid-format errors while manually typing partial inputs (length < 10)
        if (field === 'agreementDate' || field === 'agreementDateFrom' || field === 'agreementDateTo') {
          const displayVal = (() => {
            if (field === 'agreementDate') return toDisplayDate(formData.renterDetails?.agreementDate || "");
            if (field === 'agreementDateFrom') return toDisplayDate(formData.renterDetails?.agreementDateFrom || "");
            if (field === 'agreementDateTo') return toDisplayDate(formData.renterDetails?.agreementDateTo || "");
            return "";
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
        <div className={`${uploadedDocument ? 'lg:col-span-2' : 'lg:col-span-1'} flex flex-col gap-1.5`}>
          <Label className={fieldLabelClassName}>{t('floor.renterSection.document')}</Label>
          <div className="flex items-center gap-1">
            <Input id="doc-upload" type="file" naked className="hidden" tabIndex={-1} onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                const fileExt = file.name.split('.').pop()?.toLowerCase();
                const isAllowedType = allowedTypes.includes(file.type) || ['pdf', 'jpg', 'jpeg', 'png'].includes(fileExt || '');
                
                if (!isAllowedType) {
                  toast.error("Only PDF, JPG, JPEG, or PNG files are allowed.");
                  e.target.value = '';
                  return;
                }
                
                if (file.name.length > 100) {
                  toast.error("File name is too long.");
                  e.target.value = '';
                  return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                  toast.error("File size should not exceed 5 MB.");
                  e.target.value = '';
                  return;
                }
                
                setUploadedDocument(file);
                if (file.type.startsWith("image/")) {
                  processOCR(file);
                }
              }
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
          <Label className={fieldLabelClassName}>{t('floor.renterSection.agreementId')} <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={formData?.renterDetails?.agreementId || ""}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 8);
              if (!isValidAgreementId(val)) {
                markTouched('agreementId');
                return;
              }
              setFormData(prev => {
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
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <Label className={fieldLabelClassName}>{t('floor.renterSection.agreementDate')} <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input type="date" ref={agreementDateRef} naked tabIndex={-1} className="absolute inset-0 opacity-0 pointer-events-none" value={formData?.renterDetails?.agreementDate || ""} onChange={e => {
              setFormData(prev => {
                return { ...prev, renterDetails: { ...prev.renterDetails, agreementDate: e.target.value } };
              });
              markTouched('agreementDate');
            }} />
            <Input 
              type="text" 
              placeholder="dd-mm-yyyy" 
              maxLength={10}
              value={toDisplayDate(formData?.renterDetails?.agreementDate || "")} 
              onChange={e => {
                const formatted = formatManualDate(e.target.value).slice(0, 10);
                setFormData(prev => {
                  return { ...prev, renterDetails: { ...prev.renterDetails, agreementDate: toValueDate(formatted) } };
                });
                if (formatted.length === 10) {
                  markTouched('agreementDate');
                }
              }}
              onBlur={() => markTouched('agreementDate')}
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
            maxLength={100}
            value={formData?.renterDetails?.renterName || ""} 
            onChange={e => {
              const rawVal = e.target.value;
              // Prevent non-alphabetic, non-space characters in real time (typing and paste)
              const filtered = rawVal.replace(/[^A-Za-z\u0900-\u097F ]/g, '');
              // Trim leading spaces, collapse multiple spaces, slice to 100 max chars
              const val = filtered.replace(/^\s+/, '').replace(/\s{2,}/g, ' ').slice(0, 100);
              
              setFormData(prev => {
                return { ...prev, renterDetails: { ...prev.renterDetails, renterName: val } };
              });
              markTouched('renterName');
            }} 
            onBlur={() => {
              markTouched('renterName');
              setFormData(prev => {
                if (!prev || !prev.renterDetails?.renterName) return prev;
                return {
                  ...prev,
                  renterDetails: {
                    ...prev.renterDetails,
                    renterName: prev.renterDetails.renterName.trim()
                  }
                };
              });
            }}
            className={`h-10 text-xs font-medium w-full text-slate-700 ${fieldErrors.renterName ? errorBorderClassName : ''}`} 
          />
          {fieldErrors.renterName && <p className={errorClassName}>{fieldErrors.renterName}</p>}
        </div>

        {/* Duration (From - To) — DD-MM-YYYY, From < To */}
        <div className={`${uploadedDocument ? 'lg:col-span-3' : 'lg:col-span-4'} flex flex-col gap-1.5`}>
          <Label className={fieldLabelClassName}>{t('floor.renterSection.durationFromTo')} <span className="text-red-500">*</span></Label>
          <div className="flex items-center gap-2 h-10 relative">
            <div className={`flex items-center bg-white border rounded-md px-2 h-full flex-1 min-w-0 ${fieldErrors.agreementDateFrom ? 'border-red-400' : 'border-gray-200'}`}>
              <Input type="text" placeholder="dd-mm-yyyy" naked maxLength={10} value={toDisplayDate(formData?.renterDetails?.agreementDateFrom || "")} onChange={e => {
                const formatted = formatManualDate(e.target.value).slice(0, 10);
                setFormData(prev => {
                  return { ...prev, renterDetails: { ...prev.renterDetails, agreementDateFrom: toValueDate(formatted) } };
                });
                if (formatted.length === 10) {
                  markTouched('agreementDateFrom');
                }
              }} 
              onBlur={() => markTouched('agreementDateFrom')}
              className="border-none bg-transparent h-8 p-0 text-xs font-medium flex-1 outline-none min-w-0 text-slate-700" />
              <Calendar className="w-4 h-4 text-gray-400 cursor-pointer shrink-0" tabIndex={-1} onClick={() => triggerDatePicker(fromDateRef)} />
            </div>
            <span className="text-xs font-medium text-slate-500 shrink-0">{t('floor.renterSection.to')}</span>
            <div className={`flex items-center bg-white border rounded-md px-2 h-full flex-1 min-w-0 ${fieldErrors.agreementDateTo ? 'border-red-400' : 'border-gray-200'}`}>
              <Input type="text" placeholder="dd-mm-yyyy" naked maxLength={10} value={toDisplayDate(formData?.renterDetails?.agreementDateTo || "")} onChange={e => {
                const formatted = formatManualDate(e.target.value).slice(0, 10);
                setFormData(prev => {
                  return { ...prev, renterDetails: { ...prev.renterDetails, agreementDateTo: toValueDate(formatted) } };
                });
                if (formatted.length === 10) {
                  markTouched('agreementDateTo');
                }
              }} 
              onBlur={() => markTouched('agreementDateTo')}
              className="border-none bg-transparent h-8 p-0 text-xs font-medium flex-1 outline-none min-w-0 text-slate-700" />
              <Calendar className="w-4 h-4 text-gray-400 cursor-pointer shrink-0" tabIndex={-1} onClick={() => triggerDatePicker(toDateRef)} />
            </div>
            <Input type="date" ref={fromDateRef} naked tabIndex={-1} className="absolute inset-0 opacity-0 pointer-events-none" value={formData?.renterDetails?.agreementDateFrom || ""} onChange={e => {
              setFormData(prev => {
                return { ...prev, renterDetails: { ...prev.renterDetails, agreementDateFrom: e.target.value } };
              });
              markTouched('agreementDateFrom');
            }} />
            <Input type="date" ref={toDateRef} naked tabIndex={-1} className="absolute inset-0 opacity-0 pointer-events-none" value={formData?.renterDetails?.agreementDateTo || ""} onChange={e => {
              setFormData(prev => {
                return { ...prev, renterDetails: { ...prev.renterDetails, agreementDateTo: e.target.value } };
              });
              markTouched('agreementDateTo');
            }} />
          </div>
          {fieldErrors.agreementDateFrom && <p className={errorClassName}>{fieldErrors.agreementDateFrom}</p>}
          {fieldErrors.agreementDateTo && <p className={errorClassName}>{fieldErrors.agreementDateTo}</p>}
        </div>

        {/* Rent Agreement(Monthly) */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <Label className={fieldLabelClassName}>{t('floor.renterSection.rentAgreementMonthly')} <span className="text-red-500">*</span></Label>
          <Input 
            type="text" 
            inputMode="decimal"
            maxLength={13}
            value={formData?.renterDetails?.rentAmount || ""} 
            onChange={e => {
              const val = e.target.value;
              if (val !== "" && !/^\d*(\.\d{0,2})?$/.test(val)) return; // Block negative, positive, more than 2 decimal places, and non-numeric
              const integerPart = val.split('.')[0];
              if (integerPart.length > 10) return; // Prevent typing more than 10 digits before decimal
              setFormData(prev => {
                return { ...prev, renterDetails: { ...prev.renterDetails, rentAmount: val } };
              });
              markTouched('rentAmount');
            }} 
            onBlur={() => markTouched('rentAmount')}
            className={`h-10 w-full font-medium text-xs text-slate-700 ${fieldErrors.rentAmount ? errorBorderClassName : ''}`} 
          />
          {fieldErrors.rentAmount && <p className={errorClassName}>{fieldErrors.rentAmount}</p>}
        </div>
      </div>

      <AgreementDocumentViewer open={showDocumentPreview} onClose={() => setShowDocumentPreview(false)} documentUrl={documentPreviewUrl} fileName={uploadedDocument?.name} />
    </div>
  );
});

AgreementDetails.displayName = 'AgreementDetails';
export default AgreementDetails;
