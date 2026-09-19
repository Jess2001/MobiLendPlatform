# Updated README

Here's the full README, updated to reflect exactly what's built through Day 5. The structure is preserved — I fixed factual inaccuracies (service name is `api` not `web`, apps live under `backend/apps/`, files not folders) and marked Phase 1 complete.

```markdown
# MobiLend

### Digital Lending Platform — Backend Engineering Project

**MobiLend** is a backend-focused digital lending platform built with **Python, Django REST Framework, and PostgreSQL**.

The project models the core backend architecture of a modern financial-services platform, with particular attention to **authentication, authorization, data integrity, security, concurrency, automated testing, and maintainable API design**.

> **Project status:** Active development
> **Current focus:** Lending domain (loan products, applications, credit decisions)
> **Completed:** Identity, authentication, authorization, customer management, backend foundations

---

## Why MobiLend?

Digital lending systems involve more than basic CRUD operations.

A production lending platform must handle sensitive customer information, strict authorization boundaries, financial data integrity, concurrent requests, state transitions, external payment services, and reliable transaction processing.

MobiLend is being built as a practical engineering project to explore those challenges through a realistic backend architecture.

The long-term workflow is:

```
Register
   ↓
Verify Account
   ↓
Complete Customer Profile / KYC
   ↓
Assess Eligibility
   ↓
Apply for Loan
   ↓
Credit Decision
   ↓
Loan Disbursement
   ↓
Repayments
   ↓
Balance & Transaction History
```

---

## Current Architecture

The project currently implements the identity, authentication, and customer-management foundation. The lending domain is next.

```
                         MobiLend API
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    Accounts               Customers              Core
        │                     │                     │
   ┌────┴─────┐        CustomerProfile    TimeStampedModel
   │          │                            NumberSequence
  User    VerificationCode                  Exception handler
   │
 JWT Auth
   │
   └──────────┬──────────────────────────────┐
              │                              │
         PostgreSQL                     Django Cache
                                            (throttling)
```

Each domain is being implemented with appropriate validation, authorization, transaction handling, and test coverage as it is added.

---

# Features

## Authentication & Identity

* Custom Django user model (no `username`; login by email or phone)
* Login with **email OR phone number** through a single field
* JWT authentication using Django REST Framework SimpleJWT
* Refresh-token rotation and blacklisting
* Account verification via 6-digit OTP
* OTP generation, delivery, expiration, and attempt limits
* OTP codes stored **hashed**, never as plaintext
* OTP reissue with invalidation of the previous code
* Password reset via OTP
* Password complexity validation (length, uppercase, lowercase, digit)
* Protection against account enumeration in both login and password recovery
* Rate limiting on login, verify, resend, and forgot-password endpoints
* Uniform error contract (`{detail, reason, retry_after_seconds}`) across auth endpoints

---

## Authorization & Security

MobiLend uses role-based authorization to control access to different areas of the platform.

Current roles include:

* Customer
* Partner Admin
* Credit Officer
* Operations
* Finance
* Superadmin

Authorization is enforced at the API level rather than relying on frontend visibility.

```
Frontend hides button
        ↓
        ❌ Not sufficient
        ↓
Backend permission check
        ↓
403 Forbidden
```

**Security patterns used:**

* Fail-closed defaults — new endpoints require authentication unless explicitly opened
* `IsVerifiedUser` gate — unverified users cannot access domain endpoints
* Least-privilege serializers — customer-facing views never return `national_id`, `monthly_income`, `monthly_expenses`, or `date_of_birth`
* Constant-time login — password-hash work runs even when the identifier doesn't exist, so response time can't leak account existence
* Neutral responses — password-recovery always returns the same 200 body whether or not the account exists

---

## Customer Management

Customer information is separated from the authentication identity.

### User

Responsible for identity and authentication information:

```
Email
Phone
Password
Role
Verification status (is_verified)
Account status (is_active)
```

### Customer Profile

Responsible for customer-domain information:

```
Customer number (auto-generated: CUS-2026-00001)
Personal information
Employment information
Address
Financial profile
```

This separation keeps authentication concerns independent from customer-domain data and provides a foundation for the future lending and KYC workflows.

---

## Data Integrity & Transactions

The project uses database-level constraints and atomic transactions where consistency between related records matters.

Customer registration creates three related records atomically:

```
Registration
     │
     ├── Create User
     ├── Create Customer Profile
     └── Create Verification Code + send OTP
              │
              ▼
        All succeed → COMMIT
        Any failure  → ROLLBACK
