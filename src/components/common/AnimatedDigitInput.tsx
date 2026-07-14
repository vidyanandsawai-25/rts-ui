"use client";

import React, { useId, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface AnimatedDigitInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  allowedPattern?: RegExp;
  charClassName?: string;
}

export const AnimatedDigitInput = React.forwardRef<HTMLInputElement, AnimatedDigitInputProps>(
  ({ value, onChange, maxLength, placeholder = '', allowedPattern = /^[0-9]$/, charClassName, className, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = props.id || `animated-digit-input-${generatedId}`;
    
    const [lastTypedIndex, setLastTypedIndex] = useState<number>(-1);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawVal = e.target.value;
      const prevVal = value;
      
      // Filter characters based on allowed pattern
      let filtered = '';
      for (const char of rawVal) {
        if (allowedPattern.test(char)) {
          filtered += char;
        }
      }
      filtered = filtered.slice(0, maxLength);

      if (filtered.length > prevVal.length) {
        setLastTypedIndex(filtered.length - 1);
      } else {
        setLastTypedIndex(-1);
      }

      onChange(filtered);
    };

    const isCentered = className?.includes('text-center');

    return (
      <div className={cn(
        "relative w-full h-9 rounded-lg border border-gray-300 hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 overflow-hidden flex items-center transition-all duration-200",
        disabled ? "bg-gray-100/80 cursor-not-allowed grayscale" : "bg-white",
        className
      )}>
        {/* Hidden but functional real input overlaying the whole field */}
        <input
          {...props}
          id={inputId}
          ref={ref}
          type="text"
          maxLength={maxLength}
          value={value}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
            if (!allowedPattern.test(e.key) && !controlKeys.includes(e.key)) {
              e.preventDefault();
            }
            props.onKeyDown?.(e);
          }}
          onFocus={(e) => {
            e.target.select();
            props.onFocus?.(e);
          }}
          autoComplete="off"
          disabled={disabled}
          className={cn(
            "absolute inset-0 w-full h-full text-transparent caret-blue-600 bg-transparent cursor-text z-10 text-sm font-semibold focus:outline-none",
            isCentered ? "text-center px-0 tracking-[2px]" : "px-3 tracking-[2px]",
            disabled && "cursor-not-allowed"
          )}
        />
        
        {/* Visual representation of characters */}
        <div className={cn(
          "absolute inset-0 flex items-center gap-0.5 pointer-events-none select-none",
          isCentered ? "justify-center" : "px-3"
        )}>
          {value.length === 0 ? (
            <span className={cn("text-gray-400 text-sm font-normal", charClassName)}>{placeholder}</span>
          ) : (
            value.split('').map((char, index) => {
              const shouldAnimate = index === lastTypedIndex;
              return (
                <span
                  key={`${index}-${char}`}
                  className={cn(
                    "inline-block text-sm font-semibold text-gray-800",
                    charClassName,
                    shouldAnimate && "animate-digit-pop"
                  )}
                >
                  {char}
                </span>
              );
            })
          )}
        </div>
      </div>
    );
  }
);

AnimatedDigitInput.displayName = 'AnimatedDigitInput';
