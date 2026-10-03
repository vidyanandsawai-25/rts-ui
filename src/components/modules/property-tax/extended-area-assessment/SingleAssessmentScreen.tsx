"use client";

import { useTranslations } from "next-intl";
import { useSingleAssessment } from "@/hooks/extendedAreaAssessment/useSingleAssessment";
import { useCascadingPropertyFilters } from "@/hooks/extendedAreaAssessment/useCascadingPropertyFilters";
import type {
  Section129ActionResult,
  WardDropdownOption,
  ApartmentQcSearchSuggestionDto,
} from "@/app/[locale]/property-tax/extended-area-assesment/single-assessment/action";
import type { SelectOption } from "@/types/extended-area-assessment.types";
import { SidebarForm } from "./SidebarForm";
import { KpiCards } from "./KpiCards";
import { StageTimeline } from "./StageTimeline";
import { ScheduleTableSection } from "./ScheduleTableSection";
import { Section129PdfPreviewModal } from "./components/Section129PdfPreviewModal";

interface SingleAssessmentScreenProps {
  initialUpic?: string;
  initialOldGpNo?: string;
  initialWardId?: string;
  initialPropertyNo?: string;
  initialPartitionNo?: string;
  initialSearchResult?: Section129ActionResult | null;
  /** SSR-fetched current finance year (CORE.YearMaster.IsActive=1) — a ULB-wide constant, shown before any property is searched. */
  initialCurrentFinancialYear?: string | null;
  /** SSR-fetched PTIS.TypeOfUseGroupMaster options (PageSize=-1, IsActive=true) for the Usage Type dropdown. */
  usageTypeOptions?: SelectOption[];
  /** SSR-fetched Ward options from /api/Ward. */
  initialWards?: WardDropdownOption[];
  /** SSR-fetched Property options for initial Ward. */
  initialProperties?: string[];
  /** SSR-fetched Partition options for initial Property. */
  initialPartitions?: ApartmentQcSearchSuggestionDto[];
}

export function SingleAssessmentScreen({
  initialUpic = "",
  initialOldGpNo = "",
  initialWardId = "",
  initialPropertyNo = "",
  initialPartitionNo = "",
  initialSearchResult = null,
  initialCurrentFinancialYear = null,
  usageTypeOptions = [],
  initialWards = [],
  initialProperties = [],
  initialPartitions = [],
}: SingleAssessmentScreenProps) {
  const t = useTranslations("extendedAreaAssessment.single");

  const assessment = useSingleAssessment({
    initialUpic,
    initialOldGpNo,
    initialSearchResult,
    initialCurrentFinancialYear,
  });
  const { form, result, setField, handleExportCsv, handlePrint, pdfPreviewUrl, closePdfPreview } = assessment;

  const filters = useCascadingPropertyFilters({
    t,
    initialWardId,
    initialPropertyNo,
    initialPartitionNo,
    initialWards,
    initialProperties,
    initialPartitions,
    onPartitionResolved: (upicOrPropNo) => setField("upic", upicOrPropNo),
  });

  const isTaxTotal = result.baseTaxCode === "Tax Total";

  return (
    <div className="space-y-4">

        {/* Print-only header — mirrors the property identity normally shown in the sidebar form,
            which is hidden on print (see below) so only the KPI cards, timeline, and schedule table print. */}
        <div className="hidden print:block">
          <h1 className="text-lg font-extrabold text-[#0b2545]">{t("printHeaderTitle")}</h1>
          <p className="text-xs text-slate-600">
            {form.upic} — {form.ownerName} — {form.address}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr] lg:items-start print:!grid-cols-1">
          <SidebarForm
            t={t}
            assessment={assessment}
            filters={filters}
            usageTypeOptions={usageTypeOptions}
            isTaxTotal={isTaxTotal}
          />

          {/* ================= Right: stat cards, timeline, schedule ================= */}
          <div className="flex flex-col gap-4">
            <KpiCards t={t} result={result} isTaxTotal={isTaxTotal} />
            <StageTimeline t={t} result={result} />
            <ScheduleTableSection
              t={t}
              result={result}
              isTaxTotal={isTaxTotal}
              onExportCsv={() => void handleExportCsv()}
              onPrint={() => void handlePrint()}
            />
          </div>
        </div>

      {/* Scoped to this page only (styled-jsx injects/removes this <style> with the component's
          mount lifecycle) — hides the shared app header/sidebar chrome on print without touching
          Header.tsx/SidebarFrame.tsx/MainLayout.tsx/globals.css, so no other screen's print
          behavior changes. */}
      <style jsx global>{`
        @media print {
          header[class*="z-[100]"],
          #mobile-sidebar,
          .sidebar-mobile-toggle {
            display: none !important;
          }
          main.layout-content-shifted {
            margin-left: 0 !important;
            padding-top: 0 !important;
          }
          /* MasterTable's body wraps in a fixed-height, overflow-auto scroll container (via its
             height="sm" prop) so only the currently-scrolled rows are in the print viewport —
             override it here so every row renders, letting the page itself paginate instead. */
          .schedule-print-table .overflow-auto {
            overflow: visible !important;
            max-height: none !important;
          }
        }
      `}</style>

      <Section129PdfPreviewModal
        isOpen={!!pdfPreviewUrl}
        onClose={closePdfPreview}
        fileUrl={pdfPreviewUrl ?? ""}
        fileName="Section_129A_General_Tax_Schedule.pdf"
        label={t("printHeaderTitle")}
      />
    </div>
  );
}
