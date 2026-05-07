import { toast } from "sonner";
import { RateItem } from "@/types/rateSectionMaster.types";

export const getRateSectionDisplayLabel = (
  rateSectionNo: string,
  rates: RateItem[]
): string => {
  const rate = rates.find(r => r.rateSectionNo === rateSectionNo);
  if (rate?.description) {
    return `${rateSectionNo} - ${rate.description}`;
  }
  return rateSectionNo;
};

export const getSelectedZoneName = (
  selectedZoneNo: string | undefined,
  rates: RateItem[]
): string => {
  if (!selectedZoneNo) return "";
  const rate = rates.find(r => r.rateSectionNo === selectedZoneNo);
  return rate?.description || selectedZoneNo;
};

export const handleToggleAvailable = (
  wardNo: string,
  wardAssignments: Record<string, { rateSectionNo: string; description?: string }>,
  selectedZoneNo: string | undefined,
  checkedAvailable: Set<string>,
  setCheckedAvailable: (set: Set<string>) => void,
  rates: RateItem[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
) => {
  const assignment = wardAssignments[wardNo];
  if (assignment && assignment.rateSectionNo !== selectedZoneNo) {
    const assignedLabel = assignment.description 
      ? `${assignment.rateSectionNo} - ${assignment.description}` 
      : getRateSectionDisplayLabel(assignment.rateSectionNo, rates);
    const selectedLabel = getRateSectionDisplayLabel(selectedZoneNo || "", rates);
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
