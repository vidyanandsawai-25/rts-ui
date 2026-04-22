"use client";

import { useMemo, useState, useRef } from "react";
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from "next/navigation";
import { TaxZoning, ZoningRecord, SelectOption, TaxZoningPageProps } from "@/types/taxzoning.types";
import { getPreviewColumns, getTaxZoningColumns } from "@/components/modules/property-tax/taxzoningmaster/TaxZoningColumns";
import { useTaxZoningActions } from "./useTaxZoningActions";
import { useTaxZoningFile } from "./useTaxZoningFile";

export const useTaxZoning = (props: TaxZoningPageProps) => {
  const { data, pageNumber, pageSize, taxZones, wardsData, allProperties } = props;
  const t = useTranslations('taxZoning');
  const locale = useLocale();
  const router = useRouter();

  const REQUIRED_HEADERS = useMemo(() => [
    t('columns.wardNo').toLowerCase(), t('columns.fromProperty').toLowerCase(),
    t('columns.toProperty').toLowerCase(), t('columns.taxZoneNo').toLowerCase(),
  ], [t]);

  const [zone, setZone] = useState("");
  const [ward, setWard] = useState<string[]>([]);
  const [fromProps, setFromProps] = useState("");
  const [toProps, setToProps] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const PREVIEW_PAGE_SIZE = 5;
  const [pageSizes, setPageSize] = useState(String(pageSize));
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const zoneOptions = useMemo(() => {
    return taxZones?.items?.map(z => ({ label: String(z.taxZoneNo), value: String(z.taxZoneId) })) || [];
  }, [taxZones]);
  
  const wardOptions = useMemo(() => {
    if (!zone || !wardsData?.items) return [];
    return wardsData.items.map(w => ({ label: w.wardNo, value: String(w.wardId) }));
  }, [zone, wardsData]);

  const propertyOptionsByWard = useMemo(() => {
    if (ward.length !== 1) return [];
    const wardData = wardsData.items.find(w => String(w.wardId) === ward[0]);
    if (!wardData || !allProperties?.success || !allProperties.data?.items) return [];
    
    return allProperties.data.items
      .filter((i: TaxZoning) => i.wardNo === wardData.wardNo)
      .map((i: TaxZoning) => ({ label: i.propertyNo.padStart(3, "0"), value: i.propertyNo.padStart(3, "0") }))
      .filter((v: SelectOption, i: number, a: SelectOption[]) => a.findIndex(t => t.value === v.value) === i);
  }, [ward, wardsData, allProperties]);

  const records: ZoningRecord[] = useMemo(() => data.map((item) => {
    const taxZoneData = taxZones.items.find(z => z.taxZoneId === Number(item.taxZoneId));
    return {
      taxZoneId: Number(item.taxZoneId),
      taxZoneNo: taxZoneData?.taxZoneNo || String(item.taxZoneId),
      wardId: Number(item.wardId), wardNo: String(item.wardNo),
      fromProperty: item.fromProperty?.padStart(3, "0") || "",
      toProperty: item.toProperty?.padStart(3, "0") || "",
      status: item.isActive ? "Active" : "Inactive",
    };
  }), [data, taxZones]);

  const { importedChanges, hasImportedData, handleExportCSV, handleImportFile, handleClearImported, setImportedChanges, setHasImportedData } = useTaxZoningFile(t, REQUIRED_HEADERS, records, wardsData, taxZones);
  const { saving, handleUpdate, handleBulkUpdate: bulkUpdateAction } = useTaxZoningActions(t);

  const tableRecords = useMemo(() => {
    const combined = [...records];
    importedChanges.forEach(change => {
      const idx = combined.findIndex(r => r.wardId === change.wardId && r.fromProperty === change.fromProperty && r.toProperty === change.toProperty);
      if (idx !== -1) combined[idx] = change; else combined.push(change);
    });
    return combined;
  }, [records, importedChanges]);

  const handleSetWard = (val: string[]) => {
    setWard(val);
    if (val.length !== 1) {
      setFromProps("");
      setToProps("");
    }
  };

  const previewData = useMemo(() => {
    if (!zone || ward.length !== 1 || !fromProps || !toProps) return [];
    const from = parseInt(fromProps, 10), to = parseInt(toProps, 10);
    if (isNaN(from) || isNaN(to) || from > to) return [];
    const wardNo = wardsData.items.find(w => String(w.wardId) === ward[0])?.wardNo || ward[0];
    const taxZoneNo = taxZones.items.find(z => String(z.taxZoneId) === zone)?.taxZoneNo || zone;
    return Array.from({ length: to - from + 1 }, (_, i) => ({ taxZoneNo: taxZoneNo, wardNo, propertyNo: String(from + i).padStart(3, "0") }));
  }, [zone, ward, fromProps, toProps, wardsData, taxZones]);

  const onFormClear = () => { setZone(""); setWard([]); setFromProps(""); setToProps(""); setSubmitted(false); };
  const isTaxZoneValid = !!zone, isWardValid = ward.length > 0, isPropertyValid = ward.length === 1 ? previewData.length > 0 : true;

  return {
    t, zone, setZone, ward, setWard: handleSetWard, fromProps, setFromProps, toProps, setToProps, fileInputRef,
    zoneOptions, wardOptions, propertyOptionsByWard, loading: false, pageSizeOptions: [5, 10, 20, 50, 100],
    pageSizes, currentPage, submitted, saving, previewPage, setPreviewPage, PREVIEW_PAGE_SIZE,
    importedChanges, hasImportedData, tableRecords, previewData,
    pagedPreviewData: useMemo(() => previewData.slice((previewPage - 1) * PREVIEW_PAGE_SIZE, previewPage * PREVIEW_PAGE_SIZE), [previewData, previewPage]),
    columns: useMemo(() => getTaxZoningColumns(t), [t]),
    previewColumns: useMemo(() => getPreviewColumns(t), [t]),
    handleExportCSV: () => handleExportCSV(tableRecords),
    handleImportFile, handleClearImported, isTaxZoneValid, isWardValid, isPropertyValid, onFormClear,
    isFormValid: isTaxZoneValid && isWardValid && isPropertyValid,
    changePage: (p: number) => { setCurrentPage(p); router.replace(`/${locale}/property-tax/taxzoning?page=${p}&pageSize=${pageSizes}`); },
    changePageSize: (s: number) => { setPageSize(String(s)); setCurrentPage(1); router.replace(`/${locale}/property-tax/taxzoning?page=1&pageSize=${s}`); },
    handleSubmit: (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); if (isTaxZoneValid && isWardValid && isPropertyValid) handleUpdate({ zone, ward, previewData, records, wardsData, onSuccess: onFormClear }); },
    handleBulkUpdate: () => bulkUpdateAction(importedChanges, () => { setImportedChanges([]); setHasImportedData(false); })
  };
};
