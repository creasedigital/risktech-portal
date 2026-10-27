# Phase 0 — Tier 2 Issue Spec
## Project Foundation & Tooling

**Issued by:** Tier 1 — Principal Software Architect & GRC Security Lead  
**Issued to:** Tier 2 — Builder Agent  
**Date:** 2026-10-27  
**Phase:** 0 of 11  
**Status:** 🔵 ACTIVE — awaiting Tier 2 completion  

---

## Context

You are Tier 2: Builder Agent for the **RiskTech & Advisory Executive Onboarding & Vetting Portal**. This is a GRC (Governance, Risk & Compliance) platform. You must follow every instruction below exactly.

**MANDATORY RULES — read before touching any file:**

1. **ZERO real personal or corporate data.** Every name, email, company, phone number, or identifier you write must be synthetic. Use `@faker-js/faker` with `faker.seed(42)` in seed/test files. In non-seed files use obviously synthetic placeholders like `alice.okafor@example.com`.
2. **TypeScript strict mode only.** `strict: true` and `noUncheckedIndexedAccess: true` must be in `tsconfig.json`. Every file you create must pass `npx tsc --noEmit`.
3. **Do not implement feature logic in this phase.** Scaffold structure, types, configs, and stubs. Actual implementations come in Phases 1–9.
4. **Reference documents:** All architectural decisions are in:
   - `/docs/agent-ops/01-ARCHITECTURE-SPEC.md` (domain model, tech stack, directory structure)
   - `/docs/agent-ops/02-PHASE-BACKLOG.md` (acceptance criteria for this phase: AC-0.1 through AC-0.12)
5. **Report back** with: (a) a file manifest of everything created/modified, (b) commands you ran and their output, (c) any deviations from spec and why, (d) any open questions for Tier 1.

---

## Your Task

Bootstrap the repository at `/Users/ohjay/Desktop/code_/risktech` with the full project foundation. The workspace is currently empty. Work through each acceptance criterion below in order.

---

## AC-0.1 — Next.js Project

1. From `/Users/ohjay/Desktop/code_/risktech`, initialise a Next.js project:
   ```bash
   npx create-next-app@latest . \
     --typescript \
     --tailwind \
     --eslint \
     --app \
     --src-dir \
     --import-alias "@/*" \
     --no-turbopack \
     --yes
   ```
2. Edit `tsconfig.json`:
   - Ensure `"strict": true` is present under `compilerOptions`
   - Add `"noUncheckedIndexedAccess": true` under `compilerOptions`
3. Edit `tailwind.config.ts`:
   - Set `darkMode: 'class'`
   - Ensure `content` covers `./src/**/*.{ts,tsx}`
4. Create `next.config.ts` (replace any auto-generated `next.config.js`/`.mjs`):

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // NOTE: Full CSP with nonce is wired in Phase 1 middleware.
          // This default-deny CSP is a placeholder.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'", // tightened to nonce in Phase 1
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

---

## AC-0.2 — Prisma

1. Install Prisma:
   ```bash
   npm install prisma @prisma/client
   npx prisma init --datasource-provider sqlite
   ```

2. Replace `prisma/schema.prisma` with the **exact** schema from §6 of `01-ARCHITECTURE-SPEC.md`. Copy it verbatim — every model, enum, field, relation, index, and `@default` must match.

3. Run:
   ```bash
   npx prisma validate
   npx prisma db push
   ```
   Both must exit 0.

4. Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

faker.seed(42)

const prisma = new PrismaClient()

