'use server';

/**
 * actions.ts — Server Actions for citizen service form pages.
 *
 * ─── DB Integration Guide (for dev team) ────────────────────────────────────
 * All data fetching is done via `lib/api/rts-citizen.api.ts`.
 * Set env vars to switch from mock → real API:
 *
 *   NEXT_PUBLIC_USE_REAL_API=true
 *   NEXT_PUBLIC_API_BASE_URL=https://your-api.domain.com
 *
 * Draft / Submit actions still use local mock (in-memory) —
 * replace the `createDraftLocal`, `saveDraftValuesLocal`, `submitApplicationLocal`
 * calls below with real API calls when backend is ready.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
  CreateDraftRequest,
  SaveDraftValuesRequest,
  SubmitRequest,
} from '@/types/rts.types';

import {
  createDraftLocal,
  getApplicationLocal,
  saveDraftValuesLocal,
  submitApplicationLocal,
} from '@/lib/mock/ui-only';

import {
  fetchServiceMeta,
  fetchServiceFormFields,
} from '@/lib/api/rts-citizen.api';

import type { ServiceMetaDTO, ServiceFieldGroupDTO } from '@/types/rts-citizen.types';

// ── Service Metadata ─────────────────────────────────────────────────────────

/**
 * Returns service metadata (name, department, SLA, fee).
 * TODO: Backed by rts-citizen.api.ts → switch NEXT_PUBLIC_USE_REAL_API=true
 */
export async function getServiceMapSSR(serviceId: string): Promise<ServiceMetaDTO> {
  return fetchServiceMeta(serviceId);
}

// ── Dynamic Form Fields ──────────────────────────────────────────────────────

/**
 * Returns dynamic form field groups for a service.
 * Field labels, placeholders, options — all i18n (en/hi/mr).
 * TODO: Backed by rts-citizen.api.ts → switch NEXT_PUBLIC_USE_REAL_API=true
 */
export async function getServiceFieldsSSR(serviceId: string): Promise<ServiceFieldGroupDTO[]> {
  return fetchServiceFormFields(serviceId);
}

// ── Draft & Submit (replace with real API when backend ready) ────────────────

/**
 * Creates a new draft application.
 * TODO: Replace with → POST /api/rts/applications/draft
 */
export async function createDraftSSR(payload: CreateDraftRequest) {
  return createDraftLocal(payload);
}

/**
 * Saves draft field values.
 * TODO: Replace with → PATCH /api/rts/applications/{applicationId}/draft-values
 */
export async function saveDraftValuesSSR(applicationId: number, payload: SaveDraftValuesRequest) {
  return saveDraftValuesLocal(applicationId, payload);
}

/**
 * Fetches an existing application.
 * TODO: Replace with → GET /api/rts/applications/{applicationId}
 */
export async function getApplicationSSR(applicationId: number) {
  return getApplicationLocal(applicationId);
}

/**
 * Final submission.
 * TODO: Replace with → POST /api/rts/applications/{applicationId}/submit
 */
export async function submitApplicationSSR(applicationId: number, payload: SubmitRequest) {
  return submitApplicationLocal(applicationId, payload);
}
