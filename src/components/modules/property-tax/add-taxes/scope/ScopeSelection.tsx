'use client';

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  ArrowRightLeft,
  Building2,
  ChevronDown,
  Globe,
  House,
  Info,
  MapPin,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AddTaxesConsoleApi, OperationScope, PropertySearchResult, ScopeOption, ScopeType, WardScopeOption } from '@/types/add-taxes.types';
import { getBuildingsByWardAction, searchPropertiesAction } from '@/app/[locale]/property-tax/add-taxes/actions';

interface Props {
  api: AddTaxesConsoleApi;
}

const SCOPE_ICONS: Record<ScopeType, React.ReactNode> = {
  all: <Globe className="h-5 w-5" />,
  zone: <MapPin className="h-5 w-5" />,
  ward: <Building2 className="h-5 w-5" />,
  building: <Building2 className="h-5 w-5" />,
  property: <House className="h-5 w-5" />,
  range: <ArrowRightLeft className="h-5 w-5" />,
};

const SCOPE_INDICES: Record<ScopeType, string> = {
  all: '01',
  zone: '02',
  ward: '03',
  building: '04',
  property: '05',
  range: '06',
};


function ScopeModeButton({
  scopeKey,
  active,
  onClick,
  t,
}: {
  scopeKey: ScopeType;
  active: boolean;
  onClick: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-all',
        active
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:bg-blue-50/50',
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
          active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600',
        )}
        aria-hidden="true"
      >
        {SCOPE_INDICES[scopeKey]}
      </span>
      <span className="text-current">{SCOPE_ICONS[scopeKey]}</span>
      <span className="text-xs font-semibold leading-tight">{t(`scope.modes.${scopeKey}`)}</span>
      <span className="text-xs text-gray-400 leading-tight">{t(`scope.modes.subtitles.${scopeKey}`)}</span>
    </button>
  );
}

function AllScopePanel({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-3">
      <Globe className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
      <div>
        <p className="text-sm font-semibold text-green-800">{t('scope.panels.allMsg')}</p>
        <p className="text-xs text-green-700">{t('scope.panels.allDesc')}</p>
      </div>
    </div>
  );
}

