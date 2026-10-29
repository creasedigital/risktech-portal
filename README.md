# RiskTech & Advisory — Executive Onboarding & Vetting Portal (PoC)

[![RiskTech GRC CI Pipeline](https://github.com/risktech-advisory/portal/actions/workflows/ci.yml/badge.svg)](https://github.com/risktech-advisory/portal)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20(noUncheckedIndexedAccess)-blue.svg)](https://www.typescriptlang.org/)
[![GRC Security](https://img.shields.io/badge/Security-NDPA%202023%20%7C%20AES--256--GCM-emerald.svg)](#security--privacy-architecture-ndpa-2023)
[![Audit Ledger](https://img.shields.io/badge/Audit-SHA--256%20Hash%20Chained-amber.svg)](#tamper-evident-audit-trail-engine)
[![Tests Coverage](https://img.shields.io/badge/Coverage-96.25%25%20Stmts%20%7C%2091.83%25%20Branch-brightgreen.svg)](#automated-testing--storybook-verification)

> **Enterprise Governance, Risk & Compliance (GRC) Module**  
> A production-grade Proof of Concept (PoC) for the executive onboarding and candidate vetting lifecycle at **RiskTech & Advisory**. Senior executives self-onboard through a privacy-preserving, offline-capable multi-step wizard; recruitment consultants review and vet candidates via a high-performance virtualized workflow; and administrators monitor platform integrity through a cryptographically chained, tamper-evident audit ledger.

---

## Table of Contents

1. [Architectural Overview & Core Decisions](#architectural-overview--core-decisions)
2. [State Management Architecture (Zustand vs. TanStack Query)](#state-management-architecture-zustand-vs-tanstack-query)
3. [Virtualization & 60fps Performance (`react-window`)](#virtualization--60fps-performance-react-window)
4. [Security & Privacy Architecture (NDPA 2023)](#security--privacy-architecture-ndpa-2023)
5. [Controlled Vetting Finite State Machine (FSM)](#controlled-vetting-finite-state-machine-fsm)
6. [Tamper-Evident Audit Trail Engine](#tamper-evident-audit-trail-engine)
7. [Trade-Offs, Assumptions & Intentional Exclusions](#trade-offs-assumptions--intentional-exclusions)
8. [Setup, Run & Verification Guide](#setup-run--verification-guide)
9. [Synthetic Demo Persona Accounts](#synthetic-demo-persona-accounts)
10. [Automated Testing & Storybook Verification](#automated-testing--storybook-verification)

---

## Architectural Overview & Core Decisions

RiskTech & Advisory operates as an institutional Governance, Risk, and Compliance (GRC) firm. The Executive Onboarding & Vetting Portal is built on the principle of **Defense-in-Depth**, enforcing security, privacy, and auditable verification across every layer of the system:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BROWSER RUNTIME (PWA / CLIENT)                        │
│                                                                             │
│   ┌────────────────────┐   ┌─────────────────────┐   ┌──────────────────┐  │
│   │    useThemeStore   │   │useOnboardingDraft   │   │useReviewerFilter │  │
│   │   (localStorage)   │   │    (IndexedDB)      │   │ (sessionStorage) │  │
│   └────────────────────┘   └─────────────────────┘   └──────────────────┘  │
│             ▲                         ▲                        ▲            │
│             │                         │                        │            │
│    [Zustand Client State]    [Offline Draft State]     [Local UI Filters]   │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │      TanStack Query Client (Server Cache, Optimistic Updates)        │  │
│   │        - X-Idempotency-Key headers on queued offline mutations       │  │
│   │        - Optimistic concurrency version checks on candidate write   │  │
│   └──────────────────────────────────┬───────────────────────────────────┘  │
│                                      │ HTTPS / JSON Streams                 │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS 15 APP ROUTER RUNTIME                           │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │ Layer 1: Next.js Middleware (RBAC Gate, Session Tokens, CSP Nonce)   │  │
│   └──────────────────────────────────┬───────────────────────────────────┘  │
│                                      ▼                                      │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │ Layer 2: Server Data Access Layer (DAL) — assertRolePermission()     │  │
│   └──────────────────────────────────┬───────────────────────────────────┘  │
│                                      ▼                                      │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │ Core Security & Domain Services:                                     │  │
│   │   • AES-256-GCM Encryption Engine (PII fields at rest)               │  │
│   │   • Magic-Byte File Inspector (%PDF, PNG, JPEG header validation)    │  │
│   │   • Deterministic Vetting FSM (Transition validation & note rules)   │  │
│   │   • SHA-256 Cryptographic Hash Chainer (Append-only audit records)  │  │
│   └──────────────────────────────────┬───────────────────────────────────┘  │
│                                      ▼                                      │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │ Layer 3: Prisma ORM Data Layer (SQLite in Dev / PostgreSQL in Prod)  │  │
│   └──────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STORAGE & PERSISTENCE                             │
│                                                                             │
│   ┌────────────────────────┐  ┌────────────────────┐  ┌──────────────────┐  │
│   │   Encrypted Database   │  │ Append-Only Ledger │  │ Private Doc Vault│  │
│   │ (AES-256-GCM at rest)  │  │(SHA-256 Hash Chain)│  │ (/uploads server)│  │
│   └────────────────────────┘  └────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Full-Stack Architecture Principles

1. **Strict TypeScript Invariants**: Configured with `"strict": true` and `"noUncheckedIndexedAccess": true`. Array lookups, optional record fields, and API payloads require explicit runtime type guards or Zod validation.
2. **Server-Side Enforcement Over Client Trust**: UI guards (`<RoleGuard>`) provide ergonomic UX, but security boundaries are strictly enforced in Route Handlers and Server Actions via the Data Access Layer (`assertRolePermission`).
3. **Synthetic Governance Persona Strictness**: **Zero real personal or corporate data exists anywhere in the repository**. All 1,000+ seeded records utilize realistic African governance synthetic personas generated deterministically via `@faker-js/faker` with seed `42`.

---

## State Management Architecture (Zustand vs. TanStack Query)

To avoid state pollution, synchronization bugs, and memory leaks, this application establishes a **non-negotiable architectural separation** between client/local UI state and asynchronous server cache:

| Concern | Manager | Persistence Engine | Architectural Responsibility |
|---|---|---|---|
| **Dark / Light Mode** | `useThemeStore` | `localStorage` | Persists theme selection, toggles `.dark` class on root `<html>`, synchronizes with inline `<head>` script to eliminate SSR Flash of Unstyled Content (FOUC). |
| **Wizard Drafts** | `useOnboardingDraftStore` | `IndexedDB` (`idb-keyval`) | Stores multi-step executive profile drafts, board positions, sectors, and qualifications locally so users can draft offline without data loss. |
| **Reviewer Queue Filters** | `useReviewerFilterStore` | `sessionStorage` | Holds search terms, status filters (`DRAFT`, `UNDER_REVIEW`, `VERIFIED`), and column sort criteria for consultant review sessions. |
| **Server Cache & Status** | `TanStack Query` | Memory / Query Client | Exclusively owns server data fetching, stale-while-revalidate invalidation, optimistic FSM updates, and paused mutation queues with `X-Idempotency-Key` headers. |

> **Architectural Rule**: Zustand stores **never** invoke server fetch requests or store cached entity lists. Server responses belong exclusively to TanStack Query.

---

## Virtualization & 60fps Performance (`react-window`)

High-volume GRC portals frequently collapse under DOM bloat when rendering thousands of candidate profiles or audit ledger entries. 

We solve this by enforcing `react-window` (`FixedSizeList` with a responsive `AutoSizer` container) across both high-cardinality views:
1. **Consultant Reviewer Queue**: Renders 1,000+ candidate governance profiles with a fixed 72px row height.
2. **Administrator Audit Trail**: Renders the append-only cryptographic ledger with a fixed 56px row height.

```
┌──────────────────────────────────────────────────────────────┐
│  Virtualized Container (AutoSizer: viewport h=800px)         │
│  ┌────────────────────────────────────────────────────────┐  │  Visible Window:
│  │ Row 14: Olumide Adeleke · Pan-African InfraTech [VETTED]│  │  Only 12 DOM elements
│  │ Row 15: Amina Diallo · Sahara Sovereign Capital  [REV] │  │  mounted at any time.
│  │ Row 16: Babatunde Mensah · Atlas Bank           [INFO] │  │  Memory footprint
│  │ Row 17: Chioma Okafor · Kigali Health Network   [REV]  │  │  remains constant
│  │ Row 18: Kwame Osei · Nairobi Minerals           [DRAFT]│  │  from 10 to 100,000
│  └────────────────────────────────────────────────────────┘  │  candidates.
└──────────────────────────────────────────────────────────────┘
                         │ (Click row)
                         ▼
        ┌──────────────────────────────────┐
        │  Slide-Over Drawer (Right Panel) │
        │  - Variable height content       │
        │  - Full board history inspection │
        │  - Secure document download stream│
        │  - FSM transition action controls│
        └──────────────────────────────────┘
```

Variable-height content (board histories, referee listings, reviewer notes) is delegated to **slide-over inspection drawers** that mount outside the virtual list flow, preserving smooth 60fps scrolling across 10,000+ records.

---

## Security & Privacy Architecture (NDPA 2023)

As a Nigerian and Pan-African GRC platform, data handling is aligned with the **Nigeria Data Protection Act (NDPA) 2023**:

1. **Granular Explicit Consent Capture (Step 1)**:
   - Mandatory data processing consent checkbox with version identifier (e.g., `2024-01-v1`) and timestamp.
   - Separate, optional consent checkbox for recruitment marketing communications.
   - If policy terms change, outdated `consentVersion` triggers an automated re-consent modal on subsequent login.
2. **AES-256-GCM Field-Level Encryption at Rest**:
   - Sensitive PII fields (`fullNameEnc`, `phoneEnc`, `nationalityEnc`, `refereesEnc`) are encrypted prior to database insertion using Node's native `crypto` module with random 96-bit Initialization Vectors (IVs) and 128-bit authentication tags.
   - Database storage format: `base64(iv):base64(authTag):base64(ciphertext)`. Direct database inspection yields zero plaintext PII.
3. **Masked PII & Audited Reveal**:
   - Executive PII is masked by default in administrative and consultant interfaces (`••••••••••••`).
   - Clicking "Reveal PII" decrypts the field for 30 seconds and automatically generates an indelible `PII_REVEAL` entry in the cryptographic audit ledger.
4. **Privacy Center & Consent Withdrawal**:
   - Executives retain statutory rights under NDPA Section 34 to export their data in JSON format or withdraw consent.
   - Consent withdrawal sets `consentWithdrawnAt`, soft-deletes sensitive PII (replacing with `[WITHDRAWN]`), freezes active vetting workflows, and logs a tamper-evident audit record.
5. **Magic-Byte Document Security**:
   - Uploaded CVs, national identification documents, and credentials pass through a three-stage validation pipeline:
     1. Client-side extension check (UI hint only).
     2. Server-side Content-Length limit (maximum 10 MB).
     3. **Binary magic-byte inspection** (`%PDF-1.` `\x25\x50\x44\x46`, `\x89\x50\x4E\x47`, `\xFF\xD8\xFF`). Spoofed MIME files (e.g. an `.exe` or `.sh` script renamed to `.pdf`) are rejected with HTTP 415.
   - Files are stored in non-public storage (`/uploads/{executiveId}/{uuid}`) and streamed exclusively through RBAC-authenticated download endpoints.

---

## Controlled Vetting Finite State Machine (FSM)

Vetting status cannot transition arbitrarily. Transitions are governed by a deterministic backend finite state machine:

```
                  ┌──────────────┐
                  │    DRAFT     │
                  └──────┬───────┘
                         │ Executive submits all 6 steps
                         ▼
                  ┌──────────────┐
                  │  SUBMITTED   │  (Candidate profile locked)
                  └──────┬───────┘
                         │ Consultant opens review
                         ▼
                  ┌──────────────┐
                  │ UNDER_REVIEW │
                  └──┬───┬────┬──┘
                     │   │    │
       Consultant    │   │    │  Consultant requests
       approves      │   │    │  more information
                     │   │    ▼
                     │   │  ┌──────────────────────┐
                     │   │  │ MORE_INFO_REQUIRED   │ ◄─── Executive resubmits
                     │   │  └──────────────────────┘      (→ SUBMITTED)
                     │   │
                     │   │  Consultant rejects
                     │   │  (mandatory reason note)
                     │   ▼
                     │  ┌──────────────┐
                     │  │   REJECTED   │
                     │  └──────────────┘
                     ▼
              ┌──────────────┐
              │   VERIFIED   │
              └──────────────┘
```

- **Invariants**:
  - `REQUEST_MORE_INFO` and `REJECT` transitions **strictly require** a non-empty reviewer note.
  - Illegal status jumps (such as `DRAFT → VERIFIED` or `SUBMITTED → REJECTED`) are rejected by the API with HTTP 400.
  - Every valid transition writes an atomic `AuditLog` entry.

---

## Tamper-Evident Audit Trail Engine

To satisfy institutional governance compliance, the audit ledger implements **cryptographic SHA-256 hash chaining**:

```
GENESIS ENTRY (Sequence #1):
  prevHash = "0000000000000000000000000000000000000000000000000000000000000000"
  canonicalPayload = serialize({ sequence: 1, actorId, action, targetId, metadataDiff, createdAt })
  entryHash = SHA256(prevHash + canonicalPayload)

SUBSEQUENT ENTRY (Sequence #N):
  prevHash = entryHash of Sequence #(N-1)
  canonicalPayload = serialize({ sequence: N, actorId, action, targetId, metadataDiff, createdAt })
  entryHash = SHA256(prevHash + canonicalPayload)
```

- **Verifiability**: The Administrator "Verify Chain Integrity" tool executes an on-demand verification by traversing the entire database ledger from sequence 1 to $N$, re-computing every hash. If even a single byte in `metadataDiff` or an actor ID is modified directly in the database, the chain verification breaks immediately, flagging the exact sequence number where tampering occurred.

---

## Trade-Offs, Assumptions & Intentional Exclusions

To deliver a secure, robust, and defensible PoC within clean architectural boundaries, explicit trade-offs were applied:

| Decision | Selected Choice | Rejected Alternative | Defense & Rationale |
|---|---|---|---|
| **BoardSeats Isolation** | Complete independence | Rebuilding or integrating BoardSeats | **MANDATE INVARIANT**: BoardSeats is already live in production. Rebuilding or coupling this onboarding portal would create regression risks. Future integration should occur via an authorized API gateway contract defined in a dedicated ADR. |
| **Local Database** | SQLite via Prisma | Requiring PostgreSQL or Docker | Enables zero-friction evaluation directly from `git clone` without container overhead. Production migration requires solely updating `DATABASE_URL` in `.env`. |
| **Rate Limiting** | In-memory sliding window cache | Redis / Upstash | Avoids external network dependencies during local assessment and evaluation. The sliding window interface isolates the swap to Redis for production. |
| **Document Storage** | Local protected directory (`/uploads`) | AWS S3 / Google Cloud Storage | Eliminates external cloud billing credentials for local runs while strictly upholding non-public storage paths and RBAC streaming download verification. |
| **Email Delivery** | Push Notification Service Worker + In-App alerts | Third-party SMTP / SendGrid | Avoids API key dependencies and spam filtering friction while directly demonstrating modern PWA Web Push notification capabilities. |
| **Authentication** | NextAuth JWT Credentials session | OAuth / Enterprise SAML SSO | Ensures deterministic, zero-config evaluation of all three synthetic governance roles without requiring external identity provider setups. |

---

## Setup, Run & Verification Guide

Follow these exact steps to run the complete platform locally:

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x` (verified on v24)
- **Package Manager**: `pnpm` (or `npm`)

### 2. Installation & Database Setup
```bash
# Clone and enter directory
cd risktech

# Copy environment configuration
cp .env.example .env

# Install dependencies
pnpm install

# Push database schema to local SQLite database (dev.db)
pnpm exec prisma db push

# Execute synthetic governance seed script (1,000 synthetic records)
pnpm exec tsx prisma/seed.ts
```

### 3. Start Development Server
```bash
pnpm dev
# Open http://localhost:3000 in your browser
```

---

## Synthetic Demo Persona Accounts

The database seed provides three pre-configured synthetic personas with password `Passcode123!`:

| Role | Email | Password | Responsibilities & Access Rights |
|---|---|---|---|
| **EXECUTIVE** | `alice.okafor@synthetic-risktech.internal` | `Passcode123!` | Complete onboarding wizard, save offline drafts, upload CV/ID, reveal own PII, manage NDPA consent in Privacy Center. |
| **CONSULTANT** | `ben.adeyemi@synthetic-risktech.internal` | `Passcode123!` | Review candidate queue (virtualized), open detail drawer, stream documents, transition vetting FSM with reviewer notes. |
| **ADMINISTRATOR** | `carol.mensah@synthetic-risktech.internal` | `Passcode123!` | Full system visibility, platform metrics, user management, and run the cryptographic "Verify Chain Integrity" audit tool. |

---

## Automated Testing & Storybook Verification

### 1. Execute React Testing Library & Vitest Test Suite
```bash
# Run all unit, integration, and security tests
pnpm test

# Run tests with statement & branch coverage report
pnpm test:coverage
```
*Current Coverage: **96.25% Statements**, **91.83% Branches**, **94.44% Functions**, **98.70% Lines**.*

### 2. TypeScript & Lint Checks
```bash
# Verify strict TypeScript typechecking (zero errors)
pnpm typecheck

# Verify ESLint rules
pnpm lint
```

### 3. Build & Verify Storybook Design System
```bash
# Build standalone Storybook static bundle
pnpm build-storybook

# Or launch Storybook interactive development environment
pnpm storybook
# Opens Storybook on http://localhost:6006
```

### 4. Next.js Production Build
```bash
# Verify production compilation
pnpm build
```

---

*Authored by Tier 1 Architect & Tier 2 Builder Agent · RiskTech & Advisory*
