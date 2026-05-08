import { useMemo } from 'react';
import { Building2, ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/common";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { CompactSelect, CompactCellInput } from './EditScreenComponents';
import { FloorDataRow } from '@/hooks/apartmentQc/useApartmentQCEdit';

interface FloorQCSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  floorData: FloorDataRow[];
  updateRow: (id: string, field: keyof FloorDataRow, value: string) => void;
  floorOptions: { value: string; label: string }[];
  conTypeOptions: { value: string; label: string }[];
  useTypeOptions: { value: string; label: string }[];
  getSubTypeOptions: (typeOfUseId: string) => { value: string; label: string }[];
  handleFloorDropdownClick: () => void;
  handleConTypeDropdownClick: () => void;
  handleUseTypeDropdownClick: () => void;
  loadingStates: {
    floors: boolean;
    conTypes: boolean;
    useTypes: boolean;
    subTypes: boolean;
  };
}

export const FloorQCSection = ({
  isOpen,
  onToggle,
  floorData,
  updateRow,
  floorOptions,
  conTypeOptions,
  useTypeOptions,
  getSubTypeOptions,
  handleFloorDropdownClick,
  handleConTypeDropdownClick,
  handleUseTypeDropdownClick,
  loadingStates
}: FloorQCSectionProps) => {
  const t = useTranslations("ptis");

  const makeHeader = (label: string) => (
    <Button
      type="button"
      variant="secondary"
      size="xs"
      icon={ArrowUpDown}
      iconPosition="right"
      className="w-full h-5 flex items-center justify-center gap-0.5 rounded border border-gray-300 bg-gray-100 text-[10px] font-semibold text-gray-900 hover:bg-gray-200"
    >
      <span className="truncate">{label}</span>
    </Button>
  ) as unknown as string;

  const columns: Column<FloorDataRow>[] = useMemo(() => [
    {
      key: "floorId", label: makeHeader(t("floorTable.columns.floor")), cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => <CompactSelect value={row.floorId} onChange={(v) => updateRow(row.id, "floorId", v)} options={floorOptions} onDropdownClick={handleFloorDropdownClick} isLoading={loadingStates.floors} />
    },
    { key: "conYear", label: makeHeader(t("apartmentTabs.columns.constructionYear")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <div className="bg-white rounded border border-gray-300 px-1 py-0.5 text-[10px] text-center min-w-[60px]">{row.conYear || "-"}</div> },
    { key: "asstYear", label: makeHeader(t("apartmentTabs.columns.assessmentYear")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <div className="bg-white rounded border border-gray-300 px-1 py-0.5 text-[10px] text-center min-w-[60px]">{row.asstYear || "-"}</div> },
    {
      key: "constructionTypeId", label: makeHeader(t("floorTable.columns.constType")), cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => <CompactSelect value={row.constructionTypeId} onChange={(v) => updateRow(row.id, "constructionTypeId", v)} options={conTypeOptions} onDropdownClick={handleConTypeDropdownClick} isLoading={loadingStates.conTypes} />
    },
    {
      key: "typeOfUseId", label: makeHeader(t("floorTable.columns.use")), cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => <CompactSelect value={row.typeOfUseId} onChange={(v) => updateRow(row.id, "typeOfUseId", v)} options={useTypeOptions} onDropdownClick={handleUseTypeDropdownClick} isLoading={loadingStates.useTypes} />
    },
    {
      key: "subTypeOfUseId", label: makeHeader(t("floorTable.columns.subType")), cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => <CompactSelect value={row.subTypeOfUseId} onChange={(v) => updateRow(row.id, "subTypeOfUseId", v)} options={getSubTypeOptions(row.typeOfUseId)} disabled={!row.typeOfUseId} onDropdownClick={handleUseTypeDropdownClick} isLoading={loadingStates.subTypes} />
    },
    { key: "area", label: makeHeader(t("floorTable.columns.carpetArea")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.area} onChange={(v) => updateRow(row.id, "area", v)} /> },
    { key: "rentMY", label: makeHeader(t("floorTable.columns.rentMY")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.rentMY} onChange={(v) => updateRow(row.id, "rentMY", v)} /> },
    { key: "rateMY", label: makeHeader(t("floorTable.columns.rateMY")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.rateMY} onChange={(v) => updateRow(row.id, "rateMY", v)} /> },
    { key: "rentalValue", label: makeHeader(t("floorTable.columns.rentalValue")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.rentalValue} onChange={(v) => updateRow(row.id, "rentalValue", v)} /> },
    { key: "depreciation", label: makeHeader(t("floorTable.columns.depreciation")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.depreciation} onChange={(v) => updateRow(row.id, "depreciation", v)} /> },
    { key: "alv", label: makeHeader(t("floorTable.columns.alv")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.alv} onChange={(v) => updateRow(row.id, "alv", v)} /> },
    { key: "mr", label: makeHeader(t("floorTable.columns.mr")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.mr} onChange={(v) => updateRow(row.id, "mr", v)} /> },
    { key: "rv", label: makeHeader(t("floorTable.columns.rv")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.rv} onChange={(v) => updateRow(row.id, "rv", v)} /> },
  ], [t, updateRow, floorOptions, conTypeOptions, useTypeOptions, getSubTypeOptions, handleFloorDropdownClick, handleConTypeDropdownClick, handleUseTypeDropdownClick, loadingStates]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 flex items-center justify-between hover:from-gray-100 hover:to-gray-150 transition"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-sm text-gray-800">{t("apartmentQC.edit.floorQC")}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            {t("apartmentQC.edit.floorsCount", { count: floorData.length })}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="bg-white">
          <MasterTable
            columns={columns.map((col) => ({
              ...col,
              cellClassName: `${col.cellClassName || ""} whitespace-nowrap`,
              headerClassName: `${col.headerClassName || ""} !px-1 !py-0.5 border-l !border-gray-300`,
            }))}
            data={floorData}
            loading={false}
            tableClassName="text-[10px] w-max min-w-full"
            theadClassName="bg-[#e8eef4] text-black sticky top-0 z-20 [&_th]:whitespace-nowrap"
            height="sm"
          />
        </div>
      )}
    </div>
  );
};
