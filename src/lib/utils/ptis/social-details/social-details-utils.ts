import type {
  CreatePropertySocialDetailDto,
  UpdatePropertySocialDetailDto,
  DeletePropertySocialDetailsByHierarchyParams,
  PropertySocialDetailsDto,
} from '@/types/property-social-details.types';
import type { PropertySocialDetailItem } from '@/types/ptis-core.types';
import type { SocialAttribute } from '@/types/social-attribute.types';

export const ENTITY_TYPE = {
  SOCIETY: 'S',
  WING: 'W',
  PROPERTY: 'P',
} as const;

export type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];

export const LEVEL_NAMES = {
  APARTMENT: 'Apartment',
  WING: 'Wing',
  UNIT: 'Unit',
} as const;

export type ScopeLevel = (typeof LEVEL_NAMES)[keyof typeof LEVEL_NAMES];

/**
 * Resolves entityType and hierarchy IDs based on level, selection, wingId, unitIds, etc.
 * Strictly adheres to backend entity types: 'S' (Society), 'W' (Wing), 'P' (Property/Unit).
 */
export function resolveScope({
  level,
  isAllUnitsSelected = false,
  wingDetailId = null,
  unitIds = [],
  societyDetailId = null,
  propertyId = null,
}: {
  level?: string | null;
  isAllUnitsSelected?: boolean;
  wingDetailId?: number | null;
  unitIds?: number[];
  societyDetailId?: number | null;
  propertyId?: number | null;
}): {
  entityType: EntityType;
  propertyId: number | null;
  wingDetailId: number | null;
  societyDetailId: number | null;
} {
  const normLevel = String(level || 'Apartment').trim().toLowerCase();

  if (normLevel === 'wing') {
    return {
      entityType: ENTITY_TYPE.WING,
      propertyId: null,
      wingDetailId: wingDetailId ? Number(wingDetailId) : null,
      societyDetailId: societyDetailId ? Number(societyDetailId) : null,
    };
  }

  if (normLevel === 'unit') {
    if (isAllUnitsSelected) {
      // When all units in a wing are selected, promote to wing-level record
      return {
        entityType: ENTITY_TYPE.WING,
        propertyId: null,
        wingDetailId: wingDetailId ? Number(wingDetailId) : null,
        societyDetailId: societyDetailId ? Number(societyDetailId) : null,
      };
    }
    const singleUnitPropId =
      unitIds && unitIds.length === 1
        ? unitIds[0]
        : propertyId
          ? Number(propertyId)
          : null;
    return {
      entityType: ENTITY_TYPE.PROPERTY,
      propertyId: singleUnitPropId,
      wingDetailId: wingDetailId ? Number(wingDetailId) : null,
      societyDetailId: societyDetailId ? Number(societyDetailId) : null,
    };
  }

  return {
    entityType: ENTITY_TYPE.SOCIETY,
    propertyId: null,
    wingDetailId: null,
    societyDetailId: societyDetailId ? Number(societyDetailId) : null,
  };
}

/**
 * Determines the scope level ('Apartment' | 'Wing' | 'Unit') of a record dynamically.
 * Rule order:
 * 1. entityType: 'S' -> 'Apartment', 'W' -> 'Wing', 'P' -> 'Unit'
 * 2. level property ('apartment' | 'society' -> 'Apartment', 'wing' -> 'Wing', 'unit' -> 'Unit')
 * 3. structural IDs (unitNo -> 'Unit', wingDetailId > 0 -> 'Wing', propertyId > 0 && propertyId !== societyDetailId -> 'Unit')
 * 4. Default -> 'Apartment'
 */
