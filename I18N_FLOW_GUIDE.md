# i18n Flow & Developer Guide

## 📚 Table of Contents
1. [Complete Request Flow](#complete-request-flow)
2. [Middleware Logic](#middleware-logic)
3. [Translation Loading](#translation-loading)
4. [Component Architecture](#component-architecture)
5. [Language Change Flow](#language-change-flow)
6. [Developer Guidelines](#developer-guidelines)
7. [Adding New Locales](#adding-new-locales)
8. [Component Best Practices](#component-best-practices)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Complete Request Flow

### Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. USER MAKES REQUEST                        │
│                                                                 │
│  Browser: http://localhost:3000/dashboard                      │
│  Cookie: NEXT_LOCALE=hi                                        │
│  Accept-Language: hi-IN,en-US;q=0.9                            │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              2. MIDDLEWARE INTERCEPTS (Server-Side)             │
│                   src/middleware.ts                             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │ Step 1: Parse URL for locale                          │     │
│  │   /dashboard → no locale in path                      │     │
│  │   /hi/dashboard → locale = 'hi'                       │     │
│  │                                                        │     │
│  │ Step 2: Check cookie                                  │     │
│  │   NEXT_LOCALE = 'hi'                                  │     │
│  │                                                        │     │
│  │ Step 3: Check Accept-Language header                  │     │
│  │   'hi-IN' → extract 'hi'                              │     │
│  │                                                        │     │
│  │ Step 4: Determine final locale (priority)             │     │
│  │   Priority: URL > Cookie > Browser > Default          │     │
│  │   Result: locale = 'hi'                               │     │
│  │                                                        │     │
│  │ Step 5: Redirect if needed                            │     │
│  │   URL has no locale + locale ≠ 'en'                   │     │
│  │   → Redirect: /dashboard → /hi/dashboard              │     │
│  │                                                        │     │
│  │ Step 6: Set/update cookie                             │     │
│  │   Set-Cookie: NEXT_LOCALE=hi; Path=/; Max-Age=31536000│     │
│  └───────────────────────────────────────────────────────┘     │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│           3. i18n REQUEST CONFIG (Server-Side)                  │
│                   src/i18n/request.ts                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │ Step 1: Read locale from cookie                       │     │
│  │   const locale = cookies().get('NEXT_LOCALE')?.value  │     │
│  │   → locale = 'hi'                                     │     │
│  │                                                        │     │
│  │ Step 2: Dynamically import translation files          │     │
│  │   const common = await import(`./locales/hi/common.json`)│  │
│  │   const dashboard = await import(`./locales/hi/dashboard.json`)│
│  │                                                        │     │
│  │ Step 3: Return configuration                          │     │
│  │   return {                                            │     │
│  │     locale: 'hi',                                     │     │
│  │     messages: {                                       │     │
│  │       common: { buttons: {...}, status: {...} },     │     │
│  │       dashboard: { title: "डैशबोर्ड", ... }           │     │
│  │     }                                                 │     │
│  │   }                                                   │     │
│  └───────────────────────────────────────────────────────┘     │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              4. ROOT LAYOUT RENDERS (Server Component)          │
│                   src/app/[locale]/layout.tsx                   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │ async function RootLayout({ children, params }) {     │     │
│  │   const { locale } = await params; // 'hi'           │     │
│  │   const messages = await getMessages();              │     │
│  │                                                        │     │
│  │   return (                                            │     │
│  │     <html lang={locale}>  {/* lang="hi" */}          │     │
│  │       <body className="font-devanagari">             │     │
│  │         <NextIntlClientProvider                      │     │
│  │           locale={locale}                            │     │
│  │           messages={messages}                        │     │
│  │         >                                             │     │
│  │           {children}                                 │     │
│  │         </NextIntlClientProvider>                    │     │
│  │       </body>                                         │     │
│  │     </html>                                           │     │
│  │   );                                                  │     │
│  │ }                                                     │     │
│  └───────────────────────────────────────────────────────┘     │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│           5. DASHBOARD PAGE RENDERS (Server Component)          │
│                src/app/[locale]/dashboard/page.tsx              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │ // ✅ Server Component - runs on server               │     │
│  │ export default async function DashboardPage() {       │     │
│  │                                                        │     │
│  │   // Fetch data (server-side)                        │     │
│  │   const data = await getDashboardData();             │     │
│  │                                                        │     │
│  │   // Get translation functions (SSR)                 │     │
│  │   const tDashboard = await getTranslations('dashboard');│  │
│  │   const tCommon = await getTranslations('common');   │     │
│  │                                                        │     │
│  │   // Calculate stats                                  │     │
│  │   const stats = {                                     │     │
│  │     totalRoutes: data.length,                        │     │
│  │     activeVehicles: data.reduce(...)                 │     │
│  │   };                                                  │     │
│  │                                                        │     │
│  │   return (                                            │     │
│  │     <div>                                             │     │
│  │       <h1>{tDashboard('title')}</h1>                 │     │
│  │       {/* Renders: <h1>डैशबोर्ड</h1> */}              │     │
│  │                                                        │     │
│  │       <Card>                                          │     │
│  │         <div>{tDashboard('stats.totalRoutes')}</div> │     │
│  │         {/* Renders: <div>कुल मार्ग</div> */}         │     │
│  │         <div>{stats.totalRoutes}</div>               │     │
│  │       </Card>                                         │     │
│  │                                                        │     │
│  │       <DashboardTable data={data} />                 │     │
│  │     </div>                                            │     │
│  │   );                                                  │     │
│  │ }                                                     │     │
│  └───────────────────────────────────────────────────────┘     │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│        6. DASHBOARD TABLE RENDERS (Server Component)            │
│         src/components/modules/dashboard/DashboardTable.tsx     │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │ // ✅ Server Component - async function               │     │
│  │ export async function DashboardTable({ data }) {      │     │
│  │                                                        │     │
│  │   // Get translations (SSR)                           │     │
│  │   const tDashboard = await getTranslations('dashboard');│  │
│  │   const tCommon = await getTranslations('common');   │     │
│  │                                                        │     │
│  │   const columns = [                                   │     │
│  │     {                                                  │     │
│  │       key: 'route',                                   │     │
│  │       label: tDashboard('table.columns.route')       │     │
│  │       // → label: 'मार्ग'                             │     │
│  │     },                                                 │     │
│  │     {                                                  │     │
│  │       key: 'status',                                  │     │
│  │       label: tDashboard('table.columns.status'),     │     │
│  │       render: (value) => {                           │     │
│  │         const statusKey = value.toLowerCase();       │     │
│  │         const text = tCommon(`status.${statusKey}`); │     │
│  │         // 'Active' → 'सक्रिय'                        │     │
│  │         return <span>{text}</span>;                  │     │
│  │       }                                               │     │
│  │     },                                                 │     │
│  │     {                                                  │     │
│  │       key: 'id',                                      │     │
│  │       label: tDashboard('table.columns.actions'),    │     │
│  │       render: (id) => (                              │     │
│  │         <DeleteButton                                │     │
│  │           routeId={id}                               │     │
│  │           deleteLabel={tCommon('buttons.delete')}    │     │
│  │           errorMessage={tCommon('errors.deleteError')}│    │
│  │         />                                            │     │
│  │         // ✅ Pass translations as PROPS              │     │
│  │       )                                               │     │
│  │     }                                                  │     │
│  │   ];                                                   │     │
│  │                                                        │     │
│  │   return <Table data={data} columns={columns} />;    │     │
│  │ }                                                     │     │
│  └───────────────────────────────────────────────────────┘     │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│          7. DELETE BUTTON RENDERS (Client Component)            │
│         src/components/modules/dashboard/DeleteButton.tsx       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │ 'use client'; // ⚠️ Client Component                  │     │
│  │                                                        │     │
│  │ interface DeleteButtonProps {                         │     │
│  │   routeId: string;                                    │     │
│  │   deleteLabel: string;     // ← Already translated    │     │
│  │   errorMessage: string;    // ← Already translated    │     │
│  │ }                                                      │     │
│  │                                                        │     │
│  │ export function DeleteButton({                        │     │
│  │   routeId,                                            │     │
│  │   deleteLabel,      // 'हटाएं'                        │     │
│  │   errorMessage      // 'मार्ग हटाने में त्रुटि हुई'    │     │
│  │ }: DeleteButtonProps) {                               │     │
│  │   const [isPending, startTransition] = useTransition();│    │
│  │                                                        │     │
│  │   const handleDelete = () => {                        │     │
│  │     startTransition(async () => {                    │     │
│  │       const result = await deleteRoute(routeId);     │     │
│  │       if (!result.success) {                         │     │
│  │         alert(errorMessage); // Hindi error message  │     │
│  │       }                                               │     │
│  │     });                                               │     │
│  │   };                                                  │     │
│  │                                                        │     │
│  │   return (                                            │     │
│  │     <button                                           │     │
│  │       onClick={handleDelete}                         │     │
│  │       disabled={isPending}                           │     │
│  │       title={deleteLabel} // Tooltip in Hindi        │     │
│  │     >                                                 │     │
│  │       <Trash2Icon />                                 │     │
│  │     </button>                                         │     │
│  │   );                                                  │     │
│  │ }                                                     │     │
│  │                                                        │     │
│  │ // ✅ No translation logic needed!                    │     │
│  │ // ✅ Receives pre-translated text as props          │     │
│  │ // ✅ Only handles interactivity                     │     │
│  └───────────────────────────────────────────────────────┘     │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  8. HTML SENT TO BROWSER                        │
│                                                                 │
│  <!DOCTYPE html>                                                │
│  <html lang="hi">                                               │
│    <head>                                                       │
│      <title>NTIS Dashboard</title>                             │
│      <link href="...Noto_Sans_Devanagari..." />                │
│    </head>                                                      │
│    <body class="font-devanagari">                              │
│      <main>                                                     │
│        <h1>डैशबोर्ड</h1>                                         │
│        <p>संचालन का अवलोकन और वास्तविक समय स्थिति</p>          │
│                                                                 │
│        <div class="stats-grid">                                │
│          <div class="stat-card">                               │
│            <div>कुल मार्ग</div>                                 │
│            <div>25</div>                                       │
│          </div>                                                 │
│          <div class="stat-card">                               │
│            <div>सक्रिय वाहन</div>                              │
│            <div>150</div>                                      │
│          </div>                                                 │
│        </div>                                                   │
│                                                                 │
│        <table>                                                  │
│          <thead>                                                │
│            <tr>                                                 │
│              <th>मार्ग</th>                                     │
│              <th>स्थिति</th>                                    │
│              <th>वाहन</th>                                      │
│              <th>क्रियाएं</th>                                  │
│            </tr>                                                │
│          </thead>                                               │
│          <tbody>                                                │
│            <tr>                                                 │
│              <td>Route A</td>                                  │
│              <td><span>सक्रिय</span></td>                       │
│              <td>12</td>                                       │
│              <td><button title="हटाएं">🗑️</button></td>         │
│            </tr>                                                │
│          </tbody>                                               │
│        </table>                                                 │
│      </main>                                                    │
│                                                                 │
│      <script src="/_next/static/chunks/main.js"></script>     │
│    </body>                                                      │
│  </html>                                                        │
│                                                                 │
│  ✅ All text is in Hindi (not translation keys!)               │
│  ✅ Search engines see translated content                      │
│  ✅ Fast first paint (no client-side translation)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Middleware Logic

### Configuration

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales: ['en', 'hi', 'mr'],       // Supported languages
  defaultLocale: 'en',                // Fallback language
  localePrefix: 'as-needed',          // Hide /en/ from URLs
  localeDetection: true,              // Auto-detect from browser
});
```

### Decision Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE DECISION TREE                  │
└─────────────────────────────────────────────────────────────┘

Request: GET /dashboard
Cookie: NEXT_LOCALE=hi
Accept-Language: hi-IN,en-US

Step 1: Check URL
  ├─ Has locale in path? (/hi/dashboard)
  │  ├─ Yes → Use URL locale ✅
  │  └─ No → Continue to Step 2
  
Step 2: Check Cookie
  ├─ Cookie NEXT_LOCALE exists?
  │  ├─ Yes ('hi') → Use cookie locale ✅
  │  └─ No → Continue to Step 3
  
Step 3: Check Accept-Language Header
  ├─ Header exists and has valid locale?
  │  ├─ Yes ('hi-IN' → 'hi') → Use browser locale ✅
  │  └─ No → Continue to Step 4
  
Step 4: Use Default
  └─ Fallback to defaultLocale ('en') ✅

Final Decision: locale = 'hi'

Action:
  ├─ URL already has locale? (/hi/dashboard)
  │  ├─ Yes → Continue (no redirect)
  │  └─ No → Redirect /dashboard → /hi/dashboard
  
  ├─ Is default locale + localePrefix='as-needed'?
  │  ├─ Yes (en) → Don't show /en/ prefix
  │  └─ No (hi, mr) → Show locale prefix
  
  └─ Set cookie: NEXT_LOCALE=hi; Path=/; Max-Age=31536000
```

### Example Scenarios

#### Scenario 1: First Visit (No Cookie)
```
Request:
  URL: http://localhost:3000/dashboard
  Cookie: (none)
  Accept-Language: hi-IN,en-US;q=0.9

Middleware:
  1. URL locale: undefined
  2. Cookie locale: undefined
  3. Browser locale: 'hi' ✅
  4. Final: locale = 'hi'
  
Action:
  - Redirect: 307 /dashboard → /hi/dashboard
  - Set-Cookie: NEXT_LOCALE=hi

Response:
  Status: 307 Temporary Redirect
  Location: /hi/dashboard
  Set-Cookie: NEXT_LOCALE=hi; Path=/; Max-Age=31536000
```

#### Scenario 2: URL Already Correct
```
Request:
  URL: http://localhost:3000/hi/dashboard
  Cookie: NEXT_LOCALE=hi
  Accept-Language: hi-IN

Middleware:
  1. URL locale: 'hi' ✅ (takes priority)
  2. Final: locale = 'hi'
  
Action:
  - Continue (no redirect needed)
  - Cookie already set

Response:
  Status: 200 OK
  (Proceeds to render page)
```

#### Scenario 3: Cookie Changed
```
Request:
  URL: http://localhost:3000/dashboard
  Cookie: NEXT_LOCALE=mr
  Accept-Language: en-US

Middleware:
  1. URL locale: undefined
  2. Cookie locale: 'mr' ✅
  3. Final: locale = 'mr'
  
Action:
  - Redirect: 307 /dashboard → /mr/dashboard
  - Cookie already correct

Response:
  Status: 307 Temporary Redirect
  Location: /mr/dashboard
```

#### Scenario 4: Default Locale (English)
```
Request:
  URL: http://localhost:3000/dashboard
  Cookie: NEXT_LOCALE=en
  Accept-Language: en-US

Middleware:
  1. URL locale: undefined
  2. Cookie locale: 'en' ✅
  3. Final: locale = 'en'
  
Action:
  - localePrefix='as-needed' + defaultLocale='en'
  - Continue (stays at /dashboard, no /en/ prefix)
  - Cookie already set

Response:
  Status: 200 OK
  (English is default, no redirect needed)
```

---

## Translation Loading

### Request Configuration

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // 1. Read locale from cookie (set by middleware)
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  
  // 2. Dynamically load translation files
  const [commonMessages, dashboardMessages] = await Promise.all([
    import(`./locales/${locale}/common.json`),
    import(`./locales/${locale}/dashboard.json`),
  ]);
  
  // 3. Return combined messages
  return {
    locale,
    messages: {
      common: commonMessages.default,
      dashboard: dashboardMessages.default,
    },
  };
});
```

### Translation File Structure

```
src/i18n/locales/
├── en/
│   ├── common.json       # Shared translations
│   └── dashboard.json    # Page-specific translations
├── hi/
│   ├── common.json
│   └── dashboard.json
└── mr/
    ├── common.json
    └── dashboard.json
```

### Translation File Example

```json
// src/i18n/locales/hi/common.json
{
  "buttons": {
    "save": "सहेजें",
    "cancel": "रद्द करें",
    "delete": "हटाएं",
    "edit": "संपादित करें",
    "confirm": "पुष्टि करें"
  },
  "status": {
    "active": "सक्रिय",
    "delayed": "विलंबित",
    "completed": "पूर्ण",
    "pending": "लंबित"
  },
  "errors": {
    "deleteError": "मार्ग हटाने में त्रुटि हुई",
    "createError": "मार्ग बनाने में त्रुटि हुई",
    "updateError": "अपडेट करने में त्रुटि हुई",
    "validationError": "कृपया सभी आवश्यक फ़ील्ड भरें"
  }
}
```

```json
// src/i18n/locales/hi/dashboard.json
{
  "title": "डैशबोर्ड",
  "subtitle": "संचालन का अवलोकन और वास्तविक समय स्थिति",
  "stats": {
    "totalRoutes": "कुल मार्ग",
    "activeVehicles": "सक्रिय वाहन",
    "activeRoutes": "सक्रिय मार्ग",
    "delayed": "विलंबित"
  },
  "table": {
    "title": "मार्ग",
    "columns": {
      "route": "मार्ग",
      "status": "स्थिति",
      "vehicles": "वाहन",
      "lastUpdate": "अंतिम अपडेट",
      "actions": "क्रियाएं"
    }
  }
}
```

---

## Component Architecture

### Server vs Client Components

```
┌─────────────────────────────────────────────────────────────┐
│                     SERVER COMPONENTS                        │
│  (Default in App Router - No 'use client' directive)        │
├─────────────────────────────────────────────────────────────┤
│  ✅ Can be async                                             │
│  ✅ Can use await getTranslations()                          │
│  ✅ Direct database access                                   │
│  ✅ No bundle size (don't ship to client)                    │
│  ✅ Better performance                                       │
│  ❌ No React hooks (useState, useEffect, etc.)               │
│  ❌ No browser APIs (window, document, etc.)                 │
│  ❌ No event handlers (onClick, onChange, etc.)              │
├─────────────────────────────────────────────────────────────┤
│  Examples:                                                   │
│  - src/app/[locale]/layout.tsx                              │
│  - src/app/[locale]/dashboard/page.tsx                      │
│  - src/components/modules/dashboard/DashboardTable.tsx      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     CLIENT COMPONENTS                        │
│  (Require 'use client' directive at top of file)            │
├─────────────────────────────────────────────────────────────┤
│  ✅ Can use React hooks                                      │
│  ✅ Can use browser APIs                                     │
│  ✅ Can have event handlers                                  │
│  ✅ Interactive features                                     │
│  ❌ Cannot be async                                          │
│  ❌ Cannot use await getTranslations()                       │
│  ❌ Adds to JavaScript bundle                                │
├─────────────────────────────────────────────────────────────┤
│  Examples:                                                   │
│  - src/components/modules/dashboard/DeleteButton.tsx        │
│  - src/components/modules/dashboard/LanguageSelector.tsx    │
│  - src/components/modules/dashboard/AddRouteButton.tsx      │
└─────────────────────────────────────────────────────────────┘
```

### Server Component Pattern

```typescript
// ✅ CORRECT: Server Component with SSR translations
// src/components/modules/dashboard/DashboardTable.tsx

import { getTranslations } from 'next-intl/server';
import { Table } from '@/components/common';
import type { DashboardData } from '@/types/service.types';
import { DeleteButton } from './DeleteButton';

// No 'use client' → Server Component
export async function DashboardTable({ data }: { data: DashboardData[] }) {
  // Get translations on server
  const tDashboard = await getTranslations('dashboard');
  const tCommon = await getTranslations('common');

  const columns = [
    { 
      key: 'route', 
      label: tDashboard('table.columns.route') // Translated on server
    },
    {
      key: 'status',
      label: tDashboard('table.columns.status'),
      render: (value: string) => {
        const statusText = tCommon(`status.${value.toLowerCase()}`);
        return <span>{statusText}</span>; // Already translated
      },
    },
    {
      key: 'id',
      label: tDashboard('table.columns.actions'),
      render: (id: string) => (
        // Pass pre-translated text as props to client component
        <DeleteButton
          routeId={id}
          deleteLabel={tCommon('buttons.delete')}      // ← Translated here
          errorMessage={tCommon('errors.deleteError')} // ← Translated here
        />
      ),
    },
  ];

  return <Table data={data} columns={columns} />;
}
```

### Client Component Pattern

```typescript
// ✅ CORRECT: Client Component receiving translations as props
// src/components/modules/dashboard/DeleteButton.tsx

'use client'; // ← Mark as client component

import { useTransition } from 'react';
import { deleteRoute } from '@/app/[locale]/dashboard/actions';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteButtonProps {
  routeId: string;
  deleteLabel: string;      // ← Pre-translated from parent
  errorMessage: string;     // ← Pre-translated from parent
}

export function DeleteButton({ 
  routeId, 
  deleteLabel,      // Already translated
  errorMessage      // Already translated
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteRoute(routeId);
      if (!result.success) {
        alert(result.error || errorMessage); // Use pre-translated message
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      title={deleteLabel} // Use pre-translated label
      className="text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Trash2 size={18} />
      )}
    </button>
  );
}

// ✅ No translation logic needed in client component
// ✅ Receives pre-translated strings as props
// ✅ Only handles interactivity (onClick, state)
```

### Client Component with Translations (Alternative Pattern)

```typescript
// ⚠️ ALTERNATIVE: Client Component using useTranslations()
// Requires NextIntlClientProvider wrapper
// src/components/modules/dashboard/AddRouteButton.tsx

'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl'; // ← Client-side hook
import { createRoute } from '@/app/[locale]/dashboard/actions';
import { Plus, Loader2, X } from 'lucide-react';

export function AddRouteButton() {
  const t = useTranslations('common'); // ← Gets translations from context
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createRoute({
        route: formData.get('route') as string,
        status: formData.get('status') as 'Active' | 'Delayed' | 'Completed',
        vehicles: Number(formData.get('vehicles')),
      });
      
      if (result.success) {
        setIsOpen(false);
      } else {
        alert(t('errors.createError')); // ← Use translation
      }
    });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        <Plus size={18} />
        {t('buttons.add')} {/* ← Use translation */}
      </button>

      {isOpen && (
        <dialog open>
          <form action={handleSubmit}>
            <h2>{t('addRoute.title')}</h2>
            
            <label>
              {t('addRoute.routeName')}
              <input name="route" required />
            </label>
            
            <button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : t('buttons.save')}
            </button>
            
            <button type="button" onClick={() => setIsOpen(false)}>
              {t('buttons.cancel')}
            </button>
          </form>
        </dialog>
      )}
    </>
  );
}

