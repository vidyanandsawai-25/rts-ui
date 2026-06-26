import { useTranslations } from "next-intl";
import type { RvCvCellProps } from "@/types/property-search.types";
import { formatNumberOnly } from "./result-styles";

export function RvCvCell({ rv, cv }: RvCvCellProps) {
  const t = useTranslations("propertySearch");
  const hasRv = typeof rv === "number" && rv > 0;
  const hasCv = typeof cv === "number" && cv > 0;

  return (
    <div className="flex flex-col gap-0.5 whitespace-nowrap text-center items-center justify-center w-full">
      <div className="text-[11px] font-semibold text-[#004c8c] flex items-center justify-center gap-1">
        <span className="opacity-85 text-[10px]">{t("results.columns.rvLabel")}</span>
        {hasRv ? (
          <span className="tabular-nums">
            {t("results.format.currency", { amount: formatNumberOnly(rv) })}
          </span>
        ) : (
          <span className="text-gray-400 font-normal">-</span>
        )}
      </div>
      <div className="text-[11px] font-semibold text-[#047857] flex items-center justify-center gap-1">
        <span className="opacity-85 text-[10px]">{t("results.columns.cvLabel")}</span>
        {hasCv ? (
          <span className="tabular-nums">
            {t("results.format.currency", { amount: formatNumberOnly(cv) })}
          </span>
        ) : (
          <span className="text-gray-400 font-normal">-</span>
        )}
      </div>
    </div>
  );
}

