import { MatrixGrid } from "@/components/common/MatrixGrid";
import { MatrixGridPagination } from "@/components/common/MatrixGrid";
import { sanitizePositiveDecimal, POSITIVE_DECIMAL_INVALID_KEYS } from "@/lib/utils/validation";
import type { RateCategory, ISelectOption } from "@/types/RVRateMaster";
import { RateMatrixHeader } from "./RateMatrixHeader";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { Tabs } from "@/components/common/Tabs";
import { applyMultiplierToMatrix } from "@/hooks/RVRateMaster/helpers/ratePayloadHelpers";
import {
  buildMatrixColumns,
  buildMatrixMetaColumns,
  buildMatrixRows,
  buildCategoryColorMap,
  filterRateCategories
} from "./rateMatrixHelpers";

// Maximum allowed rate value
const MAX_RATE_VALUE = 99999;

type MatrixRow = {
  id: number;
  zone?: string;
  zoneNo?: string;
  taxZoneId?: number;
  [key: string]: number | string | undefined;
};

interface RateMatrixSectionProps {
  // Matrix data
  matrixData: MatrixRow[];
  setMatrixData: (data: MatrixRow[] | ((prev: MatrixRow[]) => MatrixRow[])) => void;
  setAllZoneEdits: (edits: Record<string, Record<string, number>> | ((prev: Record<string, Record<string, number>>) => Record<string, Record<string, number>>)) => void;
  // Categories
  rateCategories: RateCategory[];
  // Filter values for display
  selectedZone: string;
  selectedZoneLabel?: string;
  selectedUseGroup: string;
  selectedUseGroupLabel?: string;
  assessmentYear: string;
  assessmentYearLabel?: string;
  // Rate unit
  rateUnit: "SqMeter" | "SqFeet";
  // Options for labels
  zoneOptions: ISelectOption[];
  useGroupOptions: ISelectOption[];
  assessmentYears: ISelectOption[];
  assessmentYearRanges?: Array<{
    label: string;
    value: string;
    fromYear: string | number;
    toYear: string | number;
  }>;
  // Zone remarks map
  zoneRemarksMap: Map<string, string>;
  // Stats
  filledRatesCount: number;
  // Pagination
  matrixPageNumber: number;
  matrixPageSize: number;
  matrixTotalPages: number;
  matrixTotalCount: number;
  onPaginationChange: (page: number, pageSize: number) => void;
  // Mode and handlers
  mode: "edit" | "delete" | "add";
  id?: string | null;
  onAddRates: () => void;
  onUpdateRates: () => void;
  onDeleteRates: () => void;
  // Validation
  existingRateFound: boolean;
  // Multipliers
  multipliers?: Record<string, number>;
  // Translations
  t: ReturnType<typeof import("next-intl").useTranslations>;
  tCommon: ReturnType<typeof import("next-intl").useTranslations>;
}

