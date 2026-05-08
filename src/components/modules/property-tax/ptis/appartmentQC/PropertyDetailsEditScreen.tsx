"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Drawer } from "@/components/common/Drawer";
import { Button } from "@/components/common";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { ChevronDown, ChevronUp, ArrowUpDown, User, Building2, ImageIcon, PenTool, Map } from "lucide-react";
import { SaveButton } from "@/components/common/ActionButtons";
import TaxDetailsTable from "./TaxDetailsTable";
import { Floor } from "@/types/floor.types";
import { ConstructionType } from "@/types/construction.types";
import { UseSubType, UseType } from "@/types/typeOfUse.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ResidentialEditScreenProps {
  open: boolean;
  onClose?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propertyData?: any;
  returnTo?: 'residential' | 'commercial' | 'amenities';

  // Dropdown master data — fetched server-side and passed as props
  floors?: Floor[];
  constructionTypes?: ConstructionType[];
  useTypes?: UseType[];
  /** All sub-types; filtered client-side by the row's selected typeOfUseId */
  allSubTypes?: UseSubType[];
}

// ─── Row data ─────────────────────────────────────────────────────────────────

type FloorDataRow = {
  id: string;
  floorId: string;
  conYear: string;
  asstYear: string;
  constructionTypeId: string;
  typeOfUseId: string;
  subTypeOfUseId: string;
  area: string;
  rentMY: string;
  rateMY: string;
  rentalValue: string;
  depreciation: string;
  alv: string;
  mr: string;
  rv: string;
  [key: string]: unknown; // MasterTable compatibility
};

const CompactInput = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
    <div className={`flex flex-col ${className}`}>
        <label className="text-[10px] font-medium text-gray-600 mb-0.5">{label}</label>
        <input
            type="text"
            value={value}
            readOnly
            aria-label={label}
            title={label}
            className="h-7 px-2 text-xs border border-gray-300 rounded bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
        />
    </div>
);

