"use client";

import { Settings, CheckCircle2, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SaveButton,
  CancelButton,
  Button,
  Input
} from "@/components/common";
import { BulkUpdateFieldConfig, BulkUpdateMaster, SelectOption } from "@/types/common-details-update/common-details-update.types";
import { DynamicFormField } from "./DynamicFormField";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { importExcelAction } from "@/app/[locale]/property-tax/common-details-update/actions";
import { logger } from "@/lib/utils/logger";

interface BulkUpdateFormProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  selectedMenuItem: BulkUpdateMaster | undefined;
  fieldConfigs: BulkUpdateFieldConfig[];
  loadingConfigs: boolean;
  formValues: Record<string, string | number | boolean>;
  formSubmitted: boolean;
  saving: boolean;
  selectedCount: number;
  onFieldChange: (fieldName: string, value: string | number | boolean) => void;
  onUpdate: () => void;
  onClear: () => void;
  // New props for validation status display
  showValidationStatus?: boolean;
  matchedProperties?: number;
  selectedFieldsCount?: number;
}

export const BulkUpdateForm = ({
  t,
  selectedMenuItem,
  fieldConfigs,
  loadingConfigs,
  formValues,
  formSubmitted,
  saving,
  selectedCount,
  onFieldChange,
  onUpdate,
  onClear,
  showValidationStatus = false,
  matchedProperties = 0,
  selectedFieldsCount = 0,
}: BulkUpdateFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedMenuItem?.updateCode) {
      toast.error("Please select an enabled field first");
      return;
    }

    setUploading(true);
    const loadingToastId = toast.loading("Uploading and processing Excel file...");

    try {
      const formData = new FormData();
      formData.append("File", file);
      formData.append("UpdateCode", selectedMenuItem.updateCode);

      const res = await importExcelAction(formData);
      toast.dismiss(loadingToastId);

      if (!res.success) {
        toast.error(res.error || "Upload failed");
        return;
      }

      const data = res.data;
      if (data?.success === false) {
        toast.error(data.message || "Update failed: Row error(s)");
      } else {
        toast.success(data?.message || "Excel uploaded and processed successfully!");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      logger.error("BulkUpdateForm: Excel import failed", { error: error as Error });
      toast.dismiss(loadingToastId);
      toast.error("An unexpected error occurred during import");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card
      variant="default"
      padding="none"
      className="border border-blue-200 rounded-xl shadow-sm flex flex-col h-full"
    >
      <CardHeader className="flex items-center justify-between px-4 py-3 border-b bg-[#F8FAFF] rounded-t-xl mb-0 shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-600" />
          <CardTitle className="text-sm font-semibold text-[#1E3A8A]">
            {t("newValues.title")}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {selectedMenuItem && (
            <>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden"
              />
              <Button
                variant="primary"
                size="xs"
                icon={Upload}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                isLoading={uploading}
                className="h-7 py-1 px-2.5 text-xs rounded-md"
              >
                {t("buttons.uploadExcel")}
              </Button>
            </>
          )}
          {showValidationStatus && selectedFieldsCount > 0 && (
            <span className="text-xs text-gray-500">
              {selectedFieldsCount} {t("newValues.fieldsSelected")}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 overflow-y-auto">
        {!selectedMenuItem && (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="w-10 h-10 mb-2 rounded-full bg-blue-50 flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-500">{t("form.selectMenuPrompt")}</p>
          </div>
        )}

        {selectedMenuItem && loadingConfigs && (
          <div className="flex items-center justify-center h-full py-10">
            <p className="text-sm text-gray-400 animate-pulse">{t("loading.message")}</p>
          </div>
        )}

        {selectedMenuItem && !loadingConfigs && fieldConfigs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <p className="text-sm text-gray-500">{t("form.noFields")}</p>
          </div>
        )}

        {selectedMenuItem && !loadingConfigs && fieldConfigs.length > 0 && (
          <div className="space-y-3">
            {fieldConfigs.map((config) => {
              // Force dropdown for title fields if they are missing options or misconfigured
              let overrideConfig = config;
              let options: SelectOption[] = [];

              const fieldNameLower = (config.fieldName || "").toLowerCase();
              const displayNameLower = (config.displayName || "").toLowerCase();
              const displayNameMarathiLower = (config.displayNameMarathi || "").toLowerCase();

              const isTitleField = fieldNameLower.includes("ownertitle") || fieldNameLower.includes("title") || displayNameLower.includes("title");

              const isEnglishTitle = isTitleField && (
                fieldNameLower.includes("english") ||
                displayNameLower.includes("english") ||
                displayNameMarathiLower.includes("इंग्रजी")
              );

              const isMarathiTitle = isTitleField && !isEnglishTitle;

              if (isEnglishTitle) {
                overrideConfig = { ...config, controlType: "dropdown" };
                options = [
                  { label: "Miss", value: "Miss" },
                  { label: "Mr", value: "Mr" },
                  { label: "Mrs", value: "Mrs" }
                ];
              } else if (isMarathiTitle) {
                overrideConfig = { ...config, controlType: "dropdown" };
                options = [
                  { label: "कुमारी", value: "Miss" },
                  { label: "श्री.", value: "Mr" },
                  { label: "श्रीमती", value: "Mrs" }
                ];
              }

              return (
                <DynamicFormField
                  key={overrideConfig.fieldName}
                  config={overrideConfig}
                  value={formValues[overrideConfig.fieldName] ?? ""}
                  onChange={onFieldChange}
                  submitted={formSubmitted}
                  dropdownOptions={options}
                />
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Validation Status & Actions */}
      {selectedMenuItem && !loadingConfigs && fieldConfigs.length > 0 && (
        <div className="border-t bg-[#F8FAFF] px-4 py-3 rounded-b-xl shrink-0 space-y-3">
          {/* Validation Ready Status */}
          {showValidationStatus && selectedFieldsCount > 0 && matchedProperties > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-medium">{t("newValues.validationReady")}</span>
                <p className="text-xs text-blue-600">
                  {t("newValues.validationSummary", { fields: selectedFieldsCount, properties: matchedProperties.toLocaleString() })}
                </p>
              </div>
            </div>
          )}

          {/* Legacy: Selected properties count */}
          {!showValidationStatus && selectedCount > 0 && (
            <p className="text-xs text-blue-600 font-medium">
              {selectedCount} {selectedCount === 1 ? t("preview.property") : t("preview.properties")} {t("preview.selected")}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 mt-2">
            <CancelButton
              type="button"
              label={t("form.clear")}
              onClick={onClear}
              className="px-6 min-w-[120px]"
            />
            <SaveButton
              type="button"
              label={saving ? t("form.updating") : t("form.update")}
              onClick={onUpdate}
              disabled={saving || selectedFieldsCount === 0 || selectedCount === 0}
              className="px-6 min-w-[120px]"
            />
          </div>
        </div>
      )}
    </Card>
  );
};
