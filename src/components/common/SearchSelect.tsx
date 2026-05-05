'use client';

import { useTranslations } from 'next-intl';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';

export interface SearchSelectOption {
  label: string;
  value: string;
}

export interface SearchSelectProps {
    /**
     * Optional custom placeholder text when loading.
     */
    loadingPlaceholder?: string;

    /**
     * Optional custom placeholder text when no options are available.
     */
    noOptionsPlaceholder?: string;
  /**
   * Optional id for the input. If not provided, a default will be used.
   */
  id?: string;
  /**
   * Optional name for the input. If not provided, a default will be used.
   */
  name?: string;
  options: SearchSelectOption[];
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  className?: string;

  /* ---------------- Optional configuration ---------------- */

  /**
   * If true, typing is disabled. The component acts as a conventional select
   * but with the improved aesthetics.
   */
  disableSearch?: boolean;

  /**
   * Optional callback triggered when the user types in the input.
   * Useful for triggering external API searches.
   */
  onInputFocus?: () => void;

  /**
   * Optional force display text. Overrides label search logic.
   * Useful when the selected label is not yet in the options list.
   */
  forceSearchText?: string;

  /**
   * If true, shows a spinner.
   */
  isLoading?: boolean;

  /**
   * If true, clears the input when it looses focus and no direct match is found.
   */
  strictMode?: boolean;

  /**
   * If true, marks the input as required.
   */
  required?: boolean;

  /**
   * If true, disables the input.
   */
  disabled?: boolean;

  /**
   * Optional icon to show inside the input.
   */
  icon?: React.ReactNode;

  /**
   * Accessibility label.
   */
  label?: string;

  /**
   * Optional callback for sanitizing the search input.
   */
  sanitizeInput?: (val: string) => string;

  /**
   * Mobile input mode hint.
   */
  inputMode?: 'text' | 'search' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal';
}

export function SearchSelect({
  id,
  name,
  options = [],
  value,
  onChange,
  placeholder = '',
  className,
  disableSearch = false,
  onInputFocus,
  forceSearchText,
  isLoading = false,
  required = false,
  disabled = false,
  label,
  sanitizeInput,
  inputMode = 'text',
  loadingPlaceholder,
  noOptionsPlaceholder,
}: SearchSelectProps): React.ReactElement {
  // Fallback id and name for backward compatibility
  const fallbackId = id || name || 'search-select';
  const fallbackName = name || id || 'search-select';

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hasTyped, setHasTyped] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* ---------------- Safety checks ---------------- */

  const validOptions = useMemo(() => Array.isArray(options) ? options : [], [options]);
  const hasOptions = validOptions.length > 0;

  /* ---------------- Derived display value ---------------- */

  const displayValue = useMemo<string>(() => {
    if (hasTyped) return search;
    if (forceSearchText !== undefined) return forceSearchText;
    if (!hasOptions) return '';
    return validOptions.find((o) => o.value === value)?.label ?? '';
  }, [hasOptions, hasTyped, search, forceSearchText, value, validOptions]);

  /* ---------------- Close on outside click ---------------- */

  useEffect((): (() => void) => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---------------- Scroll highlighted into view ---------------- */

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          inline: 'start',
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  /* ---------------- Filter options ---------------- */

  const filteredOptions = useMemo<SearchSelectOption[]>(() => {
    // If search is disabled, always show all options
    if (disableSearch) return validOptions;
    if (!hasTyped) return validOptions;
    return validOptions.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));
  }, [search, hasTyped, validOptions, disableSearch]);

  /* ---------------- Validate and clear on blur ---------------- */

  const handleBlur = useCallback((): void => {
    setIsOpen(false);
    if (!hasOptions) return;
    const matched = validOptions.find((opt) => opt.label === displayValue);
    if (matched) {
      // If user typed an exact match and blurred, commit it
      if (hasTyped) {
        onChange(fallbackName, matched.value);
      }
    } else {
      setSearch('');
      setHasTyped(false);
      // Only clear value if user actually typed something that doesn't match
      if (hasTyped) {
        onChange(fallbackName, '');
      }
    }
  }, [hasOptions, validOptions, displayValue, fallbackName, onChange, hasTyped]);

  /* ---------------- Select option ---------------- */

  const handleSelect = (val: string): void => {
    const selected = validOptions.find((o) => o.value === val);
    if (!selected) return;
    setSearch(selected.label);
    setHasTyped(false);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(fallbackName, val); // always a string
  };

  /* ---------------- Input change ---------------- */

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // If search is disabled, don't allow typing (read-only behavior)
    if (disableSearch) return;
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
    if (!isOpen && e.key !== 'Escape') {
      setIsOpen(true);
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const opt = filteredOptions[highlightedIndex];
          if (opt) handleSelect(opt.value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  /* ---------------- Render ---------------- */

  const t = useTranslations("common");
  const defaultNoOptionsPlaceholder = t("multiSelect.noOptionsAvailable");

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label htmlFor={fallbackId} className="block text-sm font-medium mb-1 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={fallbackId}
        type="text"
        name={fallbackName}
        value={displayValue}
        placeholder={
          isLoading
            ? loadingPlaceholder || 'Loading...'
            : (!hasOptions
                ? (noOptionsPlaceholder || defaultNoOptionsPlaceholder)
                : placeholder)
        }
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${fallbackName}-listbox`}
        aria-activedescendant={
          highlightedIndex >= 0 ? `${fallbackName}-option-${highlightedIndex}` : undefined
        }
        disabled={disabled}
        inputMode={inputMode}
        onFocus={(e) => {
          e.target.select();
          onInputFocus?.();
          if (hasOptions) setIsOpen(true);
        }}
        onClick={(e) => {
          if (!isOpen && !disabled) {
            setIsOpen(true);
          }
          (e.target as HTMLInputElement).select();
        }}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-lg border border-blue-200 px-2.5 py-1 text-sm bg-white
          focus:ring-2 focus:ring-blue-500 outline-none text-gray-900
          cursor-pointer focus:cursor-text disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className ?? ''}`}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          id={`${fallbackName}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 z-10000 mt-1 max-h-60 overflow-auto
          rounded-lg border bg-white shadow-lg text-gray-900"
        >
          {filteredOptions.map((opt, index) => (
            <li
              key={opt.value}
              id={`${fallbackName}-option-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={() => handleSelect(opt.value)}
              className={`px-3 py-2 cursor-pointer ${index === highlightedIndex ? 'bg-blue-200' : 'hover:bg-blue-100'
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

SearchSelect.displayName = 'SearchSelect';