async function main() {
  // TODO: Phase 10 will populate full synthetic dataset.
  // Placeholder: confirm seed runs without error.
  console.log('Seed placeholder — full dataset added in Phase 10.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

5. In `package.json`, add (merge into existing):
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

6. Install seed runtime deps:
   ```bash
   npm install --save-dev tsx @faker-js/faker
   ```

---

## AC-0.3 — Authentication Package

1. Install:
   ```bash
   npm install next-auth@beta
   ```

2. Create `src/lib/auth/config.ts`:
```typescript
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

// TODO: Phase 1 will implement full Credentials provider with bcrypt
// and database user lookup. This is a typed stub only.
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async authorize(_credentials) {
        // TODO: Phase 1 — validate credentials against DB
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    // TODO: Phase 1 — inject role into JWT
    async jwt({ token }) {
      return token
    },
    async session({ session }) {
      return session
    },
  },
}
```

3. Create `src/lib/auth/index.ts`:
```typescript
import NextAuth from 'next-auth'
import { authConfig } from './config'

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
```

4. Create `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

---

## AC-0.4 — State Management

1. Install:
   ```bash
   npm install zustand idb-keyval @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister
   ```

2. Create `src/stores/useThemeStore.ts`:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme })
        // TODO: Phase 1 — sync document.documentElement.classList
      },
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        get().setTheme(next)
      },
    }),
    {
      name: 'risktech-theme',
    }
  )
)
```

3. Create `src/stores/useOnboardingDraftStore.ts`:
```typescript
import { create } from 'zustand'
// TODO: Phase 4 — wire idb-keyval persistence for offline draft storage

export interface OnboardingDraftState {
  currentStep: number
  completedSteps: number[]
  // Step field data — typed per step in Phase 4
  stepData: Record<number, unknown>
  idempotencyKeys: Record<number, string>

  setCurrentStep: (step: number) => void
  markStepComplete: (step: number) => void
  setStepData: (step: number, data: unknown) => void
  resetDraft: () => void
}

const initialState = {
  currentStep: 1,
  completedSteps: [] as number[],
  stepData: {} as Record<number, unknown>,
  idempotencyKeys: {} as Record<number, string>,
}

export const useOnboardingDraftStore = create<OnboardingDraftState>()((set) => ({
  ...initialState,
  setCurrentStep: (step) => set({ currentStep: step }),
  markStepComplete: (step) =>
    set((s) => ({ completedSteps: [...new Set([...s.completedSteps, step])] })),
  setStepData: (step, data) =>
    set((s) => ({ stepData: { ...s.stepData, [step]: data } })),
  resetDraft: () => set(initialState),
}))
```

4. Create `src/stores/useReviewerFilterStore.ts`:
```typescript
import { create } from 'zustand'
import type { VettingStatus } from '@/types/fsm'

interface ReviewerFilterState {
  searchTerm: string
  statusFilter: VettingStatus | 'ALL'
  sortColumn: 'name' | 'submittedAt' | 'status'
  sortDirection: 'asc' | 'desc'

  setSearchTerm: (term: string) => void
  setStatusFilter: (status: VettingStatus | 'ALL') => void
  setSortColumn: (col: ReviewerFilterState['sortColumn']) => void
  setSortDirection: (dir: 'asc' | 'desc') => void
  resetFilters: () => void
}

const initialFilters = {
  searchTerm: '',
  statusFilter: 'ALL' as const,
  sortColumn: 'submittedAt' as const,
  sortDirection: 'desc' as const,
}

export const useReviewerFilterStore = create<ReviewerFilterState>()((set) => ({
  ...initialFilters,
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSortColumn: (sortColumn) => set({ sortColumn }),
  setSortDirection: (sortDirection) => set({ sortDirection }),
  resetFilters: () => set(initialFilters),
}))
```

5. Create `src/app/providers.tsx`:
```typescript
'use client'

import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { useState, type ReactNode } from 'react'

// TODO: Phase 8 — swap to IndexedDB persister for full offline support
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        networkMode: 'offlineFirst',
      },
      mutations: {
        networkMode: 'offlineFirst',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient())

  const persister = createSyncStoragePersister({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  })

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
```

---

## AC-0.5 — Virtualisation

1. Install:
   ```bash
   npm install react-window react-virtualized-auto-sizer
   npm install --save-dev @types/react-window @types/react-virtualized-auto-sizer
   ```

2. Create `src/components/shared/VirtualizedList.tsx`:
```typescript
'use client'

import { FixedSizeList, type ListChildComponentProps } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

export interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  renderRow: (props: ListChildComponentProps<T[]>) => React.ReactElement
  className?: string
}

// TODO: Phase 6 (Queue) and Phase 9 (Audit Log) will use this component.
export function VirtualizedList<T>({
  items,
  itemHeight,
  renderRow,
  className,
}: VirtualizedListProps<T>) {
  return (
    <div className={className ?? 'h-full w-full'}>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <FixedSizeList<T[]>
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
            itemData={items}
          >
            {renderRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  )
}
```

---

## AC-0.6 — Security Packages

Install all security-related packages:
```bash
npm install bcryptjs file-type web-push otplib qrcode lru-cache
npm install --save-dev @types/bcryptjs @types/web-push @types/qrcode
```

> **Note on `file-type`:** This is an ESM-only package. Add the following to `next.config.ts` inside `nextConfig`:
```typescript
  experimental: {
    serverComponentsExternalPackages: ['file-type'],
  },
```

---

## AC-0.7 — Validation Schemas

1. Install:
   ```bash
   npm install zod
   ```

2. Create `src/lib/validation/executive.schema.ts`:
```typescript
import { z } from 'zod'

// Step 1 — Consent
export const step1ConsentSchema = z.object({
  dataProcessConsent: z.literal(true, {
    errorMap: () => ({ message: 'You must accept data processing to proceed.' }),
  }),
  marketingConsent: z.boolean(),
  consentVersion: z.string().min(1),
})

// Step 2 — Professional Profile
export const step2ProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  nationality: z.string().min(2, 'Please enter your nationality'),
  currentTitle: z.string().min(2, 'Job title must be at least 2 characters'),
  currentOrg: z.string().min(2, 'Organisation name must be at least 2 characters'),
})

// Step 3 — Board Experience
export const boardPositionSchema = z.object({
  organisation: z.string().min(2),
  role: z.string().min(2),
  startYear: z.number().int().min(1950).max(new Date().getFullYear()),
  endYear: z.number().int().min(1950).max(new Date().getFullYear()).optional(),
  isCurrentRole: z.boolean(),
})

export const step3BoardExperienceSchema = z.object({
  boardPositions: z.array(boardPositionSchema).min(1, 'At least one board position is required'),
})

// Step 4 — Sector & Qualifications
export const SECTORS = [
  'Finance',
  'Energy',
  'Technology',
  'Healthcare',
  'Government',
  'Legal',
  'Other',
] as const

export const qualificationSchema = z.object({
  institution: z.string().min(2),
  credential: z.string().min(2),
  year: z.number().int().min(1950).max(new Date().getFullYear()),
})

export const step4SectorSchema = z.object({
  sectors: z.array(z.enum(SECTORS)).min(1, 'Select at least one sector'),
  qualifications: z.array(qualificationSchema),
})

// Step 5 — Referees
export const refereeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  relationship: z.string().min(2),
  organisation: z.string().min(2),
})

export const step5RefereesSchema = z.object({
  referees: z.array(refereeSchema).min(2, 'Two referees are required'),
})

// Step 6 — Documents (validated on upload — see document.schema.ts)
export const step6ReviewSchema = z.object({
  cvUploaded: z.literal(true, { errorMap: () => ({ message: 'CV upload is required' }) }),
  idUploaded: z.literal(true, { errorMap: () => ({ message: 'ID document upload is required' }) }),
})

export type Step1Consent = z.infer<typeof step1ConsentSchema>
export type Step2Profile = z.infer<typeof step2ProfileSchema>
export type Step3BoardExperience = z.infer<typeof step3BoardExperienceSchema>
export type Step4Sector = z.infer<typeof step4SectorSchema>
export type Step5Referees = z.infer<typeof step5RefereesSchema>
export type Step6Review = z.infer<typeof step6ReviewSchema>
```

3. Create `src/lib/validation/document.schema.ts`:
```typescript
import { z } from 'zod'

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
] as const

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'] as const

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export const documentUploadSchema = z.object({
  documentType: z.enum(['CV', 'IDENTIFICATION', 'CERTIFICATION', 'OTHER']),
  executiveId: z.string().cuid(),
})

export type DocumentUpload = z.infer<typeof documentUploadSchema>
```

4. Create `src/lib/validation/vetting.schema.ts`:
```typescript
import { z } from 'zod'
import type { VettingStatus } from '@/types/fsm'

export const VETTING_ACTIONS = [
  'START_REVIEW',       // SUBMITTED → UNDER_REVIEW
  'REQUEST_MORE_INFO',  // UNDER_REVIEW → MORE_INFO_REQUIRED
  'VERIFY',             // UNDER_REVIEW → VERIFIED
  'REJECT',             // UNDER_REVIEW → REJECTED
  'RESUBMIT',           // MORE_INFO_REQUIRED → SUBMITTED (executive action)
] as const

export type VettingAction = (typeof VETTING_ACTIONS)[number]

export const vettingTransitionSchema = z.object({
  action: z.enum(VETTING_ACTIONS),
  note: z.string().optional(),
})

export type VettingTransition = z.infer<typeof vettingTransitionSchema>

// Map of actions that require a non-empty reviewer note
export const NOTE_REQUIRED_ACTIONS: VettingAction[] = ['REQUEST_MORE_INFO', 'REJECT']

// Valid FSM transitions: [currentStatus, action] → nextStatus
export const FSM_TRANSITION_MAP: Record<string, VettingStatus> = {
  'SUBMITTED:START_REVIEW': 'UNDER_REVIEW',
  'UNDER_REVIEW:REQUEST_MORE_INFO': 'MORE_INFO_REQUIRED',
  'UNDER_REVIEW:VERIFY': 'VERIFIED',
  'UNDER_REVIEW:REJECT': 'REJECTED',
  'MORE_INFO_REQUIRED:RESUBMIT': 'SUBMITTED',
}
```

---

## AC-0.8 — Testing Setup

1. Install:
   ```bash
   npm install --save-dev vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
   ```

2. Create `vitest.config.ts` at project root:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

   Also install the Vite React plugin:
   ```bash
   npm install --save-dev @vitejs/plugin-react
   ```

3. Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

4. Create `src/test/smoke.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'

describe('Smoke test', () => {
  it('test runner is operational', () => {
    expect(1 + 1).toBe(2)
  })

  it('TypeScript strict mode enforced in test env', () => {
    const arr: string[] = ['a', 'b', 'c']
    // noUncheckedIndexedAccess means arr[0] is string | undefined
    const first: string | undefined = arr[0]
    expect(first).toBe('a')
  })
})
```

5. Add test scripts to `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## AC-0.9 — Storybook

1. Install Storybook:
   ```bash
   npx storybook@latest init --yes
   ```
   When prompted, choose Next.js framework.

2. Verify `.storybook/main.ts` uses `@storybook/nextjs` framework.

3. Update `.storybook/preview.ts` to import Tailwind and add dark mode decorator:
```typescript
import type { Preview } from '@storybook/nextjs'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals['backgrounds']?.value === '#0f172a'
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return <Story />
    },
  ],
}

