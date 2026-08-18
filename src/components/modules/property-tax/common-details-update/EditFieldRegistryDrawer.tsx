/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Drawer, Input, SearchSelect, SaveButton, CancelButton, Label, MultiSelect } from "@/components/common";
import { Checkbox } from "@/components/common/checkbox";
import { Database } from "lucide-react";
import { toast } from "sonner";
import {
  FieldRegistryTable,
  SourceTableField,
  CreateFieldRegistryDto,
  BulkUpdateMaster,
  ActionResult
} from "@/types/common-details-update/common-details-update.types";

interface EditFieldRegistryDrawerProps {
  t: (key: string) => string;
  updateCode: string | undefined;
  open: boolean;
  onClose: () => void;
  refreshFieldsList: () => Promise<void>;
  initialEditData: BulkUpdateMaster | null;
  initialSourceTables?: FieldRegistryTable[];
  initialSourceTableFields?: SourceTableField[];
  updateFieldRegistry?: (code: string, payload: CreateFieldRegistryDto & { isActive?: boolean }) => Promise<ActionResult<unknown>>;
}

export function EditFieldRegistryDrawer({
  t,
  updateCode,
  open,
  onClose,
  refreshFieldsList,
  initialEditData,
  initialSourceTables,
  initialSourceTableFields,
  updateFieldRegistry
}: EditFieldRegistryDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [sourceModule, setSourceModule] = useState("");
  const [sourceTable, setSourceTable] = useState("");
  const [updateNameEnglish, setUpdateNameEnglish] = useState("");
  const [updateNameMarathi, setUpdateNameMarathi] = useState("");
  const [displaySequence, setDisplaySequence] = useState("");
  const [description, setDescription] = useState("");

  const [isActive, setIsActive] = useState(true);
  const [selectedFieldNames, setSelectedFieldNames] = useState<string[]>([]);

  // Tables and Columns for selects
  const tables = useMemo(() => initialSourceTables || [], [initialSourceTables]);
  const sourceTableFields = useMemo(() => initialSourceTableFields || [], [initialSourceTableFields]);

  const handleSourceTableChange = (val: string) => {
    if (val === sourceTable) return;
    setSourceTable(val);
    setSelectedFieldNames([]);
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("sourceid") === val || params.get("sourceTable") === val) return;
    if (val) params.set("sourceid", val); else params.delete("sourceid");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const tableOptions = useMemo(() => {
    const options = tables.map((t) => ({ label: t.tableName, value: String(t.id) }));
    if (sourceTable && !options.some(o => o.value === sourceTable)) {
      const sTable = sourceTable.toLowerCase();
      const sTableClean = sTable.replace(/[\s_]/g, '');

      const matchedTable = tables.find(t => {
        if (!t) return false;
        if (String(t.id) === String(sourceTable)) return true;

        const tName = t.tableName ? t.tableName.toLowerCase() : '';
        const tNameClean = tName.replace(/[\s_]/g, '');

        const refName = t.referenceTableName ? t.referenceTableName.toLowerCase() : '';
        const refNameClean = refName.replace(/[\s_]/g, '');
        const refLastPart = refName.split('.').pop() || '';
        const refLastPartClean = refLastPart.replace(/[\s_]/g, '');

        return (
          tName === sTable ||
          tNameClean === sTableClean ||
          refName === sTable ||
          refNameClean === sTableClean ||
          refLastPart === sTable ||
          refLastPartClean === sTableClean
        );
      });
      const displayLabel = matchedTable ? matchedTable.tableName : sourceTable;
      options.push({ label: displayLabel, value: sourceTable });
    }
    return options;
  }, [tables, sourceTable]);
  
  const columnOptions = useMemo(() => {
    const allOptions = sourceTableFields
      .map((c) => c.tableFieldName || "")
      .filter(Boolean)
      .map((name) => ({ label: name, value: name }));

    // Add any selected fields that are missing from the options
    selectedFieldNames.forEach((name) => {
      if (name && !allOptions.some((opt) => opt.value === name)) {
        allOptions.push({ label: name, value: name });
      }
    });

    const selectedOptions = allOptions.filter(opt => selectedFieldNames.includes(opt.value));
    const unselectedOptions = allOptions.filter(opt => !selectedFieldNames.includes(opt.value));
    
    return [...selectedOptions, ...unselectedOptions];
  }, [sourceTableFields, selectedFieldNames]);

  // Initialize form state from initialEditData prop
  useEffect(() => {
    if (!open || !initialEditData) return;

    const item = initialEditData;
    setUpdateNameEnglish(item.updateName || "");
    setUpdateNameMarathi(item.updateNameMarathi || "");
    setDisplaySequence(item.displaySequence != null ? String(item.displaySequence) : "");
    setDescription(item.description || "");

    setIsActive(item.isActive ?? true);

    const referenceTableName = item.targetTable || item.referenceTableName;
    // Parse referenceTableName into module + table
    if (referenceTableName) {
      const parts = referenceTableName.split(".");
      const tableName = parts.length === 2 ? parts[1] : referenceTableName;
      
      const normalizedTable = tableName.toLowerCase().replace(/[\s_]/g, '');
      const normalizedRef = referenceTableName.toLowerCase().replace(/[\s_]/g, '');

      const foundTable = tables.find((t) => {
        if (!t) return false;
        if (String(t.id) === String(tableName) || String(t.id) === String(referenceTableName)) return true;

        const tName = t.tableName ? t.tableName.toLowerCase().replace(/[\s_]/g, '') : '';
        const refName = t.referenceTableName ? t.referenceTableName.toLowerCase().replace(/[\s_]/g, '') : '';
        const refLastPart = t.referenceTableName ? (t.referenceTableName.split('.').pop() || '').toLowerCase().replace(/[\s_]/g, '') : '';

        return (
          tName === normalizedTable ||
          tName === normalizedRef ||
          refName === normalizedRef ||
          refLastPart === normalizedTable ||
          tName.includes(normalizedTable) ||
          normalizedTable.includes(tName)
        );
      });

      if (parts.length === 2) {
        setSourceModule(parts[0]);
      } else {
        setSourceModule("");
      }

      if (foundTable) {
        setSourceTable(String(foundTable.id));
      } else {
        setSourceTable(tableName); // fallback to tableName if not found
      }
    } else {
      setSourceModule("");
      setSourceTable("");
    }

    if (item.fieldConfigs && Array.isArray(item.fieldConfigs)) {
      const initialNames = item.fieldConfigs.map((fc) => fc.fieldName || "").filter(Boolean);
      const mappedNames = initialNames.map(name => {
        const exactMatch = sourceTableFields.find(c => c.tableFieldName === name);
        if (exactMatch) return name;
        const fuzzyMatch = sourceTableFields.find(c => 
          c.tableFieldName?.toLowerCase() === name.toLowerCase() || 
          c.tableFieldName?.replace(/\s+/g, "_").toUpperCase() === name
        );
        return fuzzyMatch?.tableFieldName || name;
      });
      setSelectedFieldNames(mappedNames);
    }
  }, [open, initialEditData, tables, sourceTableFields]);

  const handleUpdate = async () => {
    if (!updateCode) return;

    const parsedDisplaySequence = displaySequence ? Number(displaySequence) : 1;
    const resolvedUpdateName = updateNameEnglish || updateCode;
    const resolvedUpdateNameMarathi = updateNameMarathi || updateCode;

    if (!resolvedUpdateName || !sourceTable) {
      toast.error(t("fieldRegistry.editDrawer.fillRequiredFieldsMsg"));
      return;
    }

    if (selectedFieldNames.length === 0) {
      toast.error(t("fieldRegistry.editDrawer.selectFieldNameMsg"));
      return;
    }

    if (!updateFieldRegistry) return;
    setSubmitting(true);
    const payload: CreateFieldRegistryDto & { isActive?: boolean } = {
      updateCode,
      updateName: resolvedUpdateName,
      updateNameMarathi: resolvedUpdateNameMarathi,
      referenceTableName: sourceModule && sourceTable ? `${sourceModule}.${sourceTable}` : sourceTable,
      displaySequence: parsedDisplaySequence,
      description: description || null,
      isApprovalRequired: false,
      isActive: isActive,
      apiRoute: "/CommonDetails/update",
      fieldConfigs: selectedFieldNames.map((fn, index) => {
        const existing = initialEditData?.fieldConfigs?.find(fc => fc.fieldName === fn);
        const selectedCol = sourceTableFields.find(c => c.tableFieldName === fn);
        return {
          id: existing?.id,
          fieldName: fn,
          displayName: existing?.displayName || selectedCol?.displayName || fn,
          displayNameMarathi: existing?.displayNameMarathi || selectedCol?.displayNameMarathi || fn,
          controlType: existing?.controlType || selectedCol?.controlType || "textbox",
          dataType: existing?.dataType || selectedCol?.dataType || "string",
          placeholder: existing?.placeholder || null,
          isRequired: existing?.isRequired ?? true,
          maxLength: existing?.maxLength ?? (selectedCol?.maxLength != null ? Number(selectedCol.maxLength) : null),
          validationRegex: existing?.validationRegex || null,
          defaultValue: existing?.defaultValue || null,
          bindApi: existing?.bindApi || null,
          sequenceNo: index + 1
        };
      })
    };

    const res = await updateFieldRegistry(updateCode, payload);
    if (res.success) {
      toast.success(t("fieldRegistry.editDrawer.updateSuccessMsg"));
      await refreshFieldsList();
      onClose();
    } else {
      toast.error(res.error || t("fieldRegistry.editDrawer.updateFailedMsg"));
    }
    setSubmitting(false);
  };

  const headerTitleName = initialEditData?.updateName || updateNameEnglish || updateCode;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="md"
      title={
        <div className="flex items-center gap-2 text-[#1E3A8A] font-semibold text-sm">
          <Database className="w-4 h-4 text-blue-500" />
          <span>{t("fieldRegistry.editDrawer.title")} ({headerTitleName})</span>
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
              onChange={(_, val) => handleSourceTableChange(val)}
              options={tableOptions}
              placeholder={t("fieldRegistry.addFieldFromDb.selectTable")}
              disabled={false}
              isLoading={false}
            />
          </div>
          <div>
            <div className="block text-sm font-medium mb-1.5 text-slate-700">
              {t("fieldRegistry.addFieldFromDb.fieldName")} <span className="text-red-500 ml-0.5">*</span>
            </div>
            <MultiSelect
              id="field-name-multi"
              value={selectedFieldNames}
              onChange={setSelectedFieldNames}
              options={columnOptions}
              placeholder={selectedFieldNames.length > 0 ? selectedFieldNames.join(", ") : t("fieldRegistry.addFieldFromDb.selectFieldName")}
              selectSize="sm"
              disabled={submitting || !sourceTable}
              className="text-sm [&>button]:h-9 [&>button]:py-1.5 [&>button]:font-normal [&>button>div>span.text-gray-400]:text-slate-500 [&>button:disabled]:opacity-60 [&>div.absolute]:!max-h-65 [&>div.absolute>div[role=listbox]]:!max-h-40"
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
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                disabled={submitting}
              />
              {t("fieldRegistry.addFieldFromDb.isActive")}
            </Label>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
