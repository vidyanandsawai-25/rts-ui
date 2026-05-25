import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PartitionFormErrors } from "@/types/partition-form.types";
import { SocietyDetailItem } from "@/types/societyDetails.types";
import { WingItem } from "@/types/wing.types";
import { WingSummary } from "@/components/modules/property-tax/zone-master/properties/wingColumns";
import { createSocietyDetailAction, updateSocietyDetailAction } from "@/app/[locale]/property-tax/zone-master/actions";

interface UseWingManagementProps {
  societyDetails: SocietyDetailItem[];
  setSocietyDetails: React.Dispatch<React.SetStateAction<SocietyDetailItem[]>>;
  wings: WingItem[];
  selectedPropertyId: number | null;
}

export function useWingManagement({
  societyDetails,
  setSocietyDetails,
  wings,
  selectedPropertyId,
}: UseWingManagementProps) {
  const t = useTranslations("zoneMaster");

  const [showWingConfig, setShowWingConfig] = useState(false);
  const [showAddWingForm, setShowAddWingForm] = useState(false);
  const [newWingName, setNewWingName] = useState("");
  const [addingWing, setAddingWing] = useState(false);
  const [editingSocietyDetailId, setEditingSocietyDetailId] = useState<number | null>(null);
  const [newWingId, setNewWingId] = useState<number | null>(null);

  // Calculate next wing ID from SSR society details
  const nextWingId = useMemo(() => {
    if (societyDetails.length === 0) return 1;
    const maxWingId = Math.max(...societyDetails.map(item => item.wingId));
    return maxWingId + 1;
  }, [societyDetails]);

  // Initialize newWingId when showing add form
  if (showAddWingForm && !editingSocietyDetailId && newWingId === null) {
    setNewWingId(nextWingId);
  }

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
    
    return Array.from(groups.values()).sort((a, b) => a.wingName.localeCompare(b.wingName));
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
        // Update existing wing
        const result = await updateSocietyDetailAction(editingSocietyDetailId, {
          propertyId: selectedPropertyId,
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
      setNewWingName("");
      setEditingSocietyDetailId(null);
      setShowAddWingForm(false);
    } catch (error) {
      console.error("Error saving wing:", error);
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
    nextWingId,
    wingSummaries,
    handleSaveWing,
  };
}
