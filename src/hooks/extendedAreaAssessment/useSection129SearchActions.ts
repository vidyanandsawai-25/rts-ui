import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { useTranslations } from "next-intl";
import type { SingleAssessmentForm, SingleAssessmentResult } from "@/types/extended-area-assessment.types";
import { emptyForm, emptyResult } from "./mapSection129Api";

export interface UseSection129SearchActionsOptions {
  form: SingleAssessmentForm;
  t: ReturnType<typeof useTranslations>;
  initialCurrentFinancialYear: string | null;
  setPropertyId: (id: number | null) => void;
  setForm: (form: SingleAssessmentForm) => void;
  setResult: (result: SingleAssessmentResult) => void;
}

/** The single-assessment screen's UPIC/Old GP Number search + Reset actions — both drive Next.js
 *  navigation (URL search params), which triggers the server-side data fetch for the new query. */
export function useSection129SearchActions({
  form,
  t,
  initialCurrentFinancialYear,
  setPropertyId,
  setForm,
  setResult,
}: UseSection129SearchActionsOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (overrideSearchQuery?: string, field: "upic" | "oldGpNo" = "upic") => {
    const targetQuery = (overrideSearchQuery ?? (field === "oldGpNo" ? form.oldGpNo : form.upic)).trim();
    if (!targetQuery) {
      toast.error(
        field === "oldGpNo"
          ? t("messages.enterOldGpNo") ?? "Enter an Old Gram Panchayat Number to search."
          : t("messages.enterUpic") ?? "Enter a UPIC Number to search."
      );
      return;
    }
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (field === "oldGpNo") {
        params.set("oldGpNo", targetQuery);
        params.delete("upic");
      } else {
        params.set("upic", targetQuery);
        params.delete("oldGpNo");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  /** Used by the shared search button next to Old GP Number: searches by whichever of the two fields has a value. */
  const handleSearchAny = () => {
    if (!form.upic.trim() && !form.oldGpNo.trim()) {
      toast.error(
        t("messages.enterUpicOrOldGpNo") ?? "Enter a UPIC Number or Old Gram Panchayat Number to search."
      );
      return;
    }
    if (form.oldGpNo.trim()) {
      handleSearch(form.oldGpNo, "oldGpNo");
    } else {
      handleSearch(form.upic, "upic");
    }
  };

  const handleReset = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("upic");
      params.delete("oldGpNo");
      params.delete("wardId");
      params.delete("propertyNo");
      params.delete("partitionNo");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
    setPropertyId(null);
    setForm(emptyForm());
    setResult(emptyResult(initialCurrentFinancialYear ?? ""));
    toast.success(t("messages.formReset"));
  };

  return { isSearching: isPending, handleSearch, handleSearchAny, handleReset };
}
