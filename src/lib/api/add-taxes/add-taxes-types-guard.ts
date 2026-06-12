import { AuditJobRow, FinanceYearOption, PropertySearchResult, RuntimePropertyRow, ScopeOption, WardScopeOption } from '@/types/add-taxes.types';

export function isAuditJobRowShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.jobId === 'string' || typeof obj.jobCode === 'string';
}

export function normalizeAuditJobRow(data: Record<string, unknown>): AuditJobRow {
  return {
    jobId: String(data.jobId ?? data.jobCode ?? ''),
    dateTime: String(data.dateTime ?? data.startTime ?? ''),
    operation: String(data.operation ?? ''),
    doneBy: String(data.doneBy ?? ''),
    scope: String(data.scope ?? ''),
    startTime: String(data.startTime ?? ''),
    completeTime: data.completeTime ? String(data.completeTime) : undefined,
    duration: String(data.duration ?? ''),
    records: String(data.records ?? ''),
    status: String(data.status ?? ''),
    remarks: data.remarks ? String(data.remarks) : undefined,
  };
}

export function isYearMasterShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    (typeof obj.id === 'number' || typeof obj.id === 'string') &&
    typeof obj.yearCode === 'string' &&
    obj.yearCode.length > 0
  );
}

export function normalizeYearMasterToOption(data: Record<string, unknown>): FinanceYearOption {
  const yearCode = String(data.yearCode ?? '');
  return {
    value: yearCode,
    label: yearCode,
  };
}

export function isZoneShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (typeof obj.id === 'number' || typeof obj.id === 'string') && obj.isActive === true;
}

export function normalizeZoneToOption(data: Record<string, unknown>): ScopeOption {
  const zoneNo = String(data.zoneNo ?? '');
  const description = String(data.description ?? '');
  return {
    value: String(data.id),
    label: description ? `${zoneNo} — ${description}` : zoneNo,
  };
}

export function isWardShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (typeof obj.id === 'number' || typeof obj.id === 'string') && obj.isActive === true;
}

export function normalizeWardToOption(data: Record<string, unknown>): WardScopeOption {
  const wardNo = String(data.wardNo ?? '');
  const description = String(data.description ?? '');
  return {
    value: String(data.id),
    label: description ? `${wardNo} — ${description}` : wardNo,
    zoneId: String(data.zoneId ?? ''),
  };
}

export function isPropertyTypeGroupShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (typeof obj.id === 'number' || typeof obj.id === 'string') && obj.isActive === true;
}

export function normalizePropertyTypeGroupToOption(data: Record<string, unknown>): ScopeOption {
  return {
    value: String(data.id),
    label: String(data.groupName ?? data.typeOfUseGroupCode ?? ''),
  };
}

export function isPropertySearchShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (typeof obj.id === 'number' || typeof obj.id === 'string') && typeof obj.propertyNo === 'string' && obj.propertyNo.length > 0;
}

export function normalizePropertySearchResult(data: Record<string, unknown>): PropertySearchResult {
  return {
    id: Number(data.id),
    propertyNo: String(data.propertyNo ?? ''),
    ownerName: String(data.ownerName ?? ''),
    mobileNo: String(data.mobileNo ?? ''),
    upicId: String(data.upicId ?? ''),
  };
}

export function isPropertyNoShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.propertyNo === 'string' && obj.propertyNo.length > 0;
}

export function normalizePropertyNoToOption(data: Record<string, unknown>): ScopeOption {
  const propertyNo = String(data.propertyNo ?? '');
  return { value: propertyNo, label: propertyNo };
}

export function isRuntimePropertyRowShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.propertyId === 'number' || typeof obj.propertyId === 'string';
}

export function normalizeRuntimePropertyRow(data: Record<string, unknown>): RuntimePropertyRow {
  return {
    propertyId: Number(data.propertyId ?? 0),
    propertyNo: String(data.propertyNo ?? ''),
    owner: String(data.owner ?? data.ownerName ?? ''),
    taxHead: String(data.taxHead ?? ''),
    amount: Number(data.amount ?? 0),
    status: String(data.status ?? ''),
    message: String(data.message ?? ''),
  };
}
