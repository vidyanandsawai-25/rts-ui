"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  getFieldRegistrySchemasAction,
  getFieldRegistryTablesAction,
  addFieldRegistryAction,
} from "@/app/[locale]/property-tax/common-details-update/actions";
import {
  BulkUpdateMaster,
  FieldRegistrySchema,
  FieldRegistryTable,
  CreateFieldRegistryDto
} from "@/types/common-details-update/common-details-update.types";

// Define field config type for the form     
interface FieldConfigForm {
  fieldName: string;
  displayName: string;
  displayNameMarathi: string;
  controlType: string;
  dataType: string;
  placeholder: string;
  isRequired: boolean;
  maxLength: string;
  validationRegex: string;
}

export const useFieldRegistryForm = (_fields: BulkUpdateMaster[], refreshFieldsList: () => Promise<void>) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [sourceModule, setSourceModuleState] = useState(searchParams.get("sourceModule") || "");
  const [sourceTable, setSourceTableState] = useState(searchParams.get("sourceTable") || "");

  // New fields
  const [updateCode, setUpdateCode] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateNameMarathi, setUpdateNameMarathi] = useState("");
  const [referenceTableName, setReferenceTableName] = useState("");
  const [displaySequence, setDisplaySequence] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [approvalRequired, setApprovalRequired] = useState(false);

  // Field configurations array
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfigForm[]>([
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

  const [schemas, setSchemas] = useState<FieldRegistrySchema[]>([]);
  const [tables, setTables] = useState<FieldRegistryTable[]>([]);
  const [loadingSchemas, setLoadingSchemas] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Function to add a new field config
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

  // Function to update a field config
  const updateFieldConfig = (index: number, updates: Partial<FieldConfigForm>) => {
    const newFieldConfigs = [...fieldConfigs];
    newFieldConfigs[index] = { ...newFieldConfigs[index], ...updates };
    setFieldConfigs(newFieldConfigs);
  };

  // Function to delete a field config
  const deleteFieldConfig = (index: number) => {
    if (fieldConfigs.length > 1) {
      const newFieldConfigs = fieldConfigs.filter((_, i) => i !== index);
      setFieldConfigs(newFieldConfigs);
    }
  };

  const setSourceModule = (val: string) => {
    setSourceModuleState(val);
    setSourceTableState("");
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("sourceModule", val); else params.delete("sourceModule");
    params.delete("sourceTable");
    params.delete("databaseColumn");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setSourceTable = (val: string) => {
    setSourceTableState(val);
    setReferenceTableName(val || "");
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("sourceTable", val); else params.delete("sourceTable");
    params.delete("databaseColumn");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const loadSchemas = async () => {
      setLoadingSchemas(true);
      const res = await getFieldRegistrySchemasAction();
      if (res.success && res.data) setSchemas(res.data);
      setLoadingSchemas(false);
    };
    loadSchemas();
  }, []);

  useEffect(() => {
    if (!sourceModule) {
      setTables([]);
      setSourceTableState("");
      return;
    }
    const loadTables = async () => {
      setLoadingTables(true);
      const res = await getFieldRegistryTablesAction(sourceModule);
      if (res.success && res.data) setTables(res.data);
      setLoadingTables(false);
    };
    loadTables();
  }, [sourceModule]);

  const handleAddFieldToRegistry = async () => {
    // Validate master fields
    const parsedDisplaySequence = Number(displaySequence);
    if (
      !updateCode ||
      !updateName ||
      !updateNameMarathi ||
      !referenceTableName ||
      !category ||
      !displaySequence ||
      Number.isNaN(parsedDisplaySequence) ||
      parsedDisplaySequence <= 0
    ) {
      toast.error("Please fill all required master fields");
      return;
    }

    // Validate all field configs
    for (const config of fieldConfigs) {
      if (!config.fieldName || !config.displayName || !config.displayNameMarathi || !config.controlType || !config.dataType) {
        toast.error("Please fill all required fields in field configuration");
        return;
      }
    }

    setSubmitting(true);
    const payload: CreateFieldRegistryDto = {
      updateCode,
      updateName,
      updateNameMarathi,
      referenceTableName,
      displaySequence: parsedDisplaySequence,
      description: description || null,
      category: category || null,
      isApprovalRequired: approvalRequired,
      isActive: true,
      createdBy: 0,
      apiRoute: "/CommonDetails/update",
      fieldConfigs: fieldConfigs.map((config, index) => ({
        fieldName: config.fieldName,
        displayName: config.displayName,
        displayNameMarathi: config.displayNameMarathi,
        controlType: config.controlType,
        dataType: config.dataType,
        placeholder: config.placeholder || null,
        isRequired: config.isRequired,
        maxLength: config.maxLength ? Number(config.maxLength) : null,
        validationRegex: config.validationRegex || null,
        defaultValue: null,
        bindApi: null,
        sequenceNo: index + 1
      }))
    };
    const res = await addFieldRegistryAction(payload);
    if (res.success) {
      toast.success("Field saved successfully!");
      // Reset all fields
      setSourceModuleState("");
      setSourceTableState("");
      setUpdateCode("");
      setUpdateName("");
      setUpdateNameMarathi("");
      setReferenceTableName("");
      setDisplaySequence("");
      setDescription("");
      setCategory("");
      setApprovalRequired(false);
      setFieldConfigs([{
        fieldName: "",
        displayName: "",
        displayNameMarathi: "",
        controlType: "",
        dataType: "",
        placeholder: "",
        isRequired: true,
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
      toast.error(res.error || "Failed to save field");
    }
    setSubmitting(false);
  };

  return {
    sourceModule, setSourceModule,
    sourceTable, setSourceTable,
    databaseColumn: "", setDatabaseColumn: () => { },
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
    schemas, tables, columns: [],
    loadingSchemas, loadingTables, loadingColumns: false, submitting,
    selectedColumnObj: null,
    handleAddFieldToRegistry
  };
};
