"use client";
import * as React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showClear?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
  tabIndex?: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  ariaLabel?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  inputClassName,
  showClear = true,
  onKeyDown,
  onEnter,
  tabIndex,
  inputRef,
  ariaLabel
}: SearchInputProps) {
  return (
    <div className={cn("relative mb-4 w-[300px]", className)}>
      {/* SEARCH ICON */}
      <MagnifyingGlassIcon
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
      />

      {/* INPUT */}
      <input
        type="text"
        aria-label={ariaLabel}
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onEnter?.();
          }
          onKeyDown?.(e);
        }}
        tabIndex={tabIndex}
        className={cn(`
          w-full rounded-lg border border-gray-300 text-gray-800
          bg-white py-2 pl-10 pr-9 text-sm
          focus:border-blue-500 focus:ring-2 focus:ring-blue-200
          outline-none transition
          `, inputClassName
        )}
      />

      {/* CLEAR BUTTON */}
      {showClear && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
