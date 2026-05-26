"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Building2, Layers } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import {
  Tabs,
  SearchSelect,
  Option,
  Checkbox,
  ValidationMessage,
  CancelButton,
} from "@/components/common";
import type { SearchSelectOption } from "@/components/common";
import { Button } from "@/components/common/ActionButton";
import { useTranslations } from "next-intl";

interface DeletePropertyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wards: Option[];
  properties: SearchSelectOption[];
  onDeleteSingle: (propertyId: string) => void;
  onDeleteBulk: (propertyIds: string[]) => void;
  loading?: boolean;
  selectedWardId?: number | null;
}

export default function DeletePropertyDrawer({
  isOpen,
  onClose,
  properties,
  onDeleteSingle,
  onDeleteBulk,
  loading = false,
}: DeletePropertyDrawerProps) {
  const t = useTranslations("zoneMaster.deleteProperty");
  const [tab, setTab] = useState<"single" | "bulk">("single");

  // Single delete state
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [singleErrors, setSingleErrors] = useState<{ property?: string }>({});

  // Bulk delete state (range-based with SearchSelect)
  const [fromPropertyNo, setFromPropertyNo] = useState<string>("");
  const [toPropertyNo, setToPropertyNo] = useState<string>("");
  const [bulkConfirmed, setBulkConfirmed] = useState(false);
  const [bulkErrors, setBulkErrors] = useState<{ fromProperty?: string; toProperty?: string }>({});

  // Reset all state on tab change
  const handleTabChange = (val: string | number) => {
    setTab(val as "single" | "bulk");
    setSingleErrors({});
    setBulkErrors({});
  };

  // Validate single delete
  const validateSingle = () => {
    const errs: typeof singleErrors = {};
    if (selectedProperties.length === 0) errs.property = t("errors.propertyRequired");
    setSingleErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validate bulk delete
  const validateBulk = () => {
    const errs: typeof bulkErrors = {};
    
    if (!fromPropertyNo) {
      errs.fromProperty = t("errors.fromPropertyRequired");
    }
    if (!toPropertyNo) {
      errs.toProperty = t("errors.toPropertyRequired");
    }
    
    if (fromPropertyNo && toPropertyNo) {
      // Find the property numbers in the list
      const fromProp = properties.find(p => p.value === fromPropertyNo);
      const toProp = properties.find(p => p.value === toPropertyNo);
      
      if (fromProp && toProp) {
        const fromNum = parseInt(fromProp.label);
        const toNum = parseInt(toProp.label);
        
        if (fromNum > toNum) {
          errs.fromProperty = t("errors.fromGreaterThanTo");
        }
      }
    }
    
    setBulkErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDeleteSingle = () => {
    if (!validateSingle()) return;
    if (selectedProperties.length === 1) {
      onDeleteSingle(selectedProperties[0]);
    } else if (selectedProperties.length > 1) {
      onDeleteBulk(selectedProperties);
    }
  };

  const handleDeleteBulk = () => {
    if (!validateBulk()) return;
    
    // Get property IDs in the range
    const fromProp = properties.find(p => p.value === fromPropertyNo);
    const toProp = properties.find(p => p.value === toPropertyNo);
    
    if (!fromProp || !toProp) return;
    
    const from = parseInt(fromProp.label);
    const to = parseInt(toProp.label);
    const propertyIdsInRange: string[] = [];
    
    for (let num = from; num <= to; num++) {
      const prop = properties.find(p => p.label === String(num));
      if (prop) {
        propertyIdsInRange.push(prop.value);
      }
    }
    
    if (propertyIdsInRange.length > 0) {
      onDeleteBulk(propertyIdsInRange);
    }
  };

  const handleClose = () => {
    // Reset all state on close
    setTab("single");
    setSelectedProperties([]);
    setConfirmed(false);
    setSingleErrors({});
    setFromPropertyNo("");
    setToPropertyNo("");
    setBulkConfirmed(false);
    setBulkErrors({});
    onClose();
  };

  // Calculate bulk delete count
  const getBulkDeleteCount = () => {
    if (!fromPropertyNo || !toPropertyNo) return 0;
    
    const fromProp = properties.find(p => p.value === fromPropertyNo);
    const toProp = properties.find(p => p.value === toPropertyNo);
    
    if (!fromProp || !toProp) return 0;
    
    const from = parseInt(fromProp.label);
    const to = parseInt(toProp.label);
    
    if (isNaN(from) || isNaN(to)) return 0;
    
    return Math.abs(to - from) + 1;
  };

  if (!isOpen) return null;

  const bulkDeleteCount = getBulkDeleteCount();

  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      width="md"
      title={
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-red-500 to-red-600 rounded-lg shadow-md text-white shrink-0">
            <Trash2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-red-900">{t("pageTitle")}</h1>
            <p className="text-xs text-slate-500">
              {t("pageSubtitle")}
            </p>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton onClick={handleClose} disabled={loading} />
          {tab === "single" ? (
            <Button
              variant="danger"
              icon={Trash2}
              disabled={!confirmed || loading || selectedProperties.length === 0}
              isLoading={loading}
              onClick={handleDeleteSingle}
            >
              {selectedProperties.length > 1
                ? t("buttons.deleteWithCount", { count: selectedProperties.length })
                : t("buttons.delete")}
            </Button>
          ) : (
            <Button
              variant="danger"
              icon={Trash2}
              disabled={!bulkConfirmed || loading || !fromPropertyNo || !toPropertyNo}
              isLoading={loading}
              onClick={handleDeleteBulk}
            >
              {t("buttons.deleteWithCount", { count: bulkDeleteCount })}
            </Button>
          )}
        </>
      }
    >
      <div className="p-5 space-y-5">

        {/* ── Warning Banner ── */}
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">{t("warning.title")}</p>
            <p className="text-xs text-red-600 mt-0.5">
              {t("warning.description")}
            </p>
          </div>
        </div>

        {/* ── Tab Switcher ── */}
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="pills"
        >
          <Tabs.TabList className="w-full">
            <Tabs.Tab value="single" icon={Building2} className="flex-1 justify-center">
              {t("tabs.single")}
            </Tabs.Tab>
            <Tabs.Tab value="bulk" icon={Layers} className="flex-1 justify-center">
              {t("tabs.bulk")}
            </Tabs.Tab>
          </Tabs.TabList>
        </Tabs>

        {/* ══════════════════════════════════════════
            SINGLE DELETE TAB
        ══════════════════════════════════════════ */}
        {tab === "single" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">

            {/* Property Selection using SearchSelect */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("form.propertiesLabel")} <span className="text-red-500">*</span>
              </label>
              <SearchSelect
                id="propertySelect"
                name="propertySelect"
                options={properties}
                value={selectedProperties[0] || ""}
                onChange={(_, v) => {
                  setSelectedProperties(v ? [v] : []);
                  setSingleErrors((e) => ({ ...e, property: undefined }));
                }}
                placeholder={
                  properties.length === 0
                    ? t("messages.noPropertiesInWard")
                    : t("form.searchPlaceholder")
                }
                disabled={loading || properties.length === 0}
              />
              <ValidationMessage
                message={singleErrors.property}
                visible={!!singleErrors.property}
                type="error"
              />
            </div>

            {/* Selected Property Preview Card */}
            {selectedProperties.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-200">
                <div className="flex h-9 w-9 items-center justify-center bg-red-100 rounded-lg shrink-0">
                  <Building2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-red-500 font-medium uppercase tracking-wide">
                    {t("form.selectedForDeletion")}
                  </p>
                  <p className="text-sm font-semibold text-red-800 truncate">
                    {properties.find((p) => p.value === selectedProperties[0])?.label ?? selectedProperties[0]}
                  </p>
                </div>
              </div>
            )}

            {/* Confirmation Checkbox */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(v as boolean)}
                disabled={loading}
                label={t("form.confirmSingle")}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            BULK DELETE TAB
        ══════════════════════════════════════════ */}
        {tab === "bulk" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">

            {/* Property Number Range Selection using SearchSelect */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.fromPropertyNo")} <span className="text-red-500">*</span>
                </label>
                <SearchSelect
                  id="fromPropertySelect"
                  name="fromPropertySelect"
                  options={properties}
                  value={fromPropertyNo}
                  onChange={(_, v) => {
                    setFromPropertyNo(v || "");
                    setBulkErrors((prev) => ({ ...prev, fromProperty: undefined }));
                  }}
                  placeholder={
                    properties.length === 0
                      ? t("messages.noPropertiesInWard")
                      : t("form.fromPropertyPlaceholder")
                  }
                  disabled={loading || properties.length === 0}
                />
                <ValidationMessage
                  message={bulkErrors.fromProperty}
                  visible={!!bulkErrors.fromProperty}
                  type="error"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.toPropertyNo")} <span className="text-red-500">*</span>
                </label>
                <SearchSelect
                  id="toPropertySelect"
                  name="toPropertySelect"
                  options={properties}
                  value={toPropertyNo}
                  onChange={(_, v) => {
                    setToPropertyNo(v || "");
                    setBulkErrors((prev) => ({ ...prev, toProperty: undefined }));
                  }}
                  placeholder={
                    properties.length === 0
                      ? t("messages.noPropertiesInWard")
                      : t("form.toPropertyPlaceholder")
                  }
                  disabled={loading || properties.length === 0}
                />
                <ValidationMessage
                  message={bulkErrors.toProperty}
                  visible={!!bulkErrors.toProperty}
                  type="error"
                />
              </div>
            </div>

            {/* Range Preview */}
            {fromPropertyNo && toPropertyNo && bulkDeleteCount > 0 && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">
                    {t("form.bulkRangePreview", {
                      from: properties.find(p => p.value === fromPropertyNo)?.label || "",
                      to: properties.find(p => p.value === toPropertyNo)?.label || "",
                      count: bulkDeleteCount
                    })}
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    {t("form.bulkRangeWarning")}
                  </p>
                </div>
              </div>
            )}

            {/* Confirmation Checkbox - only show when count > 0 */}
            {bulkDeleteCount > 0 && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Checkbox
                  checked={bulkConfirmed}
                  onCheckedChange={(v) => setBulkConfirmed(v as boolean)}
                  disabled={loading}
                  label={t("form.confirmBulk", { count: bulkDeleteCount })}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
