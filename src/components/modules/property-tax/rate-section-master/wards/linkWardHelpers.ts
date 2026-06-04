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
  checkedAvailable: Set<string>,
  setCheckedAvailable: (set: Set<string>) => void,
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

  const set = new Set(checkedAvailable);
  if (set.has(wardNo)) {
    set.delete(wardNo);
  } else {
    set.add(wardNo);
  }
  setCheckedAvailable(set);
};

export const handleToggleSelected = (
  wardNo: string,
  checkedSelected: Set<string>,
  setCheckedSelected: (set: Set<string>) => void
) => {
  const set = new Set(checkedSelected);
  if (set.has(wardNo)) {
    set.delete(wardNo);
  } else {
    set.add(wardNo);
  }
  setCheckedSelected(set);
};
