# 02 — Phase Backlog
## RiskTech & Advisory · Executive Onboarding & Vetting Portal (PoC)

**Document status:** LIVING — updated by Tier 1 Architect only  
**Last revised:** 2026-10-27  
**Owner:** Tier 1 – Principal Software Architect & GRC Security Lead  
**Version:** 1.0.0

---

## Phase Gate Model

```
Tier 1 issues Phase Spec ──► Tier 2 implements ──► Tier 1 audits output
        │                                                    │
        │◄──────────── PASS: unlock next phase ──────────────┤
        │◄──────────── FAIL: issue remediation spec ─────────┘
```

**Every phase is self-contained and auditable before the next begins.**  
Tier 2 must not begin a subsequent phase without explicit "✅ PHASE N UNLOCKED" from Tier 1.

---

## Phase Status Summary

| Phase | Title | Status | Tier 2 Issued | Audit Result |
|---|---|---|---|---|
| 0 | Project Foundation & Tooling | 🔵 READY TO ISSUE | — | — |
| 1 | Auth, RBAC & Persona Switcher | ⏳ PENDING | — | — |
| 2 | Prisma Schema, DAL & Encryption | ⏳ PENDING | — | — |
| 3 | Audit Log — Hash Chain Engine | ⏳ PENDING | — | — |
| 4 | Executive Onboarding Wizard | ⏳ PENDING | — | — |
| 5 | Document Upload Pipeline | ⏳ PENDING | — | — |
| 6 | Vetting FSM & Consultant Queue | ⏳ PENDING | — | — |
| 7 | Privacy Center & Consent Management | ⏳ PENDING | — | — |
| 8 | Push Notifications & Offline Sync | ⏳ PENDING | — | — |
| 9 | Admin Panel & Chain Integrity UI | ⏳ PENDING | — | — |
| 10 | Storybook, Tests & Synthetic Seed | ⏳ PENDING | — | — |
| 11 | README, .env.example & Final Audit | ⏳ PENDING | — | — |

---

## Phase 0 — Project Foundation & Tooling

**Status:** 🔵 READY TO ISSUE  
**Estimated effort:** 1 session  
**Deliverables audited by Tier 1 before Phase 1 begins.**

### Objectives

Bootstrap the repository with all tooling, configuration, and structural conventions locked in place so every subsequent phase starts from a stable, validated base.

### Acceptance Criteria

#### AC-0.1 · Next.js Project

- [ ] `npx create-next-app@latest` with App Router, TypeScript, Tailwind CSS, ESLint
- [ ] `tsconfig.json` has `"strict": true` and `"noUncheckedIndexedAccess": true`
- [ ] `tailwind.config.ts` has `darkMode: 'class'`
- [ ] Path alias `@/*` mapped to `./src/*` in `tsconfig.json`
- [ ] `next.config.ts` exports strict CSP headers via `headers()` (nonce placeholder accepted in Phase 1)

#### AC-0.2 · Prisma

- [ ] `prisma/schema.prisma` matches §6 domain model exactly (all models, enums, indexes)
- [ ] `DATABASE_URL` defaults to `file:./dev.db`
- [ ] `npx prisma db push` completes without errors
- [ ] `prisma/seed.ts` exists with `faker.seed(42)` import and TODO stubs (data filled in Phase 10)
- [ ] `package.json` has `"prisma": { "seed": "tsx prisma/seed.ts" }`

#### AC-0.3 · Authentication Package

- [ ] `next-auth@beta` (Auth.js v5) installed
- [ ] `src/lib/auth/config.ts` scaffolded with Credentials provider stub (implementation Phase 1)
- [ ] `src/app/api/auth/[...nextauth]/route.ts` created

#### AC-0.4 · State Management

- [ ] `zustand`, `idb-keyval`, `@tanstack/react-query`, `@tanstack/query-sync-storage-persister` installed
- [ ] Three Zustand store files created with typed interfaces and TODO bodies:
  - `src/stores/useThemeStore.ts`
  - `src/stores/useOnboardingDraftStore.ts`
  - `src/stores/useReviewerFilterStore.ts`
- [ ] `src/app/providers.tsx` created wrapping `PersistQueryClientProvider` and `QueryClientProvider`

#### AC-0.5 · Virtualisation

- [ ] `react-window`, `react-virtualized-auto-sizer` installed
- [ ] Placeholder `VirtualizedList` component in `src/components/shared/VirtualizedList.tsx` (typed, no implementation yet)

#### AC-0.6 · Security Packages

