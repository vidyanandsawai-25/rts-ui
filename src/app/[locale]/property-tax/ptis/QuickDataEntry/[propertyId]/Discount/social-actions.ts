'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import {
  getPropertySocialInfo,
  uploadSocialPhotoViaGlobalApi,
  replaceSocialPhotoViaGlobalApi,
  deleteSocialPhotoViaGlobalApi,
  deletePropertySocialDetailsByHierarchy,
  getPropertySocialInfoFilterBy,
  upsertPropertySocialInfoFilterBy,
  createPropertySocialDetail,
  updatePropertySocialDetail,
  createBulkPropertySocialDetail,
  getPropertySocialDetailsByFilters,
} from '@/lib/api/property-social-details.service';
import { getSocialAttributes } from '@/lib/api/social-attribute-master/social-attribute-crud.service';
import { DiscountDocumentUploadResponseDto } from '@/types/discount.types';
import { getUserIdFromCookies } from '@/lib/utils/cookie';
import { logger } from '@/lib/utils/logger';
import { updateBindingReference } from '@/lib/api/document.service';
import { ApiResponse } from '@/types/common.types';
import {
  PropertySocialInfoApiResponse,
  PropertySocialInfoResponseDto,
  PropertySocialInfoItemDto,
  DeletePropertySocialDetailsByHierarchyParams,
  UpsertPropertySocialInfoBulkDto,
  PropertySocialDetailsDto,
  CreatePropertySocialDetailDto,
  UpdatePropertySocialDetailDto,
  CreateBulkPropertySocialDetailDto,
} from '@/types/property-social-details.types';
import { cleanCommonApiError, handleActionError } from '@/lib/utils/action-error-helpers';
import { resolveScope } from '@/lib/utils/ptis/social-details';

export async function getPropertySocialInfoAction(
  propertyId: string
): Promise<ApiResponse<PropertySocialInfoApiResponse>> {
  try {
    return await getPropertySocialInfo(propertyId);
  } catch (error: unknown) {
    logger.error('getPropertySocialInfoAction failed', { propertyId, error: error as Error });
    return handleActionError(error, 'discount.socialConfirm.unexpectedError');
  }
}

import { parseJsonArray } from '@/lib/utils/validate-form-payload';

