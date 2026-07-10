"use client";

import { CheckCircle, FileCheck, FileText, Home, MapPin, User } from "lucide-react";
import type { AdminServiceFormRecord, BuilderFieldDefinition } from "./types";

type AdminServiceFormPreviewProps = {
  draft: AdminServiceFormRecord;
};

function getSectionIcon(sectionId: string, sectionTitle: string) {
  const id = sectionId.toLowerCase();
  const title = sectionTitle.toLowerCase();

  if (id.includes("applicant") || title.includes("applicant") || title.includes("user")) return User;
  if (id.includes("address") || id.includes("location") || title.includes("address") || title.includes("location")) {
    return MapPin;
  }
  if (id.includes("property") || title.includes("property")) return Home;
  if (id.includes("document") || title.includes("document")) return FileCheck;
  return FileText;
}

function getColSpanClass(colSpan: number) {
  switch (colSpan) {
    case 4:
      return "col-span-1 sm:col-span-2 lg:col-span-4";
    case 3:
      return "col-span-1 sm:col-span-2 lg:col-span-3";
    case 2:
      return "col-span-1 sm:col-span-2 lg:col-span-2";
    default:
      return "col-span-1 sm:col-span-1 lg:col-span-1";
  }
}

function renderPreviewField(field: BuilderFieldDefinition) {
  const commonClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 py-1 text-sm text-gray-700">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-teal-600" />
        <span>{field.label || "Checkbox field"}</span>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        readOnly
        placeholder={field.placeholder || field.label || "Enter value"}
        className={`${commonClass} min-h-[90px]`}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select defaultValue="" className={`${commonClass} h-10`}>
        <option value="">{field.placeholder || `Select ${field.label || "option"}`}</option>
        {field.options.map((option) => (
          <option key={option.id} value={option.label}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "date") {
    return <input type="date" readOnly className={`${commonClass} h-10`} />;
  }

  return (
    <input
      type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
      readOnly
      placeholder={field.placeholder || field.label || "Enter value"}
      className={`${commonClass} h-10`}
    />
  );
}

export default function AdminServiceFormPreview({ draft }: AdminServiceFormPreviewProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#dfe7ef] bg-[#f8fafc] shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
      <div className="border-b border-gray-200 bg-white shadow-xs">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="flex w-full max-w-xl items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <div className="min-w-0 text-center">
                <h2 className="truncate text-sm font-bold text-gray-800 sm:text-lg">
                  {draft.serviceName || "Untitled Service"}
                </h2>
                <p className="mt-1 truncate text-xs text-gray-500">
                  {draft.departmentName || "No department selected"}
                  {draft.description ? ` • ${draft.description}` : ""}
                </p>
              </div>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {draft.sections.map((section, index) => {
              const Icon = getSectionIcon(section.id, section.title);

              return (
                <div
                  key={section.id}
                  className="inline-flex items-center gap-2 rounded-lg border-l-4 border-teal-500 bg-teal-50/70 px-3 py-2 text-teal-700"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold">{section.title || `Section ${index + 1}`}</div>
                    <div className="text-[10px] text-teal-700/80">Section {index + 1}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-56 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4 md:block">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Form Sections</h3>
          <nav className="space-y-1.5">
            {draft.sections.map((section, index) => {
              const Icon = getSectionIcon(section.id, section.title);

              return (
                <div
                  key={section.id}
                  className="flex w-full items-center gap-2.5 rounded-lg border-l-4 border-teal-500 bg-teal-50/70 px-3 py-2.5 text-left text-teal-700"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold">{section.title || `Section ${index + 1}`}</div>
                    <div className="text-[10px] text-gray-500">Section {index + 1}</div>
                  </div>
                  <Icon className="h-3.5 w-3.5 text-teal-600" />
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {draft.sections.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
              Add at least one section with fields to preview the service form.
            </section>
          ) : (
            draft.sections.map((section, index) => {
              const Icon = getSectionIcon(section.id, section.title);

              return (
                <section
                  key={section.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8"
                >
                  <div className="mb-6 flex items-center gap-4 border-b border-teal-100 pb-4">
                    <div className="rounded-lg bg-teal-50 p-3 text-teal-600">
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 sm:text-xl">
                        {section.title || `Section ${index + 1}`}
                      </h3>
                      {section.description ? (
                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">{section.description}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {section.fields.map((field) => (
                      <div key={field.id} className={getColSpanClass(field.colSpan)}>
                        {field.type === "checkbox" ? (
                          <div className="pt-7">{renderPreviewField(field)}</div>
                        ) : (
                          <>
                            <label className="mb-1.5 flex min-w-0 items-center gap-1 text-sm font-medium text-gray-700">
                              <span className="truncate">{field.label || "Untitled Field"}</span>
                              {field.required ? <span className="text-red-600">*</span> : null}
                            </label>
                            {renderPreviewField(field)}
                            {field.helpText ? (
                              <div className="mt-1 text-xs font-medium text-gray-500">{field.helpText}</div>
                            ) : null}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </main>
      </div>

      <div className="border-t border-gray-200 bg-white shadow-md">
        <div className="flex flex-col items-stretch justify-end gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <button
            type="button"
            disabled
            className="flex cursor-not-allowed items-center justify-center rounded-lg border-2 border-teal-500 bg-white px-6 py-3 font-semibold text-teal-700 opacity-60"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled
            className="flex cursor-not-allowed items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-teal-700 px-8 py-3 font-semibold text-white opacity-60"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}
