import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook to manage multi-digit input fields (like Aadhar or Mobile numbers)
 * Handles state, focus management, and keyboard navigation.
 * 
 * Syncs with initialValue and length changes using a useEffect that tracks previous values.
 * Only updates when initialValue or length actually changes, preserving user input otherwise.
 * This prevents out-of-bounds issues when length changes dynamically.
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

  // Track previous initialValue and length to detect actual changes
  const prevInitialValueRef = useRef(initialValue);
  const prevLengthRef = useRef(length);

  // Sync with initialValue or length changes in an effect (runs after render)
  useEffect(() => {
    const sanitizedInitialValue = initialValue.replace(/\D/g, '');
    const prevSanitized = prevInitialValueRef.current.replace(/\D/g, '');

    let needsUpdate = false;
    if (
      sanitizedInitialValue !== prevSanitized ||
      length !== prevLengthRef.current ||
      digits.length !== length
    ) {
      needsUpdate = true;
    }

    if (needsUpdate) {
      // Avoid cascading renders: schedule state update after paint
      setTimeout(() => {
        setDigits(Array.from({ length }, (_, i) => sanitizedInitialValue[i] ?? ''));
        prevInitialValueRef.current = initialValue;
        prevLengthRef.current = length;
      }, 0);
    }
  }, [initialValue, length, digits.length]);

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