export async function upsertPropertySocialInfoAction(
  locale: string,
  propertyId: string,
  formData: FormData
): Promise<ApiResponse<PropertySocialInfoResponseDto>> {
  try {
    const t = await getTranslations({ locale, namespace: 'quickDataEntry' });
    const userId = getUserIdFromCookies(await cookies());
    if (!userId) return { success: false, error: 'Unauthorized: Please log in.' };

    const socialAttributes = parseJsonArray<PropertySocialInfoItemDto>(
      formData.get('socialAttributes'),
      'socialAttributes'
    );
    const socialAttributeIdsToRemove = parseJsonArray<number>(
      formData.get('socialAttributeIdsToRemove'),
      'socialAttributeIdsToRemove'
    );

    const validationErrors: string[] = [];
    for (const attr of socialAttributes) {
      if (!attr.socialAttributeId || Number(attr.socialAttributeId) <= 0) {
        validationErrors.push(`Invalid attribute ID: ${attr.socialAttributeId}`);
      }
      if (attr.documentBindingId && Number(attr.documentBindingId) <= 0) {
        validationErrors.push(`Invalid document binding ID: ${attr.documentBindingId}`);
      }
    }
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation failed: ${validationErrors.join(', ')}`,
      };
    }

    const level = formData.get('level') as string | null;
    const societyDetailId = formData.get('societyDetailId')
      ? Number(formData.get('societyDetailId'))
      : null;
    const wingDetailId = formData.get('wingDetailId') ? Number(formData.get('wingDetailId')) : null;
    const propertyIdsStr = formData.get('propertyIds') as string | null;
    const unitIds = propertyIdsStr
      ? propertyIdsStr
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n) && n > 0)
      : [];
    const isSociety = formData.get('isSociety');
    const selectedUnitCount = formData.get('selectedUnitCount')
      ? Number(formData.get('selectedUnitCount'))
      : 0;
    const totalUnitCount = formData.get('totalUnitCount')
      ? Number(formData.get('totalUnitCount'))
      : 0;

    // When all units in a wing are selected, promote to wing-level save
    const isAllUnitsSelected =
      level === 'Unit' && totalUnitCount > 0 && selectedUnitCount >= totalUnitCount;

    const scope = resolveScope({
      level,
      isAllUnitsSelected,
      wingDetailId,
      unitIds,
      societyDetailId: isSociety === 'true' ? societyDetailId : null,
      propertyId: Number(propertyId),
    });

    const payloadWingDetailId = scope.wingDetailId;
    const payloadSocietyDetailId = scope.societyDetailId;
    const BuildingPropertyId = Number(propertyId);

    const socIdNum = payloadSocietyDetailId ? Number(payloadSocietyDetailId) : undefined;
    const wingIdNum = payloadWingDetailId ? Number(payloadWingDetailId) : undefined;
    const targetPropId = isSociety === 'true' ? (unitIds.length === 1 ? unitIds[0] : undefined) : BuildingPropertyId;

    const initialExistingDetails = await getPropertySocialDetailsByFilters(
      undefined,
      socIdNum,
      wingIdNum,
      targetPropId
    );

    const initialFlatData: Record<number, { id?: number | null; documentGuid?: string | null }> = {};
    (initialExistingDetails || []).forEach((item) => {
      const existing = initialFlatData[item.socialAttributeId];
      if (!existing || (item.id && (!existing.id || item.id > existing.id))) {
        initialFlatData[item.socialAttributeId] = {
          id: item.id,
          documentGuid: item.documentGuid || item.photoGuid || null,
        };
      }
    });

    // Process any deleted documents from removed attributes
    for (const removeId of socialAttributeIdsToRemove) {
      const initialEntry = Object.values(initialFlatData).find((e) => e.id === removeId);
      if (initialEntry?.documentGuid) {
        await deleteSocialPhotoViaGlobalApi(initialEntry.documentGuid);
      }
    }

    // 1. Process photos/files first (upload, replace, or delete)
    for (const attr of socialAttributes) {
      const file = formData.get(`file_${attr.socialAttributeId}`) as File | null;
      const initialAttr = initialFlatData[attr.socialAttributeId];
      const oldGuid = initialAttr?.documentGuid;
      const isInherited =
        (level === 'Wing' &&
          (attr.inheritedFrom === 'Apartment' || attr.inheritanceLevel === 'Apartment')) ||
        (level === 'Unit' &&
          (attr.inheritedFrom === 'Apartment' ||
            attr.inheritedFrom === 'Wing' ||
            attr.inheritanceLevel === 'Apartment' ||
            attr.inheritanceLevel === 'Wing'));

      if (file) {
        const propIdNum = level === 'Unit' && unitIds.length > 0 ? unitIds[0] : Number(propertyId);
        const detailId = attr.id || 0;
        const attrId = attr.socialAttributeId;
        const guidReference = detailId === 0 ? crypto.randomUUID() : undefined;

        const uploadResult =
          oldGuid && !isInherited
            ? await replaceSocialPhotoViaGlobalApi(
                file,
                oldGuid,
                propIdNum,
                attrId,
                detailId,
                guidReference
              )
            : await uploadSocialPhotoViaGlobalApi(file, propIdNum, attrId, detailId, guidReference);

        if (uploadResult.success && (uploadResult.data?.documentBindingId || uploadResult.data?.documentGuid)) {
          attr.documentBindingId = uploadResult.data.documentBindingId;
          attr.documentGuid = uploadResult.data.documentGuid;
          attr.photoBindingId = uploadResult.data.documentBindingId;
          attr.photoGuid = uploadResult.data.documentGuid;
          attr.fileName = uploadResult.data.fileName || file.name;
        } else {
          throw new Error(uploadResult.error || 'Failed to upload photo');
        }
      } else if (oldGuid && (!attr.bitValue || !attr.documentBindingId) && !isInherited) {
        await deleteSocialPhotoViaGlobalApi(oldGuid);
      }
    }

    // 2. Delete attributes that were removed/deselected
    for (const removeId of socialAttributeIdsToRemove) {
      const deleteParams: DeletePropertySocialDetailsByHierarchyParams = {
        socialAttributeId: removeId,
      };

      if (isSociety === 'true') {
        if (level === 'Apartment') {
          deleteParams.entityType = 'S';
          if (payloadSocietyDetailId) deleteParams.societyDetailsId = payloadSocietyDetailId;
        } else if (level === 'Wing') {
          deleteParams.entityType = 'W';
          if (payloadSocietyDetailId) deleteParams.societyDetailsId = payloadSocietyDetailId;
          if (payloadWingDetailId) deleteParams.wingDetailId = payloadWingDetailId;
        } else if (level === 'Unit') {
          deleteParams.entityType = 'P';
          if (payloadSocietyDetailId) deleteParams.societyDetailsId = payloadSocietyDetailId;
          if (payloadWingDetailId) deleteParams.wingDetailId = payloadWingDetailId;
          if (unitIds.length === 1) {
            deleteParams.propertyId = unitIds[0];
          } else if (unitIds.length > 1) {
            deleteParams.propertyIds = unitIds;
          }
        }
      } else {
        deleteParams.entityType = 'P';
        deleteParams.propertyId = BuildingPropertyId;
      }

      await deletePropertySocialDetailsByHierarchy(deleteParams);
    }

    // 3. Persist social attributes using PUT /PropertySocialDetails/{id} (if updating existing) or POST /PropertySocialDetails (if new)
    for (const attr of socialAttributes) {
      const sanitizedBitValue = attr.bitValue != null ? attr.bitValue : null;
      const sanitizedIntValue =
        attr.intValue !== null && attr.intValue !== undefined && String(attr.intValue).trim() !== ''
          ? Number(attr.intValue)
          : null;
      const sanitizedDecimalValue =
        attr.decimalValue !== null &&
        attr.decimalValue !== undefined &&
        String(attr.decimalValue).trim() !== ''
          ? Number(attr.decimalValue)
          : null;
      const sanitizedTextValue =
        attr.textValue && attr.textValue !== 'string' && attr.textValue.trim() !== ''
          ? attr.textValue
          : null;
      const sanitizedDateValue =
        attr.dateValue && attr.dateValue.trim() !== '' ? attr.dateValue : null;
      const sanitizedRemark =
        attr.remark && attr.remark !== 'string' && attr.remark.trim() !== '' ? attr.remark : null;

      const isInherited =
        (level === 'Wing' &&
          (attr.inheritedFrom === 'Apartment' || attr.inheritanceLevel === 'Apartment')) ||
        (level === 'Unit' &&
          (attr.inheritedFrom === 'Apartment' ||
            attr.inheritedFrom === 'Wing' ||
            attr.inheritanceLevel === 'Apartment' ||
            attr.inheritanceLevel === 'Wing'));

      const initialAttr = initialFlatData[attr.socialAttributeId];
      const existingRecordId =
        (attr.id && Number(attr.id) > 0 && !isInherited)
          ? Number(attr.id)
          : (initialAttr?.id && Number(initialAttr.id) > 0 && !isInherited)
            ? Number(initialAttr.id)
            : null;

      if (isSociety === 'true') {
        if (!payloadSocietyDetailId) {
          throw new Error(
            t('discount.societyDetailIdRequired') || 'Society Detail ID is required to submit.'
          );
        }

        if (level === 'Apartment') {
          if (existingRecordId && existingRecordId > 0) {
            const updateDto: UpdatePropertySocialDetailDto = {
              id: existingRecordId,
              propertyId: 0,
              socialAttributeId: attr.socialAttributeId,
              societyDetailId: payloadSocietyDetailId,
              wingDetailId: null,
              entityType: 'S',
              bitValue: sanitizedBitValue,
              intValue: sanitizedIntValue,
              decimalValue: sanitizedDecimalValue,
              textValue: sanitizedTextValue,
              dateValue: sanitizedDateValue,
              documentBindingId: attr.documentBindingId || null,
              photoBindingId: attr.photoBindingId || attr.documentBindingId || null,
              remark: sanitizedRemark,
              updatedBy: Number(userId),
              isActive: true,
            };
            const res = await updatePropertySocialDetail(existingRecordId, updateDto);
            if (!res.success) {
              return {
                success: false,
                error: await cleanCommonApiError(res.error, locale),
                statusCode: res.statusCode,
              };
            }
            if (attr.documentBindingId && existingRecordId) {
              await updateBindingReference(attr.documentBindingId, existingRecordId);
            }
          } else {
            const createDto: CreatePropertySocialDetailDto = {
              propertyId: 0,
              socialAttributeId: attr.socialAttributeId,
              societyDetailId: payloadSocietyDetailId,
              wingDetailId: null,
              entityType: 'S',
              bitValue: sanitizedBitValue,
              intValue: sanitizedIntValue,
              decimalValue: sanitizedDecimalValue,
              textValue: sanitizedTextValue,
              dateValue: sanitizedDateValue,
              documentBindingId: attr.documentBindingId || null,
              photoBindingId: attr.photoBindingId || attr.documentBindingId || null,
              remark: sanitizedRemark,
              createdBy: Number(userId),
              isActive: true,
            };
            const res = await createPropertySocialDetail(createDto);
            if (!res.success) {
              return {
                success: false,
                error: await cleanCommonApiError(res.error, locale),
                statusCode: res.statusCode,
              };
            }
            if (attr.documentBindingId && res.data?.id) {
              await updateBindingReference(attr.documentBindingId, res.data.id);
            }
          }
        } else if (level === 'Wing' || (level === 'Unit' && isAllUnitsSelected)) {
          // Wing Level (or when all units in wing are selected, apply single record to Wing directly)
          if (existingRecordId && existingRecordId > 0) {
            const updateDto: UpdatePropertySocialDetailDto = {
              id: existingRecordId,
              propertyId: 0,
              socialAttributeId: attr.socialAttributeId,
              societyDetailId: payloadSocietyDetailId,
              wingDetailId: payloadWingDetailId,
              entityType: 'W',
              bitValue: sanitizedBitValue,
              intValue: sanitizedIntValue,
              decimalValue: sanitizedDecimalValue,
              textValue: sanitizedTextValue,
              dateValue: sanitizedDateValue,
              documentBindingId: attr.documentBindingId || null,
              photoBindingId: attr.photoBindingId || attr.documentBindingId || null,
              remark: sanitizedRemark,
              updatedBy: Number(userId),
              isActive: true,
            };
            const res = await updatePropertySocialDetail(existingRecordId, updateDto);
            if (!res.success) {
              return {
                success: false,
                error: await cleanCommonApiError(res.error, locale),
                statusCode: res.statusCode,
              };
            }
            if (attr.documentBindingId && existingRecordId) {
              await updateBindingReference(attr.documentBindingId, existingRecordId);
            }
          } else {
            const createDto: CreatePropertySocialDetailDto = {
              propertyId: 0,
              socialAttributeId: attr.socialAttributeId,
              societyDetailId: payloadSocietyDetailId,
              wingDetailId: payloadWingDetailId,
              entityType: 'W',
              bitValue: sanitizedBitValue,
              intValue: sanitizedIntValue,
              decimalValue: sanitizedDecimalValue,
              textValue: sanitizedTextValue,
              dateValue: sanitizedDateValue,
              documentBindingId: attr.documentBindingId || null,
              photoBindingId: attr.photoBindingId || attr.documentBindingId || null,
              remark: sanitizedRemark,
              createdBy: Number(userId),
              isActive: true,
            };
            const res = await createPropertySocialDetail(createDto);
            if (!res.success) {
              return {
                success: false,
                error: await cleanCommonApiError(res.error, locale),
                statusCode: res.statusCode,
              };
            }
            if (attr.documentBindingId && res.data?.id) {
              await updateBindingReference(attr.documentBindingId, res.data.id);
            }
          }
        } else if (level === 'Unit') {
          if (unitIds.length === 1) {
            // Single unit selected
            if (existingRecordId && existingRecordId > 0) {
              const updateDto: UpdatePropertySocialDetailDto = {
                id: existingRecordId,
                propertyId: unitIds[0],
                socialAttributeId: attr.socialAttributeId,
                societyDetailId: payloadSocietyDetailId,
                wingDetailId: payloadWingDetailId,
                entityType: 'P',
                bitValue: sanitizedBitValue,
                intValue: sanitizedIntValue,
                decimalValue: sanitizedDecimalValue,
                textValue: sanitizedTextValue,
                dateValue: sanitizedDateValue,
                documentBindingId: attr.documentBindingId || null,
                photoBindingId: attr.photoBindingId || attr.documentBindingId || null,
                remark: sanitizedRemark,
                updatedBy: Number(userId),
                isActive: true,
              };
              const res = await updatePropertySocialDetail(existingRecordId, updateDto);
              if (!res.success) {
                return {
                  success: false,
                  error: await cleanCommonApiError(res.error, locale),
                  statusCode: res.statusCode,
                };
              }
              if (attr.documentBindingId && existingRecordId) {
                await updateBindingReference(attr.documentBindingId, existingRecordId);
              }
            } else {
              const createDto: CreatePropertySocialDetailDto = {
                propertyId: unitIds[0],
                socialAttributeId: attr.socialAttributeId,
                societyDetailId: payloadSocietyDetailId,
                wingDetailId: payloadWingDetailId,
                entityType: 'P',
                bitValue: sanitizedBitValue,
                intValue: sanitizedIntValue,
                decimalValue: sanitizedDecimalValue,
                textValue: sanitizedTextValue,
                dateValue: sanitizedDateValue,
                documentBindingId: attr.documentBindingId || null,
                photoBindingId: attr.photoBindingId || attr.documentBindingId || null,
                remark: sanitizedRemark,
                createdBy: Number(userId),
                isActive: true,
              };
              const res = await createPropertySocialDetail(createDto);
              if (!res.success) {
                return {
                  success: false,
                  error: await cleanCommonApiError(res.error, locale),
                  statusCode: res.statusCode,
                };
              }
              if (attr.documentBindingId && res.data?.id) {
                await updateBindingReference(attr.documentBindingId, res.data.id);
              }
            }
          } else if (unitIds.length > 1) {
            // Multiple units selected -> POST /api/PropertySocialDetails/Bulk/by-property-ids
            const bulkDto: CreateBulkPropertySocialDetailDto = {
              propertyIds: unitIds.join(','),
              socialAttributeId: attr.socialAttributeId,
              societyDetailId: payloadSocietyDetailId,
              wingDetailId: payloadWingDetailId,
              entityType: 'P',
              bitValue: sanitizedBitValue,
              intValue: sanitizedIntValue,
              decimalValue: sanitizedDecimalValue,
              textValue: sanitizedTextValue,
              dateValue: sanitizedDateValue,
              documentBindingId: attr.documentBindingId || null,
              photoBindingId: attr.photoBindingId || attr.documentBindingId || null,
              remark: sanitizedRemark,
              createdBy: Number(userId),
              isActive: true,
            };
            const res = await createBulkPropertySocialDetail(bulkDto);
            if (!res.success) {
              return {
                success: false,
                error: await cleanCommonApiError(res.error, locale),
                statusCode: res.statusCode,
              };
            }
          }
        }
      } else {
        // Individual Property
        if (existingRecordId && existingRecordId > 0) {
          const updateDto: UpdatePropertySocialDetailDto = {
            id: existingRecordId,
            propertyId: BuildingPropertyId,
            socialAttributeId: attr.socialAttributeId,
            societyDetailId: null,
            wingDetailId: null,
            entityType: 'P',
            bitValue: sanitizedBitValue,
            intValue: sanitizedIntValue,
            decimalValue: sanitizedDecimalValue,
            textValue: sanitizedTextValue,
            dateValue: sanitizedDateValue,
            documentBindingId: attr.documentBindingId || null,
            photoBindingId: attr.photoBindingId || attr.documentBindingId || null,
            remark: sanitizedRemark,
            updatedBy: Number(userId),
            isActive: true,
          };
          const res = await updatePropertySocialDetail(existingRecordId, updateDto);
          if (!res.success) {
            return {
              success: false,
              error: await cleanCommonApiError(res.error, locale),
              statusCode: res.statusCode,
            };
          }
          attr.id = existingRecordId;
          if (attr.documentBindingId && existingRecordId) {
            await updateBindingReference(attr.documentBindingId, existingRecordId);
          }
        } else {
          const createDto: CreatePropertySocialDetailDto = {
            propertyId: BuildingPropertyId,
            socialAttributeId: attr.socialAttributeId,
            societyDetailId: null,
            wingDetailId: null,
            entityType: 'P',
            bitValue: sanitizedBitValue,
            intValue: sanitizedIntValue,
            decimalValue: sanitizedDecimalValue,
            textValue: sanitizedTextValue,
            dateValue: sanitizedDateValue,
            documentBindingId: attr.documentBindingId || null,
            photoBindingId: attr.photoBindingId || attr.documentBindingId || null,
            remark: sanitizedRemark,
            createdBy: Number(userId),
            isActive: true,
          };
          const res = await createPropertySocialDetail(createDto);
          if (!res.success) {
            return {
              success: false,
              error: await cleanCommonApiError(res.error, locale),
              statusCode: res.statusCode,
            };
          }
          if (res.data?.id) {
            attr.id = res.data.id;
          }
          if (attr.documentBindingId && res.data?.id) {
            await updateBindingReference(attr.documentBindingId, res.data.id);
          }
        }
      }
    }

    let freshSocialData: PropertySocialInfoResponseDto | undefined;

    if (isSociety === 'true') {
      const socIdNum = payloadSocietyDetailId ? Number(payloadSocietyDetailId) : undefined;
      const wingIdNum = payloadWingDetailId ? Number(payloadWingDetailId) : undefined;
      const targetUnitPropId = (level === 'Unit' && unitIds.length === 1) ? unitIds[0] : undefined;

      const [masterRes, apartmentDetailsRes, wingDetailsRes, unitDetailsRes] = await Promise.all([
        getSocialAttributes(),
        socIdNum
          ? getPropertySocialDetailsByFilters(undefined, socIdNum)
          : Promise.resolve([]),
        (socIdNum && wingIdNum && (level === 'Wing' || level === 'Unit'))
          ? getPropertySocialDetailsByFilters(undefined, socIdNum, wingIdNum)
          : Promise.resolve([]),
        (socIdNum && targetUnitPropId && level === 'Unit')
          ? getPropertySocialDetailsByFilters(undefined, socIdNum, wingIdNum, targetUnitPropId)
          : Promise.resolve([]),
      ]);

      const masterById = new Map((masterRes || []).map((a) => [a.id, a]));
      const mergedDetailsMap = new Map<number, PropertySocialDetailsDto>();

      const apartmentItems = (apartmentDetailsRes || []).filter(
        (item) => item.entityType === 'S' || (!item.wingDetailId && !item.propertyId)
      );
      const wingItems = (wingDetailsRes || []).filter(
        (item) => item.entityType === 'W' || (item.wingDetailId && !item.propertyId)
      );
      const unitItems = (unitDetailsRes || []).filter(
        (item) => item.entityType === 'P' || (item.propertyId && item.propertyId > 0)
      );

      apartmentItems.forEach((item) => {
        mergedDetailsMap.set(item.socialAttributeId, {
          ...item,
          entityType: item.entityType || 'S',
          inheritanceLevel: level === 'Apartment' ? 'Self' : 'Apartment',
          inheritedFrom: level === 'Apartment' ? null : 'Apartment',
        });
      });

      if (level === 'Wing' || level === 'Unit') {
        wingItems.forEach((item) => {
          mergedDetailsMap.set(item.socialAttributeId, {
            ...item,
            entityType: 'W',
            inheritanceLevel: level === 'Wing' ? 'Self' : 'Wing',
            inheritedFrom: level === 'Wing' ? null : 'Wing',
          });
        });
      }

      if (level === 'Unit' && targetUnitPropId) {
        unitItems.forEach((item) => {
          mergedDetailsMap.set(item.socialAttributeId, {
            ...item,
            entityType: 'P',
            inheritanceLevel: 'Self',
            inheritedFrom: null,
          });
        });
      }

      const socialSavedDetails = Array.from(mergedDetailsMap.values()).filter((item) => {
        const master = masterById.get(item.socialAttributeId);
        return master && master.isDiscountApplicable === false && master.isActive !== false;
      });

      const uploadedAttrMap = new Map(
        socialAttributes.map((a) => [a.socialAttributeId, a])
      );

      const mapped = socialSavedDetails.map((item) => {
        const master = masterById.get(item.socialAttributeId);
        const uploadedAttr = uploadedAttrMap.get(item.socialAttributeId);
        const docGuid = item.documentGuid || uploadedAttr?.documentGuid || item.photoGuid || uploadedAttr?.photoGuid || null;
        const docBindingId = item.documentBindingId || uploadedAttr?.documentBindingId || item.photoBindingId || uploadedAttr?.photoBindingId || null;
        const fileName = item.fileName || uploadedAttr?.fileName || null;

        return {
          id: item.socialAttributeId,
          socialAttributeCode: item.socialAttributeCode || master?.socialAttributeCode || '',
          socialAttributeName: item.socialAttributeName || master?.socialAttributeName || '',
          dataType: master?.dataType || 'BIT',
          unit: master?.unit,
          displayOrder: master?.displayOrder,
          parentAttributeId: masterById.get(item.socialAttributeId)?.parentAttributeId ?? null,
          isRequiredWhenParentTrue: masterById.get(item.socialAttributeId)?.isRequiredWhenParentTrue ?? false,
          isDiscountApplicable: master?.isDiscountApplicable ?? false,
          propertySocialDetailId: item.id || uploadedAttr?.id || undefined,
          bitValue: item.bitValue ?? uploadedAttr?.bitValue ?? null,
          intValue: item.intValue ?? uploadedAttr?.intValue ?? null,
          decimalValue: item.decimalValue ?? uploadedAttr?.decimalValue ?? null,
          textValue: item.textValue ?? uploadedAttr?.textValue ?? null,
          dateValue: item.dateValue ?? uploadedAttr?.dateValue ?? null,
          documentBindingId: docBindingId,
          documentGuid: docGuid,
          documentUrl:
            item.documentUrl ||
            (docGuid ? `/api/documents/${encodeURIComponent(docGuid)}/view` : undefined),
          fileName: fileName,
          photoBindingId: docBindingId,
          photoGuid: docGuid,
          remark: item.remark ?? uploadedAttr?.remark ?? null,
          photoTypeId: null,
          isPhotoRequired: master?.isPhotoRequired,
          isDocumentRequired: master?.isDocumentRequired,
          isActive: master?.isActive,
          entityType: item.entityType,
          inheritedFrom: item.inheritedFrom,
          inheritanceLevel: item.inheritanceLevel,
          children: [],
        };
      });

      const societyMappedIds = new Set(mapped.map((m) => m.id));
      for (const attr of socialAttributes) {
        if (!societyMappedIds.has(attr.socialAttributeId)) {
          const master = masterById.get(attr.socialAttributeId);
          if (master && master.isDiscountApplicable === false) {
            const docGuid = attr.documentGuid || attr.photoGuid || null;
            const docBindingId = attr.documentBindingId || attr.photoBindingId || null;
            mapped.push({
              id: attr.socialAttributeId,
              socialAttributeCode: master.socialAttributeCode || '',
              socialAttributeName: master.socialAttributeName || '',
              dataType: master.dataType || 'BIT',
              unit: master.unit,
              displayOrder: master.displayOrder,
              parentAttributeId: master.parentAttributeId ?? null,
              isRequiredWhenParentTrue: master.isRequiredWhenParentTrue ?? false,
              isDiscountApplicable: false,
              propertySocialDetailId: attr.id || undefined,
              bitValue: attr.bitValue ?? null,
              intValue: attr.intValue ?? null,
              decimalValue: attr.decimalValue ?? null,
              textValue: attr.textValue ?? null,
              dateValue: attr.dateValue ?? null,
              documentBindingId: docBindingId,
              documentGuid: docGuid,
              documentUrl: docGuid ? `/api/documents/${encodeURIComponent(docGuid)}/view` : undefined,
              fileName: attr.fileName || null,
              photoBindingId: docBindingId,
              photoGuid: docGuid,
              remark: attr.remark ?? null,
              photoTypeId: null,
              isPhotoRequired: master.isPhotoRequired,
              isDocumentRequired: master.isDocumentRequired,
              isActive: master.isActive,
              entityType: level === 'Apartment' ? 'S' : level === 'Wing' ? 'W' : 'P',
              inheritedFrom: null,
              inheritanceLevel: 'Self',
              children: [],
            });
          }
        }
      }

      freshSocialData = {
        propertyId: Number(propertyId),
        societyDetailId: payloadSocietyDetailId,
        wingDetailId: payloadWingDetailId,
        socialAttributes: mapped,
      };
    } else {
      const [individualDetailsRes, masterRes] = await Promise.all([
        getPropertySocialDetailsByFilters(undefined, undefined, undefined, Number(propertyId)),
        getSocialAttributes(),
      ]);

      const masterById = new Map((masterRes || []).map((a) => [a.id, a]));
      const individualItems = individualDetailsRes || [];
      const dedupedDetailsMap = new Map<number, PropertySocialDetailsDto>();
      individualItems.forEach((item) => {
        const existing = dedupedDetailsMap.get(item.socialAttributeId);
        if (!existing || (item.id && (!existing.id || item.id > existing.id))) {
          dedupedDetailsMap.set(item.socialAttributeId, item);
        }
      });

      const socialSavedDetails = Array.from(dedupedDetailsMap.values()).filter((item) => {
        const master = masterById.get(item.socialAttributeId);
        return master && master.isDiscountApplicable === false && master.isActive !== false;
      });

      const uploadedAttrMap = new Map(
        socialAttributes.map((a) => [a.socialAttributeId, a])
      );

      const mapped = socialSavedDetails.map((item) => {
        const master = masterById.get(item.socialAttributeId);
        const uploadedAttr = uploadedAttrMap.get(item.socialAttributeId);
        const docGuid = item.documentGuid || uploadedAttr?.documentGuid || item.photoGuid || uploadedAttr?.photoGuid || null;
        const docBindingId = item.documentBindingId || uploadedAttr?.documentBindingId || item.photoBindingId || uploadedAttr?.photoBindingId || null;
        const fileName = item.fileName || uploadedAttr?.fileName || null;

        return {
          id: item.socialAttributeId,
          socialAttributeCode: item.socialAttributeCode || master?.socialAttributeCode || '',
          socialAttributeName: item.socialAttributeName || master?.socialAttributeName || '',
          dataType: master?.dataType || 'BIT',
          unit: master?.unit,
          displayOrder: master?.displayOrder,
          parentAttributeId: masterById.get(item.socialAttributeId)?.parentAttributeId ?? null,
          isRequiredWhenParentTrue: masterById.get(item.socialAttributeId)?.isRequiredWhenParentTrue ?? false,
          isDiscountApplicable: master?.isDiscountApplicable ?? false,
          propertySocialDetailId: item.id || uploadedAttr?.id || undefined,
          bitValue: item.bitValue ?? uploadedAttr?.bitValue ?? null,
          intValue: item.intValue ?? uploadedAttr?.intValue ?? null,
          decimalValue: item.decimalValue ?? uploadedAttr?.decimalValue ?? null,
          textValue: item.textValue ?? uploadedAttr?.textValue ?? null,
          dateValue: item.dateValue ?? uploadedAttr?.dateValue ?? null,
          documentBindingId: docBindingId,
          documentGuid: docGuid,
          documentUrl:
            item.documentUrl ||
            (docGuid ? `/api/documents/${encodeURIComponent(docGuid)}/view` : undefined),
          fileName: fileName,
          photoBindingId: docBindingId,
          photoGuid: docGuid,
          remark: item.remark ?? uploadedAttr?.remark ?? null,
          photoTypeId: null,
          isPhotoRequired: master?.isPhotoRequired,
          isDocumentRequired: master?.isDocumentRequired,
          isActive: master?.isActive,
          entityType: 'P',
          inheritedFrom: null,
          inheritanceLevel: 'Self',
          children: [],
        };
      });

      const individualMappedIds = new Set(mapped.map((m) => m.id));
      for (const attr of socialAttributes) {
        if (!individualMappedIds.has(attr.socialAttributeId)) {
          const master = masterById.get(attr.socialAttributeId);
          if (master && master.isDiscountApplicable === false) {
            const docGuid = attr.documentGuid || attr.photoGuid || null;
            const docBindingId = attr.documentBindingId || attr.photoBindingId || null;
            mapped.push({
              id: attr.socialAttributeId,
              socialAttributeCode: master.socialAttributeCode || '',
              socialAttributeName: master.socialAttributeName || '',
              dataType: master.dataType || 'BIT',
              unit: master.unit,
              displayOrder: master.displayOrder,
              parentAttributeId: master.parentAttributeId ?? null,
              isRequiredWhenParentTrue: master.isRequiredWhenParentTrue ?? false,
              isDiscountApplicable: false,
              propertySocialDetailId: attr.id || undefined,
              bitValue: attr.bitValue ?? null,
              intValue: attr.intValue ?? null,
              decimalValue: attr.decimalValue ?? null,
              textValue: attr.textValue ?? null,
              dateValue: attr.dateValue ?? null,
              documentBindingId: docBindingId,
              documentGuid: docGuid,
              documentUrl: docGuid ? `/api/documents/${encodeURIComponent(docGuid)}/view` : undefined,
              fileName: attr.fileName || null,
              photoBindingId: docBindingId,
              photoGuid: docGuid,
              remark: attr.remark ?? null,
              photoTypeId: null,
              isPhotoRequired: master.isPhotoRequired,
              isDocumentRequired: master.isDocumentRequired,
              isActive: master.isActive,
              entityType: 'P',
              inheritedFrom: null,
              inheritanceLevel: 'Self',
              children: [],
            });
          }
        }
      }

      freshSocialData = {
        propertyId: Number(propertyId),
        societyDetailId: null,
        wingDetailId: null,
        socialAttributes: mapped,
      };
    }

    for (const l of ['en', 'hi', 'mr']) {
      revalidatePath(`/${l}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
    }
    return {
      success: true,
      message:
        t('discount.socialConfirm.saveSuccess') ||
        'Property social information updated successfully',
      data: freshSocialData,
    };
  } catch (error: unknown) {
    logger.error('upsertPropertySocialInfoAction failed', { propertyId, error: error as Error });
    return handleActionError(error, 'discount.socialConfirm.unexpectedError', locale);
  }
}

