import { useState, useRef } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CommonDetailsUpdateActions,
  ExcelValidationResponse
} from "@/types/common-details-update/common-details-update.types";
import {
  exportExcelAction,
  importExcelAction,
  validateExcelAction
} from "@/app/[locale]/property-tax/common-details-update/actions";
export function normalizeValidationPayload(raw: unknown): ExcelValidationResponse["items"] | null {
  if (!raw) return null;

  // Direct array
  if (Array.isArray(raw)) {
    const rows = raw as Record<string, unknown>[];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    const flaggedRowCount = rows.filter((r: Record<string, unknown>) =>
      Boolean(r?.ValidationRemark || r?.validationRemark || r?.remark || r?.Remark || r?.isFlagged || r?.status === "Failed" || r?.status === "Rejected" || r?.isValid === false)
    ).length;

    return {
      columns,
      rows,
      totalRows: rows.length,
      flaggedRowCount,
    };
  }

  if (typeof raw === "object" && raw !== null) {
    const root = raw as Record<string, unknown>;
    const searchTargets: Record<string, unknown>[] = [root];

    if (root.items && typeof root.items === "object" && !Array.isArray(root.items)) {
      searchTargets.push(root.items as Record<string, unknown>);
    }
    if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
      searchTargets.push(root.data as Record<string, unknown>);
    }
    if (root.result && typeof root.result === "object" && !Array.isArray(root.result)) {
      searchTargets.push(root.result as Record<string, unknown>);
    }

    let rows: Record<string, unknown>[] = [];
    const candidateKeys = [
      "rows",
      "items",
      "records",
      "data",
      "rejectedItems",
      "invalidItems",
      "rejectedRows",
      "invalidRows",
      "failedRows",
      "rejected",
      "invalid",
      "failed",
      "list",
    ];

    for (const target of searchTargets) {
      for (const key of candidateKeys) {
        if (Array.isArray(target[key]) && (target[key] as unknown[]).length > 0) {
          rows = target[key] as Record<string, unknown>[];
          break;
        }
      }
      if (rows.length > 0) break;
    }

    // Fallback if rows is empty
    if (rows.length === 0) {
      if (Array.isArray(root.rows)) rows = root.rows as Record<string, unknown>[];
      else if (Array.isArray(root.items)) rows = root.items as Record<string, unknown>[];
      else if (Array.isArray(root.records)) rows = root.records as Record<string, unknown>[];
      else if (Array.isArray(root.data)) rows = root.data as Record<string, unknown>[];
    }

    let totalRows = rows.length;
    for (const target of searchTargets) {
      const num =
        typeof target.totalRows === "number"
          ? target.totalRows
          : typeof target.totalCount === "number"
          ? target.totalCount
          : typeof target.totalRequested === "number"
          ? target.totalRequested
          : typeof target.total === "number"
          ? target.total
          : null;

      if (num !== null && num > 0) {
        totalRows = num;
        break;
      }
    }

    let flaggedRowCount = rows.filter((r: Record<string, unknown>) =>
      Boolean(
        r?.ValidationRemark ||
          r?.validationRemark ||
          r?.remark ||
          r?.Remark ||
          r?.isFlagged ||
          r?.status === "Failed" ||
          r?.status === "Rejected" ||
          r?.isValid === false
      )
    ).length;

    for (const target of searchTargets) {
      const num =
        typeof target.flaggedRowCount === "number"
          ? target.flaggedRowCount
          : typeof target.failedCount === "number"
          ? target.failedCount
          : typeof target.rejectedCount === "number"
          ? target.rejectedCount
          : typeof target.invalidCount === "number"
          ? target.invalidCount
          : null;

      if (num !== null && num >= 0) {
        flaggedRowCount = Math.max(flaggedRowCount, num);
        break;
      }
    }

    let columns: string[] = [];
    for (const target of searchTargets) {
      if (Array.isArray(target.columns) && target.columns.length > 0) {
        columns = target.columns as string[];
        break;
      }
    }
    if (columns.length === 0 && rows.length > 0) {
      columns = Object.keys(rows[0]);
    }

    if (rows.length > 0 || totalRows > 0) {
      return {
        columns,
        rows,
        totalRows: Math.max(totalRows, rows.length),
        flaggedRowCount,
      };
    }
  }

  return null;
}