// ⚠️ This component MUST be wrapped in NextIntlClientProvider
// in the parent Server Component:
//
// <NextIntlClientProvider messages={messages}>
//   <AddRouteButton />
// </NextIntlClientProvider>
```

---

## Language Change Flow

### User Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER CLICKS LANGUAGE SELECTOR: हिंदी → मराठी            │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  2. LanguageSelector.handleLanguageChange('mr')             │
│                                                             │
│     const handleLanguageChange = (newLocale: string) => {  │
│       // Set cookie                                        │
│       const expires = new Date();                          │
│       expires.setFullYear(expires.getFullYear() + 1);     │
│       document.cookie = `NEXT_LOCALE=${newLocale};        │
│         path=/; expires=${expires.toUTCString()}`;         │
│                                                             │
│       // Save to localStorage (backup)                     │
│       localStorage.setItem('NEXT_LOCALE', newLocale);     │
│                                                             │
│       // Navigate to new locale path                       │
│       const path = newLocale === 'en'                     │
│         ? '/dashboard'                                     │
│         : `/${newLocale}/dashboard`;                      │
│       router.push(path); // /mr/dashboard                 │
│     };                                                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  3. CLIENT-SIDE NAVIGATION (Next.js Router)                 │
│                                                             │
│     - Browser URL changes: /hi/dashboard → /mr/dashboard  │
│     - No full page reload (SPA navigation)                 │
│     - Smooth transition                                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  4. MIDDLEWARE RUNS AGAIN                                   │
│                                                             │
│     Request: GET /mr/dashboard                             │
│     Cookie: NEXT_LOCALE=mr                                 │
│                                                             │
│     Middleware:                                            │
│     - URL locale: 'mr' ✅                                   │
│     - Cookie locale: 'mr' ✅                                │
│     - Action: Continue (no redirect)                       │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  5. LOAD MARATHI TRANSLATIONS                               │
│                                                             │
│     src/i18n/request.ts:                                   │
│     - import('./locales/mr/common.json')                   │
│     - import('./locales/mr/dashboard.json')                │
│                                                             │
│     Returns:                                               │
│     {                                                       │
│       locale: 'mr',                                        │
│       messages: {                                          │
│         common: { buttons: { delete: "हटवा" }, ... },     │
│         dashboard: { title: "डॅशबोर्ड", ... }              │
│       }                                                     │
│     }                                                       │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  6. RE-RENDER SERVER COMPONENTS                             │
│                                                             │
│     - Layout re-renders with lang="mr"                     │
│     - Dashboard page re-renders with Marathi translations  │
│     - DashboardTable re-renders with Marathi columns       │
│                                                             │
│     tDashboard('title') → "डॅशबोर्ड"                        │
│     tCommon('status.active') → "सक्रिय"                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  7. NEW HTML SENT TO BROWSER IN MARATHI                     │
│                                                             │
│     <html lang="mr">                                       │
│       <h1>डॅशबोर्ड</h1>                                     │
│       <th>मार्ग</th>                                        │
│       <th>स्थिती</th>                                       │
│       <span>सक्रिय</span>                                   │
│     </html>                                                 │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  8. REACT UPDATES DOM (Smooth Transition)                   │
│                                                             │
│     - No full page reload ✅                                │
│     - Maintains scroll position ✅                          │
│     - Preserves form state ✅                               │
│     - All text updates to Marathi ✅                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Developer Guidelines

### 🎯 When to Use Server Components

**Use Server Components for:**
- ✅ Static content that needs translation
- ✅ Data fetching from database/API
- ✅ Table headers, labels, descriptions
- ✅ Page layouts
- ✅ Any component that doesn't need interactivity

**Example:**
```typescript
// ✅ GOOD: Server Component
export async function ProductList() {
  const t = await getTranslations('products');
  const products = await db.products.findMany();
  
  return (
    <div>
      <h2>{t('title')}</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} - {t('price')}: ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### ⚡ When to Use Client Components

**Use Client Components for:**
- ✅ Interactive elements (buttons with onClick)
- ✅ Forms with state
- ✅ Dropdowns, modals, dialogs
- ✅ Components using React hooks
- ✅ Browser APIs (localStorage, window, etc.)

**Example:**
```typescript
// ✅ GOOD: Client Component
'use client';

export function SearchBox({ placeholder }: { placeholder: string }) {
  const [query, setQuery] = useState('');
  
  return (
    <input
      type="search"
      placeholder={placeholder} // Pre-translated from parent
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

### 📝 Component Best Practices

#### ✅ DO: Pass Translations as Props (Preferred)

```typescript
// Parent: Server Component
export async function ParentComponent() {
  const t = await getTranslations('common');
  
  return (
    <ChildComponent 
      submitLabel={t('buttons.submit')}     // ← Translate here
      cancelLabel={t('buttons.cancel')}     // ← Translate here
      errorMessage={t('errors.generic')}    // ← Translate here
    />
  );
}

// Child: Client Component
'use client';

interface ChildProps {
  submitLabel: string;
  cancelLabel: string;
  errorMessage: string;
}

export function ChildComponent({ submitLabel, cancelLabel, errorMessage }: ChildProps) {
  return (
    <div>
      <button>{submitLabel}</button>
      <button>{cancelLabel}</button>
    </div>
  );
}
```

#### ⚠️ ALTERNATIVE: Use useTranslations in Client Component

```typescript
// Parent: Server Component
export async function ParentComponent() {
  const messages = await getMessages();
  
  return (
    <NextIntlClientProvider messages={messages}>
      <ChildComponent />
    </NextIntlClientProvider>
  );
}

// Child: Client Component
'use client';

export function ChildComponent() {
  const t = useTranslations('common');
  
  return (
    <div>
      <button>{t('buttons.submit')}</button>
      <button>{t('buttons.cancel')}</button>
    </div>
  );
}
```

#### ❌ DON'T: Use getTranslations in Client Component

```typescript
// ❌ WRONG: Cannot use getTranslations() in client component
'use client';

export async function ChildComponent() {
  const t = await getTranslations('common'); // ❌ ERROR!
  // Client components cannot be async
  return <button>{t('buttons.submit')}</button>;
}
```

---

## Adding New Locales

### Step 1: Update Configuration

```typescript
// src/i18n/config.ts
export const locales = ['en', 'hi', 'mr', 'pa'] as const; // ← Add 'pa' (Punjabi)
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
  pa: 'ਪੰਜਾਬੀ', // ← Add Punjabi display name
};
```

### Step 2: Create Translation Files

```bash
# Create directory structure
mkdir src/i18n/locales/pa
touch src/i18n/locales/pa/common.json
touch src/i18n/locales/pa/dashboard.json
```

### Step 3: Add Translations

```json
// src/i18n/locales/pa/common.json
{
  "buttons": {
    "save": "ਸੁਰੱਖਿਅਤ ਕਰੋ",
    "cancel": "ਰੱਦ ਕਰੋ",
    "delete": "ਮਿਟਾਓ",
    "edit": "ਸੰਪਾਦਿਤ ਕਰੋ"
  },
  "status": {
    "active": "ਸਰਗਰਮ",
    "delayed": "ਦੇਰੀ ਨਾਲ",
    "completed": "ਪੂਰਾ ਹੋਇਆ"
  }
}
```

```json
// src/i18n/locales/pa/dashboard.json
{
  "title": "ਡੈਸ਼ਬੋਰਡ",
  "subtitle": "ਸੰਚਾਲਨ ਦੀ ਸਮੀਖਿਆ",
  "stats": {
    "totalRoutes": "ਕੁੱਲ ਰੂਟ",
    "activeVehicles": "ਸਰਗਰਮ ਵਾਹਨ"
  }
}
```

### Step 4: Add Font Support (if needed)

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;600;700&display=swap');

/* Add font class */
.font-gurmukhi {
  font-family: 'Noto Sans Gurmukhi', sans-serif;
}
```

