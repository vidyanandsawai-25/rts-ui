import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// ─────────────────────────────────────────────
// 1. MODULE IMPORTS
// ─────────────────────────────────────────────

import { useFooterActions } from '@/hooks/layout/useFooterActions';
import { FOOTER_REGISTRY, DEFAULT_ACTION_STYLE } from '@/config/footer-registry';
import type { FooterAction } from '@/lib/api/footer.service';

// ─────────────────────────────────────────────
// 2. SHARED FACTORY HELPERS
// ─────────────────────────────────────────────

function makeAction(overrides: Partial<FooterAction> = {}): FooterAction {
  return {
    id: 1,
    actionCommand: 'M_PRINT',
    buttonName: 'Print',
    displayOrder: 1,
    isEnabled: true,
    canView: true,
    canEdit: true,
    canDelete: true,
    haveFullAccess: false,
    haveNoAccess: false,
    style: FOOTER_REGISTRY['M_PRINT'] ?? DEFAULT_ACTION_STYLE,
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// 3. FOOTER_REGISTRY CONFIG
// ─────────────────────────────────────────────

describe('FOOTER_REGISTRY', () => {
  it('exports a non-empty registry object', () => {
    expect(typeof FOOTER_REGISTRY).toBe('object');
    expect(Object.keys(FOOTER_REGISTRY).length).toBeGreaterThan(0);
  });

  it('every entry has required shape (iconName, variant, alignment)', () => {
    for (const [key, style] of Object.entries(FOOTER_REGISTRY)) {
      expect(typeof style.iconName, `${key}.iconName`).toBe('string');
      expect(['primary', 'outline', 'secondary', 'ghost', 'danger', 'success', 'blue']).toContain(
        style.variant
      );
      expect(['left', 'middle', 'right']).toContain(style.alignment);
    }
  });

  it('right-aligned actions exist for save / submit / apply', () => {
    const rightKeys = Object.entries(FOOTER_REGISTRY)
      .filter(([, s]) => s.alignment === 'right')
      .map(([k]) => k);
    expect(rightKeys.length).toBeGreaterThan(0);
    expect(rightKeys).toContain('R_SAVE');
    expect(rightKeys).toContain('R_SUBMIT');
    expect(rightKeys).toContain('PTIS_SAVE');
  });

  it('left-aligned actions exist for navigation', () => {
    const leftKeys = Object.entries(FOOTER_REGISTRY)
      .filter(([, s]) => s.alignment === 'left')
      .map(([k]) => k);
    expect(leftKeys).toContain('L_BACK');
    expect(leftKeys).toContain('L_CANCEL');
  });

  it('middle-aligned actions contain utility commands', () => {
    const middleKeys = Object.entries(FOOTER_REGISTRY)
      .filter(([, s]) => s.alignment === 'middle')
      .map(([k]) => k);
    expect(middleKeys).toContain('M_PRINT');
    expect(middleKeys).toContain('M_CALCULATE');
    expect(middleKeys).toContain('M_DELETE');
  });

  it('DEFAULT_ACTION_STYLE is a valid fallback style', () => {
    expect(DEFAULT_ACTION_STYLE.iconName).toBe('FileText');
    expect(DEFAULT_ACTION_STYLE.variant).toBe('outline');
    expect(DEFAULT_ACTION_STYLE.alignment).toBe('middle');
  });

  it('PTIS_REFRESH is blue variant', () => {
    expect(FOOTER_REGISTRY['PTIS_REFRESH']?.variant).toBe('blue');
  });

  it('M_DELETE has danger variant', () => {
    expect(FOOTER_REGISTRY['M_DELETE']?.variant).toBe('danger');
  });
});

// ─────────────────────────────────────────────
// 4. useFooterActions HOOK
// ─────────────────────────────────────────────

describe('useFooterActions', () => {
  // ── 4.1 Defaults ──────────────────────────

  it('returns empty utility and right arrays when no actions provided', () => {
    const { result } = renderHook(() => useFooterActions());
    expect(result.current.utility).toEqual([]);
    expect(result.current.right).toEqual([]);
  });

  it('returns empty arrays when empty array is passed', () => {
    const { result } = renderHook(() => useFooterActions([]));
    expect(result.current.utility).toEqual([]);
    expect(result.current.right).toEqual([]);
  });

  // ── 4.2 Permission: haveNoAccess ─────────

  it('disables actions with haveNoAccess=true', () => {
    const actions = [makeAction({ haveNoAccess: true, actionCommand: 'M_PRINT' })];
    const { result } = renderHook(() => useFooterActions(actions));
    expect(result.current.utility).toHaveLength(1);
    expect(result.current.utility[0].isEnabled).toBe(false);
  });

  it('keeps actions where haveNoAccess is false', () => {
    const actions = [makeAction({ haveNoAccess: false })];
    const { result } = renderHook(() => useFooterActions(actions));
    expect(result.current.utility).toHaveLength(1);
  });

  // ── 4.3 Permission: canView ───────────────

  it('disables actions where canView=false', () => {
    const actions = [makeAction({ canView: false })];
    const { result } = renderHook(() => useFooterActions(actions));
    expect(result.current.utility).toHaveLength(1);
    expect(result.current.utility[0].isEnabled).toBe(false);
  });

  it('keeps actions where canView=true', () => {
    const actions = [makeAction({ canView: true })];
    const { result } = renderHook(() => useFooterActions(actions));
    expect(result.current.utility).toHaveLength(1);
  });

  it('keeps actions where canView is undefined (permissive default)', () => {
    const actions = [makeAction({ canView: undefined })];
    const { result } = renderHook(() => useFooterActions(actions));
    expect(result.current.utility).toHaveLength(1);
  });

  // ── 4.4 Permission: haveFullAccess ───────

  it('haveFullAccess=true bypasses all other checks', () => {
    const actions = [
      makeAction({
        haveFullAccess: true,
        haveNoAccess: false,
        canEdit: false,
        // Use middle alignment so the action ends up in utility[]
        actionCommand: 'M_PRINT',
        style: { ...FOOTER_REGISTRY['M_PRINT'], alignment: 'middle' },
      }),
    ];
    const { result } = renderHook(() => useFooterActions(actions));
    expect(result.current.utility).toHaveLength(1);
  });

  // ── 4.5 Permission: delete commands ──────

  it('disables DELETE command without canDelete', () => {
    const actions = [makeAction({ actionCommand: 'M_DELETE', canDelete: false })];
    const { result } = renderHook(() => useFooterActions(actions));
    expect(result.current.utility).toHaveLength(1);
    expect(result.current.utility[0].isEnabled).toBe(false);
  });

  it('keeps DELETE command when canDelete=true', () => {
    const actions = [makeAction({ actionCommand: 'M_DELETE', canDelete: true })];
    const { result } = renderHook(() => useFooterActions(actions));
    expect(result.current.utility).toHaveLength(1);
  });

  // ── 4.6 Permission: edit commands ────────

  const editCommands = [
    'PTIS_SAVE',
    'PTIS_UPDATE',
    'PTIS_SUBMIT',
    'PTIS_EDIT_ENTRY',
    'PTIS_ADD',
    'PTIS_QC',
    'PTIS_COMBINE',
    'PTIS_SPLIT',
    'PTIS_PARTITION',
    'PTIS_TRANSFER',
    'PTIS_AMALGAMATION',
    'PTIS_OBJECTION',
    'PTIS_CALC',
    'PTIS_DISCOUNT',
    'PTIS_APPLY',
  ];

  for (const cmd of editCommands) {
    it(`disables ${cmd} when canEdit=false`, () => {
      const style = FOOTER_REGISTRY[cmd] ?? DEFAULT_ACTION_STYLE;
      const actions = [makeAction({ actionCommand: cmd, canEdit: false, style })];
      const { result } = renderHook(() => useFooterActions(actions));
      const all = [...result.current.utility, ...result.current.right];
      expect(all).toHaveLength(1);
      expect(all[0].isEnabled).toBe(false);
    });

    it(`keeps ${cmd} when canEdit=true`, () => {
      const style = FOOTER_REGISTRY[cmd] ?? DEFAULT_ACTION_STYLE;
      const actions = [makeAction({ actionCommand: cmd, canEdit: true, style })];
      const { result } = renderHook(() => useFooterActions(actions));
      const all = [...result.current.utility, ...result.current.right];
      expect(all).toHaveLength(1);
      expect(all[0].isEnabled).toBe(true);
    });
  }

  // ── 4.7 Sorting ───────────────────────────

  it('sorts actions by displayOrder ascending', () => {
    const actions = [
      makeAction({ displayOrder: 3, actionCommand: 'M_PRINT', id: 3 }),
      makeAction({ displayOrder: 1, actionCommand: 'M_CALCULATE', id: 1 }),
      makeAction({ displayOrder: 2, actionCommand: 'M_SEARCH', id: 2 }),
    ];
    const { result } = renderHook(() => useFooterActions(actions));
    const orders = result.current.utility.map((a) => a.displayOrder);
    expect(orders).toEqual([1, 2, 3]);
  });

  it('handles missing displayOrder (treats as 0)', () => {
    const actions = [
      makeAction({ displayOrder: undefined as unknown as number, id: 1 }),
      makeAction({ displayOrder: 5, id: 2 }),
    ];
    const { result } = renderHook(() => useFooterActions(actions));
    expect(result.current.utility[0].id).toBe(1);
  });

  // ── 4.8 Alignment grouping ────────────────

  it('separates right-aligned actions into right array', () => {
    const rightAction = makeAction({
      actionCommand: 'PTIS_SAVE',
      style: FOOTER_REGISTRY['PTIS_SAVE'],
    });
    const middleAction = makeAction({
      actionCommand: 'M_PRINT',
      style: FOOTER_REGISTRY['M_PRINT'],
      id: 2,
    });
    const { result } = renderHook(() => useFooterActions([rightAction, middleAction]));
    expect(result.current.right).toHaveLength(1);
    expect(result.current.right[0].actionCommand).toBe('PTIS_SAVE');
    expect(result.current.utility).toHaveLength(1);
    expect(result.current.utility[0].actionCommand).toBe('M_PRINT');
  });

  it('places left-aligned actions in utility group', () => {
    const leftAction = makeAction({
      actionCommand: 'L_BACK',
      style: FOOTER_REGISTRY['L_BACK'],
    });
    const { result } = renderHook(() => useFooterActions([leftAction]));
    expect(result.current.utility).toHaveLength(1);
    expect(result.current.utility[0].actionCommand).toBe('L_BACK');
  });

  // ── 4.9 Centering logic ───────────────────

  it('centers the primary action when multiple utility actions exist', () => {
    const actions = [
      makeAction({
        id: 1,
        displayOrder: 1,
        style: { ...DEFAULT_ACTION_STYLE, alignment: 'middle', variant: 'outline' },
      }),
      makeAction({
        id: 2,
        displayOrder: 2,
        style: { ...DEFAULT_ACTION_STYLE, alignment: 'middle', variant: 'primary' },
      }),
      makeAction({
        id: 3,
        displayOrder: 3,
        style: { ...DEFAULT_ACTION_STYLE, alignment: 'middle', variant: 'outline' },
      }),
      makeAction({
        id: 4,
        displayOrder: 4,
        style: { ...DEFAULT_ACTION_STYLE, alignment: 'middle', variant: 'outline' },
      }),
    ];
    const { result } = renderHook(() => useFooterActions(actions));
    const utility = result.current.utility;
    const primaryIdx = utility.findIndex((a) => a.style.variant === 'primary');
    // Primary should be placed near center (not first or last for 4 items)
    expect(primaryIdx).toBeGreaterThan(0);
    expect(primaryIdx).toBeLessThan(utility.length - 1);
  });

  it('does not reorder when only one utility action', () => {
    const actions = [
      makeAction({ style: { ...DEFAULT_ACTION_STYLE, alignment: 'middle', variant: 'primary' } }),
    ];
    const { result } = renderHook(() => useFooterActions(actions));
    expect(result.current.utility).toHaveLength(1);
  });

  it('does not reorder when no primary variant found in utility', () => {
    const actions = [
      makeAction({
        id: 1,
        style: { ...DEFAULT_ACTION_STYLE, alignment: 'middle', variant: 'outline' },
      }),
      makeAction({
        id: 2,
        style: { ...DEFAULT_ACTION_STYLE, alignment: 'middle', variant: 'secondary' },
      }),
    ];
    const { result } = renderHook(() => useFooterActions(actions));
    expect(result.current.utility[0].id).toBe(1);
    expect(result.current.utility[1].id).toBe(2);
  });

  // ── 4.10 Non-array input guard ────────────

  it('gracefully handles non-array actions input', () => {
    // Cast to test defensive path
    const { result } = renderHook(() => useFooterActions(null as unknown as FooterAction[]));
    expect(result.current.utility).toEqual([]);
    expect(result.current.right).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// 5. FOOTER SERVER ACTIONS
// ─────────────────────────────────────────────

// Mock next/headers, next/navigation, and footerService before importing server actions
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    const error = new Error('NEXT_REDIRECT') as Error & { digest: string };
    error.digest = `NEXT_REDIRECT;307;${url};temporary;`;
    throw error;
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    forEach: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    toString: vi.fn(() => ''),
  }),
  usePathname: () => '/',
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/services/footer.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/footer.service')>();
  return {
    ...actual,
    footerService: {
      getAuthorizedActions: vi.fn(),
    },
  };
});

// Mock apiClient used inside footerService tests
vi.mock('@/services/api.service', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('handleFooterAction (server action)', () => {
  beforeEach(() => vi.clearAllMocks());

  // Dynamic import so mocks are applied first
  async function importAction() {
    const mod = await import('@/app/[locale]/footer-actions');
    return mod;
  }

  it('returns success for CALCULATE command', async () => {
    const { handleFooterAction } = await importAction();
    const result = await handleFooterAction('CALCULATE', {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message).toContain('Calculation');
    }
  });

  it('returns success for SAVE_PTIS command', async () => {
    const { handleFooterAction } = await importAction();
    const result = await handleFooterAction('SAVE_PTIS', {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message).toContain('saved');
    }
  });

  it('returns failure for unknown command', async () => {
    const { handleFooterAction } = await importAction();
    const result = await handleFooterAction('UNKNOWN_CMD', {});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('UNKNOWN_CMD');
    }
  });

  it('returns failure with "not yet implemented" for random command', async () => {
    const { handleFooterAction } = await importAction();
    const result = await handleFooterAction('SOME_RANDOM_ACTION', null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/not yet implemented/i);
    }
  });

  it('throws a redirect error for PTIS_EDIT_ENTRY with valid propertyId without query params', async () => {
    const { handleFooterAction } = await importAction();
    try {
      await handleFooterAction('PTIS_EDIT_ENTRY', { propertyId: '123', locale: 'en' });
      // Should not reach here because redirect throws a NEXT_REDIRECT error
      expect.fail('Expected redirect to throw an error');
    } catch (error) {
      const err = error as Error & { digest?: string };
      expect(err).toBeDefined();
      expect(err.digest).toBeDefined();
      expect(err.digest).toContain('NEXT_REDIRECT');
      expect(err.digest).toContain('/en/property-tax/ptis/QuickDataEntry/123/Property');
      // Verify it doesn't end with ?
      expect(err.digest).not.toContain('Property?');
    }
  });

  it('throws a redirect error for PTIS_EDIT_ENTRY with valid propertyId and query params', async () => {
    const { handleFooterAction } = await importAction();
    try {
      await handleFooterAction('PTIS_EDIT_ENTRY', {
        propertyId: '123',
        locale: 'en',
        wardNo: 'W01',
        wardId: '10',
        propertyNo: 'P001',
        partitionNo: 'A',
      });
      expect.fail('Expected redirect to throw an error');
    } catch (error) {
      const err = error as Error & { digest?: string };
      expect(err).toBeDefined();
      expect(err.digest).toBeDefined();
      expect(err.digest).toContain('NEXT_REDIRECT');
      expect(err.digest).toContain('/en/property-tax/ptis/QuickDataEntry/123/Property?wardNo=W01&wardId=10&propertyNo=P001&partitionNo=A');
    }
  });

  it('returns failure for PTIS_EDIT_ENTRY when propertyId is missing', async () => {
    const { handleFooterAction } = await importAction();
    const result = await handleFooterAction('PTIS_EDIT_ENTRY', { locale: 'en' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Property ID is missing');
    }
  });
});

describe('getFooterActionsAction (server action)', () => {
  beforeEach(() => vi.clearAllMocks());

  async function importAction() {
    const mod = await import('@/app/[locale]/footer-actions');
    return mod;
  }

  it('returns success with data when footerService resolves', async () => {
    const { footerService } = await import('@/lib/api/footer.service');
    const mockActions: FooterAction[] = [makeAction()];
    vi.spyOn(footerService, 'getAuthorizedActions').mockResolvedValueOnce(mockActions);

    const { getFooterActionsAction } = await importAction();
    const result = await getFooterActionsAction(42, '/property-tax/ptis');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(mockActions);
    }
  });

  it('returns success with empty array when no actions returned', async () => {
    const { footerService } = await import('@/lib/api/footer.service');
    vi.spyOn(footerService, 'getAuthorizedActions').mockResolvedValueOnce([]);

    const { getFooterActionsAction } = await importAction();
    const result = await getFooterActionsAction(42);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('returns failure when footerService throws an Error', async () => {
    const { footerService } = await import('@/lib/api/footer.service');
    vi.spyOn(footerService, 'getAuthorizedActions').mockRejectedValueOnce(
      new Error('Network timeout')
    );

    const { getFooterActionsAction } = await importAction();
    const result = await getFooterActionsAction(42);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Network timeout');
    }
  });

  it('returns generic error message when non-Error is thrown', async () => {
    const { footerService } = await import('@/lib/api/footer.service');
    vi.spyOn(footerService, 'getAuthorizedActions').mockRejectedValueOnce('string error');

    const { getFooterActionsAction } = await importAction();
    const result = await getFooterActionsAction(42);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('An unexpected error occurred');
    }
  });
});

// ─────────────────────────────────────────────
// 6. footerService.getAuthorizedActions (unit)
// Tests use the real service implementation wired to the
// top-level vi.mock of @/services/api.service.
// ─────────────────────────────────────────────

// We need the REAL footerService, not the mocked one from section 5.
// Use a factory that creates its own isolated import.
let realApiClientGet: ReturnType<typeof vi.fn>;

vi.mock('@/services/footer.service', async (importOriginal) => {
  // Keep the real implementation for footerService so we test actual logic
  const actual = await importOriginal<typeof import('@/lib/api/footer.service')>();
  return actual;
});

describe('footerService.getAuthorizedActions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Grab the mocked apiClient.get reference
    const { apiClient } = await import('@/services/api.service');
    realApiClientGet = vi.mocked(apiClient.get);
  });

  it('returns empty array when userRoleId is 0 (falsy guard)', async () => {
    const { footerService: svc } = await import('@/lib/api/footer.service');
    // userRoleId=0 is falsy — the service should return [] without calling api
    const result = await svc.getAuthorizedActions({ userRoleId: 0 });
    expect(result).toEqual([]);
    expect(realApiClientGet).not.toHaveBeenCalled();
  });

  it('returns mapped actions with registry style for known command', async () => {
    const dto = {
      id: 1,
      actionCommand: 'M_PRINT',
      buttonName: 'Print',
      displayOrder: 1,
      isEnabled: true,
    };
    realApiClientGet.mockResolvedValueOnce({ success: true, data: [dto] });

    const { footerService: svc } = await import('@/lib/api/footer.service');
    const result = await svc.getAuthorizedActions({ userRoleId: 5 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
    const printed = result.find((a) => a.actionCommand === 'M_PRINT');
    expect(printed?.style.iconName).toBe(FOOTER_REGISTRY['M_PRINT'].iconName);
  });

  it('applies DEFAULT_ACTION_STYLE for unknown command', async () => {
    realApiClientGet.mockResolvedValueOnce({
      success: true,
      data: [
        { id: 2, actionCommand: 'UNKNOWN_XYZ', buttonName: 'X', displayOrder: 1, isEnabled: true },
      ],
    });

    const { footerService: svc } = await import('@/lib/api/footer.service');
    const result = await svc.getAuthorizedActions({ userRoleId: 5 });

    const found = result.find((a) => a.actionCommand === 'UNKNOWN_XYZ');
    expect(found?.style.iconName).toBe(DEFAULT_ACTION_STYLE.iconName);
  });

  it('prefers lucideIcon from DTO over registry iconName', async () => {
    realApiClientGet.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 3,
          actionCommand: 'M_PRINT',
          lucideIcon: 'Star',
          buttonName: 'Print',
          displayOrder: 1,
          isEnabled: true,
        },
      ],
    });

    const { footerService: svc } = await import('@/lib/api/footer.service');
    const result = await svc.getAuthorizedActions({ userRoleId: 5 });

    const found = result.find((a) => a.actionCommand === 'M_PRINT');
    expect(found?.style.iconName).toBe('Star');
  });

  it('unwraps wrapped { items: [] } response shape', async () => {
    const dto = {
      id: 4,
      actionCommand: 'M_SEARCH',
      buttonName: 'Search',
      displayOrder: 1,
      isEnabled: true,
    };
    realApiClientGet.mockResolvedValueOnce({ success: true, data: { items: [dto] } });

    const { footerService: svc } = await import('@/lib/api/footer.service');
    const result = await svc.getAuthorizedActions({ userRoleId: 5 });

    const found = result.find((a) => a.actionCommand === 'M_SEARCH');
    expect(found).toBeDefined();
  });

  it('filters by targetRoute — includes matching path', async () => {
    const dtos = [
      {
        id: 1,
        actionCommand: 'M_PRINT',
        buttonName: 'Print',
        displayOrder: 1,
        isEnabled: true,
        routePath: '/property-tax/ptis',
      },
      {
        id: 2,
        actionCommand: 'R_SAVE',
        buttonName: 'Save',
        displayOrder: 2,
        isEnabled: true,
        routePath: '/other-route',
      },
    ];
    realApiClientGet.mockResolvedValueOnce({ success: true, data: dtos });

    const { footerService: svc } = await import('@/lib/api/footer.service');
    const result = await svc.getAuthorizedActions({
      userRoleId: 5,
      targetRoute: '/property-tax/ptis',
    });

    expect(result.find((a) => a.actionCommand === 'M_PRINT')).toBeDefined();
    expect(result.find((a) => a.actionCommand === 'R_SAVE')).toBeUndefined();
  });

  it('excludes items with no routePath when targetRoute is specified', async () => {
    realApiClientGet.mockResolvedValueOnce({
      success: true,
      data: [
        { id: 5, actionCommand: 'M_PRINT', buttonName: 'P', displayOrder: 1, isEnabled: true },
      ],
    });

    const { footerService: svc } = await import('@/lib/api/footer.service');
    const result = await svc.getAuthorizedActions({ userRoleId: 5, targetRoute: '/some/route' });
    expect(result.find((a) => a.actionCommand === 'M_PRINT')).toBeUndefined();
  });

  it('returns fallback actions when API call fails (success: false)', async () => {
    realApiClientGet.mockResolvedValueOnce({ success: false, data: null });

    const { footerService: svc } = await import('@/lib/api/footer.service');
    const result = await svc.getAuthorizedActions({ userRoleId: 5 });
    expect(result.length).toBe(13);
    expect(result[0].actionCommand).toBe('PTIS_QC');
  });

  it('returns fallback actions when API throws', async () => {
    realApiClientGet.mockRejectedValueOnce(new Error('500 server error'));

    const { footerService: svc } = await import('@/lib/api/footer.service');
    const result = await svc.getAuthorizedActions({ userRoleId: 5 });
    expect(result.length).toBe(13);
    expect(result[0].actionCommand).toBe('PTIS_QC');
  });

  it('route matching is case-insensitive and trims slashes', async () => {
    realApiClientGet.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 6,
          actionCommand: 'M_PRINT',
          buttonName: 'P',
          displayOrder: 1,
          isEnabled: true,
          routePath: '/Property-Tax/PTIS/',
        },
      ],
    });

    const { footerService: svc } = await import('@/lib/api/footer.service');
    const result = await svc.getAuthorizedActions({
      userRoleId: 5,
      targetRoute: '/property-tax/ptis',
    });
    expect(result.find((a) => a.actionCommand === 'M_PRINT')).toBeDefined();
  });
});

