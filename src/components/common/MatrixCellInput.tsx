 
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
  /** Allow decimal input (default: true for backward compatibility) */
  allowDecimals?: boolean;
  /** Maximum value allowed (default: 9999) */
  maxValue?: number;
  /** Number of decimal places (default: 2) */
  decimalPlaces?: number;
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
  allowDecimals = true,
  maxValue = 9999,
  decimalPlaces = 2,
  onCellChange,
  onKeyDown,
}: MatrixCellInputProps): React.ReactElement => {
  // Helper to format value for display
  const formatValue = React.useCallback((val: number): string => {
    if (val === 0) {
      return readOnly ? "0" : "";
    }
    if (allowDecimals) {
      // Format with decimal places, removing trailing zeros
      const formatted = val.toFixed(decimalPlaces);
      return formatted;
    }
    return String(Math.floor(val));
  }, [readOnly, allowDecimals, decimalPlaces]);

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

    if (!allowDecimals) {
      // Block decimal points - only allow integers
      if (inputValue.includes(".")) {
        return;
      }
      // Calculate max digits based on maxValue
      const maxDigits = String(maxValue).length;
      if (inputValue.length > maxDigits) {
        return;
      }
    } else {
      // Allow decimals - validate format
      // Check for more than allowed decimal places
      if (inputValue.includes(".")) {
        const parts = inputValue.split(".");
        if (parts[1] && parts[1].length > decimalPlaces) {
          return;
        }
      }
      // Check integer part doesn't exceed maxValue digits
      const intPart = inputValue.split(".")[0];
      const maxDigits = String(Math.floor(maxValue)).length;
      if (intPart.length > maxDigits) {
        return;
      }
    }

    setLocalValue(inputValue);
    
    // Convert to number for onCellChange call
    const numValue = inputValue === "" ? 0 : Number(inputValue);
    
    // Ensure we send a valid number to onCellChange
    const safeNumValue = Number.isNaN(numValue) || numValue < 0 ? 0 : Math.min(numValue, maxValue);
    
    onCellChange?.(rowId, columnId, safeNumValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = localValue === "" ? 0 : Number(localValue);
    if (Number.isNaN(numValue)) {
      setLocalValue("");
      onCellChange?.(rowId, columnId, 0);
    } else if (numValue === 0) {
      setLocalValue("");
    } else {
      const clamped = Math.min(allowDecimals ? numValue : Math.floor(numValue), maxValue);
      setLocalValue(allowDecimals ? clamped.toFixed(decimalPlaces) : String(clamped));
      if (clamped !== numValue) onCellChange?.(rowId, columnId, clamped);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block characters that create invalid numeric states: -, e, E, +
    const blockedKeys = ["-", "e", "E", "+"];
    // Also block decimal point if decimals not allowed
    if (!allowDecimals) {
      blockedKeys.push(".");
    }
    if (blockedKeys.includes(e.key)) {
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

  const stepValue = allowDecimals ? Math.pow(10, -decimalPlaces) : 1;
  const placeholderValue = "0";
 
  return (
<input
      type="number"
      min="0"
      max={maxValue}
      step={stepValue}
      id={`cell-${rowId}-${columnId}`}
      name={`cell-${rowId}-${columnId}`}
      value={localValue}
      aria-label={metaLabel}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholderValue}
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
 
 