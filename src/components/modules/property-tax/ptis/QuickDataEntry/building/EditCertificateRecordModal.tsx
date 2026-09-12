/* eslint-disable i18next/no-literal-string */
'use client';

import React, { useRef } from 'react';
import {
  X,
  Building2,
  Home,
  Store,
  UploadCloud,
  Check,
  Search,
  Plus,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/common';
import { useTranslations } from 'next-intl';
import {
  useCertificateModalState,
} from '@/hooks/useCertificateModalState';
import type {
  ApplicationLevel,
  CertificateStatus,
  WingOption,
  UnitSelectionItem,
  CertificateTypeMasterOption,
  CertificateData,
} from '@/types/building-permission.types';

export interface EditCertificateRecordModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: {
    level: ApplicationLevel;
    selectedWingDetailId: number | null;
    selectedUnitIds: number[];
    certificateTypeId: number;
    certificateDate: string;
    certificateNumber: string;
    status: CertificateStatus;
    remarks: string;
    attachedFiles: File[];
  }) => void;
  propertyId?: string;
  wings?: WingOption[];
  units?: UnitSelectionItem[];
  certificateTypes?: CertificateTypeMasterOption[];
  initialLevel?: ApplicationLevel;
  initialCertificateTypeId?: number;
  initialData?: CertificateData | null;
  isLoading?: boolean;
}

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  OC: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  CC: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  EB: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  BP: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  SP: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  CM: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  FN: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
};

