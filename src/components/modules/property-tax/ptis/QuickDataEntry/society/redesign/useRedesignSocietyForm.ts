'use client';

import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type {
  PropertyMasterData,
  ApartmentQcWingDto,
} from '@/types/property-tax/apartment';
import type { ApartmentEditFormData, SectionWingScope } from './types';
import type { FieldDiffItem } from './ApartmentEditConfirmModal';
import { updateApartmentQcTopSectionAction } from '@/lib/api/ptis/apartment/apartment-qc-top-section.actions';
import type { UpdateApartmentQcTopSectionPayload } from '@/lib/api/ptis/apartment/apartment-qc-top-section.service';

interface UseApartmentEditDrawerProps {
  open: boolean;
  propertyId?: number;
  propertyMasterData?: PropertyMasterData;
  locale?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const FIELD_LABELS: Record<keyof ApartmentEditFormData, string> = {
  id: 'ID',
  propertyId: 'Property ID',
  societyDetailId: 'Society Detail ID',
  moujaId: 'Mouja ID',
  taxZoneId: 'Tax Zone ID',
  categoryId: 'Category ID',
  propertyTypeId: 'Property Type ID',
  ownerTypeId: 'Owner Type ID',
  propertyNo: 'Property No.',
  upic: 'UPIC ID',
  societyName: 'Society Name (Regional)',
  societyNameEnglish: 'Society Name',
  propertyDescription: 'Property Description',
  division: 'Division',
  wardNo: 'Ward No.',
  category: 'Category',
  taxZoneAndName: 'Tax Zone & Name',
  subZoneCsnNo: 'Sub Zone & CSN',
  plotNo: 'Plot No.',
  surveyNo: 'Survey No.',
  pinCode: 'Pin Code',
  aadharNo: 'Aadhar No.',
  landOwnerName: 'Land Owner Name (Regional)',
  landOwnerNameEnglish: 'Land Owner Name',
  occupierName: 'Occupier Name',
  occupierNameEnglish: 'Occupier Name English',
  builderName: 'Builder Name (Regional)',
  builderNameEnglish: 'Builder Name',
  builderMobileNo: 'Builder Mobile No.',
  mobileNo: 'Mobile No.',
  alternateMobileNo: 'Alternate Mobile No.',
  societyEmail: 'Society Email',
  societyAddress: 'Society Address (Regional)',
  societyAddressEnglish: 'Society Address',
  managerName: 'Manager Name (Regional)',
  managerNameEnglish: 'Manager Name',
  managerMobileNo: 'Manager Mobile No.',
  managerEmail: 'Manager Email Id',
  secretaryName: 'Secretary Name (Regional)',
  secretaryNameEnglish: 'Secretary Name',
  secretaryMobileNo: 'Secretary Mobile No.',
  secretaryEmail: 'Secretary Email Id',
};

const resolvePositiveId = (val: unknown): number | null => {
  if (val === null || val === undefined) return null;
  const num = typeof val === 'number' ? val : parseInt(String(val), 10);
  return !isNaN(num) && num > 0 && num !== 2147483647 ? num : null;
};

const computeInitialWingScope = (
  wings: ApartmentQcWingDto[],
  targetIds?: number[] | null
): SectionWingScope => {
  const allIds = wings
    .map((w) => w.wingDetailId)
    .filter(
      (id): id is number => typeof id === 'number' && !isNaN(id) && id > 0 && id !== 2147483647
    );

  if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
    return {
      applyToAll: true,
      selectedWingIds: allIds,
    };
  }

  const validTargetIds = targetIds.filter(
    (id) =>
      typeof id === 'number' && !isNaN(id) && id > 0 && id !== 2147483647 && allIds.includes(id)
  );

  // If targetIds includes all available wings, treat as applyToAll
  if (allIds.length > 0 && validTargetIds.length === allIds.length) {
    return {
      applyToAll: true,
      selectedWingIds: allIds,
    };
  }

  return {
    applyToAll: false,
    selectedWingIds: validTargetIds,
  };
};