```typescript
// src/app/[locale]/layout.tsx
import { Noto_Sans_Gurmukhi } from 'next/font/google';

const gurmukhiFont = Noto_Sans_Gurmukhi({
  subsets: ['gurmukhi'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-gurmukhi',
});

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  
  return (
    <html lang={locale}>
      <body className={locale === 'pa' ? gurmukhiFont.className : ''}>
        {children}
      </body>
    </html>
  );
}
```

### Step 5: Test New Locale

```bash
# Visit URLs
http://localhost:3000/pa/dashboard  # Punjabi
```

```javascript
// Test in browser console
document.cookie = 'NEXT_LOCALE=pa; path=/; max-age=31536000';
location.reload();
```

---

## Component Best Practices

### ✅ Checklist When Creating New Components

#### For Server Components:
- [ ] **NO** `'use client'` directive at top
- [ ] Use `async function` declaration
- [ ] Use `await getTranslations('namespace')`
- [ ] Translate all static text
- [ ] Pass pre-translated text to child client components as props
- [ ] Keep component simple (no hooks, no event handlers)

#### For Client Components:
- [ ] Add `'use client'` directive at top of file
- [ ] Receive translations as props from parent (preferred)
- [ ] OR use `useTranslations()` if wrapped in `NextIntlClientProvider`
- [ ] **NEVER** use `await getTranslations()` (will error)
- [ ] Only add interactivity (onClick, onChange, useState, etc.)
- [ ] Type props with TypeScript interface

