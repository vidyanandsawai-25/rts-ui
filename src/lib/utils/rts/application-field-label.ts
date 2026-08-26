import type { RtsApplicationViewDetailField } from '@/types/rts/application-approval.types';

/** Uses the Marathi field label when supplied by the approval-details response. */
export function getApplicationFieldDisplayLabel(
  field: Pick<RtsApplicationViewDetailField, 'fieldLabel' | 'fieldLabelLocal'>,
  locale: string,
  fallback: string
): string {
  if (locale === 'mr' && field.fieldLabelLocal?.trim()) {
    return field.fieldLabelLocal.trim();
  }

  return field.fieldLabel?.trim() || fallback;
}