export default preview
```

4. Create a placeholder Button component `src/components/ui/Button.tsx`:
```typescript
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

5. Create `src/lib/utils.ts` (required for `cn` helper):
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

   Install class utilities:
   ```bash
   npm install clsx tailwind-merge
   ```

6. Create `src/components/ui/Button.stories.tsx`:
```typescript
import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Continue',
    variant: 'primary',
  },
}

export const Dark: Story = {
  args: {
    children: 'Continue',
    variant: 'primary',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const Secondary: Story = {
  args: { children: 'Cancel', variant: 'secondary' },
}

export const Danger: Story = {
  args: { children: 'Reject', variant: 'danger' },
}

export const Loading: Story = {
  args: { children: 'Saving…', isLoading: true },
}

export const Disabled: Story = {
  args: { children: 'Submit', disabled: true },
}
```

---

## AC-0.10 — Directory Skeleton & Types

1. Create the full directory tree from §5 of the Architecture Spec. Directories that have no files yet should contain a `.gitkeep`:
   ```
   src/app/(auth)/
   src/app/(portal)/executive/onboarding/
   src/app/(portal)/executive/privacy-center/
   src/app/(portal)/consultant/queue/
   src/app/(portal)/admin/audit-log/
   src/app/(portal)/admin/users/
   src/app/api/executive/onboarding/
   src/app/api/executive/documents/
   src/app/api/consultant/vetting/
   src/app/api/admin/audit/
   src/app/api/admin/export/
   src/app/api/push/
   src/components/onboarding/
   src/components/vetting/
   src/components/audit/
   src/components/shared/
   src/lib/auth/
   src/lib/dal/
   src/lib/encryption/
   src/lib/audit/
   src/lib/fsm/
   src/lib/push/
   src/hooks/
   ```

