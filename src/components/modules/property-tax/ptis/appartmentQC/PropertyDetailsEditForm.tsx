"use client";

import { useMemo } from "react";
import {
  CancelButton,
  SaveButton,
  Input,
  Select,
  ValidationMessage,
  CollapsibleSectionHeader,
  MasterTable,
  Tabs,
  TabList,
  Tab,
  Badge,
} from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { User, Building2 } from "lucide-react";
import { usePropertyEditForm } from "@/hooks/apartmentQc";
import { buildFloorQCColumns } from "./FloorQCColumns";
import { cn } from "@/lib/utils/cn";
import type { ApartmentQCDetail } from "@/types/apartmentQC.types";
import type { Floor } from "@/types/floor.types";
import type { ConstructionType } from "@/types/construction.types";
import type { UseType, UseSubType } from "@/types/typeOfUse.types";
import type {
  PropertyEditFormCopy,
  PropertyTypeOption,
  RoomTypeOption,
  FloorDataRow,
} from "@/types/propertyEdit.types";
import { RoomWiseSubmission } from "./roomSubmission/RoomWiseSubmission";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PropertyDetailsEditFormProps {
  propertyData: ApartmentQCDetail;
  floorQCData: ApartmentQCDetail[];
  floors: Floor[];
  constructionTypes: ConstructionType[];
  useTypes: UseType[];
  allSubTypes: UseSubType[];
  propertyTypes: PropertyTypeOption[];
  roomTypes: RoomTypeOption[];
  subTab?: string;
  copy: PropertyEditFormCopy;
}

// ─── Compact Form Field Component ─────────────────────────────────────────────

interface CompactFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showError?: boolean;
  onBlur?: () => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  readOnly?: boolean;
}

const CompactField = ({
  label,
  value,
  onChange,
  error,
  showError = false,
  onBlur,
  required = false,
  placeholder,
  type = "text",
  maxLength,
  readOnly = false,
}: CompactFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    onChange(newValue);
  };

  return (
    <div className="flex flex-col">
      <Input
        naked={false}
        label={label}
        required={required}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={readOnly}
        className={cn(
          "h-7 px-2 text-xs",
          readOnly && "bg-gray-100 cursor-not-allowed",
          error && showError && "border-red-500"
        )}
      />
      <ValidationMessage message={error} visible={showError && !!error} type="error" />
    </div>
  );
};
CompactField.displayName = "CompactField";

// ─── Compact Select Field Component ───────────────────────────────────────────

interface CompactSelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

const CompactSelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  required = false,
}: CompactSelectFieldProps) => (
  <Select
    label={label}
    required={required}
    value={value}
    onChange={(_e, val) => onChange(val)}
    options={options}
    placeholder={placeholder}
    selectSize="sm"
    className="text-xs"
  />
);
CompactSelectField.displayName = "CompactSelectField";

// ─── Read-only Field Component ────────────────────────────────────────────────

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  type?: string;
}

