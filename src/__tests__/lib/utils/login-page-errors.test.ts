import { describe, it, expect } from 'vitest';
import { resolveLoginPageErrorI18nSuffix } from '@/lib/utils/login-page-errors';

describe('resolveLoginPageErrorI18nSuffix', () => {
  it('maps allowlisted error codes', () => {
    expect(resolveLoginPageErrorI18nSuffix('sessionExpired')).toBe('sessionExpired');
    expect(resolveLoginPageErrorI18nSuffix('invalidToken')).toBe('invalidToken');
  });

  it('ignores arbitrary message text', () => {
    expect(resolveLoginPageErrorI18nSuffix(undefined, 'You have been hacked')).toBeNull();
    expect(resolveLoginPageErrorI18nSuffix(undefined, '<script>alert(1)</script>')).toBeNull();
  });

  it('prefers error over message when both present', () => {
    expect(resolveLoginPageErrorI18nSuffix('sessionExpired', 'LOGIN_FAILED')).toBe('sessionExpired');
  });

  it('allows allowlisted message when error is absent', () => {
    expect(resolveLoginPageErrorI18nSuffix(undefined, 'sessionExpired')).toBe('sessionExpired');
  });
});
