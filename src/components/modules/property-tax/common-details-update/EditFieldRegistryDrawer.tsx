/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect, useMemo } from "react";
import { Drawer, Input, SearchSelect, SaveButton, CancelButton, Label, Button } from "@/components/common";
import { Checkbox } from "@/components/common/checkbox";
import { Plus, MinusCircle, Database } from "lucide-react";
import { toast } from "sonner";
import {
  FieldRegistryTable,
  FieldRegistryColumn,
  CreateFieldRegistryDto,
  BulkUpdateMaster
} from "@/types/common-details-update/common-details-update.types";

interface EditFieldRegistryDrawerProps {
  t: (key: string) => string;
  updateCode: string | undefined;
  open: boolean;
  onClose: () => void;
  refreshFieldsList: () => Promise<void>;
  initialEditData: BulkUpdateMaster | null;
  actions: {
    updateFieldRegistryAction: (
      updateCode: string,
      payload: CreateFieldRegistryDto & { isActive?: boolean }
    ) => Promise<{ success: boolean; error?: string }>;
    getFieldRegistryTablesAction: (
      sourceModule: string
    ) => Promise<{ success: boolean; data?: FieldRegistryTable[] }>;
    getFieldRegistryColumnsAction: (
      sourceModule: string,
      sourceTable: string
    ) => Promise<{ success: boolean; data?: FieldRegistryColumn[] }>;
  };
}

interface FieldConfigForm {
  id?: number;
  fieldName: string;
  displayName: string;
  displayNameMarathi: string;
  controlType: string;
  dataType: string;
  placeholder: string;
  isRequired: boolean;
  maxLength: string;
  validationRegex: string;
  defaultValue?: string | null;
  bindApi?: string | null;
}