interface UseExcelUploadOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateData?: any;
  actions?: Partial<CommonDetailsUpdateActions>;
}

export const useExcelUpload = (options: UseExcelUploadOptions = {}) => {
  const { updateData, actions } = options;
  const searchParams = useSearchParams();
  const t = useTranslations("commonDetailsUpdate");

  const [downloading, setDownloading] = useState(false);
  const [downloadWithData, setDownloadWithData] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isGuidelineOpen, setIsGuidelineOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Validation State
  const [validationData, setValidationData] = useState<ExcelValidationResponse["items"] | null>(null);
  const [showRemarkModal, setShowRemarkModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportExcelFn = actions?.exportExcelAction || exportExcelAction;
  const validateExcelFn = actions?.validateExcelAction || validateExcelAction;
  const importExcelFn = actions?.importExcelAction || importExcelAction;

  const handleDownloadTemplate = async () => {
    const fieldCode = searchParams.get("field");
    if (!fieldCode) {
      toast.warning(t("excelUpload.validations.selectFieldFirst"));
      return;
    }

    setDownloading(true);
    const toastId = toast.loading(t("excelUpload.validations.downloading"));

    try {
      const exportParams: { updateCode: string; [key: string]: unknown } = {
        updateCode: fieldCode,
        fieldCode,
        withData: downloadWithData,
        WithData: downloadWithData,
      };

      if (downloadWithData) {
        const wardId = searchParams.get("wardId") || updateData?.filterValues?.wardId || updateData?.selectedWard;
        const fromPropertyNo = searchParams.get("fromPropertyNo") || searchParams.get("fromProperty") || searchParams.get("PropertyNo") || updateData?.filterValues?.fromPropertyNo;
        const toPropertyNo = searchParams.get("toPropertyNo") || searchParams.get("toProperty") || updateData?.filterValues?.toPropertyNo;
        const propertyNo = searchParams.get("propertyNo") || searchParams.get("PropertyNo");
        const partitionNo = searchParams.get("partitionNo") || searchParams.get("PartitionNo");

        if (wardId) exportParams.wardId = wardId;
        if (fromPropertyNo) exportParams.fromPropertyNo = fromPropertyNo;
        if (toPropertyNo) exportParams.toPropertyNo = toPropertyNo;
        if (propertyNo) exportParams.propertyNo = propertyNo;
        if (partitionNo) exportParams.partitionNo = partitionNo;
      }

      const res = await exportExcelFn(exportParams);

      if (res.success && res.data) {
        const byteCharacters = atob(res.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fieldCode}_Template.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        if (downloadWithData && updateData && typeof updateData.handleBack === "function") {
          updateData.handleBack(false);
          setDownloadWithData(false);
        }

        toast.success(t("messages.excelDownloadSuccess"), { id: toastId });
      } else {
        toast.error(
          ("error" in res ? res.error : "") || t("excelUpload.validations.downloadFailed"),
          { id: toastId }
        );
      }
    } catch (_err) {
      toast.error(t("excelUpload.validations.downloadFailed"), { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (
        !validTypes.includes(file.type) &&
        !file.name.toLowerCase().endsWith(".xlsx") &&
        !file.name.toLowerCase().endsWith(".xls")
      ) {
        toast.error(t("messages.wrongFileType"));
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      // Clear previous validation results when selecting a new file
      setValidationData(null);
      setSelectedFile(file);
    }
  };

  const handleValidateExcel = () => {
    const fieldCode = searchParams.get("field");
    if (!fieldCode) {
      toast.warning(t("excelUpload.validations.selectFieldFirst"));
      return;
    }

    if (!selectedFile) {
      toast.warning(t("excelUpload.validations.selectFileFirst"));
      return;
    }

    setShowRemarkModal(true);
  };

  const handleConfirmUpload = async (remarks: string) => {
    const fieldCode = searchParams.get("field");
    if (!fieldCode || !selectedFile) return;

    // Clear old validation data before performing new validation/import
    setValidationData(null);
    setUploading(true);
    const toastId = toast.loading(t("excelUpload.validations.validatingExcel"));

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("File", selectedFile);
      formData.append("updateCode", fieldCode);
      formData.append("UpdateCode", fieldCode);
      formData.append("fieldCode", fieldCode);
      formData.append("FieldCode", fieldCode);
      formData.append("remarks", remarks || "");
      formData.append("Remark", remarks || "");
      formData.append("Remarks", remarks || "");

      setShowRemarkModal(false);

      // Step 1: Validate Excel
      const valRes = await validateExcelFn(formData);

      let currentValData: ExcelValidationResponse["items"] | null = null;
      if (valRes.data) {
        const normalizedVal = normalizeValidationPayload(valRes.data);
        if (normalizedVal) {
          currentValData = normalizedVal;
          setValidationData(normalizedVal);
        }
      }

      if (valRes.success) {
        const isAllRejected =
          Boolean(currentValData) &&
          (currentValData?.totalRows || 0) > 0 &&
          (currentValData?.flaggedRowCount || 0) === currentValData?.totalRows;

        if (isAllRejected) {
          toast.error(t("excelUpload.validations.dataRejectedMsg"), { id: toastId });
          return;
        }

        toast.success(t("excelUpload.validations.excelValidatedMsg"), { id: toastId });

        // Step 2: Import Excel
        const impRes = await importExcelFn(formData);
        let finalValData = currentValData;

        if (impRes.data) {
          const normalizedImp = normalizeValidationPayload(impRes.data);
          if (normalizedImp) {
            finalValData = normalizedImp;
            setValidationData((prev) => {
              const base = prev || currentValData;
              const hasNewRows = Array.isArray(normalizedImp.rows) && normalizedImp.rows.length > 0;
              const hasNewCols = Array.isArray(normalizedImp.columns) && normalizedImp.columns.length > 0;
              return {
                ...normalizedImp,
                rows: hasNewRows ? normalizedImp.rows : (base?.rows || []),
                columns: hasNewCols ? normalizedImp.columns : (base?.columns || []),
              };
            });
          }
        }

        const isImpAllRejected =
          Boolean(finalValData) &&
          (finalValData?.totalRows || 0) > 0 &&
          (finalValData?.flaggedRowCount || 0) === finalValData?.totalRows;

        if (isImpAllRejected) {
          toast.error(t("excelUpload.validations.dataRejectedMsg"));
        } else if (finalValData && (finalValData.flaggedRowCount || 0) > 0) {
          toast.warning(t("excelUpload.validations.dataRejectedMsg"));
        } else if (impRes.success) {
          toast.success(t("excelUpload.validations.bulkUpdateSuccessMsg"));
        } else {
          toast.error(("error" in impRes ? impRes.error : "") || t("excelUpload.validations.bulkUploadFailedMsg"));
        }
      } else {
        const rawErr = ("error" in valRes ? valRes.error : "") || "";
        const lower = rawErr.toLowerCase();
        let errMsg = t("excelUpload.validations.validationFailedMsg");

        if (
          lower.includes("missing required column") ||
          lower.includes("wrong update group") ||
          lower.includes("column") ||
          lower.includes("wardno") ||
          lower.includes("propertyno") ||
          lower.includes("partitionno") ||
          lower.includes("match")
        ) {
          errMsg = t("messages.wrongUpdateGroup");
        } else if (
          lower.includes("empty") ||
          lower.includes("no data") ||
          lower.includes("no rows") ||
          lower.includes("nodatarows")
        ) {
          errMsg = t("messages.noDataRows");
        } else if (
          lower.includes("file format") ||
          lower.includes("invalid file") ||
          lower.includes("wrong file") ||
          lower.includes("extension") ||
          lower.includes("format")
        ) {
          errMsg = t("messages.wrongFileType");
        }

        toast.error(errMsg, { id: toastId });
      }
    } catch (_err) {
      toast.error(t("excelUpload.validations.validationFailedMsg"), { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return {
    downloading,
    downloadWithData,
    setDownloadWithData,
    uploading,
    isGuidelineOpen,
    setIsGuidelineOpen,
    selectedFile,
    setSelectedFile,
    validationData,
    setValidationData,
    showRemarkModal,
    setShowRemarkModal,
    fileInputRef,
    handleDownloadTemplate,
    handleFileChange,
    handleValidateExcel,
    handleConfirmUpload,
  };
};
