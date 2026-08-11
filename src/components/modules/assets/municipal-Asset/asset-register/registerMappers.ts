import { AssetRegisterRow } from '@/types/asset/asset-register/municipal-asset-register.types';
import type { AssetRegisterApiRecord } from '@/types/asset/asset-register/municipal-asset-service.types';
import type { AssetRegisterSubUnitItem } from '@/lib/api/asset/asset-register/municipal-asset-register.server.service';
import type { PropertyPhotoDto } from '@/types/asset/asset-register/media.types';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';

export function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN');
}

export function formatMoney(value: string) {
  if (!value || value === '-') return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return numeric.toLocaleString('en-IN');
}

export function formatBoolean(value?: boolean | string | null) {
  if (value === true || value === 'true') return 'Yes';
  if (value === false || value === 'false') return 'No';
  return '-';
}

export function formatFieldValue(value: unknown): string {
  if (value == null || value === '') return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value.length === 0 ? '-' : value.map((entry) => formatFieldValue(entry)).join(', ');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '-';
    const flattened = entries
      .map(([key, entry]) => {
        const formatted = formatFieldValue(entry);
        return formatted === '-' ? null : `${key}: ${formatted}`;
      })
      .filter((entry): entry is string => Boolean(entry));
    return flattened.length > 0 ? flattened.join(', ') : '-';
  }
  try {
    return JSON.stringify(value);
  } catch {
    return '-';
  }
}

export function mapAssetToRow(item: AssetRegisterApiRecord, fallbackCategoryName: string): AssetRegisterRow {
  const record = item;
  const parsedId = Number(record.id);
  const safeId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;
  const latitude = record.latitude ?? record.details?.latitude;
  const longitude = record.longitude ?? record.details?.longitude;
  return {
    id: safeId,
    assetId: record.assetNo || '-',
    authorityName: record.authorityName || '-',
    organizationName: record.organizationName || '-',
    departmentName: record.departmentName || '-',
    assetCode: record.assetNo || '-',
    assetName: record.assetName || '-',
    categoryName: record.assetCategoryName || fallbackCategoryName || '-',
    assetTypeName: record.assetTypeName || '-',
    parentAssetName: record.parentAssetName || '-',
    address: (record.details?.address as string) || '-',
    wardName: record.wardName || '-',
    zoneName: record.zoneName || '-',
    latitude: latitude != null ? String(latitude) : '-',
    longitude: longitude != null ? String(longitude) : '-',
    csn: (record.details?.csn as string) || '-',
    hasLift: formatBoolean(record.hasLift),
    purchaseDate: record.purchaseDate || '',
    marketValueDate: record.marketValueDate || '',
    capitalValue: record.capitalValue == null ? '-' : String(record.capitalValue),
    lastCVCalculationDate: record.lastCVCalculationDate || '',
    currentBookValue: record.currentBookValue == null ? '-' : String(record.currentBookValue),
    depreciationRate: record.depreciationRate == null ? '-' : String(record.depreciationRate),
    isRevenueGenerating: formatBoolean(record.isRevenueGenerating),
    operationalControl: record.operationalControl || '-',
    fieldValues: formatFieldValue(record.fieldValues),
    occupancyStatus: record.occupancyStatus || '-',
    ownershipType: record.ownershipType || '-',
    assetCondition: record.assetCondition || '-',
    lifeYears: record.assetLife != null ? String(record.assetLife) : '-',
    purchaseValue: record.purchaseValue == null ? '-' : String(record.purchaseValue),
    marketValue: record.marketValue == null ? '-' : String(record.marketValue),
    depreciation: record.depreciation == null ? '-' : String(record.depreciation),
    netBookValue:
      record.currentBookValue != null
        ? String(record.currentBookValue)
        : record.capitalValue != null
          ? String(record.capitalValue)
          : record.marketValue == null
            ? '-'
            : String(record.marketValue),
    builtUpAreaSqMeter: record.details?.builtUpAreaSqMeter != null ? String(record.details.builtUpAreaSqMeter) : '-',
    carpetAreaSqMeter: record.details?.carpetAreaSqMeter != null ? String(record.details.carpetAreaSqMeter) : '-',
    landAreaSqMeter: record.details?.landAreaSqMeter != null ? String(record.details.landAreaSqMeter) : '-',
    createdDate: record.createdDate || record.updatedDate || '',
    assetCategoryId: record.assetCategoryId || null,
    assetTypeId: record.assetTypeId || null,
    assetDocumentId: record.assetDocumentId || null,
    totalSubUnits: record.totalSubUnits != null ? Number(record.totalSubUnits) : 0,
  };
}