export async function uploadSocialPhotoAction(
  formData: FormData
): Promise<ApiResponse<DiscountDocumentUploadResponseDto>> {
  try {
    const file = formData.get('File') as File | null;
    const propertyId = Number(formData.get('PropertyId'));
    const socialAttributeId = Number(formData.get('SocialAttributeId'));
    const propertySocialDetailId = Number(formData.get('PropertySocialDetailId') || 0);
    const referenceTableIdGuid = formData.get('ReferenceTableIdGuid') as string | null;
    const remark = formData.get('Remark') as string | null;

    if (!file) return { success: false, error: 'No file provided' };
    if (!propertyId) return { success: false, error: 'Property ID is required' };
    if (!socialAttributeId) return { success: false, error: 'Social Attribute ID is required' };

    const result = await uploadSocialPhotoViaGlobalApi(
      file,
      propertyId,
      socialAttributeId,
      propertySocialDetailId,
      referenceTableIdGuid || undefined,
      remark || undefined
    );
    if (result.success && result.data) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error || 'Upload failed' };
  } catch (error: unknown) {
    logger.error('uploadSocialPhotoAction failed', { error: error as Error });
    return handleActionError(error, 'discount.uploadError');
  }
}

export async function replaceSocialPhotoAction(
  propertySocialDetailId: number,
  oldDocumentGuid: string,
  formData: FormData
): Promise<ApiResponse<DiscountDocumentUploadResponseDto>> {
  try {
    const file = formData.get('File') as File | null;
    const propertyId = Number(formData.get('PropertyId'));
    const socialAttributeId = Number(formData.get('SocialAttributeId'));
    const referenceTableIdGuid = formData.get('ReferenceTableIdGuid') as string | null;
    const remark = formData.get('Remark') as string | null;

    if (!file) return { success: false, error: 'No file provided' };

    const result = await replaceSocialPhotoViaGlobalApi(
      file,
      oldDocumentGuid,
      propertyId,
      socialAttributeId,
      propertySocialDetailId,
      referenceTableIdGuid || undefined,
      remark || undefined
    );
    if (result.success && result.data) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error || 'Replace failed' };
  } catch (error: unknown) {
    logger.error('replaceSocialPhotoAction failed', {
      propertySocialDetailId,
      error: error as Error,
    });
    return handleActionError(error, 'discount.uploadError');
  }
}

