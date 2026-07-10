"use client";

import { useRef, useState } from "react";
import { CheckCircle, FileCheck, FileText, Home, MapPin, Upload, User, X } from "lucide-react";
import type { AdminServiceFormRecord, BuilderFieldDefinition } from "./types";

type AdminServiceFormPreviewProps = {
  draft: AdminServiceFormRecord;
};

type UploadedFileMeta = {
  name: string;
  size: number;
};

function tokenizeFieldText(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function matchesSpecialField(field: BuilderFieldDefinition, specialType: "aadhar" | "pan") {
  if (field.type === specialType) {
    return true;
  }

  const tokens = [
    ...tokenizeFieldText(field.key),
    ...tokenizeFieldText(field.label),
  ];

  if (specialType === "aadhar") {
    return tokens.includes("aadhar") || tokens.includes("aadhaar");
  }

  return tokens.includes("pan");
}

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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AadhaarInput({
  value,
  onChange,
  hasError
}: {
  value: string;
  onChange: (val: string) => void;
  hasError: boolean;
}) {
  const cleanStr = value.replace(/[^0-9]/g, "");

  const handleInput = (index: number, val: string) => {
    const digit = val.replace(/[^0-9]/g, "").slice(-1);
    if (!digit && val !== "") return;

    const chars = Array.from({ length: 12 }, (_, i) => cleanStr[i] || "");
    chars[index] = digit;

    const nextValStr = chars.join("");
    const formatted = [];
    if (nextValStr.length > 0) formatted.push(nextValStr.slice(0, 4));
    if (nextValStr.length > 4) formatted.push(nextValStr.slice(4, 8));
    if (nextValStr.length > 8) formatted.push(nextValStr.slice(8, 12));
    onChange(formatted.join(" - "));

    if (digit && index < 11) {
      document.getElementById(`aadhar-otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const chars = Array.from({ length: 12 }, (_, i) => cleanStr[i] || "");
      
      if (!chars[index] && index > 0) {
        chars[index - 1] = "";
        const nextValStr = chars.join("");
        const formatted = [];
        if (nextValStr.length > 0) formatted.push(nextValStr.slice(0, 4));
        if (nextValStr.length > 4) formatted.push(nextValStr.slice(4, 8));
        if (nextValStr.length > 8) formatted.push(nextValStr.slice(8, 12));
        onChange(formatted.join(" - "));
        document.getElementById(`aadhar-otp-${index - 1}`)?.focus();
        e.preventDefault();
      } else {
        chars[index] = "";
        const nextValStr = chars.join("");
        const formatted = [];
        if (nextValStr.length > 0) formatted.push(nextValStr.slice(0, 4));
        if (nextValStr.length > 4) formatted.push(nextValStr.slice(4, 8));
        if (nextValStr.length > 8) formatted.push(nextValStr.slice(8, 12));
        onChange(formatted.join(" - "));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`aadhar-otp-${index - 1}`)?.focus();
    } else if (e.key === "ArrowRight" && index < 11) {
      document.getElementById(`aadhar-otp-${index + 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 12);
    if (pastedData) {
      const formatted = [];
      if (pastedData.length > 0) formatted.push(pastedData.slice(0, 4));
      if (pastedData.length > 4) formatted.push(pastedData.slice(4, 8));
      if (pastedData.length > 8) formatted.push(pastedData.slice(8, 12));
      onChange(formatted.join(" - "));
      const nextFocusIndex = Math.min(pastedData.length, 11);
      document.getElementById(`aadhar-otp-${nextFocusIndex}`)?.focus();
    }
  };

  const commonClass = `w-7 h-9 sm:w-9 sm:h-11 rounded-lg border text-center text-sm sm:text-base font-bold text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
    hasError ? "border-red-500 bg-red-50" : "border-gray-300 bg-white focus:border-teal-500 focus:shadow-[0_0_8px_rgba(20,184,166,0.4)]"
  }`;

  const renderDigitInput = (index: number) => {
    const val = cleanStr[index] || "";
    return (
      <input
        key={index}
        id={`aadhar-otp-${index}`}
        type="text"
        maxLength={1}
        value={val}
        onChange={(e) => handleInput(index, e.target.value)}
        onKeyDown={(e) => handleKeyDown(index, e)}
        onPaste={handlePaste}
        placeholder="-"
        className={commonClass}
      />
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 bg-slate-50 p-2 sm:p-3 rounded-xl border border-gray-250 w-fit">
      <div className="flex items-center gap-0.5 sm:gap-1">
        {Array.from({ length: 4 }, (_, i) => renderDigitInput(i))}
      </div>
      <span className="text-gray-400 font-extrabold text-sm sm:text-base px-0.5 sm:px-1 select-none">-</span>
      <div className="flex items-center gap-0.5 sm:gap-1">
        {Array.from({ length: 4 }, (_, i) => renderDigitInput(i + 4))}
      </div>
      <span className="text-gray-400 font-extrabold text-sm sm:text-base px-0.5 sm:px-1 select-none">-</span>
      <div className="flex items-center gap-0.5 sm:gap-1">
        {Array.from({ length: 4 }, (_, i) => renderDigitInput(i + 8))}
      </div>
    </div>
  );
}

function PanInput({
  value,
  onChange,
  hasError
}: {
  value: string;
  onChange: (val: string) => void;
  hasError: boolean;
}) {
  const cleanStr = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  const handleInput = (index: number, val: string) => {
    const char = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-1);
    if (!char && val !== "") return;

    const chars = Array.from({ length: 10 }, (_, i) => cleanStr[i] || "");
    chars[index] = char;

    const nextValStr = chars.join("");
    onChange(nextValStr);

    if (char && index < 9) {
      document.getElementById(`pan-otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const chars = Array.from({ length: 10 }, (_, i) => cleanStr[i] || "");
      
      if (!chars[index] && index > 0) {
        chars[index - 1] = "";
        const nextValStr = chars.join("");
        onChange(nextValStr);
        document.getElementById(`pan-otp-${index - 1}`)?.focus();
        e.preventDefault();
      } else {
        chars[index] = "";
        const nextValStr = chars.join("");
        onChange(nextValStr);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`pan-otp-${index - 1}`)?.focus();
    } else if (e.key === "ArrowRight" && index < 9) {
      document.getElementById(`pan-otp-${index + 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
    if (pastedData) {
      onChange(pastedData);
      const nextFocusIndex = Math.min(pastedData.length, 9);
      document.getElementById(`pan-otp-${nextFocusIndex}`)?.focus();
    }
  };

  const commonClass = `w-7 h-9 sm:w-9 sm:h-11 rounded-lg border text-center text-sm sm:text-base font-bold text-gray-800 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
    hasError ? "border-red-500 bg-red-50" : "border-gray-300 bg-white focus:border-teal-500 focus:shadow-[0_0_8px_rgba(20,184,166,0.4)]"
  }`;

  const renderDigitInput = (index: number) => {
    const val = cleanStr[index] || "";
    return (
      <input
        key={index}
        id={`pan-otp-${index}`}
        type="text"
        maxLength={1}
        value={val}
        onChange={(e) => handleInput(index, e.target.value)}
        onKeyDown={(e) => handleKeyDown(index, e)}
        onPaste={handlePaste}
        placeholder="-"
        className={commonClass}
      />
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 bg-slate-50 p-2 sm:p-3 rounded-xl border border-gray-250 w-fit">
      <div className="flex items-center gap-0.5 sm:gap-1">
        {Array.from({ length: 5 }, (_, i) => renderDigitInput(i))}
      </div>
      <span className="text-gray-400 font-extrabold text-sm sm:text-base px-0.5 sm:px-1 select-none">•</span>
      <div className="flex items-center gap-0.5 sm:gap-1">
        {Array.from({ length: 5 }, (_, i) => renderDigitInput(i + 5))}
      </div>
    </div>
  );
}

export default function AdminServiceFormPreview({ draft }: AdminServiceFormPreviewProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFileMeta>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const validateField = (field: BuilderFieldDefinition, value: string): string | null => {
    if (field.required && !value.trim()) {
      return "Required field";
    }
    if (!value.trim()) return null;

    const isAadhaar = matchesSpecialField(field, "aadhar");
    if (isAadhaar) {
      const clean = value.replace(/[^0-9]/g, "");
      if (clean.length !== 12) {
        return "Aadhaar number must be exactly 12 digits";
      }
      return null;
    }

    const isPan = matchesSpecialField(field, "pan");
    if (isPan) {
      const clean = value.replace(/[^a-zA-Z0-9]/g, "");
      if (clean.length !== 10) {
        return "PAN number must be exactly 10 alphanumeric characters";
      }
      return null;
    }

    if (field.type === "email") {
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!EMAIL_REGEX.test(value)) return "Enter a valid email";
    }
    if (field.type === "tel") {
      const MOBILE_REGEX = /^[6-9]\d{9}$/;
      if (!MOBILE_REGEX.test(value)) return "Enter a valid 10-digit mobile number";
    }

    if (["text", "email", "tel", "textarea"].includes(field.type)) {
      const min = field.min ?? 0;
      const max = field.max ?? 50;
      if (value.length < min) return `Must be at least ${min} characters`;
      if (value.length > max) return `Must be at most ${max} characters`;
    }

    if (field.type === "date" && field.dateRestriction && field.dateRestriction !== "none") {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (field.dateRestriction === "noFuture" && selectedDate > today) {
        return "Future dates not allowed";
      }
      if (field.dateRestriction === "noPast" && selectedDate < today) {
        return "Past dates not allowed";
      }
    }

    return null;
  };

  const handleChange = (field: BuilderFieldDefinition, val: string) => {
    setValues((prev) => ({ ...prev, [field.id]: val }));
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field.id]: err || "" }));
  };

  const handleFileChange = (field: BuilderFieldDefinition, file: File | null) => {
    handleChange(field, file ? file.name : "");
    setUploadedFiles((prev) => {
      if (!file) {
        const next = { ...prev };
        delete next[field.id];
        return next;
      }

      return {
        ...prev,
        [field.id]: {
          name: file.name,
          size: file.size,
        },
      };
    });
  };

  const openFilePicker = (fieldId: string) => {
    fileInputRefs.current[fieldId]?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let isValid = true;

    draft.sections.forEach((sec) => {
      sec.fields.forEach((field) => {
        const val = values[field.id] || "";
        const err = validateField(field, val);
        if (err) {
          newErrors[field.id] = err;
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    if (isValid) {
      alert("Preview validation passed! Form is valid.");
    } else {
      alert("Please fix the highlighted validation errors.");
    }
  };

  const renderPreviewField = (field: BuilderFieldDefinition) => {
    const value = values[field.id] || "";
    const hasError = !!errors[field.id];
    const commonClass = `w-full rounded-md border border-[#c8d2e1] bg-[#f3f4f6] px-3 py-2 text-[13px] text-[#334155] transition placeholder:text-[#9ca3af] focus:border-[#38bdf8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#cdefff] ${
      hasError ? "border-red-500 bg-red-50" : "border-[#c8d2e1] bg-[#f3f4f6]"
    }`;

    const isAadhaar = matchesSpecialField(field, "aadhar");
    if (isAadhaar) {
      return (
        <AadhaarInput
          value={value}
          onChange={(val) => handleChange(field, val)}
          hasError={hasError}
        />
      );
    }

    const isPan = matchesSpecialField(field, "pan");
    if (isPan) {
      return (
        <PanInput
          value={value}
          onChange={(val) => handleChange(field, val)}
          hasError={hasError}
        />
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-2 py-1 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => handleChange(field, e.target.checked ? "true" : "")}
            className="h-4 w-4 rounded border-gray-300 text-teal-655"
          />
          <span>{field.label || "Checkbox field"}</span>
        </label>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          placeholder={field.placeholder || field.label || "Enter value"}
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className={`${commonClass} !bg-white min-h-[88px] resize-y`}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className={`${commonClass} h-10 appearance-none`}
        >
          <option value="">{field.placeholder || `Select ${field.label || "option"}`}</option>
          {field.options.map((option) => (
            <option key={option.id} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "radio") {
      const isFullWidth = field.colSpan === 4;
      return (
        <div className={isFullWidth ? "flex flex-row flex-wrap gap-x-6 gap-y-2 py-1.5" : "flex flex-col gap-2 py-1"}>
          {field.options.map((option) => {
            const isChecked = value === option.label;
            return (
              <label key={option.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer w-fit">
                <input
                  type="radio"
                  name={field.id}
                  value={option.label}
                  checked={isChecked}
                  onChange={() => handleChange(field, option.label)}
                  className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
          {field.options.length === 0 && (
            <span className="text-xs text-gray-400">No options configured.</span>
          )}
        </div>
      );
    }

    if (field.type === "file") {
      const uploadedFile = uploadedFiles[field.id];
      return (
        <div
          role="button"
          tabIndex={0}
          onClick={() => openFilePicker(field.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openFilePicker(field.id);
            }
          }}
          className={[
            "relative overflow-visible rounded-xl border-2 border-dashed transition",
            uploadedFile
              ? "border-[#00c2ff] bg-[#ecfbff]"
              : "border-[#cfd8e3] bg-gray-100 hover:border-[#8fdcf0] hover:bg-[#f8fdff]",
          ].join(" ")}
        >
          <input
            ref={(node) => {
              fileInputRefs.current[field.id] = node;
            }}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleFileChange(field, file ?? null);
            }}
            className="hidden"
          />
          {uploadedFile ? (
            <div className="relative flex min-h-[120px] flex-col items-center justify-center px-6 py-5 text-center">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleFileChange(field, null);
                  const input = fileInputRefs.current[field.id];
                  if (input) {
                    input.value = "";
                  }
                }}
                className="absolute -right-2 -top-2 z-50 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ff4d4f] text-white shadow-sm transition hover:bg-[#e84547]"
                aria-label={`Remove ${uploadedFile.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#00a7d6] text-[#00a7d6]">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="max-w-full truncate text-[13px] font-semibold text-[#007ea7]">
                {uploadedFile.name}
              </div>
              <div className="mt-2 text-[12px] text-[#7b8794]">{formatFileSize(uploadedFile.size)}</div>
            </div>
          ) : (
            <div className="flex min-h-[120px] flex-col items-center justify-center px-6 py-5 text-center">
              <div className="mb-3 text-[#97a3b6]">
                <Upload className="h-8 w-8" />
              </div>
              <div className="text-[13px] font-medium text-[#6b7280]">Click to upload</div>
            </div>
          )}
        </div>
      );
    }

    if (field.type === "date") {
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className={`${commonClass} h-10 appearance-none`}
        />
      );
    }

    return (
      <input
        type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
        placeholder={field.placeholder || field.label || "Enter value"}
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        className={`${commonClass} h-10`}
      />
    );
  };
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

      <div className="min-h-0 flex-1 overflow-hidden">
        <main className="space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
                    {section.fields.map((field) => {
                      return (
                        <div key={field.id} className={getColSpanClass(field.colSpan)}>
                          {field.type === "checkbox" ? (
                            <div className="pt-7">
                              {renderPreviewField(field)}
                              {errors[field.id] && (
                                <div className="mt-1 text-xs font-semibold text-red-500">{errors[field.id]}</div>
                              )}
                            </div>
                          ) : (
                            <>
                              <label className="mb-1.5 flex min-w-0 items-center gap-1 text-sm font-medium text-gray-700">
                                <span className="truncate">{field.label || "Untitled Field"}</span>
                                {field.required ? <span className="text-red-600">*</span> : null}
                              </label>
                              {renderPreviewField(field)}
                              {errors[field.id] ? (
                                <div className="mt-1 text-xs font-semibold text-red-500">{errors[field.id]}</div>
                              ) : field.helpText ? (
                                <div className="mt-1 text-xs font-medium text-gray-500">{field.helpText}</div>
                              ) : null}
                            </>
                          )}
                        </div>
                      );
                    })}
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
            onClick={() => alert("Draft saved successfully (simulation).")}
            className="flex items-center justify-center rounded-lg border-2 border-teal-500 bg-white px-3 py-2 text-[12px] font-semibold text-teal-700 transition cursor-pointer hover:bg-teal-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-teal-700 px-7 py-[9px] text-[12px] font-semibold text-white transition cursor-pointer hover:from-green-600 hover:to-teal-800"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}

