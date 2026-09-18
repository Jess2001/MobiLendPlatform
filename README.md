# MobiLend

### Digital Lending Platform — Backend Engineering Project

**MobiLend** is a backend-focused digital lending platform built with **Python, Django REST Framework, and PostgreSQL**.

The project is designed to model the core backend architecture of a modern financial-services platform, with particular attention to **authentication, authorization, data integrity, security, concurrency, automated testing, and maintainable API design**.

> **Project status:** Active development
> **Current focus:** Identity, authentication, authorization, customer management, and backend foundations

---

## Why MobiLend?

Digital lending systems involve more than basic CRUD operations.

A production lending platform must handle sensitive customer information, strict authorization boundaries, financial data integrity, concurrent requests, state transitions, external payment services, and reliable transaction processing.

MobiLend is being built as a practical engineering project to explore those challenges through a realistic backend architecture.

The long-term workflow is:

```text
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

The project currently focuses on the platform's identity and customer-management foundation.

```text
                         MobiLend API
                              │
                 ┌────────────┴────────────┐
                 │                         │
             Accounts                  Customers
                 │                         │
          ┌──────┴──────┐           CustomerProfile
          │             │
         User      VerificationCode
          │
      JWT Auth
          │
          └──────────────┐
                         │
                    PostgreSQL
```

The architecture is intentionally being developed incrementally so that each domain can be implemented with appropriate validation, authorization, transaction handling, and test coverage.

---

# Features

## Authentication & Identity

* Custom Django user model
* Email and phone-based authentication
* JWT authentication using Django REST Framework SimpleJWT
* Account verification
* OTP generation and verification
* OTP expiration
* OTP attempt limits
* OTP hashing rather than storing plaintext verification codes
* Password reset workflows
* Protection against account enumeration during authentication and password recovery
* Refresh-token rotation and blacklisting

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

For example:

```text
Frontend hides button
        ↓
        ❌ Not sufficient
        ↓
Backend permission check
        ↓
403 Forbidden
```

The project includes permission checks and automated tests for authorization boundaries.

---

## Customer Management

Customer information is separated from the authentication identity.

### User

Responsible for identity and authentication information such as:

```text
Email
Phone
Password
Role
Verification status
Account status
```

### Customer Profile

Responsible for customer-domain information such as:

```text
Customer number
Personal information
Employment information
Address
Financial profile
```

This separation keeps authentication concerns independent from customer-domain data and provides a foundation for future lending and KYC workflows.

---

## Data Integrity & Transactions

The project uses database-level constraints and atomic transactions where consistency between related records matters.

For example, customer registration involves multiple related records:

```text
User
 │
 ├── Customer Profile
 │
 └── Verification Code
```

These operations are handled atomically so that a failure does not leave partially created customer data.

```text
Registration
     │
     ├── Create User
     ├── Create Customer Profile
     └── Create Verification Code
              │
              ▼
        All succeed → COMMIT
        Any failure  → ROLLBACK
```

---

## Concurrency Handling

MobiLend includes concurrency-aware customer-number generation.

Customer identifiers are generated using:

* database transactions
* row-level locking
* unique database constraints

This is designed to prevent duplicate identifiers when multiple registration requests are processed concurrently.

The approach uses Django's `select_for_update()` together with database constraints rather than relying only on application-level checks.

---

## Testing

Automated tests are written using:

* pytest
* pytest-django
* factory_boy

Testing currently covers areas including:

* authentication
* authorization
* customer access
* OTP workflows
* password reset behaviour
* validation
* transaction rollback
* permission boundaries
* concurrency-sensitive behaviour

The goal is to test **business behaviour and failure cases**, not only successful API responses.

---

# Technology Stack

| Area                    | Technology              |
| ----------------------- | ----------------------- |
| Language                | Python                  |
| Backend Framework       | Django                  |
| API Framework           | Django REST Framework   |
| Authentication          | SimpleJWT               |
| Database                | PostgreSQL              |
| Testing                 | pytest / pytest-django  |
| Test Data               | factory_boy             |
| Containerization        | Docker / Docker Compose |
| Version Control         | Git / GitHub            |
| Development Environment | Linux / macOS           |

---

# Project Structure

```text
MobiLendPlatform/
│
├── backend/
│   │
│   ├── accounts/
│   │   ├── models/
│   │   ├── serializers/
│   │   ├── views/
│   │   ├── permissions/
│   │   ├── services/
│   │   └── tests/
│   │
│   ├── customers/
│   │   ├── models/
│   │   ├── serializers/
│   │   ├── views/
│   │   ├── services/
│   │   └── tests/
│   │
│   ├── core/
│   │   └── shared application functionality
│   │
│   ├── config/
│   │   └── Django configuration
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── compose.yaml
├── Dockerfile
├── .env.example
└── README.md
```

---

# Getting Started

## Prerequisites

Make sure you have:

* Python 3.x
* Docker
* Docker Compose
* Git

---

## Clone the Repository

```bash
git clone https://github.com/Jess2001/MobiLendPlatform.git

