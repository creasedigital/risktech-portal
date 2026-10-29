# Presentation Runbook & Live Demonstration Script
## RiskTech & Advisory · Executive Onboarding & Vetting Portal

**Target Audience:** RiskTech & Advisory Executive Committee, Chief Risk Officer, and Lead Technical Evaluators  
**Scheduled Duration:** 30 Minutes (20 min presentation & demo + 10 min technical Q&A defense)  
**Presenter:** Lead Software Architect & Full-Stack Engineering Lead  
**Document Status:** Approved for Technical Review (Submitted $\ge$ 1 Hour Prior to Review)  

---

## Presentation Agenda & Timing Breakdown

| Segment | Time Allocation | Key Objectives |
|---|---|---|
| **Part 1: Problem Framing & GRC Mandate** | 00:00 – 05:00 (5 min) | The institutional challenge: Why executive vetting requires privacy-by-design, NDPA 2023 alignment, and immutable auditability. |
| **Part 2: End-to-End Live Demonstration** | 05:00 – 15:00 (10 min) | Live system walkthrough across all 3 personas: Executive onboarding, offline sync, document upload, consultant virtualized queue, and admin hash-chain verification. |
| **Part 3: Architecture, Trade-Offs & Invariants** | 15:00 – 20:00 (5 min) | Defending key choices: Zustand vs. TanStack Query boundary, `react-window` 60fps rendering, AES-256-GCM encryption, and intentional PoC scope exclusions. |
| **Part 4: Production Roadmap & Next Horizons** | 20:00 – 25:00 (5 min) | What comes next: BoardSeats integration bridge, WebAuthn FIDO2 keys, automated sanctions/KYC screening, and candidate-brief matching. |
| **Part 5: Technical Defense & Anticipated Q&A** | 25:00 – 30:00 (5 min) | Pre-prepared answers to institutional security, privacy, and architectural questions. |

---

## Part 1: Problem Framing & GRC Mandate (00:00 – 05:00)

### Spoken Talking Points:
> *"Good morning, members of the executive committee. RiskTech & Advisory operates in the highest echelons of corporate governance and risk management. When we present an independent director, a Chief Risk Officer, or an Audit Committee Chair to a sovereign wealth fund or banking conglomerate, our institutional credibility is on the line.*
> 
> *Historically, executive search firms manage candidate profiles through fragmented spreadsheets, email attachments, and unencrypted files. That model exposes firms to severe regulatory liability under the Nigeria Data Protection Act (NDPA) 2023 and creates blind spots where candidate credentials cannot be independently audited.*
> 
> *Today, we present the **Executive Onboarding & Vetting Portal**—the foundational module of RiskTech's new digital governance platform. We built this platform under three non-negotiable principles:  
> 1. **Privacy-by-Design**: Explicit, versioned NDPA consent and AES-256-GCM field encryption at rest.  
> 2. **Controlled Workflows**: Deterministic finite state machine transitions with mandatory consultant rationale.  
> 3. **Mathematical Auditing**: Cryptographic SHA-256 hash chaining that guarantees tamper-evident immutability.*
> 
> *Let us examine the platform live in action."*

---

## Part 2: End-to-End Live Demonstration Script (05:00 – 15:00)

### Scene 1: Executive Onboarding & NDPA 2023 Consent Capture (05:00 – 07:00)
- **Persona**: Alice Okafor (`alice.okafor@synthetic-risktech.internal`, password `Passcode123!`).
- **Action**:
  1. Open browser to `http://localhost:3000`.
  2. Point out the GRC Dark Mode toggle in the top bar: toggle it between Light and Dark to demonstrate instantaneous theme switching with zero page flash or hydration warning.
  3. Navigate to `/executive/onboarding`.
  4. **Step 1 (Consent)**: Highlight the explicit NDPA notice and the active policy version identifier (`2024-01-v1`).
  5. Show that the form enforces statutory compliance: attempting to proceed without checking `dataProcessConsent` triggers an inline Zod validation block. Check the box and proceed to Step 2.
  6. **Step 2 (Profile)**: Display fields for Full Name, Phone, Nationality, Current Title, and Organisation. Emphasize that these fields are encrypted at rest via AES-256-GCM before writing to the database.

