import React, { useId } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Input component with label, error, and helper text support
 * Follows accessibility best practices
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, fullWidth = false, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'px-3 py-2 border rounded-lg text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400',
            disabled && 'bg-gray-100 cursor-not-allowed opacity-50',
            fullWidth && 'w-full',
            className
          )}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
