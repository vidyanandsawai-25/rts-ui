"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

export interface SearchSelectOption {
  label: string;
  value: string;
}

export interface BaseSearchSelectProps  {
  id?: string;
  name: string;
  label?: string;
  options: SearchSelectOption[];
  required?: boolean;
}

export interface SearchSelectProps extends BaseSearchSelectProps  {
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  className?: string;
  inputMode?:
    | "search"
    | "numeric"
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "decimal";
  disabled?: boolean;
  forceSearchText?: string;
  sanitizeInput?: (value: string) => string;
}

export function SearchSelect({
  id,
  name,
  label,
  options = [],
  value,
  required = false,
  onChange,
  placeholder = "",
  className,
  inputMode,
  disabled = false,
  forceSearchText,
  sanitizeInput,
}: SearchSelectProps) {
  const t = useTranslations("common.multiSelect");

  const [search, setSearch] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasTyped, setHasTyped] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  /* ---------------- Valid options ---------------- */
  const validOptions = useMemo<SearchSelectOption[]>(() => {
    return Array.isArray(options)
      ? options.filter(
          (o) => o && typeof o.label === "string" && typeof o.value === "string"
        )
      : [];
  }, [options]);

  const hasOptions = validOptions.length > 0;

  /* ---------------- Derived display value ---------------- */
  const displayValue = useMemo<string>(() => {
    if (!hasOptions) return "";
    if (hasTyped) return search;
    if (forceSearchText !== undefined) return forceSearchText;

    return validOptions.find((o) => o.value === value)?.label ?? "";
  }, [hasOptions, hasTyped, search, forceSearchText, value, validOptions]);

  /* ---------------- Close on outside click ---------------- */
  useEffect((): (() => void) => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- Filter options ---------------- */
  const filteredOptions = useMemo<SearchSelectOption[]>(() => {
    if (!hasTyped) return validOptions;

    return validOptions.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, hasTyped, validOptions]);

  /* ---------------- Validate and clear on blur ---------------- */
  const handleBlur = useCallback((): void => {
    if (!hasOptions) return;

    const matched = validOptions.find((opt) => opt.label === displayValue);

    if (!matched) {
      setSearch("");
      setHasTyped(false);
      onChange(name, "");
    }

    setIsOpen(false);
  }, [hasOptions, validOptions, displayValue, name, onChange]);

  /* ---------------- Select option ---------------- */
  const handleSelect = (val: string): void => {
    const selected = validOptions.find((o) => o.value === val);
    if (!selected) return;

    setSearch(selected.label);
    setHasTyped(false);
    setIsOpen(false);
    setHighlightedIndex(-1);

    onChange(name, val); // safe call
  };

  /* ---------------- Input change ---------------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let val = e.target.value;
    if (sanitizeInput) val = sanitizeInput(val);

    setSearch(val);
    setHasTyped(true);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  /* ---------------- Keyboard navigation ---------------- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (!hasOptions) return;

    if (!isOpen && e.key !== "Escape") {
      setIsOpen(true);
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, filteredOptions.length - 1)
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const opt = filteredOptions[highlightedIndex];
          if (opt) handleSelect(opt.value);
        }
        break;

      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium mb-1 text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        id={id}
        type="text"
        name={name}
        value={displayValue}
        placeholder={!hasOptions ? t("noOptionsAvailable") : placeholder}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${name}-listbox`}
        aria-activedescendant={
          highlightedIndex >= 0 ? `${name}-option-${highlightedIndex}` : undefined
        }
        disabled={disabled || !hasOptions}
        inputMode={inputMode}
        onFocus={() => hasOptions && setIsOpen(true)}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-lg border border-blue-200 px-2.5 py-1 text-sm bg-white
          focus:ring-2 focus:ring-blue-500 outline-none text-gray-900
          cursor-pointer focus:cursor-text disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className ?? ""}`}
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul
          id={`${name}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto
            rounded-lg border bg-white shadow-lg text-gray-900"
        >
          {filteredOptions.map((opt, index) => (
            <li
              key={opt.value}
              id={`${name}-option-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={() => handleSelect(opt.value)}
              className={`px-3 py-2 cursor-pointer ${
                index === highlightedIndex ? "bg-blue-200" : "hover:bg-blue-100"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

SearchSelect.displayName = "SearchSelect";
