import { useState, useMemo } from "react";
import { PartitionFormState, PartitionFormErrors } from "@/types/partition-form.types";
import { ZonePropertyItem } from "@/types/zoneProperty.types";
import { WingItem } from "@/types/wing.types";
import { Floor } from "@/types/floor.types";
import { SocietyDetailItem } from "@/types/societyDetails.types";
import { BuildingStructureItem } from "@/types/building-structure.types";

const INITIAL: PartitionFormState = {
  mainPropertyId: null,
  partitionNo: "0",
  partitionType: "wing",
  isActive: true,
  bulkCreateMode: false,
  alphanumericMode: false,
  createNewWing: false,
  wingLetter: "",
  fromFloor: "",
  toFloor: "",
  noOfFlatOnOneFloor: "",
  flatStart: "",
  incrementedBy: "",
  prefix: "",
  generationType: "",
  fromPartition: "",
  toPartition: "",
};

interface UsePartitionFormStateProps {
  selectedPropertyId: number | null;
  ssrNextPartitionNumber: number | null;
  ssrProperties: ZonePropertyItem[];
  ssrWings: WingItem[];
  ssrFloors: Floor[];
  ssrSocietyDetails: SocietyDetailItem[];
}

export function usePartitionFormState({
  selectedPropertyId,
  ssrNextPartitionNumber,
  ssrProperties,
  ssrWings,
  ssrFloors,
  ssrSocietyDetails,
}: UsePartitionFormStateProps) {
  // Initialize form state from SSR prop
  const initialFormState = useMemo(() => ({
    ...INITIAL,
    mainPropertyId: selectedPropertyId,
    fromPartition: ssrNextPartitionNumber !== null ? String(ssrNextPartitionNumber) : "",
  }), [selectedPropertyId, ssrNextPartitionNumber]);

  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<PartitionFormErrors>({});
  
  // State for all properties - initialized from SSR data
  const [allProperties] = useState<ZonePropertyItem[]>(ssrProperties);
  const [loadingProperties] = useState(false);

  // State for wings - initialized from SSR data
  const [wings] = useState<WingItem[]>(ssrWings);

  // State for floors - initialized from SSR data
  const [floors] = useState<Floor[]>(ssrFloors);
  const [loadingFloors] = useState(false);

  // Society details from SSR - with state for client-side updates after mutations
  const [societyDetails, setSocietyDetails] = useState<SocietyDetailItem[]>(ssrSocietyDetails);

  // State for building preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<BuildingStructureItem[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Sync form state when prop changes (for navigation)
  if (form.mainPropertyId !== selectedPropertyId) {
    setForm(prev => ({ 
      ...prev, 
      mainPropertyId: selectedPropertyId,
      fromPartition: ssrNextPartitionNumber !== null ? String(ssrNextPartitionNumber) : "",
    }));
  }

  // Sync fromPartition when SSR value changes
  const expectedFromPartition = ssrNextPartitionNumber !== null ? String(ssrNextPartitionNumber) : "";
  if (form.fromPartition !== expectedFromPartition && selectedPropertyId) {
    setForm(prev => ({ ...prev, fromPartition: expectedFromPartition }));
  }

  // Sync society details when SSR prop changes
  if (societyDetails !== ssrSocietyDetails && JSON.stringify(societyDetails) !== JSON.stringify(ssrSocietyDetails)) {
    setSocietyDetails(ssrSocietyDetails);
  }

  // Derive selected property from SSR data and prop
  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return ssrProperties.find(p => p.id === selectedPropertyId) || null;
  }, [selectedPropertyId, ssrProperties]);

  // Get societyDetailId for the selected wing
  const selectedSocietyDetailId = useMemo(() => {
    if (!form.wingLetter) return undefined;
    const wing = wings.find(w => w.wingNo === form.wingLetter);
    if (!wing) return undefined;
    const societyDetail = societyDetails.find(sd => sd.wingId === wing.id);
    return societyDetail?.id;
  }, [form.wingLetter, wings, societyDetails]);

  return {
    form,
    setForm,
    loading,
    setLoading,
    errors,
    setErrors,
    allProperties,
    loadingProperties,
    wings,
    floors,
    loadingFloors,
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
  };
}
