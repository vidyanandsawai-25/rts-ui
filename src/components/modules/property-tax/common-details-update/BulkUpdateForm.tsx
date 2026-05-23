"use client";

import { Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SaveButton,
  CancelButton,
} from "@/components/common";
import { BulkUpdateFieldConfig, BulkUpdateMaster } from "@/types/common-details-update/common-details-update.types";
import { DynamicFormField } from "./DynamicFormField";

interface BulkUpdateFormProps {
  t: (key: string) => string;
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
}: BulkUpdateFormProps) => {
  return (
    <Card
      variant="default"
      padding="none"
      className="border border-blue-200 rounded-xl shadow-sm flex flex-col h-full"
    >
      <CardHeader className="flex items-center gap-2 px-4 py-3 border-b bg-[#F8FAFF] rounded-t-xl mb-0 shrink-0">
        <Settings className="w-4 h-4 text-blue-600" />
        <CardTitle className="text-sm font-semibold text-[#1E3A8A]">
          {t("form.title")}
        </CardTitle>
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
            {fieldConfigs.map((config) => (
              <DynamicFormField
                key={config.fieldName}
                config={config}
                value={formValues[config.fieldName] ?? ""}
                onChange={onFieldChange}
                submitted={formSubmitted}
              />
            ))}
          </div>
        )}
      </CardContent>

      {selectedMenuItem && !loadingConfigs && fieldConfigs.length > 0 && (
        <div className="border-t bg-[#F8FAFF] px-4 py-3 rounded-b-xl shrink-0">
          {selectedCount > 0 && (
            <p className="text-xs text-blue-600 font-medium mb-2">
              {selectedCount} {selectedCount === 1 ? t("preview.property") : t("preview.properties")} {t("preview.selected")}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">            
            <CancelButton
              type="button"
              label={t("form.clear")}
              onClick={onClear}
              className="w-full"
            />
            <SaveButton
              type="button"
              label={saving ? t("form.updating") : t("form.update")}
              onClick={onUpdate}
              disabled={saving || selectedCount === 0}
              className="w-full"
            />
          </div>
        </div>
      )}
    </Card>
  );
};
