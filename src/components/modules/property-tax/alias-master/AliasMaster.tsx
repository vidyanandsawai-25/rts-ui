/* eslint-disable i18next/no-literal-string */
"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Home,
  User,
  Building2,
  Percent,
  Receipt,
  RotateCw,
  Plus,
  Eye,
  Info,
  Layers,
  BookPlus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SearchInput } from "@/components/common/SearchInput";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/common/ActionButton";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { MasterTable, Column } from "@/components/common/MasterTable";
import TableHeader from "@/components/common/TableHeader";
import { ImportButton, ExportButton, AddButton } from "@/components/common/ActionButtons";

// ----------------------------------------------------
// TYPES
// ----------------------------------------------------
interface FieldAlias {
  id: string;
  backendField: string;
  dbName: string;
  defaultLabel: string;
  alias: string;
  screenUsage: string[];
  mandatory: boolean;
  status: "Custom" | "Pending" | "Default";
  [key: string]: unknown;
}

type GroupKey = "property" | "owner" | "building" | "tax" | "collection";

interface GroupConfig {
  key: GroupKey;
  label: string;
  subLabel: string;
  icon: React.ElementType;
  targetTotal: number;
  targetCustom: number;
  targetPending: number;
  targetDefault: number;
}

// ----------------------------------------------------
// CONFIGURATIONS & INITIAL PRIMARY DATA
// ----------------------------------------------------
const GROUPS: GroupConfig[] = [
  { key: "property", label: "Property Details", subLabel: "38 fields", icon: Home, targetTotal: 38, targetCustom: 21, targetPending: 3, targetDefault: 17 },
  { key: "owner", label: "Owner / Occupier", subLabel: "24 fields", icon: User, targetTotal: 24, targetCustom: 12, targetPending: 2, targetDefault: 12 },
  { key: "building", label: "Building Details", subLabel: "18 fields", icon: Building2, targetTotal: 18, targetCustom: 10, targetPending: 1, targetDefault: 8 },
  { key: "tax", label: "Tax Heads", subLabel: "22 fields", icon: Percent, targetTotal: 22, targetCustom: 14, targetPending: 2, targetDefault: 8 },
  { key: "collection", label: "Collection", subLabel: "14 fields", icon: Receipt, targetTotal: 14, targetCustom: 8, targetPending: 1, targetDefault: 6 },
];

