
"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef, useMemo } from "react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface ServerSelectProps {
  id?: string;
  name: string;
  label?: string;
  options: SelectOption[];
  required?: boolean;
}

export interface SelectProps extends ServerSelectProps {
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

  /** Keep component generic */
  sanitizeInput?: (value: string) => string;
}

export default function SearchSelect({
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
}: SelectProps) {
  const t = useTranslations('common.multiSelect');
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  /* Validate options */
  const validOptions = useMemo(
    () =>
      Array.isArray(options)
        ? options.filter(
            (o) =>
              o &&
              typeof o.label === "string" &&
              typeof o.value === "string"
          )
        : [],
    [options]
  );

  const hasOptions = validOptions.length > 0;

  /* Sync selected value */
  useEffect(() => {
    if (!hasOptions) {
      if (search !== "") Promise.resolve().then(() => setSearch(""));
      return;
    }

    if (forceSearchText !== undefined) {
      Promise.resolve().then(() => {
        setSearch(forceSearchText);
        setHasTyped(false);
      });
      return;
    }

    const selected = validOptions.find((o) => o.value === value);
    if (selected) {
      Promise.resolve().then(() => {
        setSearch(selected.label);
        setHasTyped(false);
      });
    } else {
      Promise.resolve().then(() => setSearch(""));
    }
  }, [value, validOptions, forceSearchText, hasOptions]);

  /* Close on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Filter options */
  const filteredOptions = useMemo(() => {
    if (!hasTyped) return validOptions;

    return validOptions.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, hasTyped, validOptions]);

  /* Select option */
  const handleSelect = (val: string) => {
    const selected = validOptions.find((o) => o.value === val);
    if (!selected) return;

    setSearch(forceSearchText ?? selected.label);
    setIsOpen(false);
    setHasTyped(false);
    setHighlightedIndex(-1);
    onChange(name, val);
  };

  /* Input change */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (sanitizeInput) {
      val = sanitizeInput(val);
    }

    setSearch(val);
    setHasTyped(true);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  /* Keyboard navigation */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        value={search}
        placeholder={
          !hasOptions ? t('noOptionsAvailable') : placeholder
        }
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${name}-listbox`}
        disabled={disabled || !hasOptions}
        inputMode={inputMode}
        onFocus={() => {
          if (hasOptions) setIsOpen(true);
        }}
        onBlur={() => {
          if (!hasOptions) return;

          if (forceSearchText !== undefined) {
            setSearch(forceSearchText);
            setHasTyped(false);
            setIsOpen(false);
            return;
          }

          const matched = validOptions.find(
            (opt) => opt.label === search
          );

          if (!matched) {
            setSearch("");
            setHasTyped(false);
            onChange(name, "");
          }
          setIsOpen(false);
        }}
        onChange={
          forceSearchText !== undefined || !hasOptions
            ? undefined
            : handleInputChange
        }
        onKeyDown={
          forceSearchText !== undefined || !hasOptions
            ? undefined
            : handleKeyDown
        }
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
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={() => handleSelect(opt.value)}
              className={`px-3 py-2 cursor-pointer
                ${
                  index === highlightedIndex
                    ? "bg-blue-200"
                    : "hover:bg-blue-100"
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
