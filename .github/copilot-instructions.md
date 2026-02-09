# GitHub Copilot Code Review Instructions

## Project Context
This is a **Next.js 16+ App Router** project using **Server-Side Rendering (SSR)** with:
- TypeScript for type safety
- next-intl for internationalization (i18n)
- Parameterized routes with locale support (`[locale]`)
- Server Components by default
- Client Components explicitly marked with `'use client'`

---

## Core Code Review Principles

### 1. SSR-First Architecture ✅

#### Server Components (Default)
- **ALWAYS check**: Is this component running on the server by default?
- **NO client-side hooks** in Server Components:
  - ❌ `useState`, `useEffect`, `useContext`, `useReducer`
  - ❌ Event handlers (`onClick`, `onChange`, etc.)
  - ❌ Browser APIs (`window`, `document`, `localStorage`)
- **Use async/await** for data fetching directly in Server Components
- **Access params correctly**: 
  ```tsx
  // ✅ Correct - params is a Promise in Next.js 15+
  async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  }
  
  // ❌ Wrong - synchronous access
  function Page({ params }: { params: { locale: string } }) {
    const { locale } = params; // Will fail
  }
  ```

#### Client Components
- **MUST have** `'use client'` directive at the top
- Use when you need:
  - Interactive state (`useState`, `useReducer`)
  - Lifecycle effects (`useEffect`, `useLayoutEffect`)
  - Browser APIs
  - Event handlers
  - Custom hooks that use client-side features
- **Minimize** client component usage - keep them small and focused

### 2. TypeScript & Type Safety 🔒

#### Type Exposure Rules
- **Export all public types** from component files if they're reused
- **Define prop interfaces** explicitly:
  ```tsx
  // ✅ Good
  interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }
  export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {}
  
  // ❌ Bad - inline types without export
  export function Button({ label, onClick }: { label: string; onClick: () => void }) {}
  ```

- **Use generic types** for reusable components:
  ```tsx
  // ✅ Good
  interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
  }
  ```

- **Avoid `any`** - use `unknown` or proper types
- **Use enums or union types** for fixed values:
  ```tsx
  // ✅ Good
  type Status = 'active' | 'inactive' | 'pending';
  
  // Or for more features:
  enum Status {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending'
  }
  ```

#### Common TypeScript Best Practices

**1. Always annotate function return types:**
```tsx
// ✅ Good - explicit return type
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad - inferred return type (can lead to errors)
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**2. Use type guards for narrowing:**
```tsx
// ✅ Good - proper type narrowing
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // TypeScript knows it's a string
  }
  return value.toFixed(2); // TypeScript knows it's a number
}

// ✅ Good - custom type guard
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
```

**3. Use optional chaining and nullish coalescing:**
```tsx
// ✅ Good - safe property access
const userName = user?.profile?.name ?? 'Guest';

// ❌ Bad - unsafe access
const userName = user.profile.name || 'Guest';
```

**4. Avoid non-null assertions (!):**
```tsx
// ❌ Bad - unsafe assertion
const element = document.getElementById('my-id')!;

// ✅ Good - handle null case
const element = document.getElementById('my-id');
if (!element) {
  throw new Error('Element not found');
}
```

**5. Avoid type assertions (as) unless absolutely necessary:**
```tsx
// ❌ Bad - bypassing type safety
const data = response as UserData;

// ✅ Good - validate and type guard
function isUserData(data: unknown): data is UserData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}

if (isUserData(response)) {
  // Use response safely
}
```

**6. Use utility types effectively:**
```tsx
// ✅ Good - leverage built-in utility types
type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type UserResponse = Omit<User, 'password'>; // Exclude sensitive fields
type PartialUser = Partial<User>; // All properties optional
type ReadonlyUser = Readonly<User>; // Immutable
type UserRecord = Record<string, User>; // Dictionary type
```

**7. Prefer interfaces for object shapes, types for unions:**
```tsx
// ✅ Good - interface for objects
interface User {
  id: string;
  name: string;
}