const PRIMARY_FIELDS: Record<GroupKey, Omit<FieldAlias, "id">[]> = {
  property: [
    { backendField: "PropertyNo", dbName: "property_no", defaultLabel: "Property No.", alias: "Property Number", screenUsage: ["Survey", "Assessment"], mandatory: true, status: "Custom" },
    { backendField: "WardNo", dbName: "ward_no", defaultLabel: "Ward No.", alias: "Ward / Sector No.", screenUsage: ["Survey", "Assessment"], mandatory: true, status: "Custom" },
    { backendField: "PartitionNo", dbName: "partition_no", defaultLabel: "Partition No.", alias: "Partition Number", screenUsage: ["Survey"], mandatory: false, status: "Custom" },
    { backendField: "OwnerName", dbName: "owner_name", defaultLabel: "Owner Name", alias: "Property Holder Name", screenUsage: ["Survey", "Assessment"], mandatory: true, status: "Custom" },
    { backendField: "PropertyDescription", dbName: "property_description", defaultLabel: "Property Description", alias: "Property Usage Descriptor", screenUsage: ["Survey", "Assessment"], mandatory: false, status: "Pending" },
    { backendField: "RateableValue", dbName: "rateable_value", defaultLabel: "Rateable Value", alias: "Annual Rateable Value", screenUsage: ["Assessment"], mandatory: true, status: "Custom" },
    { backendField: "GeneralTax", dbName: "tax_general", defaultLabel: "General Tax", alias: "General Property Tax", screenUsage: ["Assessment", "Tax Head"], mandatory: true, status: "Custom" },
    { backendField: "ReceiptNo", dbName: "receipt_no", defaultLabel: "Receipt No.", alias: "Collection Receipt Number", screenUsage: ["Collection"], mandatory: true, status: "Custom" },
  ],
  owner: [
    { backendField: "OccupierName", dbName: "occupier_name", defaultLabel: "Occupier Name", alias: "Current Occupier Name", screenUsage: ["Survey"], mandatory: false, status: "Custom" },
    { backendField: "OwnerMobile", dbName: "owner_mobile", defaultLabel: "Owner Mobile", alias: "Primary Contact Number", screenUsage: ["Survey", "Assessment"], mandatory: true, status: "Custom" },
    { backendField: "OwnerEmail", dbName: "owner_email", defaultLabel: "Owner Email", alias: "Owner Email", screenUsage: ["Survey"], mandatory: false, status: "Default" },
    { backendField: "FatherHusbandName", dbName: "father_husband_name", defaultLabel: "Father/Husband Name", alias: "Caretaker / Guardian Name", screenUsage: ["Survey"], mandatory: true, status: "Pending" },
    { backendField: "RelationType", dbName: "relation_type", defaultLabel: "Relation Type", alias: "Relation Type", screenUsage: ["Survey"], mandatory: false, status: "Default" },
    { backendField: "BillingAddress", dbName: "billing_address", defaultLabel: "Billing Address", alias: "Mailing Address", screenUsage: ["Assessment"], mandatory: true, status: "Custom" },
  ],
  building: [
    { backendField: "ConstructionType", dbName: "construction_type", defaultLabel: "Construction Type", alias: "Structure Type", screenUsage: ["Survey", "Assessment"], mandatory: true, status: "Custom" },
    { backendField: "TotalFloors", dbName: "total_floors", defaultLabel: "Total Floors", alias: "Storey Count", screenUsage: ["Survey"], mandatory: true, status: "Custom" },
    { backendField: "BuiltUpArea", dbName: "built_up_area", defaultLabel: "Built Up Area", alias: "Covered Area (Sq.Ft.)", screenUsage: ["Survey", "Assessment"], mandatory: true, status: "Custom" },
    { backendField: "YearOfConstruction", dbName: "year_of_construction", defaultLabel: "Construction Year", alias: "Construction Year", screenUsage: ["Survey"], mandatory: false, status: "Default" },
    { backendField: "RoofType", dbName: "roof_type", defaultLabel: "Roof Type", alias: "Ceiling / Roof Structure", screenUsage: ["Survey"], mandatory: false, status: "Pending" },
  ],
  tax: [
    { backendField: "WaterTax", dbName: "tax_water", defaultLabel: "Water Tax", alias: "Municipal Water Charge", screenUsage: ["Tax Head"], mandatory: true, status: "Custom" },
    { backendField: "SewerageTax", dbName: "tax_sewerage", defaultLabel: "Sewerage Tax", alias: "Drainage Utility Fee", screenUsage: ["Tax Head"], mandatory: true, status: "Custom" },
    { backendField: "EducationCess", dbName: "cess_education", defaultLabel: "Education Cess", alias: "Education Cess", screenUsage: ["Tax Head"], mandatory: false, status: "Default" },
    { backendField: "PenaltyInt", dbName: "penalty_interest", defaultLabel: "Penalty Interest", alias: "Delay Fine / Interest", screenUsage: ["Tax Head", "Collection"], mandatory: false, status: "Custom" },
  ],
  collection: [
    { backendField: "PaymentMode", dbName: "payment_mode", defaultLabel: "Payment Mode", alias: "Transaction Method", screenUsage: ["Collection"], mandatory: true, status: "Custom" },
    { backendField: "BankName", dbName: "bank_name", defaultLabel: "Bank Name", alias: "Bank Name", screenUsage: ["Collection"], mandatory: false, status: "Default" },
    { backendField: "ChqDdNo", dbName: "chq_dd_no", defaultLabel: "Cheque/DD No.", alias: "Reference Instrument No.", screenUsage: ["Collection"], mandatory: false, status: "Custom" },
    { backendField: "CollectorName", dbName: "collector_name", defaultLabel: "Collector Name", alias: "Attending Officer", screenUsage: ["Collection"], mandatory: true, status: "Pending" },
  ],
};