const ReadOnlyField = ({ label, value, type = "text" }: ReadOnlyFieldProps) => (
  <div className="flex flex-col">
    <label className="mb-1.5 text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      readOnly
      aria-label={label}
      className="h-7 px-2 text-xs border border-gray-200 rounded bg-gray-100 text-gray-600 cursor-not-allowed outline-none"
    />
  </div>
);
ReadOnlyField.displayName = "ReadOnlyField";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PropertyDetailsEditForm({
  propertyData,
  floorQCData,
  floors,
  constructionTypes,
  useTypes,
  allSubTypes,
  propertyTypes,
  // roomTypes - unused, kept for interface compatibility
  subTab: subTabProp = "rateable",
  copy,
}: PropertyDetailsEditFormProps) {
  // Use the orchestrator hook
  const form = usePropertyEditForm({
    propertyData,
    floorQCData,
    floors,
    constructionTypes,
    useTypes,
    allSubTypes,
    propertyTypes,
    copy,
  });

  const {
    formData,
    floorData,
    errors,
    isBasicInfoOpen,
    isFloorQCOpen,
    dualMethodTab,
    isUpdating,
    floorOptions,
    conTypeOptions,
    useTypeOptions,
    propertyTypeOptions,
    getSubTypeOptions,
    handleFieldChange,
    handlePropertyTypeChange,
    handleBlur,
    showError,
    updateFloorRow,
    toggleBasicInfo,
    toggleFloorQC,
    setDualMethodTab,
    handleSave,
    handleBack,
    roomSidebar,
  } = form;

  // Build floor QC columns using extracted builder
  const floorColumns: Column<FloorDataRow>[] = useMemo(
    () =>
      buildFloorQCColumns(
        {
          floorOptions,
          conTypeOptions,
          useTypeOptions,
          getSubTypeOptions,
          updateFloorRow,
          onOpenRoomSubmission: roomSidebar.handleOpen,
          copy: copy.floorQC,
        },
        subTabProp,
        dualMethodTab
      ),
    [
      floorOptions,
      conTypeOptions,
      useTypeOptions,
      getSubTypeOptions,
      updateFloorRow,
      roomSidebar.handleOpen,
      copy.floorQC,
      subTabProp,
      dualMethodTab,
    ]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{copy.pageTitle}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" size="sm">
                {`${copy.badges.ward}: ${propertyData?.wardNo || propertyData?.wardId || "-"}`}
              </Badge>
              <Badge variant="secondary" size="sm">
                {`${copy.badges.zone}: ${propertyData?.zoneNo || "-"}`}
              </Badge>
              <Badge variant="success" size="sm">
                {`${copy.badges.prop}: ${propertyData?.propertyNo || "-"}`}
              </Badge>
              <Badge variant="default" size="sm" className="bg-purple-100 text-purple-700">
                {`${copy.badges.type}: ${propertyData?.type || "-"}`}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CancelButton onClick={handleBack}>{copy.buttons.back}</CancelButton>
            <SaveButton
              onClick={handleSave}
              isLoading={isUpdating}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? copy.buttons.saving : copy.buttons.save}
            </SaveButton>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6 space-y-4">
        {/* Basic Information Section */}
        <section className="border border-blue-200 rounded-lg overflow-hidden shadow-sm bg-white">
          <CollapsibleSectionHeader
            title={copy.basicInfo.title}
            icon={User}
            isOpen={isBasicInfoOpen}
            onToggle={toggleBasicInfo}
          />
          {isBasicInfoOpen && (
            <div className="p-4 bg-white">
              {/* Row 1 */}
              <div className="grid grid-cols-4 gap-3 mb-3">
                <CompactField
                  label={copy.basicInfo.fields.ownerName.label}
                  value={formData.ownerName}
                  onChange={(v) => handleFieldChange("ownerName", v)}
                  required
                  maxLength={100}
                  error={errors.ownerName}
                  showError={showError("ownerName")}
                  onBlur={() => handleBlur("ownerName")}
                  placeholder={copy.basicInfo.fields.ownerName.placeholder}
                />
                <CompactField
                  label={copy.basicInfo.fields.occupierName.label}
                  value={formData.occupierName}
                  onChange={(v) => handleFieldChange("occupierName", v)}
                  required
                  maxLength={100}
                  error={errors.occupierName}
                  showError={showError("occupierName")}
                  onBlur={() => handleBlur("occupierName")}
                  placeholder={copy.basicInfo.fields.occupierName.placeholder}
                />
                <CompactField
                  label={copy.basicInfo.fields.renterName.label}
                  value={formData.renterName}
                  onChange={(v) => handleFieldChange("renterName", v)}
                  maxLength={100}
                  error={errors.renterName}
                  showError={showError("renterName")}
                  onBlur={() => handleBlur("renterName")}
                  placeholder={copy.basicInfo.fields.renterName.placeholder}
                />
                <CompactSelectField
                  label={copy.basicInfo.fields.propertyDescription.label}
                  value={formData.propertyTypeId}
                  onChange={handlePropertyTypeChange}
                  options={propertyTypeOptions}
                  placeholder={copy.basicInfo.fields.propertyDescription.placeholder}
                />
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-7 gap-3 mb-3">
                <CompactField
                  label={copy.basicInfo.fields.bhk.label}
                  value={formData.bhk}
                  onChange={(v) => handleFieldChange("bhk", v)}
                  maxLength={10}
                  placeholder={copy.basicInfo.fields.bhk.placeholder}
                />
                <CompactField
                  label={copy.basicInfo.fields.mobileNo.label}
                  value={formData.mobileNo}
                  onChange={(v) => handleFieldChange("mobileNo", v)}
                  maxLength={10}
                  error={errors.mobileNo}
                  showError={showError("mobileNo")}
                  onBlur={() => handleBlur("mobileNo")}
                  placeholder={copy.basicInfo.fields.mobileNo.placeholder}
                />
                <CompactField
                  label={copy.basicInfo.fields.emailId.label}
                  value={formData.emailId}
                  onChange={(v) => handleFieldChange("emailId", v)}
                  type="email"
                  maxLength={100}
                  error={errors.emailId}
                  showError={showError("emailId")}
                  onBlur={() => handleBlur("emailId")}
                  placeholder={copy.basicInfo.fields.emailId.placeholder}
                />
                <CompactField
                  label={copy.basicInfo.fields.flatOrShopName.label}
                  value={formData.flatOrShopName}
                  onChange={(v) => handleFieldChange("flatOrShopName", v)}
                  maxLength={100}
                  placeholder={copy.basicInfo.fields.flatOrShopName.placeholder}
                />
                <CompactField
                  label={copy.basicInfo.fields.wingName.label}
                  value={formData.wingName}
                  onChange={(v) => handleFieldChange("wingName", v)}
                  maxLength={20}
                  error={errors.wingName}
                  showError={showError("wingName")}
                  onBlur={() => handleBlur("wingName")}
                  placeholder={copy.basicInfo.fields.wingName.placeholder}
                />
                <CompactField
                  label={copy.basicInfo.fields.flatOrShopNo.label}
                  value={formData.flatOrShopNo}
                  onChange={(v) => handleFieldChange("flatOrShopNo", v)}
                  required
                  maxLength={50}
                  error={errors.flatOrShopNo}
                  showError={showError("flatOrShopNo")}
                  onBlur={() => handleBlur("flatOrShopNo")}
                  placeholder={copy.basicInfo.fields.flatOrShopNo.placeholder}
                />
                <CompactField
                  label={copy.basicInfo.fields.oldPropertyNo.label}
                  value={formData.oldPropertyNo}
                  onChange={(v) => handleFieldChange("oldPropertyNo", v)}
                  maxLength={50}
                  error={errors.oldPropertyNo}
                  showError={showError("oldPropertyNo")}
                  onBlur={() => handleBlur("oldPropertyNo")}
                  placeholder={copy.basicInfo.fields.oldPropertyNo.placeholder}
                />
              </div>
              {/* Row 3 - Read Only */}
              <div className="grid grid-cols-7 gap-3">
                <ReadOnlyField label={copy.basicInfo.fields.remark.label} value={formData.remark} />
                <ReadOnlyField label={copy.basicInfo.fields.oldRV.label} value={formData.oldRV} type="number" />
                <ReadOnlyField label={copy.basicInfo.fields.newRV.label} value={formData.newRV} type="number" />
                <ReadOnlyField label={copy.basicInfo.fields.oldTax.label} value={formData.oldTax} type="number" />
                <ReadOnlyField label={copy.basicInfo.fields.newTax.label} value={formData.newTax} type="number" />
                <ReadOnlyField label={copy.basicInfo.fields.oldArea.label} value={formData.oldArea} type="number" />
                <ReadOnlyField label={copy.basicInfo.fields.newArea.label} value={formData.newArea} type="number" />
              </div>

              {/* Row 4 - Old Information */}
              <div className="grid grid-cols-7 gap-3">
                <ReadOnlyField label={copy.basicInfo.fields.oldUseType.label} value={formData.oldUseType} />
                <ReadOnlyField label={copy.basicInfo.fields.oldConstructionType.label} value={formData.oldConstructionType} />
                <ReadOnlyField label={copy.basicInfo.fields.oldCSN.label} value={formData.oldCSN} type="number" />       
                <ReadOnlyField label={copy.basicInfo.fields.oldConstructionYear.label} value={formData.oldConstructionYear} type="number" />
              </div>
              
            </div>
          )}
        </section>

        {/* Floor QC Section */}
        <section className="border border-blue-200 rounded-lg overflow-hidden shadow-sm bg-white">
          <CollapsibleSectionHeader
            title={copy.floorQC.title}
            icon={Building2}
            isOpen={isFloorQCOpen}
            onToggle={toggleFloorQC}
          />
          {isFloorQCOpen && (
            <div className="p-4 bg-white">
              {subTabProp === "dual-method" && (
                <Tabs
                  value={dualMethodTab}
                  onChange={(val) => setDualMethodTab(val as "rateable" | "capital")}
                  className="mb-4"
                >
                  <TabList>
                    <Tab value="rateable">{copy.floorQC.tabs.rateable}</Tab>
                    <Tab value="capital">{copy.floorQC.tabs.capital}</Tab>
                  </TabList>
                </Tabs>
              )}
              <MasterTable
                data={floorData}
                columns={floorColumns}
                getRowKey={(row: FloorDataRow) => row.id}
              />
            </div>
          )}
        </section>
      </main>

      {/* Room Submission Sidebar */}
      {roomSidebar.state.isOpen && roomSidebar.state.selectedFloorRow && (
        <aside className="fixed inset-y-0 right-0 w-[800px] bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">
          <RoomWiseSubmission
            isOpen={roomSidebar.state.isOpen}
            onClose={roomSidebar.handleClose}
            onUpdate={roomSidebar.handleUpdate}
            displayMode="inline"
            initialPropertyID={propertyData?.id}
            initialFloorId={roomSidebar.state.selectedFloorRow.pdnId ?? undefined}
            floorNumber={roomSidebar.state.selectedFloorRow.floorId}
            existingRooms={roomSidebar.state.existingRooms}
            externalAreaUnit={roomSidebar.state.areaUnit}
            onExternalToggleUnit={roomSidebar.handleToggleUnit}
            maxRooms={100}
          />
        </aside>
      )}
    </div>
  );
}
PropertyDetailsEditForm.displayName = "PropertyDetailsEditForm";
