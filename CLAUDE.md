# NTIS-UI — Consultant Review Guide

> **Audience:** Every developer writing code on `ntis-ui`.
> **Purpose:** This file captures the patterns and review judgment the consultant has applied across the codebase so far. Use it in two ways:
> 1. **Before writing code** — paste a task prompt to an AI assistant together with this file; it will produce code that already passes the consultant's review.
> 2. **Before raising the PR** — run the **Self-Review Checklist** at the end of this file against your diff. Fix every item. PRs that pass this checklist typically pass the consultant's review on the first round.

---

## 0. How the Consultant Thinks (the meta-rules)

Every rule below derives from a small number of judgments the consultant repeats again and again:

1. **Server-first.** Data, translations, and auth checks belong on the server. The browser only gets interactive islands. If you reach for `useEffect` to fetch data, you are doing it wrong.
2. **URL is the source of truth for navigation state.** Page, sort, filters, search — all live in `searchParams`, not `useState`.
3. **Type the boundaries; let TypeScript do the rest.** API edges use `unknown` + runtime type guards; everything inside the app is strictly typed. `any` is a defect.
4. **One concern per module.** A hook does one thing. A service file is one resource. A form section component renders one section. Decompose before it gets large — don't refactor after.
5. **Every visible string is translatable.** If a user can read it, it lives in `src/i18n/locales/<lc>/<ns>.json`. No exceptions other than `data-testid`, ARIA debug labels, and CSS class names.
6. **Defaults must be the safe path.** Sanitize first, then validate, then call the service. Errors return `{ success: false, ... }` discriminated unions — never thrown strings.
7. **Code that needs a comment to be understood probably needs to be rewritten.** Comments explain *why* (non-obvious decisions); names explain *what*.
8. **Tests are part of the feature.** A new hook or service without a `*.test.ts` is not done.

---

## 1. Project Architecture

```
Tech: Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind v4
i18n: next-intl (en / hi / mr)   Toasts: sonner   Forms: hand-rolled hooks
Test: vitest + @testing-library    Logger: pino (server) / lightweight (client)
```

```
src/
├── app/[locale]/               # All routes are locale-scoped
│   ├── <feature>/
│   │   ├── page.tsx            # Server component — fetch + sanitize searchParams
│   │   ├── action.ts | actions.ts # 'use server' — server actions per route
│   │   ├── loading.tsx         # → <LoadingPage />
│   │   ├── error.tsx           # 'use client' → <ErrorPage />
│   │   ├── add/page.tsx
│   │   └── edit/[id]/page.tsx
│   ├── layout.tsx              # Async server layout
│   └── Providers.tsx           # 'use client' — Toaster + ConfirmProvider + ThemeProvider
├── components/
│   ├── common/                 # Reusable UI primitives (Input, Modal, MasterTable, …)
│   ├── layout/                 # Header, Sidebar, MainLayout, Footer
│   └── modules/<feature>/      # Feature-specific components (forms, sections, columns)
├── hooks/                      # useXxx hooks — one per feature/responsibility
├── services/api.service.ts     # 'server-only' apiClient (the ONLY fetch wrapper)
├── lib/
│   ├── api/                    # *.service.ts · *-validation.ts · *-types-guard.ts · *.mappers.ts
│   ├── utils/                  # cn, format, security, validation, logger, ...
│   ├── validations/            # Zod schemas (only where a schema is the cleanest expression)
│   └── constants/              # routes.ts (central registry), screen-access constants
├── types/                      # *.types.ts — one feature per file, big domains split + barrel
├── i18n/
│   ├── config.ts               # locales = ['en','hi','mr'] as const
│   ├── request.ts              # Loads namespaces per locale
│   └── locales/<lc>/<ns>.json  # Per-namespace JSON
├── config/                     # runtime-config, app.config, icon-mapping
└── middleware.ts               # Auth + locale routing
```

---

## 2. Server vs Client Components

| Stays SERVER (no directive) | Flips to CLIENT (`'use client'`) |
|---|---|
| `app/[locale]/**/page.tsx` | Anything with `useState`, `useRef`, `useEffect`, `useTransition`, event handlers |
| `app/[locale]/layout.tsx` | Forms (`OfficeForm`, `BankForm`, …) |
| `layout/MainLayout`, `Header` (parent), `Sidebar` (parent) | Master list components (`OfficeMaster`, `BankMaster`, …) — they own search/pagination URL writes |
| Column factories called from server pages | `Providers.tsx`, `ConditionalShell.tsx`, `error.tsx` |
| Pure presentational primitives (`Card`, `Badge`, `PageContainer`, `ActionButton`) | UI primitives that need state (`Modal`, `Drawer`, `Tabs`, `Dropdown`, `Toast`) |

**Rule:** A `page.tsx` is **never** a client component. If you need state on a page, put a client child component inside the server page.

### Pass-translation-as-prop pattern

Server components resolve translations and pass primitives to client children. The `copy` object is a typed interface in `src/types/<feature>.types.ts`:

```ts
// src/types/login.types.ts
export interface LoginFormCopy {
  loginTitle: string;
  username: string;
  usernamePlaceholder: string;
  // …
}
export interface LoginFormProps { /* … */ copy: LoginFormCopy; }
```

