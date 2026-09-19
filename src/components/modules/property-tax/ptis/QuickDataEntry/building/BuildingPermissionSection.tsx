
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
} from 'lucide-react';
import { SaveButton, Input, Checkbox, Select, SearchInput, MasterTable, Badge, Button, Label, ValidationMessage, DocumentViewerModal } from '@/components/common';
import type { Column } from '@/components/common';
import { cn } from '@/lib/utils/cn';
import { BuildingSidebar } from './BuildingSidebar';
import { DocumentAttachment } from './DocumentAttachment';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { validateDocumentNumber, validateDocumentDate } from '@/lib/validation/building/validation-rules';
import { useCertificateModalState } from '@/hooks/useCertificateModalState';
import { resolveUnitCertificateStatus, type UnitCertificateStatusType, type UnitStatusResolution } from '@/lib/utils/certificate-grid-mapper';
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
}

const DEFAULT_UNIT_STATUS: UnitStatusResolution = { status: 'none', certificate: null };

export interface BuildingPermissionSectionProps {
  propertyId: string;
  categoryName?: string;
  societyId?: number | null;
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
}

export function BuildingPermissionSection({
  propertyId,
  categoryName,
  societyId,
  wings = [],
  units = [],
  certificateTypes = [],
  initialCertificateGrid = null,
  initialLevel = 'Apartment',
  initialCertificateTypeId = 3,
  initialData = null,
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


  const rawCat = categoryName || searchParams.get('propertyCategory') || searchParams.get('categoryName') || '';
  const partitionNo = searchParams.get('partitionNo') || '';
  const appartmentPartition = searchParams.get('appartmentPartition') || '';
  const hasPartition = Boolean(appartmentPartition || partitionNo);

  const displayCategory = (hasPartition && rawCat.toLowerCase().includes('apartment'))
    ? 'Apartment/Individual'
    : rawCat;

  const effectiveCategoryName = (displayCategory || rawCat).toLowerCase();
  const isApartmentIndividual =
    hasPartition ||
    effectiveCategoryName.includes('apartment/individual') ||
    effectiveCategoryName.includes('individual') ||
    (effectiveCategoryName.includes('apartment') && hasPartition);

  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveFirst, setShowActiveFirst] = useState(false);
  const [enabledStateMap, setEnabledStateMap] = useState<Record<number, boolean>>({});
  const [removedAttachmentTypeIds, setRemovedAttachmentTypeIds] = useState<Set<number>>(new Set());

  const isWingWise = searchParams?.get('isWingWise') === 'true';

  const effectiveInitialLevel = isWingWise && initialLevel === 'Apartment' ? 'Wing' : initialLevel;

  const urlWingDetailId = searchParams?.get('wingDetailId');
  const initialWingDetailId = urlWingDetailId ? Number(urlWingDetailId) : null;

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
    wings: activeWings,
    certificateTypes: activeCertificateTypes,
    filteredUnits,
    isAllUnitsSelected,
    toggleUnitSelection,
    toggleAllUnits,
    isLoadingMoreUnits,
    loadNextUnitsPage,
    gridItems,
    gridRecords,
    isLoadingGridRecords,
    activeCertificate,
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
    initialCertificateTypeId,
    initialData,
  });

  const [statusFilter, setStatusFilter] = useState<'all' | 'direct' | 'wing' | 'apartment' | 'none'>('all');
  const [viewerData, setViewerData] = useState<{ isOpen: boolean; url: string; name: string } | null>(null);

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

  const handleSelectCertificate = (typeId: number) => {
    setSelectedTypeId(typeId);
    setFieldErrors({});
  };

  const handleToggleEnabled = (typeId: number, checked: boolean) => {
    setEnabledStateMap((prev) => ({ ...prev, [typeId]: checked }));
    if (checked) {
      setSelectedTypeId(typeId);
    }
  };

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
      }
    }

    // 3. Document attachment validation
    if (attachedFiles.length === 0 && !(level === 'Apartment' && initialData?.documentGuid && !removedAttachmentTypeIds.has(selectedTypeId))) {
      const activeGridMatch = activeCertificate || gridRecords.find((r) => r.certificateTypeId === selectedTypeId);
      if (removedAttachmentTypeIds.has(selectedTypeId) || (!activeGridMatch?.hasDocument && !activeGridMatch?.documentGuid)) {
        errors.document = t('common.validation.documentRequired') || 'Certificate document attachment is required.';
      }
    }

    // 4. Level-specific validation
    if (!isApartmentIndividual && level === 'Wing' && !selectedWingDetailId) {
      errors.wing = t('building.errors.selectWingRequired') || 'Please select a wing.';
    }
    if (!isApartmentIndividual && level === 'Unit') {
      if (selectedUnitIds.size === 0) {
        errors.unit = t('building.selectUnits') || 'Please select at least one unit.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error(t('common.validation.fixErrors') || 'Please correct validation errors before saving.');
      return;
    }

    const resolvedSelectedPropertyIds = Array.from(selectedUnitIds).map((id) => {
      const matched = filteredUnits.find((u) => u.propertyDetailsId === id || u.propertyId === id)
        || units.find((u) => u.propertyDetailsId === id || u.propertyId === id);
      return matched?.propertyId || id;
    });

    setFieldErrors({});
    try {
      const result = await onSave?.({
        level,
        selectedWingDetailId,
        selectedUnitIds: resolvedSelectedPropertyIds,
        selectedUnitDetailsIds: Array.from(selectedUnitIds),
        isAllUnitsSelected,
        certificateTypeId: selectedTypeId,
        certificateDate,
        certificateNumber,
        status,
        remarks,
        attachedFiles,
      });

      const isSuccess = result !== false && (typeof result !== 'object' || result === null || (result as { success?: boolean }).success !== false);
      if (isSuccess) {
        setAttachedFiles([]);
        await refetchGrid();
      }
    } catch (_error) {
      // Handled by onSave
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

        const resolvedSelectedPropertyIds = Array.from(selectedUnitIds).map((id) => {
          const matched = filteredUnits.find((u) => u.propertyDetailsId === id || u.propertyId === id)
            || units.find((u) => u.propertyDetailsId === id || u.propertyId === id);
          return matched?.propertyId || id;
        });

        try {
          if (onDeleteRecord) {
            await onDeleteRecord({
              certificateTypeId: selectedTypeId,
              documentGuid: docGuid,
              propertyCertificateId: certId,
              level,
              selectedWingDetailId,
              selectedUnitIds: resolvedSelectedPropertyIds,
              societyDetailId: societyId ? Number(societyId) : null,
            });
          } else if (onDelete) {
            onDelete(selectedTypeId);
          }
          setCertificateNumber('');
          setCertificateDate('');
          setAttachedFiles([]);
          setEnabledStateMap((prev) => ({ ...prev, [selectedTypeId]: false }));
          setFieldErrors({});
          await refetchGrid();
        } catch (_err) {
          // handled
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
    return gridItems.unitCertificates || [];
  })();

  const unitStatusMap = (() => {
    const map = new Map<number, ReturnType<typeof resolveUnitCertificateStatus>>();
    filteredUnits.forEach((u) => {
      const stat = resolveUnitCertificateStatus(gridItems, selectedTypeId, u, societyId ? Number(societyId) : undefined);
      map.set(u.propertyDetailsId, stat);
    });
    return map;
  })();

  const certificatesList: CertificateData[] = activeCertificateTypes.map((ct) => {
    const isSelected = selectedTypeId === ct.certificateTypeId;
    const gridRecord = levelFilteredRecords.find((r) => r.certificateTypeId === ct.certificateTypeId);
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
      !!(
        (initialData?.documentGuid && initialData.documentGuid !== 'null' && initialData.documentGuid !== 'undefined') ||
        (initialData?.number && initialData.number.trim() !== '') ||
        (initialData?.date && initialData.date.trim() !== '')
      );
    const hasPendingDoc = isSelected && attachedFiles.length > 0;

    const initialEnabled = hasRecordData || hasInitialData || hasPendingDoc;
    const isEnabled = enabledStateMap[ct.certificateTypeId] ?? initialEnabled;

    const certNo = isSelected
      ? (certificateNumber || gridRecord?.certificateNumber || (level === 'Apartment' ? initialData?.number : '') || '')
      : (gridRecord?.certificateNumber || '');

    let rawDate = isSelected
      ? (certificateDate || gridRecord?.certificateDate || (level === 'Apartment' ? initialData?.date : '') || '')
      : (gridRecord?.certificateDate || '');
    if (rawDate.includes('T')) {
      rawDate = rawDate.split('T')[0];
    }

    const hasDoc =
      (isSelected && attachedFiles.length > 0) ||
      (!isAttachmentRemoved &&
        (gridRecord?.hasDocument || (isSelected && level === 'Apartment' && !!initialData?.documentGuid)));

    return {
      certificateTypeId: ct.certificateTypeId,
      certificateTypeName: ct.certificateTypeName || gridRecord?.certificateTypeName,
      enabled: isEnabled,
      number: certNo,
      date: rawDate,
      documentGuid: hasDoc ? ((level === 'Apartment' ? initialData?.documentGuid : undefined) || gridRecord?.documentGuid || 'temp-guid') : undefined,
    };
  });

  // Whether there's an existing saved certificate record for the selected type at the current level
  const hasExistingRecord = (() => {
    // 1. Direct activeCertificate check (number, document, or ID)
    if (activeCertificate) {
      if (activeCertificate.propertyCertificateId && activeCertificate.propertyCertificateId > 0) return true;
      if (activeCertificate.hasDocument || (activeCertificate.documentGuid && activeCertificate.documentGuid !== 'null')) return true;
      if (activeCertificate.certificateNumber && activeCertificate.certificateNumber.trim() !== '') return true;
    }

    // 2. Unit level: check if any of the currently selected units has an existing direct certificate
    if (level === 'Unit' && selectedUnitIds.size > 0) {
      const hasDirectUnit = Array.from(selectedUnitIds).some((id) => {
        const stat = unitStatusMap.get(id);
        return stat?.status === 'direct' && Boolean(stat.certificate || stat.hasDocument || stat.certificateNumber);
      });
      if (hasDirectUnit) return true;
    }

    // 3. Current level filtered records match
    const gridMatch = levelFilteredRecords.find((r) => r.certificateTypeId === selectedTypeId);
    if (gridMatch) {
      if (gridMatch.propertyCertificateId && gridMatch.propertyCertificateId > 0) return true;
      if (gridMatch.hasDocument || (gridMatch.documentGuid && gridMatch.documentGuid !== 'null')) return true;
      if (gridMatch.certificateNumber && gridMatch.certificateNumber.trim() !== '') return true;
    }

    // 4. Initial apartment SSR data
    if (level === 'Apartment' && (initialData?.documentGuid || (initialData?.number && initialData.number.trim() !== ''))) {
      return true;
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
      .filter((u) => selectedUnitIds.has(u.propertyDetailsId))
      .map((u) => u.unitNo)
      .filter(Boolean);
    if (names.length <= 3) return names.join(', ');
    return `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
  })();

  const handleClearSelection = () => {
    toggleAllUnits(false);
  };

  const handleSelectAllApplied = () => {
    filteredUnits.forEach((u) => {
      const stat = unitStatusMap.get(u.propertyDetailsId);
      if (stat?.status === 'direct' && !selectedUnitIds.has(u.propertyDetailsId)) {
        toggleUnitSelection(u.propertyDetailsId);
      }
    });
  };

  const unitTableColumns = useMemo<Column<UnitRow>[]>(() => {
    return [
      {
        key: 'propertyDetailsId',
        label: (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isAllUnitsSelected}
              onCheckedChange={toggleAllUnits}
            />
          </div>
        ),
        width: '40px',
        align: 'center',
        render: (_, row) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedUnitIds.has(row.propertyDetailsId as number)}
              onCheckedChange={() => {
                toggleUnitSelection(row.propertyDetailsId as number);
                if (fieldErrors.unit) setFieldErrors((prev) => ({ ...prev, unit: undefined }));
              }}
            />
          </div>
        ),
      },
      {
        key: 'unitNo',
        label: t('building.unit') || 'UNIT',
        render: (val, row) => (
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-blue-900">{String(val || '')}</span>
            {row.certStatus === 'direct' && (
              <span
                className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 flex-shrink-0"
                title={t('building.directCertTooltip') || 'Direct certificate applied to this unit'}
              />
            )}
          </div>
        ),
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
  }, [isAllUnitsSelected, toggleAllUnits, selectedUnitIds, toggleUnitSelection, fieldErrors.unit, locale, t, setSelectedUnitIds]);

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
    <div className="relative flex-1 flex flex-col min-h-0 h-full overflow-hidden p-3 gap-3">
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
        {!isApartmentIndividual && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {!isWingWise && (
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
      {!isApartmentIndividual && (
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
          {level === 'Unit' && (
            <>
              <Store className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-700">
                <strong className="text-emerald-900">{t('building.unitLevel') || 'Unit Scope'}:</strong> {t('building.unitScopeHint') || 'Click on specific units in the table below to configure or attach their individual certificate documents.'}
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
        <div className="relative lg:col-span-8 xl:col-span-9 flex flex-col h-full min-h-0 bg-white border border-slate-200 rounded-xl p-4 overflow-y-auto space-y-4 shadow-xs">
          {isLoadingGridRecords && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 text-white rounded-lg shadow-md text-xs font-medium animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{t('building.fetchingWingData') || t('actions.loading') || 'Fetching wing data...'}</span>
              </div>
            </div>
          )}
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-base font-bold text-blue-900">
              {activeCertificateType?.certificateTypeName || 'Certificate'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('building.subtitle') || 'Add the date, reference number and supporting files.'}
            </p>
          </div>

          {!isApartmentIndividual && level === 'Wing' && (
            <div className={cn("space-y-2 p-3 rounded-xl border transition-all", fieldErrors.wing ? "bg-red-50/20 border-red-300" : "bg-slate-50/60 border-slate-200")}>
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

          {!isApartmentIndividual && level === 'Unit' && (
            <div className={cn("space-y-2.5 p-3.5 rounded-xl border transition-all", fieldErrors.unit ? "bg-red-50/20 border-red-300" : "bg-slate-50/70 border-slate-200")}>
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

                  {appliedUnitsCount > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllApplied}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 cursor-pointer border border-slate-200 transition-all"
                      title={t('building.selectAppliedTooltip')}
                    >
                      {t('building.selectApplied')}
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
                maxBodyHeightClassName="max-h-48"
                onScroll={(e) => {
                  const target = e.currentTarget;
                  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 30) {
                    loadNextUnitsPage();
                  }
                }}
                onRowClick={(row) => {
                  toggleUnitSelection(row.propertyDetailsId as number);
                  if (fieldErrors.unit) setFieldErrors((prev) => ({ ...prev, unit: undefined }));
                }}
                getRowKey={(row) => row.propertyDetailsId as number}
                rowClassName={(row) => {
                  const isSelected = selectedUnitIds.has(row.propertyDetailsId as number);
                  const isDirectApplied = row.certStatus === 'direct';
                  return cn(
                    'cursor-pointer select-none transition-colors',
                    isSelected
                      ? 'bg-blue-100/90 font-semibold ring-2 ring-blue-500/60 border-l-4 border-l-blue-600 shadow-sm'
                      : isDirectApplied
                        ? 'bg-emerald-50/25 hover:bg-emerald-50/40 border-l-4 border-l-emerald-500'
                        : 'hover:bg-slate-50/80'
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
          {!isApartmentIndividual && level === 'Unit' && (
            selectedUnitIds.size === 0 ? (
              <div className="flex items-center gap-2.5 p-3 bg-amber-50/90 border border-amber-300/80 rounded-xl text-xs text-amber-900 shadow-2xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>{t('building.noUnitsSelectedTitle') || 'No units selected'}:</strong> {t('building.noUnitsSelectedHint') || 'Please click on one or more units in the table above to configure or attach their certificate documents.'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs shadow-2xs">
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
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-semibold">
                    {t('building.existingCertBadge', { number: activeCertificate.certificateNumber })}
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
                    : (activeCertificate?.documentGuid || (level === 'Apartment' ? initialData?.documentGuid : undefined))
              }
              fileName={
                attachedFiles[0]?.name ||
                (removedAttachmentTypeIds.has(selectedTypeId)
                  ? undefined
                  : (activeCertificate?.fileName || (level === 'Apartment' ? initialData?.fileName : undefined))) ||
                activeCertificate?.certificateNumber ||
                activeCertificateType?.certificateTypeName ||
                'Certificate Document'
              }
              hasDocumentBinding={
                !removedAttachmentTypeIds.has(selectedTypeId) &&
                Boolean(activeCertificate?.hasDocument || activeCertificate?.documentGuid || (level === 'Apartment' && initialData?.documentGuid))
              }
              isDisabled={!isApartmentIndividual && level === 'Unit' && selectedUnitIds.size === 0}
              isDocumentInvalid={!!fieldErrors.document}
              documentError={fieldErrors.document}
              onFileUpload={(file) => {
                setAttachedFiles([file]);
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
                onChange={(e) => {
                  setCertificateDate(e.target.value);
                  if (fieldErrors.certificateDate) setFieldErrors((prev) => ({ ...prev, certificateDate: undefined }));
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

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-shrink-0">
        {onDeleteRecord || onDelete ? (
          <Button
            variant="delete"
            size="sm"
            icon={Trash2}
            disabled={isSaving || !hasExistingRecord}
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
          disabled={isSaving || !isDirty}
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