export function getItemLevel(item?: {
  entityType?: string | null;
  level?: string | null;
  unitNo?: string | number | null;
  wingDetailId?: number | null;
  propertyId?: number | null;
  societyDetailId?: number | null;
} | null): ScopeLevel {
  if (!item) return LEVEL_NAMES.APARTMENT;

  const entityType = String(item.entityType || '').trim().toUpperCase();
  if (entityType === ENTITY_TYPE.PROPERTY) return LEVEL_NAMES.UNIT;
  if (entityType === ENTITY_TYPE.WING) return LEVEL_NAMES.WING;
  if (entityType === ENTITY_TYPE.SOCIETY) return LEVEL_NAMES.APARTMENT;

  const lvl = String(item.level || '').trim().toLowerCase();
  if (lvl === 'unit') return LEVEL_NAMES.UNIT;
  if (lvl === 'wing') return LEVEL_NAMES.WING;
  if (item.unitNo && String(item.unitNo).trim() !== '') return LEVEL_NAMES.UNIT;

  // Specificity order: Unit (has propertyId distinct from societyDetailId) -> Wing (has wingDetailId) -> Apartment
  if (
    item.propertyId &&
    Number(item.propertyId) > 0 &&
    (!item.societyDetailId || Number(item.propertyId) !== Number(item.societyDetailId))
  ) {
    return LEVEL_NAMES.UNIT;
  }

  if (item.wingDetailId && Number(item.wingDetailId) > 0) return LEVEL_NAMES.WING;

  return LEVEL_NAMES.APARTMENT;
}

/**
 * Checks if a property social detail item is configured / has a non-empty value.
 */
export function isConfigured(item?: {
  isActive?: boolean | null;
  bitValue?: boolean | number | string | null;
  intValue?: number | string | null;
  decimalValue?: number | string | null;
  textValue?: string | null;
  dateValue?: string | null;
  documentBindingId?: number | null;
  documentGuid?: string | null;
  percentage?: number | null;
  amount?: number | null;
  remark?: string | null;
} | null): boolean {
  if (!item) return false;
  if (item.isActive === false) return false;

  const isBitTrue =
    item.bitValue === true ||
    (item.bitValue as unknown) === 1 ||
    String(item.bitValue).trim().toLowerCase() === 'true' ||
    String(item.bitValue).trim() === '1';

  const hasInt =
    item.intValue !== null &&
    item.intValue !== undefined &&
    item.intValue !== '' &&
    Number(item.intValue) > 0;

  const hasDec =
    item.decimalValue !== null &&
    item.decimalValue !== undefined &&
    item.decimalValue !== '' &&
    Number(item.decimalValue) > 0;

  const hasText =
    item.textValue !== null &&
    item.textValue !== undefined &&
    item.textValue.trim() !== '' &&
    item.textValue.trim().toLowerCase() !== 'string' &&
    item.textValue.trim() !== '-';

  const hasDate = Boolean(item.dateValue && item.dateValue.trim() !== '');
  const hasDoc = Boolean(item.documentBindingId || item.documentGuid);
  const hasPercent =
    item.percentage !== null &&
    item.percentage !== undefined &&
    Number(item.percentage) > 0;
  const hasAmount =
    item.amount !== null && item.amount !== undefined && Number(item.amount) > 0;

  const hasUserRemark =
    Boolean(item.remark?.trim()) &&
    item.remark?.trim().toLowerCase() !== 'null' &&
    item.remark?.trim().toLowerCase() !== 'undefined' &&
    item.remark?.trim().toLowerCase() !== 'string';

  return (
    isBitTrue ||
    hasInt ||
    hasDec ||
    hasText ||
    hasDate ||
    hasDoc ||
    hasPercent ||
    hasAmount ||
    hasUserRemark
  );
}

/**
 * Maps a raw social details record to a strongly-typed PropertySocialDetailItem.
 */