```tsx
// src/app/[locale]/login/page.tsx  (Server)
const t = await getTranslations({ locale, namespace: 'login' });
const copy: LoginFormCopy = { loginTitle: t('title'), username: t('username'), /*…*/ };
return <LoginForm copy={copy} locale={locale} ulbData={ulbData} />;
```

This avoids re-loading the namespace on the client and gives you compile-time guarantees that every key was translated.

---

## 3. Page (Route) Component Pattern

A page does four things, in this order:

1. **Resolve params** — `const { id } = await params;`
2. **Sanitize searchParams** — through a `sanitizeParams` helper with whitelisted sort columns and clamped page sizes.
3. **Fetch in parallel** with `Promise.all`.
4. **Pass props to a client component**.

```tsx
// src/app/[locale]/configuration-settings/office-master/page.tsx
const ALLOWED_SORT_COLUMNS = ['officeCode', 'officeName', 'type'] as const;
const MIN_PAGE = 1; const MAX_PAGE = 10_000;
const DEFAULT_PAGE_SIZE = 10; const MAX_PAGE_SIZE = 100;

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { pageNumber, pageSize, searchTerm, sortBy, sortOrder, type, status } =
    sanitizeParams(params, { allowedSortColumns: ALLOWED_SORT_COLUMNS, maxPageSize: MAX_PAGE_SIZE });

  const result = await fetchOfficePagedServerAction(pageNumber, pageSize, searchTerm, sortBy, sortOrder, type, status);

  return <OfficeMaster data={result.items} pageNumber={result.pageNumber} totalCount={result.totalCount} /* … */ />;
}
```

For add/edit:

```tsx
// add/page.tsx
export default function AddOfficePage() { return <OfficeForm officeId={null} />; }

// edit/[id]/page.tsx
const { id } = await params;
const officeId = parseInt(id, 10);
if (isNaN(officeId) || officeId <= 0) notFound();
let officeData;
try { officeData = await getOfficeByIdAction(officeId); } catch { notFound(); }
return <OfficeForm officeId={officeId} initialData={officeData} />;
```

**Required siblings of every `page.tsx`:**
- `loading.tsx` — one-liner returning `<LoadingPage />`.
- `error.tsx` — `'use client'`, returning `<ErrorPage error={error} reset={reset} />`.

---

## 4. Server Actions

**Location:** `src/app/[locale]/<route>/action.ts` (or `actions.ts`, plus `actions.utils.ts` / `actions.cache.ts` when the file grows).

**Required shape:**

```ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { locales } from '@/i18n/config';
import { getUserIdFromCookies } from '@/lib/utils/auth-session';
import { ApiError } from '@/lib/utils/api';

export async function createOfficeAction(
  data: OfficeFormModel,
): Promise<ApiResponse<Office>> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) throw new ApiError(401, 'Unauthorized', 'User session expired');

    const created = await createOffice(data, userId);

    for (const locale of locales) {
      revalidatePath(`/${locale}/configuration-settings/office-master`, 'page');
    }
    return { success: true, data: created };
  } catch (error) {
    return parseOfficeActionError(error, 'create');
  }
}
```

**Rules**
- Always read `userId` from cookies; return 401 if missing.
- Always `revalidatePath` for **every locale** after a mutation.
- Never let an error escape — catch it and return `{ success: false, ... }`.
- Only `NEXT_REDIRECT` is rethrown (Next.js needs to propagate it).
- 401 responses inside a fetching action should `redirect(\`/${locale}/login\`)`.

---

## 5. Forms — Composition Pattern

A complex form is **never one file**. It is decomposed into:

```
useXxxForm.ts                  ← orchestrator hook
  ├── useXxxFormState.ts       ← useState + setters
  ├── useXxxFormValidation.ts  ← pure validation, returns errors
  └── useXxxFormSubmission.ts  ← startTransition + server action + toast

XxxForm.tsx                    ← Drawer/Modal shell + <form>
  ├── XxxDetailsSection.tsx    ← rendered by the form
  ├── XxxContactSection.tsx
  └── XxxAdditionalSection.tsx
```

### The orchestrator hook owns the *Next.js* hooks; sub-hooks receive them as parameters

```ts
// src/hooks/useKycForm.ts
export function useKycForm({ KycDetailsData, OwnerTypeMasterList, locale }: Args) {
  const t = useTranslations('kyc');
  const confirm = useConfirm();
  const router = useRouter();

  const stateBag = useKycFormState(KycDetailsData, OwnerTypeMasterList);
  const validation = useKycFormValidation(stateBag.formData, stateBag.mobileInput, stateBag.aadharInput, KycDetailsData);
  const submission = useKycFormSubmission(
    { ...stateBag, KycDetailsData, OwnerTypeMasterList, locale, canSubmit: validation.canSubmit },
    t, confirm, router, // ← passed as params, not re-imported
  );

  return { ...stateBag, ...validation, ...submission };
}
```

**Why:** the sub-hooks become pure / unit-testable. Mocks become trivial — pass `t = (k) => k`, `confirm = vi.fn()`, `router = { push: vi.fn() }`.