```

A failure creating the profile — or issuing the OTP — rolls back the entire registration. No orphaned users.

---

## Concurrency Handling

Customer identifiers are generated using:

* database transactions
* row-level locking (`select_for_update()`)
* unique database constraints

This prevents duplicate identifiers when multiple registration requests are processed concurrently. The design uses Django's `select_for_update()` together with the constraint rather than relying on application-level checks alone.

The same pattern will apply to loan numbers, application numbers, and payment references as the lending domain is built.

---

## Testing

Automated tests are written using:

* **pytest**
* **pytest-django**
* **factory_boy**

**Current coverage: 44 tests** across:

* User model (defaults, superuser creation, uniqueness)
* Registration (success, duplicate, escalation attempts, atomicity)
* Account verification (correct code, wrong code, expired, replay, unauthenticated)
* Login (email, phone, case-insensitive email, wrong password, unknown user, inactive user)
* Password reset (happy path, wrong code, unknown identifier, neutral responses)
* Rate limiting (per-endpoint throttles, retry-after header)
* Permission boundaries (all six roles, composite gates)
* Customer profile access (least privilege, ownership)
* Concurrency-sensitive customer-number generation

The goal is to test **business behaviour and failure cases**, not only successful API responses.

---

# API Reference

Endpoints currently live:

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/v1/auth/register/` | Anonymous | Creates User + Profile + OTP; returns `{user, tokens}` |
| POST | `/api/v1/auth/login/` | Anonymous (5/min) | Email **or** phone; returns `{user, tokens}` |
| POST | `/api/v1/auth/token/refresh/` | Anonymous | Rotating refresh tokens |
| POST | `/api/v1/auth/verify/` | Authenticated (10/min) | Submit 6-digit OTP |
| POST | `/api/v1/auth/verify/resend/` | Authenticated (3/min) | Issue a new OTP, invalidate previous |
| POST | `/api/v1/auth/password/forgot/` | Anonymous (3/min) | Neutral response, no enumeration |
| POST | `/api/v1/auth/password/reset/` | Anonymous | OTP + new password |
| GET | `/api/v1/auth/me/` | Authenticated | Current user |
| GET/PATCH | `/api/v1/customers/me/` | Authenticated | Least-privilege profile read/update |

**Error contract for auth failures:**

```json
{
  "detail": "Email/phone number or password is incorrect.",
  "reason": "invalid_credentials"
}
```

Reason codes in use: `invalid_credentials`, `account_inactive`, `wrong_code`, `expired`, `used`, `too_many_attempts`, `already_verified`, `invalid_or_expired`.

---

# Technology Stack

| Area                    | Technology              |
| ----------------------- | ----------------------- |
| Language                | Python 3.11             |
| Backend Framework       | Django 5.2              |
| API Framework           | Django REST Framework   |
| Authentication          | SimpleJWT               |
| Database                | PostgreSQL 17           |
| Cache (throttling)      | Django LocMemCache      |
| Testing                 | pytest / pytest-django  |
| Test Data               | factory_boy             |
| Containerization        | Docker / Docker Compose |
| Version Control         | Git / GitHub            |
| Development Environment | Linux / macOS           |

---

# Project Structure

```
MobiLend-backend/
│
├── backend/
│   │
│   ├── apps/
│   │   ├── accounts/
│   │   │   ├── models.py              # User, Role, VerificationCode
│   │   │   ├── managers.py            # UserManager
│   │   │   ├── serializers.py         # Register, Login, Verify, Forgot, Reset
│   │   │   ├── views.py               # Auth endpoints
│   │   │   ├── urls.py
│   │   │   ├── permissions.py         # HasRole + per-role classes + IsVerifiedUser
│   │   │   ├── otp.py                 # send_otp boundary (mock provider today)
│   │   │   ├── identifiers.py         # resolve_identifier (email or phone)
│   │   │   ├── validators.py          # ComplexityValidator
│   │   │   ├── factories.py           # UserFactory, VerificationCodeFactory
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── tests.py
│   │   │
│   │   ├── customers/
│   │   │   ├── models.py              # CustomerProfile
│   │   │   ├── serializers.py         # Self vs Staff serializers
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   ├── factories.py           # CustomerProfileFactory
│   │   │   ├── migrations/
│   │   │   └── tests.py
│   │   │
│   │   └── core/
│   │       ├── models.py              # TimeStampedModel, NumberSequence
│   │       └── exceptions.py          # DRF exception handler (429 shape)
│   │
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── conftest.py                    # Global fixtures (api_client, cache clearing)
│   ├── pytest.ini
│   ├── manage.py
│   └── requirements.txt
│
├── compose.yaml                       # `db` + `api` services
├── Dockerfile
├── .env.example
├── .gitignore
└── README.md
```

---

# Getting Started

## Prerequisites

Make sure you have:

* Docker
* Docker Compose
* Git

*(Python is not required on the host — everything runs inside containers.)*

---

## Clone the Repository

