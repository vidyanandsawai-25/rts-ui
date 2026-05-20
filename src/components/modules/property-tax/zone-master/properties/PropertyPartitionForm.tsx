"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Grid3x3, Building2, Check, Eye, Info } from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton, ToggleSwitch, Input, ValidationMessage, Select, Tabs, MasterTable, AddButton } from "@/components/common";
import { WardItem } from "@/types/wardMaster.types";
import { ZonePropertyItem } from "@/types/zoneProperty.types";
import { WingItem } from "@/types/wing.types";
import { BuildingStructureItem } from "@/types/building-structure.types";
import { Floor } from "@/types/floor.types";
import { SocietyDetailItem, CreateSocietyDetailPayload } from "@/types/societyDetails.types";
import { 
  generateBuildingStructureAction, 
  createSocietyDetailAction,
  updateSocietyDetailAction
} from "@/app/[locale]/property-tax/zone-master/actions";
import { BuildingPreviewModal } from "./BuildingPreviewModal";
import { getWingColumns, WingSummary } from "./wingColumns";

interface PartitionFormState {
  mainPropertyId: number | null;
  partitionNo: string;
  partitionType: "partition" | "wing" | "amenity";
  isActive: boolean;
  bulkCreateMode: boolean;
  alphanumericMode: boolean;
  // Wing-specific fields
  createNewWing: boolean;
  wingLetter: string;
  fromFloor: string;
  toFloor: string;
  noOfFlatOnOneFloor: string;
  flatStart: string;
  incrementedBy: string;
  prefix: string;
  generationType: string;
}