### Always return an object (never an array)

```ts
return {
  // state
  formData, errors, touched,
  // setters
  setFormData,
  // actions
  handleSubmit, handleChange, handleBlur, showError,
  // status
  isSubmitting,
};
```

### Validation rendering rule

Errors only appear after the field is `touched` **or** after first submit:

```ts
const showError = useCallback(
  (field: keyof FormModel) => Boolean((submittedOnce || touched[field]) && errors[field]),
  [submittedOnce, touched, errors],
);
```

### Race-condition guard on submit

```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isUpdating || isPending) return; // ← required
  setSubmittedOnce(true);
  const v = validate(formData);
  if (Object.keys(v).length > 0) { setErrors(v); return; }
  // …
};
```

### Form shell

```tsx
<Drawer open={open} onClose={handleCancel} title={isEdit ? t('form.editTitle') : t('form.addTitle')}
        footer={<><CancelButton onClick={handleCancel} /><SaveButton type="submit" form="office-form" isLoading={isSubmitting} /></>}>
  <form id="office-form" onSubmit={handleSubmit}>
    {isEdit && <OfficeStatusToggle value={formData.isActive} onChange={handleChange} />}
    <OfficeDetailsSection      formData={formData} errors={errors} handleChange={handleChange} handleBlur={handleBlur} showError={showError} t={t} />
    <OfficeContactSection      formData={formData} errors={errors} handleChange={handleChange} handleBlur={handleBlur} showError={showError} t={t} />
    <OfficeAdditionalSection   formData={formData} errors={errors} handleChange={handleChange} handleBlur={handleBlur} showError={showError} t={t} />
  </form>
</Drawer>
```

---

## 6. Master / List Tables

Use the `MasterTable<T>` primitive from `@/components/common`. Pagination, sort and search are **URL-driven** via dedicated hooks (`useXxxSearch`, `useXxxPagination`).

```tsx
<MasterTable<Office>
  columns={getOfficeColumns(t, tCommon, sortBy, sortOrder, onSort)}
  data={data}
  loading={isPending}
  height="lg"
  pageNumber={pageNumber}
  pageSize={pageSize}
  totalCount={totalCount}
  totalPages={totalPages}
  onPageChange={changePage}
  onPageSizeChange={(size) => handlePageSizeChange(String(size))}
  paginationConfig={{ enabled: true, showPageSizeSelector: false }}
  headerExtra={<><SearchInput onChange={handleSearchChange} value={search} /><Select value={selectedType} onChange={handleTypeChange} /></>}
  renderActions={(row) => (<><EditButton onClick={() => handleEdit(row)} /><DeleteButton onClick={() => handleDelete(row)} /></>)}
  getRowKey={(row) => String(row.officeId)}
/>
```

**Rules**
- Columns are built by a `getXxxColumns(t, tCommon, sortBy, sortOrder, onSort)` factory that returns `Column<T>[]`.
- Sort flip → `router.push(buildUrl(...))` inside `startTransition`.
- Search input → 500ms debounce → URL `q` param. Local `useState` only holds the input value; the URL is the source of truth.
- Search resets `page=1` and preserves `sortBy`/`sortOrder`.
- Page-size change writes the new size and resets `page=1`.
- Loading state during URL transitions: `loading={isPending}` from `useTransition`.

---

## 7. Modals, Drawers, Confirms, Toasts

- **`Drawer`** — side panel for create/edit forms. `open` belongs to the form, not the list.
- **`Modal`** — sub-pickers (e.g. `TypeOfUseModal` opened by `useTypeOfUseModal`).
- **`useConfirm()`** — every destructive action. Never `window.confirm`.

```ts
confirm({
  variant: 'delete',
  title: `${t('list.table.officeCode')}: ${row.officeCode}`,
  description: t('delete.confirmDescription'),
  meta: { name: row.officeName },
  onConfirm: async () => {
    const fd = new FormData(); fd.append('officeId', String(row.officeId));
    const result = await deleteOfficeAction(fd);
    if (result.success) { toast.success(t('success.deleted')); router.refresh(); }
    else toast.error(result.message || tCommon('errors.deleteError'));
  },
});
```

`ConfirmProvider` and `<Toaster />` are mounted once in `app/[locale]/Providers.tsx`. Use `toast.success`, `toast.error`, `toast.info`, `toast.warning` — never `alert`, `console.log`, or DOM banners.

---

## 8. Hooks — Patterns & Anti-Patterns

| Pattern | Rule |
|---|---|
| **Naming** | `useXxx` camelCase. Sub-hooks of an orchestrator: `useXxxFormState`, `useXxxFormValidation`, `useXxxFormSubmission`. |
| **Return value** | Always a named object. Never `[value, setter]` tuples. |
| **useState** | Per-field for small forms; single object with explicit generic `useState<FormData>({...})` for large forms. Use a module-level `INITIAL_*` constant if the form is resettable. |
| **`Set` / `Map` in state** | Always replace, never mutate: `setSel(prev => { const n = new Set(prev); n.add(x); return n; });` |
| **useCallback / useMemo** | Only when (a) passed to a child hook's deps, (b) consumed in another `useMemo`/`useEffect`, (c) computes non-trivial derived data. Trivial handlers used once in JSX are plain arrows. |
| **useEffect** | Avoid if a derived value works. When used: cleanup is mandatory; first-render guard via `useRef(true)` when the effect would otherwise fire on mount. |
| **Server actions** | `useTransition` + local `isUpdating` boolean. Return `isUpdating: isUpdating || isPending`. |
| **Error model** | `error: string \| null` for transport errors; `errors: Partial<Record<keyof FormModel, string>>` for field errors. Merge API field errors into the field map. |
| **Toast triggers** | Toast at the call site of the result (inside the hook), with translated messages — never from sub-hooks unless they were given `t` as a param. |