export function normalizeToItem(
  raw: Record<string, unknown> | PropertySocialDetailsDto,
  master?: SocialAttribute | null,
  resolvedContext?: {
    resolvedPropertyId?: number;
    societyDetailId?: number | null;
    wingDetailId?: number | null;
  }
): PropertySocialDetailItem {
  const rawObj = raw as Record<string, unknown>;
  const rawId =
    raw.id ??
    rawObj.propertySocialDetailId ??
    rawObj.Id;
  const id = rawId != null && String(rawId).trim() !== '' ? Number(rawId) : 0;
  const socialAttributeId = Number(raw.socialAttributeId ?? master?.id ?? 0);
  const propertyId = Number(raw.propertyId || resolvedContext?.resolvedPropertyId || 0);
  const societyDetailId =
    raw.societyDetailId != null
      ? Number(raw.societyDetailId)
      : (resolvedContext?.societyDetailId ?? null);
  const wingDetailId =
    raw.wingDetailId != null
      ? Number(raw.wingDetailId)
      : (resolvedContext?.wingDetailId ?? null);

  const level = getItemLevel({
    entityType: (raw.entityType as string) ?? null,
    level: (rawObj.level as string) ?? null,
    unitNo: (raw.unitNo as string | number) ?? null,
    wingDetailId,
    propertyId,
    societyDetailId,
  });

  const bitValue =
    typeof raw.bitValue === 'boolean'
      ? raw.bitValue
      : raw.bitValue != null
        ? String(raw.bitValue).trim().toLowerCase() === 'true' ||
          String(raw.bitValue).trim() === '1'
        : null;

  return {
    id,
    propertyId,
    socialAttributeId,
    socialAttributeCode: String(
      raw.socialAttributeCode || master?.socialAttributeCode || ''
    ),
    socialAttributeName: String(
      raw.socialAttributeName ||
        master?.socialAttributeName ||
        (raw.socialAttributeCode
          ? String(raw.socialAttributeCode)
          : `Attribute #${socialAttributeId}`)
    ),
    bitValue,
    intValue:
      raw.intValue != null && raw.intValue !== '' ? Number(raw.intValue) : null,
    decimalValue:
      raw.decimalValue != null && raw.decimalValue !== ''
        ? Number(raw.decimalValue)
        : null,
    textValue: raw.textValue != null ? String(raw.textValue) : null,
    dateValue: raw.dateValue != null ? String(raw.dateValue) : null,
    documentBindingId:
      raw.documentBindingId != null ? Number(raw.documentBindingId) : null,
    documentGuid: raw.documentGuid ? String(raw.documentGuid) : null,
    remark: raw.remark != null ? String(raw.remark) : null,
    isActive: Boolean(raw.isActive ?? true),
    createdDate: String(rawObj.createdDate || ''),
    updatedDate: rawObj.updatedDate ? String(rawObj.updatedDate) : null,
    level,
    wingDetailId,
    societyDetailId,
    wingName: (raw.wingName as string) ?? null,
    unitNo: raw.unitNo != null ? String(raw.unitNo) : null,
    partitionNo:
      raw.partitionNo != null
        ? String(raw.partitionNo)
        : rawObj.PartitionNo != null
          ? String(rawObj.PartitionNo)
          : null,
    entityType:
      (raw.entityType as string) ??
      (level === 'Apartment' ? 'S' : level === 'Wing' ? 'W' : 'P'),
    inheritedFrom: (raw.inheritedFrom as string) ?? null,
    percentage: raw.percentage != null ? Number(raw.percentage) : null,
    amount: raw.amount != null ? Number(raw.amount) : null,
    isDiscountApplicable: master?.isDiscountApplicable,
  };
}

/**
 * Builds CreatePropertySocialDetailDto with proper sanitization and type safety.
 */
export function buildCreateDto({
  attr,
  scope,
  userId,
}: {
  attr: {
    id?: number | null;
    socialAttributeId: number;
    bitValue?: boolean | null;
    intValue?: number | string | null;
    decimalValue?: number | string | null;
    textValue?: string | null;
    dateValue?: string | null;
    documentBindingId?: number | null;
    remark?: string | null;
    isActive?: boolean;
    percentage?: number | null;
    amount?: number | null;
  };
  scope: {
    entityType: EntityType;
    propertyId: number | null;
    wingDetailId: number | null;
    societyDetailId: number | null;
  };
  userId: number;
}): CreatePropertySocialDetailDto {
  const sanitizedInt =
    attr.intValue != null &&
    String(attr.intValue).trim() !== '' &&
    !isNaN(Number(attr.intValue))
      ? Number(attr.intValue)
      : null;

  const sanitizedDec =
    attr.decimalValue != null &&
    String(attr.decimalValue).trim() !== '' &&
    !isNaN(Number(attr.decimalValue))
      ? Number(attr.decimalValue)
      : null;

  const rawText = attr.textValue != null ? String(attr.textValue).trim() : null;
  const sanitizedText =
    rawText && rawText.toLowerCase() !== 'string' && rawText !== '-'
      ? rawText
      : null;

  const rawDate = attr.dateValue != null ? String(attr.dateValue).trim() : null;
  const sanitizedDate =
    rawDate && rawDate.toLowerCase() !== 'string' ? rawDate : null;

  const rawRemark = attr.remark != null ? String(attr.remark).trim() : null;
  const sanitizedRemark =
    rawRemark &&
    rawRemark.toLowerCase() !== 'string' &&
    rawRemark.toLowerCase() !== 'null'
      ? rawRemark
      : null;

  return {
    socialAttributeId: attr.socialAttributeId,
    bitValue: attr.bitValue ?? null,
    intValue: sanitizedInt,
    decimalValue: sanitizedDec,
    textValue: sanitizedText,
    dateValue: sanitizedDate,
    documentBindingId: attr.documentBindingId ? Number(attr.documentBindingId) : null,
    remark: sanitizedRemark,
    isActive: attr.isActive ?? true,
    createdBy: userId,
    propertyId: scope.propertyId,
    wingDetailId: scope.wingDetailId,
    societyDetailId: scope.societyDetailId,
    entityType: scope.entityType,
  };
}

