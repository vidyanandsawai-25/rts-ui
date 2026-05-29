'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  calculateLicenseEndDate,
  calculateRenewalAlerts,
  generateLicenseKey as buildLicenseKey,
} from '@/lib/utils/ulb-configuration.utils';
import { ULB_TYPE_OPTIONS } from '@/config/ulb-configuration.config';
import { parseLicenseDurationFromApi } from '@/lib/api/configuration-settings/ulb-configuration/ulb-master.mapper';
import { getUlbConfigurationValidationError } from '@/lib/api/configuration-settings/ulb-configuration/ulb-master.validator';
import type {
  CompletionStatus,
  RenewalAlert,
  ULBConfigurationFormData,
  UlbConfigurationMaster,
  UlbSectionKey,
} from '@/types/ulbconfig-master.types';

const EMPTY_FORM: ULBConfigurationFormData = {
  ulbName: '',
  ulbCode: '',
  ulbType: '',
  state: '',
  district: '',
  address: '',
  pincode: '',
  contactPerson: '',
  designation: '',
  email: '',
  phone: '',
  alternatePhone: '',
  website: '',
  ulbLogo: null,
  ulbNameFont: 'Inter',
  ulbNameColor: '#1e40af',
  ulbNameSize: '24',
  ulbNameWeight: '600',
  ulbNameStyle: 'normal',
  projectStartDate: '',
  financialYearStart: '',
  goLiveDate: '',
  implementationPartner: '',
  projectManager: '',
  projectManagerEmail: '',
  projectManagerPhone: '',
  licenseType: '',
  licenseKey: '',
  licenseStartDate: '',
  licenseDuration: '',
  licenseEndDate: '',
  maxUsers: '',
  maxDepartments: '',
  supportType: '',
  renewalDate: '',
  licenseStatus: 'active',
};

function toFormDate(value: string | null | undefined): string {
  if (!value) return '';
  const str = String(value).trim();
  if (!str) return '';
  return str.includes('T') ? str.split('T')[0] : str;
}

function buildInitialForm(ulb: UlbConfigurationMaster | null): ULBConfigurationFormData {
  if (!ulb) return EMPTY_FORM;

  const ulbTypeLabel = ULB_TYPE_OPTIONS.find((o) => o.value === ulb.ulbTypeId)?.label ?? '';
  const licenseDuration = ulb.licenceDuration
    ? parseLicenseDurationFromApi(ulb.licenceDuration)
    : '';
  const licenseEndDate =
    ulb.licenceEndDate ??
    calculateLicenseEndDate(ulb.licenceStartDate ?? '', licenseDuration);
  const alerts = licenseEndDate ? calculateRenewalAlerts(licenseEndDate) : [];

  return {
    ...EMPTY_FORM,
    ulbName: ulb.ulbName ?? '',
    ulbCode: ulb.ulbCode ?? '',
    ulbType: ulbTypeLabel,
    state: ulb.state ?? '',
    district: ulb.district ?? '',
    address: ulb.ulbAddress ?? '',
    pincode: ulb.pinCode ?? '',
    contactPerson: ulb.contactPersonName ?? '',
    designation: ulb.contactPersonDesignation ?? '',
    email: ulb.emailId ?? '',
    phone: ulb.mobileNo ?? '',
    alternatePhone: ulb.alternateMobileNo ?? '',
    website: ulb.websiteUrl ?? '',
    ulbLogo: ulb.ulbLogo ?? null,
    projectStartDate: toFormDate(ulb.projectStartDate),
    financialYearStart: toFormDate(ulb.financialYearStartDate),
    goLiveDate: toFormDate(ulb.expectedGoLiveDate),
    implementationPartner: ulb.partnerName ?? '',
    projectManager: ulb.pmName ?? '',
    projectManagerEmail: ulb.pmEmailId ?? '',
    projectManagerPhone: ulb.pmMobileNo ?? '',
    licenseType: ulb.licenceType ?? '',
    licenseKey: ulb.licenceKey ?? '',
    licenseStartDate: toFormDate(ulb.licenceStartDate),
    licenseDuration,
    licenseEndDate: toFormDate(licenseEndDate),
    supportType: ulb.supportType ?? '',
    renewalDate: alerts[0]?.date ?? '',
    licenseStatus: ulb.isActive !== false ? 'active' : 'inactive',
  };
}

