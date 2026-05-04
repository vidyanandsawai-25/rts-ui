'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';

export interface SearchSelectOption {
  label: string;
  value: string;
}

export interface BaseSearchSelectProps {
  id?: string;
  name?: string;
  label?: string;
  options: SearchSelectOption[];
  required?: boolean;
}

export interface SearchSelectProps extends BaseSearchSelectProps {
  value: string;
  onChange: (name: string | undefined, value: string) => void;
  placeholder?: string;
  className?: string;
  inputMode?: 'search' | 'numeric' | 'none' | 'text' | 'tel' | 'url' | 'email' | 'decimal';
  disabled?: boolean;
  forceSearchText?: string;
  sanitizeInput?: (value: string) => string;
  /** Called when input is focused - useful for triggering data fetch on click */
  onInputFocus?: () => void;
  /** If true, shows 'Loading...' as placeholder */
  isLoading?: boolean;
  /** If true, disables search filtering - shows all options on click like a simple dropdown */
  disableSearch?: boolean;
  /** Localized loading placeholder (optional, for i18n) */
  loadingPlaceholder?: string;
  /** Localized 'no options' placeholder (optional, for i18n) */
  noOptionsPlaceholder?: string;
}

export function SearchSelect({
  id,
  name,
  label,
  options = [],
  value,
  required = false,
  onChange,
  placeholder = '',
  className,
  inputMode,
  disabled = false,
  forceSearchText,
  sanitizeInput,
  onInputFocus,
  isLoading = false,
  disableSearch = false,
  loadingPlaceholder,
  noOptionsPlaceholder,
}: SearchSelectProps) {
  const t = useTranslations('common');
  const [search, setSearch] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasTyped, setHasTyped] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  /** Tracks whether the input is currently focused so the auto-open effect works correctly */
  const isFocused = useRef<boolean>(false);

  /* ---------------- Valid options ---------------- */
  const validOptions = useMemo<SearchSelectOption[]>(() => {
    return Array.isArray(options)
      ? options.filter((o) => o && typeof o.label === 'string' && typeof o.value === 'string')
      : [];
  }, [options]);

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

  /* ---------------- Filter options ---------------- */
  const filteredOptions = useMemo<SearchSelectOption[]>(() => {
    // If search is disabled, always show all options
    if (disableSearch) return validOptions;
    if (!hasTyped) return validOptions;

    return validOptions.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));
  }, [search, hasTyped, validOptions, disableSearch]);

  /* ---------------- Auto-open when options load while input is focused ---------------- */
  useEffect((): (() => void) | void => {
    if (!isLoading && isFocused.current && filteredOptions.length > 0 && !isOpen) {
      const id = setTimeout(() => setIsOpen(true), 0);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, filteredOptions.length]);

  const handleSelect = useCallback(
    (val: string): void => {
      const selected = validOptions.find((o) => o.value === val);
      if (!selected) return;

      setSearch(selected.label);
      setHasTyped(false);
      setIsOpen(false);
      setHighlightedIndex(-1);

      onChange(name, val);
    },
    [validOptions, name, onChange]
  );

  /* ---------------- Validate and clear on blur ---------------- */
  const handleBlur = useCallback((): void => {
    isFocused.current = false;
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (!hasOptions) return;

    const matched = validOptions.find((opt) => opt.label === displayValue);

    if (matched) {
      // ✅ User typed an exact match - commit it to ensure state is synchronized
      if (hasTyped) {
        handleSelect(matched.value);
      }
    } else {
      // ❌ No match - revert to empty and clear selection
      setSearch('');
      setHasTyped(false);
      // Only clear value if user actually typed something that doesn't match
      if (hasTyped) {
        onChange(name, '');
      }
    }
  }, [hasOptions, validOptions, displayValue, handleSelect, hasTyped, onChange, name]);

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

  const accessibleId = name || id || 'search-select';

  /* ---------------- Render ---------------- */
  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        id={id}
        type="text"
        name={name}
        value={displayValue}
        placeholder={
          isLoading
            ? loadingPlaceholder || t('actions.loading') || 'Loading...'
            : !hasOptions && !value && !forceSearchText
              ? noOptionsPlaceholder ||
                t('multiSelect.noOptionsAvailable') ||
                'No options available'
              : placeholder
        }
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen && (filteredOptions.length > 0 || isLoading)}
        aria-controls={
          isOpen && (filteredOptions.length > 0 || isLoading)
            ? `${accessibleId}-listbox`
            : undefined
        }
        aria-activedescendant={
          isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length
            ? `${accessibleId}-option-${highlightedIndex}`
            : undefined
        }
        disabled={disabled}
        inputMode={inputMode}
        onFocus={() => {
          isFocused.current = true;
          onInputFocus?.(); // May trigger async load; auto-open effect handles the delayed case
          // Open immediately if not disabled — covers both "options already loaded" and
          // "first focus before load starts" scenarios. The useEffect above handles the
          // case where options arrive after this focus event fires.
          if (!disabled) {
            setIsOpen(true);
          }
        }}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-lg border border-blue-200 px-2.5 py-1 text-sm bg-white
          focus:ring-2 focus:ring-blue-500 outline-none text-gray-900
          cursor-pointer focus:cursor-text disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className ?? ''}`}
      />

      {isOpen && (filteredOptions.length > 0 || isLoading) && (
        <ul
          id={`${accessibleId}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 z-[100] mt-1 max-h-40 overflow-auto
          rounded-lg bg-white shadow-lg text-gray-900"
        >
          {isLoading && filteredOptions.length === 0 ? (
            <li
              role="option"
              aria-selected={false}
              aria-disabled={true}
              className="px-3 py-2 text-gray-400 italic cursor-default"
            >
              {loadingPlaceholder || t('actions.loading') || 'Loading...'}
            </li>
          ) : (
            filteredOptions.map((opt, index) => (
              <li
                key={opt.value}
                id={`${accessibleId}-option-${index}`}
                role="option"
                aria-selected={opt.value === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt.value);
                }}
                className={`px-3 py-2 cursor-pointer ${
                  index === highlightedIndex ? 'bg-blue-200' : 'hover:bg-blue-100'
                }`}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

SearchSelect.displayName = 'SearchSelect';