export function EditFieldRegistryDrawer({
  t,
  updateCode,
  open,
  onClose,
  refreshFieldsList,
  initialEditData,
  actions
}: EditFieldRegistryDrawerProps) {
  const { getFieldRegistryTablesAction, getFieldRegistryColumnsAction, updateFieldRegistryAction } = actions;
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [sourceModule, setSourceModule] = useState("");
  const [sourceTable, setSourceTable] = useState("");
  const [updateNameEnglish, setUpdateNameEnglish] = useState("");
  const [updateNameMarathi, setUpdateNameMarathi] = useState("");
  const [displaySequence, setDisplaySequence] = useState("");
  const [description, setDescription] = useState("");

  const [approvalRequired, setApprovalRequired] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfigForm[]>([]);

  // Tables and Columns for selects
  const [tables, setTables] = useState<FieldRegistryTable[]>([]);
  const [columns, setColumns] = useState<FieldRegistryColumn[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);


  const tableOptions = useMemo(() => tables.map((t) => ({ label: t.tableName, value: t.tableName })), [tables]);
  const columnOptions = useMemo(
    () =>
      columns
        .map((c) => c.columnName || c.fieldName || "")
        .filter(Boolean)
        .map((name) => ({ label: name, value: name })),
    [columns]
  );





  // Initialize form state from initialEditData prop
  useEffect(() => {
    if (!open || !initialEditData) return;

    const item = initialEditData;
    setUpdateNameEnglish(item.updateName || "");
    setUpdateNameMarathi(item.updateNameMarathi || "");
    setDisplaySequence(item.displaySequence != null ? String(item.displaySequence) : "");
    setDescription(item.description || "");

    setApprovalRequired(item.isApprovalRequired || false);
    setIsActive(item.isActive ?? true);

    // Parse referenceTableName into module + table
    if (item.referenceTableName) {
      const parts = item.referenceTableName.split(".");
      if (parts.length === 2) {
        setSourceModule(parts[0]);
        setSourceTable(parts[1]);
      } else {
        setSourceModule("");
        setSourceTable(item.referenceTableName);
      }
    } else {
      setSourceModule("");
      setSourceTable("");
    }

    if (item.fieldConfigs && Array.isArray(item.fieldConfigs)) {
      setFieldConfigs(
        item.fieldConfigs.map((fc) => ({
          id: fc.id,
          fieldName: fc.fieldName || "",
          displayName: fc.displayName || "",
          displayNameMarathi: fc.displayNameMarathi || "",
          controlType: fc.controlType || "textbox",
          dataType: fc.dataType || "string",
          placeholder: fc.placeholder || "",
          isRequired: fc.isRequired ?? true,
          maxLength: fc.maxLength != null ? String(fc.maxLength) : "",
          validationRegex: fc.validationRegex || "",
          defaultValue: fc.defaultValue || null,
          bindApi: fc.bindApi || null
        }))
      );
    }
  }, [open, initialEditData]);

  // Load Tables
  useEffect(() => {
    if (!sourceModule) {
      setTables([]);
      return;
    }
    const loadTables = async () => {
      if (!getFieldRegistryTablesAction) return;
      setLoadingTables(true);
      const res = await getFieldRegistryTablesAction(sourceModule);
      if (res.success && res.data) setTables(res.data); else setTables([]);
      setLoadingTables(false);
    };
    loadTables();
  }, [sourceModule, getFieldRegistryTablesAction]);

  // Load Columns
  useEffect(() => {
    if (!sourceModule || !sourceTable) {
      setColumns([]);
      return;
    }
    const loadColumns = async () => {
      if (!getFieldRegistryColumnsAction) return;
      setLoadingColumns(true);
      const res = await getFieldRegistryColumnsAction(sourceModule, sourceTable);
      if (res.success && res.data) setColumns(res.data); else setColumns([]);
      setLoadingColumns(false);
    };
    loadColumns();
  }, [sourceModule, sourceTable, getFieldRegistryColumnsAction]);

  const addFieldConfig = () => {
    setFieldConfigs([
      ...fieldConfigs,
      {
        fieldName: "",
        displayName: "",
        displayNameMarathi: "",
        controlType: "",
        dataType: "",
        placeholder: "",
        isRequired: true,
        maxLength: "",
        validationRegex: "",
      }
    ]);
  };

  const updateFieldConfig = (index: number, updates: Partial<FieldConfigForm>) => {
    const newConfigs = [...fieldConfigs];
    newConfigs[index] = { ...newConfigs[index], ...updates };
    setFieldConfigs(newConfigs);
  };

  const deleteFieldConfig = (index: number) => {
    if (fieldConfigs.length > 1) {
      setFieldConfigs(fieldConfigs.filter((_, i) => i !== index));
    }
  };

  const handleUpdate = async () => {
    if (!updateCode) return;

    const parsedDisplaySequence = displaySequence ? Number(displaySequence) : 1;
    const resolvedUpdateName = updateNameEnglish || updateCode;
    const resolvedUpdateNameMarathi = updateNameMarathi || updateCode;

    if (!resolvedUpdateName || !sourceTable) {
      toast.error(t("fieldRegistry.editDrawer.fillRequiredFieldsMsg"));
      return;
    }

    // Validate all field configs
    for (const config of fieldConfigs) {
      if (!config.fieldName) {
        toast.error(t("fieldRegistry.editDrawer.selectFieldNameMsg"));
        return;
      }
    }

    if (!updateFieldRegistryAction) return;
    setSubmitting(true);
    const payload: CreateFieldRegistryDto & { isActive?: boolean } = {
      updateCode,
      updateName: resolvedUpdateName,
      updateNameMarathi: resolvedUpdateNameMarathi,
      referenceTableName: sourceModule && sourceTable ? `${sourceModule}.${sourceTable}` : sourceTable,
      displaySequence: parsedDisplaySequence,
      description: description || null,

      isApprovalRequired: approvalRequired,
      isActive: isActive,
      apiRoute: "/CommonDetails/update",
      fieldConfigs: fieldConfigs.map((config, index) => ({
        id: config.id,
        fieldName: config.fieldName,
        displayName: config.displayName,
        displayNameMarathi: config.displayNameMarathi,
        controlType: config.controlType,
        dataType: config.dataType,
        placeholder: config.placeholder || null,
        isRequired: config.isRequired,
        maxLength: config.maxLength ? Number(config.maxLength) : null,
        validationRegex: config.validationRegex || null,
        defaultValue: config.defaultValue || null,
        bindApi: config.bindApi || null,
        sequenceNo: index + 1
      }))
    };

    const res = await updateFieldRegistryAction(updateCode, payload);
    if (res.success) {
      toast.success(t("fieldRegistry.editDrawer.updateSuccessMsg"));
      await refreshFieldsList();
      onClose();
    } else {
      toast.error(res.error || t("fieldRegistry.editDrawer.updateFailedMsg"));
    }
    setSubmitting(false);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="md"
      title={
        <div className="flex items-center gap-2 text-[#1E3A8A] font-semibold text-sm">
          <Database className="w-4 h-4 text-blue-500" />
          <span>{t("fieldRegistry.editDrawer.title")} ({updateCode})</span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 w-full">
          <CancelButton
            onClick={onClose}
            disabled={submitting}
          />
          <SaveButton
            label={t("fieldRegistry.editDrawer.updateFieldsBtn")}
            onClick={handleUpdate}
            disabled={submitting}
          />
        </div>
      }
    >
      <div className="p-5 space-y-6">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 gap-4 bg-blue-50/20">
          <div>
            <SearchSelect
              label={t("fieldRegistry.addFieldFromDb.sourceTable")}
              value={sourceTable}
              onChange={(_, val) => setSourceTable(val)}
              options={tableOptions}
              placeholder={loadingTables ? "..." : t("fieldRegistry.addFieldFromDb.selectTable")}
              disabled={submitting}
            />
          </div>
          <div>
            <Input
              label={t("fieldRegistry.editDrawer.updateName")}
              required
              type="text"
              value={updateNameEnglish}
              onChange={(e) => setUpdateNameEnglish(e.target.value)}
              placeholder={t("fieldRegistry.editDrawer.englishNamePlaceholder")}
              className="w-full h-9 text-slate-900"
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col gap-2 pb-1.5 justify-end h-full">
            <Label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-medium select-none">
              <Checkbox
                checked={approvalRequired}
                onCheckedChange={(checked) => setApprovalRequired(Boolean(checked))}
                disabled={submitting}
              />
              {t("fieldRegistry.addFieldFromDb.isApprovalRequired")}
            </Label>
            <Label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-medium select-none">
              <Checkbox
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                disabled={submitting}
              />
              {t("fieldRegistry.addFieldFromDb.isActive")}
            </Label>
          </div>
        </div>

        {/* Dynamic Configs */}
        <div className="border-t border-slate-200 pt-2">
          <h4 className="text-sm font-semibold text-[#1E3A8A] mb-2">{t("fieldRegistry.editDrawer.fieldConfigurations")}</h4>
          {fieldConfigs.map((config, index) => (
            <div key={index} className="mb-3">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-end gap-4">
                <div className="w-[240px]">
                  <SearchSelect
                    label={t("fieldRegistry.addFieldFromDb.fieldName")}
                    required
                    value={config.fieldName}
                    onChange={(_, val) => {
                      const selectedCol = columns.find((c) => (c.columnName || c.fieldName) === val);
                      updateFieldConfig(index, { 
                        fieldName: val,
                        displayName: selectedCol?.displayName || val,
                        displayNameMarathi: selectedCol?.displayNameMarathi || val,
                        controlType: selectedCol?.controlType || "textbox",
                        dataType: selectedCol?.dataType || "string",
                        maxLength: selectedCol?.maxLength != null ? String(selectedCol.maxLength) : ""
                      });
                    }}
                    options={columnOptions}
                    isLoading={loadingColumns}
                    placeholder={
                      loadingColumns
                        ? "..."
                        : !sourceTable
                          ? t("fieldRegistry.addFieldFromDb.selectModuleAndTableFirst")
                          : columnOptions.length === 0
                            ? t("fieldRegistry.addFieldFromDb.noColumnsAvailable")
                            : t("fieldRegistry.addFieldFromDb.selectFieldName")
                    }
                    disabled={submitting || !sourceTable}
                  />
                </div>
                <div className="flex items-center gap-2 pb-0.5">
                  {fieldConfigs.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => deleteFieldConfig(index)}
                      disabled={submitting}
                      className="flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <MinusCircle className="w-5 h-5" />
                    </Button>
                  )}
                  {index === fieldConfigs.length - 1 && (
                    <Button
                      type="button"
                      onClick={() => addFieldConfig()}
                      disabled={submitting}
                      className="flex items-center justify-center p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