/**
 * Builds UpdatePropertySocialDetailDto with proper sanitization and type safety.
 */
export function buildUpdateDto({
  id,
  attr,
  scope,
  userId,
}: {
  id: number;
  attr: {
    id?: number | null;
    socialAttributeId: number;
    bitValue?: boolean | null;
    intValue?: number | string | null;
    decimalValue?: number | string | null;
    textValue?: string | null;
    dateValue?: string | null;
    documentBindingId?: number | null;
    remark?: string | null;
    isActive?: boolean;
    percentage?: number | null;
    amount?: number | null;
  };
  scope: {
    entityType: EntityType;
    propertyId: number | null;
    wingDetailId: number | null;
    societyDetailId: number | null;
  };
  userId: number;
}): UpdatePropertySocialDetailDto {
  const sanitizedInt =
    attr.intValue != null &&
    String(attr.intValue).trim() !== '' &&
    !isNaN(Number(attr.intValue))
      ? Number(attr.intValue)
      : null;

  const sanitizedDec =
    attr.decimalValue != null &&
    String(attr.decimalValue).trim() !== '' &&
    !isNaN(Number(attr.decimalValue))
      ? Number(attr.decimalValue)
      : null;

  const rawText = attr.textValue != null ? String(attr.textValue).trim() : null;
  const sanitizedText =
    rawText && rawText.toLowerCase() !== 'string' && rawText !== '-'
      ? rawText
      : null;

  const rawDate = attr.dateValue != null ? String(attr.dateValue).trim() : null;
  const sanitizedDate =
    rawDate && rawDate.toLowerCase() !== 'string' ? rawDate : null;

  const rawRemark = attr.remark != null ? String(attr.remark).trim() : null;
  const sanitizedRemark =
    rawRemark &&
    rawRemark.toLowerCase() !== 'string' &&
    rawRemark.toLowerCase() !== 'null'
      ? rawRemark
      : null;

  return {
    id,
    socialAttributeId: attr.socialAttributeId,
    bitValue: attr.bitValue ?? null,
    intValue: sanitizedInt,
    decimalValue: sanitizedDec,
    textValue: sanitizedText,
    dateValue: sanitizedDate,
    documentBindingId: attr.documentBindingId ? Number(attr.documentBindingId) : null,
    remark: sanitizedRemark,
    isActive: attr.isActive ?? true,
    updatedBy: userId,
    propertyId: scope.propertyId,
    wingDetailId: scope.wingDetailId,
    societyDetailId: scope.societyDetailId,
    entityType: scope.entityType,
  };
}

/**
 * Builds DeletePropertySocialDetailsByHierarchyParams with proper scope.
 */
export function buildDeleteParams({
  level,
  socialAttributeId,
  societyDetailId,
  wingDetailId,
  propertyIds,
}: {
  level: string;
  socialAttributeId: number;
  societyDetailId?: number | null;
  wingDetailId?: number | null;
  propertyIds?: number[] | string;
}): DeletePropertySocialDetailsByHierarchyParams {
  const normLevel = String(level).trim().toLowerCase();
  let entityType: EntityType = ENTITY_TYPE.SOCIETY;

  if (normLevel === 'wing') {
    entityType = ENTITY_TYPE.WING;
  } else if (normLevel === 'unit') {
    entityType = ENTITY_TYPE.PROPERTY;
  }

  return {
    entityType,
    socialAttributeId,
    societyDetailsId: societyDetailId ? Number(societyDetailId) : undefined,
    wingDetailId: wingDetailId ? Number(wingDetailId) : undefined,
    propertyIds,
  };
}
