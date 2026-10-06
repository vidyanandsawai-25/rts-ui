
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Building2,
  Home,
  Store,
  Trash2,
  Loader2,
  CheckCircle2,
  Info,
  Pencil,
  Eye,
  FileCheck,
  Paperclip,
  AlertCircle,
} from 'lucide-react';
import { SaveButton, Input, Checkbox, Select, SearchInput, MasterTable, Badge, Button, Label, ValidationMessage, DocumentViewerModal } from '@/components/common';
import type { Column } from '@/components/common';
import { cn } from '@/lib/utils/cn';
import { BuildingSidebar } from './BuildingSidebar';
import { DocumentAttachment } from './DocumentAttachment';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { validateDocumentNumber, validateDocumentDate, parseDateString } from '@/lib/validation/building/validation-rules';
import { useCertificateModalState } from '@/hooks/useCertificateModalState';
import { resolveUnitCertificateStatus, type UnitCertificateStatusType, type UnitStatusResolution, type CertificateItem } from '@/lib/utils/certificate-grid-mapper';
import { getDocumentBlobUrl } from '@/lib/utils/document-client-utils';
import type {
  ApplicationLevel,
  CertificateStatus,
  WingOption,
  UnitSelectionItem,
  CertificateTypeMasterOption,
  CertificateData,
} from '@/types/building-permission.types';

export interface UnitRow extends Record<string, unknown> {
  propertyDetailsId: number;
  propertyId?: number;
  unitNo: string;
  wingName: string;
  certStatus: UnitCertificateStatusType;
  certNumber?: string;
  certDate?: string | null;
  hasDocument?: boolean;
  documentGuid?: string | null;
  fileName?: string | null;
  propertyCertificateId?: number | null;
}

const DEFAULT_UNIT_STATUS: UnitStatusResolution = { status: 'none', certificate: null };

export interface BuildingPermissionSectionProps {
  propertyId: string;
  categoryId?: number | null;
  categoryName?: string;
  societyId?: number | null;
  wingDetailId?: number | null;
  wings?: WingOption[];
  units?: UnitSelectionItem[];
  certificateTypes?: CertificateTypeMasterOption[];
  initialCertificateGrid?: unknown;
  initialLevel?: ApplicationLevel;
  initialCertificateTypeId?: number;
  initialData?: CertificateData | null;
  onSave?: (payload: {
    level: ApplicationLevel;
    selectedWingDetailId: number | null;
    selectedUnitIds: number[];
    selectedUnitDetailsIds?: number[];
    isAllUnitsSelected?: boolean;
    certificateTypeId: number;
    certificateDate: string;
    certificateNumber: string;
    status: CertificateStatus;
    remarks: string;
    attachedFiles: File[];
    documentGuid?: string | null;
    existingDocumentGuid?: string | null;
    fileName?: string | null;
    propertyCertificateId?: number | null;
    hasExistingDocument?: boolean;
    isFileModified?: boolean;
    preserveExistingDocument?: boolean;
  }) => Promise<boolean | { success?: boolean; message?: string } | void> | void;
  onDelete?: (certificateTypeId: number) => void;
  onDeleteRecord?: (params: {
    certificateTypeId: number;
    documentGuid?: string | null;
    documentId?: number | null;
    propertyCertificateId?: number | null;
    level?: ApplicationLevel;
    selectedWingDetailId?: number | null;
    selectedUnitIds?: number[];
    societyDetailId?: number | null;
  }) => Promise<{ success?: boolean; message?: string } | boolean | void> | void;
  isSaving?: boolean;
  propertyConstructionYear?: string | number | null;
}

