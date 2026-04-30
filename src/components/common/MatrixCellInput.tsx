 
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
  // Safely convert value to number to handle undefined, null, or string values
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : Number(value) || 0;
  
  const [localValue, setLocalValue] = React.useState<string>(
    safeValue === 0 ? "" : safeValue.toFixed(2)
  );
  const [isFocused, setIsFocused] = React.useState(false);
  const previousValueRef = React.useRef<number>(safeValue);

  // Update local value when prop value changes from external source (not from our own edits)
  React.useEffect(() => {
    const currentSafeValue = typeof value === 'number' && !isNaN(value) ? value : Number(value) || 0;
    // Only sync if value actually changed AND we're not focused
    if (!isFocused && currentSafeValue !== previousValueRef.current) {
      setLocalValue(currentSafeValue === 0 ? "" : currentSafeValue.toFixed(2));
    }
    previousValueRef.current = currentSafeValue;
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);
    
    // Convert to number for onCellChange call
    // Type of inputValue from event is always string
    const numValue = inputValue === "" ? 0 : Number(inputValue);
    
    // Ensure we send a valid number to onCellChange
    // Clamp to 0 to prevent negative factors
    const safeNumValue = isNaN(numValue) || numValue < 0 ? 0 : numValue;
    
    onCellChange?.(rowId, columnId, safeNumValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format to 2 decimal places on blur if it's a valid number
    const numValue = localValue === "" ? 0 : Number(localValue);
    if (isNaN(numValue)) {
      // Reset invalid input to empty string
      setLocalValue("");
      onCellChange?.(rowId, columnId, 0);
    } else if (numValue !== 0) {
      setLocalValue(numValue.toFixed(2));
    } else {
      setLocalValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block characters that create invalid numeric states: -, e, E, +
    if (["-", "e", "E", "+"].includes(e.key)) {
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
      step="0.01"
      id={`cell-${rowId}-${columnId}`}
      name={`cell-${rowId}-${columnId}`}
      value={localValue}
      aria-label={metaLabel}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="0.00"
      readOnly={readOnly}
      disabled={readOnly}
      className={cn(
        "px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm text-center border w-full outline-none placeholder:text-gray-400",
        readOnly ? "cursor-default" : "focus:ring-2 focus:ring-blue-400",
        valueBasedClass,
        colorClass,
        className
      )}
    />
  );
};
 
 