type GroupedAssetPhotos = {
  photoTypes?: Array<{
    photos?: Array<{
      photoId?: number;
      propertyPhotoId?: number;
      assetId?: number;
      propertyId?: number;
      photoTypeId?: number;
      photoTypeCode?: string;
      photoTypeName?: string;
      displayOrder?: number;
      remarks?: string;
      viewUrl?: string;
      documentGuid?: string;
    }>;
  }>;
};

export function mapGroupedAssetPhotosToPanelPhotos(data?: GroupedAssetPhotos | null): PropertyPhotoDto[] {
  const photoTypes = data?.photoTypes || [];
  return photoTypes.flatMap((type) =>
    (type.photos || []).flatMap((photo) => {
      const propertyPhotoId = photo.photoId ?? photo.propertyPhotoId;
      const propertyId = photo.assetId ?? photo.propertyId;
      const photoTypeId = photo.photoTypeId;
      const photoTypeCode = photo.photoTypeCode;
      const photoTypeName = photo.photoTypeName;

      if (
        propertyPhotoId == null ||
        propertyId == null ||
        photoTypeId == null ||
        !photoTypeCode ||
        !photoTypeName
      ) {
        return [];
      }

      return [{
        propertyPhotoId,
        propertyId,
        photoTypeId,
        photoTypeCode,
        photoTypeName,
        displayOrder: photo.displayOrder,
        remarks: photo.remarks,
        viewUrl: photo.documentGuid ? getViewDocumentUrl(photo.documentGuid) : photo.viewUrl,
        documentGuid: photo.documentGuid,
      }];
    })
  );
}

export function mapExpandedSubUnitItems(
  items: AssetRegisterSubUnitItem[],
  parentId: number
): Array<AssetRegisterSubUnitItem & { isSubUnit: true; parentId: number }> {
  return items.map((item) => ({
    ...item,
    isSubUnit: true,
    parentId,
  }));
}

export function mapSubUnitToAssetRegisterRow(subUnit: AssetRegisterSubUnitItem, asset: AssetRegisterRow): AssetRegisterRow {
  return {
    id: subUnit.id,
    assetId: subUnit.assetNo || '-',
    authorityName: asset.authorityName,
    organizationName: asset.organizationName,
    departmentName: asset.departmentName,
    assetCode: subUnit.assetNo || '-',
    assetName: subUnit.assetName || '-',
    categoryName: subUnit.names?.category || '-',
    assetTypeName: subUnit.names?.type || '-',
    parentAssetName: asset.assetName,
    address: asset.address,
    wardName: subUnit.names?.ward || '-',
    zoneName: subUnit.names?.zone || '-',
    latitude: asset.latitude,
    longitude: asset.longitude,
    csn: asset.csn,
    hasLift: asset.hasLift,
    purchaseDate: asset.purchaseDate,
    marketValueDate: asset.marketValueDate,
    capitalValue: subUnit.capitalValue == null ? '-' : String(subUnit.capitalValue),
    lastCVCalculationDate: subUnit.lastCVDate || '',
    currentBookValue: '-',
    depreciation: '-',
    netBookValue: subUnit.capitalValue == null ? '-' : String(subUnit.capitalValue),
    lifeYears: subUnit.assetLife != null ? String(subUnit.assetLife) : '-',
    depreciationRate: '-',
    isRevenueGenerating: asset.isRevenueGenerating,
    operationalControl: asset.operationalControl,
    fieldValues: '-',
    occupancyStatus: subUnit.occupancy || '-',
    ownershipType: asset.ownershipType,
    assetCondition: subUnit.status || '-',
    purchaseValue: '-',
    marketValue: '-',
    builtUpAreaSqMeter: subUnit.builtUpAreaSqMeter == null ? '-' : String(subUnit.builtUpAreaSqMeter),
    carpetAreaSqMeter: subUnit.carpetAreaSqMeter == null ? '-' : String(subUnit.carpetAreaSqMeter),
    landAreaSqMeter: '-',
    createdDate: '',
    assetCategoryId: asset.assetCategoryId,
    assetTypeId: asset.assetTypeId,
    assetDocumentId: null,
    isSubUnit: true,
    parentId: asset.id ?? undefined,
  };
}
