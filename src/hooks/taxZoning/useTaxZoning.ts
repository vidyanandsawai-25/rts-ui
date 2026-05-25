"use client";

import { useMemo, useState, useRef } from "react";
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { TaxZoning, ZoningRecord, SelectOption, TaxZoningPageProps } from "@/types/taxzoning.types";
import { getPreviewColumns, getTaxZoningColumns } from "@/components/modules/property-tax/taxzoningmaster/TaxZoningColumns";
import { useTaxZoningActions } from "@/hooks/taxZoning/useTaxZoningActions";
import { useTaxZoningFile } from "@/hooks/taxZoning/useTaxZoningFile";

export const useTaxZoning = (props: TaxZoningPageProps) => {
  const { data, pageNumber, pageSize, taxZones, wardsData, allProperties } = props;
  const t = useTranslations('taxZoning');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const REQUIRED_HEADERS = useMemo(() => [
    t('columns.wardNo').toLowerCase(), t('columns.fromProperty').toLowerCase(),
    t('columns.toProperty').toLowerCase(), t('columns.taxZoneNo').toLowerCase(),
  ], [t]);

  const [zone, setZoneState] = useState(searchParams.get("taxZoneId") || "");
  const [ward, setWardState] = useState<string[]>(searchParams.get("wardId") ? [searchParams.get("wardId")!] : []);
  const [fromProps, setFromProps] = useState("");
  const [toProps, setToProps] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const PREVIEW_PAGE_SIZE = 5;
  const [pageSizes, setPageSize] = useState(String(pageSize));
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const zoneOptions = useMemo(() => {
    return taxZones?.items?.map(z => ({ label: String(z.taxZoneNo), value: String(z.id) })) || [];
  }, [taxZones]);

  const wardOptions = useMemo(() => {
    if (!zone || !wardsData?.items) return [];
    return wardsData.items.map(w => ({ label: w.wardNo, value: String(w.id) }));
  }, [zone, wardsData]);

  const propertyOptionsByWard = useMemo(() => {
    if (ward.length !== 1 || !allProperties?.success || !allProperties.data?.items) return [];

    return allProperties.data.items
      .map((i: TaxZoning) => ({
        label: i.propertyNo,
        value: i.propertyNo
      }))
      .filter((v: SelectOption, i: number, a: SelectOption[]) => a.findIndex(t => t.value === v.value) === i);
  }, [ward, allProperties]);

  const records: ZoningRecord[] = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => {
      const taxZoneData = taxZones.items.find(z => z.id === Number(item.taxZoneId));
      return {
        taxZoneId: Number(item.taxZoneId),
        taxZoneNo: taxZoneData?.taxZoneNo || String(item.taxZoneId),
        wardId: Number(item.wardId), wardNo: String(item.wardNo),
        fromProperty: item.fromProperty || "",
        toProperty: item.toProperty || "",
        status: item.isActive ? "Active" : "Inactive",
      };
    });
  }, [data, taxZones]);

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

  const updateUrl = (newZone: string, newWard: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newZone) params.set("taxZoneId", newZone); else params.delete("taxZoneId");
    if (newWard.length === 1) params.set("wardId", newWard[0]); else params.delete("wardId");
    router.replace(`/${locale}/property-tax/taxzone-master/taxzoning?${params.toString()}`);
  };

  const setZone = (val: string) => {
    setZoneState(val);
    updateUrl(val, ward);
  };

  const handleSetWard = (val: string[]) => {
    setWardState(val);
    if (val.length !== 1) {
      setFromProps("");
      setToProps("");
    }
    updateUrl(zone, val);
  };

  const handleSetFromProps = (val: string) => {
    setFromProps(val);
    
    // Validate if toProps is already selected
    if (toProps && val) {
      const from = parseInt(val, 10);
      const to = parseInt(toProps, 10);
      
      if (!isNaN(from) && !isNaN(to) && from > to) {
        toast.error(t('messages.fromPropertyMustBeSmallerThanToProperty'));
      }
    }
  };

  const handleSetToProps = (val: string) => {
    setToProps(val);
    
    // Validate if fromProps is already selected
    if (fromProps && val) {
      const from = parseInt(fromProps, 10);
      const to = parseInt(val, 10);
      
      if (!isNaN(from) && !isNaN(to) && from > to) {
        toast.error(t('messages.fromPropertyMustBeSmallerThanToProperty'));
      }
    }
  };

  const previewData = useMemo(() => {
    if (!zone || ward.length !== 1 || !fromProps || !toProps) return [];
    const from = parseInt(fromProps, 10), to = parseInt(toProps, 10);
    if (isNaN(from) || isNaN(to) || from > to) return [];
    const wardNo = wardsData.items.find(w => String(w.id) === ward[0])?.wardNo || ward[0];
    const taxZoneNo = taxZones.items.find(z => String(z.id) === zone)?.taxZoneNo || zone;
    return Array.from({ length: to - from + 1 }, (_, i) => ({ taxZoneNo: taxZoneNo, wardNo, propertyNo: String(from + i) }));
  }, [zone, ward, fromProps, toProps, wardsData, taxZones]);

  const onFormClear = () => {
    setZoneState(""); setWardState([]); setFromProps(""); setToProps(""); setSubmitted(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("taxZoneId");
    params.delete("wardId");
    router.replace(`/${locale}/property-tax/taxzone-master/taxzoning?${params.toString()}`);
  };
  const isTaxZoneValid = !!zone, isWardValid = ward.length > 0, isPropertyValid = ward.length === 1 ? previewData.length > 0 : true;

  return {
    t, zone, setZone, ward, setWard: handleSetWard, fromProps, setFromProps: handleSetFromProps, toProps, setToProps: handleSetToProps, fileInputRef,
    zoneOptions, wardOptions, propertyOptionsByWard, loading: false, pageSizeOptions: [5, 10, 20, 50, 100],
    pageSizes, currentPage, submitted, saving, previewPage, setPreviewPage, PREVIEW_PAGE_SIZE,
    importedChanges, hasImportedData, tableRecords, previewData,
    pagedPreviewData: useMemo(() => previewData.slice((previewPage - 1) * PREVIEW_PAGE_SIZE, previewPage * PREVIEW_PAGE_SIZE), [previewData, previewPage]),
    columns: useMemo(() => getTaxZoningColumns(t), [t]),
    previewColumns: useMemo(() => getPreviewColumns(t), [t]),
    handleExportCSV: () => handleExportCSV(tableRecords),
    handleImportFile, handleClearImported, isTaxZoneValid, isWardValid, isPropertyValid, onFormClear,
    isFormValid: isTaxZoneValid && isWardValid && isPropertyValid,
    changePage: (p: number) => {
      setCurrentPage(p);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(p));
      params.set("pageSize", pageSizes);
      router.replace(`/${locale}/property-tax/taxzone-master/taxzoning?${params.toString()}`);
    },
    changePageSize: (s: number) => {
      setPageSize(String(s));
      setCurrentPage(1);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      params.set("pageSize", String(s));
      router.replace(`/${locale}/property-tax/taxzone-master/taxzoning?${params.toString()}`);
    },
    handleSubmit: (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); if (isTaxZoneValid && isWardValid && isPropertyValid) handleUpdate({ zone, ward, previewData, records, wardsData, onSuccess: onFormClear }); },
    handleBulkUpdate: () => bulkUpdateAction(importedChanges, () => { setImportedChanges([]); setHasImportedData(false); })
  };
};
