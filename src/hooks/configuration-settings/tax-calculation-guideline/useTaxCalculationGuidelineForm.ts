'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  saveTaxCalculationGuidelineAction,
} from '@/app/[locale]/configuration-settings/tax-calculation-guideline/actions';
import { buildInitialFormData } from '@/lib/api/configuration-settings/tax-calculation-guideline/tax-calculation-guideline.mapper';
import type {
  TaxCalculationGuidelineDto,
  TaxCalculationGuidelineFormData,
} from '@/types/tax-calculation-guideline.types';

interface UseTaxCalculationGuidelineFormOptions {
  initialDto: TaxCalculationGuidelineDto | null;
}

/**
 * useTaxCalculationGuidelineForm
 *
 * Manages all form state, field-level change handlers, and the save flow
 * for the CC / OC / Electric Bill – Tax Calculation Guideline screen.
 */
export function useTaxCalculationGuidelineForm({ initialDto }: UseTaxCalculationGuidelineFormOptions) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  /** Keep track of the full API DTO to maintain all metadata */
  const [currentDto, setCurrentDto] = useState<TaxCalculationGuidelineDto | null>(initialDto);

  /** Full form data state */
  const [formData, setFormData] = useState<TaxCalculationGuidelineFormData>(() =>
    buildInitialFormData(initialDto)
  );

  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  // ─── Generic field-level updater ─────────────────────────────────────────

  /**
   * Update a single field within a given section.
   * Typed so callers cannot pass an incompatible value.
   */
  const handleChange = useCallback(
    <S extends keyof TaxCalculationGuidelineFormData, K extends keyof TaxCalculationGuidelineFormData[S]>(
      section: S,
      field: K,
      value: TaxCalculationGuidelineFormData[S][K]
    ) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    },
    []
  );

  // ─── Save handler ─────────────────────────────────────────────────────────

  const handleUpdate = useCallback(async (): Promise<boolean> => {
    if (isSavingRef.current) return false;
    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const response = await saveTaxCalculationGuidelineAction(formData, currentDto);

      if (!response.success) {
        toast.error(response.error ?? 'Failed to save tax calculation guideline');
        return false;
      }

      if (response.data) {
        setCurrentDto(response.data);
      }

      toast.success(response.message ?? 'Tax calculation guideline saved successfully');

      startTransition(() => {
        router.refresh();
      });

      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred');
      return false;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [formData, currentDto, router]);

  return {
    formData,
    isSaving,
    isUpdate: !!currentDto?.id,
    handleChange,
    handleUpdate,
  };
}

export type UseTaxCalculationGuidelineForm = ReturnType<typeof useTaxCalculationGuidelineForm>;
