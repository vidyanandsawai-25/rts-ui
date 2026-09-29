'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import {
  getDiscountDetails,
  uploadDiscountDocViaGlobalApi,
  replaceDiscountDocViaGlobalApi,
  deleteDiscountDoc,
  getDiscountWings,
  getDiscountUnits,
} from '@/lib/api/discount.service';
import {
  createPropertySocialDetail,
  createBulkPropertySocialDetail,
  getPropertySocialDetailById,
  getPropertySocialDetailsByFilters,
  deletePropertySocialDetailsByHierarchy,
  deletePropertySocialDetail,
} from '@/lib/api/property-social-details.service';
import { getUserIdFromCookies } from '@/lib/utils/cookie';
import { logger } from '@/lib/utils/logger';
import { getSocialAttributes } from '@/lib/api/social-attribute-master/social-attribute-crud.service';
import { SocialAttribute } from '@/types/social-attribute.types';
import { updateBindingReference } from '@/lib/api/document.service';
import {
  PropertyDiscountInfoResponseDto,
  DiscountDocumentUploadResponseDto,
  DiscountAttributeItemDto,
} from '@/types/discount.types';
import { WingOption, UnitSelectionItem } from '@/types/building-permission.types';
import { ApiResponse } from '@/types/common.types';
import {
  CreatePropertySocialDetailDto,
  CreateBulkPropertySocialDetailDto,
  PropertySocialDetailsDto,
  DeletePropertySocialDetailsByHierarchyParams,
} from '@/types/property-social-details.types';
import { cleanCommonApiError, handleActionError } from '@/lib/utils/action-error-helpers';
import { resolveScope } from '@/lib/utils/ptis/social-details';

export async function getDiscountDetailsAction(
  propertyId: string
): Promise<ApiResponse<PropertyDiscountInfoResponseDto>> {
  try {
    return await getDiscountDetails(propertyId);
  } catch (error: unknown) {
    logger.error('getDiscountDetailsAction failed', { propertyId, error: error as Error });
    return handleActionError(error, 'discount.socialConfirm.unexpectedError');
  }
}