2. Create `src/types/roles.ts`:
```typescript
export const ROLES = ['EXECUTIVE', 'CONSULTANT', 'ADMINISTRATOR'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  EXECUTIVE: 'Executive',
  CONSULTANT: 'Consultant',
  ADMINISTRATOR: 'Administrator',
}
```

3. Create `src/types/fsm.ts`:
```typescript
export const VETTING_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'MORE_INFO_REQUIRED',
  'VERIFIED',
  'REJECTED',
] as const

export type VettingStatus = (typeof VETTING_STATUSES)[number]

export const VETTING_STATUS_LABELS: Record<VettingStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  MORE_INFO_REQUIRED: 'More Info Required',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
}

export const VETTING_STATUS_COLORS: Record<VettingStatus, string> = {
  DRAFT: 'gray',
  SUBMITTED: 'blue',
  UNDER_REVIEW: 'yellow',
  MORE_INFO_REQUIRED: 'orange',
  VERIFIED: 'green',
  REJECTED: 'red',
}
```

4. Create `src/types/api.ts`:
```typescript
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNextPage: boolean
}

export interface ApiError {
  error: string
  code?: string
  details?: unknown
}
```

5. Create stub files (with `// TODO: Phase N` comment) for:
   - `src/lib/dal/index.ts` → TODO Phase 1
   - `src/lib/encryption/index.ts` → TODO Phase 2
   - `src/lib/audit/index.ts` → TODO Phase 3
   - `src/lib/audit/verify.ts` → TODO Phase 3
   - `src/lib/fsm/vettingFsm.ts` → TODO Phase 6
   - `src/lib/push/notify.ts` → TODO Phase 8
   - `src/lib/db.ts` → Prisma singleton (implement now):

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