### Generic hook: `useAsync<T>`

```ts
export function useAsync<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (asyncFn: () => Promise<ApiResponse<T>>) => {
    setIsLoading(true); setError(null);
    const res = await asyncFn();
    if (res.success) setData(res.data ?? null);
    else setError(res.error || 'An error occurred');
    setIsLoading(false);
    return res;
  }, []);

  const reset = useCallback(() => { setData(null); setError(null); setIsLoading(false); }, []);
  return { data, error, isLoading, execute, reset };
}
```

---

## 9. Services & API Layer

### File layout (per resource)

```
src/lib/api/
  office-crud.service.ts        ← CRUD functions
  office-validation.ts          ← hand-rolled validators (throw ApiError 400)
  office-types-guard.ts         ← isOfficeShape() + normalizeOffice()
  typeofuse.errors.ts           ← error code constants (i18n keys)
  typeofuse.mappers.ts          ← DTO ↔ UI mappers
```

### The only fetch wrapper

```ts
// src/services/api.service.ts
import 'server-only';
import { cookies } from 'next/headers';
// apiClient.get/post/put/delete — handles auth, CSRF, timeout, TLS, errors
```

**Never write a raw `fetch()`/`axios` call.** Always go through `apiClient`.

### Standard CRUD function

```ts
export async function getOfficesPaged(
  pageNumber: number, pageSize: number, searchTerm?: string,
  sortBy?: string, sortOrder?: string, type?: string, status?: string,
): Promise<PagedResponse<Office>> {
  const params = new URLSearchParams();
  params.append('PageNumber', String(pageNumber));
  params.append('PageSize',   String(pageSize));
  const safeSearchTerm = validateAndPrepareSearchTerm(searchTerm);
  if (safeSearchTerm)    params.append('SearchTerm', safeSearchTerm);
  if (sortBy?.trim())    params.append('SortBy',    sortBy.trim());
  if (sortOrder?.trim()) params.append('SortOrder', sortOrder.trim());

  const response = await apiClient.get<PagedResponse<Office>>(`/Office?${params.toString()}`);
  if (!response.success) {
    throw new ApiError(response.statusCode ?? 500, response.error || 'Failed to fetch offices', 'getOfficesPaged');
  }
  return {
    ...response.data!,
    items: response.data!.items.filter(isOfficeShape).map(normalizeOffice),
  };
}
```

### Type guards (always present, always paired)

```ts
export function isOfficeShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  const officeId = Number(obj.officeId ?? obj.id);
  return Number.isFinite(officeId) && officeId > 0;
}

export function normalizeOffice(data: Record<string, unknown>): Office {
  const officeId = Number(data.officeId ?? data.id);
  if (!Number.isFinite(officeId) || officeId <= 0) {
    throw new ApiError(500, 'Invalid data received from server', `Invalid officeId: ${data.officeId ?? data.id}`);
  }
  return {
    officeId,
    officeCode: String(data.officeCode ?? ''),
    officeName: String(data.officeName ?? ''),
    // …
    isActive: parseBoolean(data.isActive ?? data.isStatus),
  };
}
```

**Never** do `response.data as Office[]`. Always `filter(isXShape).map(normalizeX)`.

### Errors

```ts
export class ApiError extends Error {
  constructor(public statusCode: number, public error: string, public contextMessage: string) {
    super(`${contextMessage}: ${error} (${statusCode})`);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
```

- Throw `ApiError` from the service layer.
- Catch and convert to `ApiResponse<T>` / `ActionResult<T>` at the server-action boundary using `handleServerError`.

### Logging

`server-logger.ts` (pino) automatically redacts `password`, `token`, `secret`, `authorization`, `cookie`, `session`, `jwt`, etc. Use namespaced child loggers:

```ts
const log = createLogger('OfficeService');
log.info({ userId, officeId }, 'Office created');
log.error({ err, userId }, 'Failed to create office');
```

Never `console.log(JSON.stringify(req))`.

### URLs & config

- No hardcoded URLs anywhere. Base URL resolves via `getAppConfig().api.baseUrl` / `SERVER_API_BASE_URL`.
- Path segments: always `encodeURIComponent(String(id))`.

---

## 10. Validation & Sanitization

Three layers — use **all three** as appropriate:

1. **`sanitizeParams`** — clamps pages, whitelists sort columns, trims `q`. Applied in `page.tsx` before passing to actions.
2. **Hand-rolled validators** (`*-validation.ts`) — throw `ApiError(400, …)`; called at the entry of every create/update.
3. **Zod schemas** (`src/lib/validations/*.schema.ts`) — used where a declarative schema is the cleanest expression (floor forms, PTIS, taxzoning).