export function RateMatrixSection({
  matrixData,
  setMatrixData,
  setAllZoneEdits,
  rateCategories,
  selectedZone,
  selectedZoneLabel,
  selectedUseGroup,
  selectedUseGroupLabel,
  assessmentYear,
  assessmentYearLabel,
  rateUnit,
  zoneOptions,
  useGroupOptions,
  assessmentYears,
  assessmentYearRanges,
  zoneRemarksMap,
  filledRatesCount,
  matrixPageNumber,
  matrixPageSize,
  matrixTotalPages,
  matrixTotalCount,
  onPaginationChange,
  mode,
  id,
  onAddRates,
  onUpdateRates,
  onDeleteRates,
  existingRateFound,
  multipliers,
  t,
  tCommon,
}: RateMatrixSectionProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<string>(selectedUseGroup);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActivePreviewTab(selectedUseGroup);
  }, [selectedUseGroup]);

  const activeMultipliers = useMemo(() => {
    if (!multipliers) return [];
    return Object.entries(multipliers).filter(
      ([useGroup, value]) => value > 0 && value !== 1.0 && useGroup !== selectedUseGroup
    );
  }, [multipliers, selectedUseGroup]);

  const gridData = useMemo(() => {
    if (activePreviewTab === selectedUseGroup || !multipliers) {
      return matrixData;
    }
    const currentMultiplier = multipliers[activePreviewTab] || 1.0;
    return applyMultiplierToMatrix(matrixData as unknown as Array<Record<string, unknown>>, currentMultiplier, rateCategories) as MatrixRow[];
  }, [activePreviewTab, selectedUseGroup, matrixData, multipliers, rateCategories]);

  const isPreviewMode = activePreviewTab !== selectedUseGroup;
  const gridMode = isPreviewMode ? 'view' : (mode === 'edit' || mode === 'add' ? 'edit' : 'view');

  const singleColorClass = "text-blue-900";
  const singleColorClassHeader = "text-blue-700";

  const categoryColorMap = buildCategoryColorMap(rateCategories, singleColorClass);
  const filteredCategories = filterRateCategories(rateCategories);
  const matrixColumns = buildMatrixColumns(filteredCategories, singleColorClassHeader, tCommon, rateUnit);
  const matrixMetaColumns = buildMatrixMetaColumns(t);
  const matrixRows = buildMatrixRows(gridData, filteredCategories, zoneRemarksMap);

  return (
    <div className="mt-2 bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden">
      <RateMatrixHeader
        selectedZone={selectedZone}
        selectedZoneLabel={selectedZoneLabel}
        selectedUseGroup={selectedUseGroup}
        selectedUseGroupLabel={selectedUseGroupLabel}
        assessmentYear={assessmentYear}
        assessmentYearLabel={assessmentYearLabel}
        zoneOptions={zoneOptions}
        useGroupOptions={useGroupOptions}
        assessmentYears={assessmentYears}
        assessmentYearRanges={assessmentYearRanges}
        filledRatesCount={filledRatesCount}
        mode={mode}
        id={id}
        onAddRates={onAddRates}
        onUpdateRates={onUpdateRates}
        onDeleteRates={onDeleteRates}
        t={t}
        existingRateFound={existingRateFound}
      />

      {/* Preview Tabs */}
      {activeMultipliers.length > 0 && (
        <div className="px-4 pt-2 pb-2 border-b border-blue-100 bg-blue-50/50 flex items-center gap-3 overflow-x-auto hide-scrollbar">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider shrink-0">{t('sections.previewRates')}</span>
          <Tabs
            value={activePreviewTab}
            onChange={(val) => setActivePreviewTab(val as string)}
            variant="pills"
            size="sm"
            className="mb-0"
            tabListClassName="gap-2 bg-transparent p-0 border-none shadow-none flex-nowrap"
            items={[
              {
                value: selectedUseGroup,
                label: `${useGroupOptions.find(o => o.value === selectedUseGroup)?.label || selectedUseGroup} (Base)`,
                content: null,
                className: `!px-4 !py-1 rounded-md text-xs font-semibold transition-all duration-200 shrink-0 ${activePreviewTab === selectedUseGroup ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`
              },
              ...activeMultipliers.map(([useGroup, multiplier]) => ({
                value: useGroup,
                label: `${useGroupOptions.find(o => o.value === useGroup)?.label || useGroup} (${multiplier}x)`,
                content: null,
                className: `!px-4 !py-1 rounded-md text-xs font-semibold transition-all duration-200 shrink-0 ${activePreviewTab === useGroup ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`
              }))
            ]}
          />
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white p-0">
        <div className="overflow-x-auto">
          <MatrixGrid
            columns={matrixColumns}
            metaColumns={matrixMetaColumns}
            rows={matrixRows}
            colorMap={categoryColorMap}
            mode={gridMode}
            editableColumns={filteredCategories.map(cat => cat.constructionCode || cat.constructionId)}
            cellMaxValue={MAX_RATE_VALUE}
            onCellChange={(rowId, colId, value) => {
              // Sanitize and validate value
              const sanitized = sanitizePositiveDecimal(String(value));
              const numValue = sanitized === "" ? 0 : Number(sanitized);
              
              // Check if value exceeds maximum allowed rate
              if (numValue > MAX_RATE_VALUE) {
                toast.error(t('messages.rateExceedsMaximum', { max: MAX_RATE_VALUE }));
                return;
              }
              
              // Find the row to get zoneNo
              const targetRow = matrixData.find(row => String(row.id) === rowId);
              const zoneNo = (targetRow?.zoneNo || (typeof targetRow === 'object' && targetRow && 'zone' in targetRow ? (targetRow as { zone?: string }).zone : undefined)) as string;
              
              // Update matrixData for current page
              setMatrixData(prev => prev.map(row => {
                if (String(row.id) === rowId) {
                  return { ...row, [colId]: numValue };
                }
                return row;
              }));
              
              // Update allZoneEdits to persist across page changes
              if (zoneNo) {
                setAllZoneEdits(prevEdits => ({
                  ...prevEdits,
                  [zoneNo]: {
                    ...(prevEdits[zoneNo] || {}),
                    [colId]: numValue
                  }
                }));
              }
            }}
            onCellKeyDown={(e) => {
              // Prevent invalid keys for positive decimal input
              if (POSITIVE_DECIMAL_INVALID_KEYS.test(e.key)) {
                e.preventDefault();
              }
            }}
            getCellClassName={(value) => {
              // Highlight cells: blue for values > 0, light gray for 0
              return value > 0
                ? "bg-blue-50 text-blue-800 border-blue-300"
                : "bg-gray-50 text-gray-500 border-gray-200";
            }}
            translations={{
              action: tCommon('table.columns.actions'),
              currencySymbol: "₹",
              deleteRow: tCommon('table.actions.delete'),
            }}
          />
        </div>
        
        {/* Pagination outside scrollable area */}
        <div className="mt-4">
          <MatrixGridPagination
            pageNumber={matrixPageNumber}
            pageSize={matrixPageSize}
            totalCount={matrixTotalCount}
            totalPages={matrixTotalPages}
            onPageChange={(page) => onPaginationChange(page, matrixPageSize)}
            onPageSizeChange={(size) => onPaginationChange(1, size)}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      </div>
    </div>
  );
}
