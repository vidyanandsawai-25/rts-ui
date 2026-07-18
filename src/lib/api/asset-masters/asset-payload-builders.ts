import type { MasterDataRecord } from '@/types/asset-masters/master-data.types';

// Inventory Category
export function buildCategoryPayload(record: MasterDataRecord, userId: number = 0) {
  return {
    isActive: record.status === 'Active',
    typeCode: record.id,
    typeName: record.name,
    description: record.description?.trim() || '',
    displayOrder: record.displayOrder ?? 1,
    depreciationRate: record.depreciationRate ?? 0.1,
    createdBy: userId,
    updatedBy: userId,
  };
}

export const buildCategoryCreatePayload = buildCategoryPayload;
export const buildCategoryUpdatePayload = buildCategoryPayload;

// Inventory Condition
export function buildConditionPayload(record: MasterDataRecord, userId: number = 0) {
  const inventoryItemCategoryId = Number(record.group) || 0;
  return {
    isActive: record.status === 'Active',
    inventoryItemCategoryId,
    conditionName: record.name,
    conditionFactor: record.conditionFactor ?? 1.0,
    description: record.description?.trim() || '',
    displayOrder: record.displayOrder ?? 1,
    createdBy: userId,
    updatedBy: userId,
  };
}

export const buildConditionCreatePayload = buildConditionPayload;
export const buildConditionUpdatePayload = buildConditionPayload;

// Inventory Item Name
export function buildItemNamePayload(record: MasterDataRecord, userId: number = 0) {
  const inventoryItemCategoryId = Number(record.group) || 0;
  return {
    isActive: record.status === 'Active',
    inventoryItemCategoryId,
    subTypeCode: record.id,
    subTypeName: record.name,
    description: record.description?.trim() || '',
    displayOrder: record.displayOrder ?? 1,
    createdBy: userId,
    updatedBy: userId,
  };
}

export const buildItemNameCreatePayload = buildItemNamePayload;
export const buildItemNameUpdatePayload = buildItemNamePayload;

// Inventory Model
export function buildModelPayload(record: MasterDataRecord, userId: number = 0) {
  const inventoryItemNameId = Number(record.group) || 0;
  return {
    isActive: record.status === 'Active',
    inventoryItemNameId,
    modelName: record.name,
    description: record.description?.trim() || '',
    displayOrder: record.displayOrder ?? 1,
    createdBy: userId,
    updatedBy: userId,
  };
}

export const buildModelCreatePayload = buildModelPayload;
export const buildModelUpdatePayload = buildModelPayload;
// Asset Type
export const buildAssetTypeCreatePayload = (record: MasterDataRecord, userId: number = 0) => ({
  typeCode: (record.id || '').trim(),
  typeName: record.name.trim(),
  assetCategoryId: Number(record.group) || 0,
  description: (record.description || '').trim(),
  isActive: record.status === 'Active',
  allowUnitRegistration: record.allowUnitRegistration ?? false,
  allowRoomRegistration: record.allowRoomRegistration ?? false,
  createdBy: userId,
  codeFormat: "1"
});

export const buildAssetTypeUpdatePayload = (record: MasterDataRecord, id: number, userId: number = 0) => ({
  id: id,
  typeCode: (record.id || '').trim(),
  typeName: record.name.trim(),
  assetCategoryId: Number(record.group) || 0,
  description: (record.description || '').trim(),
  isActive: record.status === 'Active',
  allowUnitRegistration: record.allowUnitRegistration ?? false,
  allowRoomRegistration: record.allowRoomRegistration ?? false,
  updatedBy: userId,
  codeFormat: "1"
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildAssetTypeCreatePayloadFromModel = (data: any, userId: number = 0) => ({
  typeCode: data.typeCode.trim(),
  typeName: data.typeName.trim(),
  assetCategoryId: data.categoryId,
  description: (data.description ?? '').trim(),
  isActive: data.isActive,
  allowUnitRegistration: data.allowUnitRegistration ?? false,
  allowRoomRegistration: data.allowRoomRegistration ?? false,
  createdBy: userId,
  codeFormat: "1"
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildAssetTypeUpdatePayloadFromModel = (data: any, userId: number = 0) => ({
  id: data.id ?? 0,
  typeCode: data.typeCode.trim(),
  typeName: data.typeName.trim(),
  assetCategoryId: data.categoryId,
  description: (data.description ?? '').trim(),
  isActive: data.isActive,
  allowUnitRegistration: data.allowUnitRegistration ?? false,
  allowRoomRegistration: data.allowRoomRegistration ?? false,
  updatedBy: userId,
  codeFormat: "1"
});

// Asset Category
export const buildAssetCategoryCreatePayload = (record: MasterDataRecord, userId: number = 0) => ({
  categoryCode: (record.id || '').trim(),
  categoryName: record.name.trim(),
  description: (record.description || '').trim(),
  isActive: record.status === 'Active',
  isMovable: record.isMovable ?? false,
  hasFloorDetails: record.hasFloorDetails ?? false,
  hasInventory: record.hasInventory ?? false,
  isInventoryMandatory: record.isInventoryMandatory ?? false,
  hasLegalCompliance: record.hasLegalCompliance ?? false,
  valuationType: (record.valuationType || '').trim(),
  createdBy: userId,
  codeFormat: "1"
});

export const buildAssetCategoryUpdatePayload = (record: MasterDataRecord, id: number, userId: number = 0) => ({
  id: id,
  categoryCode: (record.id || '').trim(),
  categoryName: record.name.trim(),
  description: (record.description || '').trim(),
  isActive: record.status === 'Active',
  isMovable: record.isMovable ?? false,
  hasFloorDetails: record.hasFloorDetails ?? false,
  hasInventory: record.hasInventory ?? false,
  isInventoryMandatory: record.isInventoryMandatory ?? false,
  hasLegalCompliance: record.hasLegalCompliance ?? false,
  valuationType: (record.valuationType || '').trim(),
  updatedBy: userId,
  codeFormat: "1"
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildAssetCategoryCreatePayloadFromModel = (data: any, userId: number = 0) => ({
  categoryCode: data.categoryCode.trim(),
  categoryName: data.categoryName.trim(),
  description: (data.description ?? '').trim(),
  isActive: data.isActive,
  isMovable: data.isMovable,
  hasFloorDetails: data.hasFloorDetails,
  hasInventory: data.hasInventory,
  isInventoryMandatory: data.isInventoryMandatory,
  hasLegalCompliance: data.hasLegalCompliance,
  valuationType: (data.valuationType || '').trim(),
  createdBy: userId,
  codeFormat: "1"
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildAssetCategoryUpdatePayloadFromModel = (data: any, userId: number = 0) => ({
  id: data.id ?? 0,
  categoryCode: data.categoryCode.trim(),
  categoryName: data.categoryName.trim(),
  description: (data.description ?? '').trim(),
  isActive: data.isActive,
  isMovable: data.isMovable,
  hasFloorDetails: data.hasFloorDetails,
  hasInventory: data.hasInventory,
  isInventoryMandatory: data.isInventoryMandatory,
  hasLegalCompliance: data.hasLegalCompliance,
  valuationType: (data.valuationType || '').trim(),
  updatedBy: userId,
  codeFormat: "1"
});