XSS sanitizers in `input-sanitization.ts` (`sanitizeTextInput`, `sanitizeEmail`, `sanitizeName`, `escapeHtml`) strip `<script>`, `javascript:`, and `on*=` handlers. Use them on any free-text user input that goes to the backend.

---

## 11. Types

| Choice | When |
|---|---|
| `interface` | Object shapes, props, hook returns, DTOs (default). |
| `type` | Unions, literals, derived/computed types. |
| `enum` | Never in new code — use string literal unions + `as const`. |

### Patterns

```ts
// String literal union, derived from const tuple
export const PTIS_TABS = ['propertydetails', 'kycdetails', 'societydetails', 'olddetails'] as const;
export type PtisTabId = (typeof PTIS_TABS)[number];

// Discriminated union for actions
interface ActionErrorResult        { success: false; error?: string; }
interface ActionSuccessResult<T>   { success: true;  data?: T; }
export type ActionResult<T> = ActionErrorResult | ActionSuccessResult<T> | T[] | T | null | undefined;

// Generic with safe default at API boundaries
export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; message?: string; statusCode?: number; }
export interface Column<T extends Record<string, unknown> = Record<string, unknown>> { /* … */ }

// Per-field error map
export type ScreenMasterFieldErrors = Partial<Record<keyof ScreenMasterData, string>>;
```

### Large domains: split + barrel

```ts
// src/types/ptis.types.ts
export * from './ptis-core.types';
export * from './ptis-defaults.types';
export * from './ptis-search.types';
export * from './ptis-reference.types';
export * from './ptis-page.types';
```

### No `any`

At API boundaries, use `unknown` and narrow with type guards. Inside the app, use generics or concrete types. `eslint-disable` for `no-explicit-any` requires a comment explaining why.

---

## 12. i18n

### File layout

```
src/i18n/locales/<en|hi|mr>/<namespace>.json
```

One namespace per feature (`common.json`, `dashboard.json`, `office.json`, `kyc.json`, etc.). Keys are **camelCase, nested by UI section**:

```json
{
  "buttons":   { "save": "Save", "cancel": "Cancel" },
  "form":      { "validation": { "codeRequired": "Code is required" },
                 "fields": { "officeCode": { "label": "Office code", "placeholder": "Enter office code" } } },
  "validation":{ "minLength": "Minimum {count} characters required",
                 "alphanumericUnderscore": "{label} must be alphanumeric and contain underscores only" }
}
```

- **ICU placeholders only.** `{count}`, `{label}`, `{id}` — never string concatenation.
- One namespace per feature, plus a shared `common` namespace.
- New keys go to **all three locales** (`en`, `hi`, `mr`) in the same PR.

### Where each API is used

| API | Where |
|---|---|
| `await getTranslations({ locale, namespace })` | Server components / server actions / RSC pages. |
| `useTranslations(namespace)` | `'use client'` components only. |
| Pre-resolved `copy: XxxCopy` prop | Server orchestrator → client child when the server already owns the namespace. |

**Never** mix client and server translation APIs in the same component.

### Locale & middleware

- Locales whitelist: `export const locales = ['en','hi','mr'] as const;` — use this, never literal `'en'`.
- Cookie: `NEXT_LOCALE` (1-year). Backup in `localStorage`. Both wrapped in try/catch.
- Middleware sets `x-pathname` and `x-is-auth-or-home` for downstream components.

---

## 13. Styling

- **Only `cn()`** for class composition: `cn(...) = twMerge(clsx(inputs))`. Consumer's `className` prop is **always last** in `cn(...)` so it can override.
- **Variants are typed unions + lookup maps**, not nested ternaries:
  ```ts
  type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'edit' | 'delete';
  const variantStyles: Record<ButtonVariant, string> = { primary: '…', secondary: '…', /*…*/ };
  ```
- **No inline `style={{...}}` for static styling.** `style` only for dynamic positioning (tooltip coords, context-menu portal).
- **No `defaultProps`.** All defaults set via destructuring (`size = 'md'`).

---

## 14. Accessibility

- Every interactive element has `role`, `aria-*`, and keyboard handlers.
- Form inputs wire `aria-invalid` + `aria-describedby` (linked to the error/helper `id`):
  ```tsx
  aria-invalid={error ? 'true' : 'false'}
  aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
  ```
- Modals/Drawers implement: focus trap, ESC handler, scroll lock, focus restore on close.
- Custom clickable `<div>`s carry `role`, `tabIndex`, and an `onKeyDown` for Enter/Space.
- Every `forwardRef` sets `.displayName`.

---

## 15. File & Folder Naming

| Thing | Naming |
|---|---|
| Routes (folders under `app/[locale]/`) | `kebab-case` |
| Component files | `PascalCase.tsx` |
| Hook files | `useCamelCase.ts` |
| Service files | `kebab-case.service.ts` / `kebab-case.services.ts` |
| Validators / type guards | `<resource>-validation.ts` / `<resource>-types-guard.ts` |
| Type files | `*.types.ts` |
| Server-action files | `action.ts` / `actions.ts` / `actions.utils.ts` / `actions.cache.ts` |
| Constants files | `*.constants.ts` |

