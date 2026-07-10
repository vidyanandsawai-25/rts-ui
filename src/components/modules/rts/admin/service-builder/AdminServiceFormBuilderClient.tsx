"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { departments } from "@/lib/mock/rts/departments";
import AdminServiceFormPreview from "./AdminServiceFormPreview";
import {
  clearServiceBuilderDraft,
  createEmptyField,
  createEmptySection,
  createId,
  readServiceBuilderDraft,
  writeServiceBuilderDraft,
} from "./storage";
// import { saveAdminServiceFormAction } from "@/app/[locale]/rts/admin/services/actions";
const saveAdminServiceFormAction = async (_locale: string, data: any) => { return { success: true, data }; };
import type {
  AdminServiceFormRecord,
  BuilderColSpan,
  BuilderFieldDefinition,
  BuilderFieldType,
  BuilderSectionDefinition,
} from "./types";

type AdminServiceFormBuilderClientProps = {
  locale: string;
};

const FIELD_TYPES: Array<{ value: BuilderFieldType; label: string }> = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Mobile Number" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "aadhar", label: "Aadhaar" },
  { value: "pan", label: "PAN" },
  { value: "file", label: "File Input" },
  { value: "radio", label: "Radio Button" },
];

const STEP_TITLES = [
  "Basic Info",
  "Form Builder",
  "Preview",
] as const;

