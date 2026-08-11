
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, Badge, MasterTable } from "@/components/common";
import { Column } from "@/components/common/MasterTable";
import { useMemo } from "react";
import { BulkUpdateMaster } from "@/types/common-details-update/common-details-update.types";

import { Modal } from "@/components/common/Modal";

import { HelpCircle } from "lucide-react";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { exportExcelAction, importExcelAction } from "@/app/[locale]/property-tax/common-details-update/actions";
import { useRef } from "react";
import { useTranslations } from "next-intl";

interface ExcelUploadProps {
  initialExcelTemplateFields?: BulkUpdateMaster[];
}

export const ExcelUpload = ({ initialExcelTemplateFields = [] }: ExcelUploadProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("commonDetailsUpdate");

  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(() => {
    const initialFieldCode = searchParams.get("field");
    if (initialFieldCode && initialExcelTemplateFields) {
      const field = initialExcelTemplateFields.find(f => f.updateCode === initialFieldCode);
      if (field) return field.updateName;
    }
    return null;
  });
  const [showTable, setShowTable] = useState(false);
  const [excelData, setExcelData] = useState<Record<string, unknown>[]>([]);
  const [isGuidelineOpen, setIsGuidelineOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dynamicColumns: Column<Record<string, unknown>>[] = useMemo(() => {
    if (!excelData || excelData.length === 0) return [];
    const keys = Object.keys(excelData[0]).filter(k => k !== 'id');
    return keys.map(k => ({
      key: k,
      label: k,
      headerClassName: "p-2 text-[12px] font-semibold text-[#1E3A8A]",
      render: (val) => <span className="text-sm">{String(val || "")}</span>
    }));
  }, [excelData]);

  const handleColumnToggle = (columnLabel: string, columnCode?: string) => {
    if (!columnCode) return; // Prevent selecting static fields like Property No.
    if (selectedFile) {
      toast.error(t("jobsAudit.excelUpload.validations.clearFileBeforeSwitch"));
      return;
    }

    const newLabel = selectedColumn === columnLabel ? null : columnLabel;
    setSelectedColumn(newLabel);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newLabel && columnCode) {
      params.set("field", columnCode);
    } else {
      params.delete("field");
    }
    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  const handleDownloadTemplate = async () => {
    const fieldCode = searchParams.get("field");
    if (!fieldCode) {
      toast.error(t("messages.pleaseSelectTemplateColumn"));
      return;
    }

    setDownloading(true);
    const toastId = toast.loading(t("messages.downloadingTemplate"));

    try {
      const wardId = searchParams.get("wardId") || "";
      const fromProperty = searchParams.get("fromProperty") || undefined;
      const toProperty = searchParams.get("toProperty") || undefined;
      
      const res = await exportExcelAction(wardId, fieldCode, fromProperty, toProperty);
      
      if (res.success && res.data) {
        // Convert base64 to blob and download
        const byteCharacters = atob(res.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fieldCode}_Template.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(t("messages.excelDownloadSuccess"), { id: toastId });
      } else {
        toast.error(('error' in res ? res.error : '') || t("excelUpload.validations.downloadFailed"), { id: toastId });
      }
    } catch (_err) {
      toast.error(t("excelUpload.validations.downloadFailed"), { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleValidateExcel = async () => {
    const fieldCode = searchParams.get("field");
    if (!fieldCode) {
      toast.warning(t("excelUpload.validations.selectFieldFirst"));
      return;
    }
    
    if (!selectedFile) {
      toast.warning(t("excelUpload.validations.chooseFileFirst"));
      return;
    }

    setUploading(true);
    const toastId = toast.loading(t("messages.excelDownloadSuccess"));

    try {
      const formData = new FormData();
      formData.append("UpdateCode", fieldCode);
      formData.append("File", selectedFile);

      const res = await importExcelAction(formData);
      
      if (res.success && res.data) {
        toast.success(t("messages.excelProcessSuccess", { count: ((res.data.successCount || 0) || 0) }), { id: toastId });
        if (((res.data.failedCount || 0) || 0) > 0) {
          toast.warning(t("excelUpload.validations.failed", { count: ((res.data.failedCount || 0) || 0) }));
        }
        
        // Clear the selected file on success
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        // Try to show the items in the preview if present
        if (((res.data.items || []) || []) && ((res.data.items || []) || []).length > 0) {
          setExcelData(((res.data.items || []) || []));
          setShowTable(true);
        } else {
          setExcelData([]);
          setShowTable(false);
        }
      } else {
        let errorMsg = ('error' in res ? res.error : '') || t("messages.uploadFailed");
        if (errorMsg.includes("no data rows")) {
          errorMsg = t("messages.noDataRows");
        }
        toast.error(errorMsg, { id: toastId });
      }
    } catch (_err) {
      toast.error(t("messages.uploadFailed"), { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const templateColumns = useMemo(() => {
    return initialExcelTemplateFields.map((field) => ({
      label: field.updateName,
      type: field.isApprovalRequired ? "Approval" : "Optional",
      code: field.updateCode,
      isActive: field.isActive
    }));
  }, [initialExcelTemplateFields]);

  return (
    <div className="flex flex-col space-y-3 h-full border border-blue-200 rounded-xl bg-white overflow-hidden">
      <div className="bg-[#F8FAFF] px-4 py-3 border-b border-blue-200 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-[#1E3A8A]">{t("excelUpload.title")}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("excelUpload.subtitle")}
          </p>
        </div>
        <Badge
          variant="success"
          icon={Upload}
          className="bg-green-50 text-green-800 border-green-200 font-bold"
        >
          {t("excelUpload.bulkUploadBadge")}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="px-2 bg-white ">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-[#1E3A8A]">{t("excelUpload.infoAlertTitle")}</span>
              <span className="text-xs text-slate-600 mt-0.5">{t("excelUpload.infoAlertDesc")}</span>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="border border-blue-200 rounded-xl bg-white m-2 overflow-hidden">
          <div className="bg-[#F8FAFF] px-4 py-3 border-b border-blue-200 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-[#1E3A8A]">{t("excelUpload.actionSectionTitle")}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t("excelUpload.actionSectionDesc")}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={HelpCircle}
              onClick={() => setIsGuidelineOpen(true)}
              className="text-slate-700 bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-colors [&>svg]:text-amber-500 font-bold"
            >
              {t("excelUpload.viewGuidelinesBtn")}
            </Button>
          </div>

          <div className="p-2 flex flex-col space-y-1 bg-white">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={handleDownloadTemplate}
                disabled={downloading}
                isLoading={downloading}
                icon={Download}
                className="bg-white border-[#0F5FC2] text-[#0F5FC2] hover:bg-blue-50 border-2 font-semibold"
              >
                {t("excelUpload.downloadTemplateBtn")}
              </Button>
              
              <div className="h-10 w-px bg-gray-200 mx-2 hidden sm:block"></div>

              <div className="flex-1 min-w-0 max-w-xl flex items-center border border-dashed border-blue-300 rounded-lg p-1.5 bg-blue-50/50">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={Upload}
                  className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 font-medium shrink-0 whitespace-nowrap mr-3"
                >
                  {t("excelUpload.chooseExcelFileBtn")}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
                <span className="text-sm font-medium text-slate-600 truncate flex-1" title={selectedFile?.name || t("excelUpload.noFileChosen")}>
                  {selectedFile ? selectedFile.name : t("excelUpload.noFileChosen")}
                </span>
              </div>

              <div className="flex-1 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleValidateExcel}
                  disabled={uploading || !selectedFile}
                  isLoading={uploading}
                  icon={CheckCircle2}
                  className="bg-[#0F5FC2] hover:bg-[#0A4796] shadow-sm font-semibold"
                >
                  {t("excelUpload.validateExcelBtn")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Template Columns */}
        <div className="flex-1 flex flex-col bg-slate-50 border border-blue-200 rounded-xl m-2 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-white">
            <h3 className="text-sm font-semibold text-[#1E3A8A]">{t("excelUpload.templateColumnsTitle")}</h3>
          </div>
          <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {templateColumns.map((col, index) => {
              const isSelected = selectedColumn === col.label;
              const isInactive = !col.isActive;
              const isLocked = !!selectedFile && !isSelected;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 border relative
                    ${isInactive 
                      ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-80 grayscale-[0.5]' 
                      : isSelected 
                        ? 'border-blue-400 bg-blue-50/30 ring-1 ring-blue-400 cursor-pointer' 
                        : isLocked
                          ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
                          : 'bg-white border-slate-200 cursor-pointer hover:border-blue-300'
                    } transition-colors duration-200`}
                  onClick={() => {
                    if (!isInactive) handleColumnToggle(col.label, col.code);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-semibold text-slate-600">{col.type}</p>
                      {isInactive && (
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase">{t("excelUpload.inactiveStatus")}</span>
                      )}
                    </div>
                    <p className={`mt-1 text-sm font-bold ${isInactive ? 'text-slate-500' : 'text-[#1E3A8A]'}`}>{col.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      
        {/* Excel Uploaded Data */}
        {showTable && excelData.length > 0 && (
          <div className="flex-1 flex flex-col bg-slate-50 border border-blue-200 rounded-xl m-2 overflow-hidden mt-4">
            <div className="bg-[#F8FAFF] px-4 py-3 border-b border-blue-200">
              <h3 className="text-sm font-semibold text-[#1E3A8A]">{t("excelUpload.previewTitle")}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t("excelUpload.previewDesc")}
              </p>
            </div>
            <div className="flex-1 p-0 overflow-auto h-96">
              <MasterTable
                columns={dynamicColumns}
                data={excelData}
                paginationConfig={{ enabled: true, showPageSizeSelector: true }}
                getRowKey={(row) => String(row.id)}
                containerClassName="h-full flex flex-col min-h-0 [&>div]:flex [&>div]:flex-col [&>div]:min-h-0 [&>div]:h-full border-0"
                maxBodyHeightClassName="flex-1 min-h-0"
                emptyText={t("excelUpload.emptyData")}
                loadingText={t("excelUpload.loadingData")}
              />
            </div>
          </div>
        )}
      </div>

      <Modal
        open={isGuidelineOpen}
        onClose={() => setIsGuidelineOpen(false)}
        title={t("excelUpload.guidelineModalTitle")}
      >
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700">
            {t("excelUpload.guidelineModalIntro")}
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            <li>
              <span className="font-semibold text-gray-800">{t("excelUpload.batchProcessingTitle")}</span> {t("excelUpload.batchProcessingDesc")}
            </li>
            <li>
              <span className="font-semibold text-gray-800">{t("excelUpload.consistencyTitle")}</span> {t("excelUpload.consistencyDesc")}
            </li>
          </ul>
          <div className="flex justify-end pt-2">
            <Button 
              variant="primary" 
              onClick={() => setIsGuidelineOpen(false)}
              className="px-6 gap-2"
              icon={CheckCircle2}
            >
              {t("excelUpload.okButton")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