### Barrels

Every module folder has an `index.ts` re-exporting its public surface. Import primitives from the barrel, not deep paths:

```ts
// ✅
import { MasterTable, Drawer, SearchInput, useConfirm } from '@/components/common';
// ❌
import { MasterTable } from '@/components/common/MasterTable';
```

---

## 16. Tests

Every new hook, service, and reusable component ships a `*.test.ts(x)` under `src/__tests__/` mirroring the source layout.

```ts
// src/__tests__/hooks/useOfficeForm.test.ts
import { renderHook, act } from '@testing-library/react';
import { useOfficeForm } from '@/hooks/useOfficeForm';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe('useOfficeForm', () => {
  const mockProps = { officeId: null, onSuccess: vi.fn(), onCancel: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(officeValidations.validate).mockReturnValue({});
  });

  it('should initialize with default data when adding a new office', () => {
    const { result } = renderHook(() => useOfficeForm(mockProps));
    expect(result.current.formData.officeCode).toBe('');
  });
});
```

**Rules**
- `beforeEach(() => vi.clearAllMocks())` is mandatory.
- Identity translator mocks: `vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }))`.
- Hooks → `renderHook` + `act`. Components → `render` + `screen.getByRole`. Interactions → `userEvent`.
- Server actions and api services are `vi.mock`-ed by import path.
- Tests live in `src/__tests__/` mirroring the source folder tree.

---

## 17. Routes Registry

Never hardcode a route path. Use the central registry:

```ts
// src/lib/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  AUTH: { LOGIN: '/auth/login', REGISTER: '/auth/register', FORGOT_PASSWORD: '/auth/forgot-password' },
  PROPERTY_TAX: { PTIS: '/property-tax/ptis' },
  SCREEN_ACCESS: '/configuration-settings/screenAccess',
} as const;
```

---

## 18. Logging & Error Surface

- **Server side:** `server-logger.ts` (pino) with auto-redaction. Use `createLogger('<Namespace>')`.
- **Client side:** `logger.ts` — `debug`/`info` no-op in production.
- **User-facing errors:** `toast.error(message)`; never `alert`, never `console.*` for user feedback.
- **Action results:** always `{ success: false, error, message?, errors? }`. Never throw to a server-action caller (other than `NEXT_REDIRECT`).

---

## 19. ESLint i18next Rule

`i18next/no-literal-string` is on with `mode: 'jsx-text-only'`. JSX text must come from `t(...)` unless it falls into the project's ignore list (numbers, single-word ARIA states, variant names, etc.). If you see this rule fail, **add the translation** — do not silence the rule.

---

## 20. Anti-patterns the consultant will reject (consolidated)

### Architecture
1. Fetching data inside a client component with `useEffect` + `fetch` — fetch on the server `page.tsx` and pass props.
2. `'use client'` at the top of `page.tsx`. Flip the **child** instead.
3. Holding navigation state (page, sort, filters) in `useState` instead of the URL.
4. Modal/Drawer `open` state living in the list page when it logically belongs to the form route.
5. Importing primitives by deep path instead of the barrel (`@/components/common`).

### Server actions / services
6. Throwing strings or plain `Error` — must throw `ApiError(status, msg, ctx)` or return `{ success: false, ... }`.
7. Letting an exception escape a server action — catch and return a discriminated result.
8. Forgetting to `revalidatePath` for every locale after a mutation.
9. Hardcoding API base URLs, endpoint hosts, or route paths.
10. Trusting backend shape — must `filter(isXShape).map(normalizeX)`.
11. Skipping input sanitization / validation in create/update entry points.
12. Manual `fetch` / `axios` calls in service files — must go through `apiClient`.
13. Logging full request bodies, tokens, passwords, or cookies.
14. Missing `'server-only'` on modules that read cookies / env secrets.

### Hooks / forms
15. Fat hook doing 5 jobs (state + validation + submission + mapping + URL handling) — decompose.
16. Returning arrays `[value, setter]` from custom hooks — return named objects.
17. `useEffect` without cleanup, or for prop→state sync when render-phase comparison would do.
18. Missing race-condition guard on submit (`if (isUpdating || isPending) return;`).
19. Calling `toast` / `useRouter` / `useTranslations` inside a sub-hook instead of the orchestrator.
20. Storing pagination / search in client state instead of URL params.
21. Premature `useCallback`/`useMemo` on every trivial handler.

### UI / styling / a11y
22. Inline `style={{...}}` for static styling (use Tailwind / `cn`).
23. `className` not threaded through `cn(...)` so consumers can override.
24. `forwardRef` without `.displayName`.
25. Custom clickable `<div>` without `role`, `tabIndex`, or keyboard handlers.
26. `alert()`, `window.confirm()`, or DOM banners for user feedback (use `toast`/`useConfirm`).
27. Missing `loading.tsx` / `error.tsx` beside a `page.tsx`.