// ─────────────────────────────────────────────
// 7. FOOTER_REGISTRY completeness
// ─────────────────────────────────────────────

describe('FOOTER_REGISTRY completeness', () => {
  const expectedKeys = [
    'R_SAVE',
    'R_SUBMIT',
    'R_UPDATE',
    'R_RESET',
    'R_ADD',
    'L_BACK',
    'L_CLOSE',
    'L_CANCEL',
    'M_PRINT',
    'M_REPORT',
    'M_CALCULATE',
    'M_SEARCH',
    'M_DELETE',
    'PTIS_QC',
    'PTIS_QC_REVERT',
    'PTIS_COMBINE',
    'PTIS_PARTITION',
    'PTIS_SPLIT',
    'PTIS_TRANSFER',
    'PTIS_AMALGAMATION',
    'PTIS_OBJECTION',
    'PTIS_PREVIEW',
    'PTIS_CALC',
    'PTIS_TAX_CALC',
    'PTIS_DISCOUNT',
    'PTIS_DOC',
    'PTIS_EDIT_ENTRY',
    'PTIS_REFRESH',
    'PTIS_VALUATION',
    'PTIS_REPORT',
    'PTIS_SAVE',
    'PTIS_SUBMIT',
    'PTIS_APPLY',
    'PTIS_ADD',
    'PTIS_NEW_PROPERTY',
    'PTIS_CANCEL',
  ];

  for (const key of expectedKeys) {
    it(`registry contains "${key}"`, () => {
      expect(FOOTER_REGISTRY).toHaveProperty(key);
    });
  }
});
