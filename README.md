# NTIS UI

Next.js application

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ntis-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run dev:turbo` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run build:production` - Build for production with Turbopack
- `npm start` - Start production standalone server
- `npm run start:next` - Start production server using `next start` (non-standalone)
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check with TypeScript
- `npm run test` - Run tests

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── feature-flags/ # Feature flags API
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── common/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Table.tsx
│   ├── layout/           # Layout components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── MainLayout.tsx
│   └── modules/          # Feature-specific modules
│       ├── bajar-parwana/        # Permit application module
│       ├── birth-death/          # Certificate application module
│       ├── dashboard/            # Dashboard service cards
│       ├── property-tax/         # Property tax module
│       └── water-tax/            # Water tax module
├── config/               # Application configuration
│   └── app.config.ts
├── features/             # Feature implementations
├── hooks/                # Custom React hooks
│   ├── useAsync.ts
│   └── useLoading.ts
├── lib/                  # Utility functions and helpers
│   ├── api/             # API client utilities
│   ├── constants/       # Constants and routes
│   │   └── routes.ts
│   └── utils/           # Helper functions
│       ├── cn.ts
│       └── format.ts
├── services/             # API services
│   └── api.service.ts
├── styles/               # Additional styles
└── types/                # TypeScript type definitions
    ├── common.types.ts
    └── service.types.ts
```

See [STRUCTURE.md](./STRUCTURE.md) for detailed project structure.

## Environment Variables

The project supports multiple environment configurations:

- `.env` - Shared defaults (committed)
- `.env.development` - Development configuration
- `.env.staging` - Staging configuration (gitignored)
- `.env.production` - Production configuration (gitignored)
- `.env.local` - Local overrides (gitignored)

## Development

### Code Style

This project uses Prettier for code formatting and ESLint for linting. Configuration files:

- `.prettierrc.json` - Prettier configuration
- `eslint.config.mjs` - ESLint configuration

### TypeScript

Path aliases are configured in `tsconfig.json`:

```typescript
import { Button } from '@/components/common';
```

## Building for Production

### Development Build
```bash
npm run build
npm start
```

### Production Build (Turbopack)
```bash
npm run build:production
npm start
```

The project uses **standalone output mode** for production deployments. This creates a self-contained build in `.next/standalone/` that includes:
- The Node.js server (`server.js`)
- All required dependencies
- Locale files for i18n (via `outputFileTracingIncludes` in next.config.ts)

### Running the Standalone Server

```bash
# Using npm (recommended)
npm start

# Or directly
node .next/standalone/server.js
```

The server runs on port 3000 by default. Configure via `PORT` environment variable.

## Internationalization (i18n)

The project uses **next-intl** for internationalization with support for:
- English (en)
- Hindi (hi)
- Marathi (mr)

Locale files are located in `src/i18n/locales/` and are automatically included in standalone builds.

## License

[Add your license here]
