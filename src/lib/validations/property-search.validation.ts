/**
 * Property Search (Property Tax → Search Property) validation rules.
 * Validates only fields that have a value — empty optional fields are skipped.
 */

import { hasTabSearchInput } from "@/components/modules/property-tax/search-property/search-field-groups";
import type {
  PropertyStatus,
  SearchCriteria,
  SearchTab,
  SearchValidationKey,
  SearchValidationResult,
} from "@/types/property-search.types";
import {
  getPropertySearchFieldErrors,
  hasPropertySearchFieldErrors,
  trimFieldValue,
  type PropertySearchValidationTranslator,
} from "./property-search-field-rules";

export type { PropertySearchValidationTranslator };

function fail(
  key: SearchValidationKey,
  t: PropertySearchValidationTranslator
): SearchValidationResult {
  return { valid: false, message: t(key) };
}

function normalizeCriteria(criteria: SearchCriteria): SearchCriteria {
  const next = { ...criteria };

  for (const key of Object.keys(next) as Array<keyof SearchCriteria>) {
    const value = next[key];
    if (typeof value === "string") {
      (next[key] as string) = trimFieldValue(value);
    }
  }

  return next;
}

export function validatePropertySearchCriteria(
  criteria: SearchCriteria,
  tab: SearchTab,
  t: PropertySearchValidationTranslator,
  selectedStatus: PropertyStatus | null = null
): SearchValidationResult {
  const normalized = normalizeCriteria(criteria);
  const fieldErrors = getPropertySearchFieldErrors(normalized, tab, t);

  if (hasPropertySearchFieldErrors(fieldErrors)) {
    const firstMessage = Object.values(fieldErrors)[0];
    return { valid: false, message: firstMessage ?? t("noSearchCriteria") };
  }

  if (tab === "values-dues") {
    const filter = normalized.rateableValueFilter;
    if (filter === "between") {
      if (!normalized.rateableValueFrom || !normalized.rateableValueTo) {
        return fail("rateableValueBetweenRequired", t);
      }
    } else if (filter === "top") {
      if (!normalized.rateableValueFrom) {
        return fail("rateableValueInvalid", t);
      }
    } else if (filter === "exact" || filter === "moreThan" || filter === "lessThan") {
      if (!normalized.rateableValueFrom) {
        return fail("rateableValueInvalid", t);
      }
    }
  }

  if (!hasTabSearchInput(normalized, tab) && !selectedStatus) {
    return fail("noSearchCriteria", t);
  }

  return { valid: true };
}