interface PartitionFormErrors {
  mainPropertyId?: string;
  partitionNo?: string;
  wingLetter?: string;
  wingName?: string;
  fromFloor?: string;
  toFloor?: string;
  noOfFlatOnOneFloor?: string;
  flatStart?: string;
  incrementedBy?: string;
  generationType?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedWard?: WardItem | null;
  categoryMap?: Map<number, string>;
  // SSR data props
  ssrProperties?: ZonePropertyItem[];
  ssrWings?: WingItem[];
  ssrFloors?: Floor[];
  selectedPropertyId?: number | null;
  ssrSocietyDetails?: SocietyDetailItem[];
}

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
};


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
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("zoneMaster");
  const tCommon = useTranslations("common");

  // Initialize form state from SSR prop - proper SSR without useEffect
  const initialFormState = useMemo(() => ({
    ...INITIAL,
    mainPropertyId: selectedPropertyId,
  }), [selectedPropertyId]);

  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<PartitionFormErrors>({});
  
  // Derive selected property from SSR data and prop
  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return ssrProperties.find(p => p.id === selectedPropertyId) || null;
  }, [selectedPropertyId, ssrProperties]);

  // Sync form state when prop changes (for navigation) - render-time state update
  if (form.mainPropertyId !== selectedPropertyId) {
    setForm(prev => ({ ...prev, mainPropertyId: selectedPropertyId }));
  }
  
  // State for all properties - initialized from SSR data
  const [allProperties] = useState<ZonePropertyItem[]>(ssrProperties);
  const [loadingProperties] = useState(false);

  // State for wings - initialized from SSR data
  const [wings] = useState<WingItem[]>(ssrWings);
  const [loadingWings] = useState(false);

  // State for floors - initialized from SSR data
  const [floors] = useState<Floor[]>(ssrFloors);
  const [loadingFloors] = useState(false);

  // Society details from SSR - with state for client-side updates after mutations
  const [societyDetails, setSocietyDetails] = useState<SocietyDetailItem[]>(ssrSocietyDetails);

  // Sync society details when SSR prop changes (on navigation/refresh)
  if (societyDetails !== ssrSocietyDetails && JSON.stringify(societyDetails) !== JSON.stringify(ssrSocietyDetails)) {
    setSocietyDetails(ssrSocietyDetails);
  }

  // State for building preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<BuildingStructureItem[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Get societyDetailId for the selected wing
  const selectedSocietyDetailId = useMemo(() => {
    if (!form.wingLetter) return undefined;
    // Find wing by wingNo
    const wing = wings.find(w => w.wingNo === form.wingLetter);
    if (!wing) return undefined;
    // Find society detail for this wing
    const societyDetail = societyDetails.find(sd => sd.wingId === wing.id);
    return societyDetail?.id;
  }, [form.wingLetter, wings, societyDetails]);

  // Reset form when drawer closes - keep this as it's for state reset, not data fetching
  const handleClose = () => {
    setForm(INITIAL);
    setErrors({});
    setSocietyDetails([]);
    setShowWingConfig(false);
    setShowAddWingForm(false);
    setNewWingId(null);
    setNewWingName("");
    setEditingSocietyDetailId(null);
    
    // Clear propertyId from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("partitionPropertyId");
    router.push(`${pathname}?${params.toString()}`);
    
    onClose();
  };

  const [showWingConfig, setShowWingConfig] = useState(false);
  const [showAddWingForm, setShowAddWingForm] = useState(false);
  const [newWingName, setNewWingName] = useState("");
  const [addingWing, setAddingWing] = useState(false);
  const [editingSocietyDetailId, setEditingSocietyDetailId] = useState<number | null>(null);

  // Calculate next wing ID from SSR society details - no async fetching for proper SSR
  const nextWingId = useMemo(() => {
    if (societyDetails.length === 0) return 1;
    const maxWingId = Math.max(...societyDetails.map(item => item.wingId));
    return maxWingId + 1;
  }, [societyDetails]);

  // Initialize newWingId when showing add form
  const [newWingId, setNewWingId] = useState<number | null>(null);
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

  // Define columns for the wing summary table using the external component
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
        wingLetter: row.wingNo || row.wingName // Use wingNo for dropdown, fallback to wingName
      }));
      setShowWingConfig(true);
      toast.info(`Selected Wing ${row.wingName} (${row.wingNo}) for updates`);
    }
  }), [t]);

  // Show only properties without partition number
  const propertyOptions = useMemo(() => {
    return allProperties
      .filter((property) => !property.partitionNo || property.partitionNo === "0")
      .map((property) => {
        // Try categoryMap lookup for category name
        let categoryName: string | null = null;
        if (property.categoryId && categoryMap) {
          categoryName = categoryMap.get(property.categoryId) || null;
        }
        const label = categoryName
          ? `${property.propertyNo} - ${categoryName}`
          : property.propertyNo;
        return {
          value: String(property.id),
          label,
        };
      });
  }, [allProperties, categoryMap]);

  // Check if selected property category is Apartment or Multi Commercial Apartment
  const isApartmentCategory = useMemo(() => {
    if (!selectedProperty?.categoryId || !categoryMap) return false;
    const categoryName = categoryMap.get(selectedProperty.categoryId);
    return categoryName === "Apartment" || categoryName === "Multi Commercial Apartment";
  }, [selectedProperty, categoryMap]);

  // Wing options for Select dropdown - use society details to get wing names
  const wingOptions = useMemo(() => {
    // Get unique wings from society details (includes wing names)
    const uniqueWings = new Map<number, { wingNo: string; wingName: string }>();
    
    societyDetails.forEach((item) => {
      if (!uniqueWings.has(item.wingId)) {
        const wing = wings.find(w => w.id === item.wingId);
        if (wing) {
          uniqueWings.set(item.wingId, {
            wingNo: wing.wingNo,
            wingName: item.wingName
          });
        }
      }
    });
    
    // Convert to options array and sort
    return Array.from(uniqueWings.values())
      .map((wing) => ({
        value: wing.wingNo,
        label: `${wing.wingNo} - ${wing.wingName}`,
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [wings, societyDetails]);

  // Generation Type static options
  const generationTypeOptions = [
    { value: "V", label: "V - Vertical" },
    { value: "H", label: "H - Horizontal" },
    { value: "VC", label: "VC - Vertical Custom" },
    { value: "HC", label: "HC - Horizontal Custom" },
  ];

  // From Floor options (all active floors)
  const fromFloorOptions = useMemo(() => {
    return floors.map((floor) => ({
      value: floor.floorCode,
      label: `${floor.floorCode} - ${floor.description}`,
    }));
  }, [floors]);

  // To Floor options (filtered based on From Floor selection)
  const toFloorOptions = useMemo(() => {
    if (!form.fromFloor || floors.length === 0) {
      return [];
    }

    // Find the index of the selected From Floor
    const fromFloorIndex = floors.findIndex((floor) => floor.floorCode === form.fromFloor);
    
    if (fromFloorIndex === -1) {
      return [];
    }

    // Return floors from the selected From Floor onwards (including From Floor)
    return floors
      .slice(fromFloorIndex)
      .map((floor) => ({
        value: floor.floorCode,
        label: `${floor.floorCode} - ${floor.description}`,
      }));
  }, [floors, form.fromFloor]);

  // Handle property selection - SSR approach: Update URL parameter
  const handlePropertySelect = (_e: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    const propertyId = value ? parseInt(value, 10) : null;
    
    // Update URL with propertyId parameter for SSR
    const params = new URLSearchParams(searchParams.toString());
    if (propertyId) {
      params.set("partitionPropertyId", String(propertyId));
    } else {
      params.delete("partitionPropertyId");
    }
    router.push(`${pathname}?${params.toString()}`);
    
    // Also update local form state for immediate UI feedback
    setForm({ ...form, mainPropertyId: propertyId });
    setErrors({ ...errors, mainPropertyId: undefined });
  };

  // Handle From Floor selection
  const handleFromFloorChange = (_e: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    setForm((prev) => {
      const newForm = { ...prev, fromFloor: value };
      
      // If To Floor is now invalid (less than new From Floor), reset it
      if (prev.toFloor) {
        const fromFloorIndex = floors.findIndex((floor) => floor.floorCode === value);
        const toFloorIndex = floors.findIndex((floor) => floor.floorCode === prev.toFloor);
        
        if (fromFloorIndex !== -1 && toFloorIndex !== -1 && toFloorIndex < fromFloorIndex) {
          newForm.toFloor = "";
          console.log("[PropertyPartitionForm] Reset To Floor as it became invalid");
        }
      }
      
      return newForm;
    });
    setErrors({ ...errors, fromFloor: undefined, toFloor: undefined });
  };

  // Handle To Floor selection
  const handleToFloorChange = (_e: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    setForm({ ...form, toFloor: value });
    setErrors({ ...errors, toFloor: undefined });
  };

  // Calculate max partition number for the selected property
  const calculateMaxPartition = (): number => {
    if (!selectedProperty) return 0;
    
    // Get all partitions for this property
    const existingPartitions = allProperties.filter(
      (p) => p.propertyNo === selectedProperty.propertyNo && p.partitionNo && p.partitionNo !== "0"
    );

    // Find max numeric partition
    const numericPartitions = existingPartitions
      .map((p) => parseInt(p.partitionNo || "0", 10))
      .filter((n) => !isNaN(n));

    return numericPartitions.length > 0 ? Math.max(...numericPartitions) : 0;
  };

  // Check if partition has numeric partitions
  const hasNumericPartitions = (): boolean => {
    if (!selectedProperty) return false;
    
    const existingPartitions = allProperties.filter(
      (p) => p.propertyNo === selectedProperty.propertyNo && p.partitionNo && p.partitionNo !== "0"
    );

    return existingPartitions.some((p) => !isNaN(parseInt(p.partitionNo || "0", 10)));
  };

  // Calculate partition number during render - proper SSR without useEffect
  const calculatedPartitionNo = useMemo(() => {
    if (selectedProperty && !form.alphanumericMode) {
      return String(calculateMaxPartition());
    }
    return form.partitionNo;
  }, [selectedProperty, form.alphanumericMode]);

  // Sync partition number when it changes
  if (form.partitionNo !== calculatedPartitionNo && !form.alphanumericMode && selectedProperty) {
    setForm(prev => ({ ...prev, partitionNo: calculatedPartitionNo }));
  }

  // Validate form
  const validate = (data: PartitionFormState): boolean => {
    const newErrors: PartitionFormErrors = {};

    if (!data.mainPropertyId) {
      newErrors.mainPropertyId = t("partitionForm.validation.mainPropertyRequired");
    }

    // Validate based on partition type
    if (data.partitionType === "wing" && data.createNewWing) {
      // Validate wing-specific fields
      if (!data.wingLetter?.trim()) {
        newErrors.wingLetter = t("partitionForm.wing.validation.wingLetterRequired");
      }
      if (!data.fromFloor?.trim()) {
        newErrors.fromFloor = t("partitionForm.wing.validation.fromFloorRequired");
      }
      if (!data.toFloor?.trim()) {
        newErrors.toFloor = t("partitionForm.wing.validation.toFloorRequired");
      }
      if (!data.noOfFlatOnOneFloor?.trim()) {
        newErrors.noOfFlatOnOneFloor = t("partitionForm.wing.validation.noOfFlatRequired");
      }
      if (!data.flatStart?.trim()) {
        newErrors.flatStart = t("partitionForm.wing.validation.flatStartRequired");
      }
      if (!data.incrementedBy?.trim()) {
        newErrors.incrementedBy = t("partitionForm.wing.validation.incrementedByRequired");
      }
      if (!data.generationType?.trim()) {
        newErrors.generationType = t("partitionForm.wing.validation.generationTypeRequired");
      }
      
      // Check if toFloor is greater than or equal to fromFloor using floor indices
      if (data.fromFloor && data.toFloor && floors.length > 0) {
        const fromFloorIndex = floors.findIndex(f => f.floorCode === data.fromFloor);
        const toFloorIndex = floors.findIndex(f => f.floorCode === data.toFloor);
        if (fromFloorIndex !== -1 && toFloorIndex !== -1 && toFloorIndex < fromFloorIndex) {
          newErrors.toFloor = t("partitionForm.wing.validation.invalidRange");
        }
      }
      
      // Validate positive numbers
      const numericFields = [
        { value: data.noOfFlatOnOneFloor, key: 'noOfFlatOnOneFloor' },
        { value: data.flatStart, key: 'flatStart' },
        { value: data.incrementedBy, key: 'incrementedBy' }
      ];
      
      numericFields.forEach(({ value, key }) => {
        if (value && parseInt(value, 10) <= 0) {
          newErrors[key as keyof PartitionFormErrors] = t("partitionForm.wing.validation.invalidValue");
        }
      });
    } else {
      // Validate partition fields
      if (!data.partitionNo?.trim()) {
        newErrors.partitionNo = t("partitionForm.validation.partitionNoRequired");
      }

      // Check for duplicate partition
      if (selectedProperty && data.partitionNo) {
        const duplicate = allProperties.find(
          (p) => 
            p.propertyNo === selectedProperty.propertyNo && 
            p.partitionNo === data.partitionNo
        );
        if (duplicate) {
          newErrors.partitionNo = t("partitionForm.validation.duplicatePartition");
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle preview building structure
  const handlePreviewBuilding = async () => {
    // Comprehensive validation with specific error messages
    const missingFields: string[] = [];
    
    if (!selectedWard?.id) {
      missingFields.push("Ward");
    }
    if (!selectedProperty?.propertyNo) {
      missingFields.push("Property");
    }
    if (!form.wingLetter?.trim()) {
      missingFields.push("Wing Letter");
    }
    if (!form.fromFloor?.trim()) {
      missingFields.push("From Floor");
    }
    if (!form.toFloor?.trim()) {
      missingFields.push("To Floor");
    }
    if (!form.noOfFlatOnOneFloor?.trim()) {
      missingFields.push("No. of Flats on One Floor");
    }
    if (!form.flatStart?.trim()) {
      missingFields.push("Flat Start");
    }
    if (!form.incrementedBy?.trim()) {
      missingFields.push("Incremented By");
    }
    if (!form.generationType?.trim()) {
      missingFields.push("Generation Type");
    }

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Validate floor selections - floors are selected from dropdown, just verify they exist
    const fromFloorData = floors.find(f => f.floorCode === form.fromFloor);
    const toFloorData = floors.find(f => f.floorCode === form.toFloor);

    if (!fromFloorData) {
      toast.error("Invalid From Floor selection. Please select a valid floor.");
      return;
    }
    if (!toFloorData) {
      toast.error("Invalid To Floor selection. Please select a valid floor.");
      return;
    }
    
    // Validate floor range using sequence numbers
    const fromFloorIndex = floors.findIndex(f => f.floorCode === form.fromFloor);
    const toFloorIndex = floors.findIndex(f => f.floorCode === form.toFloor);
    
    if (toFloorIndex < fromFloorIndex) {
      toast.error("To Floor must be greater than or equal to From Floor");
      return;
    }

    // Validate other numeric fields
    const noOfFlatOnOneFloor = parseInt(form.noOfFlatOnOneFloor, 10);
    const flatStart = parseInt(form.flatStart, 10);
    const incrementedBy = parseInt(form.incrementedBy, 10);

    if (isNaN(noOfFlatOnOneFloor) || noOfFlatOnOneFloor <= 0) {
      toast.error("No. of Flats on One Floor must be a valid positive number");
      return;
    }
    if (isNaN(flatStart) || flatStart < 0) {
      toast.error("Flat Start must be a valid non-negative number");
      return;
    }
    if (isNaN(incrementedBy) || incrementedBy <= 0) {
      toast.error("Incremented By must be a valid positive number");
      return;
    }

    // Find selected wing
    const selectedWing = wings.find(w => w.wingNo === form.wingLetter);
    if (!selectedWing) {
      toast.error("Invalid wing selection. Please select a valid wing.");
      return;
    }

    setLoadingPreview(true);
    setShowPreview(true);

    try {
      // Build payload with exact API parameter names and types
      const payload = {
        wardId: selectedWard!.id,
        propertyNo: selectedProperty!.propertyNo,
        wingId: selectedWing.id,
        fromFloor: form.fromFloor.trim(), // String as per API
        toFloor: form.toFloor.trim(), // String as per API
        noOfFlatOnOneFloor,
        flatStart,
        incrementedBy,
        prifix: form.prefix?.trim() || undefined, // API uses "Prifix" spelling, optional
        generationType: form.generationType.trim(),
      };

      console.log("[Preview] Building Structure Payload:", JSON.stringify(payload, null, 2));
      console.log("[Preview] Selected Ward:", selectedWard);
      console.log("[Preview] Selected Property:", selectedProperty);
      console.log("[Preview] Selected Wing:", selectedWing);
      console.log("[Preview] Available Wings:", wings);

      const result = await generateBuildingStructureAction(payload);
      
      console.log("[Preview] API Result:", result);
      
      if (result.success && result.data) {
        console.log("[Preview] Success - Items count:", result.data.length);
        setPreviewData(result.data);
      } else {
        console.error("[Preview] Failed:", result.error);
        toast.error(result.error || "Failed to generate preview");
        setPreviewData([]);
      }
    } catch (error) {
      console.error("[Preview] Exception:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate preview";
      toast.error(errorMessage);
      setPreviewData([]);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // If Add Wing form is open, use that logic instead
    if (showAddWingForm) {
      if (!newWingId || !newWingName) {
        toast.warning(t("partitionForm.wing.placeholders.wingLetter"));
        return;
      }
      await handleSaveWing();
      return;
    }

    if (!validate(form)) {
      toast.error(t("error.fixValidation"));
      return;
    }

    setLoading(true);
    try {
      // Handle wing partition creation
      if (form.partitionType === "wing" && form.createNewWing) {
        if (!selectedWard?.id || !selectedProperty?.propertyNo) {
          toast.error("Ward ID and Property No are required");
          setLoading(false);
          return;
        }

        // Find wingId from selected wing letter
        const selectedWing = wings.find(w => w.wingNo === form.wingLetter);
        if (!selectedWing) {
          toast.error("Invalid wing selection");
          setLoading(false);
          return;
        }

        // Validate floor selections
        const fromFloorData = floors.find(f => f.floorCode === form.fromFloor);
        const toFloorData = floors.find(f => f.floorCode === form.toFloor);
        
        if (!fromFloorData || !toFloorData) {
          toast.error("Invalid floor selection");
          setLoading(false);
          return;
        }

        // Parse and validate numeric fields
        const noOfFlatOnOneFloor = parseInt(form.noOfFlatOnOneFloor, 10);
        const flatStart = parseInt(form.flatStart, 10);
        const incrementedBy = parseInt(form.incrementedBy, 10);

        if (isNaN(noOfFlatOnOneFloor) || isNaN(flatStart) || isNaN(incrementedBy)) {
          toast.error("Invalid numeric values in form fields");
          setLoading(false);
          return;
        }

        // Build payload with exact API parameter names and types
        const payload = {
          wardId: selectedWard.id,
          propertyNo: selectedProperty.propertyNo,
          wingId: selectedWing.id,
          fromFloor: form.fromFloor.trim(), // String as per API
          toFloor: form.toFloor.trim(), // String as per API
          noOfFlatOnOneFloor,
          flatStart,
          incrementedBy,
          prifix: form.prefix?.trim() || undefined, // API uses "Prifix" spelling, optional
          generationType: form.generationType.trim(),
        };

        console.log("[Submit] Payload:", payload);

        const result = await generateBuildingStructureAction(payload);
        
        if (result.success) {
          toast.success(result.message || t("partitionMessages.createSuccess"));
          onSuccess?.();
          onClose();
        } else {
          toast.error(result.error || t("partitionMessages.createError"));
        }
      } else {
        // TODO: Handle partition/amenity creation
        toast.info("Partition/Amenity creation not yet implemented");
      }
    } catch (error) {
      console.error("Failed to create partition:", error);
      toast.error(t("partitionMessages.createError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWing = async () => {
    if (!form.mainPropertyId || !newWingId) return;
    
    // Validate wing name
    if (!newWingName?.trim()) {
      setErrors({ ...errors, wingName: t("partitionForm.wing.validation.wingNameRequired") });
      return;
    }

    setAddingWing(true);
    try {
      if (editingSocietyDetailId) {
        // Edit mode - include propertyId and wingId as required by API
        const result = await updateSocietyDetailAction(editingSocietyDetailId, {
          propertyId: form.mainPropertyId!,
          wingId: newWingId!,
          wingName: newWingName,
          isActive: true, // Maintain active status
        });
        if (result.success) {
          toast.success(t("partitionForm.wing.messages.updateWingSuccess"));
          setShowAddWingForm(false);
          setEditingSocietyDetailId(null);
          setNewWingId(null);
          setNewWingName("");
          
          // Trigger SSR refresh to refetch society details from server
          router.refresh();
        } else {
          toast.error(result.error || t("partitionForm.wing.messages.updateWingError"));
        }
      } else {
        // Add mode
        const payload: CreateSocietyDetailPayload = {
          isActive: true,
          createdBy: 1, // Will be updated by server action
          propertyId: form.mainPropertyId,
          wingId: newWingId,
          wingName: newWingName,
        };

        const result = await createSocietyDetailAction(payload);
        if (result.success) {
          toast.success(t("partitionForm.wing.messages.addWingSuccess"));
          setShowAddWingForm(false);
          setNewWingId(null);
          setNewWingName("");
          
          // Trigger SSR refresh to refetch society details from server
          router.refresh();
        } else {
          toast.error(result.error || t("partitionForm.wing.messages.addWingError"));
        }
      }
    } catch (error) {
      console.error("Error saving wing:", error);
      toast.error(t("partitionForm.wing.messages.saveWingError"));
    } finally {
      setAddingWing(false);
    }
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
      <div className="p-4 space-y-5 ">
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
        <div className="border border-gray-200 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Info className="text-blue-500 w-4 h-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wide">
              {t("partitionForm.propertyInformation")}
            </h3>
          </div>

          {/* Ward and Category Pills */}
          <div className={`grid gap-3 mb-2 ${selectedProperty ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Ward Pill */}
            <div>
              <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1.5 tracking-wide">
                {t("partitionForm.ward")}
              </label>
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${selectedWard?.id ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                {selectedWard?.id ? (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-300" />
                )}
                  <span className={`text-sm font-semibold ${selectedWard?.id ? 'text-green-700' : 'text-gray-500'}`}>
                    {selectedWard?.wardNo || t("partitionForm.noWardPlaceholder")}
                  </span>
              </div>
            </div>

            {/* Property Category Pill */}
            {selectedProperty && (
              <div>
                <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1.5 tracking-wide">
                  {t("partitionForm.propertyCategory")}
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-500">
                    <Building2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-blue-700">
                    {(() => {
                      // Try categoryMap lookup for category name
                      let categoryName: string | null = null;
                      if (selectedProperty.categoryId && categoryMap) {
                        categoryName = categoryMap.get(selectedProperty.categoryId) || null;
                      }
                      
                      return categoryName || t("partitionForm.apartment");
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Property No */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("partitionForm.mainPropertyNo")} <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.mainPropertyId ? String(form.mainPropertyId) : ""}
            onChange={handlePropertySelect}
            options={propertyOptions}
            placeholder={t("partitionForm.placeholders.selectMainProperty")}
            disabled={loading || loadingProperties}
          />
          <ValidationMessage 
            message={errors.mainPropertyId} 
            visible={!!errors.mainPropertyId}
            type="error"
          />
          <ValidationMessage
            message={t("partitionForm.helpText.selectMainProperty")}
            visible={!form.mainPropertyId && propertyOptions.length > 0}
            type="info"
          />
          <ValidationMessage
            message={t("partitionForm.helpText.noMainPropertiesFound")}
            visible={propertyOptions.length === 0}
            type="warning"
          />
        </div>
         </div>

        {/* Partition Type Tabs - Only show for Apartment categories when property is selected */}
        {form.mainPropertyId && isApartmentCategory && (
          <Tabs 
           className="items-center"
            variant="pills" 
            value={form.partitionType} 
            onChange={(val) => {
              setForm({ ...form, partitionType: val as "wing" | "partition" | "amenity" });
              setErrors({}); // Clear errors when switching tabs
              setShowWingConfig(false); // Reset wing config visibility when switching tabs
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

        {/* Wing Summary Table - Only show for Apartment categories */}
        {form.mainPropertyId && isApartmentCategory && form.partitionType === "wing" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Show Header and Table only when NOT adding/editing and NOT configuring */}
            {!showAddWingForm && !showWingConfig && (
              <>
              <div className="p-3 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-500 rounded-lg">
                      <Building2 size={16} className="text-white" />
                    </div>
                    <h3 className="text-[12px] font-bold text-gray-800">
                      {t("partitionForm.wing.table.title")}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      {wingSummaries.length} {t("partitionForm.wing.table.wingsFound")}
                    </span>
                    <AddButton
                      size="xs"
                      label={t("partitionForm.wing.addWing")}
                      onClick={() => setShowAddWingForm(!showAddWingForm)}
                    />
                  </div>
                </div>

                <MasterTable
                  columns={wingColumns as any}
                  data={wingSummaries as any}
                  emptyText={t("partitionForm.wing.table.noWingsFound")}
                  height="xs"
                  paginationConfig={{ enabled: false }}
                />
                </div>
              </>
            )}

            {showAddWingForm && (
              <div className="p-3 border border-green-200 rounded-lg bg-green-50/50 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[10px] font-bold text-green-700 uppercase tracking-wider">
                    {editingSocietyDetailId ? t("partitionForm.wing.editWing") : t("partitionForm.wing.addWing")}
                  </h4>
                  <CancelButton
                    size="xs"
                    onClick={() => {
                      setShowAddWingForm(false);
                      setEditingSocietyDetailId(null);
                      setNewWingId(null);
                      setNewWingName("");
                    }}
                    label={tCommon("buttons.cancel")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      {t("partitionForm.wing.wingNo")}
                    </label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-blue-600 font-semibold h-[38px] flex items-center">
                      {wings.find(w => w.id === newWingId)?.wingNo || newWingId || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      {t("partitionForm.wing.wingLetter")} *
                    </label>
                    <Input
                      value={newWingName}
                      onChange={(e) => {
                        setNewWingName(e.target.value);
                        setErrors({ ...errors, wingName: undefined });
                      }}
                      placeholder={t("partitionForm.wing.placeholders.wingLetter")}
                      className="bg-white"
                      disabled={addingWing}
                    />
                    <ValidationMessage
                      message={errors.wingName}
                      visible={!!errors.wingName}
                      type="error"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conditional UI based on category and partition type */}
        {form.mainPropertyId && (
          <>
            {isApartmentCategory ? (
              /* Apartment Categories: Show Wing or Amenity based on tab selection */
              form.partitionType === "wing" ? (
                /* Wing Tab Content */
                <>
                  {/* Wing Details (shown when action is clicked) */}
                  {showWingConfig && (
              <div className="p-4 border border-gray-300 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      {t("partitionForm.wing.newWingDetails")}
                    </h3>
                  </div>
                  <CancelButton
                    size="xs"
                    onClick={() => setShowWingConfig(false)}
                    label={tCommon("buttons.cancel")}
                  />
                </div>

                {/* Info Box: Required Fields */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-300 rounded-lg">
                  <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-blue-800 font-medium mb-1">{t("partitionForm.wing.requiredFieldsTitle")}</p>
                    <p className="text-xs text-blue-700">
                      {t("partitionForm.wing.requiredFieldsDesc")}
                    </p>
                  </div>
                </div>

                {/* Wing Letter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("partitionForm.wing.wingLetter")} <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={form.wingLetter}
                    disabled 
                    onChange={(_e, value) => {
                      setForm({ ...form, wingLetter: value });
                      setErrors({ ...errors, wingLetter: undefined });
                    }}
                    options={wingOptions}
                    placeholder={t("partitionForm.wing.placeholders.wingLetter")}
                    // disabled={loading || loadingWings}
                  />
                  <ValidationMessage 
                    message={errors.wingLetter} 
                    visible={!!errors.wingLetter}
                    type="error"
                  />
                </div>

                {/* Floor Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("partitionForm.wing.floorRange")}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* From Floor */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t("partitionForm.wing.fromFloor")} <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={form.fromFloor}
                        onChange={handleFromFloorChange}
                        options={fromFloorOptions}
                        placeholder={loadingFloors ? t("partitionForm.wing.placeholders.loadingFloors") : t("partitionForm.wing.placeholders.fromFloor")}
                        disabled={loading || loadingFloors}
                      />
                      <ValidationMessage 
                        message={errors.fromFloor} 
                        visible={!!errors.fromFloor}
                        type="error"
                      />
                    </div>

                    {/* To Floor */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t("partitionForm.wing.toFloor")} <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={form.toFloor}
                        onChange={handleToFloorChange}
                        options={toFloorOptions}
                        placeholder={
                          loadingFloors 
                            ? t("partitionForm.wing.placeholders.loadingFloors")
                            : !form.fromFloor 
                            ? t("partitionForm.wing.placeholders.selectFromFloorFirst")
                            : toFloorOptions.length === 0
                            ? t("partitionForm.wing.placeholders.noFloorsAvailable")
                            : t("partitionForm.wing.placeholders.toFloor")
                        }
                        disabled={loading || loadingFloors || !form.fromFloor || toFloorOptions.length === 0}
                      />
                      <ValidationMessage 
                        message={errors.toFloor} 
                        visible={!!errors.toFloor}
                        type="error"
                      />
                      {form.fromFloor && toFloorOptions.length === 0 && !loadingFloors && (
                        <ValidationMessage
                          message={t("partitionForm.wing.validation.noHigherFloors")}
                          visible={true}
                          type="warning"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* No Of Flat On One Floor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("partitionForm.wing.noOfFlatOnOneFloor")} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={form.noOfFlatOnOneFloor}
                    onChange={(e) => {
                      setForm({ ...form, noOfFlatOnOneFloor: e.target.value });
                      setErrors({ ...errors, noOfFlatOnOneFloor: undefined });
                    }}
                    placeholder={t("partitionForm.wing.placeholders.noOfFlatOnOneFloor")}
                    disabled={loading}
                    min="1"
                  />
                  <ValidationMessage 
                    message={errors.noOfFlatOnOneFloor} 
                    visible={!!errors.noOfFlatOnOneFloor}
                    type="error"
                  />
                </div>

                {/* Flat Start and Incremented By */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Flat Start */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("partitionForm.wing.flatStart")} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={form.flatStart}
                      onChange={(e) => {
                        setForm({ ...form, flatStart: e.target.value });
                        setErrors({ ...errors, flatStart: undefined });
                      }}
                      placeholder={t("partitionForm.wing.placeholders.flatStart")}
                      disabled={loading}
                      min="1"
                    />
                    <ValidationMessage 
                      message={errors.flatStart} 
                      visible={!!errors.flatStart}
                      type="error"
                    />
                  </div>

                  {/* Incremented By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("partitionForm.wing.incrementedBy")} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={form.incrementedBy}
                      onChange={(e) => {
                        setForm({ ...form, incrementedBy: e.target.value });
                        setErrors({ ...errors, incrementedBy: undefined });
                      }}
                      placeholder={t("partitionForm.wing.placeholders.incrementedBy")}
                      disabled={loading}
                      min="1"
                    />
                    <ValidationMessage 
                      message={errors.incrementedBy} 
                      visible={!!errors.incrementedBy}
                      type="error"
                    />
                  </div>
                </div>

                {/* Prefix and Generation Type */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Prefix */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("partitionForm.wing.prefix")}
                    </label>
                    <Input
                      type="text"
                      value={form.prefix}
                      onChange={(e) => {
                        setForm({ ...form, prefix: e.target.value });
                      }}
                      placeholder={t("partitionForm.wing.placeholders.prefix")}
                      disabled={loading}
                    />
                  </div>

                  {/* Generation Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("partitionForm.wing.generationType")} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.generationType}
                      onChange={(_e, value) => {
                        setForm({ ...form, generationType: value });
                        setErrors({ ...errors, generationType: undefined });
                      }}
                      options={generationTypeOptions}
                      placeholder={t("partitionForm.wing.placeholders.generationType")}
                      disabled={loading}
                    />
                    <ValidationMessage 
                      message={errors.generationType} 
                      visible={!!errors.generationType}
                      type="error"
                    />
                  </div>
                </div>

                {/* Warning Message */}
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg">
                  <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs text-red-700">
                    {t("partitionForm.wing.wingBuildingsDuplicate")}
                  </p>
                </div>

                {/* Preview Building Button */}
                <button
                  type="button"
                  onClick={handlePreviewBuilding}
                  disabled={
                    !selectedWard?.id ||
                    !selectedProperty?.propertyNo ||
                    !form.wingLetter ||
                    !form.fromFloor ||
                    !form.toFloor ||
                    !form.noOfFlatOnOneFloor ||
                    !form.flatStart ||
                    !form.incrementedBy ||
                    !form.generationType ||
                    loadingPreview
                  }
                  className="w-full flex items-center justify-center gap-2 text-sm px-2 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loadingPreview ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      {t("partitionForm.wing.preview.previewButton")}
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Amenity Tab Content for Apartment Categories */
          <>
            {/* TODO: Amenity content implementation */}
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg text-center text-gray-500">
              <p>Amenity content not yet implemented</p>
            </div>
          </>
        )
      ) : (
        /* Non-Apartment Categories: Show Partition Content */
        <>
          {/* Existing Numeric Partitions Info */}
          <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {t("partitionForm.existingNumericPartitions")}
              </span>
              <span className={`text-sm px-2 py-1 rounded ${
                hasNumericPartitions() 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-gray-200 text-gray-600"
              }`}>
                {hasNumericPartitions() 
                  ? t("partitionForm.hasNumeric")
                  : t("partitionForm.noNumeric")
                }
              </span>
            </div>
            {selectedProperty && (
              <p className="text-xs text-gray-500 mt-1">
                {t("partitionForm.selectPropertyInfo", { propertyNo: selectedProperty.propertyNo })}
              </p>
            )}
          </div>

          {/* Bulk Create Mode */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {t("partitionForm.bulkCreateMode")}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {t("partitionForm.bulkCreateModeDesc")}
                </p>
              </div>
              <ToggleSwitch
                checked={form.bulkCreateMode}
                onChange={(checked) => setForm({ ...form, bulkCreateMode: checked })}
                disabled={loading || !form.mainPropertyId}
                showPopup={false}
              />
            </div>
          </div>

          {/* Alphanumeric Partition */}
          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {t("partitionForm.alphanumericPartition")}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {t("partitionForm.alphanumericPartitionDesc")}
                </p>
              </div>
              <ToggleSwitch
                checked={form.alphanumericMode}
                onChange={(checked) => {
                  setForm({ ...form, alphanumericMode: checked });
                  if (!checked && selectedProperty) {
                    // Reset to numeric max when disabling alphanumeric
                    const maxPartition = calculateMaxPartition();
                    setForm((prev) => ({ ...prev, partitionNo: String(maxPartition) }));
                  } else if (checked) {
                    setForm((prev) => ({ ...prev, partitionNo: "" }));
                  }
                }}
                disabled={loading || !form.mainPropertyId}
                showPopup={false}
              />
            </div>
          </div>

          {/* Partition No Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("partitionForm.partitionNo")} <span className="text-red-500">*</span>
            </label>
            <Input
              type={form.alphanumericMode ? "text" : "number"}
              value={form.partitionNo}
              onChange={(e) => {
                setForm({ ...form, partitionNo: e.target.value });
                setErrors({ ...errors, partitionNo: undefined });
              }}
              placeholder={t("partitionForm.placeholders.partitionNo")}
              disabled={loading || !form.mainPropertyId}
            />
            <ValidationMessage 
              message={errors.partitionNo} 
              visible={!!errors.partitionNo}
              type="error"
            />
            <ValidationMessage
              message={t("partitionForm.helpText.partitionNoAutoGenerated", { 
                maxPartition: calculateMaxPartition() 
              })}
              visible={!!selectedProperty && !form.alphanumericMode}
              type="info"
            />
            <ValidationMessage
              message={t("partitionForm.helpText.partitionCannotDuplicate")}
              visible={!!selectedProperty}
              type="warning"
            />
          </div>
        </>
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
        // Configuration data for bulk creation
        taxZoneId={selectedProperty?.taxZoneId}
        wardId={selectedWard?.id}
        propertyTypeId={selectedProperty?.propertyTypeId ?? undefined}
        categoryId={selectedProperty?.categoryId ?? undefined}
        societyDetailId={selectedSocietyDetailId}
        // Callback on successful generation
        onGenerateSuccess={() => {
          setShowPreview(false);
          onSuccess?.();
        }}
      />
    </Drawer>
  );
}