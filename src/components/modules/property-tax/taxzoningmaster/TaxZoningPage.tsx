"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { MapPin, Eye, Dot } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import * as XLSX from 'xlsx';
import { useLocale, useTranslations } from 'next-intl';
import { MasterTable, Column } from "@/components/common/MasterTable";
import TableHeader from "@/components/common/TableHeader";
import { AddButton, CancelButton, Card, CardContent, CardHeader, CardTitle, ExportButton, ImportButton, Input, PageContainer, SaveButton, Select, ValidationMessage } from "@/components/common";
import { useRouter } from "next/navigation";
import {
  createTaxZoningAction,
  getTaxZonningByWardAction,
  updateTaxZoningAction,
} from "@/app/[locale]/property-tax/taxzoning/tax-zone.actions";
import { TaxZone, Ward, TaxZonningPropertyNo } from "@/types/taxzoning.types";


import { MultiSelectDropdown } from "@/components/common/Dropdown";
import { PagedResponse } from "@/types/common.types";

/* ================= TYPES ================= */
type PreviewRow = {
  taxZoneId: string;            // ✅ FIX
  wardNo: string;
  propertyNo: string;
};

type ZoningRecord = {
  taxZoneId: number;            // Internal ID for API calls
  taxZoneNo?: string;           // For display in table
  wardId: number;
  wardNo?: string;             // For display only, not used in payload
  fromProperty: string;
  toProperty: string;
  status: string;
};

type SelectOption = {
  label: string;
  value: string;
};

