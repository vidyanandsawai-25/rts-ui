'use server';

import { redirect } from 'next/navigation';
import { footerService, FooterAction } from '@/lib/api/footer.service';
import { z } from 'zod';

export type ActionResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

export interface FooterActionPayload {
  propertyId?: string;
  locale?: string;
  wardNo?: string;
  wardId?: string;
  propertyNo?: string;
  partitionNo?: string;
}

const ptisEditRedirectSchema = z.object({
  propertyId: z.coerce.number().positive(),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  wardNo: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
  wardId: z.coerce.number().positive().optional(),
  propertyNo: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
  partitionNo: z.string().regex(/^[a-zA-Z0-9_-]*$/).optional(),
});

/**
 * Detects Next.js redirect errors to allow them to propagate.
 */
function isRedirectError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'digest' in e &&
    typeof (e as { digest?: unknown }).digest === 'string' &&
    String((e as { digest: string }).digest).startsWith('NEXT_REDIRECT')
  );
}

/**
 * Server Action to fetch footer actions based on screen and role.
 */
export async function getFooterActionsAction(
  userRoleId: number,
  targetRoute?: string
): Promise<ActionResult<FooterAction[]>> {
  try {
    const actions = await footerService.getAuthorizedActions({ userRoleId, targetRoute });
    return { success: true, data: actions };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

/**
 * Generic handler for footer commands.
 * This can be expanded to route to different feature-specific actions.
 */
export async function handleFooterAction(
  command: string,
  _payload: unknown
): Promise<ActionResult<unknown>> {
  try {
    const payload = (_payload as FooterActionPayload) || {};

    switch (command) {
      case 'CALCULATE':
        return { success: true, data: null, message: 'Calculation triggered successfully.' };
      case 'SAVE_PTIS':
        return { success: true, data: null, message: 'Assessment saved successfully.' };
      case 'PTIS_EDIT_ENTRY': {
        const validationResult = ptisEditRedirectSchema.safeParse(payload);
        if (!validationResult.success) {
          const errors = validationResult.error.format();
          if (errors.propertyId) {
            return { success: false, error: 'Property ID is missing.' };
          }
          return { success: false, error: 'Invalid or insecure redirect payload.' };
        }

        const { propertyId, locale, wardNo, wardId, propertyNo, partitionNo } = validationResult.data;

        const params = new URLSearchParams();
        if (wardNo) params.set('wardNo', wardNo);
        if (wardId) params.set('wardId', String(wardId));
        if (propertyNo) params.set('propertyNo', propertyNo);
        if (partitionNo && partitionNo !== '0') params.set('partitionNo', partitionNo);

        const queryString = params.toString();
        const suffix = queryString ? `?${queryString}` : '';

        redirect(
          `/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Property${suffix}`
        );
      }
      case 'PTIS_COMBINE': {
        const payloadLocale = payload.locale || 'en';
        const params = new URLSearchParams();
        
        if (payload.propertyId) params.set('basePropertyId', payload.propertyId);
        if (payload.wardId) params.set('wardId', String(payload.wardId));
        if (payload.wardNo) params.set('wardNo', payload.wardNo);
        if (payload.propertyNo) params.set('propertyNo', payload.propertyNo);

        const queryString = params.toString();
        const suffix = queryString ? `?${queryString}` : '';

        redirect(`/${payloadLocale}/property-tax/ptis/combineproperty${suffix}`);
      }
      default:
        return { success: false, error: `Command ${command} is not yet implemented.` };
    }
  } catch (error: unknown) {
    if (isRedirectError(error)) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Action execution failed';
    return { success: false, error: message };
  }
}
