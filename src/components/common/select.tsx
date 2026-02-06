
"use client";
import React, { useState, useRef, useCallback, useId } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: Option[];
  value?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  selectSize?: "sm" | "md";
  disabled?: boolean;
  id?: string;
  name?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  selectSize = "md",
  disabled = false,
  id,
  name,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | null>(value ?? null);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Find the index of the selected value
  const selectedIndex = options.findIndex((opt) => opt.value === internalValue);

  // Find the first enabled option index
  const getFirstEnabledIndex = (): number => {
    return options.findIndex((opt) => !opt.disabled);
  };

  // Handle selection
  const handleSelect = useCallback(
    (val: string) => {
      setInternalValue(val);
      setOpen(false);
      setHighlightedIndex(-1);
      onChange?.(val);
      // Focus back to button after selection
      buttonRef.current?.focus();
    },
    [onChange]
  );

  // Keyboard navigation
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement | HTMLUListElement>) => {
    if (disabled) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        setOpen(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          const initialIndex = selectedIndex >= 0 && !options[selectedIndex]?.disabled
            ? selectedIndex
            : getFirstEnabledIndex();
          setHighlightedIndex(initialIndex);
        }, 0);
        e.preventDefault();
      }
      return;
    }
    // Only reach here if open === true
    if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
      buttonRef.current?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      // Prevent infinite loop if all options are disabled
      if (options.every((opt) => opt.disabled)) {
        e.preventDefault();
        return;
      }
      let next = highlightedIndex + 1;
      while (next < options.length && options[next].disabled) { next++; }
      if (next >= options.length) next = 0;
      let count = 0;
      while (options[next].disabled) {
        next = (next + 1) % options.length;
        count++;
        if (count > options.length) break;
      }
      setHighlightedIndex(next);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      // Prevent infinite loop if all options are disabled
      if (options.every((opt) => opt.disabled)) {
        e.preventDefault();
        return;
      }
      let prev = highlightedIndex - 1;
      while (prev >= 0 && options[prev].disabled) { prev--; }
      if (prev < 0) prev = options.length - 1;
      let count = 0;
      while (options[prev].disabled) {
        prev = (prev - 1 + options.length) % options.length;
        count++;
        if (count > options.length) break;
      }
      setHighlightedIndex(prev);
      e.preventDefault();
    } else if (e.key === "Enter" || e.key === " ") {
      if (highlightedIndex >= 0 && !options[highlightedIndex].disabled) {
        handleSelect(options[highlightedIndex].value);
      }
      e.preventDefault();
    }
  };
  // Cleanup for setTimeout in handleKeyDown
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Keep internal value in sync with prop
  React.useEffect(() => {
    setInternalValue(value ?? null);
  }, [value]);

  // Reset highlight when menu closes
  React.useEffect(() => {
    if (!open) setHighlightedIndex(-1);
  }, [open]);

  // Focus the highlighted option when open
  React.useEffect(() => {
    if (open && highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, open]);

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
  };

  // For ARIA: always provide a valid id
  const reactId = useId();
  const listboxId = `${id ?? reactId}-listbox`;

  // Placeholder logic: treat null/undefined as no value
  const displayLabel =
    internalValue == null
      ? placeholder
      : options.find((opt) => opt.value === internalValue)?.label ?? placeholder;

  // Blur handler: close only if focus leaves the whole widget
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!selectRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Click handler for option
  const handleOptionClick = (opt: Option, _idx: number) => {
    if (!opt.disabled) {
      handleSelect(opt.value);
    }
  };

  // Mouse enter: highlight option
  const handleOptionMouseEnter = (idx: number) => {
    setHighlightedIndex(idx);
  };

  return (
    <div
      ref={selectRef}
      className={cn(
        "relative w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onBlur={handleBlur}
      data-testid="select-root"
    >
      {/* Hidden input for form integration */}
      {name && (
        <input type="hidden" name={name} value={internalValue ?? ""} data-testid="select-hidden-input" />
      )}
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
        className={cn(
          "flex items-center justify-between w-full border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all",
          sizeClasses[selectSize],
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        tabIndex={0}
        data-testid="select-button"
      >
        <span className="truncate text-left flex-1">
          {displayLabel}
        </span>
        <ChevronDownIcon className="ml-2 w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          className="absolute z-40 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
          tabIndex={-1}
          aria-labelledby={id}
          onKeyDown={handleKeyDown}
          data-testid="select-listbox"
        >
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              id={`${listboxId}-option-${idx}`}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-blue-50",
                internalValue === opt.value && "bg-blue-100 text-blue-700",
                highlightedIndex === idx && "bg-blue-200",
                opt.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleOptionClick(opt, idx)}
              onMouseEnter={() => handleOptionMouseEnter(idx)}
              aria-selected={internalValue === opt.value}
              aria-disabled={opt.disabled}
              role="option"
              tabIndex={-1}
              data-testid={`select-option-${idx}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
