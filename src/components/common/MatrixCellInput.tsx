 
"use client";
 
import { cn } from "@/lib/utils/cn";
import React from "react";
 
export interface MatrixCellInputProps {
  value: number;
  rowId: string;
  columnId: string;
  metaLabel?: string;
  colorClass?: string;
  className?: string;
  readOnly?: boolean;
  onCellChange?: (rowId: string, columnId: string, value: number) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}
 
export const MatrixCellInput = ({
  value,
  rowId,
  columnId,
  metaLabel,
  colorClass,
  className,
  readOnly = false,
  onCellChange,
  onKeyDown,
}: MatrixCellInputProps): React.ReactElement => {
  // Helper to format value for display — empty string for 0 in edit mode, "0" in read-only
  const formatValue = React.useCallback((val: number): string => {
    if (val === 0) {
      return readOnly ? "0" : "";
    }
    return String(Math.floor(val));
  }, [readOnly]);

  // Safely convert value to number to handle undefined, null, or string values
  const safeValue = typeof value === 'number' && !Number.isNaN(value) ? value : Number(value) || 0;
  
  const [localValue, setLocalValue] = React.useState<string>(
    formatValue(safeValue)
  );
  const [isFocused, setIsFocused] = React.useState(false);
  const previousValueRef = React.useRef<number>(safeValue);
  // Update local value when prop value changes from external source (not from our own edits)
  React.useEffect(() => {
    const currentSafeValue = typeof value === 'number' && !Number.isNaN(value) ? value : Number(value) || 0;
    // Only sync if value actually changed AND we're not focused
    if (!isFocused && currentSafeValue !== previousValueRef.current) {
      setLocalValue(formatValue(currentSafeValue));
    }
    previousValueRef.current = currentSafeValue;
  }, [value, isFocused, formatValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Block decimal points - only allow integers
    if (inputValue.includes(".")) {
      return;
    }

    // Limit to 2 digits max (0-99)
    if (inputValue.length > 2) {
      return;
    }

    setLocalValue(inputValue);
    
    // Convert to number for onCellChange call
    const numValue = inputValue === "" ? 0 : Number(inputValue);
    
    // Ensure we send a valid number to onCellChange
    // Max value is 99 (2 digits)
    const safeNumValue = Number.isNaN(numValue) || numValue < 0 ? 0 : Math.min(numValue, 99);
    
    onCellChange?.(rowId, columnId, safeNumValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format to 2 decimal places on blur if it's a valid number
    const numValue = localValue === "" ? 0 : Number(localValue);
    if (Number.isNaN(numValue)) {
      setLocalValue("");
      onCellChange?.(rowId, columnId, 0);
    } else if (numValue === 0) {
      setLocalValue("");
    } else {
      const clamped = Math.min(Math.floor(numValue), 99);
      setLocalValue(String(clamped));
      if (clamped !== numValue) onCellChange?.(rowId, columnId, clamped);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block characters that create invalid numeric states: -, e, E, +, .
    if (["-", "e", "E", "+", "."].includes(e.key)) {
      e.preventDefault();
    }
    // Call the parent's onKeyDown if provided
    onKeyDown?.(e);
  };
 
  // Determine cell styling based on current input value
  const currentNumValue = localValue === "" ? 0 : Number(localValue);
  const valueBasedClass = currentNumValue > 0
    ? "bg-blue-50 text-blue-800 border-blue-300"
    : "bg-gray-50 text-gray-500 border-gray-200";
 
  return (
<input
      type="number"
      min="0"
      max="99"
      step="1"
      id={`cell-${rowId}-${columnId}`}
      name={`cell-${rowId}-${columnId}`}
      value={localValue}
      aria-label={metaLabel}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="0"
      readOnly={readOnly}
      disabled={readOnly}
      className={cn(
        "px-1 md:px-2 py-1 md:py-1 rounded-md md:rounded-lg font-bold text-xs md:text-sm text-center border w-full outline-none placeholder:text-gray-400",
        readOnly ? "cursor-default" : "focus:ring-2 focus:ring-blue-400",
        valueBasedClass,
        colorClass,
        className
      )}
    />
  );
};
 
 