export async function updateDiscountDetailsAction(
  locale: string,
  propertyId: string,
  formData: FormData
): Promise<ApiResponse<PropertyDiscountInfoResponseDto>> {
  try {
    const t = await getTranslations({ locale, namespace: 'quickDataEntry' });
    const userId = getUserIdFromCookies(await cookies());
    if (!userId) return { success: false, error: 'Unauthorized: Please log in.' };

    const attributesStr = formData.get('discountAttributes') as string;
    const discountAttributes = JSON.parse(attributesStr) as DiscountAttributeItemDto[];

    const level = (formData.get('level') as string | null) || 'Apartment';
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

    const targetEntityType = scope.entityType;
    const payloadPropertyId = scope.propertyId;
    const payloadWingDetailId = scope.wingDetailId;
    const payloadSocietyDetailId = scope.societyDetailId;
    const BuildingPropertyId = Number(propertyId);

    const initialResponse = await getDiscountDetails(propertyId);
    const initialAttributes =
      initialResponse.success && initialResponse.data?.discountAttributes
        ? initialResponse.data.discountAttributes
        : [];

    // 1. Process files first (upload, replace, or delete)
    for (const attr of discountAttributes) {
      const file = formData.get(`file_${attr.socialAttributeId}`) as File | null;
      const initialAttr = initialAttributes.find((a) => a.id === attr.socialAttributeId);
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
        const propIdNum = level === 'Unit' && unitIds.length > 0 ? unitIds[0] : BuildingPropertyId;
        const detailId = attr.propertySocialDetailId || 0;
        const attrId = attr.socialAttributeId;
        const guidReference = detailId === 0 ? crypto.randomUUID() : undefined;

        const uploadResult =
          oldGuid && !isInherited
            ? await replaceDiscountDocViaGlobalApi(
                file,
                oldGuid,
                propIdNum,
                attrId,
                detailId,
                guidReference
              )
            : await uploadDiscountDocViaGlobalApi(file, propIdNum, attrId, detailId, guidReference);

        if (uploadResult.success && uploadResult.data?.documentBindingId) {
          attr.documentBindingId = uploadResult.data.documentBindingId;
        } else {
          throw new Error(uploadResult.error || 'Failed to upload document');
        }
      } else if (oldGuid && (!attr.bitValue || !attr.documentBindingId) && !isInherited) {
        await deleteDiscountDoc(oldGuid);
      }
    }

    // 2. Identify attributes to remove vs save
    const attributesToRemove: number[] = [];
    const attributesToSave: DiscountAttributeItemDto[] = [];

    for (const attr of discountAttributes) {
      const sanitizedBitValue =
        attr.bitValue != null
          ? attr.bitValue
          : attr.dataType?.toUpperCase() === 'BIT'
            ? false
            : null;
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

      const isInherited =
        (level === 'Wing' &&
          (attr.inheritedFrom === 'Apartment' || attr.inheritanceLevel === 'Apartment')) ||
        (level === 'Unit' &&
          (attr.inheritedFrom === 'Apartment' ||
            attr.inheritedFrom === 'Wing' ||
            attr.inheritanceLevel === 'Apartment' ||
            attr.inheritanceLevel === 'Wing'));
      const isExistingRecordAtSameLevel =
        typeof attr.propertySocialDetailId === 'number' &&
        attr.propertySocialDetailId > 0 &&
        !isInherited &&
        ((level === 'Apartment' && (attr.entityType === 'S' || !attr.entityType)) ||
          (level === 'Wing' && attr.entityType === 'W') ||
          (level === 'Unit' && attr.entityType === 'P') ||
          (isSociety !== 'true' && (attr.entityType === 'P' || !attr.entityType)));

      const isBit = attr.dataType?.toUpperCase() === 'BIT';
      const isEnabled = isBit
        ? sanitizedBitValue === true
        : sanitizedBitValue === true ||
          sanitizedIntValue != null ||
          sanitizedDecimalValue != null ||
          sanitizedTextValue != null ||
          sanitizedDateValue != null;

      if (!isEnabled && isExistingRecordAtSameLevel) {
        attributesToRemove.push(attr.socialAttributeId);
      } else if (isEnabled) {
        attributesToSave.push(attr);
      }
    }

    // 3. Delete attributes that were removed/deselected
    for (const removeId of attributesToRemove) {
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

    // 4. Persist discount attributes using POST /PropertySocialDetails or POST /PropertySocialDetails/Bulk/by-property-ids
    for (const attr of attributesToSave) {
      const sanitizedBitValue =
        attr.bitValue != null
          ? attr.bitValue
          : attr.dataType?.toUpperCase() === 'BIT'
            ? false
            : null;
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

      if (isSociety === 'true') {
        if (!payloadSocietyDetailId) {
          throw new Error(
            t('discount.societyDetailIdRequired') || 'Society Detail ID is required to submit.'
          );
        }

        if (level === 'Apartment') {
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
        } else if (level === 'Wing' || (level === 'Unit' && isAllUnitsSelected)) {
          // Wing Level or all units in wing selected -> apply directly to Wing
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
        } else if (level === 'Unit') {
          if (unitIds.length === 1) {
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
          } else if (unitIds.length > 1) {
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
    }

    let freshDiscountData: PropertyDiscountInfoResponseDto | undefined;

    if (isSociety === 'true') {
      const freshItems = await getPropertySocialDetailsByFilters(
        undefined,
        payloadSocietyDetailId || undefined,
        level === 'Apartment' ? undefined : payloadWingDetailId || undefined,
        level === 'Unit' ? payloadPropertyId || undefined : undefined,
        targetEntityType,
        false
      );

      const allMaster = await getSocialAttributes();
      const masterById = new Map(allMaster.map((a) => [a.id, a]));

      const mapped = (freshItems || [])
        .filter((item) => {
          const master = masterById.get(item.socialAttributeId);
          return master?.isDiscountApplicable === true;
        })
        .map((item) => {
          const master = masterById.get(item.socialAttributeId);
          return {
            id: item.socialAttributeId,
            socialAttributeCode: item.socialAttributeCode || master?.socialAttributeCode || '',
            socialAttributeName: item.socialAttributeName || master?.socialAttributeName || '',
            dataType: master?.dataType || 'BIT',
            unit: master?.unit,
            displayOrder: master?.displayOrder,
            isDiscountApplicable: master?.isDiscountApplicable ?? true,
            propertySocialDetailId: item.id,
            bitValue: item.bitValue,
            intValue: item.intValue,
            decimalValue: item.decimalValue,
            textValue: item.textValue,
            dateValue: item.dateValue,
            documentBindingId: item.documentBindingId,
            documentGuid: item.documentGuid,
            documentUrl:
              item.documentUrl ||
              (item.documentGuid ? `/api/documents/${item.documentGuid}/view` : undefined),
            fileName: item.fileName,
            remark: item.remark,
            isPhotoRequired: master?.isPhotoRequired,
            isDocumentRequired: master?.isDocumentRequired,
            isActive: master?.isActive,
            entityType: item.entityType,
            inheritedFrom: item.inheritedFrom,
            inheritanceLevel: item.inheritanceLevel,
          };
        });

      freshDiscountData = {
        propertyId: Number(propertyId),
        discountAttributes: mapped,
      };
    } else {
      const detailsRes = await getDiscountDetails(propertyId);
      if (detailsRes.success && detailsRes.data) {
        freshDiscountData = detailsRes.data;
      }
    }

    for (const l of ['en', 'hi', 'mr']) {
      revalidatePath(`/${l}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
    }
    return {
      success: true,
      message: 'Discount details saved successfully.',
      data: freshDiscountData,
    };
  } catch (error: unknown) {
    logger.error('updateDiscountDetailsAction failed', { propertyId, error: error as Error });
    return handleActionError(error, 'discount.socialConfirm.unexpectedError', locale);
  }
}

export async function uploadDiscountDocumentAction(
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

    const result = await uploadDiscountDocViaGlobalApi(
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
    logger.error('uploadDiscountDocumentAction failed', { error: error as Error });
    return handleActionError(error, 'discount.uploadError');
  }
}

export async function replaceDiscountDocumentAction(
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

    const result = await replaceDiscountDocViaGlobalApi(
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
    logger.error('replaceDiscountDocumentAction failed', {
      propertySocialDetailId,
      error: error as Error,
    });
    return handleActionError(error, 'discount.uploadError');
  }
}

export async function deleteDiscountDocumentAction(
  documentGuid: string
): Promise<ApiResponse<void>> {
  try {
    return await deleteDiscountDoc(documentGuid);
  } catch (error: unknown) {
    logger.error('deleteDiscountDocumentAction failed', { documentGuid, error: error as Error });
    return handleActionError(error, 'discount.deleteError');
  }
}

export async function deletePropertySocialDetailAction(
  propertyId: string,
  socialAttributeId: number,
  locale: string
): Promise<ApiResponse<void>> {
  try {
    const response = await deletePropertySocialDetail(propertyId, socialAttributeId);
    if (response.success) {
      revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
    }
    return response;
  } catch (error: unknown) {
    logger.error('deletePropertySocialDetailAction failed', {
      propertyId,
      socialAttributeId,
      error: error as Error,
    });
    return handleActionError(error, 'discount.deleteError', locale);
  }
}

export async function getSocialAttributeMasterAction(
  isActive?: boolean
): Promise<ApiResponse<SocialAttribute[]>> {
  try {
    const attributes = await getSocialAttributes(isActive);
    // Return all items from the API, bypassing any isActive filter since some test data has isActive: false
    return { success: true, data: attributes };
  } catch (error: unknown) {
    logger.error('getSocialAttributeMasterAction failed', { error: error as Error });
    return handleActionError(error, 'discount.unexpectedError');
  }
}

export async function createBulkPropertySocialDetailAction(
  payload: CreateBulkPropertySocialDetailDto
): Promise<ApiResponse<PropertySocialDetailsDto[]>> {
  try {
    const response = await createBulkPropertySocialDetail(payload);
    return response;
  } catch (error: unknown) {
    logger.error('createBulkPropertySocialDetailAction failed', {
      socialAttributeId: payload.socialAttributeId,
      propertyIdsCount: payload.propertyIds?.length,
      error: error as Error,
    });
    return handleActionError(error, 'discount.unexpectedError');
  }
}

export async function getDiscountWingsAction(
  propertyId: string,
  societyId?: number | string | null
): Promise<ApiResponse<WingOption[]>> {
  try {
    const wings = await getDiscountWings(propertyId, societyId);
    return { success: true, data: wings };
  } catch (error: unknown) {
    logger.error('getDiscountWingsAction failed', { propertyId, societyId, error: error as Error });
    return handleActionError(error, 'discount.unexpectedError');
  }
}

export async function getDiscountUnitsAction(
  propertyId: string,
  wingDetailId?: number | null,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<{ items: UnitSelectionItem[]; totalCount?: number }>> {
  try {
    const units = await getDiscountUnits(propertyId, wingDetailId, pageNumber, pageSize);
    return { success: true, data: units };
  } catch (error: unknown) {
    logger.error('getDiscountUnitsAction failed', {
      propertyId,
      wingDetailId,
      error: error as Error,
    });
    return handleActionError(error, 'discount.unexpectedError');
  }
}

export async function getPropertySocialDetailsByFiltersAction(
  socialAttributeId?: number,
  societyDetailId?: number,
  wingDetailId?: number,
  propertyId?: number
): Promise<ApiResponse<PropertySocialDetailsDto[]>> {
  try {
    const items = await getPropertySocialDetailsByFilters(
      socialAttributeId,
      societyDetailId,
      wingDetailId,
      propertyId
    );
    return { success: true, data: items || [] };
  } catch (error: unknown) {
    logger.error('getPropertySocialDetailsByFiltersAction failed', {
      socialAttributeId,
      societyDetailId,
      wingDetailId,
      propertyId,
      error: error as Error,
    });
    return handleActionError(error, 'discount.unexpectedError');
  }
}

export async function deletePropertySocialDetailsByHierarchyAction(
  params: DeletePropertySocialDetailsByHierarchyParams,
  propertyId?: string,
  locale?: string
): Promise<ApiResponse<void>> {
  try {
    const response = await deletePropertySocialDetailsByHierarchy(params);
    if (response.success && propertyId && locale) {
      revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
    }
    return response;
  } catch (error: unknown) {
    logger.error('deletePropertySocialDetailsByHierarchyAction failed', {
      socialAttributeId: params.socialAttributeId,
      entityType: params.entityType,
      error: error as Error,
    });
    return handleActionError(error, 'discount.deleteError', locale);
  }
}

export async function getPropertySocialDetailByIdAction(
  id: number
): Promise<ApiResponse<PropertySocialDetailsDto>> {
  try {
    return await getPropertySocialDetailById(id);
  } catch (error: unknown) {
    logger.error('getPropertySocialDetailByIdAction failed', { id, error: error as Error });
    return handleActionError(error, 'discount.unexpectedError');
  }
}

export async function createPropertySocialDetailAction(
  payload: CreatePropertySocialDetailDto,
  locale?: string
): Promise<ApiResponse<PropertySocialDetailsDto>> {
  try {
    const userId = getUserIdFromCookies(await cookies());
    if (!userId) return { success: false, error: 'Unauthorized: Please log in.' };
    payload.createdBy = Number(userId);

    const response = await createPropertySocialDetail(payload);
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
    logger.error('createPropertySocialDetailAction failed', {
      propertyId: payload.propertyId,
      socialAttributeId: payload.socialAttributeId,
      entityType: payload.entityType,
      error: error as Error,
    });
    return handleActionError(error, 'discount.unexpectedError', locale);
  }
}