function toFieldKey(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

export default function AdminServiceFormBuilderClient({
  locale,
}: AdminServiceFormBuilderClientProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [serviceName, setServiceName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState<BuilderSectionDefinition[]>([createEmptySection()]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"list" | "config" | "section" | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [wasOpenedFromList, setWasOpenedFromList] = useState(false);

  const selectedSection = useMemo(() => {
    return sections.find((s) => s.id === selectedSectionId) || null;
  }, [sections, selectedSectionId]);

  const selectedField = useMemo(() => {
    if (!selectedSection) return null;
    return selectedSection.fields.find((f) => f.id === selectedFieldId) || null;
  }, [selectedSection, selectedFieldId]);

  const department = useMemo(
    () => departments.find((item) => item.id === departmentId),
    [departmentId]
  );

  const draft = useMemo<AdminServiceFormRecord>(
    () => ({
      id: createId("service"),
      serviceName,
      departmentId,
      departmentName: department?.name.en || "",
      description,
      status: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections,
    }),
    [department?.name.en, departmentId, description, sections, serviceName]
  );

  useEffect(() => {
    const savedDraft = readServiceBuilderDraft();

    if (savedDraft) {
      setCurrentStep(savedDraft.currentStep);
      setServiceName(savedDraft.serviceName);
      setDepartmentId(savedDraft.departmentId);
      setDescription(savedDraft.description);
      setSections(savedDraft.sections);
    }

    setHasHydratedDraft(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedDraft) {
      return;
    }

    writeServiceBuilderDraft({
      currentStep,
      serviceName,
      departmentId,
      description,
      sections,
    });
  }, [currentStep, departmentId, description, hasHydratedDraft, sections, serviceName]);

  const updateSection = (sectionId: string, updater: (section: BuilderSectionDefinition) => BuilderSectionDefinition) => {
    setSections((prev) => prev.map((section) => (section.id === sectionId ? updater(section) : section)));
  };

  const updateField = (
    sectionId: string,
    fieldId: string,
    updater: (field: BuilderFieldDefinition) => BuilderFieldDefinition
  ) => {
    updateSection(sectionId, (section) => ({
      ...section,
      fields: section.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
    }));
  };

  const addSection = () => {
    const newSection = {
      ...createEmptySection(),
      title: `Section ${sections.length + 1}`,
      fields: [],
    };
    setSections((prev) => [...prev, newSection]);
    setSelectedSectionId(newSection.id);
    setDrawerMode("section");
    setDrawerOpen(true);
  };

  const removeSection = (sectionId: string) => {
    setSections((prev) => (prev.length === 1 ? prev : prev.filter((section) => section.id !== sectionId)));
    if (selectedSectionId === sectionId) {
      setDrawerOpen(false);
      setDrawerMode(null);
    }
  };

  const addField = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedFieldId(null);
    setDrawerMode("list");
    setWasOpenedFromList(true);
    setDrawerOpen(true);
  };

  const removeField = (sectionId: string, fieldId: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      fields: section.fields.filter((field) => field.id !== fieldId),
    }));
    if (selectedFieldId === fieldId) {
      setDrawerOpen(false);
      setDrawerMode(null);
    }
  };

  const TEMPLATES: Array<{
    name: string;
    description: string;
    defaultLabel: string;
    defaultKey: string;
    type: BuilderFieldType;
    placeholder?: string;
    options?: string[];
    min?: number;
    max?: number;
    dateRestriction?: string;
  }> = [
    { name: "Name", description: "Full name input", defaultLabel: "Full Name", defaultKey: "full_name", type: "text", min: 2, max: 100, placeholder: "Enter full name" },
    { name: "Email", description: "Email address input", defaultLabel: "Email", defaultKey: "email_address", type: "email", placeholder: "Enter email address" },
    { name: "Mobile", description: "10-digit mobile number", defaultLabel: "Mobile Number", defaultKey: "mobile_number", type: "tel", placeholder: "Enter mobile number" },
    { name: "Age", description: "Numeric age input", defaultLabel: "Age", defaultKey: "age", type: "number", placeholder: "Enter age" },
    { name: "Aadhar", description: "12-digit Aadhaar number", defaultLabel: "Aadhaar Number", defaultKey: "aadhar_number", type: "aadhar", min: 12, max: 12, placeholder: "Enter Aadhaar number" },
    { name: "PAN", description: "10-character PAN number", defaultLabel: "PAN Card Number", defaultKey: "pan_number", type: "pan", min: 10, max: 10, placeholder: "Enter PAN number" },
    { name: "Gender", description: "Select gender options", defaultLabel: "Gender", defaultKey: "gender", type: "select", options: ["Male", "Female", "Other"] },
    { name: "Birth Date", description: "Date of birth", defaultLabel: "Date of Birth", defaultKey: "date_of_birth", type: "date", dateRestriction: "noFuture" },
    
    // Custom controls
    { name: "Text Input", description: "Standard text field", defaultLabel: "Custom Text", defaultKey: "custom_text", type: "text", min: 0, max: 50 },
    { name: "Dropdown", description: "List of options", defaultLabel: "Custom Dropdown", defaultKey: "custom_dropdown", type: "select", options: ["Option 1", "Option 2"] },
    { name: "File Input", description: "Upload files/documents", defaultLabel: "Upload Document", defaultKey: "uploaded_file", type: "file", placeholder: "Select document..." },
    { name: "Date Input", description: "Date selection", defaultLabel: "Custom Date", defaultKey: "custom_date", type: "date", dateRestriction: "none" },
    { name: "Radio Button", description: "Single-choice list", defaultLabel: "Custom Radio", defaultKey: "custom_radio", type: "radio", options: ["Option 1", "Option 2"] },
    { name: "Checkbox", description: "Multi-select option", defaultLabel: "Custom Checkbox", defaultKey: "custom_checkbox", type: "checkbox", options: ["Option 1"] }
  ];

  const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
    if (!selectedSectionId) return;

    const newField: BuilderFieldDefinition = {
      ...createEmptyField(),
      label: template.defaultLabel,
      key: `${template.defaultKey}_${Math.random().toString(36).slice(2, 6)}`,
      type: template.type,
      placeholder: template.placeholder || "",
      min: template.min ?? 0,
      max: template.max ?? 50,
      dateRestriction: template.dateRestriction || "none",
      options: template.options
        ? template.options.map((opt) => ({ id: createId("opt"), label: opt }))
        : [],
    };

    updateSection(selectedSectionId, (curr) => ({
      ...curr,
      fields: [...curr.fields, newField],
    }));

    setSelectedFieldId(newField.id);
    setDrawerMode("config");
  };

  // const setFieldOptions = (sectionId: string, fieldId: string, raw: string) => {
  //   const options: BuilderFieldOption[] = raw
  //     .split("\n")
  //     .map((value) => value.trim())
  //     .filter(Boolean)
  //     .map((label) => ({
  //       id: createId("option"),
  //       label,
  //     }));
  // 
  //   updateField(sectionId, fieldId, (field) => ({
  //     ...field,
  //     options,
  //   }));
  // };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!serviceName.trim() || !departmentId) {
        setErrorMessage("Please enter the service name and choose a department before continuing.");
        return;
      }
    }

    if (currentStep === 1) {
      const hasValidFields = sections.some((section) =>
        section.fields.some((field) => field.label.trim() && field.key.trim())
      );

      if (!hasValidFields) {
        setErrorMessage("Add at least one field with a label and key before previewing the form.");
        return;
      }
    }

    setErrorMessage("");
    setCurrentStep((prev) => Math.min(prev + 1, STEP_TITLES.length - 1));
  };

  const handleSave = () => {
    if (!serviceName.trim() || !departmentId) {
      setCurrentStep(0);
      setErrorMessage("Service name and department are required.");
      return;
    }

    const now = new Date().toISOString();
    const recordToSave: AdminServiceFormRecord = {
      ...draft,
      id: createId("service"),
      createdAt: now,
      updatedAt: now,
      status: "Draft",
    };

    setIsSaving(true);
    setErrorMessage("");

    startTransition(async () => {
      try {
        await saveAdminServiceFormAction(locale, recordToSave);
        clearServiceBuilderDraft();
        router.push(`/${locale}/rts/admin/services`);
        router.refresh();
      } catch {
        setErrorMessage("Unable to write the service form data into src/lib/mock/rts/ServicesAndFormData.json.");
      } finally {
        setIsSaving(false);
      }
    });
  };

  return (
    <div className="mx-auto max-w-[1320px]">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#647792]">Service Builder</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-[#102b55]">Create Service</h1>
          <p className="mt-2 text-base text-[#47607e]">
            Configure a service schema, build sections and fields, then review the generated JSON before saving.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/${locale}/rts/admin/services`)}
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-[#d4ddeb] bg-white px-4 py-3 text-sm font-semibold text-[#233a67] transition hover:bg-[#f6f8fb]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Services
        </button>
      </div>

      <div className="mb-6 grid gap-4 rounded-[28px] border border-[#dfe7ef] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] lg:grid-cols-3">
        {STEP_TITLES.map((title, index) => (
          <button
            key={title}
            type="button"
            onClick={() => {
              if (index <= currentStep) {
                setCurrentStep(index);
                setErrorMessage("");
              }
            }}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              index === currentStep
                ? "border-[#245af0] bg-[#eef3ff] shadow-sm"
                : index < currentStep
                ? "border-[#bde8df] bg-[#f1fdf9]"
                : "border-[#edf2f7] bg-[#fafcff]"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#67809b]">Step {index + 1}</p>
            <h2 className="mt-2 text-xl font-semibold text-[#102b55]">{title}</h2>
          </button>
        ))}
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-[#ffd7dc] bg-[#fff4f5] px-4 py-3 text-sm text-[#d12639]">
          {errorMessage}
        </div>
      ) : null}

      {currentStep === 0 ? (
        <div className="rounded-[28px] border border-[#dfe7ef] bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#20305c]">Service Name</label>
              <input
                value={serviceName}
                onChange={(event) => setServiceName(event.target.value)}
                placeholder="Enter service name"
                className="h-12 w-full rounded-2xl border border-[#d4ddeb] bg-white px-4 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
              />
            </div>

            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-[#20305c]">Department</label>
              <select
                value={departmentId}
                onChange={(event) => setDepartmentId(event.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-[#d4ddeb] bg-white px-4 pr-10 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
              >
                <option value="">Select department</option>
                {departments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name.en}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-[3.25rem] h-4 w-4 text-[#7c8ba6]" />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#20305c]">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short summary shown in the service list and preview header"
                className="min-h-[120px] w-full rounded-2xl border border-[#d4ddeb] bg-white px-4 py-3 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
              />
            </div>
          </div>
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-[28px] border border-[#dfe7ef] bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
            >
              <div className="mb-5 flex flex-col gap-4 border-b border-[#edf2f7] pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#102b55]">{section.title || "Untitled Section"}</h3>
                  <p className="text-sm text-[#67809b]">{section.description || "No description provided."}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setDrawerMode("section");
                      setDrawerOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#dfe7ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#20305c] hover:bg-[#f6f8fb] transition"
                  >
                    Configure Section
                  </button>
                  <button
                    type="button"
                    onClick={() => addField(section.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#c6dbff] bg-[#f4f8ff] px-4 py-2.5 text-sm font-semibold text-[#245af0] hover:bg-[#eef3ff] transition"
                  >
                    <Plus className="h-4 w-4" />
                    Add Field
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {section.fields.map((field, fieldIndex) => (
                  <div
                    key={field.id}
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setSelectedFieldId(field.id);
                      setDrawerMode("config");
                      setWasOpenedFromList(false);
                      setDrawerOpen(true);
                    }}
                    className="group relative flex items-center justify-between rounded-2xl border border-[#e8edf4] bg-[#fbfcff] p-4 cursor-pointer hover:border-[#245af0] hover:bg-white hover:shadow-xs transition duration-200"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#68819b] mb-0.5">
                        Field {fieldIndex + 1}
                      </p>
                      <p className="text-sm font-bold text-[#102b55] truncate">
                        {field.label || "Untitled Field"}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center">
                      <span className="rounded-lg bg-[#e6f4ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#245af0] group-hover:bg-[#245af0] group-hover:text-white transition duration-200">
                        {FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                      </span>
                    </div>
                  </div>
                ))}
                {section.fields.length === 0 && (
                  <div className="col-span-full py-8 text-center text-sm text-[#7c8ba6] border border-dashed border-[#d4ddeb] rounded-2xl">
                    No fields in this section yet. Click "Add Field" to start building.
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-[#8ebbe0] bg-[#f6fbff] px-5 py-3 text-sm font-semibold text-[#2359f0]"
          >
            <Plus className="h-4 w-4" />
            Add New Section
          </button>
        </div>
      ) : null}

      {/* Right Side Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setDrawerOpen(false);
              setDrawerMode(null);
            }}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-[#dfe7ef] animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-[#edf2f7] px-6 py-4">
              <h2 className="text-xl font-bold text-[#102b55]">
                {drawerMode === "section" && "Configure Section"}
                {drawerMode === "list" && "Add New Field"}
                {drawerMode === "config" && "Configure Field"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (drawerMode === "config" && wasOpenedFromList) {
                    setDrawerMode("list");
                  } else {
                    setDrawerOpen(false);
                    setDrawerMode(null);
                  }
                }}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerMode === "section" && selectedSection && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#20305c]">Section Title</label>
                    <input
                      value={selectedSection.title}
                      onChange={(event) =>
                        updateSection(selectedSection.id, (current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-[#d4ddeb] px-4 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#20305c]">Section Description</label>
                    <textarea
                      value={selectedSection.description}
                      onChange={(event) =>
                        updateSection(selectedSection.id, (current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      className="min-h-[100px] w-full rounded-2xl border border-[#d4ddeb] px-4 py-3 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
                    />
                  </div>

                  <div className="pt-4 border-t border-[#edf2f7]">
                    <button
                      type="button"
                      onClick={() => {
                        removeSection(selectedSection.id);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#ffd2d7] bg-[#fff4f5] px-4 py-3 text-sm font-semibold text-[#d12639] hover:bg-[#ffebeb] transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Section
                    </button>
                  </div>
                </div>
              )}

              {drawerMode === "list" && (
                <div className="space-y-4">
                  <p className="text-xs text-[#67809b] mb-2">Select a field template or custom control to insert:</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className="flex flex-col items-start w-full rounded-2xl border border-[#e8edf4] bg-[#fbfcff] p-3 text-left hover:border-[#245af0] hover:bg-white transition duration-200"
                      >
                        <span className="font-bold text-sm text-[#102b55]">{tpl.name}</span>
                        <span className="text-[11px] text-[#68819b] mt-0.5">{tpl.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {drawerMode === "config" && selectedSection && selectedField && (
                <div className="space-y-4">
                  {wasOpenedFromList && (
                    <button
                      type="button"
                      onClick={() => setDrawerMode("list")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245af0] hover:underline mb-2"
                    >
                      &larr; Back to Templates List
                    </button>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#20305c]">Field Label</label>
                    <input
                      value={selectedField.label}
                      onChange={(event) =>
                        updateField(selectedSection.id, selectedField.id, (current) => ({
                          ...current,
                          label: event.target.value,
                          key:
                            current.key === "field_name" || current.key === toFieldKey(current.label)
                              ? toFieldKey(event.target.value) || current.key
                              : current.key,
                        }))
                      }
                      className="h-11 w-full rounded-2xl border border-[#d4ddeb] px-4 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
                    />
                  </div>



                  <div className="relative">
                    <label className="mb-2 block text-sm font-semibold text-[#20305c]">Field Type</label>
                    <select
                      value={selectedField.type}
                      onChange={(event) =>
                        updateField(selectedSection.id, selectedField.id, (current) => ({
                          ...current,
                          type: event.target.value as BuilderFieldType,
                          options:
                            ["select", "checkbox", "radio"].includes(event.target.value)
                              ? current.options.length > 0
                                ? current.options
                                : [{ id: createId("option"), label: "Option 1" }]
                              : [],
                        }))
                      }
                      className="h-11 w-full appearance-none rounded-2xl border border-[#d4ddeb] px-4 pr-10 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
                    >
                      {FIELD_TYPES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-[2.9rem] h-4 w-4 text-[#7c8ba6]" />
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-sm font-semibold text-[#20305c]">Field Width</label>
                    <select
                      value={selectedField.colSpan}
                      onChange={(event) =>
                        updateField(selectedSection.id, selectedField.id, (current) => ({
                          ...current,
                          colSpan: Number(event.target.value) as BuilderColSpan,
                        }))
                      }
                      className="h-11 w-full appearance-none rounded-2xl border border-[#d4ddeb] px-4 pr-10 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
                    >
                      <option value={1}>Quarter Width</option>
                      <option value={2}>Half Width</option>
                      <option value={3}>Three Quarter Width</option>
                      <option value={4}>Full Width</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-[2.9rem] h-4 w-4 text-[#7c8ba6]" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#20305c]">Placeholder</label>
                    <input
                      value={selectedField.placeholder}
                      onChange={(event) =>
                        updateField(selectedSection.id, selectedField.id, (current) => ({
                          ...current,
                          placeholder: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-2xl border border-[#d4ddeb] px-4 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
                    />
                  </div>

                  {["text", "email", "tel", "textarea"].includes(selectedField.type) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#20305c]">Min Characters</label>
                        <input
                          type="number"
                          value={selectedField.min ?? 0}
                          min={0}
                          onChange={(event) =>
                            updateField(selectedSection.id, selectedField.id, (current) => ({
                              ...current,
                              min: Number(event.target.value),
                            }))
                          }
                          className="h-11 w-full rounded-2xl border border-[#d4ddeb] px-4 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#20305c]">Max Characters</label>
                        <input
                          type="number"
                          value={selectedField.max ?? 50}
                          min={0}
                          onChange={(event) =>
                            updateField(selectedSection.id, selectedField.id, (current) => ({
                              ...current,
                              max: Number(event.target.value),
                            }))
                          }
                          className="h-11 w-full rounded-2xl border border-[#d4ddeb] px-4 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
                        />
                      </div>
                    </div>
                  )}

                  {selectedField.type === "date" && (
                    <div className="relative">
                      <label className="mb-2 block text-sm font-semibold text-[#20305c]">Date Restriction</label>
                      <select
                        value={selectedField.dateRestriction || "none"}
                        onChange={(event) =>
                          updateField(selectedSection.id, selectedField.id, (current) => ({
                            ...current,
                            dateRestriction: event.target.value,
                          }))
                        }
                        className="h-11 w-full appearance-none rounded-2xl border border-[#d4ddeb] px-4 pr-10 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
                      >
                        <option value="none">No Restrictions</option>
                        <option value="noFuture">Disable Future Dates (e.g. DOB)</option>
                        <option value="noPast">Disable Past Dates</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-[2.9rem] h-4 w-4 text-[#7c8ba6]" />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 inline-flex items-center gap-3 rounded-2xl border border-[#d4ddeb] bg-white px-4 py-3 text-sm font-semibold text-[#20305c] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedField.required}
                        onChange={(event) =>
                          updateField(selectedSection.id, selectedField.id, (current) => ({
                            ...current,
                            required: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      Required field
                    </label>
                  </div>

                  {(selectedField.type === "select" || selectedField.type === "checkbox" || selectedField.type === "radio") && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#20305c]">options</label>
                      <div className="rounded-2xl border border-[#dfe7ef] bg-white p-4">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                          <span className="text-[11px] text-[#67809b] font-medium">Manage Option Entries</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newOpt = { id: createId("opt"), label: `Option ${selectedField.options.length + 1}` };
                              updateField(selectedSection.id, selectedField.id, (current) => ({
                                ...current,
                                options: [...current.options, newOpt],
                              }));
                            }}
                            className="text-xs font-semibold text-[#245af0] hover:underline cursor-pointer"
                          >
                            Add options
                          </button>
                        </div>
                        <div className="flex flex-col gap-2.5">
                          {selectedField.options.map((option, optIdx) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-1.5 rounded-xl border border-[#d4ddeb] bg-[#fcfdfe] px-2.5 py-1.5"
                            >
                              <span className="text-xs font-bold text-[#68819b]">{optIdx + 1}.</span>
                              <input
                                value={option.label}
                                onChange={(e) => {
                                  updateField(selectedSection.id, selectedField.id, (current) => {
                                    const nextOpts = [...current.options];
                                    nextOpts[optIdx] = { ...nextOpts[optIdx], label: e.target.value };
                                    return { ...current, options: nextOpts };
                                  });
                                }}
                                className="bg-transparent border-none outline-none text-xs text-[#102b55] w-full"
                                placeholder={`Option ${optIdx + 1}`}
                              />
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={optIdx === 0}
                                  onClick={() => {
                                    updateField(selectedSection.id, selectedField.id, (current) => {
                                      const nextOpts = [...current.options];
                                      const temp = nextOpts[optIdx];
                                      nextOpts[optIdx] = nextOpts[optIdx - 1];
                                      nextOpts[optIdx - 1] = temp;
                                      return { ...current, options: nextOpts };
                                    });
                                  }}
                                  className={`text-slate-800 hover:text-[#245af0] transition-colors text-sm font-extrabold px-1 py-0.5 ${optIdx === 0 ? "opacity-25 cursor-not-allowed text-gray-300" : "cursor-pointer"}`}
                                  title="Move Up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  disabled={optIdx === selectedField.options.length - 1}
                                  onClick={() => {
                                    updateField(selectedSection.id, selectedField.id, (current) => {
                                      const nextOpts = [...current.options];
                                      const temp = nextOpts[optIdx];
                                      nextOpts[optIdx] = nextOpts[optIdx + 1];
                                      nextOpts[optIdx + 1] = temp;
                                      return { ...current, options: nextOpts };
                                    });
                                  }}
                                  className={`text-slate-800 hover:text-[#245af0] transition-colors text-sm font-extrabold px-1 py-0.5 ${optIdx === selectedField.options.length - 1 ? "opacity-25 cursor-not-allowed text-gray-300" : "cursor-pointer"}`}
                                  title="Move Down"
                                >
                                  ↓
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  updateField(selectedSection.id, selectedField.id, (current) => ({
                                    ...current,
                                    options: current.options.filter((_, idx) => idx !== optIdx),
                                  }));
                                }}
                                className="text-gray-400 hover:text-[#d12639] transition-colors shrink-0 text-sm font-bold font-sans cursor-pointer"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          {selectedField.options.length === 0 && (
                            <div className="col-span-full py-4 text-center text-xs text-gray-400">
                              No options added yet. Click "Add options".
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#edf2f7] flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (wasOpenedFromList) {
                          setDrawerMode("list");
                        } else {
                          setDrawerOpen(false);
                          setDrawerMode(null);
                        }
                      }}
                      className="flex-1 inline-flex items-center justify-center rounded-2xl border border-[#dfe7ef] bg-white px-4 py-3 text-sm font-semibold text-[#20305c] hover:bg-[#f6f8fb] transition"
                    >
                      Done / Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeField(selectedSection.id, selectedField.id);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#ffd2d7] bg-[#fff4f5] px-4 py-3 text-sm font-semibold text-[#d12639] hover:bg-[#ffebeb] transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Field
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {currentStep === 2 ? (
        <div className="space-y-5">
          <AdminServiceFormPreview draft={draft} />
          <div className="rounded-[28px] border border-[#dfe7ef] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <div className="mb-3 flex items-center gap-2 text-[#245af0]">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Preview Notes</h2>
            </div>
            <p className="text-sm text-[#4f6484]">
              The live preview is styled to reflect the user-facing RTS form experience. You can go back, adjust the
              builder, and return here to review the form layout before saving the service configuration.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 rounded-[28px] border border-[#dfe7ef] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[#5f7290]">
          Step <span className="font-semibold text-[#102b55]">{currentStep + 1}</span> of {STEP_TITLES.length}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setCurrentStep((prev) => Math.max(prev - 1, 0));
            }}
            disabled={currentStep === 0}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              currentStep === 0
                ? "cursor-not-allowed border-[#e5ebf3] bg-[#f6f8fb] text-[#9aa7bc]"
                : "border-[#d4ddeb] bg-white text-[#233a67] hover:bg-[#f6f8fb]"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {currentStep < STEP_TITLES.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#2359f0] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(35,89,240,0.22)]"
            >
              {currentStep === 1 ? (
                <>
                  Preview Form
                  <Eye className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next Step
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,159,152,0.22)] ${
                isSaving ? "cursor-not-allowed bg-[#86cfc9]" : "bg-[#0f9f98]"
              }`}
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Service Form"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