export async function deleteSocialDocumentAction(documentGuid: string): Promise<ApiResponse<void>> {
  try {
    return await deleteSocialPhotoViaGlobalApi(documentGuid);
  } catch (error: unknown) {
    logger.error('deleteSocialDocumentAction failed', { documentGuid, error: error as Error });
    return handleActionError(error, 'discount.deleteError');
  }
}

import {
  deletePropertySocialDetailAction as deletePropertySocialDetailActionBase,
  deletePropertySocialDetailsByHierarchyAction as deletePropertySocialDetailsByHierarchyActionBase,
  getPropertySocialDetailByIdAction as getPropertySocialDetailByIdActionBase,
  createPropertySocialDetailAction as createPropertySocialDetailActionBase,
  createBulkPropertySocialDetailAction as createBulkPropertySocialDetailActionBase,
  getPropertySocialDetailsByFiltersAction as getPropertySocialDetailsByFiltersActionBase,
} from './discount-actions';

export async function deletePropertySocialDetailAction(
  propertyId: string,
  socialAttributeId: number,
  locale: string
): Promise<ApiResponse<void>> {
  return deletePropertySocialDetailActionBase(propertyId, socialAttributeId, locale);
}

export async function deletePropertySocialDetailsByHierarchyAction(
  params: DeletePropertySocialDetailsByHierarchyParams,
  propertyId?: string,
  locale?: string
): Promise<ApiResponse<void>> {
  return deletePropertySocialDetailsByHierarchyActionBase(params, propertyId, locale);
}