// ✅ Good - type for unions and computed types
type Status = 'active' | 'inactive';
type UserWithStatus = User & { status: Status };
```

**8. Use const assertions for literal types:**
```tsx
// ✅ Good - preserves literal types
const COLORS = {
  primary: '#007bff',
  secondary: '#6c757d',
} as const;

type Color = typeof COLORS[keyof typeof COLORS]; // '#007bff' | '#6c757d'

// ❌ Bad - loses literal types
const COLORS = {
  primary: '#007bff',
  secondary: '#6c757d',
};
```

**9. Import types with type keyword:**
```tsx
// ✅ Good - explicit type import (better for tree-shaking)
import type { User } from './types';
import { getUser } from './api';

// ❌ Acceptable but less optimal
import { User, getUser } from './api';
```

**10. Define discriminated unions for complex state:**
```tsx
// ✅ Good - discriminated union
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function Component() {
  const [state, setState] = useState<AsyncState<User>>({ status: 'idle' });

  // TypeScript narrows types based on status
  if (state.status === 'success') {
    console.log(state.data); // data is available
  }
}
```

**11. Use unknown instead of any for dynamic data:**
```tsx
// ✅ Good - safe handling of unknown data
async function fetchData(): Promise<unknown> {
  const response = await fetch('/api/data');
  return response.json();
}

const data = await fetchData();
if (isValidData(data)) {
  // Now use data safely
}

// ❌ Bad - bypasses type safety
async function fetchData(): Promise<any> {
  const response = await fetch('/api/data');
  return response.json();
}
```

**12. Properly type async functions:**
```tsx
// ✅ Good - explicit Promise return type
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ✅ Good - handle errors with union type
async function fetchUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
```

**13. Use strict null checks:**
```tsx
// ✅ Good - handle null/undefined explicitly
function getLength(str: string | null): number {
  return str?.length ?? 0;
}

// ❌ Bad - assumes non-null
function getLength(str: string | null): number {
  return str.length; // Error with strictNullChecks
}
```

**14. Properly type array operations:**
```tsx
// ✅ Good - type-safe array methods
const users: User[] = [];
const names: string[] = users.map((user) => user.name);

// ✅ Good - filter with type predicate
function isAdmin(user: User): user is Admin {
  return user.role === 'admin';
}
const admins = users.filter(isAdmin); // Type is Admin[]
```

### 3. Params & SearchParams Handling 🔍

#### Route Params (Dynamic Routes)
```tsx
// ✅ Correct - Server Component
interface PageProps {
  params: Promise<{ locale: string; id?: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { locale, id } = await params;
  const search = await searchParams;
  // ... use params
}
```

#### Client Component Access
```tsx
// ✅ Use hooks for client components
'use client';

import { useParams, useSearchParams } from 'next/navigation';

export function ClientComponent() {
  const params = useParams();
  const searchParams = useSearchParams();
  // params and searchParams are synchronous here
}
```

### 4. Internationalization (i18n) 🌐

#### Server Components
```tsx
// ✅ Use server-side translation
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('namespace');
  return <h1>{t('key')}</h1>;
}
```

#### Client Components
```tsx
// ✅ Use client-side translation
'use client';
import { useTranslations } from 'next-intl';

export function Component() {
  const t = useTranslations('namespace');
  return <h1>{t('key')}</h1>;
}
```

### 5. Data Fetching Patterns 📊

#### Server Components (Preferred)
```tsx
// ✅ Direct async/await in Server Components
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store', // or 'force-cache', or { next: { revalidate: 60 } }
  });
  const json = await data.json();
  return <div>{json.title}</div>;
}
```

#### Client Components
```tsx
// ✅ Use hooks for client-side fetching
'use client';
import { useEffect, useState } from 'react';