### 📋 Common Patterns

#### Pattern 1: Static Page with Translations

```typescript
// src/app/[locale]/about/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function AboutPage() {
  const t = await getTranslations('about');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <ul>
        <li>{t('feature1')}</li>
        <li>{t('feature2')}</li>
      </ul>
    </div>
  );
}
```

#### Pattern 2: Server Component with Client Component Child

```typescript
// src/components/ContactForm/ContactFormWrapper.tsx (Server)
import { getTranslations } from 'next-intl/server';
import { ContactForm } from './ContactForm';

export async function ContactFormWrapper() {
  const t = await getTranslations('contact');
  
  return (
    <ContactForm
      nameLabel={t('form.name')}
      emailLabel={t('form.email')}
      messageLabel={t('form.message')}
      submitLabel={t('form.submit')}
      successMessage={t('form.success')}
      errorMessage={t('form.error')}
    />
  );
}

// src/components/ContactForm/ContactForm.tsx (Client)
'use client';

interface ContactFormProps {
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  submitLabel: string;
  successMessage: string;
  errorMessage: string;
}

export function ContactForm(props: ContactFormProps) {
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      // Handle submission
    });
  };
  
  return (
    <form action={handleSubmit}>
      <label>
        {props.nameLabel}
        <input name="name" required />
      </label>
      <button type="submit" disabled={isPending}>
        {props.submitLabel}
      </button>
    </form>
  );
}
```

