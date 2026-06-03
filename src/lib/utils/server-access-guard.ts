import { cookies } from 'next/headers';
import { getUserIdFromCookies } from '@/lib/utils/auth-session';
import { userScreenAccessService } from '@/lib/api/user-screen-access.service';
import { getUserById } from '@/lib/api/configuration-settings/user-management/user.services';
import { filterScreensByAllocatedRoles, mergeUserScreens } from '@/lib/utils/module-access-guard';

export async function verifyServerActionAccess(
  screenCode: string,
  requiredAccess: 'view' | 'edit' | 'delete'
): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const userId = getUserIdFromCookies(cookieStore);
    if (!authToken || userId == null) return false;

    const screensRes = await userScreenAccessService.getScreensForUser(userId, authToken);
    if (!screensRes.success || !screensRes.data) return false;

    let screens = screensRes.data;

    // Apply department-role filtering if user profile allocations exist
    const userProfileRes = await getUserById(String(userId));
    if (userProfileRes && userProfileRes.roleAccess) {
      screens = filterScreensByAllocatedRoles(screens, userProfileRes.roleAccess);
    }

    const merged = mergeUserScreens(screens);
    const target = merged.find((s) => s.screenCode?.toUpperCase() === screenCode.toUpperCase());
    if (!target) return false;

    if (target.haveFullAccess) return true;
    if (requiredAccess === 'view') return target.canView;
    if (requiredAccess === 'edit') return target.canEdit;
    if (requiredAccess === 'delete') return target.canDelete;

    return false;
  } catch {
    return false;
  }
}