export function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  
  return data ? <div>{data.title}</div> : <div>Loading...</div>;
}
```

### 6. Component Organization 📁

#### File Structure
- **One component per file** (except tightly coupled sub-components)
- **Export types alongside components** in the same file
- **Use barrel exports** (`index.ts`) for module-level exports
- **Co-locate related files**: `ComponentName.tsx`, `ComponentName.test.tsx`, `types.ts`

#### Naming Conventions
- **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (`format.ts`, `security.ts`)
- **Types**: PascalCase interfaces/types (`UserProfile`, `ApiResponse`)
- **Constants**: UPPER_SNAKE_CASE or camelCase based on usage

#### Project Folder Structure 📂

**ALWAYS place files in the correct directory according to this structure:**

```
src/
├── app/                          # Next.js App Router pages
│   ├── globals.css              # Global styles
│   ├── [locale]/                # Locale-based routes
│   │   ├── layout.tsx           # Root layout (Server Component)
│   │   ├── page.tsx             # Home page
│   │   ├── dashboard/           # Feature-based page folders
│   │   │   ├── page.tsx         # Page component (Server Component by default)
│   │   │   ├── loading.tsx      # Loading UI
│   │   │   ├── error.tsx        # Error boundary (Client Component)
│   │   │   └── actions.ts       # Server actions
│   │   └── [feature]/           # Other feature pages
│   └── api/                     # API routes (if needed)
│
├── components/                   # Reusable React components
│   ├── common/                  # Generic, reusable UI components
│   │   ├── Button.tsx           # Atomic components
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   └── index.ts             # Barrel export
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MainLayout.tsx
│   │   └── index.ts
│   └── modules/                 # Feature-specific components
│       ├── dashboard/           # Dashboard module components
│       │   ├── DashboardTable.tsx
│       │   ├── AddRouteButton.tsx
│       │   └── index.ts
│       ├── birth-death/         # Birth/Death certificate module
│       │   ├── CertificateApplication.tsx
│       │   └── index.ts
│       └── [feature-name]/      # Other feature modules
│
├── types/                        # TypeScript type definitions
│   ├── common.types.ts          # Shared types (ApiResponse, User, etc.)
│   ├── service.types.ts         # Service-specific types
│   ├── master.types.ts          # Master data types
│   └── [feature].types.ts       # Feature-specific types
│
├── lib/                          # Utilities and helper functions
│   ├── api/                     # API client utilities
│   │   └── services.ts          # API service layer
│   ├── constants/               # Application constants
│   │   └── routes.ts            # Route definitions
│   └── utils/                   # Utility functions
│       ├── cn.ts                # Class name utilities
│       ├── format.ts            # Formatting utilities
│       └── security.ts          # Security utilities
│
├── services/                     # Business logic and API services
│   ├── api.service.ts           # Generic API service
│   ├── auth.service.ts          # Authentication service
│   └── [feature].service.ts     # Feature-specific services
│
├── hooks/                        # Custom React hooks
│   ├── useAsync.ts              # Async state management
│   ├── useLoading.ts            # Loading state hook
│   └── [custom-hook].ts         # Other hooks
│
├── i18n/                         # Internationalization
│   ├── config.ts                # i18n configuration
│   ├── request.ts               # Server-side i18n request handler
│   └── locales/                 # Translation files
│       ├── en/                  # English translations
│       │   ├── common.json
│       │   └── [feature].json
│       ├── hi/                  # Hindi translations
│       └── mr/                  # Marathi translations
│
├── config/                       # Application configuration
│   └── app.config.ts            # App-level config
│
├── middleware.ts                 # Next.js middleware (i18n routing)
│
└── __tests__/                    # Test files
    ├── setup.ts                 # Test setup
    ├── components/              # Component tests
    └── utils/                   # Utility tests