#### Pattern 3: List with Translated Items

```typescript
// src/components/ProductList.tsx (Server)
import { getTranslations } from 'next-intl/server';
import { ProductCard } from './ProductCard';

export async function ProductList() {
  const t = await getTranslations('products');
  const products = await fetchProducts();
  
  return (
    <div>
      <h2>{t('title')}</h2>
      <div className="grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            addToCartLabel={t('addToCart')}
            viewDetailsLabel={t('viewDetails')}
          />
        ))}
      </div>
    </div>
  );
}
```

#### Pattern 4: Conditional Translations

```typescript
// src/components/StatusBadge.tsx (Server)
import { getTranslations } from 'next-intl/server';

export async function StatusBadge({ status }: { status: 'active' | 'inactive' | 'pending' }) {
  const t = await getTranslations('common');
  
  const statusConfig = {
    active: { text: t('status.active'), color: 'green' },
    inactive: { text: t('status.inactive'), color: 'red' },
    pending: { text: t('status.pending'), color: 'yellow' },
  };
  
  const config = statusConfig[status];
  
  return (
    <span className={`badge badge-${config.color}`}>
      {config.text}
    </span>
  );
}
```

### 🚨 Common Mistakes to Avoid

#### ❌ Mistake 1: Using getTranslations in Client Component