export function EditCertificateRecordModal({
  open,
  onClose,
  onSave,
  propertyId,
  wings = [],
  units = [],
  certificateTypes = [],
  initialLevel = 'Apartment',
  initialCertificateTypeId = 3,
  initialData = null,
  isLoading = false,
}: EditCertificateRecordModalProps): React.ReactElement | null {
  const t = useTranslations('quickDataEntry');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setStatus,
    remarks,
    attachedFiles,
    setAttachedFiles,
    certificateTypes: activeCertificateTypes,
    availableFloors,
    availableUses,
    filteredUnits,
    isAllUnitsSelected,
    toggleUnitSelection,
    toggleAllUnits,
  } = useCertificateModalState({
    propertyId,
    wings,
    units,
    certificateTypes,
    initialLevel,
    initialCertificateTypeId,
    initialData,
  });

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      level,
      selectedWingDetailId,
      selectedUnitIds: Array.from(selectedUnitIds),
      certificateTypeId: selectedTypeId,
      certificateDate,
      certificateNumber,
      status,
      remarks,
      attachedFiles,
    });
  };

  const badgeStyle = BADGE_COLORS[activeCertificateType?.badgeCode || 'OC'] || {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200 max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-[#1E1E38] px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Plus className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide uppercase">
                {t('building.editCertificateRecordTitle') || 'EDIT CERTIFICATE RECORD'}
              </h2>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                {t('building.editCertificateRecordSubtitle') ||
                  'Specify scope level, certificate reference, and upload supporting files.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-300 hover:text-white" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: SELECT APPLICATION LEVEL */}
          <div className="space-y-4">
            <div className="bg-[#5B50E6] text-white px-4 py-2.5 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  1
                </span>
                <span>SELECT APPLICATION LEVEL</span>
              </div>
              <span className="text-xs text-indigo-100 font-normal">
                Choose where this record should apply
              </span>
            </div>

            {/* Application Level Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Apartment Level Card */}
              <button
                type="button"
                onClick={() => setLevel('Apartment')}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer font-semibold text-sm ${
                  level === 'Apartment'
                    ? 'border-[#5B50E6] bg-[#5B50E6] text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-5 h-5 shrink-0" />
                <span>Apartment Level</span>
              </button>

              {/* Wing Level Card */}
              <button
                type="button"
                onClick={() => setLevel('Wing')}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer font-semibold text-sm ${
                  level === 'Wing'
                    ? 'border-[#5B50E6] bg-[#5B50E6] text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Home className="w-5 h-5 shrink-0" />
                <span>Wing Level</span>
              </button>

              {/* Unit Level Card */}
              <button
                type="button"
                onClick={() => setLevel('Unit')}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer font-semibold text-sm ${
                  level === 'Unit'
                    ? 'border-[#5B50E6] bg-[#5B50E6] text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Store className="w-5 h-5 shrink-0" />
                <span>Unit Level</span>
              </button>
            </div>

            {/* SELECT WING Pills (visible for Wing & Unit levels) */}
            {(level === 'Wing' || level === 'Unit') && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  SELECT WING
                </span>
                <div className="flex flex-wrap gap-3">
                  {wings.length > 0 ? (
                    wings.map((wing) => {
                      const isSelected = selectedWingDetailId === wing.wingDetailId;
                      return (
                        <button
                          key={wing.wingDetailId}
                          type="button"
                          onClick={() => setSelectedWingDetailId(wing.wingDetailId)}
                          className={`px-6 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all cursor-pointer flex-1 sm:flex-initial text-center ${
                            isSelected
                              ? 'border-[#10B981] bg-white text-[#10B981] shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {wing.wingName}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-400 italic">No wings found</div>
                  )}
                </div>
              </div>
            )}

            {/* SELECT UNITS Section (visible for Unit level) */}
            {level === 'Unit' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    SELECT UNITS
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    {selectedUnitIds.size} {selectedUnitIds.size === 1 ? 'unit' : 'units'} selected
                  </span>
                </div>

                {/* Filter Toolbar */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="relative sm:col-span-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search unit or sub-property..."
                      value={unitSearchQuery}
                      onChange={(e) => setUnitSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <select
                    value={wingFilter}
                    onChange={(e) => setWingFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg text-xs px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Wings</option>
                    {wings.map((w) => (
                      <option key={w.wingDetailId} value={w.wingName}>
                        {w.wingName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={floorFilter}
                    onChange={(e) => setFloorFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg text-xs px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Floors</option>
                    {availableFloors.map((fl) => (
                      <option key={fl} value={fl}>
                        {fl}
                      </option>
                    ))}
                  </select>

                  <select
                    value={useFilter}
                    onChange={(e) => setUseFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg text-xs px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Uses</option>
                    {availableUses.map((use) => (
                      <option key={use} value={use}>
                        {use}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Units Selection Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 sticky top-0 uppercase tracking-wider">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isAllUnitsSelected}
                            onChange={toggleAllUnits}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </th>
                        <th className="p-3">UNIT / SUB-PROPERTY</th>
                        <th className="p-3">WING</th>
                        <th className="p-3">FLOOR</th>
                        <th className="p-3">USE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredUnits.length > 0 ? (
                        filteredUnits.map((u) => {
                          const checked = selectedUnitIds.has(u.propertyDetailsId);
                          return (
                            <tr
                              key={u.propertyDetailsId}
                              onClick={() => toggleUnitSelection(u.propertyDetailsId)}
                              className={`hover:bg-indigo-50/50 cursor-pointer transition-colors ${
                                checked ? 'bg-indigo-50/30' : ''
                              }`}
                            >
                              <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleUnitSelection(u.propertyDetailsId)}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                              </td>
                              <td className="p-3 font-semibold text-blue-600">{u.unitNo}</td>
                              <td className="p-3 font-semibold text-slate-700">{u.wingName}</td>
                              <td className="p-3 text-slate-600">{u.floorName}</td>
                              <td className="p-3">
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                  {u.useName || 'Residential'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                            No units match the selected filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: ADD DOCUMENT DETAILS */}
          <div className="space-y-4">
            <div className="bg-[#5B50E6] text-white px-4 py-2.5 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  2
                </span>
                <span>ADD DOCUMENT DETAILS</span>
              </div>
              <span className="text-xs text-indigo-100 font-normal">
                Select a type from the left
              </span>
            </div>

            {/* Split Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Sidebar: Certificate Type Selector */}
              <div className="md:col-span-4 space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50/50 max-h-72 overflow-y-auto">
                {activeCertificateTypes.map((type) => {
                  const isSelected = selectedTypeId === type.certificateTypeId;
                  const colors = BADGE_COLORS[type.badgeCode] || {
                    bg: 'bg-blue-100',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                  };

                  return (
                    <button
                      key={type.certificateTypeId}
                      type="button"
                      onClick={() => setSelectedTypeId(type.certificateTypeId)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/80 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center text-xs font-bold shrink-0`}
                      >
                        {type.badgeCode}
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {type.certificateTypeName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Side: Form Inputs */}
              <div className="md:col-span-8 border border-slate-200 rounded-xl p-5 space-y-4 bg-white">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div
                    className={`w-10 h-10 rounded-full ${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border} flex items-center justify-center font-bold text-sm shrink-0`}
                  >
                    {activeCertificateType?.badgeCode || 'DOC'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      {activeCertificateType?.certificateTypeName || 'Certificate'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Add the date, reference number and{' '}
                      <span className="text-blue-600 font-medium">supporting files</span>.
                    </p>
                  </div>
                </div>

                {/* Inputs Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {activeCertificateType?.certificateTypeName || 'Certificate'} Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={certificateDate}
                        onChange={(e) => setCertificateDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {activeCertificateType?.certificateTypeName || 'Certificate'} Number
                    </label>
                    <input
                      type="text"
                      placeholder={`${activeCertificateType?.badgeCode || 'DOC'}/2024/B-101`}
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Drag & Drop File Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-indigo-50/30 transition-all cursor-pointer text-center group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Supporting documents</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    PDF, JPG, JPEG or PNG · Multiple files allowed
                  </span>
                </div>

                {/* Uploaded files preview list */}
                {attachedFiles.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-600">Attached files:</span>
                    <div className="flex flex-wrap gap-2">
                      {attachedFiles.map((f, i) => (
                        <div
                          key={`${f.name}-${i}`}
                          className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span className="truncate max-w-[150px]">{f.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(i);
                            }}
                            className="text-slate-400 hover:text-red-500 ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Toggle */}
                <div className="pt-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50 max-w-xs">
                    {(['Active', 'Pending', 'Expired'] as CertificateStatus[]).map((st) => {
                      const isSelected = status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatus(st)}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? st === 'Active'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : st === 'Pending'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-rose-500 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="!bg-[#5B50E6] hover:!bg-[#4C42D4] !text-white font-bold px-6 py-2.5 rounded-xl shadow-md gap-2"
            >
              <Check className="w-4 h-4" />
              <span>UPDATE CERTIFICATE RECORD</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
