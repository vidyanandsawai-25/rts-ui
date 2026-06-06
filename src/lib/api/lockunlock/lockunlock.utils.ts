import { LockedScreen, LockUnlockPropertyItem } from "@/types/loackunlock.types";

/**
 * Converts a list that may contain screen IDs or screen objects into an array of numeric IDs.
 */
export function getScreenIds(screensList: (number | LockedScreen)[]): number[] {
  return (screensList || [])
    .map((item: number | LockedScreen) => {
      if (item && typeof item === "object") {
        return Number((item as LockedScreen).id ?? 0);
      }
      return Number(item);
    })
    .filter((id) => id > 0);
}

/**
 * Maps locked screen IDs to their display names using the available screens list.
 */
export function getScreenNames(
  lockedScreenIds: number[],
  allScreens: LockedScreen[]
): string[] {
  return lockedScreenIds.map((id) => {
    const match = allScreens.find((s) => s.id === id);
    return match ? match.screenName : `Screen ID: ${id}`;
  });
}

/**
 * Resolves screen names from LockUnlockPropertyItem.lockedScreens.
 * Handles both number arrays and object arrays gracefully.
 */
export function resolveLockedScreenNames(
  property: LockUnlockPropertyItem,
  allScreens: LockedScreen[]
): string[] {
  const ids = getScreenIds(property.lockedScreens as unknown as (number | LockedScreen)[]);
  return getScreenNames(ids, allScreens);
}