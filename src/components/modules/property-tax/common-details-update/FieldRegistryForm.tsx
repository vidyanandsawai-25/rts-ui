"use client";

import { useMemo } from "react";
import { Database, Lock, Plus, MinusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  Input,
  SearchSelect,
  SaveButton,
} from "@/components/common";
import { Checkbox } from "@/components/common/checkbox";

import { useFieldRegistryState } from "@/hooks/commonDetailsUpdate/useFieldRegistryState";

interface FieldRegistryFormProps {
  t: (key: string) => string;
  state: ReturnType<typeof useFieldRegistryState>;
}

export const FieldRegistryForm = ({ t, state }: FieldRegistryFormProps) => {
  const {
    sourceModule, setSourceModule,
    sourceTable, setSourceTable,
    updateCode, setUpdateCode,
    updateName, setUpdateName,
    updateNameMarathi, setUpdateNameMarathi,
    referenceTableName, setReferenceTableName,
    displaySequence, setDisplaySequence,
    description, setDescription,
    category, setCategory,
    approvalRequired, setApprovalRequired,
    fieldConfigs,
    addFieldConfig,
    updateFieldConfig,
    deleteFieldConfig,
    schemas, tables,
    loadingSchemas, loadingTables, submitting,
    handleAddFieldToRegistry
  } = state;

  const schemaOptions = useMemo(() => schemas.map((s) => ({ label: s.schemaName, value: s.schemaName })), [schemas]);
  const tableOptions = useMemo(() => tables.map((t) => ({ label: t.tableName, value: t.tableName })), [tables]);

  // Control type options
  const controlTypeOptions = useMemo(() => [
    { label: "textbox", value: "textbox" },
    { label: "textarea", value: "textarea" },
    { label: "number", value: "number" },
    { label: "checkbox", value: "checkbox" },
    { label: "radio", value: "radio" },
    { label: "dropdown", value: "dropdown" },
    { label: "multiselect", value: "multiselect" },
    { label: "autocomplete", value: "autocomplete" },
    { label: "date", value: "date" },
    { label: "datetime", value: "datetime" },
    { label: "time", value: "time" },
    { label: "year", value: "year" },
    { label: "month", value: "month" },
  ], []);

  // Data type options
  const dataTypeOptions = useMemo(() => [
    { label: "string", value: "string" },
    { label: "number", value: "number" },
    { label: "decimal", value: "decimal" },
    { label: "boolean", value: "boolean" },
    { label: "date", value: "date" },
    { label: "datetime", value: "datetime" },
    { label: "time", value: "time" },
    { label: "email", value: "email" },
    { label: "phone", value: "phone" },
  ], []);

  // Category options
  const categoryOptions = useMemo(() => [
    { label: "All Categories", value: "All Categories" },
    { label: "Property Identity", value: "Property Identity" },
    { label: "Location", value: "Location" },
    { label: "Owner Contact", value: "Owner Contact" },
    { label: "Owner Details", value: "Owner Details" },
    { label: "Occupier Details", value: "Occupier Details" },
    { label: "Building Details", value: "Building Details" },
    { label: "Assessment", value: "Assessment" },
    { label: "Tax Details", value: "Tax Details" },
    { label: "Collection", value: "Collection" },
    { label: "Notice", value: "Notice" },
  ], []);

  const disableSave = !updateCode || !updateName || !updateNameMarathi || !referenceTableName || !category || submitting;

  return (
    <Card variant="default" padding="none" className="border border-blue-200 rounded-xl overflow-visible bg-white relative z-50">
      <div className="bg-[#F8FAFF] px-4 py-3 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1E3A8A] flex items-center gap-2">
              <Database className="w-4 h-4" />
              {t("fieldRegistry.addFieldFromDb.title")}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{t("fieldRegistry.addFieldFromDb.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap shrink-0">
              <Lock className="w-3 h-3 shrink-0" />
              <span>{t("fieldRegistry.authenticatedUserOnly")}</span>
            </div>
            <SaveButton
              type="button"
              label={t("fieldRegistry.addFieldFromDb.saveFields")}
              onClick={handleAddFieldToRegistry}
              disabled={disableSave}
            />
          </div>
        </div>
      </div>

      <CardContent className="p-4 bg-blue-50/30">
        {/* Master Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end mb-6">
          <div className="lg:col-span-1">
            <SearchSelect
              label={t("fieldRegistry.addFieldFromDb.sourceModule")}
              value={sourceModule}
              onChange={(_, val) => setSourceModule(val)}
              options={schemaOptions}
              placeholder={loadingSchemas ? "..." : t("fieldRegistry.addFieldFromDb.selectSchema")}
            />
          </div>
          <div className="lg:col-span-1">
            <SearchSelect
              label={t("fieldRegistry.addFieldFromDb.sourceTable")}
              value={sourceTable}
              onChange={(_, val) => setSourceTable(val)}
              options={tableOptions}
              placeholder={loadingTables ? "..." : t("fieldRegistry.addFieldFromDb.selectTable")}
              disabled={!sourceModule}
            />
          </div>
          <div className="lg:col-span-1">
            <Input
              label={t("fieldRegistry.addFieldFromDb.updateCode")}
              required
              type="text"
              value={updateCode}
              onChange={(e) => setUpdateCode(e.target.value)}
              placeholder="e.g., UPDATE_REMARK"
              className="w-full h-9 text-slate-900"
              disabled={submitting}
            />
          </div>
          <div className="lg:col-span-1">
            <Input
              label={t("fieldRegistry.addFieldFromDb.updateNameEnglish")}
              required
              type="text"
              value={updateName}
              onChange={(e) => setUpdateName(e.target.value)}
              placeholder="e.g., Update Remark"
              className="w-full h-9 text-slate-900"
              disabled={submitting}
            />
          </div>
          <div className="lg:col-span-1">
            <Input
              label={t("fieldRegistry.addFieldFromDb.updateNameMarathi")}
              required
              type="text"
              value={updateNameMarathi}
              onChange={(e) => setUpdateNameMarathi(e.target.value)}
              placeholder="e.g., शेरा अद्यतन"
              className="w-full h-9 text-slate-900"
              disabled={submitting}
            />
          </div>
          <div className="lg:col-span-1">
            <Input
              label={t("fieldRegistry.addFieldFromDb.referenceTableName")}
              required
              type="text"
              value={referenceTableName}
              onChange={(e) => setReferenceTableName(e.target.value)}
              placeholder="e.g., BulkUpdateMaster"
              className="w-full h-9 text-slate-900"
              disabled={submitting}
            />
          </div>
          <div className="lg:col-span-1">
            <Input
              label={t("fieldRegistry.addFieldFromDb.sequenceNo")}
              required
              type="number"
              value={displaySequence}
              onChange={(e) => setDisplaySequence(e.target.value)}
              placeholder="e.g., 9999"
              className="w-full h-9 text-slate-900"
              disabled={submitting}
            />
          </div>
          <div className="lg:col-span-1">
            <Input
              label={t("fieldRegistry.addFieldFromDb.description")}
              required
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Update property remark"
              className="w-full h-9 text-slate-900"
              disabled={submitting}
            />
          </div>
          <div className="lg:col-span-1">
            <SearchSelect
              label={t("fieldRegistry.addFieldFromDb.category")}
              required
              value={category}
              onChange={(_, val) => setCategory(val)}
              options={categoryOptions}
              placeholder={t("fieldRegistry.addFieldFromDb.selectCategory")}
            />
          </div>
        </div>

        {/* Field Configuration Fields */}
        <div className="border-t border-blue-200 pt-4">
          <h4 className="text-sm font-semibold text-[#1E3A8A] mb-3">{t("fieldRegistry.addFieldFromDb.fieldConfiguration")}</h4>

          {fieldConfigs.map((config, index) => (
            <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[120px] max-w-[200px]">
                  <Input
                    label={t("fieldRegistry.addFieldFromDb.fieldName")}
                    required
                    type="text"
                    value={config.fieldName}
                    onChange={(e) => updateFieldConfig(index, { fieldName: e.target.value })}
                    placeholder="e.g., remark"
                    className="w-full h-9 text-slate-900"
                    disabled={submitting}
                  />
                </div>
                <div className="flex-1 min-w-[120px] max-w-[200px]">
                  <Input
                    label={t("fieldRegistry.addFieldFromDb.displayName")}
                    required
                    type="text"
                    value={config.displayName}
                    onChange={(e) => updateFieldConfig(index, { displayName: e.target.value })}
                    placeholder="e.g., Remark"
                    className="w-full h-9 text-slate-900"
                    disabled={submitting}
                  />
                </div>
                <div className="flex-1 min-w-[120px] max-w-[200px]">
                  <Input
                    label={t("fieldRegistry.addFieldFromDb.displayNameMarathi")}
                    required
                    type="text"
                    value={config.displayNameMarathi}
                    onChange={(e) => updateFieldConfig(index, { displayNameMarathi: e.target.value })}
                    placeholder="e.g., शेरा"
                    className="w-full h-9 text-slate-900"
                    disabled={submitting}
                  />
                </div>
                <div className="flex-1 min-w-[140px] max-w-[220px]">
                  <SearchSelect
                    label={t("fieldRegistry.addFieldFromDb.controlType")}
                    required
                    value={config.controlType}
                    onChange={(_, val) => updateFieldConfig(index, { controlType: val })}
                    options={controlTypeOptions}
                    placeholder={t("fieldRegistry.addFieldFromDb.selectControlType")}
                  />
                </div>
                <div className="flex-1 min-w-[140px] max-w-[220px]">
                  <SearchSelect
                    label={t("fieldRegistry.addFieldFromDb.dataType")}
                    required
                    value={config.dataType}
                    onChange={(_, val) => updateFieldConfig(index, { dataType: val })}
                    options={dataTypeOptions}
                    placeholder={t("fieldRegistry.addFieldFromDb.selectDataType")}
                  />
                </div>
                <div className="flex-1 min-w-[120px] max-w-[200px]">
                  <Input
                    label={t("fieldRegistry.addFieldFromDb.placeholder")}
                    required
                    type="text"
                    value={config.placeholder}
                    onChange={(e) => updateFieldConfig(index, { placeholder: e.target.value })}
                    placeholder="Enter placeholder"
                    className="w-full h-9 text-slate-900"
                    disabled={submitting}
                  />
                </div>
                <div className="flex-1 min-w-[100px] max-w-[160px]">
                  <Input
                    label={t("fieldRegistry.addFieldFromDb.maxLength")}
                    required
                    type="number"
                    value={config.maxLength}
                    onChange={(e) => updateFieldConfig(index, { maxLength: e.target.value })}
                    placeholder="e.g., 500"
                    className="w-full h-9 text-slate-900"
                    disabled={submitting}
                  />
                </div>
                <div className="flex-1 min-w-[150px] max-w-[200px]">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-medium select-none">
                    <Checkbox
                      checked={approvalRequired}
                      onCheckedChange={(checked) => setApprovalRequired(Boolean(checked))}
                      disabled={submitting}
                    />
                    {t("fieldRegistry.addFieldFromDb.isApprovalRequired")}
                  </label>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {/* Always show remove button (when there are multiple rows) */}
                  {fieldConfigs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteFieldConfig(index)}
                      disabled={submitting}
                      className="flex items-center gap-1 px-2 py-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <MinusCircle className="w-5 h-5" />
                    </button>
                  )}
                  {/* Only last row gets add button */}
                  {index === fieldConfigs.length - 1 && (
                    <button
                      type="button"
                      onClick={() => addFieldConfig()}
                      disabled={submitting}
                      className="flex items-center gap-1 px-2 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
