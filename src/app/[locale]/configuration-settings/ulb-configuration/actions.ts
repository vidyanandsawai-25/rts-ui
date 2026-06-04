'use server';

import type { ApiResponse } from '@/types/common.types';
import type {
  Department,
  DepartmentLicenceDetails,
  DepartmentLicense,
  ULBConfigurationFormData,
  UlbConfigurationMaster,
  UlbConfigurationPageData,
  UlbSectionKey,
} from '@/types/ulbconfig-master.types';
import { ApiError } from '@/lib/utils/api';
import {
  createUlbMaster,
  getUlbMaster,
  getUlbMasterById,
  updateUlbMaster,
} from '@/lib/api/configuration-settings/ulb-configuration/ulb-master.services';
import {
  createDepartmentLicence,
  getAllDepartmentLicences,
  getAllDepartments,
  saveDepartmentLicence,
  updateDepartmentLicence,
  syncMasterDepartmentWithLicense,
} from '@/lib/api/configuration-settings/ulb-configuration/ulbConfiguration.service';
import {
  findInvalidEnabledDepartment,
  getDepartmentLicencesToSave,
} from '@/lib/api/configuration-settings/ulb-configuration/department-licence.validator';
import {
  handleActionError,
  revalidateUlbConfiguration,
  resolveUserId,
  validateAndNormalize,
} from './actions.utils';

function isLicenseExpiredServer(endDateStr: string): boolean {
  if (!endDateStr) return false;
  const dateOnlyStr = endDateStr.split('T')[0];
  const parts = dateOnlyStr.split('-');
  if (parts.length !== 3 || parts[0].length !== 4 || parts[1].length !== 2 || parts[2].length !== 2) {
    return false;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  return dateOnlyStr < todayStr;
}

/**
 * Loads all SSR data required by the ULB configuration screen.
 * Uses partial success so one failed endpoint does not block the whole page.
 */
export async function getUlbConfigurationPageDataAction(): Promise<
  ApiResponse<UlbConfigurationPageData>
> {
  const [ulbResult, licencesResult] = await Promise.allSettled([
    getUlbMaster(),
    getAllDepartmentLicences(),
  ]);

  const ulb = ulbResult.status === 'fulfilled' ? ulbResult.value : null;
  const licences = licencesResult.status === 'fulfilled' ? licencesResult.value : [];

  const allRejected =
    ulbResult.status === 'rejected' &&
    licencesResult.status === 'rejected';

  if (allRejected) {
    return handleActionError<UlbConfigurationPageData>(
      ulbResult.reason,
      'messages.fetchError'
    );
  }

  // Auto-deactivate expired active department licenses
  let hasExpiredUpdates = false;
  const userId = await resolveUserId();

  for (const licence of licences) {
    const isLicenseActive = !!(licence.isActive ?? licence.isEnabled);
    if (isLicenseActive && licence.licenceEndDate) {
      if (isLicenseExpiredServer(licence.licenceEndDate)) {
        licence.isActive = false;
        licence.isEnabled = false;
        licence.status = 'inactive';
        hasExpiredUpdates = true;

        if (licence.departmentLicenceDetailsId != null) {
          try {
            await updateDepartmentLicence(licence.departmentLicenceDetailsId, {
              ...licence,
              isActive: false,
              isEnabled: false,
              status: 'inactive',
            });
          } catch (err) {
            console.error(`[ULBConfiguration] Failed to auto-deactivate expired license ${licence.departmentLicenceDetailsId}:`, err);
          }
        }

        const deptId = licence.departmentId ?? licence.departmentMasterId;
        if (deptId != null && userId != null) {
          try {
            await syncMasterDepartmentWithLicense(deptId, false, userId);
          } catch (err) {
            console.error(`[ULBConfiguration] Failed to sync deactivated license for department ${deptId} to master:`, err);
          }
        }
      }
    }
  }

  if (hasExpiredUpdates) {
    revalidateUlbConfiguration();
  }

  return {
    success: true,
    data: { ulb, departments: [], licences },
  };
}

/** GET `/DepartmentMaster?PageNumber=1&PageSize=-1` — all departments for the licence section. */
export async function getAllDepartmentsAction(): Promise<ApiResponse<Department[]>> {
  try {
    const data = await getAllDepartments();
    return { success: true, data };
  } catch (error: unknown) {
    return handleActionError<Department[]>(error, 'messages.fetchError');
  }
}

/** GET `/DepartmentLicenceDetails?PageNumber=1&PageSize=-1` — all department licences. */
export async function getAllDepartmentLicencesAction(): Promise<
  ApiResponse<DepartmentLicenceDetails[]>
> {
  try {
    const data = await getAllDepartmentLicences();
    return { success: true, data };
  } catch (error: unknown) {
    return handleActionError<DepartmentLicenceDetails[]>(error, 'messages.fetchError');
  }
}

/** GET `/ULBMaster` — active ULB configuration record. */
export async function getUlbMasterAction(): Promise<ApiResponse<UlbConfigurationMaster | null>> {
  try {
    const data = await getUlbMaster();
    return { success: true, data };
  } catch (error: unknown) {
    return handleActionError<UlbConfigurationMaster | null>(error, 'messages.fetchError');
  }
}

/** GET `/ULBMaster/{id}` — single ULB master record. */
export async function getUlbMasterByIdAction(id: number): Promise<ApiResponse<UlbConfigurationMaster>> {
  try {
    const data = await getUlbMasterById(id);
    return { success: true, data };
  } catch (error: unknown) {
    return handleActionError<UlbConfigurationMaster>(error, 'messages.fetchError');
  }
}

/**
 * POST `/ULBMaster` — create ULB master configuration.
 */
export async function createUlbMasterAction(
  data: ULBConfigurationFormData,
  section?: UlbSectionKey
): Promise<ApiResponse<UlbConfigurationMaster>> {
  try {
    const validationResult = validateAndNormalize(data, section);

    if (!validationResult.isValid) {
      return { success: false, error: `validation.${validationResult.validationCode}` };
    }

    const userId = await resolveUserId();
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'User session expired');
    }

    const result = await createUlbMaster(validationResult.normalizedData);

    revalidateUlbConfiguration();

    return {
      success: true,
      data: result.ulb,
      message: result.message,
    };
  } catch (error: unknown) {
    return handleActionError<UlbConfigurationMaster>(error, 'messages.createFailed');
  }
}