### Types / i18n
28. Using `any` — at API boundaries use `unknown` + type guards; inside, use `T` generics.
29. Untyped function return values.
30. `enum`s for new code — use `as const` tuples + `(typeof X)[number]`.
31. Untranslated literal JSX text.
32. Hardcoded locale strings (`'en'`, `'hi'`) — use the `Locale` type from `i18n/config.ts`.
33. String concatenation into translations instead of ICU placeholders.
34. Adding a key to one locale but not the other two.
35. Mixing `useTranslations` (client) with `getTranslations` (server) in the same component.

### Tests
36. New hook / service / reusable component without a test file.
37. Tests without `beforeEach(() => vi.clearAllMocks())`.
38. Shared mutable state across tests.

### General
39. Unused vars / params not prefixed with `_` (ESLint enforces).
40. Comments that explain *what* the code does (rename the symbol) instead of *why*.

---

## 21. Common Task Recipes

### Recipe A — Add a new master CRUD (`xxx-master`)

1. **Types** — `src/types/xxx.types.ts`: `Xxx` (entity), `XxxFormModel`, `XxxCreatePayload`, `XxxProps`.
2. **Service** — `src/lib/api/xxx-crud.service.ts` with `getXxxPaged`, `getXxxById`, `createXxx`, `updateXxx`, `deleteXxx`. All use `apiClient` and `filter(isXxxShape).map(normalizeXxx)`.
3. **Validators** — `src/lib/api/xxx-validation.ts` with `validateCreateFormData`, `validateUpdateFormData`, `validateAndPrepareSearchTerm`.
4. **Type guards** — `src/lib/api/xxx-types-guard.ts` with `isXxxShape` + `normalizeXxx`.
5. **Server actions** — `src/app/[locale]/configuration-settings/xxx-master/action.ts` with all CRUD actions, each:
   - Reads `userId` from cookies (401 if missing).
   - Calls validator → service.
   - `revalidatePath` for every locale.
   - Returns `ApiResponse<T>`.
6. **Pages**
   - `page.tsx` — sanitize searchParams → fetch → render `<XxxMaster />`.
   - `add/page.tsx` — render `<XxxForm xxxId={null} />`.
   - `edit/[id]/page.tsx` — `parseInt` id (notFound on invalid) → fetch → render `<XxxForm xxxId={id} initialData={data} />`.
   - `loading.tsx`, `error.tsx` — one-liners.
7. **Components** — `src/components/modules/configuration-settings/xxx-master/`:
   - `XxxMaster.tsx` (`'use client'`) — `MasterTable<Xxx>` with hooks `useXxxSearch`, `useXxxPagination`.
   - `XxxForm.tsx` (`'use client'`) — `Drawer` + sections + `useXxxForm`.
   - `XxxDetailsSection.tsx`, etc.
   - `XxxColumns.tsx` exporting `getXxxColumns(t, tCommon, sortBy, sortOrder, onSort): Column<Xxx>[]`.
   - `index.ts` barrel.
8. **Hooks** — `useXxxForm.ts` orchestrator + `useXxxFormState.ts` + `useXxxFormValidation.ts` + `useXxxFormSubmission.ts` + `useXxxPagination.ts` + `useXxxSearch.ts`.
9. **i18n** — add `xxx.json` to all three locales with `list.*`, `form.*`, `delete.*`, `success.*` sections.
10. **Routes** — add an entry to `src/lib/constants/routes.ts` if linked from elsewhere.
11. **Tests** — `src/__tests__/hooks/useXxxForm.test.ts`, `src/__tests__/lib/api/xxx-crud.service.test.ts`, plus component tests.

### Recipe B — Add a field to an existing form

1. Add field to the `XxxFormModel` interface.
2. Add a validator clause in `xxx-validation.ts` (and possibly `useXxxFormValidation`).
3. Add to `INITIAL_FORM_DATA` (or initialization branch) in `useXxxFormState`.
4. Render the field in the appropriate `XxxYyySection.tsx`. Use `<Input>` / `<Select>` / etc. with `error={showError('field') ? errors.field : undefined}`.
5. Add `form.fields.field.{label,placeholder}` to all three locales.
6. Update the service payload mapper.
7. Update tests covering the form-state hook.

### Recipe C — Add a new translated string

1. Decide the namespace (existing or new).
2. Add the key to **`en`, `hi`, and `mr`** JSON files. Use ICU placeholders for variables.
3. Reference it via `useTranslations('namespace')` in client components, or `getTranslations({ locale, namespace })` on the server.

---

## 22. Self-Review Checklist — Run before raising a PR

> Paste your diff to an AI assistant alongside this file and ask:
> *"Review my changes against `CONSULTANT_REVIEW_GUIDE.md`. For each rule, mark Pass / Fail / N/A and quote the offending lines."*

**Scope & architecture**
- [ ] Every `page.tsx` is a server component (no `'use client'`).
- [ ] Data is fetched on the server and passed as props — no `useEffect` + `fetch` in client components.
- [ ] Page, sort, filter, search state lives in `searchParams`, not `useState`.
- [ ] `loading.tsx` and `error.tsx` exist beside every new `page.tsx`.

**Server actions**
- [ ] Every mutation reads `userId` from cookies and 401s if missing.
- [ ] Every mutation calls `revalidatePath` for **every locale**.
- [ ] No exception escapes the action — `try { … } catch (e) { return handleServerError(e, 'create xxx'); }`.
- [ ] Action returns `ApiResponse<T>` / `ActionResult<T>` discriminated union.