type Props = {
  data: TaxZonningPropertyNo[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  taxZones: PagedResponse<TaxZone>;
  wardsData: PagedResponse<Ward>;
};

/* ================= COMPONENT ================= */
export default function TaxZoningPage({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  taxZones,
  wardsData,
}: Props) {
  const t = useTranslations('taxZoning');
  
  // Dynamic headers based on current locale
  const REQUIRED_HEADERS = [
    t('columns.wardNo').toLowerCase(),
    t('columns.fromProperty').toLowerCase(),
    t('columns.toProperty').toLowerCase(),
    t('columns.taxZoneNo').toLowerCase(),
  ];

  const [zone, setZone] = useState("");
  const [ward, setWard] = useState<string[]>([]);
  // const [fromProps, setFromProps] = useState<string[]>([]);
  // const [toProps, setToProps] = useState<string[]>([]);
  const [fromProps, setFromProps] = useState("");
  const [toProps, setToProps] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [zoneOptions, setZoneOptions] = useState<SelectOption[]>([]);
  const [wardOptions, setWardOptions] = useState<SelectOption[]>([]);
  const [propertyOptionsByWard, setPropertyOptionsByWard] = useState<SelectOption[]>([]);
  const loading = false;

  const pageSizeOptions = [5, 10, 20, 50, 100];
  const [pageSizes, setPageSize] = useState(String(pageSize));
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const router = useRouter();

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const PREVIEW_PAGE_SIZE = 5;
  const [importedChanges, setImportedChanges] = useState<ZoningRecord[]>([]);
  const [hasImportedData, setHasImportedData] = useState(false);
const locale=useLocale()

  const changePage = (p: number) => {
    setCurrentPage(p);
    router.push(`/${locale}/property-tax/taxzoning?page=${p}&pageSize=${pageSizes}`);
  };

  const changePageSize = (size: number) => {
    setPageSize(String(size));
    setCurrentPage(1);
    router.push(`/${locale}/property-tax/taxzoning?page=1&pageSize=${size}`);
  };




  /* ================= SERVER DATA ================= */
  const records: ZoningRecord[] = useMemo(() => {
    return data.map((item) => {
      // ✅ Look up taxZoneNo from taxZones data
      const taxZoneData = taxZones.items.find(z => z.taxZoneId === Number(item.taxZoneId));
      const taxZoneNoDisplay = taxZoneData?.taxZoneNo || String(item.taxZoneId);

      return {
        taxZoneId: Number(item.taxZoneId),
        taxZoneNo: taxZoneNoDisplay,         // ✅ Include taxZoneNo for display
        wardId: Number(item.wardId),         // ✅ Include wardId for update logic
        wardNo: String(item.wardNo),         // ✅ Include wardNo for display
        fromProperty: item.fromProperty?.padStart(3, "0") || "",
        toProperty: item.toProperty?.padStart(3, "0") || "",
        status: item.isActive ? "Active" : "Inactive",
      };
    });
  }, [data, taxZones]);

  /* ================= LOCAL TABLE DATA ================= */
  // Combine records with imported changes using useMemo for immediate server rendering
  const tableRecords = useMemo(() => {
    const combinedRecords = [...records];

    importedChanges.forEach(change => {
      if (change.status === "Updated") {
        // Replace existing record with updated one
        const index = combinedRecords.findIndex(r =>
          r.wardId === change.wardId && r.taxZoneId === change.taxZoneId
        );
        if (index !== -1) {
          combinedRecords[index] = change;
        }
      } else if (change.status === "New") {
        // Add new record
        combinedRecords.push(change);
      }
    });

    return combinedRecords;
  }, [records, importedChanges]);




  /* ================= LOAD TAX ZONES ================= */
  useEffect(() => {
    if (taxZones?.items) {
      setZoneOptions(
        taxZones.items.map((z) => ({
          label: String(z.taxZoneNo),
          value: String(z.taxZoneId),
        }))
      );
    }
  }, [taxZones]);

  /* ================= LOAD WARDS ================= */
  useEffect(() => {
    if (!zone) {
      setWard([]);
      setWardOptions([]);
      return;
    }

    if (wardsData?.items) {
      setWardOptions(
        wardsData.items.map((w) => ({
          label: w.wardNo,
          value: String(w.wardId),
        }))
      );
    }
  }, [zone, wardsData]);

  /* ================= LOAD PROPERTIES ================= */

  useEffect(() => {
    if (ward.length !== 1) {
      setPropertyOptionsByWard([]);
      setFromProps("");
      setToProps("");

      return;
    }

    const selectedWard = ward[0];
    getTaxZonningByWardAction(selectedWard, 100).then((res) => {
      if (!res.success) return;

      const options = res.data.items
        .map((i: TaxZonningPropertyNo) => {
          const v = i.propertyNo.padStart(3, "0");
          return { label: v, value: v };
        })
        .filter(
          (v: SelectOption, i: number, a: SelectOption[]) => a.findIndex((t: SelectOption) => t.value === v.value) === i
        );

      setPropertyOptionsByWard(options);
    });
  }, [ward]);

  /* ================= PREVIEW ================= */
  // const previewData: PreviewRow[] = useMemo(() => {
  //   if (!zone || ward.length !== 1 || !fromProps.length || !toProps.length)
  //     return [];

  //   const from = Math.min(...fromProps.map(Number));
  //   const to = Math.max(...toProps.map(Number));

  //   return Array.from({ length: to - from + 1 }, (_, i) => ({
  //     zoneNo: zone,                    // ✅ FIX
  //     wardNo: ward[0],
  //     propertyNo: String(from + i).padStart(3, "0"),
  //   }));
  // }, [zone, ward, fromProps, toProps]);



  const previewData: PreviewRow[] = useMemo(() => {
    if (!zone || ward.length !== 1 || !fromProps || !toProps) return [];

    const from = parseInt(fromProps, 10);
    const to = parseInt(toProps, 10);

    // ❌ invalid range
    if (isNaN(from) || isNaN(to) || from > to) return [];

    // ✅ Look up wardNo from wardsData instead of using wardId
    const selectedWardId = ward[0];
    const wardData = wardsData.items.find(w => String(w.wardId) === selectedWardId);
    const wardNoDisplay = wardData?.wardNo || selectedWardId; // Fallback to ID if not found

    // ✅ Look up taxZoneNo from taxZones instead of using taxZoneId
    const taxZoneData = taxZones.items.find(z => String(z.taxZoneId) === zone);
    const taxZoneNoDisplay = taxZoneData?.taxZoneNo || zone; // Fallback to ID if not found

    return Array.from({ length: to - from + 1 }, (_, index) => ({
      taxZoneId: taxZoneNoDisplay,
      wardNo: wardNoDisplay,
      propertyNo: String(from + index).padStart(2, "0"), // 19 → 25
    }));
  }, [zone, ward, fromProps, toProps, wardsData, taxZones]);

  /* ================= COLUMNS ================= */
  const columns: Column<ZoningRecord>[] = [
    { key: "wardNo", label: t('columns.wardNo') },
    { key: "fromProperty", label: t('columns.fromProperty') },
    { key: "toProperty", label: t('columns.toProperty') },
    { key: "taxZoneNo", label: t('columns.taxZoneNo') },
   
  ];

  const previewColumns: Column<PreviewRow>[] = [
    { key: "taxZoneId", label: t('columns.taxZoneNo') },
    { key: "wardNo", label: t('columns.wardNo') },
    { key: "propertyNo", label: t('columns.propertyNo') },
  ];


  /* ================= EXPORT CSV ================= */
  const handleExportCSV = () => {
    if (!tableRecords.length) {
      toast.error(t('messages.noRecordsToExport'));
      return;
    }

    const headers = [t('columns.wardNo'), t('columns.fromProperty'), t('columns.toProperty'), t('columns.taxZoneNo')];
    const rows = tableRecords.map(r => [

      r.wardNo,
      r.fromProperty,
      r.toProperty,
      r.taxZoneNo,
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tax-zoning-records.csv";
    link.click();

    toast.success(t('messages.csvExportSuccess'));
  };


  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        let data: string[][] = [];

        if (fileExt === 'csv') {
          // Handle CSV
          const text = String(reader.result || "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .trim();
          data = text.split("\n").filter(Boolean).map(line =>
            line.split(",").map(cell => cell.trim())
          );
        } else {
          // Handle Excel
          const workbook = XLSX.read(reader.result, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }

        if (data.length < 2) {
          toast.error(t('messages.fileHasNoData'));
          return;
        }

        // Check headers
        const headers = data[0].map((h: string) => h?.toString().trim().toLowerCase());
        const isValidHeader = headers.length === REQUIRED_HEADERS.length &&
          headers.every((h: string, i: number) => h === REQUIRED_HEADERS[i]);

        if (!isValidHeader) {
          toast.error(t('messages.invalidFileFormat'));
          return;
        }

        // Process data rows
        const newChanges: ZoningRecord[] = [];
        const updatedRecords: ZoningRecord[] = [];
        const seenKeys = new Set<string>();

        data.slice(1).forEach((row) => {
          if (row.length < 4) return;

          const [wardNoStr, fromP, toP, taxZoneNoStr] = row.map((cell) =>
            cell?.toString().trim() || ''
          );

          if (!wardNoStr || !fromP || !toP || !taxZoneNoStr) return;

          // ✅ Map wardNo to wardId using wardsData
          const wardData = wardsData.items.find(w => w.wardNo === wardNoStr);
          if (!wardData) return; // Skip if ward not found

          // ✅ Map taxZoneNo to taxZoneId using taxZones data
          const taxZoneData = taxZones.items.find(z => z.taxZoneNo === taxZoneNoStr);
          if (!taxZoneData) return; // Skip if tax zone not found

          const wardId = wardData.wardId;
          const taxZoneId = taxZoneData.taxZoneId;

          const fromProperty = fromP.padStart(3, "0");
          const toProperty = toP.padStart(3, "0");

          if (Number(fromProperty) > Number(toProperty)) return;

          const key = `${taxZoneId}_${wardId}_${fromProperty}_${toProperty}`;

          // Skip duplicates within file
          if (seenKeys.has(key)) return;
          seenKeys.add(key);

          // Check if record exists with same Ward ID and Property range
          const existingRecord = records.find(r =>
            r.wardId === wardId && 
            r.fromProperty === fromProperty && 
            r.toProperty === toProperty
          );

          if (existingRecord) {
            // Check if Tax Zone has changed
            if (existingRecord.taxZoneId !== taxZoneId) {
              // This is an update to existing record (Tax Zone changed)
              updatedRecords.push({
                taxZoneId,
                taxZoneNo: taxZoneNoStr,  // ✅ Include taxZoneNo for display
                wardId,
                wardNo: wardNoStr,  // ✅ Include wardNo for display
                fromProperty,
                toProperty,
                status: "Updated",
              });
            }
            // If same tax zone and property range, skip (no change needed)
          } else {
            // Check if same Ward and Zone exists with different property range
            const sameWardZone = records.find(r =>
              r.wardId === wardId && r.taxZoneId === taxZoneId
            );

            if (sameWardZone) {
              // Property range is different for same Ward/Zone - update
              updatedRecords.push({
                taxZoneId,
                taxZoneNo: taxZoneNoStr,  // ✅ Include taxZoneNo for display
                wardId,
                wardNo: wardNoStr,  // ✅ Include wardNo for display
                fromProperty,
                toProperty,
                status: "Updated",
              });
            } else {
              // This is a completely new record
              newChanges.push({
                taxZoneId,
                taxZoneNo: taxZoneNoStr,  // ✅ Include taxZoneNo for display
                wardId,
                wardNo: wardNoStr,  // ✅ Include wardNo for display
                fromProperty,
                toProperty,
                status: "New",
              });
            }
          }
        });

        const allChanges = [...newChanges, ...updatedRecords];

        if (!allChanges.length) {
          toast.warning(t('messages.noNewOrChangedRecords'));
          return;
        }

        // Show both new and updated records
        setImportedChanges(allChanges);
        setHasImportedData(true);

        const newCount = newChanges.length;
        const updateCount = updatedRecords.length;
        let message = "";
        if (newCount > 0 && updateCount > 0) {
          message = `${newCount} ${t('messages.newRecordsAndUpdatesReady')} ${updateCount} ${t('messages.andUpdatesReady')}`;
        } else if (newCount > 0) {
          message = `${newCount} ${t('messages.newRecordsReadyToImport')}`;
        } else {
          message = `${updateCount} ${t('messages.updatesReadyToImport')}`;
        }
        toast.success(message);

      } catch (err) {
        console.error(err);
        toast.error(t('messages.invalidFile'));
      }
    };

    if (fileExt === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }

    // Reset input
    e.target.value = "";
  };



  //Updated validation logic
  // Tax Zone required
  const isTaxZoneValid = !!zone;

  // At least one ward required
  const isWardValid = ward.length > 0;

  // Property required ONLY when single ward
  const isPropertyValid =
    ward.length === 1 ? previewData.length > 0 : true;

  const isFormValid =
    isTaxZoneValid &&
    isWardValid &&
    isPropertyValid;



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isFormValid) {
      toast.error(t('messages.fillAllFields'));
      return;
    }

    try {
      setSaving(true);

      if (ward.length === 1) {
        // ✅ Check if ward exists in records
        const wardExists = records.some(r => r.wardId === Number(ward[0]));
        
        if (!wardExists) {
          // Get ward name for better error message
          const wardData = wardsData.items.find(w => String(w.wardId) === ward[0]);
          const wardName = wardData?.wardNo || ward[0];
          toast.error(`${t('messages.wardNotFound')}: ${wardName}. ${t('messages.wardNotFoundDetail')}`);
          setSaving(false);
          return;
        }

        // ✅ SINGLE WARD - Single API call
        const payload = {
          taxZoneId: Number(zone),
          wardId: Number(ward[0]),
          propertyNo: "",
          fromProperty: previewData[0].propertyNo,
          toProperty: previewData[previewData.length - 1].propertyNo,
          isActive: true,
          updatedBy: 1,
          propertyId: 0,
        };

        const result = await updateTaxZoningAction(payload);

        if (!result.success) {
          toast.error(t('messages.updateFailed'));
          return;
        }

        toast.success(result.message);
      } else {
        // ✅ MULTIPLE WARDS - Check which wards don't exist
        const nonExistentWards: string[] = [];
        const validWards: string[] = [];

        for (const wardId of ward) {
          const wardExists = records.some(r => r.wardId === Number(wardId));
          if (!wardExists) {
            const wardData = wardsData.items.find(w => String(w.wardId) === wardId);
            nonExistentWards.push(wardData?.wardNo || wardId);
          } else {
            validWards.push(wardId);
          }
        }

        // Show error if any wards don't exist
        if (nonExistentWards.length > 0) {
          toast.error(`${t('messages.wardsNotFound')}: ${nonExistentWards.join(', ')}. ${t('messages.wardNotFoundDetail')}`);
          setSaving(false);
          return;
        }

        // ✅ MULTIPLE WARDS - Iterate and call API for each ward
        let successCount = 0;
        let errorCount = 0;

        for (const wardId of validWards) {
          try {
            const payload = {
              taxZoneId: Number(zone),
              wardId: Number(wardId),
              propertyNo: "",
              fromProperty: "",
              toProperty: "",
              isActive: true,
              updatedBy: 1,
              propertyId: 0,
            };

            const result = await updateTaxZoningAction(payload);

            if (result.success) {
              successCount++;
            } else {
              errorCount++;
              console.error(`Failed to update ward ${wardId}:`, result.message);
            }
          } catch (err) {
            errorCount++;
            console.error(`Error updating ward ${wardId}:`, err);
          }
        }

        // Show appropriate message based on results
        if (successCount > 0 && errorCount === 0) {
          toast.success(`${t('messages.dbOperationCompleted')} ${successCount} ${t('messages.wardsUpdatedSuccessfully')}`);
        } else if (successCount > 0 && errorCount > 0) {
          toast.warning(`${successCount} ${t('messages.wardsUpdatedSuccessfully')}, ${errorCount} ${t('messages.wardsFailed')}`);
        } else {
          toast.error(t('messages.updateFailed'));
          setSaving(false);
          return;
        }
      }

      router.refresh();

      // reset after success
      setZone("");
      setWard([]);
      setFromProps("");
      setToProps("");
      setSubmitted(false);

    } catch (error) {
      console.error("Tax zoning update failed:", error);
      toast.error(t('messages.somethingWrong'));
    } finally {
      setSaving(false);
    }
  };


  const handleBulkUpdate = async () => {
    if (!importedChanges.length) {
      toast.error(t('messages.noChanges'));
      return;
    }

    try {
      setSaving(true);
      let newCount = 0;
      let updateCount = 0;
      let errorCount = 0;

      // Process each imported record
      for (const row of importedChanges) {
        try {
          // ✅ ENHANCED PAYLOAD - Include all necessary fields for both creates and updates
          const payload = {
            taxZoneId: row.taxZoneId,
            wardId: row.wardId,
            propertyNo: "", // Keep empty as before
            fromProperty: row.fromProperty,
            toProperty: row.toProperty,
            isActive: true,
            updatedBy: 1,
            propertyId: 0,
          };

          console.log(`🔄 Processing ${row.status} record:`, payload);

          let result;

          // ✅ Use appropriate action based on record status
          if (row.status === "New") {
            // Call CREATE action for new records
            result = await createTaxZoningAction(payload);
          } else if (row.status === "Updated") {
            // Call UPDATE action for existing records
            result = await updateTaxZoningAction(payload);
          } else {
            console.warn(`⚠️ Unknown record status: ${row.status}`);
            continue;
          }

          if (result.success) {
            if (row.status === "Updated") {
              updateCount++;
              console.log(`✅ Updated record: Ward ${row.wardId}, Zone ${row.taxZoneId}`);
            } else {
              newCount++;
              console.log(`✅ Created record: Ward ${row.wardId}, Zone ${row.taxZoneId}`);
            }
          } else {
            console.error(`❌ Failed to process ${row.status} record:`, {
              row,
              error: result.message,
            });
            errorCount++;
            const action = row.status === 'New' ? t('messages.failedToCreate') : t('messages.failedToUpdate');
            toast.error(`${action} ${t('messages.ward')} ${row.wardId}, ${t('messages.zone')} ${row.taxZoneId}: ${result.message}`);
          }
        } catch (err) {
          console.error(`❌ Exception processing record:`, { row, err });
          errorCount++;
          toast.error(`${t('messages.exceptionProcessing')} ${t('messages.ward')} ${row.wardId}, ${t('messages.zone')} ${row.taxZoneId}`);
        }
      }

      // Show appropriate success message based on results
      if (newCount > 0 || updateCount > 0) {
        let message = "";
        if (newCount > 0 && updateCount > 0) {
          message = `${t('messages.dbOperationCompleted')} ${newCount} ${t('messages.newRecordsCreatedAnd')} ${updateCount} ${t('messages.recordsUpdatedSuccessfully')}`;
        } else if (newCount > 0) {
          message = `${t('messages.dbOperationCompleted')} ${newCount} ${t('messages.newRecordsCreated')}`;
        } else if (updateCount > 0) {
          message = `${t('messages.dbOperationCompleted')} ${updateCount} ${t('messages.recordsUpdatedSuccessfully')}`;
        }

        if (errorCount > 0) {
          message += `. ⚠️ ${errorCount} ${t('messages.recordsFailed')}`;
          toast.warning(message);
        } else {
          toast.success(message);
        }

        // Clear imported changes after successful database update
        setImportedChanges([]);
        setHasImportedData(false);

        // 🔄 Force refresh page data to reflect database changes
        console.log("🔄 Refreshing page to show updated data...");

        // Add a small delay to ensure database changes are committed
        setTimeout(() => {
          router.refresh();
        }, 1000); // Increased delay for better reliability
      } else {
        toast.error(t('messages.noRecordsProcessed'));
      }

    } catch (err) {
      console.error("❌ Bulk update critical error:", err);
      toast.error(t('messages.criticalError'));
    } finally {
      setSaving(false);
    }
  };

  const handleClearImported = () => {
    setImportedChanges([]);
    setHasImportedData(false);
    toast.info(t('messages.importedDataCleared'));
  };


  const pagedPreviewData = useMemo(() => {
    const start = (previewPage - 1) * PREVIEW_PAGE_SIZE;
    const end = start + PREVIEW_PAGE_SIZE;
    return previewData.slice(start, end);
  }, [previewData, previewPage]);

  return (
    <PageContainer>
      <div className="space-y-2">

        <TableHeader
          title={t('title')}
          subtitle={t('subtitle')}
          icon={MapPin}
        />

        {/* ================= FORM + PREVIEW (UNCHANGED) ================= */}
        {/* YOUR EXISTING FORM + PREVIEW JSX REMAINS EXACTLY SAME */}



        {/* ================= FORM + PREVIEW ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSubmit}>
            <Card
              variant="default"
              padding="none"
              className="border border-blue-200 rounded-xl shadow-sm h-[500px] flex flex-col"
            >
              {/* ================= HEADER ================= */}
              <CardHeader className="flex items-center gap-2 px-4 py-3 border-b bg-[#F8FAFF] rounded-t-xl">
                <MapPin className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm font-semibold text-[#1E3A8A]">
                  {t('form.update')} {t('title')}
                </CardTitle>
              </CardHeader>

              {/* ================= CONTENT (SCROLLABLE) ================= */}
              <CardContent className="p-4 space-y-4 flex-1">

                {/* Tax Zone */}
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Dot className="text-blue-600" /> {t('form.taxZone')} *
                  </label>
                  <Select
                    value={zone}
                    onChange={setZone}
                    options={zoneOptions}
                    placeholder={t('form.selectTaxZone')}
                  />
                  <ValidationMessage
                    visible={submitted && !isTaxZoneValid}
                    message={t('messages.taxZoneRequired')}
                  />
                </div>

                {/* Ward */}
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Dot className="text-green-600" /> {t('form.ward')} *
                  </label>

                  <div className={cn(!zone && "opacity-60 cursor-not-allowed pointer-events-none")}>
                    <MultiSelectDropdown
                      options={wardOptions}
                      value={ward}
                      onChange={setWard}
                      placeholder={zone ? t('form.selectWard') : t('form.selectTaxZone')}
                      className="text-gray-700"
                    />
                  </div>

                  <ValidationMessage
                    visible={submitted && !isWardValid}
                    message={t('messages.wardRequired')}
                  />
                </div>

              
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Dot className="text-purple-600" /> {t('form.fromProperty')}
                    </label>

                    <Select
                      value={fromProps}
                      onChange={setFromProps}
                      options={propertyOptionsByWard}
                      placeholder={t('form.selectFromProperty')}
                      disabled={ward.length !== 1}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Dot className="text-purple-600" /> {t('form.toProperty')}
                    </label>

                    <Select
                      value={toProps}
                      onChange={setToProps}
                      options={propertyOptionsByWard}
                      placeholder={t('form.selectToProperty')}
                      disabled={ward.length !== 1}
                    />
                  </div>
                </div>


                {ward.length === 1 && (
                  <ValidationMessage
                    visible={submitted && !isPropertyValid}
                    message={t('messages.propertyRequired')}
                  />
                )}

                {ward.length > 1 && (
                  <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    <Eye className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t('preview.multipleWardsSelected')}</p>
                      <p>
                        {t('preview.multipleWardsMessage')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* ================= FOOTER (FIXED BOTTOM) ================= */}
              <div className="border-t bg-[#F8FAFF] px-4 py-3 rounded-b-xl">
                <div className="grid grid-cols-2 gap-3">
                  <SaveButton
                    type="submit"
                    label={saving ? t('form.updating') : t('form.update')}
                    className="w-full"
                    disabled={!isFormValid || saving}
                  />

                  <CancelButton
                    label={t('form.clearImported')}
                    className="w-full"
                    onClick={() => {
                      setZone("");
                      setWard([]);
                      setFromProps("");
                      setToProps("");
                      setSubmitted(false);
                    }}
                  />
                </div>
              </div>
            </Card>
          </form>



          {/* ========== PREVIEW PANEL ========== */}
          {/* 🔒 UNCHANGED – AS IT IS 🔒 */}
          {/* Your existing preview JSX stays exactly the same */}

          <Card
            variant="default"
            padding="none"
            className="border border-blue-200 rounded-xl shadow-sm min-h-[480px] max-h-[500px]"
          >
            {/* ================= HEADER ================= */}
            <CardHeader className="flex items-center justify-between px-4 py-3 border-b bg-[#F8FAFF] rounded-t-xl">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-[#1E3A8A]">
                  {t('preview.title')}
                </span>
              </div>

              <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {previewData.length} {t('columns.propertyNo')}
              </span>
            </CardHeader>

            {/* ================= SUMMARY STRIP ================= */}
            <CardContent className="px-4 pt-4 pb-3">
              <div className="grid grid-cols-3 gap-3">
                {/* Zone */}
                <div className="border border-blue-200 bg-[#F1F7FF] rounded-md px-3 py-2">
                  <p className="text-xs font-semibold text-blue-700">{t('form.taxZone')}</p>
                  <p className="text-sm text-gray-900">
                    {zone ? (taxZones.items.find(z => String(z.taxZoneId) === zone)?.taxZoneNo || zone) : t('form.selectTaxZone')}
                  </p>
                </div>

                {/* Ward */}
                <div className="border border-blue-200 bg-[#F1F7FF] rounded-md px-3 py-2">
                  <p className="text-xs font-semibold text-blue-700">{t('form.ward')}</p>
                  <p className="text-sm text-gray-900">
                    {Array.isArray(ward) && ward.length > 0
                      ? ward.map(wardId => wardsData.items.find(w => String(w.wardId) === wardId)?.wardNo || wardId).join(", ")
                      : t('form.selectWard')}
                  </p>
                </div>

                {/* Property Range */}
                <div className="border border-blue-200 bg-[#F1F7FF] rounded-md px-3 py-2">
                  <p className="text-xs font-semibold text-blue-700">
                    {t('columns.propertyNo')}
                  </p>
                  <p className="text-sm text-gray-900">
                    {fromProps.length && toProps.length
                      ? `${fromProps} → ${toProps}`
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>

            {/* ================= TABLE ================= */}
            <div className="mx-4 mb-4 overflow-hidden">
              {/* Table Header */}
              {/* <div className="grid grid-cols-3 bg-[#F1F5F9] px-4 py-2 text-xs font-semibold text-gray-700">
                                <span>Tax Zone No</span>
                                <span>Ward No</span>
                                <span>Property No</span>
                            </div> */}

              {/* Empty State */}
              {previewData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 mb-2 rounded-full bg-blue-50 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-400" />
                  </div>

                  <p className="text-sm font-medium text-gray-500">
                    {t('preview.noPropertiesToPreview')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('preview.selectZoneWardProperty')}
                  </p>
                </div>
              )}

              {/* Table Data (when present) */}
              {previewData.length > 0 && (
                <MasterTable
                  headerTitle=""
                  columns={previewColumns}
                  data={pagedPreviewData}
                  pageNumber={previewPage}
                  pageSize={PREVIEW_PAGE_SIZE}
                  totalCount={previewData.length}
                  totalPages={Math.ceil(previewData.length / PREVIEW_PAGE_SIZE)}
                  onPageChange={(p) => setPreviewPage(p)}
                />
              )}

            </div>
          </Card>

        </div>
        {/* ================= ZONING RECORDS ================= */}
        <MasterTable
          headerTitle=""
          columns={columns}
          data={tableRecords}
          pageNumber={currentPage}
          pageSize={Number(pageSizes)}
          totalCount={totalCount}
          totalPages={totalPages}
          loading={loading}
          onPageChange={changePage}
          onPageSizeChange={changePageSize}
          pageSizeOptions={pageSizeOptions}
          paginationConfig={{
            enabled: true,
            showPageSizeSelector: true,
          }}
          headerExtra={
            <div className="
    flex flex-col gap-3 w-full
    md:flex-row md:items-center md:justify-between
  ">

              {/* ===== LEFT : TITLE ===== */}
              <div className="flex items-center gap-2 shrink-0">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-[#1E3A8A]">
                  {t('table.zoningRecords')}
                </span>
              </div>

              {/* ===== RIGHT : CONTROLS ===== */}
              <div
                className="
        flex flex-col gap-3 w-full
        sm:flex-row sm:flex-wrap sm:items-center sm:justify-start
        md:w-auto md:flex-nowrap md:justify-end ml-auto
      "
              >
                <div className="flex items-center gap-2 w-full sm:w-auto">
                
                 
                  <AddButton
                    label={t('form.bulkUpdate')}
                    disabled={!hasImportedData || saving}
                    onClick={handleBulkUpdate}
                    className="px-3 py-1.5 text-xs rounded-md"
                  />

                  {hasImportedData && (
                    <CancelButton
                      label={t('form.clearImported')}
                      onClick={handleClearImported}
                      className="px-3 py-1.5 text-xs rounded-md"
                    />
                  )}

                </div>
                {/* IMPORT */}
                <div className="flex">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                  <ImportButton
                    label={t('buttons.importFile')}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  />


                </div>

                {/* EXPORT */}
                <ExportButton
                  label={t('buttons.exportCSV')}
                  onClick={handleExportCSV} />


              </div>
            </div>
          }

        />
      </div>
    </PageContainer>
  );
}
