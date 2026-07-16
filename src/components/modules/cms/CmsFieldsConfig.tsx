"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Settings2, Edit2, Trash2, HelpCircle } from "lucide-react";
import { Card, Drawer, MasterTable, useConfirm } from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { saveCmsFieldAction, updateCmsFieldAction, deleteCmsFieldAction } from "@/app/[locale]/rts/actions";

interface CmsField {
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

interface CmsFieldsConfigProps {
  data: {
    fields: CmsField[];
    departments: { id: string; name: string }[];
    services: { id: string; name: string; departmentId: string }[];
  };
  locale: string;
}

type FieldTableRow = Record<string, unknown> & CmsField;

export default function CmsFieldsConfig({ data, locale }: CmsFieldsConfigProps) {
  const t = useTranslations("cms");
  const tCommon = useTranslations("common");
  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();

  const [fieldsList, setFieldsList] = useState<CmsField[]>(data.fields);
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
    
    const q = searchTerm.toLowerCase().trim();
    const textMatch =
      !q ||
      f.fieldCode.toLowerCase().includes(q) ||
      f.fieldLabel.toLowerCase().includes(q) ||
      f.fieldGroup.toLowerCase().includes(q);

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
      title: t("common.delete") + " " + t("fields.title"),
      description: locale === "mr"
        ? `तुम्हाला खात्री आहे की तुम्ही निवडलेले ${selectedIds.length} फील्ड्स हटवू इच्छिता?`
        : `Are you sure you want to delete the ${selectedIds.length} selected field definitions?`,
      onConfirm: async () => {
        startTransition(async () => {
          try {
            await Promise.all(selectedIds.map(id => deleteCmsFieldAction(id)));
            setFieldsList(prev => prev.filter(f => !selectedIds.includes(f.id)));
            toast.success(locale === "mr" ? "निवडलेले फील्ड यशस्वीरित्या हटवले." : "Selected fields deleted successfully.");
            setSelectedIds([]);
          } catch (err) {
            toast.error("Failed to perform bulk delete operation.");
          }
        });
      }
    });
  };

  const handleBulkSetRequired = (required: boolean) => {
    confirm({
      variant: "update",
      title: locale === "mr" ? "निवडलेले अपडेट करा" : "Update Selected",
      description: locale === "mr"
        ? `तुम्हाला खात्री आहे की तुम्ही निवडलेले ${selectedIds.length} फील्ड्स ${required ? "आवश्यक (Required)" : "पर्यायी (Optional)"} करू इच्छिता?`
        : `Are you sure you want to make the ${selectedIds.length} selected fields ${required ? "Required" : "Optional"}?`,
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
                const res = await updateCmsFieldAction(id, payload);
                return res.success ? (res.field as CmsField) : null;
              })
            );

            setFieldsList(prev =>
              prev.map(f => {
                const matched = updated.find(u => u && u.id === f.id);
                return matched ? matched : f;
              })
            );

            toast.success(locale === "mr" ? "निवडलेले फील्ड अपडेट केले." : "Selected fields updated successfully.");
            setSelectedIds([]);
          } catch (err) {
            toast.error("Failed to perform bulk update operation.");
          }
        });
      }
    });
  };

  // Drawer form states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingField, setEditingField] = useState<CmsField | null>(null);

  const [formDeptId, setFormDeptId] = useState("");
  const [formServiceId, setFormServiceId] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formType, setFormType] = useState("text");
  const [formGroup, setFormGroup] = useState("");
  const [formIsRequired, setFormIsRequired] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState("1");
  const [formOptionsJson, setFormOptionsJson] = useState("");
  const [formDefaultValue, setFormDefaultValue] = useState("");
  const [formMinValue, setFormMinValue] = useState("");
  const [formMaxValue, setFormMaxValue] = useState("");
  const [formMaxLength, setFormMaxLength] = useState("");
  const [formValidationRules, setFormValidationRules] = useState("");

  const filteredServicesForForm = data.services.filter(
    s => !formDeptId || s.departmentId === formDeptId
  );

  const resetForm = () => {
    setEditingField(null);
    setFormDeptId(selectedDeptId !== "All" ? selectedDeptId : "");
    setFormServiceId(selectedServiceId !== "All" ? selectedServiceId : "");
    setFormCode("");
    setFormLabel("");
    setFormType("text");
    setFormGroup("");
    setFormIsRequired(false);
    setFormIsActive(true);
    setFormDisplayOrder("1");
    setFormOptionsJson("");
    setFormDefaultValue("");
    setFormMinValue("");
    setFormMaxValue("");
    setFormMaxLength("");
    setFormValidationRules("");
  };

  const handleStartAdd = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleStartEdit = (field: CmsField) => {
    setEditingField(field);
    setFormDeptId(field.departmentId);
    setFormServiceId(field.serviceId);
    setFormCode(field.fieldCode);
    setFormLabel(field.fieldLabel);
    setFormType(field.fieldType);
    setFormGroup(field.fieldGroup);
    setFormIsRequired(field.isRequired);
    setFormIsActive(field.isActive);
    setFormDisplayOrder(String(field.displayOrder));
    setFormOptionsJson(field.optionsJson || "");
    setFormDefaultValue(field.defaultValue || "");
    setFormMinValue(field.minValue !== null ? String(field.minValue) : "");
    setFormMaxValue(field.maxValue !== null ? String(field.maxValue) : "");
    setFormMaxLength(field.maxLength !== null ? String(field.maxLength) : "");
    setFormValidationRules(field.validationRules || "");
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDeptId || !formServiceId || !formCode || !formLabel || !formType) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    if (formType === "select" && formOptionsJson) {
      try {
        JSON.parse(formOptionsJson);
      } catch (err) {
        toast.error("Options JSON is invalid. Must be an array like: [{\"label\":\"Yes\", \"value\":\"Y\"}]");
        return;
      }
    }

    startTransition(async () => {
      try {
        const payload = {
          departmentId: formDeptId,
          serviceId: formServiceId,
          fieldCode: formCode,
          fieldName: formCode,
          fieldLabel: formLabel,
          fieldType: formType,
          fieldGroup: formGroup,
          isActive: formIsActive,
          isRequired: formIsRequired,
          displayOrder: parseInt(formDisplayOrder, 10) || 1,
          optionsJson: formOptionsJson,
          defaultValue: formDefaultValue,
          minValue: formMinValue !== "" ? parseInt(formMinValue, 10) : null,
          maxValue: formMaxValue !== "" ? parseInt(formMaxValue, 10) : null,
          maxLength: formMaxLength !== "" ? parseInt(formMaxLength, 10) : null,
          validationRules: formValidationRules
        };

        if (editingField) {
          const res = await updateCmsFieldAction(editingField.id, payload);
          if (res.success && res.field) {
            setFieldsList(prev => prev.map(f => (f.id === editingField.id ? (res.field as CmsField) : f)));
            toast.success("Field definition updated successfully.");
            setIsDrawerOpen(false);
          }
        } else {
          const res = await saveCmsFieldAction(payload);
          if (res.success && res.field) {
            setFieldsList(prev => [...prev, res.field as CmsField]);
            toast.success("Field definition registered successfully.");
            setIsDrawerOpen(false);
          }
        }
      } catch (err) {
        toast.error("An error occurred while saving the field configuration.");
      }
    });
  };

  const handleDeleteField = (id: string, name: string) => {
    confirm({
      variant: "delete",
      title: t("common.delete") + " " + t("fields.fieldLabel"),
      description: t("fields.confirmDeleteField", { name }),
      onConfirm: async () => {
        try {
          const res = await deleteCmsFieldAction(id);
          if (res.success) {
            setFieldsList(prev => prev.filter(f => f.id !== id));
            toast.success("Field definition removed successfully.");
          }
        } catch (err) {
          toast.error("Failed to delete field definition.");
        }
      }
    });
  };

  const tableHeaderClass = "!bg-[#4b70a6] !from-[#4b70a6] !via-[#4b70a6] !to-[#4b70a6] hover:!from-[#4b70a6] hover:!via-[#4b70a6] hover:!to-[#4b70a6] [&_th]:!text-white";
  const tableClass = "border-collapse text-left text-[13px] [&_th:last-child]:border-l [&_th:last-child]:border-blue-300/60 [&_td:last-child]:border-l [&_td:last-child]:border-slate-100";
  const fieldColumns: Column<FieldTableRow>[] = [
    {
      key: "id",
      label: <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer rounded border-slate-350 text-teal-600 focus:ring-teal-500" />,
      width: "40px",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100 text-center",
      render: (_value, field) => <input type="checkbox" checked={selectedIds.includes(field.id)} onChange={() => toggleSelect(field.id)} className="h-4 w-4 cursor-pointer rounded border-slate-300 text-teal-600 focus:ring-teal-500" />,
    },
    {
      key: "fieldCode",
      label: t("fields.fieldCode"),
      headerClassName: "border-r border-blue-300/60 text-white",
      cellClassName: "border-r border-slate-100",
      render: (_value, field) => {
        const dept = data.departments.find((department) => department.id === field.departmentId);
        const service = data.services.find((item) => item.id === field.serviceId);
        return <div className="flex flex-col gap-0.5"><span className="text-[12px] font-bold uppercase text-slate-800">{field.fieldCode}</span><span className="text-[10px] font-medium text-slate-400">{dept?.name || "NOC"} / {service?.name || "Service"}</span></div>;
      },
    },
    { key: "fieldLabel", label: t("fields.fieldLabel"), headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100 font-semibold text-slate-700" },
    { key: "fieldType", label: t("fields.fieldType"), headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-650">{String(value ?? "")}</span> },
    { key: "fieldGroup", label: t("fields.fieldGroup"), headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100 text-slate-500", render: (value) => String(value || "-") },
    { key: "isRequired", label: t("fields.isRequired"), align: "center", headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className={`inline-block rounded-lg border px-2 py-0.5 text-[10px] font-bold ${value ? "border-rose-100 bg-rose-50 text-rose-600" : "border-slate-100 bg-slate-50 text-slate-400"}`}>{value ? "REQUIRED" : "OPTIONAL"}</span> },
    { key: "isActive", label: t("fields.isActive"), align: "center", headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className={`inline-block rounded-lg border px-2 py-0.5 text-[10px] font-bold ${value ? "border-teal-100 bg-teal-50 text-teal-700" : "border-slate-100 bg-slate-50 text-slate-400"}`}>{value ? tCommon("status.active") : tCommon("status.inactive")}</span> },
    { key: "displayOrder", label: t("fields.displayOrder"), align: "center", headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100 font-bold text-slate-600" },
  ];

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <Card className="flex flex-col justify-between gap-4 border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {t("fields.title")}
          </h1>
          {/* <p className="text-[13px] text-slate-400 mt-0.5">
            {t("fields.subtitle")}
          </p> */}
        </div>
        <div>
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4b70a6] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#3d5e8c]"
          >
            <Plus className="h-4 w-4" />
            {t("fields.addField")}
          </button>
        </div>
      </Card>

      {/* Advanced Filters Panel */}
      <Card className="p-3 border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#3d3d3d] uppercase">{t("masters.selectDept")}</label>
            <select
              value={selectedDeptId}
              onChange={e => {
                setSelectedDeptId(e.target.value);
                setSelectedServiceId("All");
                setPageNumber(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-[13px] text-slate-700 focus:border-teal-500 focus:bg-white focus:outline-none"
            >
              <option value="All">{locale === "mr" ? "सर्व विभाग" : "All Departments"}</option>
              {data.departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#3d3d3d] uppercase">{locale === "mr" ? "सेवा निवडा" : "Select Service"}</label>
            <select
              value={selectedServiceId}
              onChange={e => {
                setSelectedServiceId(e.target.value);
                setPageNumber(1);
              }}
              disabled={selectedDeptId === "All"}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-[13px] text-slate-700 focus:border-teal-500 focus:bg-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="All">
                {selectedDeptId === "All"
                  ? (locale === "mr" ? "प्रथम विभाग निवडा..." : "Select department first...")
                  : (locale === "mr" ? "सर्व सेवा" : "All Services")}
              </option>
              {selectedDeptId !== "All" && filteredServicesForFilter.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[10px] font-bold text-[#3d3d3d] uppercase">{t("common.search")}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder={t("fields.searchPlaceholder")}
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setPageNumber(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-[13px] text-slate-700 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      {/* <Card className="p-0 border border-slate-200 bg-white shadow-sm overflow-hidden"> */}
        <MasterTable<FieldTableRow>
          columns={fieldColumns}
          data={fieldRows}
          getRowKey={(field) => field.id}
          emptyText={t("fields.noFields")}
          actionLabel={t("common.actions")}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={filteredFields.length}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          paginationConfig={{ enabled: true, showPageSizeSelector: false }}
          maxBodyHeightClassName="max-h-auto"
          theadClassName={tableHeaderClass}
          tableClassName={tableClass}
          containerClassName="gap-0"
          rowClassName={() => "hover:bg-slate-50/50"}
          renderActions={(field) => (
            <div className="flex justify-center gap-2">
              <button onClick={() => handleStartEdit(field)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50/50 text-[#4b70a6] transition hover:bg-slate-50" title={tCommon("buttons.edit")}><Edit2 className="h-3.5 w-3.5" /></button>
              <button onClick={() => handleDeleteField(field.id, field.fieldLabel)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-rose-50/50 text-rose-600 transition hover:bg-rose-100" title={tCommon("buttons.delete")}><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        />
      {/* </Card> */}

      {/* Configuration Drawer */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width="md"
        title={
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-[#4b70a6]" />
            <span className="text-sm font-extrabold text-slate-800">
              {editingField ? t("fields.editField") : t("fields.newField")}
            </span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[13px] text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("masters.deptName")} *</label>
              <select
                required
                value={formDeptId}
                onChange={e => {
                  setFormDeptId(e.target.value);
                  setFormServiceId("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              >
                <option value="">{t("masters.selectDept")}</option>
                {data.departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{locale === "mr" ? "विशिष्ट सेवा" : "Specific Service"} *</label>
              <select
                required
                value={formServiceId}
                onChange={e => setFormServiceId(e.target.value)}
                disabled={!formDeptId}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formDeptId
                    ? (locale === "mr" ? "प्रथम विभाग निवडा..." : "Select department first...")
                    : (locale === "mr" ? "सेवा निवडा" : "Select Service")}
                </option>
                {formDeptId && filteredServicesForForm.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.fieldCode")} *</label>
              <input
                type="text"
                required
                placeholder="e.g. fireSafetyCertificate"
                value={formCode}
                onChange={e => setFormCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.fieldLabel")} *</label>
              <input
                type="text"
                required
                placeholder="e.g. Fire Safety Certificate"
                value={formLabel}
                onChange={e => setFormLabel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.fieldType")} *</label>
              <select
                required
                value={formType}
                onChange={e => setFormType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              >
                <option value="text">Text Input</option>
                <option value="number">Number Input</option>
                <option value="select">Dropdown Options (Select)</option>
                <option value="textarea">Multi-line Text (Textarea)</option>
                <option value="checkbox">Toggle Checkbox</option>
                <option value="date">Date Picker</option>
                <option value="file">File Attachment</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.fieldGroup")}</label>
              <input
                type="text"
                placeholder="e.g. General Information"
                value={formGroup}
                onChange={e => setFormGroup(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-center pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="formIsRequired"
                checked={formIsRequired}
                onChange={e => setFormIsRequired(e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
              />
              <label htmlFor="formIsRequired" className="text-[11px] font-bold text-slate-700 uppercase cursor-pointer">
                {t("fields.isRequired")}
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="formIsActive"
                checked={formIsActive}
                onChange={e => setFormIsActive(e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
              />
              <label htmlFor="formIsActive" className="text-[11px] font-bold text-slate-700 uppercase cursor-pointer">
                {t("fields.isActive")}
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.displayOrder")}</label>
              <input
                type="number"
                min={1}
                value={formDisplayOrder}
                onChange={e => setFormDisplayOrder(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {formType === "select" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase flex items-center gap-1">
                {t("fields.optionsJson")} *
                <span title='e.g. [{"label": "Option A", "value": "A"}]'>
                  <HelpCircle className="h-3 w-3 text-slate-400" />
                </span>
              </label>
              <textarea
                required
                rows={2}
                placeholder='e.g. [{"label": "Male", "value": "M"}, {"label": "Female", "value": "F"}]'
                value={formOptionsJson}
                onChange={e => setFormOptionsJson(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-mono focus:border-teal-500 focus:bg-white focus:outline-none resize-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.defaultValue")}</label>
              <input
                type="text"
                placeholder="Default fallback text"
                value={formDefaultValue}
                onChange={e => setFormDefaultValue(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.validationRules")}</label>
              <input
                type="text"
                placeholder="e.g. email, regex matches"
                value={formValidationRules}
                onChange={e => setFormValidationRules(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.minValue")}</label>
              <input
                type="number"
                placeholder="e.g. 0"
                value={formMinValue}
                onChange={e => setFormMinValue(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.maxValue")}</label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={formMaxValue}
                onChange={e => setFormMaxValue(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("fields.maxLength")}</label>
              <input
                type="number"
                placeholder="e.g. 250"
                value={formMaxLength}
                onChange={e => setFormMaxLength(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-650 transition"
              disabled={isPending}
            >
              {tCommon("buttons.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#4b70a6] text-white hover:bg-[#3d5e8c] text-xs font-bold transition flex items-center gap-1"
              disabled={isPending}
            >
              {isPending ? t("fields.saving") : t("fields.saveField")}
            </button>
          </div>
        </form>
      </Drawer>

      {/* Floating Bulk Operations Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white/95 border border-slate-200 px-5 py-3 rounded-2xl shadow-xl transition-all duration-300 transform">
          <span className="text-[12px] font-bold text-slate-700">
            {locale === "mr" 
              ? `${selectedIds.length} फील्ड्स निवडले`
              : `${selectedIds.length} fields selected`}
          </span>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkSetRequired(true)}
              disabled={isPending}
              className="inline-flex h-8 px-3 items-center gap-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 transition text-[11px] font-bold disabled:opacity-50"
            >
              {locale === "mr" ? "आवश्यक करा" : "Make Required"}
            </button>
            <button
              onClick={() => handleBulkSetRequired(false)}
              disabled={isPending}
              className="inline-flex h-8 px-3 items-center gap-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-150 transition text-[11px] font-bold disabled:opacity-50"
            >
              {locale === "mr" ? "पर्यायी करा" : "Make Optional"}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="inline-flex h-8 px-3 items-center gap-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition text-[11px] font-bold disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {tCommon("buttons.delete")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
