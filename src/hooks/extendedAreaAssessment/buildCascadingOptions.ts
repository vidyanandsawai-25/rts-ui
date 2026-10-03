import type { useTranslations } from "next-intl";
import type { WardDropdownOption, ApartmentQcSearchSuggestionDto } from "@/app/[locale]/property-tax/extended-area-assesment/single-assessment/action";
import type { SelectOption } from "@/types/extended-area-assessment.types";

type Translator = ReturnType<typeof useTranslations>;

export function buildWardOptions(wards: WardDropdownOption[], isLoadingWards: boolean, t: Translator): SelectOption[] {
  return [
    { label: isLoadingWards ? t("dropdowns.loadingWards") : t("dropdowns.selectWard"), value: "" },
    ...wards.map((w) => ({
      label: w.wardNo || String(w.id),
      value: String(w.id),
    })),
  ];
}

export function buildPropertyNoOptions(
  propertyNoList: string[],
  selectedWardId: string,
  isLoadingProperties: boolean,
  t: Translator
): SelectOption[] {
  return [
    {
      label: !selectedWardId
        ? t("dropdowns.selectWardFirst")
        : isLoadingProperties
        ? t("dropdowns.loadingProperties")
        : t("dropdowns.selectPropertyNo"),
      value: "",
    },
    ...propertyNoList.map((p) => ({
      label: p,
      value: p,
    })),
  ];
}

export function buildPartitionOptions(
  partitionSuggestions: ApartmentQcSearchSuggestionDto[],
  selectedPropertyNo: string,
  isLoadingPartitions: boolean,
  t: Translator
): SelectOption[] {
  return [
    {
      label: !selectedPropertyNo
        ? t("dropdowns.selectPropertyNoFirst")
        : isLoadingPartitions
        ? t("dropdowns.loadingPartitions")
        : t("dropdowns.selectPartitionNo"),
      value: "",
    },
    ...partitionSuggestions.map((s) => {
      const val = s.partitionNo ?? s.upicId ?? String(s.propertyId);
      const label = s.partitionNo
        ? `${t("dropdowns.partitionLabel", { partitionNo: s.partitionNo })}${s.displayLabel ? ` (${s.displayLabel})` : ""}`
        : s.displayLabel || s.upicId || t("dropdowns.mainProperty");
      return { label, value: val };
    }),
  ];
}
