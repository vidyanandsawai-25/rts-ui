import { useState, useRef, useCallback } from 'react';

/**
 * Hook to manage multi-digit input fields (like Aadhar or Mobile numbers)
 * Handles state, focus management, and keyboard navigation.
 * 
 * Syncs with initialValue and length changes using render-phase comparison.
 * Only updates when initialValue or length actually changes, preserving user input otherwise.
 * This prevents out-of-bounds issues when length changes dynamically.
 * Uses the same pattern as useLinkWardPagination for prop-to-state sync.
 * 
 * @param length The number of digits/inputs
 * @param initialValue Initial string value
 * @returns State and handlers for the digit inputs
 */
export const useDigitInputs = (length: number, initialValue: string = '') => {
  const [digits, setDigits] = useState<string[]>(() => {
    const sanitized = initialValue.replace(/\D/g, '');
    return Array.from({ length }, (_, i) => sanitized[i] ?? '');
  });

  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const [prevLength, setPrevLength] = useState(length);

  // Sync with initialValue or length changes in render phase
  const sanitizedInitialValue = initialValue.replace(/\D/g, '');
  const prevSanitized = prevInitialValue.replace(/\D/g, '');
  
  if (
    sanitizedInitialValue !== prevSanitized || 
    length !== prevLength ||
    digits.length !== length
  ) {
    setPrevInitialValue(initialValue);
    setPrevLength(length);
    const newDigits = Array.from({ length }, (_, i) => sanitizedInitialValue[i] ?? '');
    setDigits(newDigits);
  }

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback((index: number, value: string) => {
    const val = value.replace(/\D/g, '').slice(-1);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });

    // Move focus forward if a digit is entered
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [length]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move focus backward on backspace if current field is empty
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  const setRef = useCallback((index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  }, []);

  return {
    digits,
    setDigits,
    handleChange,
    handleKeyDown,
    setRef,
    value: digits.join(''),
  };
};