function ZoneScopePanel({ scope, setScope, t, zones, propertyTypes }: { scope: OperationScope; setScope: (s: OperationScope) => void; t: ReturnType<typeof useTranslations>; zones: ScopeOption[]; propertyTypes: ScopeOption[] }) {
  const [zoneSearch, setZoneSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedZoneIds = scope.zoneIds ?? [];
  const allSelected = zones.length > 0 && selectedZoneIds.length === zones.length;

  const toggleAll = () => {
    setScope({ ...scope, zoneIds: allSelected ? [] : zones.map((z) => Number(z.value)) });
  };

  const toggleZone = (zoneId: number) => {
    const next = selectedZoneIds.includes(zoneId)
      ? selectedZoneIds.filter((id) => id !== zoneId)
      : [...selectedZoneIds, zoneId];
    setScope({ ...scope, zoneIds: next });
  };

  const filteredZones = zones.filter((z) =>
    z.label.toLowerCase().includes(zoneSearch.toLowerCase()),
  );

  const triggerLabel = allSelected
    ? t('scope.fields.allZoneNode')
    : selectedZoneIds.length > 0
      ? t('scope.fields.zonesSelected', { count: selectedZoneIds.length })
      : t('scope.fields.selectZones');

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Zone — dropdown with search + all-select + single-column list */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">
          {t('scope.fields.zoneNode')} <sup className="text-red-500">{t('scope.fields.required')}</sup>
        </label>
        <div
          className="relative"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDropdownOpen(false);
            }
          }}
        >
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className={cn(
              'flex w-full items-center justify-between rounded-md border px-3 py-1.5 text-sm transition-colors',
              dropdownOpen
                ? 'border-blue-500 ring-1 ring-blue-500'
                : 'border-gray-300 hover:border-gray-400',
              selectedZoneIds.length > 0 ? 'text-gray-900' : 'text-gray-400',
            )}
          >
            <span className="min-w-0 flex-1 truncate text-left">{triggerLabel}</span>
            <ChevronDown className={cn('ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-150', dropdownOpen && 'rotate-180')} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-0.5 w-full rounded-md border border-gray-200 bg-white shadow-lg" onMouseDown={(e) => e.preventDefault()}>
              {/* Search */}
              <div className="border-b border-gray-100 px-2 py-1.5">
                <input
                  type="text"
                  value={zoneSearch}
                  onChange={(e) => setZoneSearch(e.target.value)}
                  placeholder={t('scope.fields.zoneSearch')}
                  className="w-full text-xs text-gray-900 outline-none placeholder:text-gray-400"
                  autoFocus
                />
              </div>
              {/* All Zone/Node */}
              <label className="flex cursor-pointer items-center gap-2 border-b border-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-3 w-3 rounded border-gray-300"
                />
                {t('scope.fields.allZoneNode')}
              </label>
              {/* Single-column list — scrollable */}
              <div className="max-h-48 overflow-y-auto">
                {filteredZones.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-gray-400">{t('scope.fields.noZones')}</p>
                ) : (
                  filteredZones.map((z) => (
                    <label
                      key={z.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 border-b border-gray-50 px-2 py-1.5 text-xs last:border-b-0 transition-colors',
                        selectedZoneIds.includes(Number(z.value))
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedZoneIds.includes(Number(z.value))}
                        onChange={() => toggleZone(Number(z.value))}
                        className="h-3 w-3 shrink-0 rounded border-gray-300"
                      />
                      <span className="min-w-0 flex-1 truncate">{z.label}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected chips — hidden when all are selected */}
        {selectedZoneIds.length > 0 && !allSelected && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {selectedZoneIds.map((id) => {
              const zone = zones.find((z) => Number(z.value) === id);
              return (
                <span key={id} className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                  {zone?.label ?? String(id)}
                  <button
                    type="button"
                    onClick={() => toggleZone(id)}
                    className="ml-0.5 rounded-full hover:bg-blue-200"
                    aria-label={`Remove ${zone?.label ?? id}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Property type — single select */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">{t('scope.fields.propertyType')}</label>
        <select
          value={scope.propertyTypeId?.toString() ?? ''}
          onChange={(e) => setScope({ ...scope, propertyTypeId: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">{t('scope.fields.allTypes')}</option>
          {propertyTypes.map((pt) => (
            <option key={pt.value} value={pt.value}>{pt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function WardScopePanel({
  scope, setScope, t, propertyTypes, zones, wards,
}: {
  scope: OperationScope;
  setScope: (s: OperationScope) => void;
  t: ReturnType<typeof useTranslations>;
  propertyTypes: ScopeOption[];
  zones: ScopeOption[];
  wards: WardScopeOption[];
}) {
  const [zoneFilter, setZoneFilter] = useState<number[]>([]);
  const [zoneSearch, setZoneSearch] = useState('');
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  const [wardSearch, setWardSearch] = useState('');
  const [wardDropdownOpen, setWardDropdownOpen] = useState(false);

  const selectedWards = scope.wardIds ?? [];

  // ── Zone dropdown state ───────────────────────────────────────────────────
  const allZonesSelected = zones.length > 0 && zoneFilter.length === zones.length;
  const filteredZoneOptions = zones.filter((z) =>
    z.label.toLowerCase().includes(zoneSearch.toLowerCase()),
  );
  const zoneTriggerLabel = allZonesSelected
    ? t('scope.fields.allZoneNode')
    : zoneFilter.length > 0
      ? t('scope.fields.zonesSelected', { count: zoneFilter.length })
      : t('scope.fields.selectZones');

  const toggleAllZones = () => {
    const next = allZonesSelected ? [] : zones.map((z) => Number(z.value));
    setZoneFilter(next);
    if (next.length > 0) {
      const validWardIds = wards.filter((w) => next.includes(Number(w.zoneId))).map((w) => Number(w.value));
      setScope({ ...scope, wardIds: selectedWards.filter((id) => validWardIds.includes(id)) });
    }
  };

  const toggleZoneFilter = (zoneId: number) => {
    const next = zoneFilter.includes(zoneId)
      ? zoneFilter.filter((id) => id !== zoneId)
      : [...zoneFilter, zoneId];
    setZoneFilter(next);
    if (next.length > 0) {
      const validWardIds = wards.filter((w) => next.includes(Number(w.zoneId))).map((w) => Number(w.value));
      setScope({ ...scope, wardIds: selectedWards.filter((id) => validWardIds.includes(id)) });
    }
  };

  // ── Ward dropdown state ───────────────────────────────────────────────────
  const visibleWards = zoneFilter.length > 0
    ? wards.filter((w) => zoneFilter.includes(Number(w.zoneId)))
    : wards;

  const allWardsSelected = visibleWards.length > 0 && visibleWards.every((w) => selectedWards.includes(Number(w.value)));
  const filteredWardOptions = visibleWards.filter((w) =>
    w.label.toLowerCase().includes(wardSearch.toLowerCase()),
  );
  const wardTriggerLabel = allWardsSelected && visibleWards.length > 0
    ? t('scope.fields.allWards')
    : selectedWards.length > 0
      ? t('scope.fields.wardsSelected', { count: selectedWards.length })
      : t('scope.fields.noWardsSelected');

  const toggleAllWards = () => {
    const next = allWardsSelected
      ? []
      : visibleWards.map((w) => Number(w.value));
    setScope({ ...scope, wardIds: next });
  };

  const toggleWard = (wardId: number) => {
    const next = selectedWards.includes(wardId)
      ? selectedWards.filter((id) => id !== wardId)
      : [...selectedWards, wardId];
    setScope({ ...scope, wardIds: next });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 3-column row: Zone / Node — Ward / Sector — Property Type */}
      <div className="grid grid-cols-3 gap-3">

        {/* Zone / Node */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            {t('scope.fields.zoneNode')}
          </label>
          <div
            className="relative"
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setZoneDropdownOpen(false); }}
          >
            <button
              type="button"
              onClick={() => setZoneDropdownOpen((o) => !o)}
              className={cn(
                'flex w-full items-center justify-between rounded-md border px-3 py-1.5 text-sm transition-colors',
                zoneDropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300 hover:border-gray-400',
                zoneFilter.length > 0 ? 'text-gray-900' : 'text-gray-400',
              )}
            >
              <span className="min-w-0 flex-1 truncate text-left">{zoneTriggerLabel}</span>
              <ChevronDown className={cn('ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-150', zoneDropdownOpen && 'rotate-180')} />
            </button>
            {zoneDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-0.5 w-full rounded-md border border-gray-200 bg-white shadow-lg" onMouseDown={(e) => e.preventDefault()}>
                <div className="border-b border-gray-100 px-2 py-1.5">
                  <input
                    type="text"
                    value={zoneSearch}
                    onChange={(e) => setZoneSearch(e.target.value)}
                    placeholder={t('scope.fields.zoneSearch')}
                    className="w-full text-xs text-gray-900 outline-none placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 border-b border-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  <input type="checkbox" checked={allZonesSelected} onChange={toggleAllZones} className="h-3 w-3 rounded border-gray-300" />
                  {t('scope.fields.allZoneNode')}
                </label>
                <div className="max-h-48 overflow-y-auto">
                  {filteredZoneOptions.length === 0 ? (
                    <p className="px-2 py-1.5 text-xs text-gray-400">{t('scope.fields.noZones')}</p>
                  ) : filteredZoneOptions.map((z) => (
                    <label
                      key={z.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 border-b border-gray-50 px-2 py-1.5 text-xs last:border-b-0 transition-colors',
                        zoneFilter.includes(Number(z.value)) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={zoneFilter.includes(Number(z.value))}
                        onChange={() => toggleZoneFilter(Number(z.value))}
                        className="h-3 w-3 shrink-0 rounded border-gray-300"
                      />
                      <span className="min-w-0 flex-1 truncate">{z.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ward / Sector */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            {t('scope.fields.wardSector')} <sup className="text-red-500">{t('scope.fields.required')}</sup>
          </label>
          <div
            className="relative"
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setWardDropdownOpen(false); }}
          >
            <button
              type="button"
              onClick={() => setWardDropdownOpen((o) => !o)}
              className={cn(
                'flex w-full items-center justify-between rounded-md border px-3 py-1.5 text-sm transition-colors',
                wardDropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300 hover:border-gray-400',
                selectedWards.length > 0 ? 'text-gray-900' : 'text-gray-400',
              )}
            >
              <span className="min-w-0 flex-1 truncate text-left">{wardTriggerLabel}</span>
              <ChevronDown className={cn('ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-150', wardDropdownOpen && 'rotate-180')} />
            </button>
            {wardDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-0.5 w-full rounded-md border border-gray-200 bg-white shadow-lg" onMouseDown={(e) => e.preventDefault()}>
                <div className="border-b border-gray-100 px-2 py-1.5">
                  <input
                    type="text"
                    value={wardSearch}
                    onChange={(e) => setWardSearch(e.target.value)}
                    placeholder={t('scope.fields.wardSearch')}
                    className="w-full text-xs text-gray-900 outline-none placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 border-b border-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  <input type="checkbox" checked={allWardsSelected} onChange={toggleAllWards} className="h-3 w-3 rounded border-gray-300" />
                  {t('scope.fields.allWards')}
                </label>
                <div className="max-h-48 overflow-y-auto">
                  {filteredWardOptions.length === 0 ? (
                    <p className="px-2 py-1.5 text-xs text-gray-400">{t('scope.fields.noWards')}</p>
                  ) : filteredWardOptions.map((w) => (
                    <label
                      key={w.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 border-b border-gray-50 px-2 py-1.5 text-xs last:border-b-0 transition-colors',
                        selectedWards.includes(Number(w.value)) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedWards.includes(Number(w.value))}
                        onChange={() => toggleWard(Number(w.value))}
                        className="h-3 w-3 shrink-0 rounded border-gray-300"
                      />
                      <span className="min-w-0 flex-1 truncate">{w.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">{t('scope.fields.propertyType')}</label>
          <select
            value={scope.propertyTypeId?.toString() ?? ''}
            onChange={(e) => setScope({ ...scope, propertyTypeId: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">{t('scope.fields.allTypes')}</option>
            {propertyTypes.map((pt) => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected chips row */}
      {(zoneFilter.length > 0 && !allZonesSelected) || selectedWards.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {zoneFilter.length > 0 && !allZonesSelected && zoneFilter.map((id) => {
            const zone = zones.find((z) => Number(z.value) === id);
            return (
              <span key={`z-${id}`} className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                {zone?.label ?? String(id)}
                <button type="button" onClick={() => toggleZoneFilter(id)} className="ml-0.5 rounded-full hover:bg-indigo-200" aria-label={`Remove zone ${zone?.label ?? id}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          {selectedWards.map((id) => {
            const ward = wards.find((w) => Number(w.value) === id);
            return (
              <span key={`w-${id}`} className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                {ward?.label ?? String(id)}
                <button type="button" onClick={() => toggleWard(id)} className="ml-0.5 rounded-full hover:bg-blue-200" aria-label={`Remove ward ${ward?.label ?? id}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function BuildingScopePanel({
  scope, setScope, t, zones, wards,
}: {
  scope: OperationScope;
  setScope: (s: OperationScope) => void;
  t: ReturnType<typeof useTranslations>;
  zones: ScopeOption[];
  wards: WardScopeOption[];
}) {
  const [buildingOptions, setBuildingOptions] = useState<ScopeOption[]>([]);
  const [buildingSearch, setBuildingSearch] = useState(scope.building ?? '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoadingBuildings, startBuildingTransition] = useTransition();

  const filteredWards = scope.zoneId
    ? wards.filter((w) => w.zoneId === String(scope.zoneId))
    : wards;

  const filteredBuildings = buildingOptions.filter((opt) =>
    opt.label.toLowerCase().includes(buildingSearch.toLowerCase()),
  );

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = Number(e.target.value) || undefined;
    setScope({ ...scope, zoneId, wardIds: [], building: undefined });
    setBuildingOptions([]);
    setBuildingSearch('');
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardId = e.target.value ? Number(e.target.value) : undefined;
    setScope({ ...scope, wardIds: wardId ? [wardId] : [], building: undefined });
    setBuildingOptions([]);
    setBuildingSearch('');
    if (wardId) {
      startBuildingTransition(async () => {
        const result = await getBuildingsByWardAction(wardId);
        if (result.success) setBuildingOptions(result.data);
      });
    }
  };

  const handleBuildingSelect = (opt: ScopeOption) => {
    setScope({ ...scope, building: opt.value });
    setBuildingSearch(opt.label);
    setDropdownOpen(false);
  };

  const wardId = scope.wardIds?.[0];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Zone */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">
          {t('scope.fields.zoneNode')} <sup className="text-red-500">*</sup>
        </label>
        <select
          value={scope.zoneId ?? ''}
          onChange={handleZoneChange}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">{t('scope.fields.selectZone')}</option>
          {zones.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
        </select>
      </div>

      {/* Ward — filtered by zone */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">
          {t('scope.fields.wardSector')} <sup className="text-red-500">*</sup>
        </label>
        <select
          value={wardId ?? ''}
          onChange={handleWardChange}
          disabled={filteredWards.length === 0}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">{t('scope.fields.selectWard')}</option>
          {filteredWards.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
        </select>
      </div>

      {/* Building — searchable combobox from PropertyMast */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">
          {t('scope.fields.building')} <sup className="text-red-500">*</sup>
        </label>
        <div className="relative">
          <input
            type="text"
            value={buildingSearch}
            onChange={(e) => { setBuildingSearch(e.target.value); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            placeholder={
              isLoadingBuildings
                ? t('scope.fields.buildingLoading')
                : wardId
                  ? t('scope.fields.buildingPlaceholder')
                  : t('scope.fields.buildingSelectWardFirst')
            }
            disabled={!wardId || isLoadingBuildings}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
          {dropdownOpen && filteredBuildings.length > 0 && (
            <div className="absolute z-10 mt-0.5 max-h-40 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-md">
              {filteredBuildings.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={() => handleBuildingSelect(opt)}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700',
                    scope.building === opt.value && 'bg-blue-50 font-medium text-blue-700',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PropertyScopePanel({ scope, setScope, t }: { scope: OperationScope; setScope: (s: OperationScope) => void; t: ReturnType<typeof useTranslations> }) {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<PropertySearchResult[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearching, startSearchTransition] = useTransition();
  const [selectedProperties, setSelectedProperties] = useState<PropertySearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedIds = scope.propertyIds ?? [];

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setDropdownOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startSearchTransition(async () => {
        const result = await searchPropertiesAction(value.trim());
        if (result.success) setSearchResults(result.data);
        else setSearchResults([]);
      });
    }, 400);
  };

  const addProperty = (prop: PropertySearchResult) => {
    if (selectedIds.includes(prop.id)) return;
    const next = [...selectedProperties, prop];
    setSelectedProperties(next);
    setScope({ ...scope, propertyIds: next.map((p) => p.id) });
    setSearchInput('');
    setSearchResults([]);
    setDropdownOpen(false);
  };

  const removeProperty = (id: number) => {
    const next = selectedProperties.filter((p) => p.id !== id);
    setSelectedProperties(next);
    setScope({ ...scope, propertyIds: next.map((p) => p.id) });
  };

  const showDropdown = dropdownOpen && searchInput.trim().length >= 2;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">
          {t('scope.fields.searchProperty')} <sup className="text-red-500">{t('scope.fields.required')}</sup>
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchInput.trim().length >= 2 && setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            placeholder={t('scope.fields.searchPlaceholder')}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {showDropdown && (
            <div
              className="absolute left-0 top-full z-50 mt-0.5 w-full rounded-md border border-gray-200 bg-white shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              {isSearching ? (
                <p className="px-3 py-2 text-xs text-gray-400">{t('scope.fields.propertySearching')}</p>
              ) : searchResults.length === 0 ? (
                <p className="px-3 py-2 text-xs text-gray-400">{t('scope.fields.propertyNoResults')}</p>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  {searchResults.map((prop) => {
                    const alreadyAdded = selectedIds.includes(prop.id);
                    const meta = [prop.ownerName, prop.mobileNo, prop.upicId].filter(Boolean).join(' · ');
                    return (
                      <button
                        key={prop.id}
                        type="button"
                        onMouseDown={() => !alreadyAdded && addProperty(prop)}
                        className={cn(
                          'flex w-full flex-col border-b border-gray-50 px-3 py-2 text-left last:border-b-0 transition-colors',
                          alreadyAdded
                            ? 'cursor-default bg-gray-50'
                            : 'hover:bg-blue-50',
                        )}
                      >
                        <span className={cn('text-xs font-semibold', alreadyAdded ? 'text-gray-400' : 'text-gray-900')}>
                          {prop.propertyNo}
                          {alreadyAdded && <span className="ml-2 font-normal text-gray-400">({t('scope.fields.alreadyAdded')})</span>}
                        </span>
                        {meta && <span className="text-xs text-gray-500">{meta}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        {searchInput.length > 0 && searchInput.trim().length < 2 && (
          <p className="mt-1 text-xs text-gray-400">{t('scope.fields.propertySearchHint')}</p>
        )}
      </div>

      {/* Selected property chips */}
      {selectedProperties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedProperties.map((prop) => (
            <span
              key={prop.id}
              className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
            >
              <span className="font-medium">{prop.propertyNo}</span>
              {prop.ownerName && <span className="text-blue-500">· {prop.ownerName}</span>}
              <button
                type="button"
                onClick={() => removeProperty(prop.id)}
                className="ml-0.5 rounded-full hover:bg-blue-200"
                aria-label={`Remove ${prop.propertyNo}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RangeScopePanel({ scope, setScope, calculateEligible, t }: { scope: OperationScope; setScope: (s: OperationScope) => void; calculateEligible: () => void; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-md bg-amber-50 p-2.5 text-xs text-amber-700">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          <p className="font-semibold">{t('scope.range.warnTitle')}</p>
          <p>{t('scope.range.warnDesc')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            {t('scope.fields.fromPropertyNo')} <sup className="text-red-500">*</sup>
          </label>
          <input
            type="text"
            value={scope.fromPropertyNo ?? ''}
            onChange={(e) => setScope({ ...scope, fromPropertyNo: e.target.value })}
            placeholder={t('scope.range.fromPlaceholder')}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            {t('scope.fields.toPropertyNo')} <sup className="text-red-500">*</sup>
          </label>
          <input
            type="text"
            value={scope.toPropertyNo ?? ''}
            onChange={(e) => setScope({ ...scope, toPropertyNo: e.target.value })}
            placeholder={t('scope.range.toPlaceholder')}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <button
          type="button"
          onClick={calculateEligible}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('scope.range.calculate')}
        </button>
        <p className="mt-1 text-xs text-gray-500">{t('scope.range.calcNote')}</p>
      </div>
    </div>
  );
}

const VALIDATION_KEYS = ['financeYear', 'scope', 'eligibleRecords', 'permission'] as const;

export function ScopeSelection({ api }: Props) {
  const t = useTranslations('addTaxes');
  const { scopeType, setScopeType, scope, setScope, eligible, isLoadingEligible, calculateEligible, validation, zones, propertyTypes, wards } = api;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900">{t('scope.sectionTitle')}</h2>
        <p className="mt-0.5 text-xs text-gray-500">{t('scope.subtitle')}</p>
      </div>

      {/* Scope mode buttons */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {(['all', 'zone', 'ward', 'building', 'property', 'range'] as ScopeType[]).map((key) => (
          <ScopeModeButton
            key={key}
            scopeKey={key}
            active={scopeType === key}
            onClick={() => { setScopeType(key); setScope({}); }}
            t={t}
          />
        ))}
      </div>

      {/* Scope parameter panel */}
      <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {t('scope.panels.allTitle').replace('No additional parameters are required for this scope', `${t('scope.modes.' + scopeType)} — ${scopeType === 'all' ? t('scope.panels.allTitle') : t(`scope.panels.${scopeType}Title`)}`)}
        </p>
        {scopeType === 'all' && <AllScopePanel t={t} />}
        {scopeType === 'zone' && <ZoneScopePanel scope={scope} setScope={setScope} t={t} zones={zones} propertyTypes={propertyTypes} />}
        {scopeType === 'ward' && <WardScopePanel scope={scope} setScope={setScope} t={t} propertyTypes={propertyTypes} zones={zones} wards={wards} />}
        {scopeType === 'building' && <BuildingScopePanel scope={scope} setScope={setScope} t={t} zones={zones} wards={wards} />}
        {scopeType === 'property' && <PropertyScopePanel scope={scope} setScope={setScope} t={t} />}
        {scopeType === 'range' && <RangeScopePanel scope={scope} setScope={setScope} calculateEligible={calculateEligible} t={t} />}

        {/* Eligible count row (non-range scopes) */}
        {scopeType !== 'range' && (
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={calculateEligible}
              disabled={isLoadingEligible || !api.financeYear}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              {isLoadingEligible ? 'Calculating...' : t('scope.fields.eligibleProperties')}
            </button>
            {eligible !== null && (
              <span className="text-sm font-bold text-gray-900">
                {eligible.toLocaleString()} <span className="text-xs font-normal text-gray-500">{t('scope.eligibleUnit')}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Validation row + CTA */}
      <div className="flex flex-col gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('scope.validation.title')}</p>
          <div className="flex flex-wrap gap-2">
            {VALIDATION_KEYS.map((key) => {
              const ok = validation[`${key}Ok` as keyof typeof validation];
              return (
                <span
                  key={key}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                    ok ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500',
                  )}
                >
                  {ok ? '✓' : '○'} {t(`scope.validation.${key}`)}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">{t('scope.readyRecords')}</p>
            <p className="text-xl font-bold text-gray-900">{(eligible ?? 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">{t('scope.eligibleUnit')}</p>
          </div>
          <button
            type="button"
            onClick={api.openReview}
            disabled={!validation.canExecute}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all',
              validation.canExecute
                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-200 text-gray-400',
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>
              <span className="block">{t('scope.reviewExecute')}</span>
              <span className="block text-xs font-normal opacity-80">{t('scope.reviewSubtitle')}</span>
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