```

#### Folder Placement Rules ✅

**1. Components:**
- ✅ **common/** - Generic, reusable UI (buttons, inputs, cards, tables)
- ✅ **layout/** - Layout-specific (header, footer, sidebar)
- ✅ **modules/** - Feature-specific components organized by feature/module
- ❌ Don't mix feature logic in common components
- ❌ Don't put page components in the components folder

**2. Pages (app/ directory):**
- ✅ All routes go in `app/[locale]/[route-name]/`
- ✅ Use `page.tsx` for the main page component
- ✅ Use `layout.tsx` for shared layouts
- ✅ Use `loading.tsx` for loading states
- ✅ Use `error.tsx` for error boundaries
- ✅ Use `actions.ts` for Server Actions
- ❌ Don't create page components outside the app directory

**3. Types:**
- ✅ **types/** - All TypeScript type/interface definitions
- ✅ Export types from component files, but also create dedicated type files for shared types
- ✅ Group related types in the same file (e.g., `user.types.ts`)
- ❌ Don't scatter type definitions without central exports

**4. Services:**
- ✅ **services/** - API calls, business logic, data transformations
- ✅ Keep services framework-agnostic (no React hooks)
- ✅ One service per domain/feature
- ❌ Don't put React logic in services

**5. Hooks:**
- ✅ **hooks/** - Custom React hooks only
- ✅ Prefix all hooks with `use` (e.g., `useAuth`, `useAsync`)
- ❌ Don't put non-hook utilities in this folder

**6. Utils:**
- ✅ **lib/utils/** - Pure utility functions (formatting, validation, etc.)
- ✅ Keep utils pure and testable (no side effects)
- ❌ Don't put API calls or business logic here

**7. Translations:**
- ✅ **i18n/locales/[locale]/** - JSON translation files
- ✅ Organize by feature/module (e.g., `dashboard.json`, `common.json`)
- ✅ Keep keys consistent across all locale files
- ❌ Don't hardcode strings - always use translation keys

#### File Organization Best Practices

**When creating new files, ask:**
1. Is this a reusable UI component? → `components/common/`
2. Is this feature-specific? → `components/modules/[feature]/`
3. Is this a page? → `app/[locale]/[route]/page.tsx`
4. Is this a type definition? → `types/[domain].types.ts`
5. Is this business logic? → `services/[feature].service.ts`
6. Is this a utility function? → `lib/utils/[name].ts`
7. Is this a custom hook? → `hooks/use[Name].ts`

**Example - Adding a new feature "Property Tax":**
```
✅ Correct structure:
src/
├── app/[locale]/property-tax/page.tsx              # Page route
├── components/modules/property-tax/                # Feature components
│   ├── PropertyTaxForm.tsx
│   ├── PropertyTaxTable.tsx
│   └── index.ts
├── types/property-tax.types.ts                     # Feature types
├── services/property-tax.service.ts                # Feature service
└── i18n/locales/en/property-tax.json              # Translations

❌ Wrong structure:
src/
├── property-tax/                                   # Don't create top-level feature folders
│   ├── PropertyTaxForm.tsx
│   ├── types.ts
│   └── service.ts
```

### 7. Error Handling & Loading States ⚠️

#### Server Components
```tsx
// ✅ Use error.tsx and loading.tsx files
// app/[locale]/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}

// app/[locale]/dashboard/error.tsx
'use client'; // Error components must be Client Components

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

#### Client Components
```tsx
// ✅ Use try-catch and state
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

try {
  setLoading(true);
  await fetchData();
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error');
} finally {
  setLoading(false);
}
```

### 8. Performance Optimization 🚀

- **Use Server Components by default** - smaller bundle size
- **Lazy load Client Components**:
  ```tsx
  import dynamic from 'next/dynamic';
  
  const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <p>Loading...</p>,
  });
  ```
- **Implement proper caching** strategies in fetch calls
- **Use React.memo** sparingly and only when needed
- **Avoid prop drilling** - use context or composition

### 9. Security Best Practices 🔐

- **Validate all user inputs** on both client and server
- **Sanitize data** before rendering (use proper escaping)
- **Never expose sensitive data** in client components
- **Use environment variables** for secrets (not in client code)
- **Implement proper authentication checks** in Server Components and API routes
- **Use CSRF protection** for mutations

---

## Review Checklist

When reviewing code, verify:

### Component Level
- [ ] Is `'use client'` directive present **only when needed**?
- [ ] Are params accessed correctly (awaited in Server Components)?
- [ ] Are all props properly typed with exported interfaces?
- [ ] Is the component using the correct translation method (server vs client)?
- [ ] Are error boundaries and loading states handled?
- [ ] Is the component accessible (semantic HTML, ARIA, keyboard nav)?
- [ ] Is the file placed in the correct folder according to project structure?