6. Create `src/hooks/useOfflineStatus.ts` stub:
```typescript
// TODO: Phase 8 — full implementation
'use client'
import { useState, useEffect } from 'react'

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOffline(!navigator.onLine)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOffline }
}
```

7. Create `src/hooks/usePushSubscription.ts` stub:
```typescript
// TODO: Phase 8 — full VAPID subscription implementation
'use client'

export function usePushSubscription() {
  // Stub: returns null until Phase 8
  return { subscription: null, subscribe: async () => {}, unsubscribe: async () => {} }
}
```

8. Create `src/hooks/useIdempotentMutation.ts` stub:
```typescript
// TODO: Phase 4 / Phase 8 — X-Idempotency-Key mutation wrapper
'use client'

export function useIdempotentMutation() {
  // Stub: Phase 4 will implement with UUID keying
  return {}
}
```

---

## AC-0.11 — Environment Files

1. Create `.env.example` at project root:
```
# ============================================================
# RiskTech & Advisory — Executive Onboarding Portal
# Environment Variables
# Copy this file to .env.local and fill in the values.
# NEVER commit .env.local to version control.
# ============================================================

# Database
# For local dev: SQLite (default, zero-config)
# For production: PostgreSQL connection string
DATABASE_URL="file:./dev.db"

# NextAuth
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# PII Encryption Key (AES-256-GCM)
# Generate with: openssl rand -hex 32
# CRITICAL: This key encrypts all sensitive PII fields.
# Rotate requires re-encryption of all data — document in ADR.
APP_ENCRYPTION_KEY=""

# Web Push / VAPID Keys
# Generate with: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT="mailto:admin@example.com"

# Feature Flags
# Set to "true" in development to enable the synthetic persona switcher
ENABLE_PERSONA_SWITCHER="false"

# Test-only encryption key (used in Vitest — DO NOT use in production)
TEST_ENCRYPTION_KEY=""
```

2. Verify `.gitignore` (from create-next-app) includes:
   - `.env.local`
   - `.env.*.local`
   - Add manually if missing: `/uploads/`, `*.db`, `*.db-journal`, `*.db-shm`, `*.db-wal`

---

## AC-0.12 — Verify Documentation & AI_USAGE.md

1. Confirm these files exist (already authored by Tier 1 — do NOT modify):
   - `docs/agent-ops/01-ARCHITECTURE-SPEC.md`
   - `docs/agent-ops/02-PHASE-BACKLOG.md`
   - `AI_USAGE.md`

2. Add a `docs/adr/` directory with a placeholder:
   Create `docs/adr/README.md`:
```markdown
# Architecture Decision Records

ADRs are numbered sequentially: ADR-001, ADR-002, etc.
Each ADR documents a significant architectural decision with context, options, decision, and consequences.

| ADR | Title | Status |
|-----|-------|--------|
| — | No ADRs yet — first ADR issued when Phase 1 begins | — |
```

---

## Final Verification Steps

After completing all AC items, run the following and report exact output:

```bash
# 1. TypeScript check
npx tsc --noEmit

# 2. Lint check
npm run lint

# 3. Prisma validation
npx prisma validate

# 4. Database migration
npx prisma db push

# 5. Smoke test
npm test

# 6. Build check
npm run build
```

Report any errors and how you resolved them.

---

## Report Back to Tier 1

When complete, send a message to Tier 1 containing:

1. **File manifest** — every file created or modified with its path
2. **Command outputs** — exact stdout/stderr for all verification commands
3. **Deviations** — any places where you had to deviate from this spec and why
4. **Open questions** — anything requiring Tier 1 decision before Phase 1

Tier 1 will audit your output against the Phase 0 audit checklist in `02-PHASE-BACKLOG.md` before issuing Phase 1.