export async function getPropertySocialDetailByIdAction(
  id: number
): Promise<ApiResponse<PropertySocialDetailsDto>> {
  return getPropertySocialDetailByIdActionBase(id);
}

export async function createPropertySocialDetailAction(
  payload: CreatePropertySocialDetailDto,
  locale?: string
): Promise<ApiResponse<PropertySocialDetailsDto>> {
  return createPropertySocialDetailActionBase(payload, locale);
}

export async function createBulkPropertySocialDetailAction(
  payload: CreateBulkPropertySocialDetailDto
): Promise<ApiResponse<PropertySocialDetailsDto[]>> {
  return createBulkPropertySocialDetailActionBase(payload);
}

export async function getPropertySocialDetailsByFiltersAction(
  socialAttributeId?: number,
  societyDetailId?: number,
  wingDetailId?: number,
  propertyId?: number
): Promise<ApiResponse<PropertySocialDetailsDto[]>> {
  return getPropertySocialDetailsByFiltersActionBase(
    socialAttributeId,
    societyDetailId,
    wingDetailId,
    propertyId
  );
}

export async function getPropertySocialInfoFilterByAction(params: {
  propertyId?: number | null;
  societyDetailId?: number | null;
  wingDetailId?: number | null;
}): Promise<ApiResponse<PropertySocialInfoApiResponse>> {
  try {
    return await getPropertySocialInfoFilterBy(params);
  } catch (error: unknown) {
    logger.error('getPropertySocialInfoFilterByAction failed', { params, error: error as Error });
    return handleActionError(error, 'discount.socialConfirm.unexpectedError');
  }
}

export async function upsertPropertySocialInfoFilterByAction(
  payload: UpsertPropertySocialInfoBulkDto,
  locale?: string
): Promise<ApiResponse<PropertySocialDetailsDto[]>> {
  try {
    const response = await upsertPropertySocialInfoFilterBy(payload);
    if (response.success && payload.propertyId) {
      for (const l of ['en', 'hi', 'mr']) {
        revalidatePath(
          `/${l}/property-tax/ptis/QuickDataEntry/${payload.propertyId}/Discount`,
          'page'
        );
      }
    }
    return response;
  } catch (error: unknown) {
    logger.error('upsertPropertySocialInfoFilterByAction failed', {
      payload,
      error: error as Error,
    });
    return handleActionError(error, 'discount.socialConfirm.unexpectedError', locale);
  }
}
