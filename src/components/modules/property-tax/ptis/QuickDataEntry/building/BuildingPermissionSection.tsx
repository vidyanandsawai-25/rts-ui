
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Building2,
  Home,
  Store,
  Trash2,
  Loader2,
} from 'lucide-react';
import { SaveButton, Input, Checkbox, Select, SearchInput, MasterTable, Badge, Button, Label, ValidationMessage } from '@/components/common';
import type { Column } from '@/components/common';
import { cn } from '@/lib/utils/cn';
import { BuildingSidebar } from './BuildingSidebar';
import { DocumentAttachment } from './DocumentAttachment';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { validateDocumentNumber, validateDocumentDate } from '@/lib/validation/building/validation-rules';
import { useCertificateModalState } from '@/hooks/useCertificateModalState';
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
  unitNo: string;
  wingName: string;
  floorName: string;
  useName: string;
}

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
    isAllUnitsSelected?: boolean;
    certificateTypeId: number;
    certificateDate: string;
    certificateNumber: string;
    status: CertificateStatus;
    remarks: string;
    attachedFiles: File[];
  }) => void;
  onDelete?: (certificateTypeId: number) => void;
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
  isSaving = false,
}: BuildingPermissionSectionProps): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('quickDataEntry');

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
    floorFilter,
    setFloorFilter,
    useFilter,
    setUseFilter,
    selectedUnitIds,
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
    availableFloors,
    availableUses,
    filteredUnits,
    isAllUnitsSelected,
    toggleUnitSelection,
    toggleAllUnits,
    isLoadingMoreUnits,
    loadNextUnitsPage,
    gridRecords,
    isLoadingGridRecords,
    activeCertificate,
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

  const handleSaveClick = () => {
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
    if (attachedFiles.length === 0 && !initialData?.documentGuid) {
      const activeGridMatch = activeCertificate || gridRecords.find((r) => r.certificateTypeId === selectedTypeId);
      if (!activeGridMatch?.hasDocument && !activeGridMatch?.documentGuid) {
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
      const matched = filteredUnits.find((u) => u.propertyDetailsId === id || u.propertyId === id);
      return matched?.propertyId || id;
    });

    setFieldErrors({});
    onSave?.({
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
    } as unknown as Parameters<NonNullable<typeof onSave>>[0]);
  };

  const sidebarValidationErrors = useMemo<Record<number, string>>(() => {
    if (Object.keys(fieldErrors).length === 0) return {};
    const firstErr = fieldErrors.certificateNumber || fieldErrors.certificateDate || fieldErrors.document || fieldErrors.wing || fieldErrors.unit || 'Incomplete';
    return { [selectedTypeId]: firstErr };
  }, [fieldErrors, selectedTypeId]);

  const certificatesList: CertificateData[] = useMemo(() => {
    return activeCertificateTypes.map((ct) => {
      const isSelected = selectedTypeId === ct.certificateTypeId;
      const gridRecord = (gridRecords || []).find((r) => r.certificateTypeId === ct.certificateTypeId);

      // Check if this certificate actually has saved data or document
      const hasRecordData = !!(gridRecord && (gridRecord.hasDocument || gridRecord.certificateNumber || gridRecord.certificateDate));
      const hasInitialData = isSelected && !!(initialData?.enabled || initialData?.number || initialData?.date || initialData?.documentGuid);

      const initialEnabled = hasRecordData || hasInitialData;
      const isEnabled = enabledStateMap[ct.certificateTypeId] ?? initialEnabled;

      const certNo = isSelected
        ? (certificateNumber || gridRecord?.certificateNumber || initialData?.number || '')
        : (gridRecord?.certificateNumber || '');

      let rawDate = isSelected
        ? (certificateDate || gridRecord?.certificateDate || initialData?.date || '')
        : (gridRecord?.certificateDate || '');
      if (rawDate.includes('T')) {
        rawDate = rawDate.split('T')[0];
      }

      const hasDoc = (isSelected && attachedFiles.length > 0) || gridRecord?.hasDocument || (isSelected && !!initialData?.documentGuid);

      return {
        certificateTypeId: ct.certificateTypeId,
        certificateTypeName: ct.certificateTypeName || gridRecord?.certificateTypeName,
        enabled: isEnabled,
        number: certNo,
        date: rawDate,
        documentGuid: hasDoc ? (initialData?.documentGuid || 'temp-guid') : undefined,
      };
    });
  }, [activeCertificateTypes, enabledStateMap, selectedTypeId, certificateNumber, certificateDate, attachedFiles, initialData, gridRecords]);

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
        label: 'UNIT',
        render: (val) => <span className="font-bold text-blue-900">{String(val || '')}</span>,
      },
      {
        key: 'wingName',
        label: 'WING',
        render: (val) => <span className="font-semibold text-slate-700">{String(val || '')}</span>,
      },
      {
        key: 'floorName',
        label: 'FLOOR',
        render: (val) => <span className="text-slate-600">{String(val || '')}</span>,
      },
      {
        key: 'useName',
        label: 'USE',
        render: (val) => (
          <Badge variant="secondary" size="sm" className="bg-blue-100 text-blue-800 font-semibold">
            {String(val || 'Residential')}
          </Badge>
        ),
      },
    ];
  }, [isAllUnitsSelected, toggleAllUnits, selectedUnitIds, toggleUnitSelection, fieldErrors.unit]);

  const unitTableData = useMemo<UnitRow[]>(() => {
    return filteredUnits.map((u) => ({
      propertyDetailsId: u.propertyDetailsId,
      unitNo: u.unitNo,
      wingName: u.wingName,
      floorName: u.floorName,
      useName: u.useName || 'Residential',
    }));
  }, [filteredUnits]);

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
                Fetching wing data...
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

          {!isApartmentIndividual && (level === 'Wing' || level === 'Unit') && (
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
                          if (level === 'Unit') {
                            setWingFilter(String(wing.wingDetailId));
                          } else {
                            setWingFilter('all');
                          }
                          setFloorFilter('all');
                          setUseFilter('all');

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
            <div className={cn("space-y-2 p-3 rounded-xl border transition-all", fieldErrors.unit ? "bg-red-50/20 border-red-300" : "bg-slate-50/60 border-slate-200")}>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {t('building.selectUnits') || 'SELECT UNITS'}
                </Label>
                <Badge variant="secondary" size="sm" className="bg-white text-slate-600 font-semibold border border-slate-200">
                  {t('building.unitsSelected', { count: selectedUnitIds.size }) || `${selectedUnitIds.size} ${selectedUnitIds.size === 1 ? 'unit' : 'units'} selected`}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="relative sm:col-span-1">
                  <SearchInput
                    placeholder={t('building.searchUnitPlaceholder') || 'Search unit...'}
                    value={unitSearchQuery}
                    onChange={setUnitSearchQuery}
                    className="w-full mb-0 text-xs"
                  />
                </div>
                <Select
                  options={[
                    { label: t('building.allWings') || 'All Wings', value: 'all' },
                    ...activeWings.map((w) => ({ label: w.wingName, value: String(w.wingDetailId) })),
                  ]}
                  value={wingFilter}
                  onChange={(_, val) => setWingFilter(val)}
                  selectSize="sm"
                  className="text-xs"
                />
                <Select
                  options={[
                    { label: t('building.allFloors') || 'All Floors', value: 'all' },
                    ...availableFloors.map((fl) => ({ label: fl, value: fl })),
                  ]}
                  value={floorFilter}
                  onChange={(_, val) => setFloorFilter(val)}
                  selectSize="sm"
                  className="text-xs"
                />
                <Select
                  options={[
                    { label: t('building.allUses') || 'All Uses', value: 'all' },
                    ...availableUses.map((us) => ({ label: us, value: us })),
                  ]}
                  value={useFilter}
                  onChange={(_, val) => setUseFilter(val)}
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
                getRowKey={(row) => row.propertyDetailsId as number}
                rowClassName={(row) =>
                  selectedUnitIds.has(row.propertyDetailsId as number) ? 'bg-blue-50/60' : ''
                }
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

          <div className="space-y-1.5">
            <Label required className="text-xs font-bold text-blue-900">
              {t('building.documentAttachment', { name: activeCertificateType?.certificateTypeName || 'Certificate' }) || `${activeCertificateType?.certificateTypeName || 'Certificate'} Attachment`}
            </Label>

            <DocumentAttachment
              documentGuid={attachedFiles.length > 0 ? undefined : (activeCertificate?.documentGuid || initialData?.documentGuid || undefined)}
              fileName={attachedFiles[0]?.name || initialData?.fileName || activeCertificate?.certificateNumber || activeCertificateType?.certificateTypeName || 'Certificate Document'}
              hasDocumentBinding={Boolean(activeCertificate?.hasDocument || activeCertificate?.documentGuid || initialData?.documentGuid)}
              isDisabled={false}
              isDocumentInvalid={!!fieldErrors.document}
              documentError={fieldErrors.document}
              onFileUpload={(file) => {
                setAttachedFiles([file]);
                if (selectedTypeId) {
                  setEnabledStateMap((prev) => ({ ...prev, [selectedTypeId]: true }));
                }
                setFieldErrors((prev) => ({ ...prev, document: undefined }));
              }}
              onFileDelete={() => {
                setAttachedFiles([]);
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
        {onDelete ? (
          <Button
            variant="delete"
            size="sm"
            icon={Trash2}
            disabled={isSaving}
            onClick={() => {
              if (selectedTypeId && confirm(t('building.confirmDeleteCert') || 'Are you sure you want to delete this certificate?')) {
                onDelete(selectedTypeId);
              }
            }}
            className="text-xs font-bold border border-red-200 text-red-700 rounded-lg hover:bg-red-50/50 hover:border-red-500 cursor-pointer"
          >
            {t('building.deleteCertificate') || 'Delete Certificate'}
          </Button>
        ) : <div />}
        <SaveButton
          onClick={handleSaveClick}
          disabled={isSaving}
          isLoading={isSaving}
          label={t('common.saveChanges') || 'Save Changes'}
        />
      </div>
    </div>
  );
}