```typescript
// ❌ WRONG
'use client';

export async function MyComponent() {
  const t = await getTranslations('common'); // ERROR: Client components can't be async
  return <div>{t('title')}</div>;
}

// ✅ CORRECT: Receive as prop
'use client';

export function MyComponent({ title }: { title: string }) {
  return <div>{title}</div>;
}
```

#### ❌ Mistake 2: Not Marking Client Component

```typescript
// ❌ WRONG: No 'use client' directive
export function InteractiveButton() {
  const [count, setCount] = useState(0); // ERROR: Can't use useState in Server Component
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ CORRECT: Add 'use client'
'use client';

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### ❌ Mistake 3: Not Using Async for Server Component with Translations

```typescript
// ❌ WRONG: Not async
export function MyComponent() {
  const t = getTranslations('common'); // ERROR: Must await
  return <div>{t('title')}</div>;
}

// ✅ CORRECT: Make async
export async function MyComponent() {
  const t = await getTranslations('common');
  return <div>{t('title')}</div>;
}
```

#### ❌ Mistake 4: Hard-coded Strings

```typescript
// ❌ WRONG: Hard-coded English text
export async function MyComponent() {
  return (
    <div>
      <h1>Dashboard</h1>
      <button>Save</button>
    </div>
  );
}

// ✅ CORRECT: Use translations
export async function MyComponent() {
  const t = await getTranslations('dashboard');
  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('buttons.save')}</button>
    </div>
  );
}
```

---

## Troubleshooting

### Issue: Translations Not Showing

**Symptoms:**
- Seeing translation keys instead of text: `dashboard.title`
- Empty strings where translations should be

**Solutions:**

1. **Check translation file exists:**
```bash
ls src/i18n/locales/hi/dashboard.json
```

2. **Verify JSON structure:**
```json
{
  "dashboard": {  // ❌ WRONG: Extra nesting
    "title": "डैशबोर्ड"
  }
}