// ─── Compact select (used inside each table cell) with on-click loading ───────
const CompactSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled = false,
  onDropdownClick,
  isLoading = false,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  onDropdownClick?: () => void;
  isLoading?: boolean;
}) => {
  // Only trigger load on first click, not on every focus/mouse event
  const handleClick = () => {
    if (onDropdownClick && options.length === 0 && !isLoading) {
      onDropdownClick();
    }
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className="h-6 px-1 text-[10px] border border-gray-300 rounded bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none transition w-full min-w-[80px] cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
    >
      <option value="">{isLoading ? "Loading..." : placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

// ─── Compact editable text input (used for numeric fields) ───────────────────

const CompactCellInput = ({
  value,
  onChange,
  placeholder = "Enter",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="h-6 px-1 text-[10px] border border-gray-300 rounded bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none transition w-full min-w-[60px]"
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ResidentialEditScreen = ({
  open,
    onClose,
    propertyData,
  returnTo = 'residential',
  floors = [],
  constructionTypes = [],
  useTypes = [],
  allSubTypes = [],
}: ResidentialEditScreenProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
   const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true);
   const [isFloorQCOpen, setIsFloorQCOpen] = useState(true);

  // Track which dropdown loads have been triggered (prevents duplicate calls)
  const triggeredLoadsRef = useRef<Set<string>>(new Set());

  // Check which dropdowns are already loaded based on URL params
  const floorsLoaded = searchParams.get("loadFloors") === "true";
  const conTypesLoaded = searchParams.get("loadConTypes") === "true";
  const useTypesLoaded = searchParams.get("loadUseTypes") === "true";
  const subTypesLoaded = searchParams.get("loadSubTypes") === "true";

  // Helper to update URL with new param while preserving existing params
  // Only triggers if not already triggered and not already loaded
  const updateUrlParam = useCallback((paramName: string) => {
    // Skip if already triggered or already in URL
    if (triggeredLoadsRef.current.has(paramName)) return;
    
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(paramName) === "true") return;
    
    // Mark as triggered to prevent duplicate calls
    triggeredLoadsRef.current.add(paramName);
    params.set(paramName, "true");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // Dropdown click handlers - update URL to trigger server-side fetch (only once)
  const handleFloorDropdownClick = useCallback(() => {
    if (floors.length === 0) updateUrlParam("loadFloors");
  }, [floors.length, updateUrlParam]);

  const handleConTypeDropdownClick = useCallback(() => {
    if (constructionTypes.length === 0) updateUrlParam("loadConTypes");
  }, [constructionTypes.length, updateUrlParam]);

  const handleUseTypeDropdownClick = useCallback(() => {
    if (useTypes.length === 0) {
      // Build URL with both params at once to avoid duplicate navigation
      const params = new URLSearchParams(searchParams.toString());
      let needsUpdate = false;
      
      if (params.get("loadUseTypes") !== "true" && !triggeredLoadsRef.current.has("loadUseTypes")) {
        params.set("loadUseTypes", "true");
        triggeredLoadsRef.current.add("loadUseTypes");
        needsUpdate = true;
      }
      if (params.get("loadSubTypes") !== "true" && !triggeredLoadsRef.current.has("loadSubTypes")) {
        params.set("loadSubTypes", "true");
        triggeredLoadsRef.current.add("loadSubTypes");
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }
  }, [useTypes.length, searchParams, pathname, router]);

  const handleClose = () => {
    onClose?.();
    if (returnTo === 'commercial') {
        router.push("/property-tax/ptis?tab=apartment&appartmentTab=commercial&subTab=rateable&pageNumber=1");
    } else if (returnTo === 'amenities') {
        router.push("/property-tax/ptis?tab=apartment");
    } else {
        router.push("/property-tax/ptis?tab=apartment&appartmentTab=residential&subTab=rateable&pageNumber=1");
    }
  };

  // ── Floor QC row state ─────────────────────────────────────────────────────
  const [floorData, setFloorData] = useState<FloorDataRow[]>([
    { id: "row-1", floorId: "", conYear: "2020", asstYear: "2024-25", constructionTypeId: "", typeOfUseId: "", subTypeOfUseId: "", area: "1020", rentMY: "", rateMY: "", rentalValue: "", depreciation: "", alv: "", mr: "", rv: "" },
    { id: "row-2", floorId: "", conYear: "2020", asstYear: "2024-25", constructionTypeId: "", typeOfUseId: "", subTypeOfUseId: "", area: "850", rentMY: "", rateMY: "", rentalValue: "", depreciation: "", alv: "", mr: "", rv: "" },
  ]);

  /** Update a single field in the given row; resets subtype when use-type changes */
  const updateRow = (id: string, field: keyof FloorDataRow, value: string) => {
    setFloorData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, [field]: value };
        if (field === "typeOfUseId") next.subTypeOfUseId = "";
        return next;
      })
    );
  };

  // ── Dropdown option lists (memoised) ──────────────────────────────────────

  const floorOptions = useMemo(
    () => floors.map((f) => ({ value: String(f.floorId), label: f.description || f.floorCode })),
    [floors]
  );

  const conTypeOptions = useMemo(
    () => constructionTypes.map((c) => ({ value: String(c.constructionTypeId), label: c.description || c.constructionCode })),
    [constructionTypes]
  );

  const useTypeOptions = useMemo(
    () => useTypes.map((u) => ({ value: String(u.typeOfUseId), label: u.description || u.typeOfUseCode })),
    [useTypes]
  );

  /** Returns filtered sub-type options for the given typeOfUseId */
  const getSubTypeOptions = (typeOfUseId: string): { value: string; label: string }[] =>
    typeOfUseId
      ? allSubTypes
          .filter((s) => String(s.typeOfUseId) === typeOfUseId)
          .map((s) => ({ value: String(s.subTypeOfUseId), label: s.description }))
      : [];

  // ── Floor QC column definitions ───────────────────────────────────────────

  const makeHeader = (label: string) =>
    (
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

  const floorColumns: Column<FloorDataRow>[] = useMemo(
    () => [
      {
        key: "floorId",
        label: makeHeader("Floor"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactSelect
            value={row.floorId}
            onChange={(v) => updateRow(row.id, "floorId", v)}
            options={floorOptions}
            onDropdownClick={handleFloorDropdownClick}
            isLoading={floorsLoaded && floors.length === 0}
          />
        ),
      },
      {
        key: "conYear",
        label: makeHeader("Con Year"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <div className="bg-white rounded border border-gray-300 px-1 py-0.5 text-[10px] text-center min-w-[60px]">
            {row.conYear || "-"}
          </div>
        ),
      },
      {
        key: "asstYear",
        label: makeHeader("Asst Year"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <div className="bg-white rounded border border-gray-300 px-1 py-0.5 text-[10px] text-center min-w-[60px]">
            {row.asstYear || "-"}
          </div>
        ),
      },
      {
        key: "constructionTypeId",
        label: makeHeader("Con Type"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactSelect
            value={row.constructionTypeId}
            onChange={(v) => updateRow(row.id, "constructionTypeId", v)}
            options={conTypeOptions}
            onDropdownClick={handleConTypeDropdownClick}
            isLoading={conTypesLoaded && constructionTypes.length === 0}
          />
        ),
      },
      {
        key: "typeOfUseId",
        label: makeHeader("Use"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactSelect
            value={row.typeOfUseId}
            onChange={(v) => updateRow(row.id, "typeOfUseId", v)}
            options={useTypeOptions}
            onDropdownClick={handleUseTypeDropdownClick}
            isLoading={useTypesLoaded && useTypes.length === 0}
          />
        ),
      },
      {
        key: "subTypeOfUseId",
        label: makeHeader("Sub Type Of Use"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactSelect
            value={row.subTypeOfUseId}
            onChange={(v) => updateRow(row.id, "subTypeOfUseId", v)}
            options={getSubTypeOptions(row.typeOfUseId)}
            disabled={!row.typeOfUseId}
            onDropdownClick={handleUseTypeDropdownClick}
            isLoading={subTypesLoaded && allSubTypes.length === 0}
          />
        ),
      },
      {
        key: "area",
        label: makeHeader("Area"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactCellInput value={row.area} onChange={(v) => updateRow(row.id, "area", v)} />
        ),
      },
      {
        key: "rentMY",
        label: makeHeader("Rent M/Y"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactCellInput value={row.rentMY} onChange={(v) => updateRow(row.id, "rentMY", v)} />
        ),
      },
      {
        key: "rateMY",
        label: makeHeader("Rate M/Y"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactCellInput value={row.rateMY} onChange={(v) => updateRow(row.id, "rateMY", v)} />
        ),
      },
      {
        key: "rentalValue",
        label: makeHeader("Rental Value"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactCellInput value={row.rentalValue} onChange={(v) => updateRow(row.id, "rentalValue", v)} />
        ),
      },
      {
        key: "depreciation",
        label: makeHeader("Depreciation"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactCellInput value={row.depreciation} onChange={(v) => updateRow(row.id, "depreciation", v)} />
        ),
      },
      {
        key: "alv",
        label: makeHeader("ALV"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactCellInput value={row.alv} onChange={(v) => updateRow(row.id, "alv", v)} />
        ),
      },
      {
        key: "mr",
        label: makeHeader("M&R"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactCellInput value={row.mr} onChange={(v) => updateRow(row.id, "mr", v)} />
        ),
      },
      {
        key: "rv",
        label: makeHeader("RV"),
        cellClassName: "px-0.5 py-0.5",
        render: (_v, row) => (
          <CompactCellInput value={row.rv} onChange={(v) => updateRow(row.id, "rv", v)} />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [floorOptions, conTypeOptions, useTypeOptions, allSubTypes, floorData, floorsLoaded, conTypesLoaded, useTypesLoaded, subTypesLoaded, floors, constructionTypes, useTypes]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      width="xxl"
      title={
        <div className="flex items-center justify-between w-full">
          <h2 className="text-base font-semibold text-gray-900">{"Property Details"}</h2>
           <div className="flex items-center gap-1.5 text-[10px]">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">{`Ward: ${propertyData?.ward || "13"}`}</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded font-medium">{`Bldg: ${propertyData?.buildingNo || "B-12"}`}</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">{`Prop: ${propertyData?.propertyNo || "RP001"}`}</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium">{`Society: ${propertyData?.society || "Green Valley"}`}</span>
          </div> 
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">{"← Previous"}</button>
            <span className="text-xs text-gray-600 font-medium">{"1 / 8"}</span>
            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">{"Next →"}</button>
          </div>
          <SaveButton />
        </div>
      }
    >
          <div className="p-3 flex flex-row gap-4">
              {/* LEFT SIDE */}
              <div className="w-full lg:w-10/12 space-y-3">

                  {/* Basic Information */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <button
                          type="button"
                          onClick={() => setIsBasicInfoOpen(!isBasicInfoOpen)}
                          className="w-full bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 flex items-center justify-between hover:from-gray-100 hover:to-gray-150 transition"
                      >
                          <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-sm text-gray-800">{"Basic Information"}</span>
                          </div>
                          {isBasicInfoOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      </button>
                      {isBasicInfoOpen && (
                          <div className="p-3 bg-white">
                              <div className="grid grid-cols-6 gap-2 mb-2">
                                  <CompactInput label="Owner Name *" value={propertyData?.ownerName || "Rajesh Sharma"} />
                                  <CompactInput label="Occupier Name *" value={propertyData?.occupierName || "Rajesh Sharma"} />
                                  <CompactInput label="Renter Name" value={propertyData?.renterName || "-"} />
                                  <CompactInput label="Mobile" value={propertyData?.mobileNo || "9876543210"} />
                                  <CompactInput label="Email" value={propertyData?.email || "rajesh@gmail.com"} />
                                  <CompactInput label="BHK" value={propertyData?.bhk || "2BHK"} />
                              </div>
                              <div className="grid grid-cols-6 gap-2 mb-2">
                                  <CompactInput label="Wing" value={propertyData?.wingName || "A"} />
                                  <CompactInput label="Flat/Shop No *" value={propertyData?.flatNo || "101"} />
                                  <CompactInput label="Old Property No" value={propertyData?.oldPropertyNo || "OLD-A-101"} />
                                  <CompactInput label="Description *" value={propertyData?.description || "Residential Flat"} />
                                  <CompactInput label="Shop Name" value={propertyData?.shopName || "-"} />
                                  <CompactInput label="Remark" value={propertyData?.remark || "-"} />
                              </div>
                              <div className="grid grid-cols-6 gap-2">
                                  <CompactInput label="Old RV" value={propertyData?.oldRV || "47000"} />
                                  <CompactInput label="New RV" value={propertyData?.newRV || "48750"} />
                                  <CompactInput label="Old Tax" value={propertyData?.oldTax || "9729"} />
                                  <CompactInput label="New Tax" value={propertyData?.newTax || "10095"} />
                                  <CompactInput label="Old Area" value={propertyData?.oldConstructionArea || "850"} />
                                  <CompactInput label="New Area" value={propertyData?.buildupArea || "950"} />
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Floor QC */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <button
                          type="button"
                          onClick={() => setIsFloorQCOpen(!isFloorQCOpen)}
                          className="w-full bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 flex items-center justify-between hover:from-gray-100 hover:to-gray-150 transition"
                      >
                          <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-sm text-gray-800">{"Floor QC"}</span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">{`${floorData.length} floors`}</span>
                          </div>
                      </button>

                      {isFloorQCOpen && (
                          <div className="bg-white">
                              <MasterTable
                                  columns={floorColumns.map((col) => ({
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

                  {/* Tax Details */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <TaxDetailsTable />
                  </div>
              </div>

              {/* RIGHT SIDE — photos */}
              <div className="w-full lg:w-2/12">
                  <div className="grid grid-cols-1 gap-3">
                      <div className="border border-dashed border-gray-300 rounded-lg p-3 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                          <div className="w-150 h-50 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                              <ImageIcon className="text-gray-400" />
                          </div>
                      </div>
                      <div className="border border-dashed border-gray-300 rounded-lg p-3 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                          <div className="w-150 h-50 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                              <Map className="text-gray-400" />
                          </div>
                      </div>
                      <div className="border border-dashed border-gray-300 rounded-lg p-3 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                          <div className="w-150 h-50 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                              <PenTool className="text-gray-400" />
                          </div>
                      </div>
                  </div>
              </div>
      </div>
    </Drawer>
  );
};

export default ResidentialEditScreen;