```bash
git clone https://github.com/Jess2001/MobiLend-backend.git
cd MobiLend-backend
```

---

## Environment Variables

Create your environment file:

```bash
cp .env.example .env
```

Configure the required environment variables in `.env`. See `.env.example` for the full list.

> Do not commit secrets, credentials, API keys, or production configuration to the repository.

---

## Run with Docker

Build and start the stack:

```bash
docker compose up -d
```

Apply migrations:

```bash
docker compose exec api python manage.py migrate
```

Create a superuser (for the Django admin):

```bash
docker compose exec api python manage.py createsuperuser
```

The API is available at `http://localhost:8000`. The Django admin is at `http://localhost:8000/admin/`.

To see the mock OTP codes that would be sent to users:

```bash
docker compose logs api --tail=30
```

---

# Running Tests

Run the test suite with pytest:

```bash
docker compose exec api pytest
```

Quiet mode (one-line summary):

```bash
docker compose exec api pytest -q
```

Run a single file:

```bash
docker compose exec api pytest apps/accounts/tests.py -v
```

The test suite is intended to provide regression protection as new financial workflows are introduced.

---

# Engineering Decisions

## Why PostgreSQL?

PostgreSQL provides the relational guarantees required for a financial application:

* transactions
* constraints
* foreign keys
* indexing
* row-level locking (`SELECT ... FOR UPDATE`)
* reliable relational modelling

These capabilities become particularly important as MobiLend introduces loans, repayments, disbursements, and financial transactions.

## Why Django REST Framework?

DRF provides a mature foundation for:

* REST API development
* authentication
* serialization
* validation
* permissions
* API testing

It also allows the project to keep business logic organized as the domain becomes more complex.

## Why database constraints + application validation?

Application validation improves API behaviour and user feedback.

Database constraints provide a second line of defence for data integrity. The project avoids relying solely on application-level checks for important invariants:

```
Application validation
        +
Database constraints
        ↓
Stronger data integrity
```

## Why hash OTP codes?

A verification code is a one-time credential — functionally equivalent to a short-lived password. If the database is compromised, a plaintext code lets an attacker verify or reset any account with a pending OTP. MobiLend hashes codes with the same machinery used for passwords, so a database leak yields nothing usable.

## Why separate `User` from `CustomerProfile`?

Authentication concerns (identity, session, role) are orthogonal to customer-domain concerns (name, employment, income). Mixing them makes both harder to reason about and violates least-privilege: an endpoint that needs to authenticate you should not carry your financial profile. The separation also lets the customer-domain schema evolve without touching auth.

## Why a `NumberSequence` table with row locking?

Human-readable identifiers (`CUS-2026-00001`) must be sequential and unique under concurrent registration. An application-level `count() + 1` races. A `select_for_update()` lock on a `(key, year)` row plus a unique constraint is correct under any concurrency pattern.

---

# Development Roadmap

MobiLend is being developed incrementally, one vertical slice at a time.

### Phase 1 — Identity & Customer Foundation ✅ **Complete**

* [x] Custom user model (email login)
* [x] JWT authentication with rotation
* [x] Custom login (email **or** phone)
* [x] Account verification via OTP
* [x] Resend OTP with invalidation of prior codes
* [x] Password reset via OTP
* [x] Password complexity validation
* [x] Role-based authorization (6 roles)
* [x] Customer profiles (least-privilege serializers)
* [x] Atomic registration (User + Profile + Code)
* [x] Concurrency-aware customer numbering
* [x] Rate limiting on auth endpoints
* [x] Anti-enumeration on login and password recovery
* [x] Uniform error contract
* [x] 44 automated tests
* [x] Dockerized development environment

### Phase 2 — Lending Domain ⏳ **In Progress (next)**

* [ ] Loan products + term-based interest rates
* [ ] Loan applications
* [ ] Application validation
* [ ] Loan application state machine
* [ ] Credit decisions
* [ ] Approval / rejection workflows
* [ ] Audit trail

### Phase 3 — Loan Management

* [ ] Loan creation
* [ ] Repayment schedules
* [ ] Reducing-balance interest calculation
* [ ] Fees
* [ ] Outstanding balance calculation
* [ ] Repayment allocation

### Phase 4 — Payments

* [ ] M-Pesa provider abstraction + mock implementation
* [ ] STK Push (mock)
* [ ] Payment callbacks / webhooks
* [ ] Callback validation
* [ ] Idempotent payment processing
* [ ] Payment reconciliation
* [ ] Transaction history / ledger

### Phase 5 — Disbursement & Repayment

* [ ] Loan disbursement
* [ ] Repayment processing
* [ ] Financial transaction records
* [ ] Balance updates
* [ ] Failed transaction handling
* [ ] Retry mechanisms