export function BuildingPermissionSection({
  propertyId,
  categoryId,
  categoryName,
  societyId,
  wingDetailId: propWingDetailId,
  wings = [],
  units = [],
  certificateTypes = [],
  initialCertificateGrid = null,
  initialLevel = 'Apartment',
  initialCertificateTypeId = 3,
  initialData = null,
  propertyConstructionYear,
  onSave,
  onDelete,
  onDeleteRecord,
  isSaving = false,
}: BuildingPermissionSectionProps): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('quickDataEntry');
  const locale = useLocale();
  const { confirm } = useConfirm();

  const urlSocietyDetailId = searchParams.get('societyDetailId') || searchParams.get('societyId');
  const effectiveSocietyDetailId = (societyId && Number(societyId) > 0 ? Number(societyId) : null) ?? (urlSocietyDetailId && Number(urlSocietyDetailId) > 0 ? Number(urlSocietyDetailId) : null);
  const hasSocietyDetailId = Boolean(effectiveSocietyDetailId && effectiveSocietyDetailId > 0);

  const urlWingDetailId = searchParams?.get('wingDetailId') || searchParams?.get('wingId');
  const initialWingDetailId = (propWingDetailId && Number(propWingDetailId) > 0 ? Number(propWingDetailId) : null) ?? (urlWingDetailId ? Number(urlWingDetailId) : null);

  const rawCat = categoryName || searchParams.get('propertyCategory') || searchParams.get('categoryName') || '';
  const partitionNo = searchParams.get('partitionNo') || '';
  const appartmentPartition = searchParams.get('appartmentPartition') || '';
  const hasPartition = Boolean(appartmentPartition || partitionNo);

  const displayCategory = (hasPartition && rawCat.toLowerCase().includes('apartment'))
    ? 'Apartment/Individual'
    : rawCat;

  const effectiveCategoryName = (displayCategory || rawCat).toLowerCase();
  const isApartment = (
    categoryId === 1 ||
    effectiveCategoryName.includes('apartment') ||
    hasSocietyDetailId ||
    Boolean(searchParams?.get('parentPropertyId')) ||
    wings.length > 0 ||
    units.length > 0
  ) && categoryId !== 2;
  const isApartmentIndividual = !isApartment;

  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveFirst, setShowActiveFirst] = useState(false);
  const [enabledStateMap, setEnabledStateMap] = useState<Record<number, boolean>>({});
  const [removedAttachmentTypeIds, setRemovedAttachmentTypeIds] = useState<Set<number>>(new Set());
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isWingWise = searchParams?.get('isWingWise') === 'true';
  const showApartmentTab = !isWingWise;
  const showWingTab = !isWingWise;
  const showLevelSelector = isApartment;

  const urlLevel = searchParams?.get('level') as ApplicationLevel | null;
  const rawInitialLevel =
    urlLevel === 'Apartment' || urlLevel === 'Wing' || urlLevel === 'Unit'
      ? urlLevel
      : isWingWise && initialLevel === 'Apartment'
      ? 'Wing'
      : initialLevel;

  const effectiveInitialLevel: ApplicationLevel =
    rawInitialLevel === 'Apartment' && !showApartmentTab
      ? (showWingTab ? 'Wing' : 'Unit')
      : rawInitialLevel === 'Wing' && !showWingTab
      ? 'Unit'
      : rawInitialLevel;

  const urlCertTypeId = searchParams?.get('certificateTypeId') || searchParams?.get('certTypeId');
  const urlCertTypeCode = searchParams?.get('certificateTypeCode') || searchParams?.get('certType');
  let resolvedCertTypeId = initialCertificateTypeId;
  if (urlCertTypeId && !isNaN(Number(urlCertTypeId))) {
    resolvedCertTypeId = Number(urlCertTypeId);
  } else if (urlCertTypeCode) {
    const matched = certificateTypes.find(
      (ct) => ct.certificateTypeCode.toLowerCase() === urlCertTypeCode.toLowerCase()
    );
    if (matched) resolvedCertTypeId = matched.certificateTypeId;
  }

  const urlCertNumber = searchParams?.get('certificateNumber') || searchParams?.get('permitNo');
  const urlCertDate = searchParams?.get('certificateDate') || searchParams?.get('permitDate') || searchParams?.get('date');
  const urlDocumentGuid = searchParams?.get('documentGuid');
  const urlFileName = searchParams?.get('fileName');
  const urlPropertyCertId = searchParams?.get('propertyCertificateId');
  const urlUnitNo = searchParams?.get('unitNo') || searchParams?.get('partitionNo');

  const {
    level,
    setLevel,
    selectedWingDetailId,
    setSelectedWingDetailId,
    unitSearchQuery,
    setUnitSearchQuery,
    wingFilter,
    setWingFilter,
    selectedUnitIds,
    setSelectedUnitIds,
    selectedTypeId,
    setSelectedTypeId,

    activeCertificateType,
    certificateDate,
    setCertificateDate,
    certificateNumber,
    setCertificateNumber,
    status,
    remarks,
    attachedFiles,
    setAttachedFiles,
    existingDocumentGuid,
    existingFileName,
    existingPropertyCertificateId,
    hasExistingDocument,
    wings: activeWings,
    certificateTypes: activeCertificateTypes,
    filteredUnits,
    isAllUnitsSelected: _isAllUnitsSelected,
    toggleUnitSelection,
    toggleAllUnits: _toggleAllUnits,
    isLoadingMoreUnits,
    loadNextUnitsPage,
    gridItems,
    gridRecords,
    isLoadingGridRecords,
    activeCertificate,
    inheritedFrom,
    refetchGrid,
  } = useCertificateModalState({
    propertyId,
    societyId,
    wings,
    units,
    certificateTypes,
    initialCertificateGrid,
    initialLevel: isApartmentIndividual ? 'Unit' : effectiveInitialLevel,
    initialWingDetailId,
    initialCertificateTypeId: resolvedCertTypeId,
    initialCertificateNumber: urlCertNumber || undefined,
    initialCertificateDate: urlCertDate || undefined,
    initialDocumentGuid: urlDocumentGuid || undefined,
    initialFileName: urlFileName || undefined,
    initialPropertyCertificateId: urlPropertyCertId ? Number(urlPropertyCertId) : undefined,
    initialUnitNo: urlUnitNo || undefined,
    initialData,
  });

  const [statusFilter, setStatusFilter] = useState<'all' | 'direct' | 'wing' | 'apartment' | 'none'>('all');
  const [viewerData, setViewerData] = useState<{ isOpen: boolean; url: string; name: string } | null>(null);

  useEffect(() => {
    if (level === 'Apartment' && !showApartmentTab) {
      setLevel(showWingTab ? 'Wing' : 'Unit');
    } else if (level === 'Wing' && !showWingTab) {
      setLevel('Unit');
    }
  }, [level, showApartmentTab, showWingTab, setLevel]);

  useEffect(() => {
    return () => {
      if (viewerData?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(viewerData.url);
      }
    };
  }, [viewerData]);

  const [fieldErrors, setFieldErrors] = useState<{
    certificateNumber?: string;
    certificateDate?: string;
    document?: string;
    wing?: string;
    unit?: string;
  }>({});
  const [uploadedFileNamesMap, setUploadedFileNamesMap] = useState<Record<number, string>>({});

  const handleSelectCertificate = (typeId: number) => {
    setSelectedTypeId(typeId);
    setFieldErrors({});
    setActionError(null);
  };

  const handleToggleEnabled = (typeId: number, checked: boolean) => {
    if (checked) {
      setEnabledStateMap((prev) => ({ ...prev, [typeId]: checked }));
      handleSelectCertificate(typeId);
      return;
    }

    let hasData = false;
    let docGuid: string | undefined;
    let certId: number | undefined;
    let certNum = '';
    let fileName = '';
    let issueDt = '';

    const isSelected = selectedTypeId === typeId;

    if (level === 'Unit' && selectedUnitIds.size > 0) {
      const firstSelectedId = Array.from(selectedUnitIds)[0];
      const matchedUnit = filteredUnits.find(u => u.propertyDetailsId === firstSelectedId) || units.find(u => u.propertyDetailsId === firstSelectedId);
      if (matchedUnit) {
        const stat = resolveUnitCertificateStatus(gridItems, typeId, matchedUnit, societyId ? Number(societyId) : undefined);
        if (stat.certificate?.propertyCertificateId || stat.certificate?.documentGuid || (isSelected && (attachedFiles.length > 0 || certificateNumber || certificateDate))) {
          hasData = true;
          docGuid = stat.certificate?.documentGuid || undefined;
          certId = stat.certificate?.propertyCertificateId || undefined;
          certNum = isSelected && certificateNumber ? certificateNumber : (stat.certificate?.certificateNumber || '');
          fileName = isSelected && attachedFiles.length > 0 ? attachedFiles[0].name : (stat.certificate?.fileName || '');
          issueDt = isSelected && certificateDate ? certificateDate : (stat.certificate?.certificateDate || '');
        }
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let recs: any[] = [];
      if (level === 'Apartment') {
        recs = gridItems?.societyCertificates || [];
      } else if (level === 'Wing') {
        recs = (gridItems?.wingCertificates || []).filter(r => !selectedWingDetailId || r.wingDetailId === selectedWingDetailId);
      } else {
        recs = gridItems?.unitCertificates || [];
      }
      const gridMatch = recs?.find((r) => r.certificateTypeId === typeId);
      
      const hasInitialData = isSelected && (level === 'Apartment' || isApartmentIndividual) && !!(
        (initialData?.documentGuid && initialData.documentGuid !== 'null' && initialData.documentGuid !== 'undefined') ||
        (initialData?.number && initialData.number.trim() !== '') ||
        (initialData?.date && initialData.date.trim() !== '')
      );
      const hasPendingFormData = isSelected && (attachedFiles.length > 0 || certificateNumber || certificateDate);

      if (gridMatch?.propertyCertificateId || gridMatch?.documentGuid || hasInitialData || hasPendingFormData) {
        hasData = true;
        docGuid = gridMatch?.documentGuid || ((level === 'Apartment' || isApartmentIndividual) && isSelected ? initialData?.documentGuid : undefined) || undefined;
        certId = gridMatch?.propertyCertificateId || ((level === 'Apartment' || isApartmentIndividual) && isSelected ? initialData?.propertyCertificateId : undefined) || undefined;
        certNum = isSelected && certificateNumber ? certificateNumber : (gridMatch?.certificateNumber || ((level === 'Apartment' || isApartmentIndividual) && isSelected ? initialData?.number : '') || '');
        fileName = isSelected && attachedFiles.length > 0 ? attachedFiles[0].name : (gridMatch?.fileName || ((level === 'Apartment' || isApartmentIndividual) && isSelected ? initialData?.fileName : '') || '');
        issueDt = isSelected && certificateDate ? certificateDate : (gridMatch?.certificateDate || ((level === 'Apartment' || isApartmentIndividual) && isSelected ? initialData?.date : '') || '');
      }
    }

    if (!hasData) {
      setEnabledStateMap((prev) => ({ ...prev, [typeId]: false }));
      if (isSelected) {
        setCertificateNumber('');
        setCertificateDate('');
        setAttachedFiles([]);
        setFieldErrors({});
      }
      return;
    }

    const typeObj = certificateTypes.find(c => c.certificateTypeId === typeId);
    const certTypeName = typeObj?.certificateTypeName || 'Certificate';
    if (issueDt && issueDt.includes('T')) {
      issueDt = issueDt.split('T')[0];
    }

    const detailsLines: string[] = [];
    if (level === 'Unit') {
      const unitLabel = selectedUnitNamesSummary || 'Selected Unit';
      detailsLines.push(`Unit: ${unitLabel}`);
    } else if (level === 'Wing') {
      const selectedWing = activeWings.find((w) => w.wingDetailId === selectedWingDetailId);
      detailsLines.push(`Wing: ${selectedWing?.wingName || selectedWingDetailId || ''}`);
    } else if (level === 'Apartment') {
      detailsLines.push(`Scope: Apartment Level`);
    }

    detailsLines.push(`Certificate: ${certTypeName}`);
    if (certNum) {
      detailsLines.push(`Cert No: #${certNum}`);
    }
    if (issueDt) {
      detailsLines.push(`Date: ${issueDt}`);
    }
    if (fileName) {
      detailsLines.push(`Document: ${fileName}`);
    }

    if (!docGuid && !certId) {
      if (selectedTypeId === typeId) {
         setCertificateNumber('');
         setCertificateDate('');
         setAttachedFiles([]);
         setFieldErrors({});
      }
      setEnabledStateMap((prev) => ({ ...prev, [typeId]: false }));
      return;
    }

    const descriptionText = `${t('building.confirmToggleOffWarning') || 'You have an attached certificate with details:'}\n\n${detailsLines.map((l) => `• ${l}`).join('\n')}\n\n${t('building.confirmDeleteCertificateDesc') || 'Are you sure you want to delete this certificate and all its associated data?'}`;

    confirm({
      variant: 'warning',
      size: 'lg',
      title: t('building.confirmDeleteCertificateTitle') || 'Delete Certificate & Data',
      description: descriptionText,
      confirmText: t('building.confirmDeleteCertificateOk') || 'Yes, Delete',
      cancelText: t('building.confirmDeleteCertificateCancel') || 'No, Cancel',
      onConfirm: async () => {


        setIsDeletingRecord(true);
        setActionError(null);

        const resolvedSelectedPropertyIds = Array.from(selectedUnitIds).map((id) => {
          const matched = filteredUnits.find((u) => u.propertyDetailsId === id || u.propertyId === id)
            || units.find((u) => u.propertyDetailsId === id || u.propertyId === id);
          return matched?.propertyId || id;
        });

        try {
          if (onDeleteRecord) {
            const res = await onDeleteRecord({
              certificateTypeId: typeId,
              documentGuid: docGuid,
              propertyCertificateId: certId,
              level,
              selectedWingDetailId,
              selectedUnitIds: resolvedSelectedPropertyIds,
              societyDetailId: societyId ? Number(societyId) : null,
            });
            if (res && typeof res === 'object' && (res as { success?: boolean }).success === false) {
              setActionError((res as { message?: string; error?: string }).error || (res as { message?: string; error?: string }).message || t('building.deleteError') || 'Failed to delete certificate');
              return;
            }
          } else if (onDelete) {
            onDelete(typeId);
          }
          if (selectedTypeId === typeId) {
             setCertificateNumber('');
             setCertificateDate('');
             setAttachedFiles([]);
             setFieldErrors({});
          }
          setEnabledStateMap((prev) => ({ ...prev, [typeId]: false }));
          refetchGrid();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : (t('building.deleteError') || 'Failed to delete certificate');
          setActionError(msg);
        } finally {
          setIsDeletingRecord(false);
        }
      },
    });
  };

  const effectiveConstructionYear = useMemo<number | null>(() => {
    // 1. If at Unit Level and units are selected
    if (level === 'Unit' && selectedUnitIds.size > 0) {
      const selectedYears: number[] = [];
      selectedUnitIds.forEach((id) => {
        const u = units.find((unit) => unit.propertyDetailsId === id || unit.propertyId === id)
          || filteredUnits.find((unit) => unit.propertyDetailsId === id || unit.propertyId === id);
        if (u?.constructionYear) {
          const parsed = parseInt(String(u.constructionYear), 10);
          if (!isNaN(parsed) && parsed > 1800 && parsed < 2200) {
            selectedYears.push(parsed);
          }
        }
      });
      if (selectedYears.length > 0) {
        return Math.max(...selectedYears);
      }
    }

    // 2. If at Wing Level and a wing is selected
    if (level === 'Wing' && selectedWingDetailId) {
      const wingYears: number[] = [];
      units.forEach((u) => {
        if (u.wingDetailId === selectedWingDetailId && u.constructionYear) {
          const parsed = parseInt(String(u.constructionYear), 10);
          if (!isNaN(parsed) && parsed > 1800 && parsed < 2200) {
            wingYears.push(parsed);
          }
        }
      });
      if (wingYears.length > 0) {
        return Math.min(...wingYears);
      }
    }

    // 3. Fallback to propertyConstructionYear
    if (propertyConstructionYear) {
      const parsed = parseInt(String(propertyConstructionYear), 10);
      if (!isNaN(parsed) && parsed > 1800 && parsed < 2200) {
        return parsed;
      }
    }

    // 4. Fallback to earliest construction year among all units
    const allUnitYears = units
      .map((u) => (u.constructionYear ? parseInt(String(u.constructionYear), 10) : null))
      .filter((y): y is number => y !== null && !isNaN(y) && y > 1800 && y < 2200);

    if (allUnitYears.length > 0) {
      return Math.min(...allUnitYears);
    }

    return null;
  }, [level, selectedUnitIds, units, filteredUnits, selectedWingDetailId, propertyConstructionYear]);

  const handleSaveClick = async () => {
    const errors: {
      certificateNumber?: string;
      certificateDate?: string;
      document?: string;
      wing?: string;
      unit?: string;
    } = {};

    // 1. Certificate Number validation
    if (!certificateNumber || certificateNumber.trim() === '') {
      errors.certificateNumber = t('building.errors.cannotEnableWithoutNumber') || 'Document number is required.';
    } else {
      const numError = validateDocumentNumber(certificateNumber, activeCertificateType?.certificateTypeName);
      if (numError) {
        errors.certificateNumber = t(numError.key, numError.params) || 'Invalid document number.';
      }
    }

    // 2. Certificate Date validation
    if (!certificateDate || certificateDate.trim() === '') {
      errors.certificateDate = t('building.errors.cannotEnableWithoutDate') || 'Issue date is required.';
    } else {
      const dateError = validateDocumentDate(certificateDate);
      if (dateError) {
        errors.certificateDate = t(dateError.key) || 'Invalid issue date.';
      } else if (effectiveConstructionYear) {
        const certDate = parseDateString(certificateDate);
        if (certDate && certDate.getFullYear() < effectiveConstructionYear) {
          errors.certificateDate = t('validation.dateBeforeConstructionYear', { year: effectiveConstructionYear })
            || `Date must be greater than or equal to construction year (${effectiveConstructionYear})`;
        }
      }
    }

    // 3. Document attachment validation
    if (attachedFiles.length === 0 && !(level === 'Apartment' && initialData?.documentGuid && !removedAttachmentTypeIds.has(selectedTypeId))) {
      const activeGridMatch = activeCertificate || gridRecords.find((r) => r.certificateTypeId === selectedTypeId);
      if (removedAttachmentTypeIds.has(selectedTypeId) || (!activeGridMatch?.hasDocument && !activeGridMatch?.documentGuid && !existingDocumentGuid)) {
        errors.document = t('common.validation.documentRequired') || 'Certificate document attachment is required.';
      }
    }

    // 4. Scope-specific validation
    if (!isApartmentIndividual && level === 'Wing' && !selectedWingDetailId) {
      errors.wing = t('building.errors.wingRequired') || 'Please select a wing.';
    }
    if (!isApartmentIndividual && level === 'Unit' && selectedUnitIds.size === 0) {
      errors.unit = t('building.errors.unitRequired') || 'Please select at least one unit.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const resolvedSelectedPropertyIds = Array.from(selectedUnitIds).map((id) => {
      const matched = filteredUnits.find((u) => u.propertyDetailsId === id || u.propertyId === id)
        || units.find((u) => u.propertyDetailsId === id || u.propertyId === id);
      return matched?.propertyId || id;
    });

    const resolvedSelectedUnitDetailsIds = Array.from(selectedUnitIds);

    const isFileExplicitlyDeleted = removedAttachmentTypeIds.has(selectedTypeId);
    const isNewFileAttached = attachedFiles.length > 0;
    const isFileModified = isNewFileAttached || isFileExplicitlyDeleted;

    let resolvedDocGuid: string | null = null;
    let resolvedFileName: string | null = null;
    let resolvedCertId: number | null = null;

    if (!isFileExplicitlyDeleted) {
      if (level === 'Unit' && selectedUnitIds.size === 1) {
        const unitId = Array.from(selectedUnitIds)[0];
        const unitStat = unitStatusMap.get(unitId);
        if (unitStat?.status === 'direct' && unitStat.certificate) {
          resolvedDocGuid = existingDocumentGuid || unitStat.certificate.documentGuid || null;
          resolvedFileName = existingFileName || unitStat.certificate.fileName || null;
          resolvedCertId = existingPropertyCertificateId || unitStat.certificate.propertyCertificateId || null;
        } else {
          resolvedDocGuid = existingDocumentGuid || null;
          resolvedFileName = existingFileName || null;
          resolvedCertId = existingPropertyCertificateId || null;
        }
      } else if (level === 'Unit' && selectedUnitIds.size > 1) {
        resolvedDocGuid = existingDocumentGuid || activeCertificate?.documentGuid || activeUnitStat?.documentGuid || null;
        resolvedFileName = existingFileName || activeCertificate?.fileName || activeUnitStat?.fileName || null;
        resolvedCertId = existingPropertyCertificateId || null;
      } else {
        resolvedDocGuid = existingDocumentGuid || activeCertificate?.documentGuid || (level === 'Apartment' ? initialData?.documentGuid : null) || null;
        resolvedFileName = existingFileName || activeCertificate?.fileName || (level === 'Apartment' ? initialData?.fileName : null) || null;
        resolvedCertId = existingPropertyCertificateId || activeCertificate?.propertyCertificateId || (level === 'Apartment' ? initialData?.propertyCertificateId : null) || null;
      }
    }

    if (isNewFileAttached && attachedFiles[0]?.name) {
      resolvedFileName = attachedFiles[0].name;
    }

    const hasDoc = Boolean(resolvedDocGuid || activeCertificate?.hasDocument || hasExistingDocument);

    setFieldErrors({});
    setActionError(null);
    try {
      const result = await onSave?.({
        level,
        selectedWingDetailId,
        selectedUnitIds: resolvedSelectedPropertyIds,
        selectedUnitDetailsIds: resolvedSelectedUnitDetailsIds,
        isAllUnitsSelected: isAllSelectableUnitsSelected,
        certificateTypeId: selectedTypeId,
        certificateDate,
        certificateNumber,
        status,
        remarks,
        attachedFiles: isNewFileAttached ? attachedFiles : [],
        documentGuid: resolvedDocGuid,
        existingDocumentGuid: resolvedDocGuid,
        fileName: resolvedFileName,
        propertyCertificateId: resolvedCertId,
        hasExistingDocument: hasDoc,
        isFileModified,
        preserveExistingDocument: !isFileModified && hasDoc,
      });

      const isSuccess = result !== false && (typeof result !== 'object' || result === null || (result as { success?: boolean }).success !== false);
      if (isSuccess) {
        if (isNewFileAttached && attachedFiles[0]?.name && selectedTypeId) {
          setUploadedFileNamesMap((prev) => ({ ...prev, [selectedTypeId]: attachedFiles[0].name }));
        }
        setAttachedFiles([]);
        await refetchGrid();
      } else if (result && typeof result === 'object' && (result as { success?: boolean }).success === false) {
        setActionError((result as { message?: string; error?: string }).error || (result as { message?: string; error?: string }).message || t('building.saveError') || 'Failed to save changes');
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : (t('building.saveError') || 'Failed to save changes');
      setActionError(msg);
    }
  };

  const handleDeleteClick = () => {
    if (!selectedTypeId) return;

    let docGuid = activeCertificate?.documentGuid || (level === 'Apartment' ? initialData?.documentGuid : undefined);
    let certId = activeCertificate?.propertyCertificateId || (level === 'Apartment' ? initialData?.propertyCertificateId : undefined);
    let certNum = certificateNumber || activeCertificate?.certificateNumber || (level === 'Apartment' ? initialData?.number : '') || '';
    let fileName = attachedFiles[0]?.name || activeCertificate?.fileName || (level === 'Apartment' ? initialData?.fileName : undefined) || '';
    let issueDt = certificateDate || activeCertificate?.certificateDate || (level === 'Apartment' ? initialData?.date : '') || '';

    if (level === 'Unit' && selectedUnitIds.size > 0) {
      const firstSelectedId = Array.from(selectedUnitIds)[0];
      const unitStat = unitStatusMap.get(firstSelectedId);
      if (unitStat?.certificate) {
        if (!docGuid) docGuid = unitStat.certificate.documentGuid || undefined;
        if (!certId) certId = unitStat.certificate.propertyCertificateId || undefined;
        if (!certNum) certNum = unitStat.certificate.certificateNumber || '';
        if (!fileName) fileName = unitStat.certificate.fileName || '';
        if (!issueDt) issueDt = unitStat.certificate.certificateDate || '';
      }
    }

    if (!docGuid && !certId) {
      const gridMatch = levelFilteredRecords.find((r) => r.certificateTypeId === selectedTypeId);
      if (!docGuid) docGuid = gridMatch?.documentGuid || undefined;
      if (!certId) certId = gridMatch?.propertyCertificateId || undefined;
      if (!certNum) certNum = gridMatch?.certificateNumber || '';
      if (!fileName) fileName = gridMatch?.fileName || '';
      if (!issueDt) issueDt = gridMatch?.certificateDate || '';
    }

    const certTypeName = activeCertificateType?.certificateTypeName || 'Certificate';
    if (issueDt && issueDt.includes('T')) {
      issueDt = issueDt.split('T')[0];
    }

    const detailsLines: string[] = [];
    if (level === 'Unit') {
      const unitLabel = selectedUnitNamesSummary || 'Selected Unit';
      detailsLines.push(`Unit: ${unitLabel}`);
    } else if (level === 'Wing') {
      const selectedWing = activeWings.find((w) => w.wingDetailId === selectedWingDetailId);
      detailsLines.push(`Wing: ${selectedWing?.wingName || selectedWingDetailId || ''}`);
    } else if (level === 'Apartment') {
      detailsLines.push(`Scope: Apartment Level`);
    }

    detailsLines.push(`Certificate: ${certTypeName}`);
    if (certNum) {
      detailsLines.push(`Cert No: #${certNum}`);
    }
    if (issueDt) {
      detailsLines.push(`Date: ${issueDt}`);
    }
    if (fileName) {
      detailsLines.push(`Document: ${fileName}`);
    }

    const descriptionText = detailsLines.length > 0
      ? `Are you sure you want to delete this certificate and attached data?\n\n${detailsLines.map((l) => `• ${l}`).join('\n')}`
      : (t('building.confirmDeleteCert') || 'Are you sure you want to delete this certificate?');

    confirm({
      variant: 'warning',
      size: 'lg',
      title: t('building.confirmDeleteCertificateTitle') || 'Delete Certificate & Data',
      description: descriptionText,
      confirmText: t('building.confirmDeleteCertificateOk') || 'Yes, Delete',
      cancelText: t('building.confirmDeleteCertificateCancel') || 'No, Cancel',
      onConfirm: async () => {
        setIsDeletingRecord(true);
        setActionError(null);

        const resolvedSelectedPropertyIds = Array.from(selectedUnitIds).map((id) => {
          const matched = filteredUnits.find((u) => u.propertyDetailsId === id || u.propertyId === id)
            || units.find((u) => u.propertyDetailsId === id || u.propertyId === id);
          return matched?.propertyId || id;
        });

        try {
          if (onDeleteRecord) {
            const res = await onDeleteRecord({
              certificateTypeId: selectedTypeId,
              documentGuid: docGuid,
              propertyCertificateId: certId,
              level,
              selectedWingDetailId,
              selectedUnitIds: resolvedSelectedPropertyIds,
              societyDetailId: societyId ? Number(societyId) : null,
            });
            if (res && typeof res === 'object' && (res as { success?: boolean }).success === false) {
              setActionError((res as { message?: string; error?: string }).error || (res as { message?: string; error?: string }).message || t('building.deleteError') || 'Failed to delete certificate');
              return;
            }
          } else if (onDelete) {
            onDelete(selectedTypeId);
          }
          setCertificateNumber('');
          setCertificateDate('');
          setAttachedFiles([]);
          setEnabledStateMap((prev) => ({ ...prev, [selectedTypeId]: false }));
          setFieldErrors({});
          await refetchGrid();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : (t('building.deleteError') || 'Failed to delete certificate');
          setActionError(msg);
        } finally {
          setIsDeletingRecord(false);
        }
      },
    });
  };

  const sidebarValidationErrors = useMemo<Record<number, string>>(() => {
    if (Object.keys(fieldErrors).length === 0) return {};
    const firstErr = fieldErrors.certificateNumber || fieldErrors.certificateDate || fieldErrors.document || fieldErrors.wing || fieldErrors.unit || 'Incomplete';
    return { [selectedTypeId]: firstErr };
  }, [fieldErrors, selectedTypeId]);

  // Filter grid records by the current level so toggles only reflect certificates at the active scope
  const levelFilteredRecords = (() => {
    if (!gridItems) return [];
    if (level === 'Apartment') return gridItems.societyCertificates || [];
    if (level === 'Wing') {
      return (gridItems.wingCertificates || []).filter(
        (r) => !selectedWingDetailId || r.wingDetailId === selectedWingDetailId
      );
    }
    if (level === 'Unit') {
      if (selectedUnitIds.size === 0) return [];
      const selectedIdList = Array.from(selectedUnitIds);
      return (gridItems.unitCertificates || []).filter((r) => {
        const propId = r.propertyId;
        const propDetailsId = r.propertyDetailsId;
        const covered = r.coveredPropertyIds || [];
        return (
          (propId != null && selectedIdList.includes(propId)) ||
          (propDetailsId != null && selectedIdList.includes(propDetailsId)) ||
          covered.some((id) => selectedIdList.includes(id))
        );
      });
    }
    return [];
  })();

  const unitStatusMap = (() => {
    const map = new Map<number, ReturnType<typeof resolveUnitCertificateStatus>>();
    const allUnits = units && units.length > 0 ? units : filteredUnits;
    allUnits.forEach((u) => {
      const stat = resolveUnitCertificateStatus(gridItems, selectedTypeId, u, societyId ? Number(societyId) : undefined);
      map.set(u.propertyDetailsId, stat);
      if (u.propertyId != null) {
        map.set(u.propertyId, stat);
      }
    });
    return map;
  })();

  const certificatesList: CertificateData[] = activeCertificateTypes.map((ct) => {
    const isSelected = selectedTypeId === ct.certificateTypeId;
    let gridRecord: CertificateItem | undefined;
    if (level === 'Apartment') {
      gridRecord = (gridItems?.societyCertificates || []).find((r) => r.certificateTypeId === ct.certificateTypeId);
    } else if (level === 'Wing') {
      gridRecord = (gridItems?.wingCertificates || []).find(
        (r) => (!selectedWingDetailId || r.wingDetailId === selectedWingDetailId) && r.certificateTypeId === ct.certificateTypeId
      );
    } else if (level === 'Unit') {
      if (selectedUnitIds.size === 1) {
        const selectedUnitId = Array.from(selectedUnitIds)[0];
        const unitStat = unitStatusMap.get(selectedUnitId);
        if (unitStat?.status === 'direct' && unitStat.certificate && unitStat.certificate.certificateTypeId === ct.certificateTypeId) {
          gridRecord = unitStat.certificate;
        } else if (unitStat?.status === 'wing') {
          gridRecord = (gridItems?.wingCertificates || []).find(
            (r) => (!selectedWingDetailId || r.wingDetailId === selectedWingDetailId) && r.certificateTypeId === ct.certificateTypeId
          ) || (unitStat.certificate?.certificateTypeId === ct.certificateTypeId ? unitStat.certificate : undefined);
        } else if (unitStat?.status === 'apartment') {
          gridRecord = (gridItems?.societyCertificates || []).find(
            (r) => r.certificateTypeId === ct.certificateTypeId
          ) || (unitStat.certificate?.certificateTypeId === ct.certificateTypeId ? unitStat.certificate : undefined);
        }
      } else {
        const wingRecord = (gridItems?.wingCertificates || []).find(
          (r) => (!selectedWingDetailId || r.wingDetailId === selectedWingDetailId) && r.certificateTypeId === ct.certificateTypeId
        );
        const aptRecord = (gridItems?.societyCertificates || []).find(
          (r) => r.certificateTypeId === ct.certificateTypeId
        );
        gridRecord = wingRecord || aptRecord;
      }
    }
    const isAttachmentRemoved = isSelected && removedAttachmentTypeIds.has(ct.certificateTypeId);

    // Check if this certificate actually has saved data or document at the CURRENT level
    const hasRecordData = !!(
      gridRecord &&
      (gridRecord.hasDocument ||
        (gridRecord.documentGuid && gridRecord.documentGuid !== 'null' && gridRecord.documentGuid !== 'undefined') ||
        (gridRecord.certificateNumber && gridRecord.certificateNumber.trim() !== '') ||
        (gridRecord.certificateDate && gridRecord.certificateDate.trim() !== ''))
    );
    const hasInitialData =
      isSelected &&
      level === 'Apartment' &&
      (initialData?.certificateTypeId == null || initialData.certificateTypeId === ct.certificateTypeId) &&
      !!(
        (initialData?.documentGuid && initialData.documentGuid !== 'null' && initialData.documentGuid !== 'undefined') ||
        (initialData?.number && initialData.number.trim() !== '') ||
        (initialData?.date && initialData.date.trim() !== '')
      );
    const hasPendingDoc = isSelected && attachedFiles.length > 0;

    const initialEnabled = hasRecordData || hasInitialData || hasPendingDoc;
    const isEnabled = enabledStateMap[ct.certificateTypeId] ?? initialEnabled;

    const certNo = isSelected
      ? (certificateNumber || gridRecord?.certificateNumber || (level === 'Apartment' && (initialData?.certificateTypeId == null || initialData.certificateTypeId === ct.certificateTypeId) ? initialData?.number : '') || '')
      : (gridRecord?.certificateNumber || '');

    let rawDate = isSelected
      ? (certificateDate || gridRecord?.certificateDate || (level === 'Apartment' && (initialData?.certificateTypeId == null || initialData.certificateTypeId === ct.certificateTypeId) ? initialData?.date : '') || '')
      : (gridRecord?.certificateDate || '');
    if (rawDate.includes('T')) {
      rawDate = rawDate.split('T')[0];
    }

    const hasDoc =
      (isSelected && attachedFiles.length > 0) ||
      (!isAttachmentRemoved &&
        (gridRecord?.hasDocument ||
          (gridRecord?.documentGuid && gridRecord.documentGuid !== 'null' && gridRecord.documentGuid !== 'undefined') ||
          (isSelected && (existingDocumentGuid || (level === 'Apartment' && (initialData?.certificateTypeId == null || initialData.certificateTypeId === ct.certificateTypeId) && initialData?.documentGuid)))));

    const docGuid = hasDoc
      ? (isSelected && existingDocumentGuid
          ? existingDocumentGuid
          : (level === 'Apartment' && (initialData?.certificateTypeId == null || initialData.certificateTypeId === ct.certificateTypeId) ? initialData?.documentGuid : undefined) || gridRecord?.documentGuid || 'temp-guid')
      : undefined;

    let customStatusBadge: CertificateData['customStatusBadge'];
    let sourceLevel: CertificateData['sourceLevel'];

    if (level === 'Apartment') {
      if (hasRecordData || hasInitialData) {
        customStatusBadge = { label: t('building.apartmentLevel') || 'Apartment Level', variant: 'purple' };
        sourceLevel = 'Direct';
      } else {
        customStatusBadge = { label: t('building.notConfigured') || 'Not Configured', variant: 'secondary' };
        sourceLevel = 'None';
      }
    } else if (level === 'Wing') {
      const aptRecord = (gridItems?.societyCertificates || []).find((r) => r.certificateTypeId === ct.certificateTypeId);
      const hasAptCovered = Boolean(
        aptRecord && (aptRecord.hasDocument || aptRecord.documentGuid || aptRecord.certificateNumber || aptRecord.certificateDate)
      );
      if (hasRecordData) {
        customStatusBadge = { label: t('building.wingLevel') || 'Wing Level', variant: 'success' };
        sourceLevel = 'Direct';
      } else if (hasAptCovered) {
        customStatusBadge = { label: t('building.coveredByApartment') || 'Apartment Covered', variant: 'purple' };
        sourceLevel = 'Apartment';
      } else {
        customStatusBadge = { label: t('building.notConfigured') || 'Not Configured', variant: 'secondary' };
        sourceLevel = 'None';
      }
    } else if (level === 'Unit') {
      if (selectedUnitIds.size === 1) {
        const uStat = unitStatusMap.get(Array.from(selectedUnitIds)[0]);
        if (uStat?.status === 'direct') {
          customStatusBadge = { label: t('building.appliedDirectly') || 'Applied Separately', variant: 'success' };
          sourceLevel = 'Direct';
        } else if (uStat?.status === 'wing') {
          customStatusBadge = { label: t('building.coveredByWing') || 'Wing Covered', variant: 'info' };
          sourceLevel = 'Wing';
        } else if (uStat?.status === 'apartment') {
          customStatusBadge = { label: t('building.coveredByApartment') || 'Apartment Covered', variant: 'purple' };
          sourceLevel = 'Apartment';
        } else {
          customStatusBadge = { label: t('building.notConfigured') || 'Not Configured', variant: 'secondary' };
          sourceLevel = 'None';
        }
      } else if (selectedUnitIds.size > 1) {
        customStatusBadge = { label: t('building.unitsSelectedCount', { count: selectedUnitIds.size }) || `${selectedUnitIds.size} Units Selected`, variant: 'info' };
        sourceLevel = 'Partial';
      } else {
        const aptRecord = (gridItems?.societyCertificates || []).find((r) => r.certificateTypeId === ct.certificateTypeId);
        const wingRecord = (gridItems?.wingCertificates || []).find(
          (r) => (!selectedWingDetailId || r.wingDetailId === selectedWingDetailId) && r.certificateTypeId === ct.certificateTypeId
        );
        if (wingRecord && (wingRecord.hasDocument || wingRecord.documentGuid || wingRecord.certificateNumber)) {
          customStatusBadge = { label: t('building.coveredByWing') || 'Wing Covered', variant: 'info' };
          sourceLevel = 'Wing';
        } else if (aptRecord && (aptRecord.hasDocument || aptRecord.documentGuid || aptRecord.certificateNumber)) {
          customStatusBadge = { label: t('building.coveredByApartment') || 'Apartment Covered', variant: 'purple' };
          sourceLevel = 'Apartment';
        } else {
          customStatusBadge = { label: t('building.notConfigured') || 'Not Configured', variant: 'secondary' };
          sourceLevel = 'None';
        }
      }
    }

    return {
      certificateTypeId: ct.certificateTypeId,
      certificateTypeName: ct.certificateTypeName || gridRecord?.certificateTypeName,
      enabled: isEnabled,
      number: certNo,
      date: rawDate,
      documentGuid: docGuid,
      customStatusBadge,
      sourceLevel,
    };
  });


  const activeUnitStat = (() => {
    if (selectedUnitIds.size === 1) {
      return unitStatusMap.get(Array.from(selectedUnitIds)[0]);
    }
    if (selectedUnitIds.size > 1) {
      const stats = Array.from(selectedUnitIds).map((id) => unitStatusMap.get(id)).filter(Boolean);
      const wingStat = stats.find((s) => s?.status === 'wing');
      if (wingStat) return wingStat;
      const aptStat = stats.find((s) => s?.status === 'apartment');
      if (aptStat) return aptStat;
      return stats[0];
    }
    return undefined;
  })();

  // Whether there's an existing saved certificate record for the selected type at the current level
  const hasExistingRecord = (() => {
    if (level === 'Apartment') {
      if (activeCertificate && (activeCertificate.certificateTypeId === selectedTypeId || !activeCertificate.certificateTypeId)) {
        if (activeCertificate.propertyCertificateId && activeCertificate.propertyCertificateId > 0) return true;
        if (activeCertificate.hasDocument || (activeCertificate.documentGuid && activeCertificate.documentGuid !== 'null')) return true;
        if (activeCertificate.certificateNumber && activeCertificate.certificateNumber.trim() !== '') return true;
      }
      const gridMatch = (gridItems?.societyCertificates || []).find((r) => r.certificateTypeId === selectedTypeId);
      if (gridMatch && (gridMatch.propertyCertificateId || gridMatch.hasDocument || gridMatch.certificateNumber)) return true;
      if (initialData?.certificateTypeId == null || initialData.certificateTypeId === selectedTypeId) {
        if (initialData?.documentGuid || (initialData?.number && initialData.number.trim() !== '')) return true;
      }
      return false;
    }

    if (level === 'Wing') {
      const wingMatch = (gridItems?.wingCertificates || []).find(
        (r) => (!selectedWingDetailId || r.wingDetailId === selectedWingDetailId) && r.certificateTypeId === selectedTypeId
      );
      if (wingMatch && (wingMatch.propertyCertificateId || wingMatch.hasDocument || wingMatch.certificateNumber)) return true;
      return false;
    }

    if (level === 'Unit') {
      if (selectedUnitIds.size > 0) {
        return Array.from(selectedUnitIds).some((id) => {
          const stat = unitStatusMap.get(id);
          return stat?.status === 'direct' && Boolean(stat.certificate || stat.hasDocument || stat.certificateNumber);
        });
      }
      return false;
    }

    return false;
  })();

  // Whether the form has unsaved changes (dirty state)
  const isDirty = (() => {
    // New file attached
    if (attachedFiles.length > 0) return true;
    // Attachment was removed
    const hadSavedDocument = Boolean(
      activeCertificate?.hasDocument ||
        (activeCertificate?.documentGuid && activeCertificate.documentGuid !== 'null') ||
        (level === 'Apartment' && initialData?.documentGuid)
    );
    if (removedAttachmentTypeIds.has(selectedTypeId) && hadSavedDocument) return true;
    // Compare current form values against active certificate values
    const savedNumber = activeCertificate?.certificateNumber || '';
    const savedDate = activeCertificate?.certificateDate
      ? (activeCertificate.certificateDate.includes('T') ? activeCertificate.certificateDate.split('T')[0] : activeCertificate.certificateDate)
      : '';
    if (certificateNumber !== savedNumber) return true;
    if (certificateDate !== savedDate) return true;
    // Toggle was explicitly changed from its saved state
    const savedEnabled = hasExistingRecord;
    const currentEnabled = enabledStateMap[selectedTypeId] ?? savedEnabled;
    if (currentEnabled !== savedEnabled) return true;
    return false;
  })();

  const isCertificateFilled = useMemo(() => {
    const hasFileActual = attachedFiles.length > 0 || 
      (!removedAttachmentTypeIds.has(selectedTypeId) && 
        Boolean(
          activeCertificate?.hasDocument || 
          (activeCertificate?.documentGuid && activeCertificate.documentGuid !== 'null') || 
          existingDocumentGuid
        )
      );
    const hasNumber = Boolean(certificateNumber?.trim());
    const hasDate = Boolean(certificateDate?.trim());
    return hasFileActual && hasNumber && hasDate;
  }, [attachedFiles, removedAttachmentTypeIds, selectedTypeId, activeCertificate, existingDocumentGuid, certificateNumber, certificateDate]);

  const appliedUnitsCount = (() => {
    let count = 0;
    unitStatusMap.forEach((stat) => {
      if (stat.status === 'direct') count++;
    });
    return count;
  })();

  const selectedUnitNamesSummary = (() => {
    if (selectedUnitIds.size === 0) return '';
    const names = filteredUnits
      .filter((u) => selectedUnitIds.has(u.propertyDetailsId) || (u.propertyId != null && selectedUnitIds.has(u.propertyId)))
      .map((u) => u.unitNo)
      .filter(Boolean);
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length <= 3) return names.join(', ');
    return `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
  })();

  const handleClearSelection = () => {
    setSelectedUnitIds(new Set());
  };

  const selectableUnits = filteredUnits.filter((u) => {
    const stat = unitStatusMap.get(u.propertyDetailsId);
    return stat?.status !== 'direct' && !stat?.certificate?.propertyCertificateId;
  });

  const isAllSelectableUnitsSelected =
    selectableUnits.length > 0 && selectableUnits.every((u) => selectedUnitIds.has(u.propertyDetailsId) || (u.propertyId != null && selectedUnitIds.has(u.propertyId)));

  const handleToggleAllUnits = (forceSelect?: boolean) => {
    const shouldSelect = typeof forceSelect === 'boolean' ? forceSelect : !isAllSelectableUnitsSelected;
    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      if (!shouldSelect) {
        filteredUnits.forEach((u) => {
          next.delete(u.propertyDetailsId);
          if (u.propertyId != null) next.delete(u.propertyId);
        });
      } else {
        selectableUnits.forEach((u) => next.add(u.propertyDetailsId));
      }
      return next;
    });
  };

  const handleToggleUnitSelection = (propertyDetailsId: number) => {
    const stat = unitStatusMap.get(propertyDetailsId);
    if (stat?.status === 'direct' || Boolean(stat?.certificate?.propertyCertificateId)) {
      return;
    }
    toggleUnitSelection(propertyDetailsId);
  };

  const unitTableColumns: Column<UnitRow>[] = [
      {
        key: 'propertyDetailsId',
        label: (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isAllSelectableUnitsSelected}
              onCheckedChange={handleToggleAllUnits}
              disabled={selectableUnits.length === 0}
              className={cn(selectableUnits.length === 0 && "opacity-50 cursor-not-allowed")}
            />
          </div>
        ),
        width: '40px',
        align: 'center',
        render: (_, row) => {
          const isDirectApplied = row.certStatus === 'direct' || Boolean(row.propertyCertificateId);
          const isSelected = selectedUnitIds.has(row.propertyDetailsId as number) || (row.propertyId != null && selectedUnitIds.has(row.propertyId as number));
          return (
            <label
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "inline-flex items-center justify-center p-1 rounded",
                isDirectApplied ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              )}
              title={
                isDirectApplied
                  ? (t('building.unitAlreadyHasCertTooltip') || 'This unit already has an applied certificate. Use the Edit action to modify.')
                  : undefined
              }
            >
              <Checkbox
                disabled={isDirectApplied}
                checked={isDirectApplied || isSelected}
                className={cn(isDirectApplied && "opacity-50 cursor-not-allowed")}
                onCheckedChange={() => {
                  if (isDirectApplied) return;
                  handleToggleUnitSelection(row.propertyDetailsId as number);
                  if (fieldErrors.unit) setFieldErrors((prev) => ({ ...prev, unit: undefined }));
                }}
              />
            </label>
          );
        },
      },
      {
        key: 'unitNo',
        label: t('building.unit') || 'UNIT',
        render: (val, row) => {
          const isDirectApplied = row.certStatus === 'direct' || Boolean(row.propertyCertificateId);
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-blue-900">{String(val || '')}</span>
              {isDirectApplied && (
                <span
                  className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 text-[10px] font-semibold flex-shrink-0"
                  title={
                    row.fileName
                      ? `${t('building.uploadedDoc') || 'Document'}: ${row.fileName}`
                      : (t('building.directCertTooltip') || 'Certificate document uploaded for this unit')
                  }
                >
                  <Paperclip className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{t('building.uploaded') || 'Uploaded'}</span>
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'wingName',
        label: t('building.wing') || 'WING',
        render: (val) => <span className="font-semibold text-slate-700">{String(val || '')}</span>,
      },
      {
        key: 'certStatus',
        label: t('building.certificateStatus') || 'CERTIFICATE STATUS',
        render: (_, row) => {
          if (row.certStatus === 'direct') {
            return (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/90 text-emerald-800 border border-emerald-300 shadow-2xs whitespace-nowrap"
                title={row.certNumber ? `Direct Certificate: #${row.certNumber}` : 'Applied'}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <FileCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-mono text-[11px] truncate max-w-[150px]">
                  {row.certNumber ? `#${row.certNumber}` : (t('building.statusApplied') || 'Applied')}
                </span>
              </span>
            );
          }
          if (row.certStatus === 'wing') {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200 whitespace-nowrap">
                <Home className="w-3 h-3 text-sky-600 shrink-0" />
                <span>{t('building.statusWingCovered') || 'Wing Covered'}</span>
              </span>
            );
          }
          if (row.certStatus === 'apartment') {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200 whitespace-nowrap">
                <Building2 className="w-3 h-3 text-purple-600 shrink-0" />
                <span>{t('building.statusApartmentCovered') || 'Apartment Covered'}</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal bg-slate-50 text-slate-500 border border-slate-200 whitespace-nowrap">
              {t('building.statusNotApplied') || 'Not Applied'}
            </span>
          );
        },
      },
      {
        key: 'actions',
        label: t('common.actions') || 'ACTION',
        align: 'center',
        width: '100px',
        render: (_, row) => {
          const hasDoc = Boolean(row.hasDocument || row.documentGuid);
          return (
            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 bg-blue-50/90 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 shadow-2xs cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
                title={t('common.edit') || 'Edit Unit Certificate'}
                aria-label={t('common.edit') || 'Edit Unit Certificate'}
                onClick={() => {
                  setSelectedUnitIds(new Set([row.propertyDetailsId as number]));
                  if (fieldErrors.unit) setFieldErrors((prev) => ({ ...prev, unit: undefined }));
                }}
              >
                <Pencil className="w-4 h-4 text-blue-600" />
              </button>
              <button
                type="button"
                disabled={!hasDoc}
                className={cn(
                  'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150',
                  hasDoc
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-300 shadow-2xs cursor-pointer hover:scale-105 active:scale-95'
                    : 'text-slate-300 bg-slate-50 border border-slate-200 cursor-not-allowed opacity-50'
                )}
                title={hasDoc ? (t('common.view') || 'View Document') : (t('building.noDocumentAttached') || 'No document attached')}
                aria-label={hasDoc ? (t('common.view') || 'View Document') : (t('building.noDocumentAttached') || 'No document attached')}
                onClick={async () => {
                  if (!row.documentGuid) return;
                  try {
                    const { url } = await getDocumentBlobUrl(row.documentGuid, locale);
                    setViewerData({ isOpen: true, url, name: row.fileName || `Unit ${row.unitNo} Document` });
                  } catch {
                    toast.error(t('building.viewError') || 'Failed to view document');
                  }
                }}
              >
                <Eye className={cn('w-4 h-4', hasDoc ? 'text-emerald-600' : 'text-slate-300')} />
              </button>
            </div>
          );
        },
      },
    ];

  const unitTableData: UnitRow[] = filteredUnits
    .map((u) => {
      const stat = unitStatusMap.get(u.propertyDetailsId) || DEFAULT_UNIT_STATUS;
      return {
        propertyDetailsId: u.propertyDetailsId,
        propertyId: u.propertyId,
        unitNo: u.unitNo,
        wingName: u.wingName,
        certStatus: stat.status,
        certNumber: stat.certificateNumber,
        certDate: stat.certificateDate,
        hasDocument: stat.hasDocument,
        documentGuid: stat.documentGuid,
        fileName: stat.fileName,
        propertyCertificateId: stat.certificate?.propertyCertificateId,
      };
    })
    .filter((row) => {
      if (statusFilter === 'direct') return row.certStatus === 'direct';
      if (statusFilter === 'wing') return row.certStatus === 'wing';
      if (statusFilter === 'apartment') return row.certStatus === 'apartment';
      if (statusFilter === 'none') return row.certStatus === 'none';
      return true;
    });

  return (
    <div className="relative flex-1 flex flex-col min-h-0 h-full overflow-hidden p-2 sm:p-2.5 gap-2">
      {isSaving && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-xl shadow-lg">
          <div className="flex items-center gap-3 px-5 py-3 bg-slate-900/90 text-white rounded-xl shadow-2xl text-sm font-semibold animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span>{t('building.saving') || 'Saving building permissions & documents...'}</span>
          </div>
        </div>
      )}
      {/* Title & Level Selector Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2 flex-shrink-0">
        <h2 className="text-base font-bold text-blue-900">
          {t('building.title') || 'Building Permissions & Documents'}
        </h2>

        {/* Level Tabs using common Button component */}
        {showLevelSelector && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {showApartmentTab && (
              <Button
                size="xs"
                variant={level === 'Apartment' ? 'primary' : 'ghost'}
                icon={Building2}
                onClick={() => {
                  setLevel('Apartment');
                  setEnabledStateMap({});
                  setRemovedAttachmentTypeIds(new Set());
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('level', 'Apartment');
                  router.replace(`${pathname}?${params.toString()}`);
                }}
                className={cn(
                  'font-bold cursor-pointer rounded-lg transition-all',
                  level === 'Apartment'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                )}
              >
                {t('building.apartmentLevel') || 'Apartment Level'}
              </Button>
            )}

            {showWingTab && (
              <Button
                size="xs"
                variant={level === 'Wing' ? 'primary' : 'ghost'}
                icon={Home}
                onClick={() => {
                  setLevel('Wing');
                  setEnabledStateMap({});
                  setRemovedAttachmentTypeIds(new Set());
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('level', 'Wing');
                  window.history.replaceState(null, '', `?${params.toString()}`);
                }}
                className={cn(
                  'font-bold cursor-pointer rounded-lg transition-all',
                  level === 'Wing'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                )}
              >
                {t('building.wingLevel') || 'Wing Level'}
              </Button>
            )}

            <Button
              size="xs"
              variant={level === 'Unit' ? 'primary' : 'ghost'}
              icon={Store}
              onClick={() => {
                setLevel('Unit');
                setEnabledStateMap({});
                setRemovedAttachmentTypeIds(new Set());
                // Always re-fetch units for the selected wing when switching to Unit level
                if (selectedWingDetailId) {
                  setWingFilter(String(selectedWingDetailId));
                }
                const params = new URLSearchParams(searchParams.toString());
                params.set('level', 'Unit');
                window.history.replaceState(null, '', `?${params.toString()}`);
              }}
              className={cn(
                'font-bold cursor-pointer rounded-lg transition-all',
                level === 'Unit'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
              )}
            >
              {t('building.unitLevel') || 'Unit Level'}
            </Button>
          </div>
        )}
      </div>

      {/* Scope Guidance Helper Banner */}
      {!isApartmentIndividual && level !== 'Unit' && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-50/80 border-slate-200/80 shadow-2xs flex-shrink-0">
          {level === 'Apartment' && (
            <>
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-700">
                <strong className="text-blue-900">{t('building.apartmentLevel') || 'Apartment Scope'}:</strong> {t('building.apartmentScopeHint') || 'Certificates and files configured here apply property-wide across all wings and units.'}
              </span>
            </>
          )}
          {level === 'Wing' && (
            <>
              <Home className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="text-slate-700">
                <strong className="text-sky-900">{t('building.wingLevel') || 'Wing Scope'}:</strong> {t('building.wingScopeHint') || 'Certificates and files configured here apply to all units in the selected wing.'}
              </span>
            </>
          )}
        </div>
      )}

      {/* Main Split Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Left Sidebar using existing BuildingSidebar component */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col h-full min-h-0">
          <BuildingSidebar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showActiveFirst={showActiveFirst}
            onShowActiveChange={setShowActiveFirst}
            certificates={certificatesList}
            selectedTypeId={selectedTypeId}
            onSelect={handleSelectCertificate}
            onToggleEnabled={handleToggleEnabled}
            validationErrors={sidebarValidationErrors}
            t={(key) => t(key)}
          />
        </div>

        {/* Right Detail Pane */}
        <div className="relative lg:col-span-8 xl:col-span-9 flex flex-col h-full min-h-0 bg-white border border-slate-200 rounded-xl p-3 overflow-y-auto space-y-2.5 shadow-xs">
          {isLoadingGridRecords && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 text-white rounded-lg shadow-md text-xs font-medium animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{t('building.fetchingWingData') || t('actions.loading') || 'Fetching wing data...'}</span>
              </div>
            </div>
          )}

          {!isApartmentIndividual && level === 'Wing' && (
            <div className={cn("space-y-1.5 p-2.5 rounded-lg border transition-all", fieldErrors.wing ? "bg-red-50/20 border-red-300" : "bg-slate-50/60 border-slate-200")}>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {t('building.selectWing') || 'SELECT WING'}
              </Label>
              <div className="flex flex-wrap gap-2">
                {activeWings.length > 0 ? (
                  activeWings.map((wing) => {
                    const isSelected = selectedWingDetailId === wing.wingDetailId;
                    return (
                      <Button
                        key={wing.wingDetailId}
                        size="xs"
                        variant={isSelected ? 'success' : 'secondary'}
                        onClick={() => {
                          setSelectedWingDetailId(wing.wingDetailId);
                          if (fieldErrors.wing) setFieldErrors(prev => ({ ...prev, wing: undefined }));
                          setWingFilter(String(wing.wingDetailId));

                          const params = new URLSearchParams(window.location.search);
                          params.set("wingDetailId", String(wing.wingDetailId));
                          window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
                        }}
                        className={cn(
                          'px-4 font-semibold rounded-lg transition-all cursor-pointer border flex items-center gap-1.5',
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        )}
                      >
                        {isLoadingGridRecords && isSelected && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        )}
                        {wing.wingName}
                      </Button>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    {t('building.noWingsFound') || 'No wings found'}
                  </div>
                )}
              </div>
              <ValidationMessage message={fieldErrors.wing} />
            </div>
          )}

          {!isApartmentIndividual && level === 'Unit' && Boolean(selectedWingDetailId && Number(selectedWingDetailId) > 0) && Boolean(filteredUnits && filteredUnits.length > 0) && (
            <div className={cn("space-y-2 p-2.5 rounded-xl border transition-all", fieldErrors.unit ? "bg-red-50/20 border-red-300" : "bg-slate-50/70 border-slate-200")}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t('building.selectUnits') || 'SELECT UNITS'}
                  </Label>
                  <span className="text-[11px] text-slate-500">
                    {t('building.unitsInWing', { count: filteredUnits.length })}
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium italic">
                    {t('building.clickRowToSelect')}
                  </span>
                </div>

                {/* Quick actions toolbar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {appliedUnitsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setStatusFilter(statusFilter === 'direct' ? 'all' : 'direct')}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer border transition-all",
                        statusFilter === 'direct'
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                      )}
                      title={t('building.filterAppliedTooltip')}
                    >
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{t('building.appliedSeparately', { count: appliedUnitsCount })}</span>
                    </button>
                  )}

                  {selectedUnitIds.size > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer border border-slate-300 transition-all"
                    >
                      {t('building.clearSelectedCount', { count: selectedUnitIds.size })}
                    </button>
                  )}

                  <Badge variant="secondary" size="sm" className="bg-white text-slate-700 font-bold border border-slate-200">
                    {t('building.selectedRatio', { selected: selectedUnitIds.size, total: filteredUnits.length })}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="relative">
                  <SearchInput
                    placeholder={t('building.searchUnitPlaceholder') || 'Search unit...'}
                    value={unitSearchQuery}
                    onChange={setUnitSearchQuery}
                    className="w-full mb-0 text-xs"
                  />
                </div>
                <Select
                  options={activeWings.map((w) => ({ label: w.wingName, value: String(w.wingDetailId) }))}
                  value={wingFilter}
                  onChange={(_, val) => {
                    setWingFilter(val);
                    const matchedWing = activeWings.find((w) => String(w.wingDetailId) === val || w.wingName === val);
                    if (matchedWing) {
                      setSelectedWingDetailId(matchedWing.wingDetailId);
                      if (typeof window !== 'undefined') {
                        const params = new URLSearchParams(window.location.search);
                        params.set("wingDetailId", String(matchedWing.wingDetailId));
                        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
                      }
                    }
                  }}
                  selectSize="sm"
                  className="text-xs"
                />
                <Select
                  options={[
                    { label: t('building.allStatus') || 'All Status', value: 'all' },
                    { label: t('building.appliedOnly') || 'Applied (Direct)', value: 'direct' },
                    { label: t('building.wingCoveredOnly') || 'Wing Covered', value: 'wing' },
                    { label: t('building.apartmentCoveredOnly') || 'Apartment Covered', value: 'apartment' },
                    { label: t('building.notAppliedOnly') || 'Not Applied', value: 'none' },
                  ]}
                  value={statusFilter}
                  onChange={(_, val) => setStatusFilter(val as typeof statusFilter)}
                  selectSize="sm"
                  className="text-xs"
                />
              </div>

              <MasterTable<UnitRow>
                columns={unitTableColumns}
                data={unitTableData}
                isPagination={false}
                emptyText={t('building.noUnitsMatch') || 'No units match the selected filters'}
                maxBodyHeightClassName="max-h-36 sm:max-h-40"
                onScroll={(e) => {
                  const target = e.currentTarget;
                  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 30) {
                    loadNextUnitsPage();
                  }
                }}
                onRowClick={(row) => {
                  setSelectedUnitIds(new Set([row.propertyDetailsId as number]));
                  if (fieldErrors.unit) setFieldErrors((prev) => ({ ...prev, unit: undefined }));
                }}
                getRowKey={(row, i) => `${row.propertyDetailsId ?? ''}-${row.propertyId ?? ''}-${i}`}
                rowClassName={(row) => {
                  const isSelected = selectedUnitIds.has(row.propertyDetailsId as number) || (row.propertyId != null && selectedUnitIds.has(row.propertyId as number));
                  const isDirectApplied = row.certStatus === 'direct' || Boolean(row.propertyCertificateId);
                  return cn(
                    'select-none transition-colors cursor-pointer',
                    isDirectApplied
                      ? 'bg-emerald-50/20 border-l-4 border-l-emerald-500 hover:bg-emerald-50/40'
                      : 'hover:bg-slate-50/80',
                    isSelected && 'bg-blue-100/90 font-semibold ring-2 ring-blue-500/60 border-l-4 border-l-blue-600 shadow-sm'
                  );
                }}
              />
              {isLoadingMoreUnits && (
                <div className="py-1.5 text-center text-xs text-blue-600 font-medium flex items-center justify-center gap-2 bg-blue-50/40 rounded-lg">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('building.loadingNextUnits') || 'Loading next 10 units...'}</span>
                </div>
              )}
              <ValidationMessage message={fieldErrors.unit} />
            </div>
          )}

          {/* Unit Scope Target Banner */}
          {!isApartmentIndividual && level === 'Unit' && Boolean(selectedWingDetailId && Number(selectedWingDetailId) > 0) && Boolean(filteredUnits && filteredUnits.length > 0) && (
            selectedUnitIds.size === 0 ? (
              <div className="flex items-center gap-2 p-2 bg-amber-50/90 border border-amber-300/80 rounded-lg text-xs text-amber-900 shadow-2xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>{t('building.noUnitsSelectedTitle') || 'No units selected'}:</strong> {t('building.noUnitsSelectedHint') || 'Please click on one or more units in the table above to configure or attach their certificate documents.'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-blue-50/80 border border-blue-200 rounded-lg text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-blue-900 font-semibold">
                  <Store className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    {t('building.configuringForUnits', {
                      count: selectedUnitIds.size,
                      units: selectedUnitNamesSummary,
                    })}
                  </span>
                </div>
                {activeCertificate?.certificateNumber && (
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-semibold border",
                    level === 'Unit' && activeUnitStat?.status === 'direct'
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-sky-100 text-sky-800 border-sky-200"
                  )}>
                    {level === 'Unit' && activeUnitStat?.status !== 'direct'
                      ? (activeUnitStat?.status === 'wing' || inheritedFrom === 'Wing'
                          ? (t('building.inheritedWingBadge', { number: activeCertificate.certificateNumber }) || `Wing Covered (#${activeCertificate.certificateNumber})`)
                          : (t('building.inheritedApartmentBadge', { number: activeCertificate.certificateNumber }) || `Apartment Covered (#${activeCertificate.certificateNumber})`))
                      : (t('building.existingCertBadge', { number: activeCertificate.certificateNumber }) || `Existing Cert: #${activeCertificate.certificateNumber}`)}
                  </span>
                )}
              </div>
            )
          )}

          <div className="space-y-1.5">
            <Label required className="text-xs font-bold text-blue-900 flex items-center justify-between">
              <span>
                {!isApartmentIndividual && level === 'Unit' && selectedUnitNamesSummary
                  ? `${activeCertificateType?.certificateTypeName || 'Certificate'} Attachment for Unit ${selectedUnitNamesSummary}`
                  : (t('building.documentAttachment', { name: activeCertificateType?.certificateTypeName || 'Certificate' }) || `${activeCertificateType?.certificateTypeName || 'Certificate'} Attachment`)}
              </span>
              {!isApartmentIndividual && level === 'Unit' && selectedUnitIds.size > 1 && (
                <span className="text-[11px] font-normal text-blue-600 italic">
                  {t('building.willLinkDocument', { count: selectedUnitIds.size })}
                </span>
              )}
            </Label>

            <DocumentAttachment
              documentGuid={
                attachedFiles.length > 0
                  ? undefined
                  : removedAttachmentTypeIds.has(selectedTypeId)
                    ? undefined
                    : (existingDocumentGuid ||
                       activeCertificate?.documentGuid ||
                       (level === 'Unit' && activeUnitStat?.documentGuid) ||
                       (level === 'Apartment' && initialData?.certificateTypeId === selectedTypeId ? initialData?.documentGuid : undefined) ||
                       undefined)
              }
              fileName={
                (removedAttachmentTypeIds.has(selectedTypeId)
                  ? undefined
                  : (attachedFiles[0]?.name ||
                     existingFileName ||
                     activeCertificate?.fileName ||
                     (level === 'Unit' && activeUnitStat?.fileName) ||
                     (selectedTypeId ? uploadedFileNamesMap[selectedTypeId] : undefined) ||
                     (level === 'Apartment' && initialData?.certificateTypeId === selectedTypeId ? initialData?.fileName : undefined))) ||
                (activeCertificateType?.certificateTypeName
                  ? `${activeCertificateType.certificateTypeName} Attachment`
                  : 'Certificate Document')
              }
              hasDocumentBinding={
                !removedAttachmentTypeIds.has(selectedTypeId) &&
                Boolean(
                  existingDocumentGuid ||
                  activeCertificate?.documentGuid ||
                  activeCertificate?.hasDocument ||
                  (level === 'Unit' && (activeUnitStat?.documentGuid || activeUnitStat?.hasDocument)) ||
                  (level === 'Apartment' && initialData?.certificateTypeId === selectedTypeId && initialData?.documentGuid)
                )
              }
              isDisabled={!isApartmentIndividual && level === 'Unit' && selectedUnitIds.size === 0}
              isDocumentInvalid={!!fieldErrors.document}
              documentError={fieldErrors.document}
              onFileUpload={(file) => {
                setAttachedFiles([file]);
                if (selectedTypeId) {
                  setUploadedFileNamesMap((prev) => ({ ...prev, [selectedTypeId]: file.name }));
                }
                setRemovedAttachmentTypeIds((prev) => {
                  const next = new Set(prev);
                  next.delete(selectedTypeId);
                  return next;
                });
                if (selectedTypeId) {
                  setEnabledStateMap((prev) => ({ ...prev, [selectedTypeId]: true }));
                }
                setFieldErrors((prev) => ({ ...prev, document: undefined }));
              }}
              onFileDelete={() => {
                setAttachedFiles([]);
                setRemovedAttachmentTypeIds((prev) => new Set(prev).add(selectedTypeId));
                if (selectedTypeId) {
                  setUploadedFileNamesMap((prev) => {
                    const next = { ...prev };
                    delete next[selectedTypeId];
                    return next;
                  });
                }
              }}
              t={(key) => t(key)}
              label={activeCertificateType?.certificateTypeName}
              pendingFile={attachedFiles[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <Input
                label={t('building.certificateNumber', { name: activeCertificateType?.certificateTypeName || 'Certificate' }) || `${activeCertificateType?.certificateTypeName || 'Certificate'} Number`}
                required
                disabled={!isApartmentIndividual && level === 'Unit' && selectedUnitIds.size === 0}
                placeholder={t('building.certificateNumberPlaceholder', { name: activeCertificateType?.certificateTypeName || 'Certificate' }) || `Enter ${activeCertificateType?.certificateTypeName || 'Certificate'} number`}
                value={certificateNumber}
                onChange={(e) => {
                  setCertificateNumber(e.target.value);
                  if (fieldErrors.certificateNumber) setFieldErrors((prev) => ({ ...prev, certificateNumber: undefined }));
                }}
                className={cn("text-xs text-slate-800 bg-slate-50/30", fieldErrors.certificateNumber && "border-red-500 focus:ring-red-500")}
              />
              <ValidationMessage message={fieldErrors.certificateNumber} />
            </div>

            <div>
              <Input
                type="date"
                label={t('building.certificateDate', { name: activeCertificateType?.certificateTypeName || 'Certificate' }) || `${activeCertificateType?.certificateTypeName || 'Certificate'} Date`}
                required
                disabled={!isApartmentIndividual && level === 'Unit' && selectedUnitIds.size === 0}
                value={certificateDate}
                min={effectiveConstructionYear ? `${effectiveConstructionYear}-01-01` : undefined}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setCertificateDate(e.target.value);
                  if (fieldErrors.certificateDate) setFieldErrors((prev) => ({ ...prev, certificateDate: undefined }));
                }}
                onBlur={() => {
                  if (certificateDate && effectiveConstructionYear) {
                    const certDate = parseDateString(certificateDate);
                    if (certDate && certDate.getFullYear() < effectiveConstructionYear) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        certificateDate: t('validation.dateBeforeConstructionYear', { year: effectiveConstructionYear })
                          || `Date must be greater than or equal to construction year (${effectiveConstructionYear})`,
                      }));
                    }
                  }
                }}
                className={cn("text-xs text-slate-800 bg-slate-50/30", fieldErrors.certificateDate && "border-red-500 focus:ring-red-500")}
              />
              <ValidationMessage message={fieldErrors.certificateDate} />
            </div>
          </div>

          <div className="pt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{t('building.verifyDetailsNote') || 'VERIFY DOCUMENT DETAILS & FILE ATTACHMENT BEFORE SAVING CHANGES.'}</span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs text-red-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-shrink-0">
        {onDeleteRecord || onDelete ? (
          <Button
            variant="delete"
            size="sm"
            icon={Trash2}
            disabled={isSaving || isDeletingRecord || !hasExistingRecord}
            isLoading={isDeletingRecord}
            onClick={handleDeleteClick}
            className={cn(
              "text-xs font-bold border rounded-lg",
              hasExistingRecord
                ? "border-red-200 text-red-700 hover:bg-red-50/50 hover:border-red-500 cursor-pointer"
                : "border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
            )}
          >
            {t('building.deleteCertificate') || 'Delete Certificate'}
          </Button>
        ) : <div />}
        <SaveButton
          onClick={handleSaveClick}
          disabled={isSaving || isDeletingRecord || !isDirty || !isCertificateFilled}
          isLoading={isSaving}
          label={t('common.saveChanges') || 'Save Changes'}
        />
      </div>

      {viewerData && (
        <DocumentViewerModal
          isOpen={viewerData.isOpen}
          onClose={() => {
            if (viewerData.url.startsWith('blob:')) {
              URL.revokeObjectURL(viewerData.url);
            }
            setViewerData(null);
          }}
          fileUrl={viewerData.url}
          fileName={viewerData.name}
          label={activeCertificateType?.certificateTypeName}
        />
      )}
    </div>
  );
}