// ✅ CORRECT:
{
  "title": "डैशबोर्ड"
}
```

3. **Check translation key matches:**
```typescript
// Translation file: dashboard.json
{ "pageTitle": "डैशबोर्ड" }

// Code
t('title') // ❌ WRONG key
t('pageTitle') // ✅ CORRECT key
```

4. **Verify namespace:**
```typescript
const t = await getTranslations('dashboard'); // Namespace must match
t('title') // Looks in dashboard.json
```

### Issue: "Cannot use getTranslations"

**Error Message:**
```
Error: You're importing a component that needs getTranslations. 
It only works in a Server Component but one of its parents is marked with "use client"
```

**Solution:**
```typescript
// ❌ WRONG: Client component with getTranslations
'use client';

export async function MyComponent() {
  const t = await getTranslations('common');
  return <div>{t('title')}</div>;
}

// ✅ CORRECT Option 1: Remove 'use client'
export async function MyComponent() {
  const t = await getTranslations('common');
  return <div>{t('title')}</div>;
}

// ✅ CORRECT Option 2: Use useTranslations
'use client';

export function MyComponent() {
  const t = useTranslations('common');
  return <div>{t('title')}</div>;
}
```

### Issue: Cookie Not Persisting

**Symptoms:**
- Language resets on page reload
- Always defaults to browser language

**Solutions:**

1. **Check cookie is being set:**
```javascript
// Browser console
document.cookie // Should show: NEXT_LOCALE=hi
```

2. **Verify cookie attributes:**
```typescript
document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
// Must have: path=/
// Should have: max-age (not expires)
```

3. **Check middleware config:**
```typescript
// src/middleware.ts
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
  // Must match your routes
};
```

### Issue: Redirects Not Working

**Symptoms:**
- Accessing `/dashboard` doesn't redirect to `/hi/dashboard`
- 404 errors on locale paths

**Solutions:**

1. **Verify folder structure:**
```
src/app/
├── [locale]/          ← Must have this folder
│   ├── layout.tsx
│   ├── page.tsx
│   └── dashboard/
│       └── page.tsx
└── middleware.ts      ← Must be at app level
```

2. **Check middleware matcher:**
```typescript
export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'  // Matches all except excluded
  ]
};
```

3. **Test middleware manually:**
```bash
curl -I http://localhost:3000/dashboard
# Should return: 307 Temporary Redirect
# Location: /hi/dashboard (if cookie set to hi)
```

### Issue: Font Not Showing for Hindi/Marathi

**Symptoms:**
- Devanagari characters show as boxes (□□□)
- Text looks wrong

**Solutions:**

1. **Check font import:**
```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
```

2. **Apply font class:**
```typescript
// src/app/[locale]/layout.tsx
const devanagariFont = Noto_Sans_Devanagari({ ... });