const FILLER_DETAILS: Record<GroupKey, { field: string; db: string; label: string }[]> = {
  property: [
    { field: "ZoneCode", db: "zone_code", label: "Zone Code" },
    { field: "StreetName", db: "street_name", label: "Street Name" },
    { field: "LocalityName", db: "locality_name", label: "Locality Name" },
    { field: "CircleNo", db: "circle_no", label: "Circle No." },
    { field: "HoldingNo", db: "holding_no", label: "Holding No." },
    { field: "SubWardNo", db: "sub_ward_no", label: "Sub Ward No." },
    { field: "PlotNo", db: "plot_no", label: "Plot No." },
    { field: "KhataNo", db: "khata_no", label: "Khata No." },
    { field: "TaxZone", db: "tax_zone", label: "Tax Zone" },
    { field: "Landmark", db: "landmark", label: "Landmark" },
    { field: "RegistryNo", db: "registry_no", label: "Registry No." },
    { field: "DeedDate", db: "deed_date", label: "Deed Date" },
    { field: "PinCode", db: "pincode", label: "Pin Code" },
    { field: "CityName", db: "city_name", label: "City Name" },
    { field: "StateName", db: "state_name", label: "State" },
    { field: "CountryName", db: "country_name", label: "Country" },
    { field: "AssessedValue", db: "assessed_value", label: "Assessed Value" },
    { field: "Latitude", db: "latitude", label: "Latitude" },
    { field: "Longitude", db: "longitude", label: "Longitude" },
    { field: "SurveyNo", db: "survey_no", label: "Survey No." },
    { field: "BlockName", db: "block_name", label: "Block Name" },
    { field: "DistrictName", db: "district_name", label: "District" },
    { field: "TehsilName", db: "tehsil_name", label: "Tehsil" },
    { field: "Panchayat", db: "panchayat_name", label: "Gram Panchayat" },
    { field: "NorthBound", db: "north_boundary", label: "North Boundary" },
    { field: "SouthBound", db: "south_boundary", label: "South Boundary" },
    { field: "EastBound", db: "east_boundary", label: "East Boundary" },
    { field: "WestBound", db: "west_boundary", label: "West Boundary" },
    { field: "ExemptStatus", db: "is_exempt", label: "Exempt Status" },
    { field: "ExemptReason", db: "exempt_reason", label: "Exemption Reason" },
    { field: "TaxStatus", db: "tax_status", label: "Tax Status" },
    { field: "PropertyAge", db: "property_age", label: "Property Age" },
    { field: "DemolitionDate", db: "demolition_date", label: "Demolition Date" },
    { field: "SurveyorCode", db: "surveyor_code", label: "Surveyor Code" },
  ],
  owner: [
    { field: "AadharNo", db: "aadhar_no", label: "Aadhar No." },
    { field: "PanCard", db: "pan_card", label: "PAN Card" },
    { field: "AltMobile", db: "alt_mobile", label: "Alternate Mobile" },
    { field: "Gender", db: "gender", label: "Gender" },
    { field: "Nationality", db: "nationality", label: "Nationality" },
    { field: "OwnerType", db: "owner_type", label: "Owner Type" },
    { field: "CoOwnerName", db: "co_owner_name", label: "Co-Owner Name" },
    { field: "CoOwnerMobile", db: "co_owner_mobile", label: "Co-Owner Mobile" },
    { field: "OwnerSignature", db: "owner_signature_url", label: "Owner Signature" },
    { field: "OccupierMobile", db: "occupier_mobile", label: "Occupier Mobile" },
    { field: "PropertyShare", db: "property_share_pct", label: "Property Share %" },
    { field: "Representative", db: "rep_name", label: "Representative Name" },
    { field: "RepContact", db: "rep_contact", label: "Representative Contact" },
    { field: "RepRelation", db: "rep_relation", label: "Representative Relation" },
    { field: "PossessionDate", db: "possession_date", label: "Possession Date" },
    { field: "TitleDeed", db: "title_deed_no", label: "Title Deed No." },
    { field: "IsResident", db: "is_resident", label: "Is Resident" },
    { field: "OwnerCategory", db: "owner_category", label: "Owner Category" },
  ],
  building: [
    { field: "PlotArea", db: "plot_area", label: "Plot Area" },
    { field: "CarpetArea", db: "carpet_area", label: "Carpet Area" },
    { field: "NoOfUnits", db: "no_of_units", label: "No. of Units" },
    { field: "UtilityType", db: "utility_type", label: "Utility Type" },
    { field: "StructureAge", db: "structure_age", label: "Structure Age" },
    { field: "ElevationHeight", db: "elevation_height", label: "Elevation Height" },
    { field: "BasementArea", db: "basement_area", label: "Basement Area" },
    { field: "BalconyArea", db: "balcony_area", label: "Balcony Area" },
    { field: "GarageStatus", db: "has_garage", label: "Has Garage" },
    { field: "WaterSource", db: "water_source", label: "Water Source" },
    { field: "ElectricityNo", db: "electricity_conn_no", label: "Electricity Conn. No." },
    { field: "PlinthArea", db: "plinth_area", label: "Plinth Area" },
    { field: "SanctionPlanNo", db: "sanction_plan_no", label: "Sanction Plan No." },
  ],
  tax: [
    { field: "Surcharge", db: "surcharge_amt", label: "Surcharge" },
    { field: "CleanIndiaCess", db: "clean_india_cess", label: "Swachh Bharat Cess" },
    { field: "FireTax", db: "fire_tax_amt", label: "Fire Tax" },
    { field: "LibraryCess", db: "library_cess_amt", label: "Library Cess" },
    { field: "PenaltyCharge", db: "penalty_charge_amt", label: "Penalty Charge" },
    { field: "RebateAmount", db: "rebate_amt", label: "Rebate Amount" },
    { field: "TaxArrears", db: "tax_arrears", label: "Tax Arrears" },
    { field: "CurrentTax", db: "current_tax_demand", label: "Current Tax Demand" },
    { field: "ServiceTax", db: "service_tax_amt", label: "Service Tax" },
    { field: "LightingTax", db: "lighting_tax_amt", label: "Lighting Tax" },
    { field: "WaterBenefitTax", db: "water_benefit_tax", label: "Water Benefit Tax" },
    { field: "SewerageBenefitTax", db: "sew_benefit_tax", label: "Sewerage Benefit Tax" },
    { field: "OtherCesses", db: "other_cesses_amt", label: "Other Cesses" },
    { field: "TaxDiscount", db: "tax_discount_pct", label: "Tax Discount %" },
  ],
  collection: [
    { field: "ReceiptDate", db: "receipt_date", label: "Receipt Date" },
    { field: "ChequeDate", db: "cheque_date", label: "Cheque/DD Date" },
    { field: "ChamberName", db: "chamber_name", label: "Chamber Name" },
    { field: "CounterNo", db: "counter_no", label: "Counter No." },
    { field: "ScrollNo", db: "scroll_no", label: "Scroll No." },
    { field: "CollectionPoint", db: "collection_point_id", label: "Collection Point" },
    { field: "CashierCode", db: "cashier_code", label: "Cashier Code" },
    { field: "InstrumentBank", db: "instrument_bank_name", label: "Instrument Bank" },
    { field: "ReceiptRemarks", db: "receipt_remarks", label: "Receipt Remarks" },
    { field: "ReconciliationStatus", db: "reconciled_status", label: "Reconciliation Status" },
  ],
};

