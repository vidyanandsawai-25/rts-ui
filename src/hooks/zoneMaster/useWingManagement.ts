import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PartitionFormErrors } from "@/types/zone-master/properties/partition-form.types";
import { SocietyDetailItem } from "@/types/zone-master/properties/societyDetails.types";
import { WingItem } from "@/types/zone-master/properties/wing.types";
import { WingSummary } from "@/components/modules/property-tax/zone-master/properties/wingColumns";
import { createSocietyDetailAction, updateSocietyDetailAction } from "@/app/[locale]/property-tax/zone-master/actions";

interface UseWingManagementProps {
  societyDetails: SocietyDetailItem[];
  setSocietyDetails: React.Dispatch<React.SetStateAction<SocietyDetailItem[]>>;
  wings: WingItem[];
  selectedPropertyId: number | null;
  /** Optional callback to refresh data after wing save (create/edit) */
  onWingSaveSuccess?: () => Promise<void> | void;
}

export function useWingManagement({
  societyDetails,
  setSocietyDetails,
  wings,
  selectedPropertyId,
  onWingSaveSuccess,
}: UseWingManagementProps) {
  const t = useTranslations("zoneMaster");

  const [showWingConfig, setShowWingConfig] = useState(false);
  const [showAddWingForm, setShowAddWingForm] = useState(false);
  const [newWingName, setNewWingName] = useState("");
  const [addingWing, setAddingWing] = useState(false);
  const [editingSocietyDetailId, setEditingSocietyDetailId] = useState<number | null>(null);
  const [newWingId, setNewWingId] = useState<number | null>(null);
  const [newWingNo, setNewWingNo] = useState<string>("");

  // Calculate next wing ID from SSR society details
  const nextWingId = useMemo(() => {
    if (societyDetails.length === 0) return 1;
    const maxWingId = Math.max(...societyDetails.map(item => item.wingId));
    return maxWingId + 1;
  }, [societyDetails]);

  // Get wingNo from wings array based on wingId
  const getWingNoById = useCallback((wingId: number): string => {
    const wing = wings.find(w => w.id === wingId);
    return wing?.wingNo || "";
  }, [wings]);

  // Open add wing form with initialized values
  const openAddWingForm = useCallback(() => {
    setShowAddWingForm(true);
    setNewWingId(nextWingId);
    setNewWingNo(getWingNoById(nextWingId));
  }, [nextWingId, getWingNoById]);

  // Group society details by wing
  const wingSummaries = useMemo<WingSummary[]>(() => {
    const groups = new Map<string, WingSummary>();
    
    societyDetails.forEach((item) => {
      const existing = groups.get(item.wingName);
      if (existing) {
        existing.count += 1;
      } else {
        const wing = wings.find(w => w.id === item.wingId);
        groups.set(item.wingName, { 
          wingName: item.wingName, 
          count: 1, 
          wingId: item.wingId,
          wingNo: wing?.wingNo,
          societyDetailId: item.id
        });
      }
    });
    
    // Sort by societyDetailId to maintain database order (latest added at bottom)
    return Array.from(groups.values()).sort((a, b) => a.societyDetailId - b.societyDetailId);
  }, [societyDetails, wings]);

  // Handle save wing
  const handleSaveWing = async (errors: PartitionFormErrors, setErrors: React.Dispatch<React.SetStateAction<PartitionFormErrors>>) => {
    if (!selectedPropertyId || !newWingId) return;
    
    // Validate wing name
    if (!newWingName?.trim()) {
      setErrors({ ...errors, wingName: t("partitionForm.wing.validation.wingNameRequired") });
      return;
    }

    setAddingWing(true);
    try {
      if (editingSocietyDetailId) {
        // Find existing record to preserve all existing data
        const existingRecord = societyDetails.find(item => item.id === editingSocietyDetailId);
        if (!existingRecord) {
          throw new Error("Existing record not found");
        }

        // Update existing wing - preserve all existing fields and only update modified ones
        const result = await updateSocietyDetailAction(editingSocietyDetailId, {
          // Preserve existing core data
          isActive: existingRecord.isActive,
          propertyId: existingRecord.propertyId,
          // Preserve society details
          societyName: existingRecord.societyName,
          societyAddress: existingRecord.societyAddress,
          societyNameEnglish: existingRecord.societyNameEnglish,
          societyAddressEnglish: existingRecord.societyAddressEnglish,
          societyEmailId: existingRecord.societyEmailId,
          // Preserve secretary details
          secretaryName: existingRecord.secretaryName,
          secretaryNameEnglish: existingRecord.secretaryNameEnglish,
          secretaryMobileNo: existingRecord.secretaryMobileNo,
          secretaryEmailId: existingRecord.secretaryEmailId,
          // Preserve manager details
          managerName: existingRecord.managerName,
          managerNameEnglish: existingRecord.managerNameEnglish,
          managerMobileNo: existingRecord.managerMobileNo,
          managerEmailId: existingRecord.managerEmailId,
          // Preserve land owner and builder details
          landOwnerName: existingRecord.landOwnerName,
          landOwnerNameEnglish: existingRecord.landOwnerNameEnglish,
          builderName: existingRecord.builderName,
          builderNameEnglish: existingRecord.builderNameEnglish,
          // Update only the modified fields
          wingId: newWingId,
          wingName: newWingName,
        });
        
        if (result.success && result.data) {
          setSocietyDetails(prev => prev.map(item => 
            item.id === editingSocietyDetailId ? result.data! : item
          ));
          toast.success(t("partitionForm.wing.messages.updateWingSuccess"));
        } else {
          throw new Error(result.error || "Failed to update wing");
        }
      } else {
        // Create new wing
        const result = await createSocietyDetailAction({
          propertyId: selectedPropertyId,
          wingId: newWingId,
          wingName: newWingName,
          isActive: true,
          createdBy: 1,
        });
        
        if (result.success && result.data) {
          setSocietyDetails(prev => [...prev, result.data!]);
          toast.success(t("partitionForm.wing.messages.createWingSuccess"));
        } else {
          throw new Error(result.error || "Failed to create wing");
        }
      }
      
      // Reset form
      setNewWingId(null);
      setNewWingNo("");
      setNewWingName("");
      setEditingSocietyDetailId(null);
      setShowAddWingForm(false);
      
      // Refresh data after successful save
      if (onWingSaveSuccess) {
        await onWingSaveSuccess();
      }
    } catch (_error) {
      toast.error(t("partitionForm.wing.messages.saveWingError"));
    } finally {
      setAddingWing(false);
    }
  };

  return {
    showWingConfig,
    setShowWingConfig,
    showAddWingForm,
    setShowAddWingForm,
    newWingName,
    setNewWingName,
    addingWing,
    setAddingWing,
    editingSocietyDetailId,
    setEditingSocietyDetailId,
    newWingId,
    setNewWingId,
    newWingNo,
    setNewWingNo,
    getWingNoById,
    nextWingId,
    wingSummaries,
    handleSaveWing,
    openAddWingForm,
  };
}
