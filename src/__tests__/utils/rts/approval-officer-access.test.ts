import { describe, expect, it } from 'vitest';

import {
  getCurrentApprovalOfficerUserId,
  hasApprovalOfficerAccess,
  isPositiveApprovalOfficerId,
} from '@/lib/utils/rts/approval-officer-access';

describe('approval officer access', () => {
  it('allows only matching positive integer IDs', () => {
    expect(hasApprovalOfficerAccess(12, 12)).toBe(true);
    expect(hasApprovalOfficerAccess(12, 13)).toBe(false);
  });

  it('rejects missing, zero, fractional, and non-numeric IDs', () => {
    expect(hasApprovalOfficerAccess(null, 12)).toBe(false);
    expect(hasApprovalOfficerAccess(0, 12)).toBe(false);
    expect(hasApprovalOfficerAccess(12.5, 12)).toBe(false);
    expect(isPositiveApprovalOfficerId('12')).toBe(false);
  });

  it('strictly reads the user_id cookie used for RTS approval actions', () => {
    const cookieStore = (value?: string) => ({
      get: (name: string) => (name === 'user_id' && value ? { value } : undefined),
    });

    expect(getCurrentApprovalOfficerUserId(cookieStore('12'))).toBe(12);
    expect(getCurrentApprovalOfficerUserId(cookieStore('12abc'))).toBeNull();
    expect(getCurrentApprovalOfficerUserId(cookieStore('0'))).toBeNull();
  });
});
