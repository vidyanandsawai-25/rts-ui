/**
 * Approval permissions require a real, assigned officer ID. Display names and
 * the backend's informational flags are deliberately not authorization inputs.
 */
export function isPositiveApprovalOfficerId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

/** Reads and validates the RTS officer identity without changing shared cookie utilities. */
export function getCurrentApprovalOfficerUserId(cookieStore: CookieStoreLike): number | null {
  const rawUserId = cookieStore.get('user_id')?.value;
  if (!rawUserId || !/^\d+$/.test(rawUserId)) return null;

  const userId = Number(rawUserId);
  return isPositiveApprovalOfficerId(userId) ? userId : null;
}

export function hasApprovalOfficerAccess(
  currentUserId: number | null | undefined,
  officerId: number | null | undefined
): boolean {
  return (
    isPositiveApprovalOfficerId(currentUserId) &&
    isPositiveApprovalOfficerId(officerId) &&
    currentUserId === officerId
  );
}