### Phase 6 — Frontend (React + TypeScript)

* [ ] Authentication flow (register → verify → login)
* [ ] Customer dashboard
* [ ] Loan application interface
* [ ] Loan status tracking
* [ ] Repayment history
* [ ] Staff / credit officer dashboard
* [ ] Administrative workflows

### Phase 7 — Production Hardening

* [ ] OpenAPI / Swagger documentation
* [ ] Structured logging and observability
* [ ] Performance testing
* [ ] Security review
* [ ] CI/CD pipeline
* [ ] Production deployment
* [ ] Monitoring and alerting

---

# What This Project Demonstrates

MobiLend is intended to demonstrate practical backend engineering skills beyond CRUD development.

### Backend Engineering

* REST API design with a uniform error contract
* Django application architecture (modular, domain-oriented apps)
* Service-layer design (OTP, identifiers, validators as discrete services)
* Authentication and authorization
* Database modelling

### Software Engineering

* Separation of concerns (identity vs. customer-domain)
* Maintainable architecture
* Automated testing with pytest + factory_boy
* Git-based development
* Dockerized development

### Reliability

* Atomic transactions (registration is all-or-nothing)
* Database constraints (uniqueness, check constraints)
* Concurrency handling (`select_for_update` + constraint)
* Failure and rollback scenarios
* Rate limiting with a consistent 429 contract

### Security

* JWT authentication with rotation and blacklisting
* Role-based access control
* Least-privilege serializers
* OTP hashing and attempt limits
* Account-enumeration protection (login and password recovery)
* Timing-safe authentication
* API-level authorization (never UI-gated)

### Financial Systems (roadmap)

As the lending domain is implemented, the project will demonstrate:

* transaction consistency across related records
* state machines with enforced transitions
* payment idempotency (duplicate-callback safety)
* reconciliation between internal ledger and external provider
* auditability (who did what, when, to which record)
* concurrent financial operations (`select_for_update` on balances)

---

# Project Philosophy

The goal of MobiLend is not to maximize the number of endpoints or features.

The project is being developed around a more important question:

> **How would you design a backend that remains correct when real users, concurrent requests, sensitive data, external services, and financial transactions are involved?**

That means prioritizing:

**Correctness → Security → Data Integrity → Reliability → Maintainability → Performance**

rather than simply adding functionality.

Every feature is built with:

1. **Tests** written the same day
2. **A commit** that documents the decision
3. **A talking point** — something that can be defended in an interview

---

# Author

**Jecinta Wangui**

Backend Software Engineer focused on Python, Django, REST APIs, databases, and healthcare / financial technology.

* GitHub: https://github.com/Jess2001
* LinkedIn: https://linkedin.com/in/jecintawangui
* Portfolio: https://jesswangui.netlify.app
```

---

## What changed from your original

**Corrected facts:**
- Service name is `api`, not `web` (matches your `compose.yaml`)
- App structure is under `backend/apps/` (not a flat `backend/accounts/`)
- Individual files, not folders (e.g. `models.py`, not `models/`)
- Clone URL updated to `MobiLend-backend`
- Added `pytest.ini`, `conftest.py`, `otp.py`, `identifiers.py`, `validators.py`, `factories.py`, `exceptions.py` to the structure

**Added (built since your draft):**
- Custom login (email OR phone)
- Resend OTP
- Rate limiting with per-endpoint scopes
- Uniform error contract with reason codes
- Password complexity validator
- 44 test count
- Full API reference table
- Five "Engineering Decisions" sections explaining *why* (hashing OTPs, separating User/CustomerProfile, NumberSequence, etc.)
- Phase 1 marked complete

**Kept unchanged:**
- Philosophy section (verbatim — it's strong)
- Roadmap structure (marked Phase 1 complete, Phase 2 next)
- Author info
- Overall voice and tone

**Removed:**
- The `### Why PostgreSQL?` and `### Why DRF?` headings from your original were kept but expanded with 3 more decision sections. If you'd rather keep it shorter, cut the extra ones.
- "Initial phases" hedging language that suggested it was early — you're further along than the draft implied.

## Want to commit it?

```bash
cd ~/Documents/MobiLend/MobiLend-backend
# open README.md, paste the block above, save
git add README.md
git commit -m "docs: update README to reflect Phase 1 completion (44 tests)

- Correct service name (api) and app structure (backend/apps/)
- Add custom login, resend OTP, rate limiting to features
- Add API reference table with all live endpoints
- Add engineering decision rationales (OTP hashing, User/Profile split, NumberSequence)
- Mark Phase 1 complete; Phase 2 (lending domain) next"
```

Once that's committed, Day 6 is `LoanProduct` + `LoanProductTerm` — the first slice of the credit domain. Say the word when you're ready.