### Type Safety
- [ ] Are all function parameters and return types defined?
- [ ] Are generic types used for reusable components?
- [ ] Are enums/union types used instead of magic strings?
- [ ] Are API response types properly defined and used?
- [ ] Are no `any` types used (use `unknown` if necessary)?
- [ ] Are type guards used for narrowing instead of type assertions?
- [ ] Is optional chaining (?.) and nullish coalescing (??) used correctly?
- [ ] Are non-null assertions (!) avoided?
- [ ] Are utility types (Omit, Pick, Partial, etc.) used appropriately?
- [ ] Are types imported with `import type` when possible?

### SSR Compliance
- [ ] No browser APIs in Server Components?
- [ ] No useState/useEffect in Server Components?
- [ ] No event handlers in Server Components?
- [ ] Are async Server Components used for data fetching?
- [ ] Is data fetching happening at the right level?

### Code Quality
- [ ] Is the code DRY (Don't Repeat Yourself)?
- [ ] Are magic numbers/strings extracted to constants?
- [ ] Is error handling comprehensive?
- [ ] Are loading states properly managed?
- [ ] Is the code testable (pure functions, proper separation)?
- [ ] Are new files created in the appropriate folder (components/common vs modules, types/, services/, etc.)?
- [ ] Are barrel exports (index.ts) used for module-level exports?

### Performance
- [ ] Is the component tree optimized (minimal Client Components)?
- [ ] Are heavy components lazy loaded?
- [ ] Is proper caching strategy used?
- [ ] Are unnecessary re-renders avoided?

### Security
- [ ] Is user input validated and sanitized?
- [ ] Are secrets not exposed in client code?
- [ ] Are authentication/authorization checks in place?
- [ ] Is sensitive data not logged or exposed?

---

## Common Issues & Solutions

### ❌ Issue: Using hooks in Server Component
```tsx
// Bad
export default function Page() {
  const [state, setState] = useState(null); // Error!
  return <div>{state}</div>;
}
```

**✅ Solution**: Add `'use client'` or refactor to not need state
```tsx
'use client';
export default function Page() {
  const [state, setState] = useState(null);
  return <div>{state}</div>;
}
```

### ❌ Issue: Not awaiting params
```tsx
// Bad
export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = params.locale; // Error: params is a Promise!
  return <div>{locale}</div>;
}
```

**✅ Solution**: Make component async and await params
```tsx
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <div>{locale}</div>;
}
```

### ❌ Issue: Missing type exports
```tsx
// Bad - types not exported
function Button({ label }: { label: string }) {
  return <button>{label}</button>;
}
```

**✅ Solution**: Export interface
```tsx
export interface ButtonProps {
  label: string;
}

export function Button({ label }: ButtonProps) {
  return <button>{label}</button>;
}
```

### ❌ Issue: Fetching in useEffect when SSR is available
```tsx
// Bad - unnecessary client-side fetch
'use client';
export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  return <div>{data?.title}</div>;
}
```

**✅ Solution**: Use Server Component
```tsx
export default async function Page() {
  const data = await fetch('/api/data').then(r => r.json());
  return <div>{data.title}</div>;
}
```

---

## Project-Specific Guidelines

### This Project Uses:
- **Next.js App Router** with SSR by default
- **next-intl** for i18n with locale prefixes (`/en/`, `/hi/`, `/mr/`)
- **TypeScript** with strict type checking
- **Vitest** for testing
- **TailwindCSS** for styling
- **Locale middleware** that handles routing

### Key Files to Review:
- `src/middleware.ts` - i18n routing logic
- `src/app/[locale]/layout.tsx` - Root layout with locale handling
- `src/types/*.ts` - Type definitions
- `src/components/**/*.tsx` - Component implementations
- `src/lib/utils/*.ts` - Utility functions

### Always Ensure:
1. Components handle locale parameter correctly
2. Translations use the appropriate method (server vs client)
3. Types are properly exported and reused
4. SSR is leveraged wherever possible
5. Client components are minimal and purposeful

---

**Last Updated**: January 27, 2026
**Project**: NTIS UI - Municipal Services Platform