cd MobiLendPlatform
```

---

## Environment Variables

Create your environment file:

```bash
cp .env.example .env
```

Configure the required environment variables in `.env`.

> Do not commit secrets, credentials, API keys, or production configuration to the repository.

---

## Run with Docker

Build and start the application:

```bash
docker compose up --build
```

Once the containers are running, Django can be accessed through the configured application port.

To run the Django management commands inside the container:

```bash
docker compose exec web python manage.py migrate
```

Create a superuser when required:

```bash
docker compose exec web python manage.py createsuperuser
```

---

# Running Tests

Run the test suite with:

```bash
pytest
```

Or inside Docker:

```bash
docker compose exec web pytest
```

The test suite is intended to provide regression protection as new financial workflows are introduced.

---

# Engineering Decisions

## Why PostgreSQL?

PostgreSQL provides the relational guarantees required for a financial application, including:

* transactions
* constraints
* foreign keys
* indexing
* row-level locking
* reliable relational modelling

These capabilities become particularly important as MobiLend introduces loans, repayments, disbursements, and financial transactions.

---

## Why Django REST Framework?

Django REST Framework provides a mature foundation for:

* REST API development
* authentication
* serialization
* validation
* permissions
* API testing

It also allows the project to keep business logic organized as the domain becomes more complex.

---

## Why Database Constraints + Application Validation?

Application validation improves API behaviour and user feedback.

Database constraints provide a second line of defence for data integrity.

The project therefore avoids relying solely on application-level checks for important invariants.

For example:

```text
Application validation
        +
Database constraints
        ↓
Stronger data integrity
```

---

# Planned Roadmap

MobiLend is being developed incrementally.

### Phase 1 — Identity & Customer Foundation

* [x] Custom user model
* [x] JWT authentication
* [x] Account verification
* [x] OTP workflows
* [x] Password reset
* [x] Role-based authorization
* [x] Customer profiles
* [x] Atomic registration
* [x] Concurrency-aware customer numbering
* [x] Automated tests
* [x] Dockerized development environment

### Phase 2 — Lending Domain

* [ ] Loan products
* [ ] Loan applications
* [ ] Application validation
* [ ] Loan application state transitions
* [ ] Credit decisions
* [ ] Approval/rejection workflows
* [ ] Audit trail

### Phase 3 — Loan Management

* [ ] Loan creation
* [ ] Repayment schedules
* [ ] Interest calculation
* [ ] Fees
* [ ] Outstanding balance calculation
* [ ] Repayment allocation

### Phase 4 — Payments

* [ ] M-Pesa integration
* [ ] STK Push
* [ ] Payment callbacks
* [ ] Callback validation
* [ ] Idempotent payment processing
* [ ] Payment reconciliation
* [ ] Transaction history

### Phase 5 — Disbursement & Repayment

* [ ] Loan disbursement
* [ ] Repayment processing
* [ ] Financial transaction records
* [ ] Balance updates
* [ ] Failed transaction handling
* [ ] Retry mechanisms

### Phase 6 — Frontend

* [ ] Customer registration/login
* [ ] Customer dashboard
* [ ] Loan application interface
* [ ] Loan status tracking
* [ ] Repayment history
* [ ] Staff/credit officer dashboard
* [ ] Administrative workflows

### Phase 7 — Production Hardening

* [ ] API documentation
* [ ] Observability
* [ ] Structured logging
* [ ] Performance testing
* [ ] Security review
* [ ] CI/CD improvements
* [ ] Production deployment
* [ ] Monitoring and alerting

---

# What This Project Demonstrates

MobiLend is intended to demonstrate practical backend engineering skills beyond CRUD development.

### Backend Engineering

* REST API design
* Django application architecture
* Service-layer design
* Validation
* Authentication and authorization
* Database modelling

### Software Engineering

* Separation of concerns
* Maintainable architecture
* Automated testing
* Git-based development
* CI/CD
* Dockerized development

### Reliability

* Atomic transactions
* Database constraints
* Concurrency handling
* Failure and rollback scenarios
* Idempotency planning

### Security

* JWT authentication
* RBAC
* PII protection
* OTP security
* Account-enumeration protection
* API-level authorization

### Financial Systems

As the lending domain is implemented, the project will focus particularly on:

* data integrity
* transaction consistency
* state transitions
* payment idempotency
* reconciliation
* auditability
* concurrent financial operations

---

# API Documentation

API documentation will be expanded as the platform's domains are implemented.

Planned documentation will cover:

```text
Authentication
Customer Management
KYC
Loan Products
Loan Applications
Credit Decisions
Loans
Repayments
Payments
Disbursements
Transactions
```

---

# Project Philosophy

The goal of MobiLend is not to maximize the number of endpoints or features.

The project is being developed around a more important question:

> **How would you design a backend that remains correct when real users, concurrent requests, sensitive data, external services, and financial transactions are involved?**

That means prioritizing:

**Correctness → Security → Data Integrity → Reliability → Maintainability → Performance**

rather than simply adding functionality.

---

# Author

**Jecinta Wangui**

Backend Software Engineer focused on Python, Django, REST APIs, databases, and healthcare/financial technology.

* GitHub: https://github.com/Jess2001
* LinkedIn: https://linkedin.com/in/jecintawangui
* Portfolio: https://jesswangui.netlify.app