/**
 * PUT `/ULBMaster/{id}` — update ULB master configuration.
 */
export async function updateUlbMasterAction(
  id: number,
  data: ULBConfigurationFormData,
  section?: UlbSectionKey
): Promise<ApiResponse<UlbConfigurationMaster>> {
  try {
    const validationResult = validateAndNormalize(data, section);

    if (!validationResult.isValid) {
      return { success: false, error: `validation.${validationResult.validationCode}` };
    }

    const userId = await resolveUserId();
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'User session expired');
    }

    const result = await updateUlbMaster(id, validationResult.normalizedData);

    revalidateUlbConfiguration();

    return {
      success: true,
      data: result.ulb,
      message: result.message,
    };
  } catch (error: unknown) {
    return handleActionError<UlbConfigurationMaster>(error, 'messages.updateFailed');
  }
}

export async function updateDepartmentLicenceAction(
  id: number | string,
  data: DepartmentLicenceDetails
): Promise<ApiResponse<DepartmentLicenceDetails>> {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'User session expired');
    }

    const result = await updateDepartmentLicence(id, data);
    revalidateUlbConfiguration();
    return { success: true, data: result.licence, message: result.message };
  } catch (error: unknown) {
    return handleActionError<DepartmentLicenceDetails>(error, 'messages.updateFailed');
  }
}

export async function createDepartmentLicenceAction(
  data: DepartmentLicenceDetails
): Promise<ApiResponse<DepartmentLicenceDetails>> {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'User session expired');
    }

    const result = await createDepartmentLicence(data);
    revalidateUlbConfiguration();
    return { success: true, data: result.licence, message: result.message };
  } catch (error: unknown) {
    return handleActionError<DepartmentLicenceDetails>(error, 'messages.createFailed');
  }
}

/** PUT `/DepartmentLicenceDetails/{id}` — update a single department licence. */
export async function updateDepartmentLicenceByIdAction(
  id: number,
  dept: DepartmentLicense
): Promise<ApiResponse<DepartmentLicenceDetails>> {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'User session expired');
    }

    if (!dept.startDate?.trim() || !dept.duration?.trim() || !dept.endDate?.trim()) {
      return { success: false, error: 'messages.validation' };
    }

    const result = await saveDepartmentLicence({ ...dept, departmentLicenceDetailsId: id });
    revalidateUlbConfiguration();
    return { success: true, data: result.licence, message: result.message };
  } catch (error: unknown) {
    return handleActionError<DepartmentLicenceDetails>(error, 'messages.updateFailed');
  }
}

/** POST/PUT `/DepartmentLicenceDetails` — save enabled department licence cards. */
export async function saveDepartmentLicencesAction(
  departments: DepartmentLicense[]
): Promise<ApiResponse<DepartmentLicenceDetails[]>> {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'User session expired');
    }

    const toSave = getDepartmentLicencesToSave(departments);
    if (toSave.length === 0) {
      return { success: false, error: 'messages.noDepartments' };
    }

    if (findInvalidEnabledDepartment(toSave)) {
      return { success: false, error: 'messages.validation' };
    }

    const results = await Promise.allSettled(toSave.map((dept) => saveDepartmentLicence(dept)));

    const saved: DepartmentLicenceDetails[] = [];
    const failures: string[] = [];
    let lastMessage = 'Record saved successfully';

    for (const result of results) {
      if (result.status === 'fulfilled') {
        saved.push(result.value.licence);
        lastMessage = result.value.message;
      } else {
        const failure = handleActionError<never>(result.reason, 'messages.error');
        failures.push(failure.error ?? 'messages.error');
      }
    }

    if (saved.length === 0) {
      const firstRejected = results.find((result) => result.status === 'rejected');
      return handleActionError<DepartmentLicenceDetails[]>(
        firstRejected?.status === 'rejected' ? firstRejected.reason : undefined,
        'messages.error'
      );
    }

    // Sync active state back to DepartmentMaster
    for (const licence of saved) {
      const deptId = licence.departmentId ?? licence.departmentMasterId;
      if (deptId != null) {
        await syncMasterDepartmentWithLicense(deptId, !!licence.isActive, userId);
      }
    }

    revalidateUlbConfiguration();

    if (failures.length > 0) {
      return {
        success: false,
        data: saved,
        error: failures[0],
        message: lastMessage,
      };
    }

    return {
      success: true,
      data: saved,
      message: lastMessage,
    };
  } catch (error: unknown) {
    return handleActionError<DepartmentLicenceDetails[]>(error, 'messages.error');
  }
}
