import { useMemo } from "react";
import { RateItem, SectionItem } from "@/types/rateSectionMaster.types";

interface UseWardRateSectionLabelProps {
  selectedRateSection: string | null;
  propSelectedRateSectionLabel?: string;
  rates: RateItem[];
  sections: SectionItem[];
}

export function useWardRateSectionLabel({
  selectedRateSection,
  propSelectedRateSectionLabel,
  rates,
  sections
}: UseWardRateSectionLabelProps) {
  const rateSectionLabel = useMemo(() => {
    if (!selectedRateSection) {
      return null;
    }

    if (propSelectedRateSectionLabel) {
      return propSelectedRateSectionLabel;
    }

    const rate = rates.find(r => r.rateSectionNo === selectedRateSection);

    if (rate) {
      return rate.description
        ? `${rate.rateSectionNo} - ${rate.description}`
        : (rate.rateSectionNo ?? selectedRateSection);
    } else if (sections.length > 0 && sections[0]?.rateSectionNo) {
      const firstSection = sections[0];
      return firstSection.description
        ? `${firstSection.rateSectionNo} - ${firstSection.description}`
        : (firstSection.rateSectionNo || selectedRateSection);
    } else {
      return selectedRateSection;
    }
  }, [rates, selectedRateSection, sections, propSelectedRateSectionLabel]);

  const rateSectionExists = selectedRateSection ? (
    rates.some(r => r.rateSectionNo === selectedRateSection) || 
    sections.length > 0 || 
    !!propSelectedRateSectionLabel
  ) : false;

  const effectiveSelectedRateSection = rateSectionExists ? selectedRateSection : null;

  return { rateSectionLabel, effectiveSelectedRateSection };
}
