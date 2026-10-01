'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  Building2,
  Pencil,
  Eye,
  Loader2,
  AlertCircle,
  Plus,
  FileText,
  Filter,
  Layers,
  Home,
  Store,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { defaultLocale } from '@/i18n/config';
import { toast } from 'sonner';
import { Select, Button, DocumentViewerModal, type Option } from '@/components/common';
import { getDocumentBlobUrl } from '@/lib/utils/document-client-utils';
import { useApartmentWingUrlParams } from '@/hooks/property-tax/apartment';
import type { BuildingPermissionData } from '@/types/ptis.types';
import {
  BuildingPermissionRecord,
  mapToBuildingPermissionRecords,
} from '@/types/property-tax/apartment/building-permission-records.types';


export interface BuildingPermissionRecordsProps {
  records?: BuildingPermissionRecord[];
  rawGridData?: unknown;
  masterTypes?: unknown[] | null;
  initialCertificateType?: string | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  buildingPermissionData?: BuildingPermissionData | null;
  propertyId?: number | string | null;
  wardId?: string | number | null;
  wardNo?: string | null;
  propertyNo?: string | null;
  societyDetailId?: number | null;
  wingDetailsId?: number | null;
  wingName?: string | null;
  className?: string;
}



export const BuildingPermissionRecords: React.FC<BuildingPermissionRecordsProps> = ({
  records: propRecords,
  rawGridData,
  masterTypes: propMasterTypes,
  initialCertificateType,
  isExpanded: propIsExpanded,
  onToggleExpand: propOnToggleExpand,
  buildingPermissionData,
  propertyId,
  wardId,
  wardNo,
  propertyNo,
  societyDetailId,
  wingDetailsId,
  wingName,
  className,
}) => {
  const router = useRouter();
  const routeParams = useParams();
  const locale = useLocale() || (routeParams?.locale as string) || defaultLocale;
  const t = useTranslations('ptisRedesign');
  const { setWingParams } = useApartmentWingUrlParams();


  const [selectedCertType, setSelectedCertType] = useState<string>(initialCertificateType || 'ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [internalExpanded, setInternalExpanded] = useState<boolean>(true);
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : internalExpanded;
  const toggleExpand = propOnToggleExpand || (() => setInternalExpanded((prev) => !prev));

  const [activeViewingKey, setActiveViewingKey] = useState<string | null>(null);
  const [viewerData, setViewerData] = useState<{
    isOpen: boolean;
    url: string;
    name: string;
    label?: string;
    contentType?: string;
  } | null>(null);

  // Server-provided grid data (fetched in apartment-page-data.ts via SSR)
  const effectiveGridData = rawGridData ?? null;

  // Server-provided master types (fetched in apartment-page-data.ts via SSR)
  const effectiveMasterTypes = (propMasterTypes && propMasterTypes.length > 0)
    ? propMasterTypes
    : null;


  // Derive rows from live API data
  const rows = useMemo(() => {
    if (propRecords && propRecords.length > 0) {
      return propRecords;
    }
    return mapToBuildingPermissionRecords(
      effectiveGridData,
      buildingPermissionData,
      wingDetailsId,
      effectiveMasterTypes
    );
  }, [propRecords, effectiveGridData, buildingPermissionData, wingDetailsId, effectiveMasterTypes]);

  const handleFilterSelect = useCallback(
    (typeKey: string) => {
      setSelectedCertType(typeKey);
      setWingParams({ certType: typeKey === 'ALL' ? null : typeKey });
    },
    [setWingParams]
  );

  const handleLevelSelect = useCallback((levelKey: string) => {
    setSelectedLevel((prev) => (prev.toLowerCase() === levelKey.toLowerCase() ? 'ALL' : levelKey));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSelectedCertType('ALL');
    setSelectedLevel('ALL');
    setWingParams({ certType: null });
  }, [setWingParams]);

  const availableTypeFilters = useMemo(() => {
    const map = new Map<string, { id?: number; code: string; name: string; count: number }>();
    for (const r of rows) {
      const code = r.certificateTypeCode?.trim() || '';
      const name = r.certificateTypeName?.trim() || code || 'Certificate';
      const key = code || name;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          id: r.certificateTypeId ?? undefined,
          code,
          name,
          count: 1,
        });
      }
    }
    return Array.from(map.values());
  }, [rows]);

  const certificateTypeOptions = useMemo<Option[]>(() => {
    const allLabel =
      t('buildingPermission.allCertificates') ||
      'All Certificates';

    const options: Option[] = [
      {
        label: allLabel,
        value: 'ALL',
      },
    ];

    const seen = new Set<string>();

    // 1. From records present in rows
    for (const tf of availableTypeFilters) {
      const val = tf.code || tf.name || (tf.id ? String(tf.id) : '');
      if (!val || seen.has(val.toLowerCase())) continue;
      seen.add(val.toLowerCase());
      if (tf.code) seen.add(tf.code.toLowerCase());
      if (tf.name) seen.add(tf.name.toLowerCase());
      if (tf.id) seen.add(String(tf.id));

      const label =
        tf.code && tf.code.toLowerCase() !== tf.name.toLowerCase()
          ? `${tf.name} (${tf.code})`
          : tf.name;

      options.push({
        label,
        value: val,
      });
    }

    // 2. Also incorporate any types from master list if available
    if (Array.isArray(effectiveMasterTypes)) {
      for (const mt of effectiveMasterTypes) {
        if (typeof mt !== 'object' || mt === null) continue;
        const m = mt as Record<string, unknown>;
        const code = String(m.certificateTypeCode ?? m.CertificateTypeCode ?? m.code ?? '').trim();
        const name = String(m.certificateTypeName ?? m.CertificateTypeName ?? m.name ?? code ?? '').trim();
        const id = Number(m.propertyCertificateTypeId ?? m.PropertyCertificateTypeId ?? m.id ?? m.Id ?? 0);
        const val = code || name || (id > 0 ? String(id) : '');
        if (!val) continue;

        const isSeen =
          (code && seen.has(code.toLowerCase())) ||
          (name && seen.has(name.toLowerCase())) ||
          (id > 0 && seen.has(String(id)));

        if (!isSeen) {
          seen.add(val.toLowerCase());
          if (code) seen.add(code.toLowerCase());
          if (name) seen.add(name.toLowerCase());
          if (id > 0) seen.add(String(id));

          const label = code && code.toLowerCase() !== name.toLowerCase() ? `${name} (${code})` : name;
          options.push({
            label,
            value: val,
          });
        }
      }
    }

    return options;
  }, [availableTypeFilters, effectiveMasterTypes, t]);

  const selectedCertTypeValue = useMemo(() => {
    if (!selectedCertType || selectedCertType === 'ALL') return 'ALL';
    const found = certificateTypeOptions.find(
      (opt) => opt.value.toLowerCase() === selectedCertType.toLowerCase()
    );
    if (found) return found.value;
    for (const r of rows) {
      if (
        (r.certificateTypeId && String(r.certificateTypeId) === selectedCertType) ||
        (r.certificateTypeCode && r.certificateTypeCode.toLowerCase() === selectedCertType.toLowerCase()) ||
        (r.certificateTypeName && r.certificateTypeName.toLowerCase() === selectedCertType.toLowerCase())
      ) {
        const candidate = r.certificateTypeCode || r.certificateTypeName || String(r.certificateTypeId || '');
        const matched = certificateTypeOptions.find(
          (opt) => opt.value.toLowerCase() === candidate.toLowerCase()
        );
        if (matched) return matched.value;
      }
    }
    return selectedCertType;
  }, [selectedCertType, certificateTypeOptions, rows]);

  const hasFloorLevel = useMemo(() => {
    return rows.some((r) => (r.level || '').toLowerCase().includes('floor'));
  }, [rows]);

  const levelCounts = useMemo(() => {
    let apartment = 0;
    let wing = 0;
    let unit = 0;
    let floor = 0;
    for (const r of rows) {
      const lvl = (r.level || '').toLowerCase();
      if (lvl.includes('apartment') || lvl.includes('society')) apartment++;
      else if (lvl.includes('wing')) wing++;
      else if (lvl.includes('unit')) unit++;
      else if (lvl.includes('floor')) floor++;
      else apartment++;
    }
    return {
      all: rows.length,
      apartment,
      wing,
      unit,
      floor,
    };
  }, [rows]);


  const displayedRows = useMemo(() => {
    return rows.filter((r) => {
      // 1. Certificate type filter
      if (selectedCertType && selectedCertType !== 'ALL') {
        const target = selectedCertType.toLowerCase().trim();
        const matchId = r.certificateTypeId && String(r.certificateTypeId) === target;
        const matchCode = r.certificateTypeCode && r.certificateTypeCode.toLowerCase().trim() === target;
        const matchName = r.certificateTypeName && r.certificateTypeName.toLowerCase().trim() === target;
        if (!matchId && !matchCode && !matchName) return false;
      }
      // 2. Level / Scope filter
      if (selectedLevel && selectedLevel !== 'ALL') {
        const rowLvl = (r.level || 'Apartment').toLowerCase().trim();
        if (rowLvl !== selectedLevel.toLowerCase().trim()) return false;
      }
      return true;
    });
  }, [rows, selectedCertType, selectedLevel]);

  const closeViewer = useCallback(() => {
    if (viewerData?.url) {
      URL.revokeObjectURL(viewerData.url);
    }
    setViewerData(null);
  }, [viewerData]);

  useEffect(() => {
    return () => {
      if (viewerData?.url) {
        URL.revokeObjectURL(viewerData.url);
      }
    };
  }, [viewerData]);

  const handleEditRecord = useCallback(
    (_record?: BuildingPermissionRecord) => {
      const propId = propertyId || _record?.propertyId;
      const targetPropId = propId ? String(propId) : '0';

      const q = new URLSearchParams();

      // Wing Detail ID: Prefer record's wing, fallback to component prop
      const targetWingId = _record?.wingDetailId || wingDetailsId;
      if (targetWingId) q.set('wingDetailId', String(targetWingId));

      // Society Detail ID
      if (societyDetailId) {
        q.set('societyId', String(societyDetailId));
        q.set('societyDetailId', String(societyDetailId));
      }
      if (wardNo) q.set('wardNo', String(wardNo));
      if (wardId) q.set('wardId', String(wardId));
      if (propertyNo) q.set('propertyNo', String(propertyNo));

      // Level / Scope
      let targetLevel: string | null = null;
      if (_record?.level) {
        const lvl = _record.level.trim().toLowerCase();
        if (lvl.includes('unit')) targetLevel = 'Unit';
        else if (lvl.includes('wing')) targetLevel = 'Wing';
        else if (lvl.includes('apart') || lvl.includes('apt') || lvl.includes('society')) targetLevel = 'Apartment';
        else targetLevel = _record.level;
      } else if (selectedLevel && selectedLevel !== 'ALL') {
        targetLevel = selectedLevel;
      }
      if (targetLevel) q.set('level', targetLevel);

      // Wing Name
      const targetWingName =
        _record?.wingName ||
        (_record?.level === 'Wing' ? _record?.applicableToLabel : undefined) ||
        (targetLevel === 'Wing' ? wingName : undefined) ||
        wingName;
      if (targetWingName) q.set('wingName', String(targetWingName));

      // Certificate Type ID & Code
      let targetCertTypeId = _record?.certificateTypeId;
      let targetCertTypeCode = _record?.certificateTypeCode;

      if (!targetCertTypeId && selectedCertType && selectedCertType !== 'ALL') {
        const found = rows.find(
          (r) =>
            (r.certificateTypeId && String(r.certificateTypeId) === selectedCertType) ||
            (r.certificateTypeCode && r.certificateTypeCode.toLowerCase() === selectedCertType.toLowerCase()) ||
            (r.certificateTypeName && r.certificateTypeName.toLowerCase() === selectedCertType.toLowerCase())
        );
        if (found) {
          targetCertTypeId = found.certificateTypeId;
          targetCertTypeCode = found.certificateTypeCode;
        }
      }

      if (targetCertTypeId) q.set('certificateTypeId', String(targetCertTypeId));
      if (targetCertTypeCode) q.set('certificateTypeCode', targetCertTypeCode);

      // Certificate Number / Permit No
      if (_record?.permitNo) {
        q.set('certificateNumber', _record.permitNo);
      }

      // Property Certificate ID
      if (_record?.propertyCertificateId) {
        q.set('propertyCertificateId', String(_record.propertyCertificateId));
      }

      // Unit numbers if unit level
      if (targetLevel === 'Unit' && _record?.applicableToLabel) {
        q.set('unitNo', _record.applicableToLabel);
      }

      q.set('returnTab', 'apartment');
      q.set('from', 'apartment');

      router.push(`/${locale}/property-tax/ptis/QuickDataEntry/${targetPropId}/Building?${q.toString()}`);
    },
    [propertyId, wingDetailsId, societyDetailId, wardNo, wardId, propertyNo, wingName, selectedLevel, selectedCertType, rows, locale, router]
  );

  const handleViewDocument = useCallback(
    async (record: BuildingPermissionRecord, rowKey?: string) => {
      if (!record.documentGuid) {
        // Navigate to edit page to view or upload
        handleEditRecord(record);
        return;
      }

      const key = rowKey || String(record.id || `${record.permitNo}-${record.certificateTypeId}`);
      setActiveViewingKey(key);
      try {
        const res = await getDocumentBlobUrl(record.documentGuid, locale);
        const isImg = res.contentType?.toLowerCase().startsWith('image/');
        const defaultExt = isImg
          ? (res.contentType.toLowerCase().includes('png') ? 'png' : 'jpg')
          : 'pdf';
        const resolvedName = record.fileName || `${record.permitNo}.${defaultExt}`;
        setViewerData({
          isOpen: true,
          url: res.url,
          name: resolvedName,
          label: record.permitNo,
          contentType: res.contentType,
        });
      } catch (err: unknown) {
        toast.error(
          err instanceof Error
            ? err.message
            : t('buildingPermission.viewDocumentError') || 'Failed to view document'
        );
      } finally {
        setActiveViewingKey(null);
      }
    },
    [locale, handleEditRecord, t]
  );


  const renderLevelBadge = (row: BuildingPermissionRecord) => {
    const lvl = (row.level || 'Apartment').toLowerCase();
    if (lvl.includes('apartment')) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <Building2 className="w-2.5 h-2.5 text-slate-500 shrink-0" />
          <span>{t('buildingPermission.levels.apartment') || 'Apartment Level'}</span>
        </span>
      );
    }
    if (lvl.includes('wing')) {
      const rawWing = (row.applicableToLabel || row.wingName || '').trim();
      const wingText = rawWing
        ? /wing/i.test(rawWing)
          ? rawWing
          : `Wing ${rawWing}`
        : t('buildingPermission.levels.wing') || 'Wing Level';

      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Layers className="w-2.5 h-2.5 text-purple-500 shrink-0" />
          <span>{wingText}</span>
        </span>
      );
    }
    if (lvl.includes('unit')) {
      const unitsList = (row.coveredUnitNumbers && row.coveredUnitNumbers.length > 0)
        ? row.coveredUnitNumbers.join(' ')
        : (row.applicableToLabel || '').trim();
      const unitText = unitsList
        ? /unit/i.test(unitsList)
          ? unitsList
          : `Unit ${unitsList}`
        : t('buildingPermission.levels.unit') || 'Unit Level';

      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Home className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
          <span>{unitText}</span>
        </span>
      );
    }
    if (lvl.includes('floor')) {
      const rawFloor = (row.applicableToLabel || '').trim();
      const floorText = rawFloor
        ? /floor/i.test(rawFloor)
          ? rawFloor
          : `Floor ${rawFloor}`
        : t('buildingPermission.levels.floor') || 'Floor Level';

      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Layers className="w-2.5 h-2.5 text-amber-500 shrink-0" />
          <span>{floorText}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        {row.level}
      </span>
    );
  };


  return (
    <div
      className={cn(
        'w-full bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 sm:p-3.5 flex flex-col gap-2.5 font-sans transition-all',
        className
      )}
    >
      {/* Header Bar */}
      <div className={cn('flex items-center justify-between gap-2.5 flex-wrap', isExpanded && 'border-b border-slate-100 pb-2.5')}>
        <div
          className="flex items-center gap-2 select-none cursor-pointer group"
          onClick={toggleExpand}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleExpand();
            }
          }}
          aria-expanded={isExpanded}
        >
          <Building2 className="w-4 h-4 text-blue-700 shrink-0" />
          <h2 className="text-xs sm:text-[13px] font-black text-blue-950 uppercase tracking-wide select-none">
            {t('buildingPermission.title') || 'BUILDING PERMISSION RECORDS'}
          </h2>
          <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
            {isExpanded ? <ChevronDown size={15} strokeWidth={2.5} /> : <ChevronRight size={15} strokeWidth={2.5} />}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleEditRecord()}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
            title={t('buildingPermission.actions.edit') || 'Edit Building Permission'}
          >
            <Pencil className="w-3 h-3" />
            <span>{t('buildingPermission.actions.edit') || 'Edit'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <>
          {/* Filters Bar: Compact unified toolbar */}
          {rows.length > 0 && (
            <div className="flex items-center justify-between gap-2.5 bg-slate-50/80 p-1.5 px-2.5 rounded-lg border border-slate-200/70 flex-wrap">
              {/* Left: Certificate Type Filter Dropdown */}
              {certificateTypeOptions.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 select-none">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {t('buildingPermission.filters') || 'FILTERS'}:
                  </span>
                  <div className="w-60 sm:w-68">
                    <Select
                      options={certificateTypeOptions}
                      value={selectedCertTypeValue}
                      onChange={(_, val) => handleFilterSelect(val)}
                      selectSize="sm"
                      className="text-xs font-medium"
                      placeholder={t('buildingPermission.selectCertificateType') || 'Select Certificate'}
                      ariaLabel={t('buildingPermission.allCertificates') || 'All Certificates'}
                    />
                  </div>
                </div>
              )}

              {/* Right / Corner: Scope Filters & Clear Filter */}
              <div className="flex items-center gap-2 ml-auto shrink-0 flex-wrap">
                {/* Clear Filter action */}
                {(selectedCertType !== 'ALL' || selectedLevel !== 'ALL') && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {t('buildingPermission.clearFilter') || 'Clear Filter'}
                  </button>
                )}

                {/* Scope Filter Segmented Bar (matching QuickDataEntry design style) */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <Button
                    size="xs"
                    variant={selectedLevel === 'ALL' ? 'primary' : 'ghost'}
                    onClick={() => setSelectedLevel('ALL')}
                    className={cn(
                      'font-bold cursor-pointer rounded-lg transition-all',
                      selectedLevel === 'ALL'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                    )}
                  >
                    {t('buildingPermission.levels.allLevels') || t('buildingPermission.levels.all') || 'All Scopes'} ({levelCounts.all})
                  </Button>

                  {(Boolean(societyDetailId && Number(societyDetailId) > 0) || levelCounts.apartment > 0) && (
                    <Button
                      size="xs"
                      variant={selectedLevel.toLowerCase() === 'apartment' ? 'primary' : 'ghost'}
                      icon={Building2}
                      onClick={() => handleLevelSelect('Apartment')}
                      className={cn(
                        'font-bold cursor-pointer rounded-lg transition-all',
                        selectedLevel.toLowerCase() === 'apartment'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                      )}
                    >
                      {t('buildingPermission.levels.apartment') || 'Apartment Level'} ({levelCounts.apartment})
                    </Button>
                  )}

                  {(Boolean(wingDetailsId && Number(wingDetailsId) > 0) || levelCounts.wing > 0 || Boolean(societyDetailId && Number(societyDetailId) > 0)) && (
                    <Button
                      size="xs"
                      variant={selectedLevel.toLowerCase() === 'wing' ? 'primary' : 'ghost'}
                      icon={Home}
                      onClick={() => handleLevelSelect('Wing')}
                      className={cn(
                        'font-bold cursor-pointer rounded-lg transition-all',
                        selectedLevel.toLowerCase() === 'wing'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                      )}
                    >
                      {t('buildingPermission.levels.wing') || 'Wing Level'} ({levelCounts.wing})
                    </Button>
                  )}

                  <Button
                    size="xs"
                    variant={selectedLevel.toLowerCase() === 'unit' ? 'primary' : 'ghost'}
                    icon={Store}
                    onClick={() => handleLevelSelect('Unit')}
                    className={cn(
                      'font-bold cursor-pointer rounded-lg transition-all',
                      selectedLevel.toLowerCase() === 'unit'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                    )}
                  >
                    {t('buildingPermission.levels.unit') || 'Unit Level'} ({levelCounts.unit})
                  </Button>

                  {hasFloorLevel && (
                    <Button
                      size="xs"
                      variant={selectedLevel.toLowerCase() === 'floor' ? 'primary' : 'ghost'}
                      icon={Layers}
                      onClick={() => handleLevelSelect('Floor')}
                      className={cn(
                        'font-bold cursor-pointer rounded-lg transition-all',
                        selectedLevel.toLowerCase() === 'floor'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                      )}
                    >
                      {t('buildingPermission.levels.floor') || 'Floor Level'} ({levelCounts.floor})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {rows.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-300 gap-2">
              <AlertCircle className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-bold text-slate-700">
                {t('buildingPermission.noDataAvailable') || 'No building permission or certificate records available'}
              </p>
              <p className="text-[11px] text-slate-500 max-w-md">
                {t('buildingPermission.noDataDescription') ||
                  'No records have been filed yet for this apartment or wing. You can add building permissions and upload certificates through Quick Data Entry.'}
              </p>
              <button
                type="button"
                onClick={() => handleEditRecord()}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0047cc] hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('buildingPermission.addPermission') || 'Add Building Permission'}</span>
              </button>
            </div>
          ) : displayedRows.length === 0 ? (
            /* Filter Empty State */
            <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-300 gap-2">
              <AlertCircle className="w-7 h-7 text-slate-400" />
              <p className="text-xs font-bold text-slate-700">
                {t('buildingPermission.noRecordsForFilter') || 'No records found for this certificate type'}
              </p>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              >
                {t('buildingPermission.clearFilter') || 'Clear Filter'}
              </button>
            </div>
          ) : (
        /* Table Section */
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[224px] border border-slate-200/80 rounded-lg custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200/80 shadow-2xs">
              <tr className="bg-slate-50">
                <th className="py-2.5 px-3 font-bold text-xs text-slate-600 uppercase tracking-wider bg-slate-50">
                  {t('buildingPermission.columns.certificate') || 'CERTIFICATE'}
                </th>
                <th className="py-2.5 px-3 font-bold text-xs text-slate-600 uppercase tracking-wider bg-slate-50">
                  {t('buildingPermission.columns.certificateNumber') || 'CERTIFICATE NUMBER'}
                </th>
                <th className="py-2.5 px-3 font-bold text-xs text-slate-600 uppercase tracking-wider bg-slate-50">
                  {t('buildingPermission.columns.issueDate') || 'ISSUE DATE'}
                </th>
                <th className="py-2.5 px-3 font-bold text-xs text-slate-600 uppercase tracking-wider text-center bg-slate-50">
                  {t('buildingPermission.columns.action') || 'ACTION'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {displayedRows.map((row, index) => {
                const rowKey = String(
                  row.id || `cert-${row.certificateTypeId || 0}-${row.permitNo}-${index}`
                );
                const isViewingThis = activeViewingKey === rowKey;

                return (
                  <tr key={rowKey} className="hover:bg-slate-50/60 transition-colors">
                    {/* Certificate */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5 items-start">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-slate-900">
                            {row.certificateTypeName || row.certificateTypeCode || t('buildingPermission.columns.certificate') || 'Certificate'}
                          </span>
                          {row.certificateTypeCode && row.certificateTypeName && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                              {row.certificateTypeCode}
                            </span>
                          )}
                          {row.taxApplied && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                              {t('buildingPermission.statuses.taxApplied') || 'Tax Applied'}
                            </span>
                          )}
                        </div>
                        {renderLevelBadge(row)}
                      </div>
                    </td>

                    {/* Certificate Number */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={isViewingThis}
                        onClick={() => handleViewDocument(row, rowKey)}
                        className="font-bold text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 text-left bg-transparent border-0 p-0"
                        title={
                          row.documentGuid
                            ? t('buildingPermission.actions.viewDocument') || 'View Document'
                            : t('buildingPermission.actions.edit') || 'Edit Building Permission'
                        }
                      >
                        {isViewingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                        <span>{row.permitNo}</span>
                      </button>
                    </td>

                    {/* Issue Date */}
                    <td className="py-2 px-3 whitespace-nowrap text-slate-700 font-medium text-xs">
                      {row.sanctionDate}
                    </td>

                    {/* Action */}
                    <td className="py-2 px-3 whitespace-nowrap text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          disabled={!row.documentGuid || isViewingThis}
                          onClick={() => handleViewDocument(row, rowKey)}
                          className={cn(
                            'p-1.5 rounded-md transition-colors inline-flex items-center justify-center border-0 bg-transparent',
                            row.documentGuid
                              ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 cursor-pointer'
                              : 'text-slate-300 opacity-40 cursor-not-allowed'
                          )}
                          title={
                            row.documentGuid
                              ? t('buildingPermission.actions.viewDocument') || 'View Document'
                              : t('buildingPermission.noDocumentAttached') || 'No document attached'
                          }
                          aria-label={`View document ${row.permitNo}`}
                        >
                          {isViewingThis ? (
                            <Loader2 className="w-4.5 h-4.5 animate-spin text-emerald-600" />
                          ) : (
                            <Eye className="w-4.5 h-4.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditRecord(row)}
                          className="p-1.5 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer inline-flex items-center justify-center border-0 bg-transparent"
                          title={t('buildingPermission.actions.edit') || 'Edit Building Permission'}
                          aria-label={`Edit ${row.permitNo}`}
                        >
                          <Pencil className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}

      {/* Document Viewer Modal */}
      {viewerData && (
        <DocumentViewerModal
          isOpen={viewerData.isOpen}
          onClose={closeViewer}
          fileUrl={viewerData.url}
          fileName={viewerData.name}
          label={viewerData.label}
          contentType={viewerData.contentType}
        />
      )}
    </div>
  );
};

export default BuildingPermissionRecords;