### Scene 2: Offline Resilience & Reconnection Sync (07:00 – 09:00)
- **Action**:
  1. Advance to Step 3 (Board Experience).
  2. Open Chrome DevTools (`F12`), navigate to the **Network** tab, and toggle the throttling dropdown from **No Throttling** to **Offline**.
  3. Point out the amber **Offline Mode** banner that appears immediately at the top of the interface.
  4. Continue typing into the board positions fields (e.g. adding *"Sahara Sovereign Capital · Chair of Audit Committee"*).
  5. Open DevTools **Application** tab $\rightarrow$ **IndexedDB** $\rightarrow$ `risktech-onboarding-draft`. Show the evaluators that every keystroke is preserved safely in local client storage (`idb-keyval`).
  6. Refresh the browser page while still in Offline Mode: the form reloads with all entered data intact!
  7. Switch the DevTools network back to **Online**: the offline banner clears, TanStack Query flushes the queued mutation with its `X-Idempotency-Key` header, and the server acknowledges draft synchronization.

### Scene 3: Secure Document Upload & Magic-Byte Validation (09:00 – 10:30)
- **Action**:
  1. Advance to Step 6 (Document Vault).
  2. Explain the security threat: Attackers frequently rename executable binaries or malicious scripts (`exploit.sh` or `malware.exe`) to `my_cv.pdf` to bypass standard browser extension filters.
  3. **Live Demonstration of Security Guard**:
     - Attempt to upload a spoofed file where a text script is renamed to `.pdf`.
     - The server rejects the upload immediately with HTTP 415 (*"Invalid file signature: Content does not match genuine PDF magic-byte header `0x25 0x50 0x44 0x46`"*).
     - Upload a genuine synthetic PDF document. The server computes a SHA-256 cryptographic checksum, logs the upload event, and moves the file to private, non-public storage.
  4. Click **"Submit Application"**. The profile locks, and the candidate's vetting status transitions from `DRAFT` to `SUBMITTED`.

### Scene 4: Consultant Queue & Virtualized 60fps Review (10:30 – 12:30)
- **Persona**: Ben Adeyemi (`ben.adeyemi@synthetic-risktech.internal`, password `Passcode123!`).
- **Action**:
  1. Open `/consultant/queue`.
  2. Highlight the list performance: We have seeded **1,000 synthetic African governance records**. Demonstrate rapid, continuous scrolling—explain that `react-window` keeps exactly 12–15 DOM nodes rendered in the viewport, ensuring zero frame drops or browser memory spikes.
  3. Filter the queue by status (`SUBMITTED`) and search for candidate *"Alice Okafor"*.
  4. Click the row to open the **Slide-Over Inspection Drawer**.
  5. Demonstrate the FSM guards:
     - The transition buttons display valid options: `Start Review`, `Request More Information`, `Verify Candidate`, or `Reject`.
     - Attempt to click `Reject` without entering a note: the system blocks the transition, enforcing institutional policy that rejections and information requests require detailed reviewer rationale.
  6. Enter the note: *"Verified board tenure and confirmed references with Lagos Business School"* and click **Verify Candidate**.
  7. The candidate status updates optimistically to `VERIFIED` with an emerald badge, and the action triggers a Web Push notification to the executive.

### Scene 5: Administrator Audit Ledger & Cryptographic Integrity Check (12:30 – 15:00)
- **Persona**: Carol Mensah (`carol.mensah@synthetic-risktech.internal`, password `Passcode123!`).
- **Action**:
  1. Navigate to `/admin/audit-log`.
  2. Point out the virtualized audit trail detailing every sequence, actor ID, action type, target ID, and timestamp.
  3. Explain the SHA-256 hash chaining: Each row's `entryHash` is computed over the previous entry's hash combined with the canonical serialized payload.
  4. Click the **"Verify Chain Integrity"** button in the top right.
  5. The system iterates through the entire ledger, verifying thousands of cryptographic links in under 50 milliseconds, and displays a green verified badge: **"🔐 Chain Intact — 100% Cryptographic Verification"**.
  6. Explain the defense: If a rogue database administrator attempted to alter an applicant's vetting status directly via SQL, the hash chain would immediately break, pinpointing the exact sequence number of unauthorized modification.

---

## Part 3: Architecture, Trade-Offs & Invariants (15:00 – 20:00)

### Spoken Talking Points:
> *"Behind this interface lies a disciplined, defensive software architecture:
> 
> *First, **State Separation**: We established a strict boundary between Zustand and TanStack Query. Zustand exclusively handles local client state—such as our persisted Dark Mode toggle and IndexedDB offline drafts. TanStack Query owns server state, optimistic updates, and idempotency keying. Server entities are never duplicated into global client stores.*
> 
> *Second, **60fps Virtualization**: Many enterprise applications become unusable when loaded with 1,000+ candidates. By pairing `react-window` fixed-size row virtualization with slide-over drawers for variable-height details, our memory footprint remains identical whether viewing 10 candidates or 50,000 candidates.*
> 
> *Third, **Intentional PoC Scope Boundaries**: We intentionally kept this onboarding portal decoupled from BoardSeats. BoardSeats is live in production; rebuilding it or coupling databases would introduce unacceptable regression risk. Furthermore, by utilizing SQLite with native JSON arrays and local non-public document storage, any evaluator can clone this repository, run `pnpm install`, and launch the entire enterprise application in 30 seconds with zero cloud friction."*