// ----------------------------------------------------
// EMPTY FORM STATE HELPERS
// ----------------------------------------------------
const SCREEN_USAGE_OPTIONS = ["Survey", "Assessment", "Tax Head", "Collection"];

interface AliasFormState {
  backendField: string;
  dbName: string;
  defaultLabel: string;
  alias: string;
  screenUsage: string[];
  mandatory: boolean;
}

interface LibraryGroupFormState {
  label: string;
  subLabel: string;
  icon: string;
}

const emptyAliasForm = (): AliasFormState => ({
  backendField: "",
  dbName: "",
  defaultLabel: "",
  alias: "",
  screenUsage: [],
  mandatory: false,
});

const emptyLibraryGroupForm = (): LibraryGroupFormState => ({
  label: "",
  subLabel: "",
  icon: "Home",
});

// ----------------------------------------------------
// DATA GENERATION
// ----------------------------------------------------
function generateFieldAliases(): Record<GroupKey, FieldAlias[]> {
  const finalData: Record<GroupKey, FieldAlias[]> = {} as Record<GroupKey, FieldAlias[]>;

  GROUPS.forEach((group) => {
    const primary = PRIMARY_FIELDS[group.key];
    const groupFields: FieldAlias[] = [];

    primary.forEach((f, idx) => {
      groupFields.push({ ...f, id: `${group.key}-primary-${idx + 1}` } as FieldAlias);
    });

    const currentCustom = primary.filter((f) => f.status === "Custom").length;
    const currentPending = primary.filter((f) => f.status === "Pending").length;
    const currentDefault = primary.filter((f) => f.status === "Default").length;

    const neededCustom = Math.max(0, group.targetCustom - currentCustom);
    const neededPending = Math.max(0, group.targetPending - currentPending);
    const neededDefault = Math.max(0, group.targetDefault - currentDefault);

    const pool = FILLER_DETAILS[group.key] || [];
    let poolIdx = 0;

    for (let i = 0; i < neededCustom; i++) {
      const item = pool[poolIdx % pool.length];
      groupFields.push({
        id: `${group.key}-filler-custom-${i + 1}`,
        backendField: item ? item.field : `CustomField_${i + 1}`,
        dbName: item ? item.db : `custom_field_${i + 1}`,
        defaultLabel: item ? item.label : `Custom Label ${i + 1}`,
        alias: item ? `${item.label} Customized` : `Customized Label ${i + 1}`,
        screenUsage: ["Survey", "Assessment"],
        mandatory: i % 3 === 0,
        status: "Custom",
      });
      poolIdx++;
    }

    for (let i = 0; i < neededPending; i++) {
      const item = pool[poolIdx % pool.length];
      groupFields.push({
        id: `${group.key}-filler-pending-${i + 1}`,
        backendField: item ? item.field : `PendingField_${i + 1}`,
        dbName: item ? item.db : `pending_field_${i + 1}`,
        defaultLabel: item ? item.label : `Pending Label ${i + 1}`,
        alias: item ? `${item.label} Project Alias` : `Project Alias ${i + 1}`,
        screenUsage: ["Survey"],
        mandatory: false,
        status: "Pending",
      });
      poolIdx++;
    }

    for (let i = 0; i < neededDefault; i++) {
      const item = pool[poolIdx % pool.length];
      const defaultLbl = item ? item.label : `Field Label ${i + 1}`;
      groupFields.push({
        id: `${group.key}-filler-default-${i + 1}`,
        backendField: item ? item.field : `Field_${i + 1}`,
        dbName: item ? item.db : `field_${i + 1}`,
        defaultLabel: defaultLbl,
        alias: defaultLbl,
        screenUsage: ["Assessment"],
        mandatory: i % 2 === 0,
        status: "Default",
      });
      poolIdx++;
    }

    finalData[group.key] = groupFields.slice(0, group.targetTotal);
  });

  return finalData;
}

