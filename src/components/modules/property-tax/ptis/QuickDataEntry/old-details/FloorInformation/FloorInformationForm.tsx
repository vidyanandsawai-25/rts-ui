"use client"

import { Button, DeleteButton, EditButton, Input, MasterTable, SearchSelect, useConfirm } from "@/components/common";
import { Label } from "@/components/common/label";
import { Layers, Plus, RotateCcw, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { useRouter, useSearchParams, usePathname, useParams } from 'next/navigation';

import {
  SubTypeOfUse,
  OldFloorDetail,
  FloorInformationFormProps
} from "@/types/property-old-details.types";

import { SaveOldFloorDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/floor-information/action";
import { toast } from "sonner";

export default function FloorInformationForm({
  floorOptions = [],
  subFloorOptions = [],
  constructionTypeOptions = [],
  useOptions = [],
  initialSubUseTypeOptions = [],
  existingFloorDetails = [],
}: FloorInformationFormProps) {

  const t = useTranslations('quickDataEntry');
  const tCommon = useTranslations('common');
  const { confirm } = useConfirm();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const propertyId = Number(params.propertyId);
  const locale = params.locale as string;

  // Form State
  const [formData, setFormData] = useState({
    id: null as number | null,
    oldFloorId: "" as string | number,
    oldSubFloorId: "" as string | number,
    oldConstructionYear: "",
    oldConstructionTypeId: "" as string | number,
    oldTypeOfUseId: "" as string | number,
    oldSubTypeOfUseId: "" as string | number,
    oldCarpetAreaSqFeet: "",
    markedForDeletion: false
  });

  const [subUseTypeOptions, setSubUseTypeOptions] = useState<SubTypeOfUse[]>(initialSubUseTypeOptions);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial sub-use types
  useEffect(() => {
    setSubUseTypeOptions(initialSubUseTypeOptions);
  }, [initialSubUseTypeOptions]);

  // Handle Type of Use Change (Master Data dependency)
  const handleUseTypeChange = async (val: string | number, isEditBinding = false) => {
    const useTypeId = val ? String(val) : "";

    setFormData(prev => ({
      ...prev,
      oldTypeOfUseId: useTypeId,
      oldSubTypeOfUseId: isEditBinding ? prev.oldSubTypeOfUseId : ""
    }));

    // Update URL to trigger server-side fetch of sub-use types
    const urlParams = new URLSearchParams(searchParams);
    if (useTypeId) {
      urlParams.set('typeOfUseId', useTypeId);
    } else {
      urlParams.delete('typeOfUseId');
    }
    router.replace(`${pathname}?${urlParams.toString()}`, { scroll: false });
  };

  // Transformation helpers for SearchSelect
  const initialFloorOptions = floorOptions.map(opt => ({ label: opt.description, value: String(opt.id) }));
  const initialSubFloorOptions = subFloorOptions.map(opt => ({ label: opt.description, value: String(opt.id) }));
  const initialConstructionTypeOptions = constructionTypeOptions.map(opt => ({ label: opt.description, value: String(opt.id) }));
  const initialUseOptions = useOptions.map(opt => ({ label: opt.description, value: String(opt.id) }));
  const currentSubUseTypeOptions = subUseTypeOptions.map(opt => ({ label: opt.description, value: String(opt.id) }));

  // Handle Edit Action
  const handleEdit = (row: OldFloorDetail) => {
    setFormData({
      id: row.id,
      oldFloorId: String(row.oldFloorId),
      oldSubFloorId: row.oldSubFloorId ? String(row.oldSubFloorId) : "",
      oldConstructionYear: row.oldConstructionYear,
      oldConstructionTypeId: String(row.oldConstructionTypeId),
      oldTypeOfUseId: row.oldTypeOfUseId ? String(row.oldTypeOfUseId) : "",
      oldSubTypeOfUseId: row.oldSubTypeOfUseId ? String(row.oldSubTypeOfUseId) : "",
      oldCarpetAreaSqFeet: String(row.oldCarpetAreaSqFeet),
      markedForDeletion: row.markedForDeletion
    });

    // 2. Load sub-use types without clearing the ID
    if (row.oldTypeOfUseId !== undefined && row.oldTypeOfUseId !== null) {
      handleUseTypeChange(row.oldTypeOfUseId, true);
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Reset/Clear
  const handleReset = () => {
    setFormData({
      id: null,
      oldFloorId: "",
      oldSubFloorId: "",
      oldConstructionYear: "",
      oldConstructionTypeId: "",
      oldTypeOfUseId: "",
      oldSubTypeOfUseId: "",
      oldCarpetAreaSqFeet: "",
      markedForDeletion: false
    });

    const urlParams = new URLSearchParams(searchParams);
    urlParams.delete('typeOfUseId');
    router.replace(`${pathname}?${urlParams.toString()}`, { scroll: false });
  };

  // Handle Save (Create or Update)
  const handleSave = async () => {
    if (!formData.oldFloorId || !formData.oldConstructionYear || !formData.oldConstructionTypeId || !formData.oldTypeOfUseId) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        propertyId: propertyId,
        oldFloorId: Number(formData.oldFloorId),
        oldSubFloorId: formData.oldSubFloorId ? Number(formData.oldSubFloorId) : null,
        oldConstructionTypeId: Number(formData.oldConstructionTypeId),
        oldTypeOfUseId: Number(formData.oldTypeOfUseId),
        oldSubTypeOfUseId: formData.oldSubTypeOfUseId ? Number(formData.oldSubTypeOfUseId) : null,
        oldCarpetAreaSqFeet: Number(formData.oldCarpetAreaSqFeet) || 0,
        oldConstructionYear: formData.oldConstructionYear.toString()
      };

      const result = await SaveOldFloorDetailsAction(propertyId, payload, locale);

      if (result.success) {
        toast.success(formData.id ? "Floor details updated successfully" : "Floor details added successfully");
        handleReset();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save floor details");
      }
    } catch (_error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  interface FloorTableRow {
    id: number;
    originalRow: OldFloorDetail;
    floor: string;
    subFloor: string | null;
    conYr: string;
    conTyp: string;
    use: string;
    subUse: string | null;
    areaSqFt: number;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-50">
        <h3 className="text-base font-bold text-blue-800 mb-6 flex items-center gap-2 pb-3 border-b border-blue-100">
          <Layers className="w-5 h-5" />
          {formData.id ? "Update Floor Information" : t("oldDetails.floorDetailsTitle")}
        </h3>

        {/* Floor Entry Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Floor */}
          <div className="space-y-2 relative focus-within:z-50">
            <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
              {t('floor.floorLabel')} <span className="text-red-500">*</span>
            </Label>
            <SearchSelect
              options={initialFloorOptions}
              placeholder={t('oldDetails.floordtails.selectPlaceholder')}
              className="h-11 border-blue-100 focus:ring-blue-400"
              name="floor"
              onChange={(_, val) => setFormData(prev => ({ ...prev, oldFloorId: val }))}
              value={String(formData.oldFloorId)}
            />
          </div>

          {/* Sub Floor */}
          <div className="space-y-2 relative focus-within:z-50">
            <Label className="text-sm font-bold text-blue-900">
              {t('floor.subFloor')}
            </Label>
            <SearchSelect
              options={initialSubFloorOptions}
              placeholder={t('oldDetails.floordtails.selectPlaceholder')}
              className="h-11 border-blue-100 focus:ring-blue-400"
              name="subFloor"
              onChange={(_, val) => setFormData(prev => ({ ...prev, oldSubFloorId: val }))}
              value={String(formData.oldSubFloorId)}
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
              {t('oldDetails.year')} <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-11 border-blue-100 focus:ring-blue-400"
              placeholder="YYYY"
              maxLength={4}
              value={formData.oldConstructionYear}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setFormData(prev => ({ ...prev, oldConstructionYear: val }));
              }}
            />
          </div>

          {/* Construction Type */}
          <div className="space-y-2 relative focus-within:z-50">
            <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
              {t('floor.conTyp')} <span className="text-red-500">*</span>
            </Label>
            <SearchSelect
              options={initialConstructionTypeOptions}
              placeholder={t('oldDetails.floordtails.selectPlaceholder')}
              className="h-11 border-blue-100 focus:ring-blue-400"
              name="conTyp"
              onChange={(_, val) => setFormData(prev => ({ ...prev, oldConstructionTypeId: val }))}
              value={String(formData.oldConstructionTypeId)}
            />
          </div>

          {/* Type of Use */}
          <div className="space-y-2 relative focus-within:z-50">
            <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
              {t('oldDetails.floordtails.use')} <span className="text-red-500">*</span>
            </Label>
            <SearchSelect
              options={initialUseOptions}
              placeholder={t('oldDetails.floordtails.selectPlaceholder')}
              className="h-11 border-blue-100 focus:ring-blue-400"
              name="use"
              onChange={(_, val) => handleUseTypeChange(val)}
              value={String(formData.oldTypeOfUseId)}
            />
          </div>

          {/* Sub Type */}
          <div className="space-y-2 relative focus-within:z-50">
            <Label className="text-sm font-bold text-blue-900">
              {t('floor.subTyp')}
            </Label>
            <SearchSelect
              options={currentSubUseTypeOptions}
              placeholder={t('oldDetails.floordtails.selectPlaceholder')}
              className="h-11 border-blue-100 focus:ring-blue-400"
              name="subUseType"
              onChange={(_, val) => setFormData(prev => ({ ...prev, oldSubTypeOfUseId: val }))}
              value={String(formData.oldSubTypeOfUseId)}
            />
          </div>

          {/* Carpet Area */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-blue-900">
              {t('oldDetails.carpetArea')}
            </Label>
            <Input
              type="number"
              className="h-11 border-blue-100 focus:ring-blue-400"
              placeholder={t('oldDetails.floordtails.carpetAreaPlaceholder')}
              value={formData.oldCarpetAreaSqFeet}
              onChange={(e) => setFormData(prev => ({ ...prev, oldCarpetAreaSqFeet: e.target.value }))}
            />
          </div>

          {/* Buttons Group */}
          <div className="lg:col-span-2 flex items-end gap-3 mt-7">
            {!formData.id ? (
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                icon={Plus}
                className="h-11 w-48 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 flex flex-row items-center justify-center gap-2 active:scale-[0.98]"
              >
                {t('oldDetails.button.add')}
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                icon={Save}
                className="h-11 w-48 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 flex flex-row items-center justify-center gap-2 active:scale-[0.98]"
              >
                {t('property.updateButton')}
              </Button>
            )}

            {formData.id && (
              <Button
                onClick={handleReset}
                icon={RotateCcw}
                className="h-11 w-40 border border-blue-100 text-blue-600 hover:bg-blue-50 text-sm font-bold rounded-xl transition-all duration-200 flex flex-row items-center justify-center gap-2 active:scale-[0.98]"
              >
                {tCommon('buttons.clear')}
              </Button>
            )}
          </div>
        </div>

        {/* MasterTable Section */}
        <div className="border border-blue-100 rounded-xl overflow-hidden bg-gray-50/30">
          <MasterTable
            columns={[
              { key: 'floor', label: t('floor.floorLabel') },
              { key: 'subFloor', label: t('floor.subFloor') },
              { key: 'conYr', label: t('floor.conYr') },
              { key: 'conTyp', label: t('floor.conTyp') },
              { key: 'use', label: t('floor.use') },
              { key: 'subUse', label: t('floor.subTyp') },
              {
                key: 'areaSqFt',
                label: t('floor.carpetArea'),
                render: (value) => <span className="font-bold text-blue-700">{String(value)}</span>
              },
            ]}
            data={existingFloorDetails.map(f => ({
              id: f.id,
              originalRow: f, // Keep reference for edit
              floor: f.floorDescription,
              subFloor: f.subFloorDescription,
              conYr: f.oldConstructionYear,
              conTyp: f.constructionTypeDescription,
              use: f.typeOfUseDescription,
              subUse: f.subTypeOfUseDescription,
              areaSqFt: f.oldCarpetAreaSqFeet,
            }))}

            getRowKey={(row: FloorTableRow) => String(row.id || "")}
            maxBodyHeightClassName="max-h-[400px]"
            theadClassName="bg-blue-50 text-blue-900 border-b border-blue-100"
            rowClassName={() => "hover:bg-blue-50/50 transition-colors"}
            actionLabel={t('floor.actions')}
            renderActions={(row: FloorTableRow) => (
              <div className="flex items-center gap-2">
                <EditButton onClick={() => handleEdit(row.originalRow)} />
                <DeleteButton
                  onClick={() => {
                    confirm({
                      variant: "delete",
                      title: tCommon("messages.confirmDelete"),
                      meta: { id: row.id, name: row.floor },
                      onConfirm: () => {
                        // handle delete
                      }
                    });
                  }}
                />
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
