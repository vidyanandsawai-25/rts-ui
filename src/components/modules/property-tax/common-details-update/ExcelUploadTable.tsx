import { MasterTable, TruncatedText } from "@/components/common";
import { DashboardCard } from "@/components/common/DashboardCard";
import { ExcelValidationResponse } from "@/types/common-details-update/common-details-update.types";
import { normalizeValidationPayload } from "@/hooks/commonDetailsUpdate/useExcelUpload";

interface ExcelUploadTableProps {
  t: (key: string) => string;
  validationData?: ExcelValidationResponse["items"] | null;
}

export const ExcelUploadTable = ({ t, validationData: rawData }: ExcelUploadTableProps) => {
  // Normalize validationData input using shared helper
  const validationData = normalizeValidationPayload(rawData);

  const rowsList = validationData?.rows || [];
  const totalRows = validationData?.totalRows ?? rowsList.length;
  const rejectedRows = validationData?.flaggedRowCount ?? rowsList.filter((r: Record<string, unknown>) =>
    Boolean(r.ValidationRemark || r.validationRemark || r.remark || r.Remark || r.isFlagged || r.status === "Failed" || r.status === "Rejected")
  ).length;
  const validRows = Math.max(0, totalRows - rejectedRows);
  const status = validationData
    ? (rejectedRows > 0 ? t("excelUpload.stats.validatedWithErrors") || "Validated (Errors)" : t("excelUpload.stats.validated") || "Validated")
    : t("excelUpload.stats.notUploaded");

  // Dynamically generate columns if validation data is present
  const columns: Array<{ label: string; key: string; render?: (value: unknown, row?: Record<string, unknown>) => React.ReactNode }> = [];
  if (validationData && (rowsList.length > 0 || (validationData.columns && validationData.columns.length > 0))) {
    const rawCols = validationData.columns && validationData.columns.length > 0
      ? validationData.columns
      : (rowsList.length > 0 ? Object.keys(rowsList[0]) : []);

    const fixedCols = ["wardNo", "propertyNo", "partitionNo", "ValidationRemark", "validationRemark", "remark", "Remark"];
    const dynamicCols = rawCols.filter((col) => !fixedCols.includes(col));

    // 1. Combined Property No Column
    columns.push({
      label: t("excelUpload.table.propertyNo") || "PropertyNo",
      key: "combinedPropertyNo",
      render: (_value: unknown, row?: Record<string, unknown>) => {
        const parts = [row?.wardNo, row?.propertyNo, row?.partitionNo].filter(Boolean);
        return <TruncatedText text={parts.join(" - ")} className="font-medium text-slate-700 block truncate" />;
      }
    });

    // 2. Dynamic Columns
    dynamicCols.forEach((col) => {
      columns.push({
        label: col,
        key: col,
        render: (value: unknown) => <TruncatedText text={value != null ? String(value) : "-"} className="text-sm text-slate-700 block truncate" />
      });
    });

    // 3. Validation Remark Column
    const hasRemarkCol = rawCols.some(c => ["ValidationRemark", "validationRemark", "remark", "Remark"].includes(c)) ||
      rowsList.some(r => Boolean(r.ValidationRemark || r.validationRemark || r.remark || r.Remark));

    if (hasRemarkCol) {
      columns.push({
        label: t("excelUpload.table.validationRemark") || "Validation Remark",
        key: "ValidationRemark",
        render: (_value: unknown, row?: Record<string, unknown>) => {
          const val = row?.ValidationRemark || row?.validationRemark || row?.remark || row?.Remark;
          if (val) {
            return <TruncatedText text={String(val)} className="text-red-500 font-medium block truncate" />;
          }
          return <span className="text-green-500 font-medium">{t("excelUpload.stats.valid") || "Valid"}</span>;
        }
      });
    }
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full rounded-lg bg-white">
      <MasterTable
        headerExtra={
          <div className="flex flex-wrap gap-2 items-center w-full">
            <DashboardCard
              label={t("excelUpload.stats.totalRows")}
              value={totalRows}
              valueColor="text-[#1E3A8A] text-sm"
              className="flex-1 min-w-[150px] !h-[46px] !py-1"
            />
            <DashboardCard
              label={t("excelUpload.stats.valid")}
              value={validRows}
              valueColor="text-green-600 text-sm"
              className="flex-1 min-w-[150px] !h-[46px] !py-1"
            />
            <DashboardCard
              label={t("excelUpload.stats.rejected")}
              value={rejectedRows}
              valueColor="text-amber-500 text-sm"
              className="flex-1 min-w-[150px] !h-[46px] !py-1"
            />
            <DashboardCard
              label={t("excelUpload.stats.status")}
              value={status}
              valueColor={validationData ? (rejectedRows > 0 ? "text-red-500 text-sm" : "text-green-600 text-sm") : "text-[#1E3A8A] text-sm"}
              className="flex-1 min-w-[150px] !h-[46px] !py-1"
            />
          </div>
        }
        data={rowsList}
        columns={columns}
        emptyText={t("excelUpload.emptyData")}
        maxBodyHeightClassName="max-h-[300px]"
      />
    </div>
  );
};