<body className={locale === 'hi' || locale === 'mr' ? devanagariFont.className : ''}>
```

3. **Fallback fonts:**
```css
body {
  font-family: 'Noto Sans Devanagari', 'Inter', system-ui, sans-serif;
}
```

---

## Summary

### Key Points to Remember

1. **Middleware handles routing**
   - Detects locale from URL > Cookie > Browser
   - Redirects to correct locale path
   - Sets/updates cookie

2. **Server Components for translations**
   - Use `await getTranslations()` in Server Components
   - Translate static content on server
   - Better performance and SEO

3. **Client Components for interactivity**
   - Add `'use client'` directive
   - Receive translations as props (preferred)
   - OR use `useTranslations()` hook

4. **Translation file structure**
   - Organize by namespace (common, dashboard, etc.)
   - One file per namespace per locale
   - Use nested objects for organization

5. **When adding new locales**
   - Update config
   - Create translation files
   - Add font support if needed
   - Test all routes

6. **When creating new components**
   - Decide: Server or Client?
   - Use appropriate translation method
   - Type props with TypeScript
   - Test in all languages

---

## Quick Reference

### File Locations

```
src/
├── middleware.ts                    # Locale routing
├── i18n/
│   ├── config.ts                   # Locale configuration
│   ├── request.ts                  # Translation loading
│   └── locales/
│       ├── en/
│       │   ├── common.json
│       │   └── dashboard.json
│       ├── hi/
│       │   ├── common.json
│       │   └── dashboard.json
│       └── mr/
│           ├── common.json
│           └── dashboard.json
└── app/
    └── [locale]/                   # Dynamic locale segment
        ├── layout.tsx              # Root layout
        ├── page.tsx                # Home page
        └── dashboard/
            ├── page.tsx            # Dashboard page
            └── actions.ts          # Server actions
```

### Import Statements

```typescript
// Server Components
import { getTranslations } from 'next-intl/server';
import { getMessages } from 'next-intl/server';
import { getLocale } from 'next-intl/server';

// Client Components
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';

// Types
import type { Locale } from '@/i18n/config';
```

### URL Patterns

```
http://localhost:3000/dashboard         → English (default)
http://localhost:3000/hi/dashboard      → Hindi
http://localhost:3000/mr/dashboard      → Marathi
http://localhost:3000/pa/dashboard      → Punjabi (if added)
```

### Testing Commands

```bash
# Start dev server
npm run dev

# Test locale in browser console
document.cookie = 'NEXT_LOCALE=hi; path=/; max-age=31536000';
location.reload();

# Check middleware
curl -I http://localhost:3000/dashboard

# View cookie
document.cookie
```

---

**Last Updated:** November 30, 2025
**Next.js Version:** 16.0.3
**next-intl Version:** Latest
