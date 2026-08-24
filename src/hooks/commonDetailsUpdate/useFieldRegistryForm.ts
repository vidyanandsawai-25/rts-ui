/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  BulkUpdateMaster,
  FieldRegistrySchema,
  FieldRegistryTable,
  FieldRegistryColumn,
  SourceTableField,
  CommonDetailsUpdateActions,
  BulkUpdateDefinitionPayload
} from "@/types/common-details-update/common-details-update.types";
import { addBulkUpdateDefinitionAction, updateFieldRegistryAction } from "@/app/[locale]/property-tax/common-details-update/actions";

interface FieldConfigForm {
  fieldName: string[];
  displayName: string;
  controlType: string;
  dataType: string;
  placeholder: string;
  isRequired: boolean;
  maxLength: string;
  validationRegex: string;
}

export const useFieldRegistryForm = (
  _fields: BulkUpdateMaster[],
  refreshFieldsList: () => Promise<void>,
  initialSchemas: FieldRegistrySchema[] = [],
  initialSourceTables: FieldRegistryTable[] = [],
  initialSourceTableFields: SourceTableField[] = [],
  actions?: CommonDetailsUpdateActions
) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("commonDetailsUpdate");
  const [, startTransition] = useTransition();

  const [sourceModule, setSourceModuleState] = useState(searchParams.get("sourceModule") || "");
  const [sourceTable, setSourceTableState] = useState(searchParams.get("sourceTable") || "");

  const [updateCode, setUpdateCode] = useState("");
  const [displaySequence, setDisplaySequence] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("");
  const [approvalRequired, setApprovalRequired] = useState(false);

  const [fieldConfigs, setFieldConfigs] = useState<FieldConfigForm[]>([
    {
      fieldName: [],
      displayName: "",
      controlType: "",
      dataType: "",
      placeholder: "",
      isRequired: false,
      maxLength: "",
      validationRegex: "",
    }
  ]);

  const [tables, setTables] = useState<FieldRegistryTable[]>(initialSourceTables);
  const [columns] = useState<FieldRegistryColumn[]>([]);

  const [sourceTableFields, setSourceTableFields] = useState<SourceTableField[]>(initialSourceTableFields);

  useEffect(() => {
    setSourceTableFields(initialSourceTableFields);
  }, [initialSourceTableFields]);

  useEffect(() => {
    if (actions?.getSourceTablesAction) {
      actions.getSourceTablesAction().then((res) => {
        if (res?.success && res?.data) {
          setTables(res.data as FieldRegistryTable[]);
        }
      });
    }
  }, [actions]);

  useEffect(() => {
    if (sourceTable && actions?.getSourceTableFieldsAction) {
      actions.getSourceTableFieldsAction(Number(sourceTable)).then((res) => {
        if (res?.success && res?.data) {
          setSourceTableFields(res.data as SourceTableField[]);
        }
      });
    }
  }, [sourceTable, actions]);

  const [loadingTables, _setLoadingTables] = useState(false);
  const [loadingColumns, _setLoadingColumns] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const schemas = initialSchemas;
  const loadingSchemas = false;

  const setSourceModule = (val: string) => {
    setSourceModuleState(val);
    setSourceTableState("");
    setFieldConfigs(prev => prev.map(config => ({ ...config, fieldName: [], isRequired: false })));
    
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (val) params.set("sourceModule", val); else params.delete("sourceModule");
      params.delete("sourceTable");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const setSourceTable = (val: string) => {
    if (val === sourceTable && searchParams.get("sourceTable") === val) return;
    setSourceTableState(val);
    setFieldConfigs(prev => prev.map(config => ({ ...config, fieldName: [], isRequired: false })));
    
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("sourceTable") === val) return;
      if (val) params.set("sourceTable", val); else params.delete("sourceTable");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const addFieldConfig = () => {
    setFieldConfigs([
      ...fieldConfigs,
      {
        fieldName: [],
        displayName: "",
        controlType: "",        
        dataType: "",
        placeholder: "",
        isRequired: false,
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

  const handleAddFieldToRegistry = async () => {
    if (
      !updateCode ||
      !sourceTable 
    ) {
      toast.error(t("messages.fillRequiredMasterFields"));
      return;
    }

    for (const config of fieldConfigs) {
      if (config.fieldName.length === 0) {
        toast.error(t("messages.selectAtLeastOneFieldName"));
        return;
      }
    }

    // Client-side pre-validation for duplicate Group Name
    if (_fields && _fields.length > 0 && updateCode) {
      const normInput = updateCode.trim().toLowerCase();
      const isDuplicate = _fields.some(
        (f) =>
          (f.updateName && f.updateName.trim().toLowerCase() === normInput) ||
          (f.updateCode && f.updateCode.trim().toLowerCase() === normInput)
      );
      if (isDuplicate) {
        toast.error(t("messages.groupAlreadyExists"));
        return;
      }
    }

    setSubmitting(true);
    
    // We need to map fieldName string arrays back to their numeric IDs in sourceTableFields
    const selectedFieldIds: number[] = [];
    for (const config of fieldConfigs) {
      for (const fn of config.fieldName) {
        const foundField = sourceTableFields.find(f => f.tableFieldName === fn);
        if (foundField) {
          selectedFieldIds.push(foundField.id);
        }
      }
    }

    const payload: BulkUpdateDefinitionPayload = {
      updateName: updateCode, // "updateCode" is what the user typed in "Update Name" input
      tableId: Number(sourceTable),
      tableFieldIds: selectedFieldIds,
      isApprovalRequired: approvalRequired,
    };
    
    const res = await addBulkUpdateDefinitionAction(payload);
    if (res.success) {
      toast.success(t("messages.fieldSavedSuccessfully"));
      setSourceModuleState("");
      setSourceTableState("");
      setUpdateCode("");
      setDisplaySequence("");
      setDescription("");
      setIconName("");
      setApprovalRequired(false);
      setFieldConfigs([{
        fieldName: [],
        displayName: "",
        controlType: "",
        dataType: "",
        placeholder: "",
        isRequired: false,
        maxLength: "",
        validationRegex: "",
      }]);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("sourceModule");
      params.delete("sourceTable");
      params.delete("databaseColumn");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      await refreshFieldsList();
      startTransition(() => { router.refresh(); });
    } else {
      toast.error(res.error || t("messages.saveFailed"));
    }
    setSubmitting(false);
  };

  const handleEdit = (item: BulkUpdateMaster) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "fieldRegistry");
    router.push(`/${locale}/property-tax/common-details-update/edit/${encodeURIComponent(item.updateCode)}?${params.toString()}`);
  };

  return {
    sourceModule, setSourceModule,
    sourceTable, setSourceTable,
    databaseColumn: "", setDatabaseColumn: () => { },
    updateCode, setUpdateCode,
    displaySequence, setDisplaySequence,
    description, setDescription,
    iconName, setIconName,
    approvalRequired, setApprovalRequired,
    fieldConfigs,
    addFieldConfig,
    updateFieldConfig,
    deleteFieldConfig,
    schemas, tables, columns, sourceTableFields,
    loadingSchemas, loadingTables, loadingColumns, submitting,
    handleAddFieldToRegistry,
    handleEdit,
    updateFieldRegistry: updateFieldRegistryAction,
  };
};
