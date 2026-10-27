# 01 — Architecture Specification
## RiskTech & Advisory · Executive Onboarding & Vetting Portal (PoC)

**Document status:** LIVING — updated by Tier 1 Architect only  
**Last revised:** 2026-10-27  
**Owner:** Tier 1 – Principal Software Architect & GRC Security Lead  
**Version:** 1.0.0

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Explicit Scope Boundaries](#2-explicit-scope-boundaries)
3. [System Context & Actors](#3-system-context--actors)
4. [Tech Stack Invariants](#4-tech-stack-invariants)
5. [Application Architecture](#5-application-architecture)
6. [Domain Model](#6-domain-model)
7. [RBAC Design](#7-rbac-design)
8. [State Management Split](#8-state-management-split)
9. [Security Architecture](#9-security-architecture)
10. [Vetting Finite State Machine](#10-vetting-finite-state-machine)
11. [Audit Trail Design](#11-audit-trail-design)
12. [Consent & Privacy (NDPA 2023)](#12-consent--privacy-ndpa-2023)
13. [Document Upload Pipeline](#13-document-upload-pipeline)
14. [Offline & Push Notification Architecture](#14-offline--push-notification-architecture)
15. [Testing Invariants](#15-testing-invariants)
16. [Deployment & Runtime](#16-deployment--runtime)
17. [Architectural Trade-off Log](#17-architectural-trade-off-log)

---

## 1. Purpose & Scope

This portal is the **foundational onboarding module** of RiskTech & Advisory's Executive Platform. It enables:

- **Senior executives** to self-onboard through a secure, offline-capable, multi-step wizard.
- **Recruitment consultants** to review, verify, and manage executives through a controlled, auditable vetting workflow.
- **Administrators** to monitor platform health, verify audit-chain integrity, and manage consent/data lifecycles.

> [!IMPORTANT]
> This PoC **does not replicate or integrate with BoardSeats**, which is already in production. Any future integration surface must be defined in a separate ADR before implementation.

---

## 2. Explicit Scope Boundaries

### IN SCOPE

| Area | Detail |
|---|---|
| Executive onboarding wizard | 6 steps, offline-capable, draft autosave |
| Consultant vetting queue | Virtualised list, FSM-controlled transitions |
| Secure document uploads | CV, ID, certifications with magic-byte validation |
| RBAC enforcement | 3 layers: middleware → DAL → UI guards |
| Tamper-evident audit log | SHA-256 hash-chaining, admin integrity verification |
| Consent management | Granular, versioned, NDPA 2023-aligned |
| PII encryption at rest | AES-256-GCM on sensitive fields |
| Offline sync | IndexedDB drafts + paused mutation queue |
| Web push notifications | VAPID-keyed status change alerts |
| Persona switcher | Gated synthetic demo switcher (no real credentials) |
| Storybook stories | Core components, all theme/state variants |
| Vitest + RTL tests | RBAC guards, FSM transitions, critical flows |

### OUT OF SCOPE (PoC boundary)

| Area | Reason |
|---|---|
| BoardSeats integration | Separate production system; integration via future ADR |
| Payment / billing flows | Not part of onboarding module |
| Video / real-time conferencing | Separate executive engagement module |
| Email delivery infrastructure | Stubbed — push notifications used instead |
| Production secrets management | Dev uses `.env.local`; production secrets via Vault/GCP SM in a future ops phase |
| Multi-tenancy client isolation | Single-tenant PoC; multi-tenancy is a future architectural concern |
| i18n / localisation | English-only PoC; i18n hooks reserved in component structure |
| Mobile native apps | Responsive PWA only |

---

## 3. System Context & Actors

```
┌─────────────────────────────────────────────────────────────────┐
│                       Browser / PWA                             │
│  ┌────────────┐  ┌──────────────────┐  ┌───────────────────┐   │
│  │ Executive  │  │   Consultant     │  │  Administrator    │   │
│  │ Onboarding │  │  Vetting Queue   │  │  Audit & Admin    │   │
│  │   Wizard   │  │  + Drawer Detail │  │  Panel            │   │
│  └─────┬──────┘  └────────┬─────────┘  └────────┬──────────┘   │
│        │ TanStack Query    │ TanStack Query        │             │
│        │ + Zustand Draft   │ + Zustand Filter      │             │
└────────┼───────────────────┼───────────────────────┼────────────┘
         │                   │                       │
         ▼ HTTPS / RSC       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js App Router (Node.js)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware Layer (Auth + RBAC guard + rate-limit)       │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  Route Handlers  │  RSC Pages  │  Server Actions         │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  Data Access Layer (DAL) — assertRolePermission()        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  Prisma ORM  ──────────────────────────────────────────► │   │
│  └──────────────────────────────────────────────────────────┘   │
│       │ fs / streams            │ AES-256-GCM encrypt          │
│       ▼                         ▼                               │
│  File Storage (local /uploads) SQLite (dev) / PostgreSQL (prod) │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼  Web Push (VAPID)
    Browser Push API ──► Service Worker (sw.js)
```

### Actor Matrix

| Actor | Primary Tasks | Sensitive Capabilities |
|---|---|---|
| **EXECUTIVE** | Complete onboarding wizard, upload docs, view own status, manage consent | Reveal own PII (audited), withdraw consent |
| **CONSULTANT** | Review submissions, transition vetting FSM, request more info | View executive documents (streamed + audited), add reviewer notes |
| **ADMINISTRATOR** | View all records, verify audit chain integrity, export data, manage users | Verify chain integrity, access admin panel, data purge (with consent) |

---

## 4. Tech Stack Invariants

> [!IMPORTANT]
> These are **non-negotiable**. Any deviation requires a new ADR approved by Tier 1.

| Concern | Choice | Constraint |
|---|---|---|
| Framework | Next.js 14+ (App Router) | No Pages Router; no `'use client'` on layout boundaries |
| Language | TypeScript | `strict: true`, `noUncheckedIndexedAccess: true` |
| Validation | Zod | Shared schemas in `src/lib/validation/` — **same schema on client and server** |
| ORM | Prisma | Schema-first; no raw SQL except audit chain hash verification |
| Database | SQLite (dev) / PostgreSQL (prod) | Provider swapped via `DATABASE_URL` env var only |
| Client state | Zustand (3 stores only — see §8) | No Zustand for server data |
| Server cache | TanStack Query v5 | `networkMode: 'offlineFirst'`, persisted client |
| Virtualisation | react-window | Required on: vetting queue, audit log |
| Styling | Tailwind CSS | `darkMode: 'class'`; no inline styles; no CSS modules |
| Component docs | Storybook 8 | Stories required per §15 |
| Testing | Vitest + RTL | Coverage thresholds per §15 |
| Encryption | Node.js `crypto` (AES-256-GCM) | No third-party encryption libs |
| Auth | NextAuth.js v5 (Auth.js) | JWT sessions; credentials provider for PoC + TOTP stretch |
| Push | Web Push API + VAPID | VAPID keys generated at setup; stored in env |
| File inspection | `file-type` npm package | Server-side only; client extension check is UI-only hint |

---

## 5. Application Architecture

### Directory Structure (canonical)

```
risktech/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                    # SYNTHETIC DATA ONLY
├── public/
│   └── sw.js                      # Service Worker (push + offline)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Login / register routes (group, no layout shell)
│   │   ├── (portal)/              # Authenticated routes
│   │   │   ├── executive/
│   │   │   │   ├── onboarding/    # Multi-step wizard pages
│   │   │   │   └── privacy-center/
│   │   │   ├── consultant/
│   │   │   │   └── queue/         # Vetting queue
│   │   │   └── admin/
│   │   │       ├── audit-log/
│   │   │       └── users/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── executive/
│   │   │   │   ├── onboarding/    # Draft save, submit
│   │   │   │   └── documents/     # Upload, download stream
│   │   │   ├── consultant/
│   │   │   │   └── vetting/       # FSM transition endpoints
│   │   │   ├── admin/
│   │   │   │   ├── audit/         # Chain integrity verification
│   │   │   │   └── export/        # NDPA data export
│   │   │   └── push/              # VAPID subscription management
│   │   └── middleware.ts           # Auth + RBAC gate
│   ├── components/
│   │   ├── ui/                    # Primitives (Button, Badge, Dialog…)
│   │   ├── onboarding/            # Wizard step components
│   │   ├── vetting/               # Queue row, drawer, status badge
│   │   ├── audit/                 # Log row, chain verify badge
│   │   └── shared/                # ProtectedRoute, PiiMaskField, ThemeToggle
│   ├── lib/
│   │   ├── auth/                  # NextAuth config, session helpers
│   │   ├── dal/                   # Data Access Layer — assertRolePermission
│   │   ├── encryption/            # AES-256-GCM encrypt/decrypt helpers
│   │   ├── audit/                 # Hash-chain builder, integrity verifier
│   │   ├── validation/            # Zod schemas (shared)
│   │   ├── fsm/                   # Vetting state machine
│   │   ├── push/                  # VAPID web-push helpers
│   │   └── db.ts                  # Prisma client singleton
│   ├── stores/
│   │   ├── useThemeStore.ts        # Zustand: dark mode
│   │   ├── useOnboardingDraftStore.ts  # Zustand: IndexedDB draft
│   │   └── useReviewerFilterStore.ts  # Zustand: queue filter state
│   ├── hooks/
│   │   ├── useOfflineStatus.ts
│   │   ├── usePushSubscription.ts
│   │   └── useIdempotentMutation.ts
│   └── types/
│       ├── roles.ts
│       ├── fsm.ts
│       └── api.ts
├── .storybook/
├── docs/
│   ├── agent-ops/
│   │   ├── 01-ARCHITECTURE-SPEC.md   ← THIS FILE
│   │   └── 02-PHASE-BACKLOG.md
│   ├── adr/                          # Architecture Decision Records
│   └── decisions/
├── AI_USAGE.md
└── README.md
```

### Routing & Middleware Flow

```
Request
  │
  ▼
middleware.ts
  ├─ No session? ──► redirect /login
  ├─ Session role !== required role? ──► 403 page
  └─ OK ──► pass through
              │
              ▼
          Route Handler / RSC
              │
              ▼
          DAL: assertRolePermission(session, 'ACTION')
              ├─ Fail ──► throw new ForbiddenError() ──► 403 JSON
              └─ OK ──► Prisma query
```

---

## 6. Domain Model

### Prisma Schema (logical — canonical source of truth)

```prisma
// --- Users & Auth ---

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          Role     @default(EXECUTIVE)
  totpSecret    String?  // AES-256-GCM encrypted at rest
  mfaEnabled    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  executive     Executive?
  consultant    Consultant?
  sessions      Session[]
  auditLogs     AuditLog[] @relation("ActorLogs")
  pushSubs      PushSubscription[]
}

enum Role {
  EXECUTIVE
  CONSULTANT
  ADMINISTRATOR
}

// --- Executive Profile ---

model Executive {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id])

  // Step 1 — Consent
  consentVersion      String
  consentGrantedAt    DateTime
  consentWithdrawnAt  DateTime?
  marketingConsent    Boolean  @default(false)
  dataProcessConsent  Boolean  // mandatory

  // Step 2 — Professional Profile (PII — encrypted)
  fullNameEnc         String   // AES-256-GCM encrypted
  phoneEnc            String   // AES-256-GCM encrypted
  nationalityEnc      String   // AES-256-GCM encrypted
  currentTitle        String
  currentOrg          String

  // Step 3 — Board Experience (JSON blob, non-PII summary)
  boardExperience     Json     @default("[]")

  // Step 4 — Sector & Qualifications (non-sensitive)
  sectors             String[]
  qualifications      Json     @default("[]")

  // Step 5 — Referees (PII — encrypted JSON)
  refereesEnc         String   // AES-256-GCM encrypted JSON array

  // Step 6 — Documents
  documents           Document[]

  // Vetting
  vettingStatus       VettingStatus @default(DRAFT)
  vettingNotes        VettingNote[]
  submittedAt         DateTime?
  verifiedAt          DateTime?
  rejectedAt          DateTime?

  // Optimistic concurrency
  version             Int      @default(0)

  // Wizard draft progress
  draftStep           Int      @default(1)
  draftCompletedSteps Int[]

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

enum VettingStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  MORE_INFO_REQUIRED
  VERIFIED
  REJECTED
}

// --- Consultant ---

model Consultant {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  notes     VettingNote[]
  createdAt DateTime @default(now())
}

// --- Vetting Notes ---

model VettingNote {
  id           String    @id @default(cuid())
  executiveId  String
  executive    Executive @relation(fields: [executiveId], references: [id])
  consultantId String
  consultant   Consultant @relation(fields: [consultantId], references: [id])
  content      String
  isPublic     Boolean   @default(false) // shown to executive if true
  createdAt    DateTime  @default(now())
}

// --- Documents ---

model Document {
  id           String       @id @default(cuid())
  executiveId  String
  executive    Executive    @relation(fields: [executiveId], references: [id])
  type         DocumentType
  originalName String       // display name only (not storage path)
  storagePath  String       // non-public, server-only path
  mimeType     String
  sizeBytes    Int
  sha256       String       // file integrity checksum
  uploadedAt   DateTime     @default(now())
  uploadedById String       // User.id

  @@index([executiveId, type])
}

enum DocumentType {
  CV
  IDENTIFICATION
  CERTIFICATION
  OTHER
}

// --- Audit Log (append-only, hash-chained) ---

model AuditLog {
  id           String   @id @default(cuid())
  sequence     Int      @unique @default(autoincrement())
  actorId      String
  actor        User     @relation("ActorLogs", fields: [actorId], references: [id])
  actorRole    Role
  action       String   // e.g. "FSM_TRANSITION", "DOCUMENT_DOWNLOAD", "PII_REVEAL"
  targetType   String   // e.g. "Executive", "Document"
  targetId     String
  metadataDiff Json     // redacted — no raw PII values stored
  prevHash     String
  entryHash    String   // SHA256(prevHash + canonicalPayload)
  createdAt    DateTime @default(now())

  @@index([actorId])
  @@index([targetId])
  @@index([createdAt])
}

// --- Push Subscriptions ---

model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  endpoint  String   @unique
  keys      Json     // { p256dh, auth }
  createdAt DateTime @default(now())

  @@index([userId])
}

// --- Auth sessions (NextAuth) ---
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires      DateTime
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

---

## 7. RBAC Design

### Permission Matrix

| Action | EXECUTIVE | CONSULTANT | ADMINISTRATOR |
|---|:---:|:---:|:---:|
| Create own profile / wizard | ✅ | ❌ | ❌ |
| Submit own application | ✅ | ❌ | ❌ |
| View own profile | ✅ | ❌ | ✅ |
| Reveal own PII (audited) | ✅ | ❌ | ✅ |
| Withdraw own consent | ✅ | ❌ | ✅ |
| Export own data (NDPA) | ✅ | ❌ | ✅ |
| View vetting queue (all) | ❌ | ✅ | ✅ |
| Transition vetting FSM | ❌ | ✅ | ✅ |
| View executive documents | ❌ | ✅ (audited) | ✅ (audited) |
| Add reviewer notes | ❌ | ✅ | ✅ |
| View audit log | ❌ | ❌ | ✅ |
| Verify chain integrity | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View admin analytics | ❌ | ❌ | ✅ |

### Three-Layer Enforcement

```
Layer 1: middleware.ts
  matchers:  /executive/:path* → requires EXECUTIVE (or ADMINISTRATOR)
             /consultant/:path* → requires CONSULTANT (or ADMINISTRATOR)
             /admin/:path* → requires ADMINISTRATOR

Layer 2: DAL (src/lib/dal/index.ts)
  assertRolePermission(session: Session, action: PermissionKey): void
  → throws ForbiddenError if session.user.role lacks the permission

Layer 3: UI Guards
  <RoleGuard roles={['CONSULTANT', 'ADMINISTRATOR']}>
    ...children rendered only if role matches
  </RoleGuard>
  + ProtectedRoute HOC for client-side navigation guards
```

---

## 8. State Management Split

### Zustand Stores (UI/local state ONLY)

| Store | File | Persistence | Responsibility |
|---|---|---|---|
| `useThemeStore` | `stores/useThemeStore.ts` | `localStorage` | Dark/light mode toggle; syncs `<html class>` |
| `useOnboardingDraftStore` | `stores/useOnboardingDraftStore.ts` | `idb-keyval` (IndexedDB) | Multi-step wizard field values, current step, offline edits |
| `useReviewerFilterStore` | `stores/useReviewerFilterStore.ts` | `sessionStorage` | Vetting queue search term, sort column/dir, status filter |

**Rule:** Zustand stores **never** fetch data from the server. They hold only client-derived or draft state.

### TanStack Query (server cache)

- `PersistQueryClientProvider` with IndexedDB persister for offline reads
- `networkMode: 'offlineFirst'` on all queries
- Mutations use `X-Idempotency-Key` (UUID v4, stored in Zustand draft until ACK)
- Paused mutation queue: mutations enqueue when offline, fire in FIFO order on reconnect
- Optimistic concurrency: `version` field on `Executive` model; server returns 409 on stale write → client shows conflict UI

---

## 9. Security Architecture

### Authentication

- NextAuth.js v5 (Auth.js) with Credentials provider for PoC
- Passwords: `bcrypt` (cost factor 12)
- JWT sessions (edge-compatible); session payload contains `{ id, role, email }`
- **TOTP MFA (stretch):** `otplib` + QR enrolment; TOTP secret stored AES-256-GCM encrypted in DB

### PII Encryption at Rest

```
Key derivation: APP_ENCRYPTION_KEY (env, 32-byte hex) → AES-256-GCM
Format stored: base64(iv) + ':' + base64(authTag) + ':' + base64(ciphertext)
Fields encrypted: fullName, phone, nationality, referees JSON
Decryption: DAL only; never in API response without explicit RBAC check
```

> [!CAUTION]
> The `APP_ENCRYPTION_KEY` must never be committed to version control. It is loaded only via `process.env.APP_ENCRYPTION_KEY`. All seeds and tests use a deterministic test key from `TEST_ENCRYPTION_KEY` env var.

### Content Security Policy

CSP headers set in `next.config.ts` via `headers()`:
- `default-src 'self'`
- `script-src 'self' 'nonce-{nonce}'` (nonce injected by middleware)
- `connect-src 'self'`
- `img-src 'self' data:`

### Rate Limiting

- Applied in middleware using in-memory sliding window (LRU cache, `lru-cache` package)
- `/api/auth/*` → 10 req/min per IP
- `/api/executive/documents/upload` → 5 req/min per user
- All other API routes → 60 req/min per user

### File Upload Security

```
Client:
  - Extension allowlist check (UI hint only)
  - Max size: 10 MB

Server (route handler):
  1. Content-Length header check (reject > 10 MB)
  2. Stream to temp buffer (never to disk until validated)
  3. `file-type` magic-byte inspection → reject if MIME mismatch
  4. Extension vs. detected MIME cross-check
  5. SHA-256 checksum computation
  6. Move to non-public /uploads/{executiveId}/{uuid}.{ext}
  7. Store storagePath (never exposed to client)
  8. Emit AuditLog entry: DOCUMENT_UPLOAD
```

---

## 10. Vetting Finite State Machine

```
              ┌──────────┐
              │  DRAFT   │  (Executive is filling wizard)
              └────┬─────┘
                   │ Executive submits (all steps complete)
                   ▼
            ┌────────────┐
            │ SUBMITTED  │  (Locked for executive editing)
            └─────┬──────┘
                  │ Consultant opens review
                  ▼
          ┌──────────────┐
          │ UNDER_REVIEW │
          └───┬──────┬───┘
              │      │
  Consultant  │      │  Consultant requests
  verifies    │      │  more information
              │      ▼
              │  ┌────────────────────┐
              │  │ MORE_INFO_REQUIRED │ ◄──── Executive re-submits
              │  └────────────────────┘       (→ SUBMITTED)
              │      │
              │      │ (resolved via re-submit)
              ▼      
       ┌──────────┐  ┌──────────┐
       │ VERIFIED │  │ REJECTED │
       └──────────┘  └──────────┘
```

### Transition Rules (enforced in `src/lib/fsm/vettingFsm.ts`)

| From | To | Actor | Required Field |
|---|---|---|---|
| DRAFT | SUBMITTED | EXECUTIVE | All wizard steps validated |
| SUBMITTED | UNDER_REVIEW | CONSULTANT | — |
| UNDER_REVIEW | MORE_INFO_REQUIRED | CONSULTANT | `reviewerNote` (non-empty) |
| UNDER_REVIEW | VERIFIED | CONSULTANT | — |
| UNDER_REVIEW | REJECTED | CONSULTANT | `reviewerNote` (non-empty) |
| MORE_INFO_REQUIRED | SUBMITTED | EXECUTIVE | — |

**Every transition:** emits an `AuditLog` entry with `action: 'FSM_TRANSITION'`, `metadataDiff: { from, to, note? }`.

---

## 11. Audit Trail Design

### Hash-Chain Algorithm

```
GENESIS:
  prevHash = "0000000000000000000000000000000000000000000000000000000000000000"

EACH ENTRY:
  canonicalPayload = JSON.stringify({
    sequence, actorId, actorRole, action,
    targetType, targetId, metadataDiff, createdAt
  }, null, 0)  // deterministic, no extra whitespace

  entryHash = SHA256(prevHash + canonicalPayload)
```

### Integrity Verification Endpoint

`GET /api/admin/audit/verify`  
- Streams all `AuditLog` rows ordered by `sequence ASC`
- Recomputes `entryHash` for each row
- Compares with stored `entryHash`
- Returns `{ valid: boolean, firstTamperedSequence?: number, totalChecked: number }`

### UI

- Admin audit log page: `react-window` `FixedSizeList` + slide-over drawer for full entry detail
- Integrity status badge: 🔐 **Chain Intact** (green) / ⚠️ **Tampered at #N** (red)

---

## 12. Consent & Privacy (NDPA 2023)

### Consent Model

- **Granular:** Separate boolean for `dataProcessConsent` (mandatory) and `marketingConsent` (optional)
- **Versioned:** `consentVersion` field (e.g. `"2024-01-v1"`) stored at grant time; future policy changes trigger re-consent modal on next login
- **Timestamped:** `consentGrantedAt`, `consentWithdrawnAt`
- **Withdrawal:** Executive can withdraw via Privacy Center → triggers `VettingStatus` freeze + AuditLog entry

### Privacy Center (Executive)

| Feature | Implementation |
|---|---|
| View my data | Decrypts and displays own PII fields |
| Export my data | `/api/admin/export?userId=self` → JSON/CSV download |
| Withdraw consent | Soft-delete PII fields (set to `[WITHDRAWN]` placeholder) + freeze vetting |
| Manage marketing consent | Toggle, persisted immediately |

### PII Reveal Audit

Every time a user (including the executive themselves) requests decryption of a PII field:
1. DAL decrypts value
2. AuditLog entry: `action: 'PII_REVEAL', metadataDiff: { field, requestedBy }`
3. UI shows masked value by default (`••••••••`); "Reveal" button triggers server round-trip

---

## 13. Document Upload Pipeline

```
Client (multipart/form-data)
  → POST /api/executive/documents/upload
      ├── Auth + RBAC (EXECUTIVE role, own executiveId)
      ├── Rate limit check
      ├── Content-Length guard (> 10MB → 413)
      ├── Parse multipart stream (no full file in memory)
      ├── file-type magic byte check
      ├── Extension / MIME allowlist cross-validation
      ├── SHA-256 checksum (streaming)
      ├── Write to /uploads/{executiveId}/{uuid}{.ext}
      ├── Prisma: Create Document record
      └── AuditLog: DOCUMENT_UPLOAD

Download (consultant / admin only)
  GET /api/executive/documents/{documentId}/download
      ├── Auth + RBAC (CONSULTANT | ADMINISTRATOR)
      ├── DAL: assertRolePermission('DOWNLOAD_DOCUMENT')
      ├── AuditLog: DOCUMENT_DOWNLOAD
      └── Stream file from storagePath (never expose path)
```

**Allowed MIME types:**

| Extension | Expected MIME |
|---|---|
| `.pdf` | `application/pdf` |
| `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `.jpg` / `.jpeg` | `image/jpeg` |
| `.png` | `image/png` |

---

## 14. Offline & Push Notification Architecture

### Service Worker (`public/sw.js`)

```
Events handled:
  install    → pre-cache app shell routes
  activate   → clean old caches
  fetch      → network-first for API, cache-first for static assets
  push       → show notification (title, body, icon, badge)
  notificationclick → focus or open portal tab
```

### Offline Sync Flow

```
Executive goes offline
  → Zustand `useOnboardingDraftStore` captures all field changes in IndexedDB
  → TanStack Query mutations enqueue in paused queue (stored in persisted QueryClient)

Executive comes back online (useOfflineStatus hook fires)
  → Drain paused mutation queue (FIFO)
  → Each mutation carries X-Idempotency-Key (UUID stored in draft)
  → Server: idempotency check → if key already processed, return cached result
  → On 409 version conflict: surface ConflictResolutionDialog (client vs server state diff)
```

### Push Notification Triggers

| Event | Trigger | Recipient |
|---|---|---|
| Application submitted | FSM: DRAFT → SUBMITTED | Consultant (all active) |
| Under review | FSM: SUBMITTED → UNDER_REVIEW | Executive |
| More info required | FSM: UNDER_REVIEW → MORE_INFO_REQUIRED | Executive |
| Verified | FSM: ANY → VERIFIED | Executive |
| Rejected | FSM: ANY → REJECTED | Executive |

---

## 15. Testing Invariants

### Coverage Requirements

| Area | Tool | Min Coverage |
|---|---|---|
| Zod validation schemas | Vitest | 100% |
| FSM transitions | Vitest | 100% all valid + all invalid paths |
| DAL `assertRolePermission` | Vitest | 100% per-permission per-role |
| AuditLog hash chain | Vitest | 100% (valid chain, single tamper, multi-tamper) |
| Encryption helpers | Vitest | 100% (encrypt-decrypt roundtrip, bad key rejection) |
| RTL: Onboarding wizard | RTL + Vitest | All 6 steps, offline save, resume |
| RTL: Vetting queue | RTL + Vitest | Filter, sort, FSM transition buttons, RBAC guards |
| RTL: Audit log | RTL + Vitest | Virtualised render, drawer open, verify badge |
| RTL: Privacy Center | RTL + Vitest | PII reveal audit, consent withdraw |

### Storybook Requirements

Every component in `src/components/` that is user-visible must have a `.stories.tsx` file covering:
- `Default` (light theme)
- `Dark` (dark theme via decorator)
- `Empty` / `Loading` / `Error` states where applicable
- Role-variant states where RBAC affects rendering

### Synthetic Data Invariant

> [!CAUTION]
> **ZERO real personal or corporate data** may exist anywhere in the repository — including seeds, fixtures, Storybook stories, test files, README examples, screenshots, and commit messages. All data must be generated from the `@faker-js/faker` library with `faker.seed(42)` for reproducibility.

---

## 16. Deployment & Runtime

### Local Dev (zero-friction)

```bash
git clone ... && cd risktech
cp .env.example .env.local         # fill APP_ENCRYPTION_KEY, NEXTAUTH_SECRET, VAPID keys
npm install
npx prisma db push
npx prisma db seed
npm run dev                        # http://localhost:3000
```

### Environment Variables (`.env.example`)

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=""                 # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
APP_ENCRYPTION_KEY=""              # openssl rand -hex 32
VAPID_PUBLIC_KEY=""                # npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT="mailto:admin@example.com"
```

### Production Considerations (documented, not implemented in PoC)

- Swap `DATABASE_URL` to PostgreSQL connection string
- Serve `/uploads` from a private Cloud Storage bucket behind signed URLs
- Replace in-memory rate limiter with Redis-backed `@upstash/ratelimit`
- Use Vault / GCP Secret Manager for `APP_ENCRYPTION_KEY` and `VAPID_PRIVATE_KEY`

---

## 17. Architectural Trade-off Log

| Decision | Chosen | Alternative Considered | Reason |
|---|---|---|---|
| SQLite in dev | SQLite (Prisma) | PostgreSQL everywhere | Zero-friction local dev; single env var swap for prod |
| In-memory rate limiting | `lru-cache` sliding window | Redis / Upstash | PoC scope; documented upgrade path |
| Credentials auth | NextAuth Credentials | OAuth / SSO | PoC portability; TOTP MFA stretch adds security layer |
| Local file storage | `fs` to `/uploads/` | S3 / GCS | PoC scope; storage path never exposed to client |
| AES-256-GCM via Node crypto | Built-in `crypto` module | `libsodium` | Zero extra deps; FIPS-compliant algorithm |
| JWT sessions | Stateless JWT | Database sessions | Edge middleware compatibility; acceptable for PoC scale |
| react-window FixedSizeList | Fixed row height + drawer | react-virtual / masonry | Simpler, proven 60fps; variable content in slide-over |
| SQLite append-only audit log | Prisma + sequence constraint | Dedicated immutable ledger | PoC scope; integrity enforced via hash chain |

---

*End of Architecture Specification v1.0.0*