- [ ] `bcryptjs`, `@types/bcryptjs` installed
- [ ] `file-type` installed (ESM — ensure Next.js config handles ESM interop)
- [ ] `web-push`, `@types/web-push` installed
- [ ] `otplib`, `qrcode`, `@types/qrcode` installed (TOTP stretch)
- [ ] `lru-cache` installed (rate limiting)

#### AC-0.7 · Validation

- [ ] `zod` installed
- [ ] `src/lib/validation/` directory created with placeholder files:
  - `executive.schema.ts` (typed Zod schemas for each wizard step — shapes only, refinements Phase 4)
  - `document.schema.ts`
  - `vetting.schema.ts`

#### AC-0.8 · Testing

- [ ] `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` installed
- [ ] `vitest.config.ts` configured with `jsdom` environment and `@/*` alias
- [ ] `src/test/setup.ts` created with RTL `cleanup` afterEach
- [ ] One smoke test: `src/test/smoke.test.ts` asserting `1 + 1 === 2` (proves test runner works)

#### AC-0.9 · Storybook

- [ ] Storybook 8 installed and configured for Next.js
- [ ] `.storybook/main.ts` with `@storybook/nextjs` framework
- [ ] `.storybook/preview.ts` with Tailwind CSS import and dark mode decorator
- [ ] One placeholder story: `src/components/shared/Button.stories.tsx` with `Default` + `Dark` variants

#### AC-0.10 · Directory Skeleton

- [ ] All directories from §5 of the Architecture Spec exist (empty files with `// TODO` are acceptable)
- [ ] `src/types/roles.ts` exports `Role` enum matching Prisma schema
- [ ] `src/types/fsm.ts` exports `VettingStatus` enum matching Prisma schema
- [ ] `src/types/api.ts` exports `ApiResponse<T>` generic wrapper type

#### AC-0.11 · Environment

- [ ] `.env.example` contains all variables from §16 with empty values and inline comments
- [ ] `.env.local` is in `.gitignore`
- [ ] `.gitignore` also excludes `/uploads/`, `*.db`, `*.db-journal`

#### AC-0.12 · Documentation

- [ ] `AI_USAGE.md` created with Phase 0 entry (see format below)
- [ ] `docs/agent-ops/01-ARCHITECTURE-SPEC.md` and `docs/agent-ops/02-PHASE-BACKLOG.md` present (already authored by Tier 1)

### Tier 1 Audit Checklist (Phase 0)

