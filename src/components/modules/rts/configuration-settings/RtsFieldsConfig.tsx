"use client";

import { useMemo, useState, useTransition } from "react";
import { Settings2, HelpCircle, Form, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {
  AddButton,
  Button,
  Card,
  DeleteButton,
  Drawer,
  EditButton,
  Input,
  Label,
  MasterTable,
  SearchInput,
  Select,
  StatusBadge,
  useConfirm,
} from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { toast } from "sonner";
import {
  RTS_DASHBOARD_TABLE_CLASS,
  RTS_DASHBOARD_TABLE_CONTAINER_CLASS,
  RTS_DASHBOARD_TABLE_HEAD_CLASS,
} from "@/lib/utils/rts/dashboard-table-styles";
import { useTranslations } from "next-intl";

interface RtsField {
  id: string;
  departmentId: string;
  serviceId: string;
  fieldCode: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldGroup: string;
  optionsJson: string;
  isRequired: boolean;
  displayOrder: number;
  validationRules: string;
  defaultValue: string;
  minValue: number | null;
  maxValue: number | null;
  maxLength: number | null;
  isActive: boolean;
}

interface RtsFieldsConfigProps {
  data: {
    fields: RtsField[];
    departments: { id: string; name: string }[];
    services: { id: string; name: string; departmentId: string }[];
  };
  locale: string;
  saveField: (field: {
    departmentId: string;
    serviceId: string;
    fieldCode: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: string;
    fieldGroup?: string;
    optionsJson?: string;
    isRequired?: boolean;
    displayOrder?: number;
    validationRules?: string;
    defaultValue?: string;
    minValue?: number | null;
    maxValue?: number | null;
    maxLength?: number | null;
    isActive: boolean;
  }) => Promise<{ success: boolean; field?: RtsField }>;
  updateField: (
    id: string,
    field: {
      departmentId: string;
      serviceId: string;
      fieldCode: string;
      fieldName: string;
      fieldLabel: string;
      fieldType: string;
      fieldGroup?: string;
      optionsJson?: string;
      isRequired?: boolean;
      displayOrder?: number;
      validationRules?: string;
      defaultValue?: string;
      minValue?: number | null;
      maxValue?: number | null;
      maxLength?: number | null;
      isActive: boolean;
    }
  ) => Promise<{ success: boolean; field?: RtsField }>;
  deleteField: (id: string) => Promise<{ success: boolean }>;
}

type FieldTableRow = Record<string, unknown> & RtsField;

type FieldFormValues = {
  departmentId: string;
  serviceId: string;
  fieldCode: string;
  fieldLabel: string;
  fieldType: string;
  fieldGroup: string;
  optionsJson: string;
  isRequired: boolean;
  displayOrder: string;
  validationRules: string;
  defaultValue: string;
  minValue: string;
  maxValue: string;
  maxLength: string;
  isActive: boolean;
};

type FieldOptionItem = {
  value: string;
};

function parseOptionsJson(optionsJson: string): FieldOptionItem[] {
  if (!optionsJson.trim()) return [{ value: "" }];

  try {
    const parsed = JSON.parse(optionsJson);
    if (!Array.isArray(parsed)) return [{ value: "" }];

    const normalized = parsed
      .filter((item): item is { value?: unknown } => typeof item === "object" && item !== null)
      .map((item) => ({
        value: typeof item.value === "string" ? item.value : "",
      }));

    return normalized.length > 0 ? normalized : [{ value: "" }];
  } catch {
    return [{ value: "" }];
  }
}

function stringifyOptions(options: FieldOptionItem[]): string {
  const normalized = options
    .map((option, index) => ({
      label: String(index + 1),
      value: option.value.trim(),
    }))
    .filter((option) => option.value);

  return normalized.length > 0 ? JSON.stringify(normalized) : "";
}

function createEmptyFieldFormValues(defaults?: Partial<FieldFormValues>): FieldFormValues {
  return {
    departmentId: defaults?.departmentId ?? "",
    serviceId: defaults?.serviceId ?? "",
    fieldCode: defaults?.fieldCode ?? "",
    fieldLabel: defaults?.fieldLabel ?? "",
    fieldType: defaults?.fieldType ?? "text",
    fieldGroup: defaults?.fieldGroup ?? "",
    optionsJson: defaults?.optionsJson ?? "",
    isRequired: defaults?.isRequired ?? false,
    displayOrder: defaults?.displayOrder ?? "1",
    validationRules: defaults?.validationRules ?? "",
    defaultValue: defaults?.defaultValue ?? "",
    minValue: defaults?.minValue ?? "",
    maxValue: defaults?.maxValue ?? "",
    maxLength: defaults?.maxLength ?? "",
    isActive: defaults?.isActive ?? true,
  };
}

export default function RtsFieldsConfig({
  data,
  saveField,
  updateField,
  deleteField,
}: RtsFieldsConfigProps) {
  const t = useTranslations("rts");
  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();

  const [fieldsList, setFieldsList] = useState<RtsField[]>(data.fields);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("All");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageNumber, setPageNumber] = useState(1);

  const filteredServicesForFilter = data.services.filter(
    s => selectedDeptId === "All" || s.departmentId === selectedDeptId
  );

  const filteredFields = fieldsList.filter(f => {
    const deptMatch = selectedDeptId === "All" || f.departmentId === selectedDeptId;
    const serviceMatch = selectedServiceId === "All" || f.serviceId === selectedServiceId;

    const q = searchTerm.toLocaleLowerCase().trim();
    const textMatch =
      !q ||
      f.fieldCode.toLocaleLowerCase().includes(q) ||
      f.fieldLabel.toLocaleLowerCase().includes(q) ||
      f.fieldGroup.toLocaleLowerCase().includes(q);

    return deptMatch && serviceMatch && textMatch;
  });

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filteredFields.length / pageSize));
  const paginatedFields = filteredFields.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const fieldRows: FieldTableRow[] = paginatedFields.map((field) => ({ ...field }));

  const isAllSelected = filteredFields.length > 0 && filteredFields.every(f => selectedIds.includes(f.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = filteredFields.map(f => f.id);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredFields.map(f => f.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    confirm({
      variant: "delete",
      title: t("fields.bulkDeleteTitle"),
      description: t("fields.bulkDeleteConfirm", {
        count: selectedIds.length,
      }),
      onConfirm: async () => {
        startTransition(async () => {
          try {
            await Promise.all(selectedIds.map(id => deleteField(id)));
            setFieldsList(prev => prev.filter(f => !selectedIds.includes(f.id)));
            toast.success(
              t("fields.bulkDeleteSuccess", { count: selectedIds.length })
            );
            setSelectedIds([]);
          } catch (_err) {
            toast.error(t("fields.bulkDeleteFailed"));
          }
        });
      }
    });
  };

  const handleBulkSetRequired = (required: boolean) => {
    confirm({
      variant: "update",
      title: t("fields.updateSelected"),
      description: t("fields.bulkUpdateConfirm", {
        count: selectedIds.length,
        status: required ? t("fields.required") : t("fields.optional"),
      }),
      onConfirm: async () => {
        startTransition(async () => {
          try {
            const updated = await Promise.all(
              selectedIds.map(async id => {
                const field = fieldsList.find(f => f.id === id);
                if (!field) return null;
                const payload = {
                  departmentId: field.departmentId,
                  serviceId: field.serviceId,
                  fieldCode: field.fieldCode,
                  fieldName: field.fieldName,
                  fieldLabel: field.fieldLabel,
                  fieldType: field.fieldType,
                  fieldGroup: field.fieldGroup,
                  isActive: field.isActive,
                  isRequired: required,
                  displayOrder: field.displayOrder,
                  optionsJson: field.optionsJson,
                  defaultValue: field.defaultValue,
                  minValue: field.minValue,
                  maxValue: field.maxValue,
                  maxLength: field.maxLength,
                  validationRules: field.validationRules
                };
                const res = await updateField(id, payload);
                return res.success ? (res.field as RtsField) : null;
              })
            );

            setFieldsList(prev =>
              prev.map(f => {
                const matched = updated.find(u => u && u.id === f.id);
                return matched ? matched : f;
              })
            );

            toast.success(
              t("fields.bulkUpdateSuccess", {
                count: selectedIds.length,
                status: required ? t("fields.required") : t("fields.optional"),
              })
            );
            setSelectedIds([]);
          } catch (_err) {
            toast.error(t("fields.bulkUpdateFailed"));
          }
        });
      }
    });
  };

  // Drawer form states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingField, setEditingField] = useState<RtsField | null>(null);
  const [editForm, setEditForm] = useState<FieldFormValues>(createEmptyFieldFormValues());
  const [editOptions, setEditOptions] = useState<FieldOptionItem[]>([{ value: "" }]);
  const [draftFields, setDraftFields] = useState<FieldFormValues[]>([
    createEmptyFieldFormValues(),
  ]);
  const [draftOptions, setDraftOptions] = useState<FieldOptionItem[][]>([
    [{ value: "" }],
  ]);

  const filteredServicesForEditForm = data.services.filter(
    s => !editForm.departmentId || s.departmentId === editForm.departmentId
  );

  const resetForm = () => {
    setEditingField(null);
    setEditForm(createEmptyFieldFormValues());
    setEditOptions([{ value: "" }]);
    setDraftFields([
      createEmptyFieldFormValues({
        departmentId: selectedDeptId !== "All" ? selectedDeptId : "",
        serviceId: selectedServiceId !== "All" ? selectedServiceId : "",
      }),
    ]);
    setDraftOptions([[{ value: "" }]]);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleStartEdit = (field: RtsField) => {
    setEditingField(field);
    setEditForm(
      createEmptyFieldFormValues({
        departmentId: field.departmentId,
        serviceId: field.serviceId,
        fieldCode: field.fieldCode,
        fieldLabel: field.fieldLabel,
        fieldType: field.fieldType,
        fieldGroup: field.fieldGroup,
        optionsJson: field.optionsJson || "",
        isRequired: field.isRequired,
        displayOrder: String(field.displayOrder),
        validationRules: field.validationRules || "",
        defaultValue: field.defaultValue || "",
        minValue: field.minValue !== null ? String(field.minValue) : "",
        maxValue: field.maxValue !== null ? String(field.maxValue) : "",
        maxLength: field.maxLength !== null ? String(field.maxLength) : "",
        isActive: field.isActive,
      })
    );
    setEditOptions(parseOptionsJson(field.optionsJson || ""));
    setIsDrawerOpen(true);
  };

  const updateDraftField = (index: number, updates: Partial<FieldFormValues>) => {
    setDraftFields(previous =>
      previous.map((field, fieldIndex) => {
        if (fieldIndex !== index) return field;

        const nextField = { ...field, ...updates };
        if (updates.departmentId !== undefined) {
          nextField.serviceId = "";
        }
        return nextField;
      })
    );
  };

  const addDraftFieldCard = () => {
    setDraftFields(previous => [
      ...previous,
      createEmptyFieldFormValues({
        departmentId: previous[previous.length - 1]?.departmentId || (selectedDeptId !== "All" ? selectedDeptId : ""),
      }),
    ]);
    setDraftOptions(previous => [...previous, [{ value: "" }]]);
  };

  const handleRemoveDraftFieldCard = (index: number) => {
    confirm({
      variant: "delete",
      title: "Remove field card?",
      description: `Field Card #${index + 1} will be removed from this bulk draft.`,
      onConfirm: () => {
        removeDraftFieldCard(index);
      }
    });
  };

  const removeDraftFieldCard = (index: number) => {
    setDraftFields(previous => {
      if (previous.length === 1) {
        return [createEmptyFieldFormValues({
          departmentId: selectedDeptId !== "All" ? selectedDeptId : "",
          serviceId: selectedServiceId !== "All" ? selectedServiceId : "",
        })];
      }

      return previous.filter((_, fieldIndex) => fieldIndex !== index);
    });
    setDraftOptions(previous => {
      if (previous.length === 1) return [[{ value: "" }]];
      return previous.filter((_, fieldIndex) => fieldIndex !== index);
    });
  };

  const buildPayloadFromForm = (form: FieldFormValues, options: FieldOptionItem[]) => ({
    departmentId: form.departmentId,
    serviceId: form.serviceId,
    fieldCode: form.fieldCode.trim(),
    fieldName: form.fieldCode.trim(),
    fieldLabel: form.fieldLabel.trim(),
    fieldType: form.fieldType,
    fieldGroup: form.fieldGroup.trim(),
    isActive: form.isActive,
    isRequired: form.isRequired,
    displayOrder: parseInt(form.displayOrder, 10) || 1,
    optionsJson: stringifyOptions(options),
    defaultValue: form.defaultValue,
    minValue: form.minValue !== "" ? parseInt(form.minValue, 10) : null,
    maxValue: form.maxValue !== "" ? parseInt(form.maxValue, 10) : null,
    maxLength: form.maxLength !== "" ? parseInt(form.maxLength, 10) : null,
    validationRules: form.validationRules,
  });

  const validateFieldForm = (form: FieldFormValues) => {
    if (!form.departmentId || !form.serviceId || !form.fieldCode.trim() || !form.fieldLabel.trim() || !form.fieldType) {
      return false;
    }

    if ((form.fieldType === "select" || form.fieldType === "checkbox") && !form.optionsJson.trim()) {
      return false;
    }

    return true;
  };

  const syncEditOptionsJson = (options: FieldOptionItem[]) => {
    setEditOptions(options);
    setEditForm(previous => ({ ...previous, optionsJson: stringifyOptions(options) }));
  };

  const syncDraftOptionsJson = (fieldIndex: number, options: FieldOptionItem[]) => {
    setDraftOptions(previous => previous.map((item, index) => (index === fieldIndex ? options : item)));
    updateDraftField(fieldIndex, { optionsJson: stringifyOptions(options) });
  };

  const addOptionRow = (fieldIndex?: number) => {
    if (fieldIndex === undefined) {
      syncEditOptionsJson([...editOptions, { value: "" }]);
      return;
    }

    const next = [...(draftOptions[fieldIndex] ?? [{ value: "" }]), { value: "" }];
    syncDraftOptionsJson(fieldIndex, next);
  };

  const updateOptionRow = (
    optionIndex: number,
    key: keyof FieldOptionItem,
    value: string,
    fieldIndex?: number
  ) => {
    if (fieldIndex === undefined) {
      const next = editOptions.map((option, index) =>
        index === optionIndex ? { ...option, [key]: value } : option
      );
      syncEditOptionsJson(next);
      return;
    }

    const current = draftOptions[fieldIndex] ?? [{ value: "" }];
    const next = current.map((option, index) =>
      index === optionIndex ? { ...option, [key]: value } : option
    );
    syncDraftOptionsJson(fieldIndex, next);
  };

  const removeOptionRow = (optionIndex: number, fieldIndex?: number) => {
    if (fieldIndex === undefined) {
      const next = editOptions.length === 1
        ? [{ value: "" }]
        : editOptions.filter((_, index) => index !== optionIndex);
      syncEditOptionsJson(next);
      return;
    }

    const current = draftOptions[fieldIndex] ?? [{ value: "" }];
    const next = current.length === 1
      ? [{ value: "" }]
      : current.filter((_, index) => index !== optionIndex);
    syncDraftOptionsJson(fieldIndex, next);
  };

  const moveOptionRow = (optionIndex: number, direction: "up" | "down", fieldIndex?: number) => {
    const move = (options: FieldOptionItem[]) => {
      const targetIndex = direction === "up" ? optionIndex - 1 : optionIndex + 1;
      if (targetIndex < 0 || targetIndex >= options.length) return options;

      const next = [...options];
      const current = next[optionIndex];
      next[optionIndex] = next[targetIndex];
      next[targetIndex] = current;
      return next;
    };

    if (fieldIndex === undefined) {
      syncEditOptionsJson(move(editOptions));
      return;
    }

    syncDraftOptionsJson(fieldIndex, move(draftOptions[fieldIndex] ?? [{ value: "" }]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (editingField) {
          if (!validateFieldForm(editForm)) {
            toast.error(t("fields.fillMandatoryFields"));
            return;
          }

          const res = await updateField(editingField.id, buildPayloadFromForm(editForm, editOptions));
          if (res.success && res.field) {
            setFieldsList(prev =>
              prev.map(f =>
                f.id === editingField.id ? (res.field as RtsField) : f
              )
            );
            toast.success(t("fields.fieldUpdated"));
            setIsDrawerOpen(false);
          } else {
            toast.error(t("fields.fieldSaveFailed"));
          }
        } else {
          const validDraftFields = draftFields.filter(field =>
            field.departmentId ||
            field.serviceId ||
            field.fieldCode.trim() ||
            field.fieldLabel.trim()
          );

          if (validDraftFields.length === 0 || validDraftFields.some(field => !validateFieldForm(field))) {
            toast.error(t("fields.fillMandatoryFields"));
            return;
          }

          const createdFields = await Promise.all(
            validDraftFields.map((field, index) => saveField(buildPayloadFromForm(field, draftOptions[index] ?? [{ value: "" }])))
          );

          const savedFields = createdFields
            .filter(result => result.success && result.field)
            .map(result => result.field as RtsField);

          if (savedFields.length === validDraftFields.length) {
            setFieldsList(prev => [...prev, ...savedFields]);
            toast.success(
              savedFields.length === 1
                ? t("fields.fieldCreated")
                : `${savedFields.length} fields created`
            );
            setIsDrawerOpen(false);
            resetForm();
          } else {
            toast.error(t("fields.fieldSaveFailed"));
          }
        }
      } catch (_err) {
        toast.error(t("fields.fieldSaveFailed"));
      }
    });
  };

  const addModePreview = useMemo(
    () =>
      draftFields.map((field, index) => ({
        index,
        services: data.services.filter(service => !field.departmentId || service.departmentId === field.departmentId),
      })),
    [data.services, draftFields]
  );

  const handleDeleteField = (id: string, name: string) => {
    confirm({
      variant: "delete",
      title: t("fields.deleteFieldTitle"),
      description: t("fields.confirmDeleteField", { name }),
      onConfirm: async () => {
        try {
          const res = await deleteField(id);
          if (res.success) {
            setFieldsList(prev => prev.filter(f => f.id !== id));
            toast.success(t("fields.fieldDeleted"));
          } else {
            toast.error(t("fields.fieldDeleteFailed"));
          }
        } catch (_err) {
          toast.error(t("fields.fieldDeleteFailed"));
        }
      }
    });
  };

  const tableHeaderClass = RTS_DASHBOARD_TABLE_HEAD_CLASS;
  const tableClass = `${RTS_DASHBOARD_TABLE_CLASS} border-collapse text-left text-[13px]`;
  const fieldColumns: Column<FieldTableRow>[] = [
    {
      key: "id",
      label: <input type="checkbox" aria-label={t("fields.selectAll")} checked={isAllSelected} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer rounded border-slate-350 text-teal-600 focus:ring-teal-500" />,
      width: "40px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 text-center",
      render: (_value, field) => <input type="checkbox" aria-label={t("fields.selectField", { name: field.fieldLabel })} checked={selectedIds.includes(field.id)} onChange={() => toggleSelect(field.id)} className="h-4 w-4 cursor-pointer rounded border-slate-300 text-teal-600 focus:ring-teal-500" />,
    },
    {
      key: "fieldCode",
      label: t("fields.fieldCode"),
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100",
      render: (_value, field) => {
        const dept = data.departments.find((department) => department.id === field.departmentId);
        const service = data.services.find((item) => item.id === field.serviceId);
        return <div className="flex flex-col gap-0.5"><span className="text-[12px] font-bold uppercase text-slate-800">{field.fieldCode}</span><span className="text-[10px] font-medium text-slate-400">{dept?.name || t("fields.unknownDepartment")} / {service?.name || t("fields.unknownService")}</span></div>;
      },
    },
    { key: "fieldLabel", label: t("fields.fieldLabel"), headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100 font-semibold text-slate-700" },
    { key: "fieldType", label: t("fields.fieldType"), headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-650">{String(value ?? "")}</span> },
    { key: "fieldGroup", label: t("fields.fieldGroup"), headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100 text-slate-500", render: (value) => String(value || "-") },
    { key: "isRequired", label: t("fields.isRequired"), align: "center", headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className={`inline-block rounded-lg border px-2 py-0.5 text-[10px] font-bold ${value ? "border-rose-100 bg-rose-50 text-rose-600" : "border-slate-100 bg-slate-50 text-slate-400"}`}>{value ? t("fields.required") : t("fields.optional")}</span> },
    {
      key: "isActive",
      label: t("fields.isActive"),
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100",
      render: (value) => (
        <StatusBadge
          value={Boolean(value)}
          activeLabel={t("fields.active")}
          inactiveLabel={t("fields.inactive")}
          className="px-2 py-0.5 text-[10px]"
        />
      ),
    },
    { key: "displayOrder", label: t("fields.displayOrder"), align: "center", headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100 font-bold text-slate-600" },
  ];

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <Card className="flex flex-col justify-between rounded-2xl gap-4 border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex flex-row items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <Form className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {t("fields.title")}
          </h1>
        </div>
        <div>
          <AddButton onClick={handleStartAdd} label={t("fields.addField")} />
        </div>
      </Card>

      {/* Advanced Filters Panel */}
      <Card className="p-3 border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-[#3d3d3d] uppercase">{t("fields.selectDepartment")}</Label>
            <Select
              value={selectedDeptId}
              options={[
                { value: "All", label: t("fields.allDepartments") },
                ...data.departments.map((department) => ({ value: department.id, label: department.name })),
              ]}
              onChange={(_, value) => {
                setSelectedDeptId(value);
                setSelectedServiceId("All");
                setPageNumber(1);
              }}
              selectSize="sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-[#3d3d3d] uppercase">{t("fields.selectService")}</Label>
            <Select
              value={selectedServiceId}
              options={[
                {
                  value: "All",
                  label: selectedDeptId === "All"
                    ? t("fields.selectDepartmentFirst")
                    : t("fields.allServices"),
                },
                ...filteredServicesForFilter.map((service) => ({ value: service.id, label: service.name })),
              ]}
              onChange={(_, value) => {
                setSelectedServiceId(value);
                setPageNumber(1);
              }}
              disabled={selectedDeptId === "All"}
              selectSize="sm"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label className="text-[10px] font-bold text-[#3d3d3d] uppercase">{t("fields.search")}</Label>
            <SearchInput
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value);
                setPageNumber(1);
              }}
              placeholder={t("fields.searchPlaceholder")}
              className="mb-0 [&_input]:py-1.5 [&_input]:text-[13px]"
            />
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <MasterTable<FieldTableRow>
        columns={fieldColumns}
        data={fieldRows}
        getRowKey={(field) => field.id}
        emptyText={t("fields.noFields")}
        actionLabel={t("fields.actions")}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={filteredFields.length}
        totalPages={totalPages}
        onPageChange={setPageNumber}
        paginationConfig={{ enabled: true, showPageSizeSelector: false }}
        maxBodyHeightClassName="min-h-[200px] max-h-auto"
        theadClassName={tableHeaderClass}
        tableClassName={tableClass}
        containerClassName={RTS_DASHBOARD_TABLE_CONTAINER_CLASS}
        rowClassName={() => "hover:bg-blue-50"}
        renderActions={(field) => (
          <div className="flex justify-center gap-2">
            <EditButton onClick={() => handleStartEdit(field)} title={t("fields.edit")} className="size-10 px-0" />
            <DeleteButton onClick={() => handleDeleteField(field.id, field.fieldLabel)} title={t("fields.delete")} className="size-10 px-0" />
          </div>
        )}
      />

      {/* Configuration Drawer */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width="xl"
        title={
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-[#4b70a6]" />
            <span className="text-sm font-extrabold text-slate-800">
              {editingField ? t("fields.editField") : `${t("fields.newField")} Bulk`}
            </span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[13px] text-slate-700">
          {editingField ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label required className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.departmentName")}</Label>
                  <Select
                    required
                    value={editForm.departmentId}
                    options={data.departments.map((department) => ({ value: department.id, label: department.name }))}
                    placeholder={t("fields.selectDepartment")}
                    onChange={(_, value) => setEditForm(previous => ({ ...previous, departmentId: value, serviceId: "" }))}
                    selectSize="sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label required className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.specificService")}</Label>
                  <Select
                    required
                    value={editForm.serviceId}
                    options={filteredServicesForEditForm.map((service) => ({ value: service.id, label: service.name }))}
                    placeholder={!editForm.departmentId ? t("fields.selectDepartmentFirst") : t("fields.selectService")}
                    onChange={(_, value) => setEditForm(previous => ({ ...previous, serviceId: value }))}
                    disabled={!editForm.departmentId}
                    selectSize="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label required className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.fieldCode")}</Label>
                  <Input type="text" required placeholder={t("fields.placeholders.fieldCode")} value={editForm.fieldCode} onChange={e => setEditForm(previous => ({ ...previous, fieldCode: e.target.value }))} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                </div>

                <div className="space-y-1">
                  <Label required className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.fieldLabel")}</Label>
                  <Input type="text" required placeholder={t("fields.placeholders.fieldLabel")} value={editForm.fieldLabel} onChange={e => setEditForm(previous => ({ ...previous, fieldLabel: e.target.value }))} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label required className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.fieldType")}</Label>
                  <Select required value={editForm.fieldType} options={[{ value: "text", label: t("fields.fieldTypeText") }, { value: "number", label: t("fields.fieldTypeNumber") }, { value: "select", label: t("fields.fieldTypeSelect") }, { value: "textarea", label: t("fields.fieldTypeTextarea") }, { value: "checkbox", label: t("fields.fieldTypeCheckbox") }, { value: "date", label: t("fields.fieldTypeDate") }, { value: "file", label: t("fields.fieldTypeFile") }]} onChange={(_, value) => setEditForm(previous => ({ ...previous, fieldType: value }))} selectSize="sm" />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.fieldGroup")}</Label>
                  <Input type="text" placeholder={t("fields.placeholders.fieldGroup")} value={editForm.fieldGroup} onChange={e => setEditForm(previous => ({ ...previous, fieldGroup: e.target.value }))} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 items-center pt-2">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="formIsRequired" checked={editForm.isRequired} onChange={e => setEditForm(previous => ({ ...previous, isRequired: e.target.checked }))} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded" />
                  <Label htmlFor="formIsRequired" className="text-[11px] font-bold text-slate-700 uppercase cursor-pointer">{t("fields.isRequired")}</Label>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="formIsActive" checked={editForm.isActive} onChange={e => setEditForm(previous => ({ ...previous, isActive: e.target.checked }))} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded" />
                  <Label htmlFor="formIsActive" className="text-[11px] font-bold text-slate-700 uppercase cursor-pointer">{t("fields.isActive")}</Label>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.displayOrder")}</Label>
                  <Input type="number" min={1} value={editForm.displayOrder} onChange={e => setEditForm(previous => ({ ...previous, displayOrder: e.target.value }))} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                </div>
              </div>

              {(editForm.fieldType === "select" || editForm.fieldType === "checkbox") && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-450">
                      {t("fields.optionsJson")} *
                      <span title={t("fields.optionsJsonHelp")}>
                        <HelpCircle className="h-3 w-3 text-slate-400" />
                      </span>
                    </Label>
                    <Button type="button" size="sm" variant="secondary" onClick={() => addOptionRow()}>
                      Add Option
                    </Button>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="grid gap-3">
                      {editOptions.map((option, optionIndex) => (
                        <div key={`edit-option-${optionIndex}`} className="grid grid-cols-[56px_1fr_auto] gap-2">
                          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600">
                            {optionIndex + 1}
                          </div>
                          <Input type="text" placeholder={`Option ${optionIndex + 1}`} value={option.value} onChange={e => updateOptionRow(optionIndex, "value", e.target.value)} fullWidth className="border-slate-200 bg-white py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                          <button type="button" onClick={() => removeOptionRow(optionIndex)} className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500" aria-label={`Remove option ${optionIndex + 1}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.defaultValue")}</Label>
                  <Input type="text" placeholder={t("fields.placeholders.defaultValue")} value={editForm.defaultValue} onChange={e => setEditForm(previous => ({ ...previous, defaultValue: e.target.value }))} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.validationRules")}</Label>
                  <Input type="text" placeholder={t("fields.placeholders.validationRules")} value={editForm.validationRules} onChange={e => setEditForm(previous => ({ ...previous, validationRules: e.target.value }))} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.minValue")}</Label>
                  <Input type="number" placeholder={t("fields.placeholders.minValue")} value={editForm.minValue} onChange={e => setEditForm(previous => ({ ...previous, minValue: e.target.value }))} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.maxValue")}</Label>
                  <Input type="number" placeholder={t("fields.placeholders.maxValue")} value={editForm.maxValue} onChange={e => setEditForm(previous => ({ ...previous, maxValue: e.target.value }))} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.maxLength")}</Label>
                  <Input type="number" placeholder={t("fields.placeholders.maxLength")} value={editForm.maxLength} onChange={e => setEditForm(previous => ({ ...previous, maxLength: e.target.value }))} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                </div>
              </div>
            </>
          ) : (
            <>
              <Card padding="none" className="rounded-2xl border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-800">Configured Field Cards ({draftFields.length})</h3>
                    <p className="mt-1 text-xs text-slate-500">Create multiple field cards in one drawer, then save them together.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                      {draftFields.length} draft{draftFields.length > 1 ? "s" : ""}
                    </div>
                    <AddButton type="button" size="sm" onClick={addDraftFieldCard} label="Add Field" className="shrink-0" />
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 items-start">
                {addModePreview.map(({ index, services }) => {
                  const field = draftFields[index];
                  const cardId = `draft-field-${index}`;

                  return (
                    <Card key={cardId} padding="none" className="rounded-xl border-slate-200 p-4">
                      <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
                        <div>
                          <p className="text-lg font-bold text-slate-800">Field Card #{index + 1}</p>
                          {/* <p className="mt-1 text-sm text-slate-500">{field.fieldLabel.trim() || field.fieldCode.trim() || "New field"}</p> */}
                        </div>
                        <DeleteButton type="button" onClick={() => handleRemoveDraftFieldCard(index)} aria-label={`Remove field card ${index + 1}`} />
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-1">
                            <Label required className="text-[11px] font-bold text-slate-700">{t("fields.departmentName")}</Label>
                            <Select value={field.departmentId} options={data.departments.map((department) => ({ value: department.id, label: department.name }))} placeholder={t("fields.selectDepartment")} onChange={(_, value) => updateDraftField(index, { departmentId: value })} selectSize="sm" />
                          </div>
                          <div className="space-y-1">
                            <Label required className="text-[11px] font-bold text-slate-700">{t("fields.specificService")}</Label>
                            <Select value={field.serviceId} options={services.map((service) => ({ value: service.id, label: service.name }))} placeholder={!field.departmentId ? t("fields.selectDepartmentFirst") : t("fields.selectService")} onChange={(_, value) => updateDraftField(index, { serviceId: value })} disabled={!field.departmentId} selectSize="sm" />
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-1">
                            <Label required className="text-[11px] font-bold text-slate-700">{t("fields.fieldCode")}</Label>
                            <Input type="text" placeholder={t("fields.placeholders.fieldCode")} value={field.fieldCode} onChange={e => updateDraftField(index, { fieldCode: e.target.value })} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                          </div>
                          <div className="space-y-1">
                            <Label required className="text-[11px] font-bold text-slate-700">{t("fields.fieldLabel")}</Label>
                            <Input type="text" placeholder={t("fields.placeholders.fieldLabel")} value={field.fieldLabel} onChange={e => updateDraftField(index, { fieldLabel: e.target.value })} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-1">
                            <Label required className="text-[11px] font-bold text-slate-700">{t("fields.fieldType")}</Label>
                            <Select value={field.fieldType} options={[{ value: "text", label: t("fields.fieldTypeText") }, { value: "number", label: t("fields.fieldTypeNumber") }, { value: "select", label: t("fields.fieldTypeSelect") }, { value: "textarea", label: t("fields.fieldTypeTextarea") }, { value: "checkbox", label: t("fields.fieldTypeCheckbox") }, { value: "date", label: t("fields.fieldTypeDate") }, { value: "file", label: t("fields.fieldTypeFile") }]} onChange={(_, value) => updateDraftField(index, { fieldType: value })} selectSize="sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-bold text-slate-700">{t("fields.fieldGroup")}</Label>
                            <Input type="text" placeholder={t("fields.placeholders.fieldGroup")} value={field.fieldGroup} onChange={e => updateDraftField(index, { fieldGroup: e.target.value })} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] font-bold text-slate-700">{t("fields.defaultValue")}</Label>
                            <Input type="text" placeholder={t("fields.placeholders.defaultValue")} value={field.defaultValue} onChange={e => updateDraftField(index, { defaultValue: e.target.value })} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-bold text-slate-700">{t("fields.validationRules")}</Label>
                            <Input type="text" placeholder={t("fields.placeholders.validationRules")} value={field.validationRules} onChange={e => updateDraftField(index, { validationRules: e.target.value })} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-[11px] font-bold text-slate-700">{t("fields.minValue")}</Label>
                            <Input type="number" placeholder={t("fields.placeholders.minValue")} value={field.minValue} onChange={e => updateDraftField(index, { minValue: e.target.value })} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-bold text-slate-700">{t("fields.maxValue")}</Label>
                            <Input type="number" placeholder={t("fields.placeholders.maxValue")} value={field.maxValue} onChange={e => updateDraftField(index, { maxValue: e.target.value })} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-bold text-slate-700">{t("fields.maxLength")}</Label>
                            <Input type="number" placeholder={t("fields.placeholders.maxLength")} value={field.maxLength} onChange={e => updateDraftField(index, { maxLength: e.target.value })} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] font-bold text-slate-700">{t("fields.displayOrder")}</Label>
                            <Input type="number" min={1} value={field.displayOrder} onChange={e => updateDraftField(index, { displayOrder: e.target.value })} fullWidth className="border-slate-200 bg-slate-50/50 py-1.5 focus:border-teal-500 focus:bg-white focus:ring-0" />
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                          <div className="flex items-center gap-3 px-1 py-2">
                            <input type="checkbox" id={`${cardId}-required`} checked={field.isRequired} onChange={e => updateDraftField(index, { isRequired: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                            <Label htmlFor={`${cardId}-required`} className="cursor-pointer text-[11px] font-semibold text-slate-700">{t("fields.isRequired")}</Label>
                          </div>
                          <div className="flex items-center gap-3 px-1 py-2">
                            <input type="checkbox" id={`${cardId}-active`} checked={field.isActive} onChange={e => updateDraftField(index, { isActive: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                            <Label htmlFor={`${cardId}-active`} className="cursor-pointer text-[11px] font-semibold text-slate-700">{t("fields.isActive")}</Label>
                          </div>

                        </div>

                        {(field.fieldType === "select" || field.fieldType === "checkbox") && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <Label className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                                Field Options
                                <span title={t("fields.optionsJsonHelp")}>
                                  <HelpCircle className="h-3 w-3 text-slate-400" />
                                </span>
                              </Label>
                              <Button type="button" size="xs" variant="secondary" onClick={() => addOptionRow(index)}>
                                Add Option
                              </Button>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                              <div className="grid gap-4  xl:grid-cols-2">
                                {(draftOptions[index] ?? [{ value: "" }]).map((option, optionIndex, options) => (
                                  <div key={`draft-option-${index}-${optionIndex}`} className="space-y-1">
                                    <Label className="text-[11px] font-bold text-slate-700">{`Option ${optionIndex + 1}`}</Label>
                                    <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-xl border border-slate-200 bg-white">
                                      <input
                                        type="text"
                                        placeholder={`Option ${optionIndex + 1}`}
                                        value={option.value}
                                        onChange={e => updateOptionRow(optionIndex, "value", e.target.value, index)}
                                        className="min-w-0 border-0 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                      />
                                      <div className="flex border-l border-slate-200 bg-slate-50">
                                        <button
                                          type="button"
                                          onClick={() => moveOptionRow(optionIndex, "up", index)}
                                          disabled={optionIndex === 0}
                                          className="inline-flex h-full w-9 items-center justify-center text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                          aria-label={`Move option ${optionIndex + 1} up`}
                                        >
                                          <ChevronUp className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => moveOptionRow(optionIndex, "down", index)}
                                          disabled={optionIndex === options.length - 1}
                                          className="inline-flex h-full w-9 items-center justify-center border-l border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                          aria-label={`Move option ${optionIndex + 1} down`}
                                        >
                                          <ChevronDown className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeOptionRow(optionIndex, index)}
                                          className="inline-flex h-full w-10 items-center justify-center border-l border-slate-200 text-rose-500 transition hover:bg-rose-50"
                                          aria-label={`Remove option ${optionIndex + 1}`}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
            <Button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              disabled={isPending}
              variant="secondary"
              size="sm"
            >
              {t("fields.cancel")}
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              size="sm"
            >
              {isPending ? t("fields.saving") : editingField ? t("fields.saveField") : `Save ${draftFields.length} Field${draftFields.length > 1 ? "s" : ""}`}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Floating Bulk Operations Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white/95 border border-slate-200 px-5 py-3 rounded-2xl shadow-xl transition-all duration-300 transform">
          <span className="text-[12px] font-bold text-slate-700">
            {t("fields.selectedCount", { count: selectedIds.length })}
          </span>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleBulkSetRequired(true)}
              disabled={isPending}
              variant="success"
              size="sm"
            >
              {t("fields.makeRequired")}
            </Button>
            <Button
              onClick={() => handleBulkSetRequired(false)}
              disabled={isPending}
              variant="secondary"
              size="sm"
            >
              {t("fields.makeOptional")}
            </Button>
            <DeleteButton
              onClick={handleBulkDelete}
              disabled={isPending}
              size="sm"
            >
              {t("fields.delete")}
            </DeleteButton>
          </div>
        </div>
      )}
    </div>
  );
}