const getInitialFormState = (data?: PropertyMasterData): ApartmentEditFormData => {
  const cleanMobile = (val?: string | null) => {
    if (!val || val === '-') return '';
    const digits = val.replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  };

  const cleanText = (val?: string | null) => {
    if (!val || val === '-') return '';
    return val;
  };

  return {
    id: data?.propertyId ?? null,
    propertyId: data?.propertyId ?? null,
    societyDetailId: null,
    moujaId: resolvePositiveId(data?.moujaId),
    taxZoneId: resolvePositiveId(data?.taxZoneId),
    categoryId: resolvePositiveId(data?.categoryId),
    propertyTypeId: resolvePositiveId(data?.propertyTypeId),
    ownerTypeId: resolvePositiveId(data?.ownerTypeId),
    propertyNo: cleanText(data?.propertyNo),
    upic: cleanText(data?.upic),
    societyName: cleanText(data?.societyName),
    societyNameEnglish: cleanText(data?.societyNameEnglish),
    propertyDescription: cleanText(data?.propertyDescriptionRegional) || 'निवासी',
    division: cleanText(data?.division),
    wardNo: cleanText(data?.wardNo),
    category: cleanText(data?.category) || 'Apartment',
    taxZoneAndName: cleanText(data?.taxZoneAndName) || cleanText(data?.taxZone),
    subZoneCsnNo: cleanText(data?.subZoneCsnNo),
    plotNo: cleanText(data?.plotNo),
    surveyNo:
      cleanText(data?.surveyNo) ||
      (data?.subZoneCsnNo ? data.subZoneCsnNo.replace(/^CSN\s*-\s*/i, '').trim() : ''),
    pinCode: cleanText(data?.pinCode) || cleanText(data?.pincode),
    aadharNo: cleanText(data?.aadharNo),
    societyAddress: cleanText(data?.societyAddress) || cleanText(data?.address),
    societyAddressEnglish: cleanText(data?.societyAddressEnglish),
    landOwnerName:
      cleanText(data?.landOwnerName) || cleanText(data?.ownerName) || cleanText(data?.owner),
    landOwnerNameEnglish:
      cleanText(data?.landOwnerNameEnglish) || cleanText(data?.ownerNameEnglish),
    occupierName: cleanText(data?.occupierName) || cleanText(data?.builderName),
    occupierNameEnglish:
      cleanText(data?.occupierNameEnglish) || cleanText(data?.builderNameEnglish),
    builderName: cleanText(data?.builderName) || cleanText(data?.occupierName),
    builderNameEnglish: cleanText(data?.builderNameEnglish) || cleanText(data?.occupierNameEnglish),
    builderMobileNo: cleanMobile(data?.builderMobileNo),
    mobileNo: cleanMobile(data?.mobileNo) || cleanMobile(data?.builderMobileNo),
    alternateMobileNo: cleanMobile(data?.altMobileNo) || cleanMobile(data?.alternateMobileNo),
    societyEmail: cleanText(data?.societyEmail) || cleanText(data?.emailId),
    managerName: cleanText(data?.managerName),
    managerNameEnglish: cleanText(data?.managerNameEnglish),
    managerMobileNo: cleanMobile(data?.managerMobileNo),
    managerEmail: cleanText(data?.managerEmail),
    secretaryName: cleanText(data?.secretaryName),
    secretaryNameEnglish: cleanText(data?.secretaryNameEnglish),
    secretaryMobileNo: cleanMobile(data?.secretaryMobileNo),
    secretaryEmail: cleanText(data?.secretaryEmail),
  };
};

// Common Validation Rules & Limits
export const VALIDATION_LIMITS = {
  NAME_MAX: 100,
  ADDRESS_MAX: 250,
  EMAIL_MAX: 100,
  MOBILE_EXACT: 10,
  AADHAAR_EXACT: 12,
  PINCODE_EXACT: 6,
} as const;