Before unlocking Phase 1, Tier 1 will verify:

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npx prisma validate` exits 0
- [ ] `npx prisma db push` exits 0
- [ ] `npm test` (smoke test) passes
- [ ] `npm run storybook -- --smoke-test` passes
- [ ] No real personal data in any file
- [ ] All invariants from §4 (Tech Stack) are reflected in `package.json`

---

## Phase 1 — Auth, RBAC & Persona Switcher

**Status:** ⏳ PENDING Phase 0 audit  
**Dependencies:** Phase 0 ✅

### Objectives

Implement end-to-end authentication with NextAuth.js v5, three-layer RBAC enforcement, the synthetic persona switcher, and the dark-mode theme toggle.

### Acceptance Criteria

#### AC-1.1 · Credentials Auth

- [ ] `src/lib/auth/config.ts` — full Credentials provider: email + password lookup, `bcrypt.compare`, session callback injects `{ id, role, email }`
- [ ] Login page at `src/app/(auth)/login/page.tsx` with RTL-testable form
- [ ] Server-side login form action with Zod validation (email format, password min-length 8)
- [ ] Incorrect credentials → generic error message (no username/password enumeration)

#### AC-1.2 · Middleware RBAC (Layer 1)

- [ ] `src/app/middleware.ts` — matchers for `/executive`, `/consultant`, `/admin`
- [ ] Unauthenticated → redirect to `/login?callbackUrl=...`
- [ ] Wrong role → `/403` page (custom, GRC-branded)
- [ ] ADMINISTRATOR bypasses all role-specific path restrictions

#### AC-1.3 · DAL (Layer 2)

- [ ] `src/lib/dal/index.ts` exports `assertRolePermission(session, action)` throwing `ForbiddenError`
- [ ] `PermissionKey` union type covering all actions in §7 permission matrix
- [ ] Vitest: 100% coverage of all permission × role combinations

#### AC-1.4 · UI Guards (Layer 3)

- [ ] `<RoleGuard roles={[...]} fallback={<Forbidden />}>` component
- [ ] `useCurrentUser()` hook returning typed session user
- [ ] Storybook story for `RoleGuard` showing allowed and forbidden states

#### AC-1.5 · Persona Switcher

- [ ] Gated behind `process.env.NODE_ENV === 'development'` check (server-side) and `ENABLE_PERSONA_SWITCHER=true` env flag
- [ ] Floating panel (bottom-right) with synthetic persona buttons: Alice Okafor (EXECUTIVE), Ben Adeyemi (CONSULTANT), Carol Mensah (ADMINISTRATOR)
- [ ] Switching persona calls `/api/auth/switch-persona` (dev-only route) which signs in as that synthetic user
- [ ] PersonaSwitcher has Storybook story and RTL test verifying it renders only in dev mode

#### AC-1.6 · Dark Mode

- [ ] `useThemeStore` fully implemented: persists to `localStorage`, syncs `document.documentElement.classList`
- [ ] Inline `<script>` in `src/app/layout.tsx` `<head>` prevents SSR flash (reads `localStorage.theme` synchronously)
- [ ] `ThemeToggle` component (sun/moon icon) with Storybook story (light/dark states)

#### AC-1.7 · 403 & 404 Pages

- [ ] `src/app/403/page.tsx` — GRC-branded, role-aware message
- [ ] `src/app/not-found.tsx` — GRC-branded

### Tier 1 Audit Checklist (Phase 1)

- [ ] RBAC DAL achieves 100% test coverage on permission matrix
- [ ] Middleware blocks all cross-role route access (RTL integration test)
- [ ] Persona switcher inaccessible in `NODE_ENV=production` build
- [ ] No session data logged to console in any path
- [ ] Dark mode toggle survives page reload (SSR no-flash verified)

---

## Phase 2 — Prisma Schema, DAL & Encryption Layer

**Status:** ⏳ PENDING  
**Dependencies:** Phase 1 ✅

### Objectives

Harden the data layer: complete Prisma schema seeding, implement AES-256-GCM encryption helpers, and wire all DAL read/write functions for the Executive model.

### Acceptance Criteria

#### AC-2.1 · Encryption Helpers

- [ ] `src/lib/encryption/index.ts` — `encrypt(plaintext: string): string` and `decrypt(ciphertext: string): string`
- [ ] Uses `node:crypto` AES-256-GCM; IV is 12-byte random per encryption
- [ ] Stored format: `base64(iv):base64(authTag):base64(ciphertext)` (colon-delimited)
- [ ] Vitest: encrypt → decrypt roundtrip; wrong-key rejection throws `DecryptionError`; empty string handling

#### AC-2.2 · DAL Executive Functions

- [ ] `getExecutiveByUserId(userId, session)` — decrypts PII fields only if caller role permits
- [ ] `createExecutiveDraft(userId, step1Data)` — stores encrypted PII fields
- [ ] `updateExecutiveDraft(executiveId, stepData, version)` — optimistic concurrency check (409 on version mismatch)
- [ ] `submitExecutive(executiveId, session)` — validates all steps complete, transitions FSM to SUBMITTED, emits AuditLog

#### AC-2.3 · Optimistic Concurrency

- [ ] Every write to `Executive` increments `version`
- [ ] Route handlers return `409 Conflict` with `{ currentVersion }` on stale write
- [ ] RTL test: concurrent edit simulation → conflict resolution dialog shown

#### AC-2.4 · Synthetic Seed (Phase 2 portion)

- [ ] 3 synthetic users (one per role) with bcrypt-hashed passwords
- [ ] Each user has matching Executive / Consultant record
- [ ] All PII fields encrypted with test key

### Tier 1 Audit Checklist (Phase 2)

- [ ] No plaintext PII in database after seed (`sqlite3 dev.db "SELECT fullNameEnc FROM Executive"` returns ciphertext)
- [ ] Encryption key not hardcoded anywhere in source
- [ ] 100% test coverage on encryption module
- [ ] DAL functions never return raw encrypted blobs to client (always decrypted or masked)

---

## Phase 3 — Audit Log — Hash Chain Engine

**Status:** ⏳ PENDING  
**Dependencies:** Phase 2 ✅

### Objectives

Implement the append-only, SHA-256 hash-chained audit log engine with a full integrity verification endpoint and the genesis record initialization.

### Acceptance Criteria

#### AC-3.1 · AuditLog Writer

- [ ] `src/lib/audit/index.ts` exports `writeAuditLog(entry: AuditLogInput): Promise<AuditLog>`
- [ ] Fetches previous entry by `MAX(sequence)` in a transaction
- [ ] Computes `canonicalPayload` (deterministic JSON stringify)
- [ ] Computes `entryHash = SHA256(prevHash + canonicalPayload)`
- [ ] Inserts new row atomically (Prisma transaction)
- [ ] Genesis detection: if no prior row, `prevHash = "0000...0000"` (64 zeros)

#### AC-3.2 · Integrity Verifier

- [ ] `src/lib/audit/verify.ts` exports `verifyChain(): Promise<VerifyResult>`
- [ ] Streams all rows ordered by sequence
- [ ] Recomputes each `entryHash`; returns `{ valid, firstTamperedSequence?, totalChecked }`

#### AC-3.3 · Admin API Endpoint

- [ ] `GET /api/admin/audit/verify` — ADMINISTRATOR only (DAL guard)
- [ ] Returns `VerifyResult` as JSON
- [ ] Emits its own AuditLog entry: `action: 'AUDIT_VERIFY'`

#### AC-3.4 · Vitest Coverage

- [ ] Chain build: sequential write of 5 entries, verify passes
- [ ] Tamper detection: mutate `metadataDiff` of entry #3, verify detects tamper at sequence 3
- [ ] Multi-tamper: mutate entries #2 and #4, first tamper at #2 reported
- [ ] Genesis: single-entry chain verifies correctly

### Tier 1 Audit Checklist (Phase 3)

- [ ] Hash-chain algorithm matches §11 exactly (no deviations)
- [ ] Tamper detection unit tests pass
- [ ] AuditLog table has no UPDATE or DELETE permissions in DAL (writes only via `writeAuditLog`)
- [ ] Admin endpoint blocked for EXECUTIVE and CONSULTANT roles (403 test)

---

## Phase 4 — Executive Onboarding Wizard

**Status:** ⏳ PENDING  
**Dependencies:** Phase 3 ✅

### Objectives

Build the complete 6-step onboarding wizard with per-step Zod validation, IndexedDB draft persistence, offline support, TanStack Query server sync, and all Storybook stories.

### Acceptance Criteria

#### AC-4.1 · Wizard Shell

- [ ] `src/app/(portal)/executive/onboarding/layout.tsx` with step progress indicator
- [ ] Step navigation: Next/Back, step indicator showing completion status
- [ ] Cannot navigate to step N+2 without completing step N

#### AC-4.2 · Step 1 — Explicit Consent & Privacy Notice

- [ ] Displays current `CONSENT_VERSION` (constant in `src/lib/validation/consent.ts`)
- [ ] Two checkboxes: `dataProcessConsent` (required), `marketingConsent` (optional)
- [ ] Zod: `dataProcessConsent` must be `true`
- [ ] On submit: server action creates Executive record with consent fields

#### AC-4.3 · Step 2 — Professional Profile

- [ ] Fields: fullName, phone, nationality, currentTitle, currentOrg
- [ ] Zod: fullName (min 2), phone (valid format), currentTitle (min 2), currentOrg (min 2)
- [ ] Marked as PII fields — UI shows lock icon
- [ ] Data sent encrypted to server

#### AC-4.4 · Step 3 — Executive & Board Experience

- [ ] Dynamic list: add/remove board positions (org, role, startYear, endYear, isCurrentRole)
- [ ] Zod: at least one entry required for submission; each entry fully validated

#### AC-4.5 · Step 4 — Sector Expertise & Qualifications

- [ ] Sector multi-select (predefined list: Finance, Energy, Technology, Healthcare, Government, Legal, Other)
- [ ] Dynamic qualifications list (institution, credential, year)
- [ ] Zod: at least one sector required

#### AC-4.6 · Step 5 — Referees

- [ ] Two referee entries (name, email, phone, relationship, organisation) — PII encrypted
- [ ] Zod: two valid referees required for submission

#### AC-4.7 · Step 6 — Document Upload & Review

- [ ] File upload per document type (CV required, ID required, certifications optional)
- [ ] Client-side: extension check + 10MB size hint
- [ ] Upload via `/api/executive/documents/upload` (Phase 5)
- [ ] Review summary of all wizard steps before final submission
- [ ] "Submit Application" button → calls submit endpoint → FSM DRAFT → SUBMITTED

#### AC-4.8 · Draft Persistence

- [ ] `useOnboardingDraftStore` saves each step's data to IndexedDB on every field change (debounced 500ms)
- [ ] "Resume" flow: on page load, if draft exists in IndexedDB and server draft is at a lower step, offer to restore
- [ ] Conflict resolution: if server draft step > IndexedDB step, prefer server

#### AC-4.9 · Offline Behaviour

- [ ] `useOfflineStatus` hook shows offline banner when `navigator.onLine === false`
- [ ] Wizard fields remain editable offline (Zustand draft)
- [ ] On reconnect: paused mutations flush; toast confirms sync

#### AC-4.10 · TanStack Query Integration

- [ ] `useExecutiveDraft()` query fetches current draft state from server
- [ ] Each step submit is a mutation with `X-Idempotency-Key`
- [ ] Optimistic update: wizard shows next step immediately; rolls back on error

#### AC-4.11 · Stories & Tests

- [ ] Storybook stories for each step component (light/dark, empty/filled/error)
- [ ] RTL tests: full wizard flow (mock server), offline save, resume from draft, consent validation

### Tier 1 Audit Checklist (Phase 4)

- [ ] PII fields never appear in browser network tab (only ciphertext in request body — verify with mock inspection)
- [ ] Consent `dataProcessConsent` cannot be bypassed (Zod rejects server-side)
- [ ] Draft store does not persist decrypted PII to IndexedDB (store only encrypted blobs or non-PII fields; PII always encrypted server-side)
- [ ] Step 6 submit blocked if required document types not uploaded
- [ ] AuditLog entry written on `SUBMIT_APPLICATION`

---

## Phase 5 — Document Upload Pipeline

**Status:** ⏳ PENDING  
**Dependencies:** Phase 4 ✅

### Objectives

Implement the full secure document upload and download pipeline with magic-byte validation, checksum computation, RBAC-gated streaming download, and audit logging.

### Acceptance Criteria

#### AC-5.1 · Upload Route Handler

- [ ] `POST /api/executive/documents/upload` matching §13 pipeline exactly
- [ ] All security checks in order (Content-Length → magic-byte → extension/MIME → SHA-256 → write → DB → audit)
- [ ] Returns `{ documentId, sha256, type }` on success

#### AC-5.2 · Download Route Handler

- [ ] `GET /api/executive/documents/{documentId}/download` — CONSULTANT | ADMINISTRATOR only
- [ ] Streams file from storagePath using `createReadStream`
- [ ] Sets `Content-Disposition: attachment; filename="..."`
- [ ] AuditLog: `DOCUMENT_DOWNLOAD` with `{ documentId, downloadedBy }`

#### AC-5.3 · File Integrity

- [ ] SHA-256 checksum stored in DB
- [ ] Download route re-computes SHA-256 on stream and adds `X-File-Checksum` response header
- [ ] Vitest: checksum mismatch detected

#### AC-5.4 · MIME Spoofing Tests

- [ ] Vitest: upload `.exe` renamed to `.pdf` → rejected (magic bytes detect `application/x-msdownload`)
- [ ] Vitest: upload valid PDF → accepted
- [ ] Vitest: upload oversized file → 413 before processing

#### AC-5.5 · Storage

- [ ] Files stored at `/uploads/{executiveId}/{uuid}.{sanitized-ext}`
- [ ] `/uploads/` excluded from Next.js static serving
- [ ] `storagePath` never returned in any API response

### Tier 1 Audit Checklist (Phase 5)

- [ ] `storagePath` absent from all API responses (grep check)
- [ ] MIME spoofing test passes
- [ ] EXECUTIVE cannot download documents (403 test)
- [ ] AuditLog entries present for every upload and download

---

## Phase 6 — Vetting FSM & Consultant Queue

**Status:** ⏳ PENDING  
**Dependencies:** Phase 5 ✅

### Objectives

Implement the deterministic backend FSM, the consultant vetting queue with react-window virtualisation, slide-over drawer for detail review, and all FSM transition UI.

### Acceptance Criteria

#### AC-6.1 · FSM Engine

- [ ] `src/lib/fsm/vettingFsm.ts` — `transition(current, action, actor, note?)` returns new status or throws `InvalidTransitionError`
- [ ] Transition table matches §10 exactly
- [ ] `reviewerNote` required for `MORE_INFO_REQUIRED` and `REJECTED` transitions (throws if missing/empty)
- [ ] Every transition writes AuditLog entry
- [ ] Vitest: all valid transitions pass; all invalid transitions throw; note requirement enforced

#### AC-6.2 · Vetting API Endpoints

- [ ] `GET /api/consultant/vetting` — paginated list of executives with vetting status (CONSULTANT | ADMIN)
- [ ] `POST /api/consultant/vetting/{executiveId}/transition` — FSM transition (CONSULTANT | ADMIN)
- [ ] Request body validated by Zod: `{ action, note? }`

#### AC-6.3 · Consultant Queue UI

- [ ] `src/app/(portal)/consultant/queue/page.tsx`
- [ ] `react-window` `FixedSizeList` with `AutoSizer` wrapper
- [ ] Row height: 72px fixed; variable detail in slide-over drawer
- [ ] `useReviewerFilterStore` drives search (full-text on name/org), status filter, sort (name, submittedAt, status)
- [ ] Filter/sort UI: search input, status dropdown, sort column/direction controls
- [ ] Empty state: illustrated zero-state when no executives match filter
- [ ] Storybook story: 1000 synthetic rows (proves virtualisation), empty state, loading skeleton

#### AC-6.4 · Executive Detail Drawer

- [ ] Slide-over drawer (right panel) opens on row click
- [ ] Displays: executive profile (PII masked by default), board experience, sectors, documents list
- [ ] Status badge with current FSM state
- [ ] Transition action buttons (contextual — only valid next transitions shown)
- [ ] Reviewer note textarea (required for rejection/more-info)
- [ ] "Confirm" button triggers transition mutation with optimistic status update

#### AC-6.5 · Stories & Tests

- [ ] RTL: queue renders, filter reduces list, transition button triggers API call, optimistic update, rollback on error
- [ ] RTL: rejection without note → inline validation error (cannot submit)
- [ ] Storybook: queue (all states), drawer (all FSM states), status badge (all statuses)

### Tier 1 Audit Checklist (Phase 6)

- [ ] FSM engine 100% test coverage on all paths
- [ ] EXECUTIVE cannot access `/consultant/queue` (middleware + RTL test)
- [ ] AuditLog entry present for every transition (integration test)
- [ ] `MORE_INFO_REQUIRED` → `SUBMITTED` re-submit path works end-to-end
- [ ] Queue renders 1000+ rows at 60fps (Storybook performance story present)

---

## Phase 7 — Privacy Center & Consent Management

**Status:** ⏳ PENDING  
**Dependencies:** Phase 6 ✅

### Objectives

Build the executive Privacy Center aligned with NDPA 2023: PII reveal with audit, consent withdrawal, data export, and the versioned consent re-prompt flow.

### Acceptance Criteria

#### AC-7.1 · Privacy Center Page

- [ ] `src/app/(portal)/executive/privacy-center/page.tsx`
- [ ] Sections: My Data, Consent Status, Data Export, Danger Zone

#### AC-7.2 · PII Reveal

- [ ] PII fields rendered as `••••••••` by default
- [ ] "Reveal" button → server round-trip → decrypt → display for 30 seconds → re-mask
- [ ] Every reveal triggers AuditLog: `PII_REVEAL`
- [ ] `<PiiMaskField>` component with Storybook story (masked/revealed states)

#### AC-7.3 · Consent Withdrawal

- [ ] "Withdraw Consent" button → confirmation modal with legal text
- [ ] On confirm: server action sets `consentWithdrawnAt`, soft-deletes PII (replaces with `[WITHDRAWN]`), freezes vetting FSM
- [ ] AuditLog: `CONSENT_WITHDRAWAL`
- [ ] Executive receives push notification confirming withdrawal

#### AC-7.4 · Data Export

- [ ] `GET /api/executive/export` returns JSON of all executive data (non-PII fields + masked PII note)
- [ ] Or with `?decrypt=true` (EXECUTIVE own request only) returns decrypted PII in export
- [ ] AuditLog: `DATA_EXPORT`

#### AC-7.5 · Versioned Consent Re-Prompt

- [ ] On login: compare `session.executive.consentVersion` with `CONSENT_VERSION` constant
- [ ] If outdated: redirect to `/executive/consent-update` before portal access
- [ ] Consent update page re-captures consent, updates `consentVersion` and `consentGrantedAt`

#### AC-7.6 · Marketing Consent Toggle

- [ ] Toggle in Privacy Center (optimistic update via TanStack Query mutation)
- [ ] AuditLog: `CONSENT_CHANGE`

### Tier 1 Audit Checklist (Phase 7)

- [ ] Every PII reveal has an AuditLog entry (integration test)
- [ ] Consent withdrawal makes PII inaccessible (decrypt attempt returns `[WITHDRAWN]`)
- [ ] Data export contains no ciphertext (either decrypted or `[MASKED]` placeholder)
- [ ] Consent version check fires on every login (middleware/session check test)

---

## Phase 8 — Push Notifications & Offline Sync

**Status:** ⏳ PENDING  
**Dependencies:** Phase 7 ✅

### Objectives

Implement the Web Push service worker, VAPID subscription management, status-change notification triggers, and the full offline sync flow with conflict resolution.

### Acceptance Criteria

#### AC-8.1 · Service Worker

- [ ] `public/sw.js` handles: `install`, `activate`, `fetch` (network-first API / cache-first static), `push`, `notificationclick`
- [ ] Push handler parses `{ title, body, url }` from push event data
- [ ] `notificationclick` focuses existing tab or opens `/`

#### AC-8.2 · VAPID Subscription

- [ ] `usePushSubscription` hook: checks permission, subscribes with VAPID public key, POSTs to `/api/push/subscribe`
- [ ] `POST /api/push/subscribe` — saves `PushSubscription` record (upsert by endpoint)
- [ ] `DELETE /api/push/subscribe` — removes subscription

#### AC-8.3 · Push Trigger Integration

- [ ] `src/lib/push/notify.ts` exports `notifyUser(userId, payload)` using `web-push`
- [ ] Called from FSM transition handler after AuditLog write
- [ ] All trigger events from §14 covered
- [ ] Graceful failure: push failure does not rollback FSM transition (fire-and-forget with error log)

#### AC-8.4 · In-App Notification Fallback

- [ ] TanStack Query polls `/api/notifications/unread` every 30s when page is visible (`document.visibilityState`)
- [ ] Notification bell icon in nav with unread count badge
- [ ] Dropdown list of recent notifications (mark as read on click)

#### AC-8.5 · Offline Sync

- [ ] `useOfflineStatus` hook (wraps `navigator.onLine` + `online`/`offline` events)
- [ ] Offline banner component in portal layout
- [ ] TanStack Query `paused` mutation queue flushes on reconnect
- [ ] Each mutation has `X-Idempotency-Key` UUID stored in `useOnboardingDraftStore`
- [ ] Server: idempotency key check via `processedIdempotencyKeys` Set (in-memory for PoC, with TODO note for Redis in prod)
- [ ] 409 conflict → `ConflictResolutionDialog` showing field-level diff (client value vs server value)

### Tier 1 Audit Checklist (Phase 8)

- [ ] VAPID private key never exposed in client bundle (grep check)
- [ ] Push subscription endpoint rejects non-authenticated requests
- [ ] Offline → edit → online → sync flow covered by RTL test
- [ ] Conflict dialog shown when server version > client version (RTL test with mocked 409)

---

## Phase 9 — Admin Panel & Chain Integrity UI

**Status:** ⏳ PENDING  
**Dependencies:** Phase 8 ✅

### Objectives

Build the Administrator panel with the tamper-evident audit log viewer (react-window), chain integrity verification UI, user management, and platform analytics dashboard.

### Acceptance Criteria

#### AC-9.1 · Audit Log Viewer

- [ ] `src/app/(portal)/admin/audit-log/page.tsx`
- [ ] `react-window` `FixedSizeList` (row height 56px) with `AutoSizer`
- [ ] Columns: sequence, timestamp, actor, role, action, target
- [ ] Click row → slide-over drawer showing full entry + `metadataDiff` formatted JSON
- [ ] Filter: by actor, action type, date range

#### AC-9.2 · Chain Integrity Badge

- [ ] "Verify Chain Integrity" button triggers `GET /api/admin/audit/verify`
- [ ] Loading state: spinner with "Verifying {N} entries…"
- [ ] Success: 🔐 **Chain Intact — {N} entries verified** (green badge)
- [ ] Failure: ⚠️ **Tampered at sequence #{N}** (red badge) with affected sequence highlighted in list
- [ ] Storybook story: intact/tampered states

#### AC-9.3 · User Management

- [ ] `src/app/(portal)/admin/users/page.tsx`
- [ ] Table of all users: email, role, createdAt, last login
- [ ] Role change dropdown (ADMINISTRATOR only) with AuditLog entry: `USER_ROLE_CHANGE`
- [ ] No user deletion (PoC scope — soft approach only)

#### AC-9.4 · Analytics Dashboard

- [ ] Summary cards: Total Executives, By Status (breakdown), Documents Uploaded, Audit Events (last 24h)
- [ ] Simple bar chart (use `recharts`) showing applications by status
- [ ] Data from `/api/admin/analytics` endpoint (ADMINISTRATOR only)

### Tier 1 Audit Checklist (Phase 9)

- [ ] Audit log viewer renders 10,000 rows without layout jank (react-window confirmed)
- [ ] Chain integrity endpoint accessible only to ADMINISTRATOR (403 test)
- [ ] User role change emits AuditLog entry (integration test)
- [ ] Analytics endpoint returns no PII

---

## Phase 10 — Storybook, Tests & Synthetic Seed

**Status:** ⏳ PENDING  
**Dependencies:** Phase 9 ✅

### Objectives

Complete all Storybook stories, achieve test coverage thresholds from §15, and build the full synthetic seed producing a rich, demo-ready dataset.

### Acceptance Criteria

#### AC-10.1 · Complete Storybook

- [ ] Every component in `src/components/` has a story file per §15 requirements
- [ ] All stories render without console errors in both light and dark modes
- [ ] `npm run storybook -- --smoke-test` exits 0

#### AC-10.2 · Test Coverage

- [ ] All Vitest thresholds from §15 met (run `npm run test -- --coverage`)
- [ ] RTL tests cover all critical flows from §15

#### AC-10.3 · Synthetic Seed

- [ ] `prisma/seed.ts` with `faker.seed(42)` generates:
  - 3 synthetic users (one per role) with known passwords documented in README
  - 10 synthetic executives at various vetting stages
  - 30+ audit log entries forming a valid hash chain
  - 2–4 documents per executive (synthetic file buffers with valid magic bytes)
  - Push subscription stubs
- [ ] **Zero real personal or corporate data**
- [ ] Seed is idempotent (safe to re-run)

#### AC-10.4 · CI Smoke Check Script

- [ ] `scripts/ci-smoke.sh`: installs, migrates, seeds, runs tests, builds
- [ ] All steps exit 0

### Tier 1 Audit Checklist (Phase 10)

- [ ] `git grep -r` for any real names, companies, emails → zero results (automated grep in CI script)
- [ ] Coverage report meets all thresholds
- [ ] Seed produces valid hash chain (verified by calling `/api/admin/audit/verify` in seed script)
- [ ] All Storybook stories pass smoke test

---

## Phase 11 — README, .env.example & Final Audit

**Status:** ⏳ PENDING  
**Dependencies:** Phase 10 ✅

### Objectives

Author the production-quality README, finalize `.env.example`, complete `AI_USAGE.md`, and perform Tier 1 final cross-cutting security and architecture audit.

### Acceptance Criteria

#### AC-11.1 · README.md

- [ ] Project overview and GRC context
- [ ] Prerequisites (Node 20+, npm)
- [ ] Step-by-step local setup (clone → env → install → migrate → seed → dev)
- [ ] Synthetic persona credentials table
- [ ] Feature walkthrough with route map
- [ ] Architecture overview (link to `01-ARCHITECTURE-SPEC.md`)
- [ ] Testing instructions
- [ ] Production deployment notes (link to §16 of Architecture Spec)
- [ ] Known limitations / PoC scope boundaries

#### AC-11.2 · AI_USAGE.md Final

- [ ] Every phase logged with: model used, prompt summary, output summary, human review performed, trade-offs noted
- [ ] Engineer can use this to explain any AI-generated code in a live Q&A

#### AC-11.3 · Final Security Audit

- [ ] `npx tsc --noEmit` → 0
- [ ] `npm run lint` → 0
- [ ] `npm test -- --coverage` → all thresholds met
- [ ] `npm run build` → 0 (production build succeeds)
- [ ] Manual RBAC walkthrough: each persona can only access permitted routes
- [ ] Manual audit chain verification: seed → verify → tamper a record manually → re-verify → tamper detected
- [ ] Grep audit: no hardcoded secrets, no real PII, no `storagePath` in API responses

---

## AI_USAGE.md Entry Format

Each phase must add an entry to `AI_USAGE.md` following this format:

```markdown
## Phase N — [Phase Title]

| Field | Value |
|---|---|
| Date | YYYY-MM-DD |
| Model | [Model name] |
| Tier 2 Prompt Summary | Brief description of what was requested |
| Output Summary | What the builder produced |
| Human Review | What Tier 1 checked manually |
| Deviations from Spec | Any intentional changes from Architecture Spec (with justification) |
| Trade-offs Noted | Performance, security, or complexity trade-offs |
| Open Questions | Anything requiring future ADR or human decision |
```

---

*End of Phase Backlog v1.0.0*
