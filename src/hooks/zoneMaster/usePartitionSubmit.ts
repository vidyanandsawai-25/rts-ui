import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PartitionFormState, PartitionFormErrors } from "@/types/zone-master/properties/partition-form.types";
import { WardItem } from "@/types/wardMaster.types";
import { ZonePropertyItem } from "@/types/zone-master/properties/zoneProperty.types";
import { WingItem } from "@/types/zone-master/properties/wing.types";
import { Floor } from "@/types/floor.types";
import { BulkPropertyItem } from "@/types/zone-master/properties/property-bulk.types";
import { SocietyWingDetailItem } from "@/types/zone-master/properties/society-wing-details.types";
import { generateBuildingStructureAction, createBulkBuildingPropertiesAction } from "@/app/[locale]/property-tax/zone-master/actions";

interface UsePartitionSubmitProps {
  form: PartitionFormState;
  selectedWard: WardItem | null;
  selectedProperty: ZonePropertyItem | null;
  wings: WingItem[];
  wingDetails: SocietyWingDetailItem[];
  floors: Floor[];
  validate: (data: PartitionFormState) => { valid: boolean; errors: PartitionFormErrors };
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
  onClose: () => void;
  showAddWingForm: boolean;
  newWingId: number | null;
  newWingName: string;
  handleSaveWing: (errors: PartitionFormErrors, setErrors: React.Dispatch<React.SetStateAction<PartitionFormErrors>>) => Promise<void>;
}

