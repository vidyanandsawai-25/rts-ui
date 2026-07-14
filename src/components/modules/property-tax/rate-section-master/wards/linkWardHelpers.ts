import { toast } from "sonner";
import { RateItem } from "@/types/rateSectionMaster.types";

export const getRateSectionDisplayLabel = (
  rateSectionId: string,
  rates: RateItem[]
): string => {
  const rate = rates.find(r => String(r.id) === rateSectionId);
  if (rate?.description) {
    return `${rate.id} - ${rate.description}`;
  }
  return rateSectionId;
};

export const getSelectedZoneName = (
  selectedZoneId: string | undefined,
  rates: RateItem[]
): string => {
  if (!selectedZoneId) return "";
  const rate = rates.find(r => String(r.id) === selectedZoneId);
  return rate?.description || selectedZoneId;
};

export const handleToggleAvailable = (
  wardNo: string,
  wardAssignments: Record<string, { rateSectionNo: string; id: number; description?: string }>,
  selectedZoneId: string | undefined,
  setCheckedAvailable: React.Dispatch<React.SetStateAction<Set<string>>>,
  rates: RateItem[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
) => {
  const assignment = wardAssignments[wardNo];
  if (assignment && assignment.rateSectionNo !== selectedZoneId) {
    const assignedLabel = assignment.description
      ? `${assignment.rateSectionNo} - ${assignment.description}`
      : getRateSectionDisplayLabel(assignment.rateSectionNo, rates);
    const selectedLabel = getRateSectionDisplayLabel(selectedZoneId || "", rates);
    toast.warning(
      t("wards.alreadyPresentInOtherRateSection", {
        wardNo,
        rateSectionNo: assignedLabel,
        selectedRateSectionName: selectedLabel
      })
    );
    return;
  }

  setCheckedAvailable(prev => {
    const set = new Set(prev);
    if (set.has(wardNo)) {
      set.delete(wardNo);
    } else {
      set.add(wardNo);
    }
    return set;
  });
};

export const handleToggleSelected = (
  wardNo: string,
  setCheckedSelected: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
  setCheckedSelected(prev => {
    const set = new Set(prev);
    if (set.has(wardNo)) {
      set.delete(wardNo);
    } else {
      set.add(wardNo);
    }
    return set;
  });
};
