
import React, { useState, useRef } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  selectSize?: "sm" | "md";
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  selectSize = "md",
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value || "");
  const selectRef = useRef<HTMLDivElement>(null);

  const handleSelect = (val: string) => {
    setInternalValue(val);
    setOpen(false);
    onChange?.(val);
  };

  React.useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
  };

  return (
    <div
      ref={selectRef}
      className={cn(
        "relative w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      tabIndex={0}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "flex items-center justify-between w-full border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all",
          sizeClasses[selectSize],
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
      >
        <span className="truncate text-left flex-1">
          {options.find((opt) => opt.value === internalValue)?.label || placeholder}
        </span>
        <ChevronDownIcon className="ml-2 w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <ul
          className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-blue-50",
                internalValue === opt.value && "bg-blue-100 text-blue-700",
                opt.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !opt.disabled && handleSelect(opt.value)}
              aria-selected={internalValue === opt.value}
              role="option"
              tabIndex={-1}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