---

## Part 4: Production Roadmap & Next Horizons (20:00 – 25:00)

| Phase | Milestone | Technical Scope & Deliverables |
|---|---|---|
| **Roadmap Phase 1** | **BoardSeats Integration Bridge** | Implement an authorized API Gateway contract using OAuth 2.0 / mTLS to sync vetted executives from the portal directly into BoardSeats committee rosters upon `VERIFIED` status. |
| **Roadmap Phase 2** | **Hardware WebAuthn MFA** | Upgrade consultant and administrator authentication from TOTP authenticator apps to FIDO2 WebAuthn hardware security keys (e.g., YubiKey) to eliminate credential phishing risks. |
| **Roadmap Phase 3** | **Automated KYC & Sanctions Ingress** | Integrate automated screening against UN, OFAC, and Pan-African PEP (Politically Exposed Persons) databases directly into the FSM `UNDER_REVIEW` pipeline. |
| **Roadmap Phase 4** | **AI Role-Brief Semantic Matching** | Vectorize verified board experience and sector credentials to deliver semantic similarity matching against incoming corporate board briefs. |

---

## Part 5: Technical Defense & Anticipated Q&A (25:00 – 30:00)

### Question 1: "Why did you implement cryptographic hash chaining inside SQLite/PostgreSQL instead of using a public blockchain?"
**Defensive Answer**:  
> *"Using a public blockchain for institutional candidate vetting introduces severe compliance and privacy vulnerabilities. Under NDPA 2023 Section 34, candidates retain the statutory 'Right to Erasure'. Public blockchains are immutable by nature, making legal compliance with data deletion impossible once data or hashes referencing individuals are committed on-chain. Furthermore, public blockchains introduce transaction latency, gas fee volatility, and external third-party risks. Our internal SHA-256 hash chaining provides mathematical proof of immutability within our own controlled infrastructure, while allowing our Data Access Layer to support audited redaction and GDPR/NDPA erasure requests without breaking system integrity."*

### Question 2: "How does the system prevent a compromised client from submitting fake vetting approvals?"
**Defensive Answer**:  
> *"The frontend UI guards (`<RoleGuard>`) are purely cosmetic ergonomic aids. The actual security boundary is enforced at two distinct server layers: First, Next.js Middleware inspects encrypted session cookies and denies route entry to unauthorized roles. Second, every single Route Handler and Server Action invokes the Data Access Layer's `assertRolePermission(session, 'VET_CANDIDATE')`. If an executive crafts a curl request to POST `/api/consultant/vetting`, the DAL inspects the server-verified JWT role, throws a `ForbiddenError`, and immediately returns HTTP 403 Forbidden."*

### Question 3: "Why did you choose AES-256-GCM over traditional database encryption (TDE)?"
**Defensive Answer**:  
> *"Transparent Database Encryption (TDE) encrypts data on the physical disk block level, but once data is read into memory by the SQL server, any database user or process with database read access sees raw plaintext. By implementing application-level AES-256-GCM encryption in our Data Access Layer using Node's native `crypto` module, sensitive PII—such as executive phone numbers, national identification, and referee contacts—remains encrypted across the entire database engine, connection cables, and database backup dumps. Even a compromised database snapshot contains zero readable PII."*

### Question 4: "How does the application prevent duplicate submissions when an executive reconnects from offline mode?"
**Defensive Answer**:  
> *"When the executive fills out the wizard while offline, the Zustand draft store generates a unique UUIDv4 `X-Idempotency-Key` for each mutation and attaches the entity's current `version` integer. Upon reconnection, TanStack Query flushes mutations in strict FIFO order. The server-side route handler verifies the idempotency key in an atomic transaction; if the request was already committed, it returns the cached acknowledgment without duplicating records. Furthermore, if another user updated the profile while the candidate was offline, the version number mismatch triggers an HTTP 409 Conflict, prompting our Conflict Resolution modal rather than blindly overwriting data."*

---

*Presentation Runbook Approved for Live Demonstration · RiskTech & Advisory*