**Services / API**
- [ ] All HTTP calls go through `apiClient` from `src/services/api.service.ts`.
- [ ] Modules that touch cookies/env secrets import `server-only`.
- [ ] Service throws `ApiError(status, msg, ctx)` — never strings or `new Error('…')`.
- [ ] Every list response is `filter(isXShape).map(normalizeX)` — no `as X[]`.
- [ ] No hardcoded base URLs / endpoint hosts.
- [ ] Path segments use `encodeURIComponent`.
- [ ] `sanitizeParams` (or equivalent) used on every page-level searchParams.
- [ ] Create/update entry calls `validateCreateFormData` / `validateUpdateFormData`.

**Hooks & forms**
- [ ] Hook returns an object, not an array.
- [ ] Orchestrator hook owns `useTranslations` / `useRouter` / `useConfirm`; sub-hooks receive them as parameters.
- [ ] Submit handler has a race-condition guard.
- [ ] Validation errors are gated by `submittedOnce || touched[field]`.
- [ ] No `useEffect` without cleanup. No effect-based prop→state sync where a render-phase comparison would do.
- [ ] No premature `useCallback`/`useMemo` on trivial handlers.

**Types**
- [ ] No `any` anywhere (search the diff). Boundary code uses `unknown` + type guard.
- [ ] No new `enum` — use `as const` tuples + `(typeof X)[number]`.
- [ ] Function return types are explicit.
- [ ] Discriminated unions used for action / API responses.

**i18n**
- [ ] No literal JSX text. Every visible string goes through `t(...)`.
- [ ] New keys added to **all three locales** (`en`, `hi`, `mr`).
- [ ] ICU placeholders, not string concatenation.
- [ ] `useTranslations` only in `'use client'`; `getTranslations` only in server components.
- [ ] No literal `'en'`/`'hi'`/`'mr'` — use `Locale` / `locales` / `defaultLocale`.

**UI / styling / a11y**
- [ ] `cn()` used for class composition; consumer `className` is last.
- [ ] No inline `style` for static styling.
- [ ] Variants are typed unions + lookup maps.
- [ ] Every `forwardRef` sets `.displayName`.
- [ ] Form inputs wire `aria-invalid` + `aria-describedby`.
- [ ] Modals/Drawers implement focus trap + ESC + scroll lock + focus restore.
- [ ] Destructive actions use `useConfirm()`. Feedback uses `toast.*`. No `alert`/`window.confirm`.

**Logging**
- [ ] Server logs use `createLogger('Namespace')`. No `console.log(JSON.stringify(req))`.
- [ ] Sensitive fields (token, password, secret) are not logged outside the auto-redacted paths.

**Naming**
- [ ] Routes are `kebab-case`. Components `PascalCase.tsx`. Hooks `useCamelCase.ts`. Types `*.types.ts`. Services `kebab-case.service.ts`.
- [ ] Imports use barrels (`@/components/common`, not `@/components/common/Xxx`).
- [ ] Unused vars/args prefixed with `_`.

**Tests**
- [ ] New hooks/services/components have `*.test.ts(x)` in `src/__tests__/` mirroring the source path.
- [ ] `beforeEach(() => vi.clearAllMocks())` in every suite.
- [ ] `next-intl` and `next/navigation` mocked with identity stubs.
- [ ] No shared mutable state across tests.

**Routes**
- [ ] New route strings added to `ROUTES` registry if linked from anywhere.

**Lint & build**
- [ ] `npm run lint` clean (including `i18next/no-literal-string`).
- [ ] `npm run type-check` clean.
- [ ] `npm test` green.

---

## 23. Prompt Templates

### For AI-assisted coding

```
You are writing code on `ntis-ui`. Strictly follow `CONSULTANT_REVIEW_GUIDE.md` in the repo root.

Task: <paste task description here>

Constraints:
- Server-first: pages are server components; flip child to 'use client' only when needed.
- All HTTP calls go through `apiClient` (`src/services/api.service.ts`).
- Server actions return ApiResponse<T> and call revalidatePath for every locale.
- Decompose forms into orchestrator hook + state/validation/submission sub-hooks + section components.
- No `any`. Use `unknown` + type guards at boundaries.
- Every visible string lives in i18n JSON files (en/hi/mr).
- Add `loading.tsx` and `error.tsx` beside any new `page.tsx`.
- Write tests in `src/__tests__/` mirroring the source path.

Produce a file list first; then produce the file contents.
```

### For AI-assisted self-review

```
Review my staged changes against `CONSULTANT_REVIEW_GUIDE.md`.

For each section of the Self-Review Checklist (section 22), report:
- Status: Pass / Fail / N/A
- If Fail: quote the exact offending lines (path + line range) and the rule that's violated.
- If Fail: propose the minimal patch.

After the per-rule report, produce an ordered fix list, most-impactful first.
```

---

**Last updated:** 2026-05-12
**Owners:** Engineering. Update this file whenever the consultant adds a new review comment that generalizes beyond the PR it appeared in.