export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;
export const ENGLISH_TEXT_PATTERN = /^[A-Za-z0-9\s.,'’()&/_-]*$/;
export const ENGLISH_NAME_PATTERN = /^[A-Za-z\s.,'’-]*$/;

/** Check for repeated digits like 000000, 999999 */
const hasRepeatedDigits = (digits: string, minRepeat: number = 6): boolean => {
  if (!digits || digits.length < minRepeat) return false;
  for (let i = 0; i <= digits.length - minRepeat; i++) {
    const char = digits[i];
    let count = 1;
    for (let j = i + 1; j < digits.length && digits[j] === char; j++) {
      count++;
      if (count >= minRepeat) return true;
    }
  }
  return false;
};

/** Validate a single field and return an error message or null */
export const validateSingleField = (
  field: keyof ApartmentEditFormData,
  value: unknown,
  _formData?: ApartmentEditFormData
): string | null => {
  const strVal = typeof value === 'string' ? value.trim() : '';

  switch (field) {
    case 'societyName': {
      if (!strVal) return 'Society Name (Regional) is required.';
      if (strVal.length < 2) return 'Society Name (Regional) must be at least 2 characters.';
      if (strVal.length > VALIDATION_LIMITS.NAME_MAX) {
        return `Society Name (Regional) cannot exceed ${VALIDATION_LIMITS.NAME_MAX} characters.`;
      }
      if (/^\d+$/.test(strVal)) return 'Society Name (Regional) cannot be only numbers.';
      if (/^[^a-zA-Z0-9\u0900-\u097F]+$/.test(strVal))
        return 'Society Name (Regional) contains invalid characters.';
      return null;
    }

    case 'societyNameEnglish': {
      if (!strVal) return null;
      if (strVal.length > VALIDATION_LIMITS.NAME_MAX) {
        return `Society Name cannot exceed ${VALIDATION_LIMITS.NAME_MAX} characters.`;
      }
      if (!ENGLISH_TEXT_PATTERN.test(strVal)) {
        return 'Please use English letters, numbers and basic punctuation only.';
      }
      return null;
    }

    case 'landOwnerName':
    case 'builderName':
    case 'managerName':
    case 'secretaryName': {
      if (!strVal) return null;
      if (strVal.length > VALIDATION_LIMITS.NAME_MAX) {
        return `Name cannot exceed ${VALIDATION_LIMITS.NAME_MAX} characters.`;
      }
      if (/\d/.test(strVal)) return 'Name cannot contain numbers.';
      return null;
    }

    case 'landOwnerNameEnglish':
    case 'builderNameEnglish':
    case 'managerNameEnglish':
    case 'secretaryNameEnglish': {
      if (!strVal) return null;
      if (strVal.length > VALIDATION_LIMITS.NAME_MAX) {
        return `Name cannot exceed ${VALIDATION_LIMITS.NAME_MAX} characters.`;
      }
      if (!ENGLISH_NAME_PATTERN.test(strVal)) {
        return 'Please use English letters, spaces, dots and hyphens only.';
      }
      return null;
    }

    case 'secretaryMobileNo':
    case 'managerMobileNo':
    case 'builderMobileNo':
    case 'mobileNo':
    case 'alternateMobileNo': {
      if (!strVal) return null;
      const digits = strVal.replace(/\D/g, '');
      if (digits.length === 0) return null;
      if (digits.length !== VALIDATION_LIMITS.MOBILE_EXACT) {
        return 'Mobile number must be exactly 10 digits.';
      }
      if (!INDIAN_MOBILE_PATTERN.test(digits)) {
        return 'Mobile number must start with 6, 7, 8, or 9.';
      }
      if (hasRepeatedDigits(digits, 6)) {
        return 'Please enter a valid mobile number.';
      }
      return null;
    }

    case 'societyEmail':
    case 'managerEmail':
    case 'secretaryEmail': {
      if (!strVal) return null;
      if (strVal.length > VALIDATION_LIMITS.EMAIL_MAX) {
        return `Email cannot exceed ${VALIDATION_LIMITS.EMAIL_MAX} characters.`;
      }
      if (
        !EMAIL_PATTERN.test(strVal) ||
        /\.{2,}/.test(strVal) ||
        /^\./.test(strVal) ||
        /\.@/.test(strVal) ||
        /@\./.test(strVal)
      ) {
        return 'Enter a valid email address (e.g. name@example.com).';
      }
      return null;
    }

    case 'societyAddress': {
      if (!strVal) return null;
      if (strVal.length > VALIDATION_LIMITS.ADDRESS_MAX) {
        return `Address cannot exceed ${VALIDATION_LIMITS.ADDRESS_MAX} characters.`;
      }
      return null;
    }

    case 'societyAddressEnglish': {
      if (!strVal) return null;
      if (strVal.length > VALIDATION_LIMITS.ADDRESS_MAX) {
        return `Address cannot exceed ${VALIDATION_LIMITS.ADDRESS_MAX} characters.`;
      }
      if (!ENGLISH_TEXT_PATTERN.test(strVal)) {
        return 'Please use English characters and punctuation only.';
      }
      return null;
    }

    case 'pinCode': {
      if (!strVal) return null;
      if (!/^[1-9]\d{5}$/.test(strVal)) {
        return 'PIN Code must be a 6-digit number.';
      }
      return null;
    }

    case 'aadharNo': {
      if (!strVal) return null;
      if (!/^\d{12}$/.test(strVal.replace(/\D/g, ''))) {
        return 'Aadhaar number must be 12 digits.';
      }
      return null;
    }

    default:
      return null;
  }
};

/** Validate all fields in the form and return a map of field errors */
export const validateAllSocietyFields = (
  formData: ApartmentEditFormData
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const fieldsToValidate: (keyof ApartmentEditFormData)[] = [
    'societyName',
    'societyNameEnglish',
    'landOwnerName',
    'landOwnerNameEnglish',
    'builderName',
    'builderNameEnglish',
    'builderMobileNo',
    'societyEmail',
    'societyAddress',
    'societyAddressEnglish',
    'managerName',
    'managerNameEnglish',
    'managerMobileNo',
    'managerEmail',
    'secretaryName',
    'secretaryNameEnglish',
    'secretaryMobileNo',
    'secretaryEmail',
    'pinCode',
    'aadharNo',
  ];

  for (const field of fieldsToValidate) {
    const err = validateSingleField(field, formData[field], formData);
    if (err) {
      errors[field] = err;
    }
  }

  return errors;
};

export function useRedesignSocietyForm({
  open = true,
  propertyId,
  propertyMasterData,
  locale: _locale = 'en',
  onSuccess,
  onClose,
}: UseApartmentEditDrawerProps) {
  const router = useRouter();

  const effectivePropertyId = (() => {
    if (propertyId && !isNaN(Number(propertyId)) && Number(propertyId) > 0) {
      return Number(propertyId);
    }
    if (
      propertyMasterData?.propertyId &&
      !isNaN(Number(propertyMasterData.propertyId)) &&
      Number(propertyMasterData.propertyId) > 0
    ) {
      return Number(propertyMasterData.propertyId);
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlPid = params.get('propertyId');
      if (urlPid && !isNaN(Number(urlPid)) && Number(urlPid) > 0) {
        return Number(urlPid);
      }
    }
    return undefined;
  })();

  const [formData, setFormData] = useState<ApartmentEditFormData>(() =>
    getInitialFormState(propertyMasterData)
  );
  const initialFormRef = useRef<ApartmentEditFormData>(getInitialFormState(propertyMasterData));
  const [availableWings, setAvailableWings] = useState<ApartmentQcWingDto[]>(
    () => propertyMasterData?.wings || []
  );

  const [managerWingScope, setManagerWingScope] = useState<SectionWingScope>(() =>
    computeInitialWingScope(
      propertyMasterData?.wings || [],
      propertyMasterData?.managerTargetWingDetailIds
    )
  );

  const [secretaryWingScope, setSecretaryWingScope] = useState<SectionWingScope>(() =>
    computeInitialWingScope(
      propertyMasterData?.wings || [],
      propertyMasterData?.secretaryTargetWingDetailIds
    )
  );

  // Field-level error and touched states for immediate validation feedback
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [detectedDiffs, setDetectedDiffs] = useState<FieldDiffItem[]>([]);
  const [isPending, startTransition] = useTransition();

  // Instant hydration from SSR propertyMasterData when opened or data updates
  useEffect(() => {
    if (open) {
      const initial = getInitialFormState(propertyMasterData);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(initial);
      initialFormRef.current = initial;
      setFieldErrors({});
      setTouchedFields({});

      const wings = propertyMasterData?.wings || [];
      setAvailableWings(wings);

      setManagerWingScope(
        computeInitialWingScope(wings, propertyMasterData?.managerTargetWingDetailIds)
      );
      setSecretaryWingScope(
        computeInitialWingScope(wings, propertyMasterData?.secretaryTargetWingDetailIds)
      );
    }
  }, [open, propertyMasterData]);

  const updateField = useCallback(
    <K extends keyof ApartmentEditFormData>(field: K, value: ApartmentEditFormData[K]) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        if (field === 'builderName') {
          next.occupierName = (value as string) || '';
        } else if (field === 'builderNameEnglish') {
          next.occupierNameEnglish = (value as string) || '';
        } else if (field === 'builderMobileNo') {
          next.mobileNo = (value as string) || '';
        }
        const error = validateSingleField(field, value, next);
        setFieldErrors((prevErrors) => {
          if (!error && !prevErrors[field]) return prevErrors;
          const updated = { ...prevErrors };
          if (error) {
            updated[field] = error;
          } else {
            delete updated[field];
          }
          return updated;
        });
        return next;
      });
      setTouchedFields((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
    },
    []
  );

  const handleBlurField = useCallback((field: keyof ApartmentEditFormData) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    setFormData((curr) => {
      const error = validateSingleField(field, curr[field], curr);
      setFieldErrors((prevErrors) => {
        if (!error && !prevErrors[field]) return prevErrors;
        const updated = { ...prevErrors };
        if (error) {
          updated[field] = error;
        } else {
          delete updated[field];
        }
        return updated;
      });
      return curr;
    });
  }, []);

  // Compute diffs and open confirmation modal with proper validation
  const handleReviewChanges = useCallback(() => {
    const targetPropId = effectivePropertyId;
    if (!targetPropId || targetPropId <= 0) {
      toast.error('Unable to identify property ID. Please select a property from search.');
      return;
    }

    // Comprehensive validation across all form fields
    const errors = validateAllSocietyFields(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouchedFields((prev) => {
        const nextTouched = { ...prev };
        Object.keys(errors).forEach((key) => {
          nextTouched[key] = true;
        });
        return nextTouched;
      });
      const firstError = Object.values(errors)[0];
      toast.error(firstError || 'Please fix the validation errors before proceeding.');
      return;
    }

    const diffs: FieldDiffItem[] = [];
    const initial = initialFormRef.current;

    const fieldsToCheck: (keyof ApartmentEditFormData)[] = [
      'societyName',
      'societyNameEnglish',
      'landOwnerName',
      'landOwnerNameEnglish',
      'builderName',
      'builderNameEnglish',
      'builderMobileNo',
      'societyEmail',
      'societyAddress',
      'societyAddressEnglish',
      'managerName',
      'managerNameEnglish',
      'managerMobileNo',
      'managerEmail',
      'secretaryName',
      'secretaryNameEnglish',
      'secretaryMobileNo',
      'secretaryEmail',
    ];

    fieldsToCheck.forEach((key) => {
      const oldVal = (initial[key] ?? '').toString().trim();
      const newVal = (formData[key] ?? '').toString().trim();

      if (oldVal !== newVal) {
        diffs.push({
          fieldKey: key,
          label: FIELD_LABELS[key] || key,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    });

    // If no differences detected vs baseline, still allow reviewing all filled attributes
    if (diffs.length === 0) {
      fieldsToCheck.forEach((key) => {
        const val = (formData[key] ?? '').toString().trim();
        if (val) {
          diffs.push({
            fieldKey: key,
            label: FIELD_LABELS[key] || key,
            oldValue: val,
            newValue: val,
          });
        }
      });
    }

    setDetectedDiffs(diffs);
    setIsConfirmOpen(true);
  }, [effectivePropertyId, formData]);

  // Execute PATCH API with computed secretaryTargetWingDetailIds & managerTargetWingDetailIds
  const handleConfirmSubmit = useCallback(async () => {
    const targetPropId = effectivePropertyId;
    if (!targetPropId || targetPropId <= 0) {
      toast.error('Unable to identify property ID. Please select a valid property.');
      return;
    }

    const allValidWingIds = availableWings
      .map((w) => w.wingDetailId)
      .filter(
        (id): id is number => typeof id === 'number' && !isNaN(id) && id > 0 && id !== 2147483647
      );

    const resolvedSecretaryWingIds: number[] = secretaryWingScope.applyToAll
      ? allValidWingIds
      : secretaryWingScope.selectedWingIds.filter(
          (id) => typeof id === 'number' && !isNaN(id) && id > 0 && id !== 2147483647
        );

    const resolvedManagerWingIds: number[] = managerWingScope.applyToAll
      ? allValidWingIds
      : managerWingScope.selectedWingIds.filter(
          (id) => typeof id === 'number' && !isNaN(id) && id > 0 && id !== 2147483647
        );

    const secMobileDigits = formData.secretaryMobileNo
      ? formData.secretaryMobileNo.replace(/\D/g, '')
      : '';
    const normalizedSecretaryMobile =
      secMobileDigits.length > 10 ? secMobileDigits.slice(-10) : secMobileDigits;

    const mgrMobileDigits = formData.managerMobileNo
      ? formData.managerMobileNo.replace(/\D/g, '')
      : '';
    const normalizedManagerMobile =
      mgrMobileDigits.length > 10 ? mgrMobileDigits.slice(-10) : mgrMobileDigits;

    const bldrMobileDigits = formData.builderMobileNo
      ? formData.builderMobileNo.replace(/\D/g, '')
      : '';
    const normalizedBuilderMobile =
      bldrMobileDigits.length > 10 ? bldrMobileDigits.slice(-10) : bldrMobileDigits;

    const mobDigits = formData.mobileNo ? formData.mobileNo.replace(/\D/g, '') : '';
    const normalizedMobile =
      normalizedBuilderMobile || (mobDigits.length > 10 ? mobDigits.slice(-10) : mobDigits);

    const altMobDigits = formData.alternateMobileNo
      ? formData.alternateMobileNo.replace(/\D/g, '')
      : '';
    const normalizedAltMobile = altMobDigits.length > 10 ? altMobDigits.slice(-10) : altMobDigits;

    const validMoujaId = resolvePositiveId(formData.moujaId ?? propertyMasterData?.moujaId);
    const validTaxZoneId = resolvePositiveId(formData.taxZoneId ?? propertyMasterData?.taxZoneId);
    const validCategoryId = resolvePositiveId(
      formData.categoryId ?? propertyMasterData?.categoryId
    );
    const validPropertyTypeId = resolvePositiveId(
      formData.propertyTypeId ?? propertyMasterData?.propertyTypeId
    );
    const validOwnerTypeId = resolvePositiveId(
      formData.ownerTypeId ?? propertyMasterData?.ownerTypeId
    );

    const patchPayload: UpdateApartmentQcTopSectionPayload = {
      ownerName: formData.landOwnerName?.trim() || '',
      ownerNameEnglish: formData.landOwnerNameEnglish?.trim() || '',
      occupierName: formData.builderName?.trim() || '',
      occupierNameEnglish: formData.builderNameEnglish?.trim() || '',
      mobileNo: normalizedMobile,
      builderMobileNo: normalizedBuilderMobile || normalizedMobile,
      alternateMobileNo: normalizedAltMobile,
      emailId: formData.societyEmail?.trim() || '',
      address: formData.societyAddress?.trim() || '',
      societyAddressEnglish: formData.societyAddressEnglish?.trim() || '',
      pinCode: formData.pinCode?.trim() || '',
      plotNo: formData.plotNo?.trim() || '',
      surveyNo:
        formData.surveyNo?.trim() ||
        (formData.subZoneCsnNo ? formData.subZoneCsnNo.replace(/^CSN\s*-\s*/i, '').trim() : ''),
      moujaId: validMoujaId,
      taxZoneId: validTaxZoneId,
      categoryId: validCategoryId,
      propertyTypeId: validPropertyTypeId,
      aadharNo: formData.aadharNo?.trim() || '',
      ownerTypeId: validOwnerTypeId,
      societyName: formData.societyName?.trim() || '',
      societyNameEnglish: formData.societyNameEnglish?.trim() || '',
      secretaryName: formData.secretaryName?.trim() || '',
      secretaryNameEnglish: formData.secretaryNameEnglish?.trim() || '',
      secretaryMobileNo: normalizedSecretaryMobile,
      secretaryEmailId: formData.secretaryEmail?.trim() || '',
      managerName: formData.managerName?.trim() || '',
      managerNameEnglish: formData.managerNameEnglish?.trim() || '',
      managerMobileNo: normalizedManagerMobile,
      managerEmailId: formData.managerEmail?.trim() || '',
      secretaryTargetWingDetailIds: resolvedSecretaryWingIds,
      managerTargetWingDetailIds: resolvedManagerWingIds,
    };

    // Requirement 16: Log final payload in development mode
    if (process.env.NODE_ENV !== 'production') {
      // console.log('[Edit Society API Payload]:', patchPayload);
    }

    startTransition(async () => {
      try {
        const patchRes = await updateApartmentQcTopSectionAction(targetPropId, patchPayload);

        if (patchRes.success) {
          toast.success(patchRes.message || 'Apartment details updated successfully!');
          initialFormRef.current = { ...formData };
          setIsConfirmOpen(false);

          const updatedDataPayload = {
            societyName: formData.societyName.trim(),
            societyNameEnglish: formData.societyNameEnglish?.trim() || '-',
            builderName: formData.builderName?.trim() || '-',
            builderNameEnglish: formData.builderNameEnglish?.trim() || '-',
            builderMobileNo: formData.builderMobileNo?.trim()
              ? `+91 ${formData.builderMobileNo.replace(/\D/g, '')}`
              : '-',
            landOwnerName: formData.landOwnerName?.trim() || '-',
            landOwnerNameEnglish: formData.landOwnerNameEnglish?.trim() || '-',
            managerName: formData.managerName?.trim() || '-',
            managerNameEnglish: formData.managerNameEnglish?.trim() || '-',
            managerMobileNo: formData.managerMobileNo?.trim()
              ? `+91 ${formData.managerMobileNo.replace(/\D/g, '')}`
              : '-',
            managerEmail: formData.managerEmail?.trim() || '-',
            secretaryName: formData.secretaryName?.trim() || '-',
            secretaryNameEnglish: formData.secretaryNameEnglish?.trim() || '-',
            secretaryMobileNo: formData.secretaryMobileNo?.trim()
              ? `+91 ${formData.secretaryMobileNo.replace(/\D/g, '')}`
              : '-',
            secretaryEmail: formData.secretaryEmail?.trim() || '-',
            societyAddress: formData.societyAddress?.trim() || '-',
            societyAddressEnglish: formData.societyAddressEnglish?.trim() || '-',
            societyEmail: formData.societyEmail?.trim() || '-',
            plotNo: formData.plotNo?.trim() || '-',
            division: formData.division?.trim() || '-',
            taxZoneAndName: formData.taxZoneAndName?.trim() || '-',
            category: formData.category?.trim() || '-',
            subZoneCsnNo: formData.subZoneCsnNo?.trim() || '-',
            propertyDescriptionRegional: formData.propertyDescription?.trim() || '-',
            moujaId: validMoujaId,
            taxZoneId: validTaxZoneId,
            categoryId: validCategoryId,
            propertyTypeId: validPropertyTypeId,
            ownerTypeId: validOwnerTypeId,
            secretaryTargetWingDetailIds: resolvedSecretaryWingIds,
            managerTargetWingDetailIds: resolvedManagerWingIds,
          };

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('ptis:apartment-top-section-updated', {
                detail: {
                  propertyId: targetPropId,
                  updatedValues: updatedDataPayload,
                },
              })
            );
          }
          router.refresh();
          onSuccess?.();
          onClose?.();
        } else {
          toast.error(
            patchRes.error ||
              'Unable to update apartment details. Please review your entries and try again.'
          );
        }
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while saving. Please try again.'
        );
      }
    });
  }, [
    effectivePropertyId,
    formData,
    propertyMasterData,
    availableWings,
    managerWingScope,
    secretaryWingScope,
    router,
    onSuccess,
    onClose,
  ]);

  return {
    formData,
    updateField,
    fieldErrors,
    touchedFields,
    handleBlurField,
    availableWings,
    managerWingScope,
    setManagerWingScope,
    secretaryWingScope,
    setSecretaryWingScope,
    isConfirmOpen,
    setIsConfirmOpen,
    detectedDiffs,
    handleReviewChanges,
    handleConfirmSubmit,
    isSubmitting: isPending,
  };
}