function buildCompletionStatus(ulb: UlbConfigurationMaster | null): CompletionStatus {
  return {
    ulbInfo: !!(ulb?.ulbName && ulb?.ulbCode),
    logoImages: !!ulb?.ulbLogo,
    projectLicenseInfo: !!(
      ulb?.licenceType &&
      ulb?.licenceKey &&
      ulb?.projectStartDate &&
      ulb?.licenceStartDate
    ),
    departmentLicense: false,
  };
}

function buildInitialRenewalAlerts(ulb: UlbConfigurationMaster | null): RenewalAlert[] {
  if (!ulb) return [];
  const licenseDuration = ulb.licenceDuration
    ? parseLicenseDurationFromApi(ulb.licenceDuration)
    : '';
  const licenseEndDate =
    ulb.licenceEndDate ??
    calculateLicenseEndDate(ulb.licenceStartDate ?? '', licenseDuration);
  return licenseEndDate ? calculateRenewalAlerts(licenseEndDate) : [];
}

const SECTION_TO_STATUS: Record<UlbSectionKey, keyof CompletionStatus> = {
  'ulb-info': 'ulbInfo',
  'logo-images': 'logoImages',
  'project-license-info': 'projectLicenseInfo',
};

export function useUlbConfigurationForm(initialUlb: UlbConfigurationMaster | null) {
  const [formData, setFormData] = useState<ULBConfigurationFormData>(() => buildInitialForm(initialUlb));
  const [masterRenewalAlerts, setMasterRenewalAlerts] = useState<RenewalAlert[]>(() =>
    buildInitialRenewalAlerts(initialUlb)
  );
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>(() =>
    buildCompletionStatus(initialUlb)
  );

  const syncFromUlbMaster = useCallback((ulb: UlbConfigurationMaster | null) => {
    setFormData(buildInitialForm(ulb));
    setMasterRenewalAlerts(buildInitialRenewalAlerts(ulb));
    setCompletionStatus((prev) => ({
      ...buildCompletionStatus(ulb),
      departmentLicense: prev.departmentLicense,
    }));
  }, []);

  const setField = useCallback(<K extends keyof ULBConfigurationFormData>(field: K, value: ULBConfigurationFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleStateChange = useCallback((state: string) => {
    setFormData((prev) => ({ ...prev, state, district: '' }));
  }, []);

  const handleLicenseChange = useCallback((field: 'licenseStartDate' | 'licenseDuration', value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      const endDate = calculateLicenseEndDate(next.licenseStartDate, next.licenseDuration);
      next.licenseEndDate = endDate;
      const alerts = calculateRenewalAlerts(endDate);
      next.renewalDate = alerts[0]?.date ?? '';
      setMasterRenewalAlerts(alerts);
      return next;
    });
  }, []);

  const generateLicenseKey = useCallback(() => {
    const key = buildLicenseKey();
    setField('licenseKey', key);
    toast.success('Master license key generated', { description: key });
  }, [setField]);

  const validateSection = useCallback(
    (section: UlbSectionKey): boolean =>
      getUlbConfigurationValidationError(formData, section) === null,
    [formData]
  );

  const getSectionValidationError = useCallback(
    (section: UlbSectionKey): string | null => {
      const code = getUlbConfigurationValidationError(formData, section);
      return code ? `validation.${code}` : null;
    },
    [formData]
  );

  const markSectionComplete = useCallback((section: UlbSectionKey, complete: boolean) => {
    setCompletionStatus((prev) => ({ ...prev, [SECTION_TO_STATUS[section]]: complete }));
  }, []);

  const setDepartmentLicenseComplete = useCallback((complete: boolean) => {
    setCompletionStatus((prev) => ({ ...prev, departmentLicense: complete }));
  }, []);

  const completedCount = useMemo(
    () => Object.values(completionStatus).filter(Boolean).length,
    [completionStatus]
  );

  const urgentAlertCount = useMemo(
    () =>
      masterRenewalAlerts.filter((a) => a.triggered && a.daysRemaining >= -30).length,
    [masterRenewalAlerts]
  );

  return {
    formData,
    setField,
    handleStateChange,
    handleLicenseChange,
    generateLicenseKey,
    masterRenewalAlerts,
    completionStatus,
    markSectionComplete,
    setDepartmentLicenseComplete,
    syncFromUlbMaster,
    validateSection,
    getSectionValidationError,
    completedCount,
    urgentAlertCount,
  };
}

export type UseUlbConfigurationForm = ReturnType<typeof useUlbConfigurationForm>;
