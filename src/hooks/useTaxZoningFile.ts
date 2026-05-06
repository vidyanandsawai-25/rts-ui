"use client";

import { useState, ChangeEvent } from "react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { ZoningRecord, TaxZone, Ward } from "@/types/taxzoning.types";
import { PagedResponse } from "@/types/common.types";

export const useTaxZoningFile = (
  t: (key: string, values?: Record<string, string | number>) => string,
  REQUIRED_HEADERS: string[],
  records: ZoningRecord[],
  wardsData: PagedResponse<Ward>,
  taxZones: PagedResponse<TaxZone>
) => {
  const [importedChanges, setImportedChanges] = useState<ZoningRecord[]>([]);
  const [hasImportedData, setHasImportedData] = useState(false);

  const handleExportCSV = (tableRecords: ZoningRecord[]) => {
    if (!tableRecords.length) {
      toast.error(t('messages.noRecordsToExport'));
      return;
    }

    const headers = [t('columns.wardNo'), t('columns.fromProperty'), t('columns.toProperty'), t('columns.taxZoneNo')];
    const rows = tableRecords.map(r => [r.wardNo, r.fromProperty, r.toProperty, r.taxZoneNo]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    try {
      link.href = url;
      link.download = "tax-zoning-records.csv";
      link.click();
      toast.success(t('messages.csvExportSuccess'));
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.toLowerCase().split('.').pop();
    if (!['csv', 'xlsx', 'xls'].includes(fileExt || '')) {
      toast.error(t('messages.invalidFileType'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        let data: (string | number | boolean | null | undefined)[][] = [];
        if (fileExt === 'csv') {
          const text = String(reader.result || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
          data = text.split("\n").filter(Boolean).map(line => line.split(",").map(cell => cell.trim()));
        } else {
          const workbook = XLSX.read(reader.result, { type: 'array' });
          data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
        }

        if (data.length < 2) {
          toast.error(t('messages.fileHasNoData'));
          return;
        }

        const headers = data[0].map((h: unknown) => (h?.toString() ?? "").trim().toLowerCase());
        const STABLE_HEADERS = ['wardno', 'fromproperty', 'toproperty', 'taxzoneno'];
        const isValidHeader = headers.length === STABLE_HEADERS.length &&
          headers.every((h: string | undefined, i: number) => h === STABLE_HEADERS[i] || h === REQUIRED_HEADERS[i]);

        if (!isValidHeader) {
          toast.error(t('messages.invalidFileFormat'));
          return;
        }

        const newChanges: ZoningRecord[] = [];
        const updatedRecords: ZoningRecord[] = [];
        const seenKeys = new Set<string>();

        data.slice(1).forEach((row) => {
          if (row.length < 4) return;
          const [wardNoStr, fromP, toP, taxZoneNoStr] = row.map((cell) => cell?.toString().trim() || '');
          if (!wardNoStr || !fromP || !toP || !taxZoneNoStr) return;

          const wardData = wardsData.items.find((w: Ward) => w.wardNo === wardNoStr);
          const taxZoneData = taxZones.items.find((z: TaxZone) => z.taxZoneNo === taxZoneNoStr);
          if (!wardData || !taxZoneData) return;

          const fromProperty = fromP.padStart(3, "0"), toProperty = toP.padStart(3, "0");
          if (Number(fromProperty) > Number(toProperty)) return;

          const key = `${wardData.id}_${fromProperty}_${toProperty}`;
          if (seenKeys.has(key)) return;
          seenKeys.add(key);

          const existing = records.find(r => r.wardId === wardData.id && r.fromProperty === fromProperty && r.toProperty === toProperty);

          if (existing && existing.taxZoneId !== taxZoneData.id) {
            updatedRecords.push({ taxZoneId: taxZoneData.id, taxZoneNo: taxZoneNoStr, wardId: wardData.id, wardNo: wardNoStr, fromProperty, toProperty, status: "Updated" });
          } else if (!existing) {
            newChanges.push({ taxZoneId: taxZoneData.id, taxZoneNo: taxZoneNoStr, wardId: wardData.id, wardNo: wardNoStr, fromProperty, toProperty, status: "New" });
          }
        });

        const allChanges = [...newChanges, ...updatedRecords];
        if (!allChanges.length) {
          toast.warning(t('messages.noNewOrChangedRecords'));
          return;
        }

        setImportedChanges(allChanges);
        setHasImportedData(true);
        toast.success(newChanges.length > 0 ? `${newChanges.length} ${t('messages.newRecordsReadyToImport')}` : `${updatedRecords.length} ${t('messages.updatesReadyToImport')}`);
      } catch (_err) {
        toast.error(t('messages.fileProcessingError'));
      }
    };
    reader.onerror = () => toast.error(t('messages.fileReadError'));
    if (fileExt === 'csv') reader.readAsText(file); else reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleClearImported = () => {
    setImportedChanges([]);
    setHasImportedData(false);
    toast.info(t('messages.importedDataCleared'));
  };

  return { importedChanges, hasImportedData, handleExportCSV, handleImportFile, handleClearImported, setImportedChanges, setHasImportedData };
};