// ----------------------------------------------------
// COMPONENT
// ----------------------------------------------------
export function AliasMaster() {
  // ── Core data ──
  const [masterData, setMasterData] = useState<Record<GroupKey, FieldAlias[]>>(
    () => generateFieldAliases()
  );

  // Dynamic groups list (starts from static config, new groups can be added)
  const [groups, setGroups] = useState<GroupConfig[]>(GROUPS);

  // ── Navigation ──
  const [selectedGroup, setSelectedGroup] = useState<GroupKey>("property");

  // ── Search & pagination ──
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // ── Add Alias modal ──
  const [isAddAliasModalOpen, setIsAddAliasModalOpen] = useState(false);
  const [aliasForm, setAliasForm] = useState<AliasFormState>(emptyAliasForm());
  const [aliasFormErrors, setAliasFormErrors] = useState<Partial<AliasFormState>>({});

  // ── Add Library Group modal ──
  const [isAddLibraryModalOpen, setIsAddLibraryModalOpen] = useState(false);
  const [libraryGroupForm, setLibraryGroupForm] = useState<LibraryGroupFormState>(
    emptyLibraryGroupForm()
  );
  const [libraryGroupFormErrors, setLibraryGroupFormErrors] = useState<
    Partial<LibraryGroupFormState>
  >({});

  // ── Preview modal ──
  const [previewField, setPreviewField] = useState<FieldAlias | null>(null);

  // ── Derived data ──
  const activeFieldsList = useMemo(
    () => masterData[selectedGroup] || [],
    [masterData, selectedGroup]
  );

  const filteredFields = useMemo(() => {
    if (!searchQuery.trim()) return activeFieldsList;
    const query = searchQuery.toLowerCase();
    return activeFieldsList.filter(
      (item) =>
        item.backendField.toLowerCase().includes(query) ||
        item.dbName.toLowerCase().includes(query) ||
        item.defaultLabel.toLowerCase().includes(query) ||
        item.alias.toLowerCase().includes(query)
    );
  }, [activeFieldsList, searchQuery]);

  const paginatedFields = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredFields.slice(startIndex, startIndex + pageSize);
  }, [filteredFields, currentPage, pageSize]);

  const groupStats = useMemo(() => {
    const total = activeFieldsList.length;
    const customized = activeFieldsList.filter(
      (f) => f.status === "Custom" || f.status === "Pending"
    ).length;
    const defaults = activeFieldsList.filter((f) => f.status === "Default").length;
    const pending = activeFieldsList.filter((f) => f.status === "Pending").length;
    return { total, customized, defaults, pending };
  }, [activeFieldsList]);

  const totalPages = Math.max(1, Math.ceil(filteredFields.length / pageSize));

  // ── Table columns ──
  const columns: Column<FieldAlias>[] = [
    {
      key: "backendField",
      label: "Backend Field",
      width: "24%",
      render: (_value, row) => (
        <div>
          <div className="font-bold text-sm text-slate-800">{row.backendField}</div>
          <div className="text-[10px] text-slate-400 font-medium font-mono mt-0.5">{row.dbName}</div>
        </div>
      ),
    },
    {
      key: "defaultLabel",
      label: "Default Label",
      width: "18%",
      render: (value) => <span className="text-sm text-slate-600">{value as string}</span>,
    },
    {
      key: "alias",
      label: "Project Alias",
      width: "24%",
      render: (_value, row) => (
        <Input
          type="text"
          value={row.alias}
          onChange={(e) => handleAliasInlineUpdate(row.id, e.target.value)}
          onBlur={(e) => handleAliasInlineBlur(row, e.target.value)}
          placeholder={row.defaultLabel}
          className="w-full text-sm font-semibold bg-white border-slate-200"
        />
      ),
    },
    {
      key: "screenUsage",
      label: "Screen Usage",
      width: "16%",
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {(value as string[])?.map((use: string) => (
            <Badge key={use} variant="default" size="sm">
              {use}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "mandatory",
      label: "Mandatory",
      width: "8%",
      align: "center",
      render: (value) => (
        <span className={value ? "text-emerald-600 font-semibold" : "text-slate-400"}>
          {value ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "10%",
      align: "center",
      render: (_value, row) => (
        <StatusBadge
          variant={row.status === "Pending" ? "pending" : "info"}
          label={row.status}
          className={cn(
            row.status === "Custom" && "bg-emerald-50 text-emerald-700 border-emerald-300",
            row.status === "Default" && "bg-slate-100 text-slate-500 border-slate-300"
          )}
        />
      ),
    },
  ];

  const renderTableRowActions = (row: FieldAlias) => (
    <button
      onClick={() => setPreviewField(row)}
      className="inline-flex items-center justify-center p-1.5 rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-50/30 text-blue-600 transition-all duration-150"
      title={`Preview ${row.backendField}`}
    >
      <Eye className="w-4 h-4" />
    </button>
  );

  // ── Inline alias editing (single row, immediate) ──
  const handleAliasInlineUpdate = (fieldId: string, newText: string) => {
    setMasterData((prev) => {
      const updatedList = prev[selectedGroup].map((field) => {
        if (field.id !== fieldId) return field;
        const trimmed = newText.trim();
        let nextStatus: "Custom" | "Pending" | "Default" = field.status;
        if (trimmed === "" || trimmed === field.defaultLabel) {
          nextStatus = "Default";
        } else if (field.status === "Default") {
          nextStatus = "Custom";
        }
        return {
          ...field,
          alias: newText, // keep raw value while typing
          status: nextStatus,
        };
      });
      return { ...prev, [selectedGroup]: updatedList };
    });
  };

  const handleAliasInlineBlur = (field: FieldAlias, value: string) => {
    const trimmed = value.trim();
    const finalAlias = trimmed === "" ? field.defaultLabel : trimmed;

    setMasterData((prev) => {
      const updatedList = prev[selectedGroup].map((f) => {
        if (f.id !== field.id) return f;
        return { ...f, alias: finalAlias };
      });
      return { ...prev, [selectedGroup]: updatedList };
    });

    if (trimmed !== "" && trimmed !== field.alias) {
      toast.success(`Alias for "${field.backendField}" updated to "${finalAlias}"`);
    }
  };

  // ── Refresh / reset active group ──
  const handleRefreshActiveGroup = () => {
    const freshData = generateFieldAliases();
    setMasterData((prev) => ({ ...prev, [selectedGroup]: freshData[selectedGroup] }));
    toast.success(
      `Refreshed "${groups.find((g) => g.key === selectedGroup)?.label}" fields to original defaults.`
    );
  };

  // ── Add Alias Modal handlers ──
  const handleOpenAddAliasModal = () => {
    setAliasForm(emptyAliasForm());
    setAliasFormErrors({});
    setIsAddAliasModalOpen(true);
  };

  const handleCloseAddAliasModal = () => {
    setIsAddAliasModalOpen(false);
    setAliasForm(emptyAliasForm());
    setAliasFormErrors({});
  };

  const handleAliasFormChange = (field: keyof AliasFormState, value: unknown) => {
    setAliasForm((prev) => ({ ...prev, [field]: value }));
    if (aliasFormErrors[field]) {
      setAliasFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAliasScreenUsageToggle = (screen: string) => {
    setAliasForm((prev) => ({
      ...prev,
      screenUsage: prev.screenUsage.includes(screen)
        ? prev.screenUsage.filter((s) => s !== screen)
        : [...prev.screenUsage, screen],
    }));
  };

  const validateAliasForm = (): boolean => {
    const errors: Partial<AliasFormState> = {};
    if (!aliasForm.backendField.trim()) errors.backendField = "Backend field name is required.";
    if (!aliasForm.dbName.trim()) errors.dbName = "DB column name is required.";
    if (!aliasForm.defaultLabel.trim()) errors.defaultLabel = "Default label is required.";
    setAliasFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveNewAlias = () => {
    if (!validateAliasForm()) return;

    const newEntry: FieldAlias = {
      id: `${selectedGroup}-custom-${Date.now()}`,
      backendField: aliasForm.backendField.trim(),
      dbName: aliasForm.dbName.trim(),
      defaultLabel: aliasForm.defaultLabel.trim(),
      alias: aliasForm.alias.trim() || aliasForm.defaultLabel.trim(),
      screenUsage: aliasForm.screenUsage,
      mandatory: aliasForm.mandatory,
      status: aliasForm.alias.trim() && aliasForm.alias.trim() !== aliasForm.defaultLabel.trim()
        ? "Custom"
        : "Default",
    };

    setMasterData((prev) => ({
      ...prev,
      [selectedGroup]: [...prev[selectedGroup], newEntry],
    }));

    toast.success(`New alias "${newEntry.alias}" added to "${groups.find((g) => g.key === selectedGroup)?.label}".`);
    handleCloseAddAliasModal();
  };

  // ── Add Library Group Modal handlers ──
  const handleOpenAddLibraryModal = () => {
    setLibraryGroupForm(emptyLibraryGroupForm());
    setLibraryGroupFormErrors({});
    setIsAddLibraryModalOpen(true);
  };

  const handleCloseAddLibraryModal = () => {
    setIsAddLibraryModalOpen(false);
    setLibraryGroupForm(emptyLibraryGroupForm());
    setLibraryGroupFormErrors({});
  };

  const handleLibraryGroupFormChange = (
    field: keyof LibraryGroupFormState,
    value: string
  ) => {
    setLibraryGroupForm((prev) => ({ ...prev, [field]: value }));
    if (libraryGroupFormErrors[field]) {
      setLibraryGroupFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateLibraryGroupForm = (): boolean => {
    const errors: Partial<LibraryGroupFormState> = {};
    if (!libraryGroupForm.label.trim()) errors.label = "Group name is required.";
    if (!libraryGroupForm.subLabel.trim()) errors.subLabel = "Description is required.";
    setLibraryGroupFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveNewLibraryGroup = () => {
    if (!validateLibraryGroupForm()) return;

    // Build a safe GroupKey from the label
    const newKey = libraryGroupForm.label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 24) as GroupKey;

    // Guard against duplicate keys
    if (groups.some((g) => g.key === newKey)) {
      toast.error("A group with a similar name already exists. Please use a different name.");
      return;
    }

    const newGroup: GroupConfig = {
      key: newKey,
      label: libraryGroupForm.label.trim(),
      subLabel: libraryGroupForm.subLabel.trim(),
      icon: Home, // default icon; extendable with an icon picker
      targetTotal: 0,
      targetCustom: 0,
      targetPending: 0,
      targetDefault: 0,
    };

    setGroups((prev) => [...prev, newGroup]);
    setMasterData((prev) => ({ ...prev, [newKey]: [] }));
    setSelectedGroup(newKey);
    setCurrentPage(1);

    toast.success(`New library group "${newGroup.label}" created successfully!`);
    handleCloseAddLibraryModal();
  };

  // ── Top-bar action handlers ──
  const handleImportAliases = () => toast.info("Import functionality will be implemented here.");

  const handleExportAliases = () => {
    const exportData = masterData[selectedGroup];
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedGroup}-alias-master.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported "${selectedGroup}" alias data successfully!`);
  };

  const handleAddAliasFromTopBar = () => handleOpenAddAliasModal();

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <TableHeader
        title="Alias Master"
        subtitle="Customize field names project-wise for survey, assessment and tax collection screens."
        icon={Layers}
        rightContent={
          <div className="flex items-center gap-2">
            <ImportButton onClick={handleImportAliases} />
            <ExportButton onClick={handleExportAliases} />
            <AddButton onClick={handleAddAliasFromTopBar} />
          </div>
        }
      />

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* ══ LEFT: Field Library ══ */}
        <Card
          variant="default"
          padding="sm"
          className="lg:col-span-3 shadow-sm h-full flex flex-col"
        >
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
            <div>
              <h2 className="font-bold text-slate-800 text-base">Field Library</h2>
              <p className="text-[11px] text-slate-400">Select a group to manage aliases.</p>
            </div>

            {/* Action buttons: Refresh + Add Library */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="xs"
                icon={RotateCw}
                onClick={handleRefreshActiveGroup}
                title="Reset current group to default values"
              />
              <Button
                variant="ghost"
                size="xs"
                icon={BookPlus}
                onClick={handleOpenAddLibraryModal}
                title="Add a new field-library group"
              />
            </div>
          </div>

          {/* Group navigation */}
          <nav
            className="flex flex-col gap-2 flex-1 overflow-y-auto pt-3"
            aria-label="Field groups"
          >
            {groups.map((group) => {
              const IconComp = group.icon;
              const isActive = selectedGroup === group.key;
              return (
                <button
                  key={group.key}
                  onClick={() => {
                    setSelectedGroup(group.key);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "flex items-center text-left p-3 rounded-xl border transition-all duration-200 w-full group active:scale-98",
                    isActive
                      ? "border-blue-500 bg-blue-50/50 shadow-sm text-blue-900"
                      : "border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800"
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 p-2 rounded-lg mr-3 transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    )}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight truncate">{group.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{group.subLabel}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* ══ RIGHT: Alias Mapping ══ */}
        <Card
          variant="default"
          padding="none"
          className="lg:col-span-9 shadow-sm overflow-hidden h-full flex flex-col"
        >
          {/* Top header bar */}
          <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Alias Mapping</h2>
              <p className="text-xs text-slate-500">
                Change display names without modifying backend field names.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <SearchInput
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  setCurrentPage(1);
                }}
                placeholder="Search field / alias"
                className="min-w-[240px] mb-0"
              />

              {/* Add Alias Button (replaces Bulk Edit) */}
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleOpenAddAliasModal}
              >
                Add Alias
              </Button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200/80 flex-shrink-0">
            <div className="p-4 border-r border-slate-200/80">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Total Fields
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{groupStats.total}</p>
            </div>
            <div className="p-4 border-r border-slate-200/80">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Customized
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{groupStats.customized}</p>
            </div>
            <div className="p-4 border-r border-slate-200/80">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Default
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{groupStats.defaults}</p>
            </div>
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Pending Approval
              </p>
              <p className="text-2xl font-bold text-amber-500 mt-1">{groupStats.pending}</p>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 min-h-0">
            <MasterTable<FieldAlias>
              columns={columns}
              data={paginatedFields}
              pageNumber={currentPage}
              pageSize={pageSize}
              totalCount={filteredFields.length}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              paginationConfig={{ enabled: true, showPageSizeSelector: true }}
              pageSizeOptions={[5, 10, 20, 30, 40, 50]}
              renderActions={renderTableRowActions}
              actionLabel="Preview"
              getRowKey={(row) => row.id}
              emptyText="No matching fields found. Try adjusting your search query."
              height="sm"
              tableClassName="divide-y divide-slate-200"
            />
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════
          MODAL: Add Alias
      ══════════════════════════════════════════════ */}
      <Modal
        open={isAddAliasModalOpen}
        onClose={handleCloseAddAliasModal}
        title="Add New Alias"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={handleCloseAddAliasModal}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleSaveNewAlias}>
              Save Alias
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500 leading-relaxed">
            Define a new field alias for the&nbsp;
            <span className="font-semibold text-slate-700">
              {groups.find((g) => g.key === selectedGroup)?.label}
            </span>
            &nbsp;group. The alias controls how the field label appears on user-facing screens.
          </p>

          {/* Row 1: Backend Field + DB Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Backend Field Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. PropertyNo"
                value={aliasForm.backendField}
                onChange={(e) => handleAliasFormChange("backendField", e.target.value)}
                className={cn(
                  "w-full text-sm",
                  aliasFormErrors.backendField && "border-red-400 focus:ring-red-400/20"
                )}
              />
              {aliasFormErrors.backendField && (
                <p className="text-[11px] text-red-500">{aliasFormErrors.backendField}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                DB Column Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. property_no"
                value={aliasForm.dbName}
                onChange={(e) => handleAliasFormChange("dbName", e.target.value)}
                className={cn(
                  "w-full text-sm font-mono",
                  aliasFormErrors.dbName && "border-red-400 focus:ring-red-400/20"
                )}
              />
              {aliasFormErrors.dbName && (
                <p className="text-[11px] text-red-500">{aliasFormErrors.dbName}</p>
              )}
            </div>
          </div>

          {/* Row 2: Default Label + Project Alias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Default Label <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Property No."
                value={aliasForm.defaultLabel}
                onChange={(e) => handleAliasFormChange("defaultLabel", e.target.value)}
                className={cn(
                  "w-full text-sm",
                  aliasFormErrors.defaultLabel && "border-red-400 focus:ring-red-400/20"
                )}
              />
              {aliasFormErrors.defaultLabel && (
                <p className="text-[11px] text-red-500">{aliasFormErrors.defaultLabel}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Project Alias
                <span className="ml-1 text-[10px] text-slate-400 font-normal">
                  (leave blank to use default)
                </span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Property Number"
                value={aliasForm.alias}
                onChange={(e) => handleAliasFormChange("alias", e.target.value)}
                className="w-full text-sm"
              />
            </div>
          </div>

          {/* Row 3: Screen Usage */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Screen Usage</label>
            <div className="flex flex-wrap gap-2">
              {SCREEN_USAGE_OPTIONS.map((screen) => {
                const isSelected = aliasForm.screenUsage.includes(screen);
                return (
                  <button
                    key={screen}
                    type="button"
                    onClick={() => handleAliasScreenUsageToggle(screen)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150",
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                    )}
                  >
                    {screen}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Mandatory toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
            <button
              type="button"
              onClick={() => handleAliasFormChange("mandatory", !aliasForm.mandatory)}
              className={cn(
                "relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0",
                aliasForm.mandatory ? "bg-emerald-500" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200",
                  aliasForm.mandatory ? "left-5" : "left-0.5"
                )}
              />
            </button>
            <div>
              <p className="text-xs font-semibold text-slate-700">Mark as Mandatory</p>
              <p className="text-[10px] text-slate-400">
                Mandatory fields require user input before form submission.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════
          MODAL: Add Library Group
      ══════════════════════════════════════════════ */}
      <Modal
        open={isAddLibraryModalOpen}
        onClose={handleCloseAddLibraryModal}
        title="Add Library Group"
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={handleCloseAddLibraryModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={BookPlus}
              onClick={handleSaveNewLibraryGroup}
            >
              Create Group
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500 leading-relaxed">
            Create a new field-library group. Once created, you can add alias entries to it using
            the&nbsp;<span className="font-semibold text-slate-700">Add Alias</span>&nbsp;button.
          </p>

          {/* Group Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Group Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Valuation Details"
              value={libraryGroupForm.label}
              onChange={(e) => handleLibraryGroupFormChange("label", e.target.value)}
              className={cn(
                "w-full text-sm",
                libraryGroupFormErrors.label && "border-red-400 focus:ring-red-400/20"
              )}
            />
            {libraryGroupFormErrors.label && (
              <p className="text-[11px] text-red-500">{libraryGroupFormErrors.label}</p>
            )}
          </div>

          {/* Sub Label / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Description / Sub-label <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. 0 fields"
              value={libraryGroupForm.subLabel}
              onChange={(e) => handleLibraryGroupFormChange("subLabel", e.target.value)}
              className={cn(
                "w-full text-sm",
                libraryGroupFormErrors.subLabel && "border-red-400 focus:ring-red-400/20"
              )}
            />
            {libraryGroupFormErrors.subLabel && (
              <p className="text-[11px] text-red-500">{libraryGroupFormErrors.subLabel}</p>
            )}
            <p className="text-[10px] text-slate-400">
              A short description shown below the group name in the sidebar.
            </p>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 p-3 rounded-xl border border-blue-100 bg-blue-50/40">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              The group will appear in the left sidebar immediately after creation. You can
              rename or remove it later from the library settings.
            </p>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════
          MODAL: Preview Alias
      ══════════════════════════════════════════════ */}
      <Modal
        open={!!previewField}
        onClose={() => setPreviewField(null)}
        title="Alias Screen Preview"
        maxWidth="sm"
        footer={
          <Button variant="primary" size="sm" onClick={() => setPreviewField(null)}>
            Close Preview
          </Button>
        }
      >
        <div className="space-y-6">
          <p className="text-xs text-slate-500 leading-relaxed">
            Below is a high-fidelity rendering of how the customized alias name will appear on
            active user screens:
          </p>

          <div className="border border-slate-100 bg-slate-50/60 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Assessment Form Mockup
              </span>
              <Badge variant="default" size="sm">ACTIVE SCREEN</Badge>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800 block">
                {previewField?.alias}
                {previewField?.mandatory && <span className="text-red-500"> *</span>}
              </label>
              <input
                type="text"
                disabled
                placeholder={`Enter ${previewField?.alias.toLowerCase()}…`}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-350 cursor-not-allowed opacity-90"
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-mono">
                <Info className="w-3.5 h-3.5" />
                <span>Database Field: {previewField?.dbName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700">Screen Deployments</h4>
            <div className="flex flex-wrap gap-1.5">
              {previewField?.screenUsage.map((screen) => (
                <Badge key={screen} variant="default" size="sm">
                  {screen} Screen
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}