export function usePartitionSubmit({
  form,
  selectedWard,
  selectedProperty,
  wings,
  wingDetails,
  floors,
  validate,
  setLoading,
  onSuccess,
  onClose,
  showAddWingForm,
  newWingId,
  newWingName,
  handleSaveWing,
}: UsePartitionSubmitProps) {
  const t = useTranslations("zoneMaster");

  const handleSubmit = useCallback(async (errors: PartitionFormErrors, setErrors: React.Dispatch<React.SetStateAction<PartitionFormErrors>>) => {
    // If Add Wing form is open, use that logic instead
    if (showAddWingForm) {
      if (!newWingId || !newWingName) {
        toast.warning(t("partitionForm.wing.placeholders.wingLetter"));
        return;
      }
      await handleSaveWing(errors, setErrors);
      return;
    }

    const validationResult = validate(form);
    if (!validationResult.valid) {
      setErrors(validationResult.errors);
      toast.error(t("error.fixValidation"));
      return;
    }

    setLoading(true);
    try {
      // Handle wing partition creation
      if (form.partitionType === "wing") {
        if (!selectedWard?.id || !selectedProperty?.propertyNo) {
          toast.error("Ward ID and Property No are required");
          setLoading(false);
          return;
        }

        const selectedWing = wings.find(w => w.wingNo === form.wingLetter);
        if (!selectedWing) {
          toast.error("Invalid wing selection");
          setLoading(false);
          return;
        }

        // Convert floor IDs to floor codes for API submission
        const fromFloorId = parseInt(form.fromFloor, 10);
        const toFloorId = parseInt(form.toFloor, 10);
        
        if (isNaN(fromFloorId) || isNaN(toFloorId)) {
          toast.error("Invalid floor selection");
          setLoading(false);
          return;
        }
        
        const fromFloorData = floors.find(f => f.id === fromFloorId);
        const toFloorData = floors.find(f => f.id === toFloorId);
        
        if (!fromFloorData || !toFloorData) {
          toast.error("Invalid floor selection");
          setLoading(false);
          return;
        }

        const noOfFlatOnOneFloor = parseInt(form.noOfFlatOnOneFloor, 10);
        const flatStart = parseInt(form.flatStart, 10);
        const incrementedBy = parseInt(form.incrementedBy, 10);

        if (isNaN(noOfFlatOnOneFloor) || isNaN(flatStart) || isNaN(incrementedBy)) {
          toast.error("Invalid numeric values in form fields");
          setLoading(false);
          return;
        }

        const payload = {
          wardId: selectedWard.id,
          propertyNo: selectedProperty.propertyNo,
          wingId: selectedWing.id,
          fromFloor: fromFloorData.floorCode,
          toFloor: toFloorData.floorCode,
          noOfFlatOnOneFloor,
          flatStart,
          incrementedBy,
          prifix: form.prefix?.trim() || undefined,
          generationType: form.generationType.trim(),
        };

        const result = await generateBuildingStructureAction(payload);
        
        if (result.success) {
          toast.success(result.message || t("partitionMessages.createSuccess"));
          onSuccess?.();
          onClose();
        } else {
          toast.error(result.error || t("partitionMessages.createError"));
        }
      } else if (form.partitionType === "amenity") {
        // Handle bulk amenity creation for Apartment Categories
        if (!selectedWard?.id || !selectedProperty) {
          toast.error("Ward and Property are required");
          setLoading(false);
          return;
        }

        if (!selectedProperty.taxZoneId || !selectedProperty.propertyTypeId || !selectedProperty.categoryId) {
          toast.error("Missing required property configuration: taxZoneId, propertyTypeId, or categoryId");
          setLoading(false);
          return;
        }

        const fromAmenity = parseInt(form.fromAmenity, 10);
        const toAmenity = parseInt(form.toAmenity, 10);

        if (isNaN(fromAmenity) || isNaN(toAmenity)) {
          toast.error("Invalid amenity range");
          setLoading(false);
          return;
        }

        // Determine the prefix and societyDetailId based on selected wing
        let amenityPrefix = "AM";
        let societyDetailId: number | undefined;
        
        if (form.selectedWingForAmenity) {
          // If a wing is selected, use wingNo-AM format and get societyDetailId
          amenityPrefix = `${form.selectedWingForAmenity}-AM`;
          const selectedWingDetail = wingDetails.find(
            detail => detail.wingNo === form.selectedWingForAmenity
          );
          societyDetailId = selectedWingDetail?.societyDetailId;
        }

        const currentDate = new Date().toISOString();
        const bulkPayload: BulkPropertyItem[] = [];

        for (let i = fromAmenity; i <= toAmenity; i++) {
          bulkPayload.push({
            taxZoneId: selectedProperty.taxZoneId,
            wardId: selectedWard.id,
            propertyNo: selectedProperty.propertyNo,
            propertyTypeId: selectedProperty.propertyTypeId,
            categoryId: selectedProperty.categoryId,
            partitionNo: `${amenityPrefix}${i}`,
            flatOrShopNo: "",
            flatOrShopNoEnglish: "",
            address: selectedProperty.address || "",
            addressEnglish: selectedProperty.addressEnglish || "",
            location: selectedProperty.location || "",
            locationEnglish: selectedProperty.locationEnglish || "",
            societyDetailId,
            createdBy: 0, // Will be set by server action from authenticated user
            createdDate: currentDate,
          });
        }

        const result = await createBulkBuildingPropertiesAction(bulkPayload);
        
        if (result.success) {
          const successCount = result.data?.successCount ?? bulkPayload.length;
          toast.success(t("partitionMessages.amenityCreateSuccess", { count: successCount }));
          onSuccess?.();
          onClose();
        } else {
          toast.error(result.error || t("partitionMessages.amenityCreateError"));
        }
      } else {
        // Handle bulk partition creation for Non-Apartment Categories
        if (!selectedWard?.id || !selectedProperty) {
          toast.error("Ward and Property are required");
          setLoading(false);
          return;
        }

        if (!selectedProperty.taxZoneId || !selectedProperty.propertyTypeId || !selectedProperty.categoryId) {
          toast.error("Missing required property configuration: taxZoneId, propertyTypeId, or categoryId");
          setLoading(false);
          return;
        }

        const fromPartition = parseInt(form.fromPartition, 10);
        const toPartition = parseInt(form.toPartition, 10);

        if (isNaN(fromPartition) || isNaN(toPartition)) {
          toast.error("Invalid partition range");
          setLoading(false);
          return;
        }

        const currentDate = new Date().toISOString();
        const bulkPayload: BulkPropertyItem[] = [];

        for (let i = fromPartition; i <= toPartition; i++) {
          bulkPayload.push({
            taxZoneId: selectedProperty.taxZoneId,
            wardId: selectedWard.id,
            propertyNo: selectedProperty.propertyNo,
            propertyTypeId: selectedProperty.propertyTypeId,
            categoryId: selectedProperty.categoryId,
            partitionNo: String(i),
            flatOrShopNo: "",
            flatOrShopNoEnglish: "",
            address: selectedProperty.address || "",
            addressEnglish: selectedProperty.addressEnglish || "",
            location: selectedProperty.location || "",
            locationEnglish: selectedProperty.locationEnglish || "",
            createdBy: 0, // Will be set by server action from authenticated user
            createdDate: currentDate,
          });
        }

        const result = await createBulkBuildingPropertiesAction(bulkPayload);
        
        if (result.success) {
          const successCount = result.data?.successCount ?? bulkPayload.length;
          toast.success(t("partitionMessages.bulkCreateSuccess", { count: successCount }));
          onSuccess?.();
          onClose();
        } else {
          toast.error(result.error || t("partitionMessages.createError"));
        }
      }
    } catch (_error) {
      toast.error(t("partitionMessages.createError"));
    } finally {
      setLoading(false);
    }
  }, [form, selectedWard, selectedProperty, wings, wingDetails, floors, validate, setLoading, onSuccess, onClose, showAddWingForm, newWingId, newWingName, handleSaveWing, t]);

  return {
    handleSubmit,
  };
}
