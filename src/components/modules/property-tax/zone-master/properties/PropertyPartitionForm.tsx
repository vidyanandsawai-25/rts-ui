"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Grid3x3, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton, Select, Tabs, ValidationMessage } from "@/components/common";
import { Column } from "@/components/common/MasterTable";
import { PropertyPartitionFormProps } from "@/types/partition-form.types";
import { BuildingPreviewModal } from "./BuildingPreviewModal";
import { getWingColumns, WingSummary } from "./wingColumns";
import {
  PropertyInfoSection,
  NonApartmentPartitionSection,
  WingSummaryTable,
  AddWingForm,
  WingDetailConfigSection,
} from "./components";
import {
  usePartitionFormState,
  usePartitionFormOptions,
  usePartitionFormHandlers,
  usePartitionFormValidation,
  useWingManagement,
  useBuildingPreview,
  usePartitionSubmit,
} from "@/hooks/zoneMaster";

export default function PropertyPartitionForm({
  open,
  onClose,
  onSuccess,
  selectedWard,
  categoryMap,
  ssrProperties = [],
  ssrWings = [],
  ssrFloors = [],
  selectedPropertyId = null,
  ssrSocietyDetails = [],
  ssrNextPartitionNumber = null,
}: PropertyPartitionFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("zoneMaster");
  const tCommon = useTranslations("common");

  // Normalize selectedWard to prevent undefined
  const ward = selectedWard ?? null;

  // Use custom hooks for state management
  const {
    form,
    setForm,
    loading,
    setLoading,
    errors,
    setErrors,
    allProperties,
    wings,
    floors,
    societyDetails,
    setSocietyDetails,
    showPreview,
    setShowPreview,
    previewData,
    setPreviewData,
    loadingPreview,
    setLoadingPreview,
    selectedProperty,
    selectedSocietyDetailId,
    INITIAL,
  } = usePartitionFormState({
    selectedPropertyId,
    ssrNextPartitionNumber,
    ssrProperties,
    ssrWings,
    ssrFloors,
    ssrSocietyDetails,
  });

  // Use hooks for options
  const {
    propertyOptions,
    wingOptions,
    generationTypeOptions,
    fromFloorOptions,
    toFloorOptions,
  } = usePartitionFormOptions({
    allProperties,
    societyDetails,
    wings,
    floors,
    form,
    categoryMap,
  });

  // Use hooks for handlers
  const {
    handlePropertySelect,
    handleFromFloorChange,
    handleToFloorChange,
  } = usePartitionFormHandlers({
    form,
    setForm,
    errors,
    setErrors,
    floors,
  });

  // Use hooks for validation
  const { validate } = usePartitionFormValidation({
    selectedProperty,
    allProperties,
    floors,
  });

  // Use hooks for wing management
  const {
    showWingConfig,
    setShowWingConfig,
    showAddWingForm,
    setShowAddWingForm,
    newWingName,
    setNewWingName,
    addingWing,
    editingSocietyDetailId,
    setEditingSocietyDetailId,
    newWingId,
    setNewWingId,
    wingSummaries,
    handleSaveWing: handleSaveWingCore,
  } = useWingManagement({
    societyDetails,
    setSocietyDetails,
    wings,
    selectedPropertyId,
  });

  // Use hooks for building preview
  const { handlePreviewBuilding } = useBuildingPreview({
    form,
    selectedWard: ward,
    selectedProperty,
    wings,
    floors,
    setLoadingPreview,
    setShowPreview,
    setPreviewData,
  });

  // Use hooks for submit
  const { handleSubmit: handleSubmitCore } = usePartitionSubmit({
    form,
    selectedWard: ward,
    selectedProperty,
    wings,
    floors,
    validate,
    setLoading,
    onSuccess,
    onClose,
    showAddWingForm,
    newWingId,
    newWingName,
    handleSaveWing: handleSaveWingCore,
  });

  // Check if selected property category is Apartment or Multi Commercial Apartment
  // Note: categoryMap values are in English from database, so we compare against English literals
  const isApartmentCategory = useMemo(() => {
    if (!selectedProperty?.categoryId || !categoryMap) return false;
    const categoryName = categoryMap.get(selectedProperty.categoryId);
    return categoryName === "Apartment" || categoryName === "Multi Commercial Apartment";
  }, [selectedProperty, categoryMap]);

  // Get actual category name from categoryMap
  const categoryName = useMemo(() => {
    if (!selectedProperty?.categoryId || !categoryMap) return null;
    return categoryMap.get(selectedProperty.categoryId) || null;
  }, [selectedProperty, categoryMap]);

  // Define columns for the wing summary table
  const wingColumns = useMemo(() => getWingColumns({
    t,
    onEditWing: (row) => {
      setEditingSocietyDetailId(row.societyDetailId);
      setNewWingId(row.wingId);
      setNewWingName(row.wingName);
      setShowAddWingForm(true);
    },
    onUpdateStructure: (row) => {
      setForm(prev => ({
        ...prev,
        wingLetter: row.wingNo || row.wingName
      }));
      setShowWingConfig(true);
      toast.info(`Selected Wing ${row.wingName} (${row.wingNo}) for updates`);
    }
  }), [t, setEditingSocietyDetailId, setNewWingId, setNewWingName, setShowAddWingForm, setForm, setShowWingConfig]);

  // Handle close
  const handleClose = () => {
    setForm(INITIAL);
    setErrors({});
    setSocietyDetails([]);
    setShowWingConfig(false);
    setShowAddWingForm(false);
    setNewWingId(null);
    setNewWingName("");
    setEditingSocietyDetailId(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("partitionPropertyId");
    router.push(`${pathname}?${params.toString()}`);

    onClose();
  };

  // Wrapper for submit to pass errors and setErrors
  const handleSubmit = async () => {
    await handleSubmitCore(errors, setErrors);
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      width="md"
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Grid3x3 className="w-5 h-5 text-[#1A86E8]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {t("partitionForm.title")}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("partitionForm.subtitle")}
            </p>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton onClick={handleClose} disabled={loading || addingWing} />
          <SaveButton
            onClick={handleSubmit}
            isLoading={loading || addingWing}
            disabled={showAddWingForm && (!newWingId || !newWingName)}
          />
        </>
      }
    >
      <div className="p-4 space-y-5">
        {/* Warning if no ward selected */}
        {!selectedWard?.id && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-300 rounded-lg">
            <div className="w-5 h-5 mt-0.5 flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{t("partitionForm.noWardSelected")}</p>
              <p className="text-xs text-red-700 mt-1">{t("partitionForm.selectWardFirst")}</p>
            </div>
          </div>
        )}

        {/* Property Information Section */}
        <PropertyInfoSection
          selectedWard={ward}
          selectedProperty={selectedProperty}
          isApartmentCategory={isApartmentCategory}
          categoryName={categoryName}
          t={t}
        />

        {/* Main Property Selection */}
        <div>
          <Select
            label={t("partitionForm.mainPropertyNo")}
            value={form.mainPropertyId ? String(form.mainPropertyId) : ""}
            onChange={handlePropertySelect}
            options={propertyOptions}
            placeholder={t("partitionForm.placeholders.selectMainProperty")}
            disabled={loading}
            required
          />
          <ValidationMessage
            message={errors.mainPropertyId}
            visible={!!errors.mainPropertyId}
            type="error"
          />
        </div>

        {/* Partition Type Tabs - Only show for Apartment categories */}
        {form.mainPropertyId && isApartmentCategory && (
          <Tabs
            className="items-center"
            variant="pills"
            value={form.partitionType}
            onChange={(val) => {
              setForm({ ...form, partitionType: val as "wing" | "partition" | "amenity" });
              setErrors({});
              setShowWingConfig(false);
            }}
          >
            <Tabs.TabList className="justify-center gap-4 w-max">
              <Tabs.Tab value="wing" icon={Building2}>
                {t("partitionForm.tabs.wing")}
              </Tabs.Tab>
              <Tabs.Tab value="amenity" icon={Building2}>
                {t("partitionForm.tabs.amenity")}
              </Tabs.Tab>
            </Tabs.TabList>
          </Tabs>
        )}

        {/* Wing Summary Table */}
        {form.mainPropertyId && isApartmentCategory && form.partitionType === "wing" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {!showAddWingForm && !showWingConfig && (
              <WingSummaryTable
                wingSummaries={wingSummaries}
                wingColumns={wingColumns as unknown as Column<WingSummary>[]}
                onAddWingClick={() => setShowAddWingForm(true)}
                t={t}
              />
            )}

            {showAddWingForm && (
              <AddWingForm
                newWingId={newWingId}
                newWingName={newWingName}
                setNewWingName={setNewWingName}
                errors={errors}
                setErrors={setErrors}
                addingWing={addingWing}
                editingSocietyDetailId={editingSocietyDetailId}
                onCancel={() => {
                  setShowAddWingForm(false);
                  setEditingSocietyDetailId(null);
                  setNewWingId(null);
                  setNewWingName("");
                }}
                t={t}
                tCommon={tCommon}
              />
            )}
          </div>
        )}

        {/* Conditional UI based on category and partition type */}
        {form.mainPropertyId && (
          <>
            {isApartmentCategory ? (
              form.partitionType === "wing" ? (
                <>
                  {showWingConfig && (
                    <WingDetailConfigSection
                      form={form}
                      setForm={setForm}
                      errors={errors}
                      setErrors={setErrors}
                      wingOptions={wingOptions}
                      fromFloorOptions={fromFloorOptions}
                      toFloorOptions={toFloorOptions}
                      generationTypeOptions={generationTypeOptions}
                      handleFromFloorChange={handleFromFloorChange}
                      handleToFloorChange={handleToFloorChange}
                      handlePreviewBuilding={handlePreviewBuilding}
                      loading={loadingPreview}
                      onCancel={() => setShowWingConfig(false)}
                      t={t}
                      tCommon={tCommon}
                    />
                  )}
                </>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg text-center text-gray-500">
                  {t("partitionForm.wing.amenity.notImplemented")}
                </div>
              )
            ) : (
              <NonApartmentPartitionSection
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
                t={t}
              />
            )}
          </>
        )}
      </div>

      {/* Building Preview Modal */}
      <BuildingPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        buildingData={previewData}
        loading={loadingPreview}
        wingLetter={form.wingLetter}
        propertyNo={selectedProperty?.propertyNo}
        taxZoneId={selectedProperty?.taxZoneId}
        wardId={selectedWard?.id}
        propertyTypeId={selectedProperty?.propertyTypeId ?? undefined}
        categoryId={selectedProperty?.categoryId ?? undefined}
        societyDetailId={selectedSocietyDetailId}
        onGenerateSuccess={() => {
          setShowPreview(false);
          onSuccess?.();
        }}
      />
    </Drawer>
  );
} 
