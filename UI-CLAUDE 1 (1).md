# NTIS-UI Project Documentation

> **Purpose:** This file documents the NTIS-UI project for both users (to understand the application) and developers (to work on the codebase). It combines project setup information with coding standards and architectural patterns.
>
> **Last Updated:** 2026-05-12

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Getting Started](#3-getting-started)
4. [Project Architecture](#4-project-architecture)
5. [Code Standards & Patterns](#5-code-standards--patterns)
6. [i18n (Internationalization)](#6-i18n-internationalization)
7. [Testing](#7-testing)
8. [Self-Review Checklist](#8-self-review-checklist)

---

## 1. Project Overview

NTIS-UI is a Next.js application built for government service management. It provides interfaces for various municipal services including:

- Property Tax (PTIS)
- Water Tax
- Birth/Death Certificates
- Permit Applications (Bajar Parwana)
- Configuration & Master Data Management

### Core Philosophy

The project follows these fundamental principles:

1. **Server-first** — Data, translations, and auth checks belong on the server. The browser only gets interactive islands.
2. **URL as source of truth** — Page, sort, filters, and search state live in URL `searchParams`, not local state.
3. **Type boundaries** — API edges use `unknown` + runtime type guards; everything inside the app is strictly typed.
4. **One concern per module** — A hook does one thing. A service file handles one resource. Forms are decomposed by section.
5. **Everything translatable** — Every visible string lives in i18n JSON files (English, Hindi, Marathi).
6. **Safe defaults** — Sanitize first, then validate. Errors return discriminated unions, never thrown strings.
7. **Tests are part of the feature** — Every new hook or service ships with tests.

---

## 2. Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| i18n | next-intl (en / hi / mr) |
| Forms | Hand-rolled hooks |
| Toasts | sonner |
| Testing | vitest + @testing-library |
| Logging | pino (server) / lightweight (client) |
| Linting | ESLint |
| Formatting | Prettier |

---

## 3. Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone and navigate
git clone <repository-url>
cd ntis-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run dev:turbo` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run build:production` | Build for production with Turbopack |
| `npm start` | Start production standalone server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Type check with TypeScript |
| `npm run test` | Run tests |

### Project Structure

```
src/
├── app/[locale]/              # All routes are locale-scoped
│   ├── <feature>/
│   │   ├── page.tsx          # Server component — fetch + sanitize searchParams
│   │   ├── action.ts         # Server actions per route
│   │   ├── loading.tsx       # Loading state
│   │   ├── error.tsx         # Error boundary
│   │   ├── add/page.tsx      # Create page
│   │   └── edit/[id]/page.tsx # Edit page
│   ├── layout.tsx            # Root layout
│   └── Providers.tsx         # Client providers (Toaster, Theme, etc.)
├── components/
│   ├── common/               # Reusable UI primitives (Input, Modal, MasterTable, etc.)
│   ├── layout/               # Header, Sidebar, MainLayout, Footer
│   └── modules/<feature>/    # Feature-specific components
├── hooks/                    # Custom hooks (one per feature/responsibility)
├── services/                 # API services
│   └── api.service.ts        # The ONLY fetch wrapper (server-only)
├── lib/
│   ├── api/                  # Service files, validators, type guards, mappers
│   ├── utils/                # cn, format, security, validation
│   ├── validations/          # Zod schemas (where declarative is cleanest)
│   └── constants/            # Routes registry
├── types/                    # TypeScript type definitions
├── i18n/
│   ├── config.ts             # Locale configuration
│   ├── request.ts            # Namespace loading
│   └── locales/<lc>/<ns>.json # Translation files
├── config/                   # Runtime configuration
└── middleware.ts             # Auth + locale routing
```

### Environment Variables

- `.env` — Shared defaults (committed)
- `.env.development` — Development
- `.env.staging` — Staging (gitignored)
- `.env.production` — Production (gitignored)
- `.env.local` — Local overrides (gitignored)

---

## 4. Project Architecture

### Server vs Client Components

| Stays Server (default) | Client (`'use client'`) |
|------------------------|-------------------------|
| `page.tsx` files | Components with `useState`, `useEffect`, event handlers |
| Server layouts | Forms (`XxxForm`) |
| Layout components (Header, Sidebar) | Master list components (search/pagination) |
| Pure presentational primitives (Card, Badge) | UI primitives needing state (Modal, Drawer, Tabs) |

**Rule:** A `page.tsx` is **never** a client component. If you need state on a page, put a client child component inside.

### Page Pattern

A page does four things:

1. **Resolve params** — `const { id } = await params;`
2. **Sanitize searchParams** — through a `sanitizeParams` helper
3. **Fetch in parallel** with `Promise.all`
4. **Pass props to a client component**

```tsx
// page.tsx — Server component
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { pageNumber, pageSize, searchTerm } = sanitizeParams(params, { maxPageSize: 100 });

  const result = await fetchDataServerAction(pageNumber, pageSize, searchTerm);

  return <XxxMaster data={result.items} totalCount={result.totalCount} />;
}
```

**Required siblings:**
- `loading.tsx` — returns `<LoadingPage />`
- `error.tsx` — `'use client'`, returns `<ErrorPage error={error} reset={reset} />`

### Server Actions

```ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createXxxAction(data: XxxFormModel): Promise<ApiResponse<Xxx>> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) throw new ApiError(401, 'Unauthorized');

    const created = await createXxx(data, userId);

    // Revalidate for every locale
    for (const locale of locales) {
      revalidatePath(`/${locale}/path`);
    }
    return { success: true, data: created };
  } catch (error) {
    return parseActionError(error, 'create');
  }
}
```

### Forms — Composition Pattern

A complex form is decomposed:

```
useXxxForm.ts           ← Orchestrator hook
  ├── useXxxFormState.ts       ← useState + setters
  ├── useXxxFormValidation.ts ← Pure validation
  └── useXxxFormSubmission.ts ← startTransition + server action + toast

XxxForm.tsx             ← Drawer/Modal shell + form
  ├── XxxDetailsSection.tsx
  ├── XxxContactSection.tsx
  └── XxxAdditionalSection.tsx
```

### Services & API Layer

The **only** fetch wrapper is `apiClient` in `src/services/api.service.ts`:

```ts
import 'server-only';
// apiClient.get/post/put/delete — handles auth, CSRF, timeout, TLS, errors
```

**Never write raw `fetch()` calls** — always go through `apiClient`.

### Type Guards (Always Present)

```ts
export function isXxxShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  const id = Number(obj.xxxId ?? obj.id);
  return Number.isFinite(id) && id > 0;
}

export function normalizeXxx(data: Record<string, unknown>): Xxx {
  return { /* ... */ };
}
```

**Never do `response.data as Xxx[]`** — always `filter(isXxxShape).map(normalizeXxx)`.

---

## 5. Code Standards & Patterns

### Naming Conventions

| Thing | Naming |
|-------|--------|
| Routes (folders) | `kebab-case` |
| Component files | `PascalCase.tsx` |
| Hook files | `useCamelCase.ts` |
| Service files | `kebab-case.service.ts` |
| Type files | `*.types.ts` |
| Constants | `*.constants.ts` |

### Hook Rules

- **Return named objects**, never arrays: `return { formData, errors, handleSubmit, isSubmitting };`
- **Orchestrator hook** owns `useTranslations`, `useRouter`, `useConfirm`; sub-hooks receive them as params
- **Race-condition guard** on submit: `if (isUpdating || isPending) return;`
- **No `useEffect` without cleanup**
- **No premature `useCallback`/`useMemo`** on trivial handlers

### Styling

- **Only `cn()`** for class composition: `cn('base-class', condition && 'conditional', className)`
- Consumer's `className` is **always last** so it can override
- **Variants are typed unions + lookup maps**, not nested ternaries
- No inline `style={{...}}` for static styling — use Tailwind

### Types

- **No `any`** — at API boundaries use `unknown` + type guards; inside, use generics or concrete types
- **No `enum`** — use `as const` tuples: `export const TABS = ['a', 'b'] as const; export type TabId = (typeof TABS)[number];`
- Discriminated unions for action/API responses

### Accessibility

- Every interactive element has `role`, `aria-*`, and keyboard handlers
- Form inputs wire `aria-invalid` + `aria-describedby`
- Modals/Drawers implement: focus trap, ESC handler, scroll lock, focus restore
- Custom clickable `<div>`s carry `role`, `tabIndex`, and keyboard handlers

### Error Handling

- Server logs use `createLogger('Namespace')` (pino)
- User feedback: `toast.success`, `toast.error`, `toast.info` — never `alert()`
- Destructive actions: always `useConfirm()`
- Action results: `{ success: false, error, message?, errors? }`

### Logging & Security

- Server logger auto-redacts `password`, `token`, `secret`, `authorization`, `cookie`, `session`, `jwt`
- Never log full request bodies, tokens, or passwords
- No hardcoded URLs — use config: `getAppConfig().api.baseUrl`
- Path segments always use `encodeURIComponent`

---

## 6. i18n (Internationalization)

### File Structure

```
src/i18n/locales/
├── en/
│   ├── common.json
│   ├── dashboard.json
│   └── <feature>.json
├── hi/
│   └── <namespace>.json
└── mr/
    └── <namespace>.json
```

### Usage

| API | Where |
|-----|-------|
| `await getTranslations({ locale, namespace })` | Server components / server actions |
| `useTranslations(namespace)` | `'use client'` components only |

**Rules:**
- Every visible string goes through `t(...)`
- New keys added to **all three locales** (`en`, `hi`, `mr`) in the same PR
- Use ICU placeholders: `{count}`, `{label}`, `{id}` — never string concatenation
- Never mix client and server translation APIs in the same component

### Pass-Translation-As-Prop Pattern

```ts
// Server component
const t = await getTranslations({ locale, namespace: 'login' });
const copy: LoginFormCopy = { title: t('title'), username: t('username') };
return <LoginForm copy={copy} />;
```

This avoids re-loading the namespace on the client and gives compile-time guarantees.

---

## 7. Testing

Every new hook, service, and reusable component ships a `*.test.ts(x)` in `src/__tests__/` mirroring the source layout.

```ts
// src/__tests__/hooks/useXxxForm.test.ts
import { renderHook, act } from '@testing-library/react';
import { useXxxForm } from '@/hooks/useXxxForm';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe('useXxxForm', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should initialize with default data', () => {
    const { result } = renderHook(() => useXxxForm(mockProps));
    expect(result.current.formData.field).toBe('');
  });
});
```

**Rules:**
- `beforeEach(() => vi.clearAllMocks())` is mandatory
- Tests live in `src/__tests__/` mirroring the source folder tree

---

## 8. Self-Review Checklist

Run this checklist before raising a PR:

### Architecture
- [ ] Every `page.tsx` is a server component (no `'use client'`)
- [ ] Data fetched on server and passed as props — no `useEffect` + `fetch` in client
- [ ] Page, sort, filter, search state in `searchParams`, not `useState`
- [ ] `loading.tsx` and `error.tsx` exist beside every new `page.tsx`

### Server Actions
- [ ] Every mutation reads `userId` from cookies and 401s if missing
- [ ] Every mutation calls `revalidatePath` for **every locale**
- [ ] No exception escapes the action — always returns `{ success: false, ... }`

### Services / API
- [ ] All HTTP calls go through `apiClient`
- [ ] Modules touching cookies/env import `'server-only'`
- [ ] Every list response is `filter(isXShape).map(normalizeX)` — no `as X[]`
- [ ] No hardcoded base URLs
- [ ] `sanitizeParams` used on every page-level searchParams

### Hooks & Forms
- [ ] Hook returns an object, not an array
- [ ] Submit handler has race-condition guard
- [ ] Validation errors gated by `submittedOnce || touched[field]`
- [ ] No `useEffect` without cleanup

### Types
- [ ] No `any` anywhere — use `unknown` + type guards at boundaries
- [ ] No new `enum` — use `as const` tuples

### i18n
- [ ] No literal JSX text — every visible string goes through `t(...)`
- [ ] New keys added to **all three locales**
- [ ] `useTranslations` only in `'use client'`; `getTranslations` only in server

### UI / Styling / A11y
- [ ] `cn()` used for class composition
- [ ] Consumer `className` is last in `cn(...)`
- [ ] Form inputs wire `aria-invalid` + `aria-describedby`
- [ ] Destructive actions use `useConfirm()`; feedback uses `toast.*`

### Naming
- [ ] Routes `kebab-case`, Components `PascalCase`, Hooks `useCamelCase`
- [ ] Imports use barrels (`@/components/common`, not deep paths)
- [ ] Unused vars/args prefixed with `_`

### Tests
- [ ] New hooks/services have `*.test.ts(x)` in `src/__tests__/`
- [ ] `beforeEach(() => vi.clearAllMocks())` in every suite

### Lint & Build
- [ ] `npm run lint` clean
- [ ] `npm run type-check` clean
- [ ] `npm test` green

---

## Quick Reference: Common Task Recipe

### Adding a new Master CRUD (`xxx-master`)

1. **Types** — `src/types/xxx.types.ts`
2. **Service** — `src/lib/api/xxx-crud.service.ts`
3. **Validators** — `src/lib/api/xxx-validation.ts`
4. **Type guards** — `src/lib/api/xxx-types-guard.ts`
5. **Server actions** — `src/app/[locale]/path/action.ts`
6. **Pages** — `page.tsx`, `add/page.tsx`, `edit/[id]/page.tsx` + `loading.tsx`, `error.tsx`
7. **Components** — `XxxMaster.tsx`, `XxxForm.tsx`, sections, `XxxColumns.tsx`
8. **Hooks** — `useXxxForm.ts`, `useXxxPagination.ts`, `useXxxSearch.ts`
9. **i18n** — add `xxx.json` to all three locales
10. **Routes** — add to `src/lib/constants/routes.ts`
11. **Tests** — `src/__tests__/hooks/`, `src/__tests__/lib/api/`

---

**Owners:** Engineering. Update this file whenever coding patterns evolve.