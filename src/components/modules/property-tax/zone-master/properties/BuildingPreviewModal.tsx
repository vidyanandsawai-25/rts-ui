"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Building2, Layers, Home, Grid3x3, Loader2, Info, Zap, X } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { BuildingStructureItem } from "@/types/zone-master/properties/building-structure.types";
import { BulkPropertyItem } from "@/types/zone-master/properties/property-bulk.types";
import { createBulkBuildingPropertiesAction } from "@/app/[locale]/property-tax/zone-master/actions";
import { Button } from "@/components/common";
import { parseBulkPropertyErrors } from "@/lib/utils/bulk-property-errors";

interface BuildingPreviewProps {
  open: boolean;
  onClose: () => void;
  buildingData: BuildingStructureItem[];
  loading?: boolean;
  wingLetter: string;
  propertyNo?: string;
  // Configuration data for bulk creation (from selected property)
  taxZoneId?: number;
  wardId?: number;
  propertyTypeId?: number;
  categoryId?: number;
  societyDetailId?: number;
  // Callback on successful generation
  onGenerateSuccess?: () => void;
}

export function BuildingPreviewModal({
  open,
  onClose,
  buildingData,
  loading = false,
  wingLetter,
  propertyNo,
  taxZoneId,
  wardId,
  propertyTypeId,
  categoryId,
  societyDetailId,
  onGenerateSuccess,
}: BuildingPreviewProps) {
  const t = useTranslations("zoneMaster");

  // Generation state
  const [generating, setGenerating] = useState(false);

  // Generation type mapping
  const generationTypeLabels: Record<string, string> = {
    "V": "V - Vertical",
    "H": "H - Horizontal",
    "VC": "VC - Vertical Custom",
    "HC": "HC - Horizontal Custom",
  };

  // Reset state when modal closes
  const handleClose = () => {
    onClose();
  };

  const organizedData = useMemo(() => {
    if (!buildingData || buildingData.length === 0) {
      return {
        floors: [],
        totalUnits: 0,
        fromFloor: 0,
        toFloor: 0,
        flatsPerFloor: 0,
        flatStart: 0,
        flatEnd: 0,
        incrementedBy: 0,
        prefix: "",
        generationType: "",
      };
    }

    const floorMap = new Map<number, BuildingStructureItem[]>();
    let minFloor = Infinity;
    let maxFloor = -Infinity;
    let minFlatNo = Infinity;
    let maxFlatNo = -Infinity;

    // Helper to extract numeric suffix from flatNo (handles prefix like "A", "B1", etc.)
    const extractNumeric = (flatNo: string): number => {
      const match = flatNo.match(/(\d+)$/); // Extract trailing digits
      return match ? parseInt(match[1], 10) : NaN;
    };

    buildingData.forEach((item) => {
      if (!floorMap.has(item.floorNo)) {
        floorMap.set(item.floorNo, []);
      }
      floorMap.get(item.floorNo)!.push(item);

      minFloor = Math.min(minFloor, item.floorNo);
      maxFloor = Math.max(maxFloor, item.floorNo);

      // ✅ Use extractNumeric instead of parseInt directly
      const flatNum = extractNumeric(item.flatNo);
      if (!isNaN(flatNum)) {
        minFlatNo = Math.min(minFlatNo, flatNum);
        maxFlatNo = Math.max(maxFlatNo, flatNum);
      }
    });

    const sortedFloors = Array.from(floorMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([floorNo, items]) => ({
        floorNo,
        flats: items.sort((a, b) => a.unitNo - b.unitNo),
      }));

    const flatsPerFloor = sortedFloors[0]?.flats.length || 0;
    const sampleItem = buildingData[0];

    let increment = 1;
    if (buildingData.length > 1) {
      // ✅ Use extractNumeric for increment calculation too
      const flat1 = extractNumeric(buildingData[0].flatNo);
      const flat2 = extractNumeric(buildingData[1].flatNo);
      if (!isNaN(flat1) && !isNaN(flat2)) {
        increment = flat2 - flat1;
      }
    }

    return {
      floors: sortedFloors,
      totalUnits: buildingData.length,
      fromFloor: minFloor,
      toFloor: maxFloor,
      flatsPerFloor,
      flatStart: minFlatNo === Infinity ? 0 : minFlatNo,
      flatEnd: maxFlatNo === -Infinity ? 0 : maxFlatNo,
      incrementedBy: Math.abs(increment),
      // ✅ Extract prefix from leading non-digit characters
      prefix: sampleItem?.flatNo.match(/^([^\d]*)/)?.[1] || "",
      generationType: sampleItem?.generationType || "",
    };
  }, [buildingData]);

  const totalFloors = organizedData.toFloor - organizedData.fromFloor + 1;

  // Handle generate properties
  const handleGenerate = async () => {
    // Validate required configuration
    if (!taxZoneId || !wardId || !societyDetailId) {
      toast.error("Missing required configuration: taxZoneId, wardId, or societyDetailId");
      return;
    }

    // Validate property type and category from selected property
    if (!propertyTypeId) {
      toast.error(t("partitionForm.wing.generate.propertyTypeRequired"));
      return;
    }
    if (!categoryId) {
      toast.error(t("partitionForm.wing.generate.categoryRequired"));
      return;
    }

    // Build payload from building data using selected property's type and category
    const payload: BulkPropertyItem[] = buildingData.map((item) => ({
      taxZoneId,
      wardId,
      propertyNo: propertyNo || "",
      propertyTypeId,
      categoryId,
      partitionNo: item.partitionNo || item.flatNo,
      flatOrShopNo: item.flatNo,
      flatOrShopNoEnglish: null,
      address: null,
      addressEnglish: null,
      location: null,
      locationEnglish: null,
      societyDetailId,
      propertyFloorId: item.propertyFloorId,
      createdBy: 0, // Will be set by server action from authenticated user
      createdDate: new Date().toISOString(),
    }));

    setGenerating(true);

    try {
      const result = await createBulkBuildingPropertiesAction(payload);

      // Check if we have data (could be success or partial failure)
      if (result.data) {
        if (result.data.allSucceeded) {
          toast.success(t("partitionForm.wing.generate.success", { count: result.data.successCount }));
          onGenerateSuccess?.();
        } else {
          // Parse and display errors as toast alert
          // Use result.data.errors from the API response
          const errorMessages = result.data.errors || [];
          const parsedErrors = parseBulkPropertyErrors(errorMessages, t, result.data.failedCount);

          // Show toast with title and description based on severity
          const toastFn = parsedErrors.severity === "warning" ? toast.warning : toast.error;
          toastFn(parsedErrors.title, {
            description: parsedErrors.messages.join("\n"),
            duration: 8000,
          });
        }
      } else {
        // Handle complete failure - no data returned
        const errorMessages = result.error ? [result.error] : [];
        const parsedErrors = parseBulkPropertyErrors(errorMessages, t);

        const toastFn = parsedErrors.severity === "warning" ? toast.warning : toast.error;
        toastFn(parsedErrors.title, {
          description: parsedErrors.messages.join("\n"),
          duration: 8000,
        });
      }
    } catch (_error) {
      toast.error(t("partitionForm.wing.generate.errors.title"), {
        description: t("partitionForm.wing.generate.errors.genericError"),
        duration: 6000,
      });
    } finally {
      setGenerating(false);
    }
  };

  // Check if generate is possible (all required data from selected property)
  const canGenerate = !!(
    taxZoneId &&
    wardId &&
    societyDetailId &&
    propertyTypeId &&
    categoryId &&
    buildingData.length > 0
  );

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("partitionForm.wing.preview.title")}
      subtitle={t("partitionForm.wing.preview.subtitle")}
      count={organizedData.totalUnits}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={handleClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 !text-slate-600 rounded-md font-medium transition-colors text-sm border border-slate-300"
          >
            <div className="flex items-center justify-end gap-2">
              <X className="w-4 h-4 text-slate-600 mr-1" />
              {t("partitionForm.wing.preview.close")}
            </div>
          </Button>
          {organizedData.totalUnits > 0 && (
            <Button
              onClick={handleGenerate}
              disabled={generating || !canGenerate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors text-sm flex items-center gap-2"
            >
              {generating ? (
                <div className="flex items-center justify-end gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("partitionForm.wing.generate.generating")}
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2">
                  <Zap className="w-4 h-4" />
                  {t("partitionForm.wing.generate.button")}
                </div>
              )}
            </Button>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-9 h-9 text-slate-400 animate-spin" />
          <p className="mt-3 text-slate-500 text-sm">
            {t("partitionForm.wing.preview.generating")}
          </p>
        </div>
      ) : organizedData.totalUnits === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Building2 className="w-12 h-12 text-slate-300" />
          <p className="mt-3 text-slate-500 text-sm">
            {t("partitionForm.wing.preview.noData")}
          </p>
        </div>
      ) : (
        <div className="flex gap-3 h-[60vh]">
          {/* Left Sticky Stats Panel */}
          <div className="w-48 shrink-0 sticky top-0 self-start space-y-2.5">
            <div className="rounded-md border border-blue-200 bg-blue-50/60 px-3 py-2 flex items-center gap-2.5">
              <Building2 className="w-[18px] h-[18px] text-blue-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-none">
                  {t("partitionForm.wing.preview.wing")}
                </p>
                <p className="text-[15px] font-bold text-slate-900 leading-tight mt-0.5">{wingLetter}</p>
              </div>
            </div>

            <div className="rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-2 flex items-center gap-2.5">
              <Layers className="w-[18px] h-[18px] text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-none">
                  {t("partitionForm.wing.preview.floors")}
                </p>
                <p className="text-[15px] font-bold text-slate-900 leading-tight mt-0.5">
                  {totalFloors}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    ({organizedData.fromFloor}–{organizedData.toFloor})
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-md border border-violet-200 bg-violet-50/60 px-3 py-2 flex items-center gap-2.5">
              <Home className="w-[18px] h-[18px] text-violet-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-none">
                  {t("partitionForm.wing.preview.flatsPerFloor")}
                </p>
                <p className="text-[15px] font-bold text-slate-900 leading-tight mt-0.5">
                  {organizedData.flatsPerFloor}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2 flex items-center gap-2.5">
              <Grid3x3 className="w-[18px] h-[18px] text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-none">
                  {t("partitionForm.wing.preview.totalUnits")}
                </p>
                <p className="text-[15px] font-bold text-slate-900 leading-tight mt-0.5">
                  {organizedData.totalUnits}
                </p>
              </div>
            </div>

            {propertyNo && (
              <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3">
                <span className="text-slate-500 font-semibold">
                  {t("partitionForm.wing.preview.propertyNo")}:
                </span>
                <span className="font-semibold text-slate-800">{propertyNo}</span>
              </div>
            )}

            {/* Legend */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
              <div className="space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-4.5 h-2.5 rounded-t-[2px] border border-sky-300 bg-sky-50" />
                  <span>{t("partitionForm.wing.preview.legend.window")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3.5 rounded-t-[2px] border border-amber-300 bg-amber-50" />
                  <span>{t("partitionForm.wing.preview.legend.door")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-200" />
                  <span>{t("partitionForm.wing.preview.topFloor")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200" />
                  <span>{t("partitionForm.wing.preview.legend.ground")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1 py-px rounded bg-amber-100 border border-amber-200 text-[10px] text-slate-700 font-medium">
                    {wingLetter}1
                  </span>
                  <span>{t("partitionForm.wing.preview.partitionId")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Scrollable Building Structure */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin">
            <div className="flex justify-center min-h-full items-center">
              <div className="inline-flex flex-col items-center w-full max-w-xl py-4">

                {/* Roof */}
                <div className="relative w-[88%]">
                  {/* Antenna */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-px h-4 bg-slate-400 mx-auto" />
                      <div className="w-2 h-2 border border-slate-400 rounded-full bg-white absolute -top-0.5 left-1/2 -translate-x-1/2" />
                    </div>
                  </div>
                  {/* Triangle */}
                  <div className="flex justify-center">
                    <div
                      className="w-0 h-0"
                      style={{
                        borderLeft: "50px solid transparent",
                        borderRight: "50px solid transparent",
                        borderBottom: "14px solid #475569",
                      }}
                    />
                  </div>
                  {/* Roof slab */}
                  <div className="h-2 bg-slate-600 rounded-t-sm" />
                  {/* Name plate */}
                  <div className="bg-slate-700 flex items-center justify-center py-1">
                    <Building2 className="w-3 h-3 text-blue-300 mr-1" />
                    <span className="text-white text-[10px] font-bold tracking-widest uppercase">
                      {t("partitionForm.wing.preview.wingLabel")} {wingLetter}
                    </span>
                  </div>
                </div>

                {/* Floors */}
                <div className="w-[88%]">
                  {organizedData.floors.map((floor, floorIndex) => {
                    const isTop = floorIndex === 0;
                    const isGround = floor.floorNo === organizedData.fromFloor;

                    return (
                      <div key={floor.floorNo}>
                        <div className="flex">
                          {/* Left wall */}
                          <div className="w-2 bg-slate-300 border-l border-slate-400 shrink-0" />

                          <div className="flex-1 flex flex-col min-w-0">
                            {/* Floor label */}
                            <div
                              className={`flex items-center justify-between px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border-b ${isTop
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : isGround
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}
                            >
                              <span>
                                {isGround ? `${t("partitionForm.wing.preview.groundFloorLabel")} (${t("partitionForm.wing.preview.floorLabel")}${floor.floorNo})` : `${t("partitionForm.wing.preview.floorLabel")}${floor.floorNo}`}
                              </span>
                              {isTop && (
                                <span className="text-[8px] bg-amber-200 text-amber-800 rounded px-1 py-px">
                                  {t("partitionForm.wing.preview.topLabel")}
                                </span>
                              )}
                            </div>

                            {/* Flats row */}
                            <div className="bg-slate-50/80 px-1.5 py-1.5">
                              <div
                                className="grid gap-1"
                                style={{
                                  gridTemplateColumns: `repeat(${organizedData.flatsPerFloor}, minmax(0, 1fr))`,
                                }}
                              >
                                {floor.flats.map((flat, flatIndex) => (
                                  <div
                                    key={flat.partitionNo || `${floor.floorNo}-${flatIndex}`}
                                    className="bg-white border border-slate-200 rounded-sm hover:border-blue-400 transition-colors cursor-default group/flat"
                                  >
                                    <div className="flex flex-col items-center py-1.5 px-0.5 min-h-[38px] justify-center">
                                      {/* Window */}
                                      <div className="w-4 h-2 rounded-t-[2px] border border-sky-300 bg-sky-50 mb-0.5" />
                                      {/* Flat no */}
                                      <span className="text-[11px] font-bold text-slate-800 group-hover/flat:text-blue-700 transition-colors leading-none">
                                        {flat.flatNo}
                                      </span>
                                      {/* Partition / Unit */}
                                      <span className="text-[10px] font-bold text-slate-700 leading-none mt-0.5 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                                        {flat.partitionNo || `U${flat.unitNo}`}
                                      </span>
                                      {/* Door */}
                                      <div className="w-2.5 h-3 rounded-t-[2px] border border-amber-300 bg-amber-50 mt-1 relative">
                                        <div className="absolute right-px top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-amber-400" />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Floor slab */}
                            <div className="h-1 bg-slate-300" />
                          </div>

                          {/* Right wall */}
                          <div className="w-2 bg-slate-300 border-r border-slate-400 shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Foundation */}
                <div className="w-[94%]">
                  <div className="h-2.5 bg-slate-500 rounded-b-sm" />
                  <div className="h-3 bg-gradient-to-b from-amber-700 to-amber-800 rounded-b relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute h-full w-px bg-amber-300 -skew-x-[30deg]"
                          style={{ left: `${i * 6 + 2}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center mt-0.5">
                    <div className="flex-1 h-px bg-slate-300" />
                    <span className="px-2 text-[8px] font-semibold text-slate-400 uppercase tracking-widest">
                      {t("partitionForm.wing.preview.groundLevel")}
                    </span>
                    <div className="flex-1 h-px bg-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sticky Summary Panel */}
          <div className="w-48 shrink-0 sticky top-0 self-start">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
              {/* Summary */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                  {t("partitionForm.wing.preview.generationSummary")}
                </span>
              </div>
              <div className="space-y-2">
                <div className="bg-white rounded-md border border-slate-200 px-2.5 py-2">
                  <span className="block text-[10px] font-semibold text-slate-500 leading-none">
                    {t("partitionForm.wing.preview.flatRange")}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-800 leading-tight mt-0.5 block">
                    {organizedData.flatStart} – {organizedData.flatEnd}
                  </span>
                </div>
                <div className="bg-white rounded-md border border-slate-200 px-2.5 py-2">
                  <span className="block text-[10px] font-semibold text-slate-500 leading-none">
                    {t("partitionForm.wing.preview.increment")}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-800 leading-tight mt-0.5 block">
                    +{organizedData.incrementedBy}
                  </span>
                </div>
                <div className="bg-white rounded-md border border-slate-200 px-2.5 py-2">
                  <span className="block text-[10px] font-semibold text-slate-500 leading-none">
                    {t("partitionForm.wing.preview.prefix")}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-800 leading-tight mt-0.5 block">
                    {organizedData.prefix || "—"}
                  </span>
                </div>
                <div className="bg-white rounded-md border border-slate-200 px-2.5 py-2">
                  <span className="block text-[10px] font-semibold text-slate-500 leading-none">
                    {t("partitionForm.wing.preview.type")}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-800 leading-tight mt-0.5 block uppercase">
                    {generationTypeLabels[organizedData.generationType] || organizedData.generationType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}