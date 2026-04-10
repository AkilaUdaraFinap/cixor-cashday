--
title: "CIXOR CashDay – Comprehensive Business Process Document"
author: "FINAP Worldwide W.L.L."
date: "April 2026"
version: "1.0"
classification: "Highly Confidential"
---

# CIXOR CashDay – Comprehensive Business Process Document

**Version:** 1.0  
**Date:** April 2026  
**Classification:** Highly Confidential  
**Prepared by:** FINAP Worldwide W.L.L.

---

## Table of Contents

1. [Introduction & Business Context](#1-introduction--business-context)
2. [Process Architecture Overview](#2-process-architecture-overview)
3. [Process 1: Company Registration & Identity Resolution](#3-process-1-company-registration--identity-resolution)
4. [Process 2: Invoice Lifecycle Management](#4-process-2-invoice-lifecycle-management)
5. [Process 3: Buyer Acceptance & Confidence Declaration](#5-process-3-buyer-acceptance--confidence-declaration)
6. [Process 4: The Risk Waterfall – From Invoice to Available Liquidation Value](#6-process-4-the-risk-waterfall--from-invoice-to-available-liquidation-value)
7. [Process 5: 90‑Day Cash‑Flow Forecast Engine](#7-process-5-90‑day-cash‑flow-forecast-engine)
8. [Process 6: Liquidation Simulation](#8-process-6-liquidation-simulation)
9. [Process 7: Liquidation Execution](#9-process-7-liquidation-execution)
10. [Process 8: Settlement at Maturity](#10-process-8-settlement-at-maturity)
11. [Process 9: Expense Management](#11-process-9-expense-management)
12. [Process 10: Bank Balance & Overdraft Management](#12-process-10-bank-balance--overdraft-management)
13. [Process 11: Client & Debtor Officer Management](#13-process-11-client--debtor-officer-management)
14. [Process 12: User & Role Management](#14-process-12-user--role-management)
15. [State Machine Reference](#15-state-machine-reference)
16. [Audit & Immutability Framework](#16-audit--immutability-framework)
17. [Role‑Based Access Control Matrix](#17-role‑based-access-control-matrix)
18. [Integration & Data Flow Reference](#18-integration--data-flow-reference)
19. [Glossary of Business Terms](#19-glossary-of-business-terms)

---

## 1. Introduction & Business Context

### 1.1 The SME Liquidity Problem

Small and medium enterprises (SMEs) frequently fail not due to unprofitability, but because of **liquidity timing gaps**. An SME delivers goods or services today and issues an invoice payable in 30, 45, or 60 days. Meanwhile, wages, supplier payments, rent, and statutory liabilities must be settled immediately. This mismatch between earned revenue and available cash is the single largest contributor to SME insolvency globally.

Traditional financing options – overdrafts, factoring, invoice discounting – fail to address the root causes effectively because:

- **Inconsistent invoice formats** prevent third‑party financiers from verifying authenticity and matching receivables reliably.
- **Tax confusion** (VAT/GST) obscures the true economic value of an invoice, making accurate valuation difficult.
- **Weak debtor confirmation** leaves receivables legally unenforceable and unfit as collateral for early settlement.

### 1.2 How CIXOR CashDay Solves the Problem

CIXOR CashDay (CCD) is an SME financial co‑pilot platform that combines four core capabilities into a single, daily‑use application:

1. **Government‑Compliant Invoice Engine** – Generates structured, country‑specific invoices with unique CCD Invoice IDs and clear separation of Net, Tax, and Gross amounts.
2. **Debtor Verification & Buyer Confidence** – Buyers authenticate via OTP and declare the undisputed portion of each invoice, creating a legally defensible Verified Receivable.
3. **90‑Day Cash‑Flow Forecast** – A daily projection of available cash, structured as a 30‑60‑90 view, derived from bank balances, receivables, payables, and expenses.
4. **Liquidation Simulator & Execution** – Enables the seller to model the cash‑flow impact of liquidating verified invoices, then execute liquidation with buyer consent under a transparent three‑layer risk waterfall.

### 1.3 Purpose of This Document

This Business Process Document provides a **complete, production‑grade definition** of all end‑to‑end workflows within CIXOR CashDay. It serves as the authoritative reference for:

- Product managers, business analysts, and QA teams.
- Developers implementing the solution.
- Compliance and audit reviewers.
- Training material for internal teams and pilot partners.

---

## 2. Process Architecture Overview

### 2.1 High‑Level Process Map

```mermaid
flowchart TD
    subgraph Core Processes
        A[Registration & Identity] --> B[Invoice Lifecycle]
        B --> C[Buyer Acceptance]
        C --> D[Verified Receivable]
        D --> E[Risk Waterfall]
        E --> F[90-Day Forecast]
        F --> G[Liquidation Simulation]
        G --> H[Liquidation Execution]
        H --> I[Settlement at Maturity]
    end
    
    subgraph Supporting
        J[Expenses Management] --> F
        K[Bank Balance Mgmt] --> F
        L[Clients & Officers] --> B
        M[Users & Roles] --> A
    end
2.2 Process Ownership and System Boundaries
Process Area	Primary Service Owner	Key Database
Registration & Identity	Core Platform Service	CashDay_Platform
Invoice Lifecycle	Invoice & Receivables Service	CashDay_Invoice
Buyer Acceptance	Invoice & Receivables Service	CashDay_Invoice
Risk Waterfall	Invoice & Receivables Service	CashDay_Invoice / Platform
90‑Day Forecast	Cash & Expenses Service	CashDay_Cash
Liquidation Simulation	Cash & Expenses Service	CashDay_Cash + Redis
Liquidation Execution	Invoice & Receivables Service	CashDay_Invoice
Settlement	Invoice & Receivables Service	CashDay_Invoice
Expenses	Cash & Expenses Service	CashDay_Cash
Bank Balance	Core Platform Service	CashDay_Platform
Clients & Officers	Core Platform Service	CashDay_Platform
Users & Roles	Core Platform Service	CashDay_Platform
2.3 Process Triggers and Outcomes Summary
Process	Primary Trigger	Final Outcome
Registration	User submits company sign‑up form	CompanyId assigned, JWT issued, user logged in
Invoice Creation	User clicks "New Invoice"	Invoice in Draft state, CCD Invoice ID assigned
Invoice Sending	User clicks "Send" on a Draft invoice	Invoice status = Sent, acceptance link emailed
Buyer Acceptance	Debtor officer clicks email link	Invoice status = Accepted/Rejected, confidence % recorded
Risk Waterfall	Invoice becomes Verified	Available to Liquidate amount calculated
Forecast Generation	User loads Dashboard	90‑day cash‑flow projection rendered
Simulation	User enters amount in simulation input	Hypothetical forecast line overlaid on chart
Liquidation Execution	User confirms liquidation intent	LiquidityIntent created, buyer consent requested
Buyer Consent	Buyer confirms via 2FA	Contract rewritten, cash released to seller
Settlement	Invoice due date reached	Payment reconciled, remaining balance remitted
3. Process 1: Company Registration & Identity Resolution
3.1 Process Objective
To onboard a new SME company onto the CIXOR CashDay platform, resolve its identity against the existing CIXOR PayDay ecosystem, and establish a secure tenant context with a unique CompanyId (bigint).

3.2 Preconditions
The user has navigated to the CashDay registration page.

The CIXOR PayDay HR & Payroll Service is operational.

3.3 Detailed Process Flow
Step	Actor	Action	System Response / Notes
1	User	Completes registration form: legal name, tax registration number, business registration number, email domain, and admin user details.	Form validation performed client‑side and server‑side. All fields required.
2	Core Platform	Receives registration request at POST /api/platform/register.	Initiates Company Identity Resolution sub‑process.
3	Core Platform	Calls GET /internal/payday/company/lookup on CIXOR PayDay HR Service.	Passes tax number, business reg number, legal name, and email domain.
4	PayDay HR	Executes priority‑ordered multi‑field lookup:	
- Priority 1: Exact match on Tax Registration Number → returns existing CompanyId.	
- Priority 2: Exact match on Business Registration Number → returns existing CompanyId.	
- Priority 3: Fuzzy match on Legal Name + Email Domain → returns candidate for confirmation.	
- Priority 4: No match found.	
5a	PayDay HR	Match Found (Priority 1 or 2) – Returns CompanyId and MatchPriority.	Core Platform proceeds to Step 6.
5b	PayDay HR	Fuzzy Match (Priority 3) – Returns candidate company details.	Core Platform presents candidate to user for confirmation. User confirms → proceed with existing CompanyId. User rejects → proceed to Step 5c.
5c	PayDay HR	No Match (Priority 4) – Core Platform calls POST /internal/payday/company/create.	PayDay HR creates a minimal company record and returns a newly allocated CompanyId (bigint).
6	Core Platform	Creates a CompanyLink record in CashDay_Platform database.	Stores CompanyId, IsNewCompany flag, and MatchPriority.
7	Core Platform	Creates the initial Admin user account linked to the CompanyId.	
8	Core Platform	Writes an immutable AuditLog entry with event type CompanyRegistered.	
9	Identity Svc	Issues a JWT containing claims: sub (UserId), companyId (as numeric string), role ("Admin"), name, email.	
10	Core Platform	Returns JWT and companyId to the frontend.	User is automatically logged in and redirected to Dashboard.
3.4 Exception Paths
Scenario	Handling
PayDay HR service unavailable	Polly retry policy (3 attempts with exponential backoff). If all fail, return HTTP 503 with user‑friendly message. No partial registration.
Duplicate registration (same tax number)	Return HTTP 409 Conflict with message "Company already exists in CashDay."
Invalid form data	Return HTTP 400 with validation error details.
3.5 Post‑Conditions
A Company record exists in CashDay_Platform with a unique CompanyId sourced from CIXOR PayDay.

A CompanyLink record documents the identity resolution path.

An Admin user is created and authenticated.

All subsequent requests from this tenant are filtered by CompanyId via EF Core global query filters.

3.6 State Machine – Registration Flow






































3.7 Key Data Entities
Entity	Key Fields
Company	CompanyId (bigint PK), LegalName, TaxRegNumber, BusinessRegNumber, CountryCode
CompanyLink	CompanyId, PayDayCompanyId, MatchPriority (1‑4), IsNewCompany, LinkedAt
User	UserId (Guid), CompanyId, Email, Name, Role, Status
AuditLog	AuditId, CompanyId, EventType, ActorId, ActorLabel, Timestamp, IPAddress, Detail
4. Process 2: Invoice Lifecycle Management
4.1 Process Objective
To enable an SME to create, edit, send, and manage both System Receivables (created inside CCD) and Manual Receivables (entered for reference). The lifecycle culminates in a Verified Receivable eligible for liquidation or a Settled invoice.

4.2 Invoice Classification
Type	Source	Direction	Verification	Liquidation Eligible
System Receivable	Created in CCD UI	Outgoing	Can be Verified	Yes (if Verified)
Manual Receivable	Manually entered	Outgoing	Always Unverified	No
System Payable	Received from another CCD user	Incoming	Digitally Verified	N/A (obligation)
Manual Payable	Manually entered	Incoming	N/A	Classified as Expense
Note: Only System Receivables are eligible for liquidation.

4.3 Invoice State Machine
























State Transition Rules:

From	To	Allowed?	Condition
Draft	Draft	Yes	Edit allowed while status = Draft.
Draft	Deleted	Yes	Soft delete; only Draft invoices can be deleted.
Draft	Sent	Yes	All required fields validated, acceptance link dispatched.
Sent	Viewed	Yes	Debtor officer opens acceptance link.
Sent	Accepted	Yes	OTP verified + acceptance submitted.
Sent	Rejected	Yes	OTP verified + rejection submitted with reason.
Viewed	Accepted	Yes	Same as Sent → Accepted.
Viewed	Rejected	Yes	Same as Sent → Rejected.
Accepted	Liquidated	Yes	Liquidation confirmed and buyer consent obtained.
Accepted	Settled	Yes	Full payment received at maturity (non‑liquidated path).
Liquidated	Settled	Yes	CCD receives buyer payment and reconciles.
Any	Previous	No	State transitions are strictly forward‑only.
4.4 Detailed Process Flow – System Receivable Creation to Sending
Step	Actor	Action	System Response / Notes
1	User (Finance/Admin)	Navigates to Invoices → "New Invoice".	Form pre‑populated with country template from Settings.
2	User	Selects Customer, Debtor Officer, enters line items, due date.	Real‑time calculation of Net, Tax, Gross amounts.
3	User	Clicks "Save as Draft".	POST /api/invoices → Invoice created with status = Draft, IsVerified = false, Classification = SystemReceivable. Unique CcdInvoiceId generated.
4	User	Later, opens Draft invoice and clicks "Send".	System validates all required fields.
5	Invoice Service	Calls GET /internal/platform/officer/:id to retrieve officer email.	
6	Invoice Service	Generates a signed URL token (expires in 7 days) for the acceptance portal.	
7	Notification	Dispatches email to officer with the acceptance link.	Email contains: seller name, invoice summary, link.
8	Invoice Service	Updates invoice status to Sent. SentAt timestamp recorded.	
9	Invoice Service	Writes InvoiceAuditLog entry: InvoiceSent.	
10	Forecast Cache	Invalidates Redis cache for the tenant's forecast (since outstanding receivables changed).	Next dashboard load will fetch fresh data.
4.5 Manual Receivable Creation
Manual receivables are entered via POST /api/invoices/manual for tracking purposes only. They are always unverified and never eligible for liquidation. They appear in the forecast as positive data points on their due date.

4.6 Key Data Entities
Entity	Key Fields
Invoice	InvoiceId (Guid), CompanyId, CcdInvoiceId (string), CustomerId, OfficerId, Classification, Status, IsVerified, BuyerConfidencePercent, NetAmount, TaxAmount, GrossAmount, DueDate, IssueDate, SentAt
InvoiceLineItem	LineItemId, InvoiceId, Description, Quantity, UnitPrice, TaxRate, NetAmount, TaxAmount, GrossAmount
InvoiceAuditLog	AuditId, InvoiceId, EventType (e.g., Created, Sent, Viewed, Accepted), ActorId, Timestamp
5. Process 3: Buyer Acceptance & Confidence Declaration
5.1 Process Objective
To enable the debtor officer (buyer) to securely review an invoice, authenticate via OTP, declare the Buyer Confidence Percentage (the undisputed portion), and either accept or reject the invoice. This process converts a Sent invoice into a Verified Receivable and creates an immutable evidence record.

5.2 Preconditions
Invoice status = Sent.

Debtor officer has received the acceptance email containing a signed URL.

The signed URL token is valid (not expired, not tampered).

5.3 Detailed Process Flow – Happy Path (Acceptance)
Step	Actor	Action	System Response / Notes
1	Debtor Officer	Clicks the acceptance link in the email.	Browser opens /acceptance/portal/:token. No login required.
2	Portal	GET /api/acceptance/portal/:token validates token.	Returns invoice summary and pre‑consent clause text.
3	Officer	Clicks "Verify Identity".	Triggers OTP request.
4	Portal	POST /api/acceptance/portal/:token/otp with officer email.	Rate limit: max 3 OTP requests per hour per officer email.
5	Invoice Service	Generates a 6‑digit OTP, hashes it, stores with expiry (10 minutes). Dispatches email.	
6	Officer	Enters OTP code and clicks "Verify".	
7	Invoice Service	POST /api/acceptance/portal/:token/verify with OTP.	Validates OTP hash, expiry, and single‑use status.
8	Portal	On success, displays full invoice review screen with Buyer Confidence Slider (0–100%).	Default value = 100%.
9	Officer	Adjusts slider if necessary, ticks pre‑consent checkbox, clicks "Accept Invoice".	
10	Invoice Service	Executes Atomic Transaction (all writes succeed or roll back):	
- Marks OTP as used.	
- Updates Invoice.Status = Accepted.	
- Sets Invoice.IsVerified = true.	
- Sets Invoice.BuyerConfidencePercent = declared value.	
- Inserts AcceptanceRecord (with timestamp, IP, officer email).	
- Inserts PreConsentAcknowledgement.	
- Inserts Evidence record (immutable proof of acceptance).	
- Writes InvoiceAuditLog entries: OtpVerified, InvoiceAccepted, BuyerConfidenceDeclared.	
11	Portal	Displays confirmation screen with evidence reference ID.	
12	Forecast Cache	Invalidates Redis cache for tenant (invoice now verified, affects liquidation eligibility).	
5.4 Rejection Path
Step	Actor	Action	System Response / Notes
R1	Officer	After OTP verification, clicks "Reject Invoice".	
R2	Portal	Prompts for rejection reason (required).	
R3	Officer	Enters reason and confirms.	
R4	Invoice Service	Atomic transaction:	
- Marks OTP used.	
- Sets Invoice.Status = Rejected.	
- IsVerified remains false.	
- Inserts RejectionRecord with reason.	
- Writes InvoiceAuditLog entry: InvoiceRejected.	
R5	Notification	Sends rejection notification to the seller (email/in‑app).	
5.5 Acceptance Portal State Machine

















































5.6 Exception and Edge Cases
Scenario	Handling
Token expired	Display error: "This link has expired. Please contact the sender for a new invoice."
Token tampered	Display error: "Invalid link."
OTP expired (10 minutes)	Allow user to request a new OTP.
OTP reused	Reject with error: "Code already used."
Rate limit exceeded (4th OTP in 1 hour)	Display: "Too many attempts. Please try again later."
Database connection lost mid‑transaction	Complete rollback; invoice status remains Sent. Officer can retry.
5.7 Key Data Entities
Entity	Key Fields
AcceptanceRequest	RequestId, InvoiceId, TokenHash, ExpiresAt, OfficerEmail
OtpChallenge	ChallengeId, RequestId, OtpHash, IssuedAt, ExpiresAt, IsUsed, Attempts
AcceptanceRecord	RecordId, InvoiceId, OfficerEmail, BuyerConfidencePercent, IpAddress, AcceptedAt
PreConsentAcknowledgement	AcknowledgementId, InvoiceId, OfficerEmail, AcknowledgedAt
Evidence	EvidenceId, InvoiceId, EvidenceType ("Acceptance"), JsonPayload, CreatedAt
RejectionRecord	RecordId, InvoiceId, RejectionReason, RejectedAt
6. Process 4: The Risk Waterfall – From Invoice to Available Liquidation Value
6.1 Process Objective
To calculate the maximum amount a seller can liquidate against a Verified invoice by applying three layers of risk mitigation. This calculation is deterministic and read‑only; it does not alter state but is critical for simulation and liquidation.

6.2 The Three Layers
Layer	Name	Set By	Formula / Description
1	Invoice Net‑of‑Tax Value	System (CCD)	GrossAmount − TaxAmount. Taxes are pass‑through obligations and are never part of liquidation.
2	Eligible Liquidation Value (ELV)	Buyer (at verification)	Net‑of‑Tax Value × (BuyerConfidencePercent / 100). Represents the portion the buyer declares undisputed and payable in full.
3	Invoice‑to‑Value Ratio (IVR)	CCD Platform (admin)	A haircut applied by CCD to protect against residual risk. Stored in PlatformConfig table. For MVP, a flat percentage (e.g., 85%) applies to all invoices.
6.3 Calculation Formula
text
Available to Liquidate = Net‑of‑Tax Value × (BuyerConfidencePercent / 100) × (IVR / 100)
Worked Example:

Invoice Gross: LKR 1,150,000

Tax (VAT 15%): LKR 150,000

Net‑of‑Tax Value: LKR 1,000,000

Buyer Confidence: 92%

ELV: LKR 1,000,000 × 0.92 = LKR 920,000

Platform IVR: 85%

Available to Liquidate: LKR 920,000 × 0.85 = LKR 782,000

The seller may request any amount from 0 up to LKR 782,000 for this invoice.

6.4 Waterfall Flow Diagram









6.5 Process Flow – Waterfall Retrieval
Step	Actor / System	Action	Notes
1	Dashboard / Invoice Detail	Calls GET /api/invoices/:id/waterfall or includes waterfall data in dashboard response.	
2	Invoice Service	Retrieves Invoice.NetAmount, Invoice.BuyerConfidencePercent.	If invoice is not Verified, returns null or zero values.
3	Invoice Service	Calls GET /internal/platform/config/ivr (Core Platform) to fetch current IvrPercent.	Cached value used for performance.
4	Invoice Service	Computes ELV and AvailableToLiquidate in memory.	
5	Invoice Service	Returns waterfall breakdown to caller.	Response includes netOfTaxValue, buyerConfidencePercent, elv, ivrPercent, availableToLiquidate.
6.6 IVR Governance
MVP: A single, platform‑wide IVR is stored in PlatformConfig and managed by CCD administration.

Post‑MVP: IVR can be made dynamic per buyer, industry, or tenor. The architecture supports this extension without changing the core calculation logic.

6.7 Key Data Fields
Field	Table	Type	Set By
NetAmount	Invoices	decimal(18,2)	System (calculated)
BuyerConfidencePercent	Invoices	decimal(5,2)	Buyer at acceptance
IvrPercent	PlatformConfig	decimal(5,2)	CCD Admin
EligibleLiquidationValue	Computed	–	Derived
AvailableToLiquidate	Computed	–	Derived
7. Process 5: 90‑Day Cash‑Flow Forecast Engine
7.1 Process Objective
To provide the SME with a daily projection of their net cash position for the next 90 days, structured as 30 days granular + two 30‑day summary blocks. The forecast combines bank balances, overdraft, receivables, payables, and expenses into a single, actionable view.

7.2 Forecast Structure (30‑60‑90)
Period	Display	Interactivity
Days 1‑30	Every day plotted individually.	Hover/tap reveals detailed event data points.
Days 31‑60	Aggregated block; net line continues.	Hover shows aggregated summary; drill‑down available.
Days 61‑90	Aggregated block; net line continues.	Hover shows aggregated summary.
7.3 Forecast Inputs
Input	Source Service	Endpoint
Bank Balance	Core Platform	GET /internal/platform/balance
Overdraft Facility	Core Platform	GET /internal/platform/overdraft
Outstanding Invoices	Invoice & Receivables	GET /internal/invoices/outstanding
Expense Schedule	Cash & Expenses (local DB)	Direct query
IVR (for waterfall)	Core Platform	GET /internal/platform/config/ivr
7.4 Daily Cash Position Calculation
text
Day 0: BankBalance + (OverdraftLimit − OverdraftUsed) = Starting Available Cash
Day N: Previous Day End Balance + Receivables Due Day N − Payables Due Day N − Expenses Due Day N = End of Day Cash Position
7.5 Detailed Process Flow – Dashboard Load
Step	Actor / System	Action	Notes
1	User	Navigates to Dashboard or refreshes page.	Angular dispatches loadDashboard action.
2	Cash & Expenses Service	Receives request at GET /api/dashboard.	Checks Redis for cached forecast (key: forecast:{companyId}).
3a	Cache Hit	Returns cached ForecastResult immediately.	TTL = 5 minutes. Performance < 20ms.
3b	Cache Miss	Fires four parallel HTTP requests:	
- GET /internal/platform/balance → { bankBalance }	
- GET /internal/platform/overdraft → { overdraftLimit, overdraftUsed }	
- GET /internal/invoices/outstanding → { invoices[] }	Returns all outstanding invoices with status, dueDate, netAmount, isVerified, buyerConfidencePercent.
- Local DB query for expense schedule (recurring + one‑off + unplanned).	
4	Cash & Expenses Service	Computes startingAvailableCash = bankBalance + (overdraftLimit - overdraftUsed).	Day 0 value.
5	Cash & Expenses Service	Iterates Day 1 to Day 90, applying daily net change:	
EndBalance = PreviousBalance + ReceivablesDue − PayablesDue − ExpensesDue.	
6	Cash & Expenses Service	Structures result into 30‑60‑90 format.	
7	Cash & Expenses Service	Stores result in Redis with key forecast:{companyId} and TTL 300 seconds.	
8	Cash & Expenses Service	Returns { availableCashToday, forecast[], verifiedInvoices[] } to frontend.	Verified invoices include pre‑computed availableToLiquidate.
9	Angular Dashboard	Renders chart and verified invoice list.	Net cash‑flow line colour: black when positive, red when negative.
7.6 Forecast Computation Sequence Diagram
7.7 Cache Invalidation Triggers
The Redis cache for a tenant is immediately invalidated (key deleted) when any of the following events occur:

Invoice status changes (Sent, Accepted, Rejected, Liquidated, Settled).

Expense created, updated, or deleted.

Bank balance or overdraft updated.

IVR configuration changed (affects liquidation eligibility display).

7.8 Fallback Mechanism
If Redis is unavailable, the service falls back to writing/reading the forecast from the ForecastCache MSSQL table. Performance degrades but functionality remains.

7.9 Key Data Entities
Entity	Key Fields
ForecastCache	CacheId, CompanyId, ForecastJson, CreatedAt, ExpiresAt
CashSnapshot	SnapshotId, CompanyId, BankBalance, OverdraftLimit, OverdraftUsed, CapturedAt
8. Process 6: Liquidation Simulation
8.1 Process Objective
To allow the seller to model the cash‑flow impact of liquidating one or more verified invoices before making any commitment. The system overlays a hypothetical cash‑flow line on the forecast chart, enabling iterative "what‑if" analysis.

8.2 Preconditions
Dashboard is loaded with current forecast.

At least one verified invoice is present in the list.

User has Finance or Admin role.

8.3 Detailed Process Flow
Step	Actor	Action	System Response / Notes
1	User	Enters an amount (0 < amount ≤ AvailableToLiquidate) in the "Simulate" field of a verified invoice.	Input validation occurs client‑side.
2	User	Presses Enter or clicks "Simulate".	Angular dispatches runSimulation action with { invoices: [{ invoiceId, amount }] }.
3	Cash & Expenses	Receives POST /api/dashboard/simulate.	
4	Cash & Expenses	Retrieves the cached base forecast from Redis (key forecast:{companyId}).	If cache miss, recomputes base forecast (slower).
5	Cash & Expenses	Computes total simulated cash injection: Σ(requestedAmount) − CCD_Fee.	Fee is a percentage of the requested amount (configurable platform parameter).
6	Cash & Expenses	Applies injection to the base forecast at settlement date (Day 0 or Day +1).	In‑memory arithmetic; zero database I/O.
7	Cash & Expenses	Generates hypotheticalForecast array (same 90‑day structure).	
8	Cash & Expenses	Stores simulation session in Redis (key sim:{companyId}:{sessionId}) with TTL 15 minutes.	Allows subsequent add/remove without recomputing base forecast.
9	Cash & Expenses	Returns { actualForecast, hypotheticalForecast, totalInjection, totalFees, netInjection }.	
10	Angular	Renders the hypothetical line as a dashed cyan overlay on the forecast chart.	Also updates the summary text below the table: "Simulating N invoice(s) · Net injection: LKR X".
11	User	Iterates: adjusts amounts, adds/removes invoices. Each change triggers a new simulation request.	
12	User	When satisfied, clicks "Proceed to Liquidation".	Opens the Liquidation Confirmation Modal (see Process 7).
13	User	Optionally clicks "Reset Simulation" to clear all inputs and remove hypothetical line.	Calls POST /api/dashboard/simulate/reset → clears Redis session.
8.4 Simulation State Machine























8.5 Performance Characteristics
Simulation response time target: < 200ms server‑side.

Achieved via Redis cache hit (~5ms) + in‑memory overlay (~1ms).

No debouncing required; simulation is triggered by explicit user action.

8.6 Key Data Entities (Simulation Session – Redis)
Field	Description
sessionId	Unique identifier for the simulation session (GUID).
companyId	Tenant identifier.
selectedInvoices	Array of { invoiceId, requestedAmount }.
baseForecast	Snapshot of the actual forecast at session start (used as reference).
createdAt	Timestamp.
expiresAt	TTL 15 minutes.
9. Process 7: Liquidation Execution
9.1 Process Objective
To convert a simulated liquidation plan into a binding request, obtain the buyer's final consent, rewrite the payment contract, and disburse cash to the seller.

9.2 Preconditions
User has completed simulation and is viewing the Liquidation Confirmation Modal.

All selected invoices are Verified and have a LiquidityIntent status = null (no active intent).

9.3 Detailed Process Flow
Step	Actor	Action	System Response / Notes
1	User	Reviews the Liquidation Confirmation Modal.	Modal displays per‑invoice breakdown, total injection, fees, before/after cash comparison, settlement path disclosure, buyer consent notice.
2	User	Clicks "Confirm & Request Liquidation".	
3	Invoice Service	Receives POST /api/invoices/liquidate (or batch endpoint) with { invoiceId, requestedAmount } for each invoice.	
4	Invoice Service	Validates: Invoice is Verified, requestedAmount ≤ AvailableToLiquidate, no existing active LiquidityIntent.	
5	Invoice Service	Atomic Transaction per invoice:	
- Creates LiquidityIntent record with complete waterfall snapshot:	
- RequestedAmount	
- BuyerConfidenceSnapshot (at time of intent)	
- IvrSnapshot	
- ElvSnapshot	
- AvailableToLiquidateSnapshot	
- CcdFeeAmount	
- NetCashToSeller	
- BeforeCashPosition, AfterCashPosition	
- BuyerConsentStatus = Pending	
- BuyerConsentExpiry = NOW() + 48 hours	
- Writes InvoiceAuditLog entry: LiquidityIntentCreated.	
6	Notification	Dispatches Buyer Consent Request email to the debtor officer.	Email contains a signed URL to the consent portal.
7	Invoice Service	Returns { liquidityIntentId, consentExpiry } to frontend.	Dashboard updates affected invoice rows to show status "Liquidation Pending".
8	Forecast Cache	Invalidated (since invoice status changed).	
9.4 Buyer Consent Sub‑Process
Step	Actor	Action	System Response / Notes
C1	Debtor Officer	Clicks consent link in email.	Opens consent portal (similar to acceptance portal).
C2	Officer	Authenticates via 2FA (OTP).	
C3	Officer	Reviews liquidation details and clicks "Confirm" or "Reject".	
C4a	Confirm	Invoice Service updates LiquidityIntent.BuyerConsentStatus = Confirmed, ConfirmedAt = now.	
Contract Rewrite:	
- Generates a new payment instruction document with CCD as the settlement party.	
- Stores the amended contract in LiquidityIntent.ContractJson.	
- Updates Invoice.Status = Liquidated.	
- Writes InvoiceAuditLog: BuyerConsentConfirmed, InvoiceLiquidated.	
- Triggers Cash Disbursement to seller's bank account.	
C4b	Reject	Updates BuyerConsentStatus = Rejected.	Notifies seller. Invoice remains Accepted; can be re‑simulated later.
C5	Expiry	If no response within 48 hours, status changes to Expired. Seller notified.	
9.5 Liquidation Lifecycle State Machine



































9.6 Post‑Conditions
For confirmed intents: Invoice is Liquidated. Cash is in the seller's bank account (net of fees).

The seller updates their bank balance manually (MVP). The next forecast recalculation will show the improved cash position as the actual line.

9.7 Key Data Entities – LiquidityIntent (Expanded)
Field	Type	Description
LiquidityIntentId	uniqueidentifier	PK
InvoiceId	uniqueidentifier	FK to Invoice
CompanyId	bigint	Tenant
RequestedAmount	decimal(18,2)	Amount seller chose to liquidate
BuyerConfidenceSnapshot	decimal(5,2)	Buyer confidence % at time of intent
IvrSnapshot	decimal(5,2)	IVR % at time of intent
ElvSnapshot	decimal(18,2)	ELV at time of intent
AvailableToLiquidateSnapshot	decimal(18,2)	Ceiling at time of intent
CcdFeeAmount	decimal(18,2)	Fee charged by CCD
NetCashToSeller	decimal(18,2)	RequestedAmount - CcdFeeAmount
BeforeCashPosition	decimal(18,2)	Seller's available cash before liquidation (snapshot)
AfterCashPosition	decimal(18,2)	Projected available cash after liquidation
BuyerConsentStatus	nvarchar(20)	Pending, Confirmed, Rejected, Expired
BuyerConsentExpiry	datetime2	48 hours from request creation
ConfirmedAt	datetime2	Timestamp of buyer confirmation
ContractJson	nvarchar(max)	Immutable digital contract (rewritten payment terms)
CreatedAt	datetime2	Record creation timestamp
10. Process 8: Settlement at Maturity
10.1 Process Objective
To reconcile the payment of a liquidated invoice on its due date, deduct the advance and fees, and remit the remaining balance to the seller. This process applies only to Liquidated invoices.

10.2 Preconditions
Invoice status = Liquidated.

Invoice due date has arrived.

10.3 Detailed Process Flow
Step	Actor	Action	System Response / Notes
1	Buyer	Pays the full Net‑of‑Tax Value of the invoice to CCD (as per rewritten contract).	Payment may be received via bank transfer or integrated payment gateway.
2	Finance Ops	Records payment receipt in CCD back‑office system (or via API).	POST /api/settlement/collect (post‑MVP).
3	Invoice Service	Validates payment amount against Invoice.NetAmount.	
4	Invoice Service	Retrieves associated LiquidityIntent record.	
5	Invoice Service	Calculates settlement:	
- CCD Retention = RequestedAmount + CcdFeeAmount.	
- Seller Remittance = PaymentReceived − CCD Retention.	If payment is less than full Net value, seller remittance is reduced; seller remains liable for shortfall.
6	Finance Ops	Initiates remittance of Seller Remittance to seller's bank account.	
7	Invoice Service	Updates Invoice.Status = Settled.	
8	Invoice Service	Writes InvoiceAuditLog: InvoiceSettled.	
9	Forecast Cache	Invalidated (invoice no longer outstanding).	
10.4 Settlement Flow Diagram






















10.5 Non‑Liquidated Invoice Settlement
If an invoice was never liquidated, the buyer pays the seller directly. The seller manually marks the invoice as Settled in CCD (or it is auto‑settled post‑MVP via bank feed reconciliation).

10.6 Key Data Fields (Settlement Tracking)
Field	Table	Description
SettledAt	Invoices	Timestamp when invoice reached Settled status.
SettlementAmount	LiquidityIntent	Actual amount received from buyer (for liquidated invoices).
RemittedToSeller	LiquidityIntent	Amount paid to seller after deduction.
11. Process 9: Expense Management
11.1 Process Objective
To allow the SME to record and manage three categories of expenses that feed directly into the 90‑day forecast: Recurring, One‑Off Planned, and Unplanned.

11.2 Expense Types
Type	Description	Example
Recurring	Fixed expenses that repeat on a schedule.	Rent (monthly), Salaries (monthly), Loan repayment (weekly).
One‑Off	Planned expenses with a specific due date.	Equipment purchase, Annual licence fee.
Unplanned	Ad‑hoc expenses entered as they occur.	Emergency repair, unexpected supplies.
11.3 Detailed Process Flow – Add Recurring Expense
Step	Actor	Action	System Response / Notes
1	User (Finance/Admin)	Navigates to Expenses → "Recurring" tab → "Add Expense".	Opens modal form.
2	User	Enters: Name, Amount, Frequency (Weekly/Monthly/Quarterly), Start Date, optional End Date.	
3	User	Clicks "Save".	POST /api/expenses/recurring
4	Cash & Expenses	Validates and inserts record into RecurringExpenses table.	
5	Cash & Expenses	Writes CashAuditLog entry: ExpenseCreated.	
6	Cash & Expenses	Invalidates Redis forecast cache for tenant.	Next dashboard load will include the new expense in projections.
11.4 Expense Contribution to Forecast
During forecast computation, the Cash & Expenses Service expands recurring expenses into individual occurrences for the 90‑day window based on frequency and start/end dates. One‑off and unplanned expenses are included on their specified due dates.

11.5 Key Data Entities
Entity	Key Fields
RecurringExpense	ExpenseId, CompanyId, Name, Amount, Frequency, StartDate, EndDate, Category
OneOffExpense	ExpenseId, CompanyId, Name, Amount, DueDate, Category
UnplannedExpense	ExpenseId, CompanyId, Name, Amount, RecordedAt, Notes
12. Process 10: Bank Balance & Overdraft Management
12.1 Process Objective
To maintain the starting point for the 90‑day forecast. In MVP, the user manually enters their operating account balance and overdraft facility details.

12.2 Detailed Process Flow – Update Balance
Step	Actor	Action	System Response / Notes
1	User (Finance/Admin)	Navigates to Bank → clicks "Update Balance".	Opens modal.
2	User	Enters new balance and optional note.	
3	User	Clicks "Save".	POST /api/bank/balance
4	Core Platform	Inserts a new record into BankBalanceHistory (append‑only).	Previous balance is retained for audit.
5	Core Platform	Updates the current BankBalance in Company or CompanyConfig (cached).	
6	Core Platform	Invalidates Redis forecast cache for tenant.	
7	Core Platform	Returns updated availableCash to frontend.	Dashboard will reflect new available cash on next load.
12.3 Overdraft Facility
Overdraft details are managed similarly via POST /api/bank/overdraft. The Available Overdraft is calculated as OverdraftLimit − OverdraftUsed. This amount is added to the bank balance to determine Available Cash Today.

12.4 Key Data Entities
Entity	Key Fields
BankBalanceHistory	HistoryId, CompanyId, Balance, AsOfDate, RecordedBy, Notes, CreatedAt
OverdraftFacility	FacilityId, CompanyId, OverdraftLimit, OverdraftUsed, UpdatedAt
13. Process 11: Client & Debtor Officer Management
13.1 Process Objective
To maintain a directory of customers (buyers) and their designated Debtor Officers – the individuals who receive invoice acceptance and liquidation consent requests.

13.2 Detailed Process Flow – Add Client and Officer
Step	Actor	Action	System Response / Notes
1	User (All roles)	Navigates to Clients → "Add Client".	Opens form.
2	User	Enters company name, legal identifiers, address.	POST /api/platform/customers → returns customerId.
3	User	Clicks "Add Officer" on the new client.	Opens officer form.
4	User	Enters officer name, email, phone, title.	POST /api/platform/customers/:id/officers
5	Core Platform	Inserts DebtorOfficer record linked to the customer.	
6	Invoice Creation	When creating an invoice, the user selects a customer; the officer dropdown is filtered accordingly.	The selected officer's email is used for the acceptance link.
13.3 Key Data Entities
Entity	Key Fields
Customer	CustomerId, CompanyId, LegalName, TaxRegNumber, Address, PrimaryContactEmail
DebtorOfficer	OfficerId, CustomerId, Name, Email, Phone, Title, IsActive
14. Process 12: User & Role Management
14.1 Process Objective
To manage user access to the CashDay platform with tenant‑scoped Role‑Based Access Control (RBAC).

14.2 Roles and Permissions Overview
Role	Access Level
Admin	Full access: Dashboard, Invoices, Expenses, Bank, Clients, Users, Settings. Can invite/deactivate users.
Finance	Dashboard, Invoices (full CRUD), Expenses, Bank, Clients. Cannot manage Users or Settings.
Sales	Dashboard, Invoices (view/create only), Clients (view only). Cannot access Expenses, Bank, Users, Settings, or initiate liquidation.
14.3 Detailed Process Flow – Invite User
Step	Actor	Action	System Response / Notes
1	Admin	Navigates to Users → "Invite User".	Opens modal.
2	Admin	Enters email, name, selects role (Admin/Finance/Sales).	POST /api/platform/users/invite
3	Core Platform	Creates User record with Status = Invited.	
4	Notification	Sends invitation email with a link to set password.	
5	Invited User	Clicks link, sets password, and logs in.	User status changes to Active. JWT issued with appropriate role claim.
14.4 Role Enforcement
Navigation: Sidebar items are hidden if the user's role lacks access.

Route Guards: RoleGuard prevents direct URL navigation to unauthorized routes.

API: All endpoints validate the role claim from the JWT; backend also enforces permissions.

UI Elements: The *ccdRole directive hides action buttons.

15. State Machine Reference
15.1 Invoice Status State Machine
See Section 4.3.

15.2 Liquidity Intent Consent Status










15.3 User Status
Status	Description	Allowed Actions
Invited	User created but hasn't set password.	Can complete registration.
Active	Normal state.	Full access per role.
Inactive	Deactivated by Admin.	Cannot log in.
16. Audit & Immutability Framework
16.1 Audit Principles
Atomicity: Every audit entry is written in the same database transaction as the business operation it records.

Immutability: Audit tables are write‑only at the database level. DENY DELETE, UPDATE permissions enforced.

Completeness: All state‑changing actions across all three services are audited.

16.2 Audit Log Tables
Table Name	Service	Key Fields
AuditLog	Core Platform	AuditId, CompanyId, EventType, ActorId, ActorLabel, IpAddress, Timestamp, Detail
InvoiceAuditLog	Invoice & Receivables	AuditId, InvoiceId, EventType, ActorId, Timestamp, Detail
CashAuditLog	Cash & Expenses	AuditId, CompanyId, EventType, ActorId, Timestamp, Detail
16.3 Audited Events (Partial List)
Domain	Event Types
Company	CompanyRegistered, CompanyLinked, CompanyConfigUpdated
Invoice	InvoiceCreated, InvoiceSent, InvoiceViewed, OtpIssued, OtpVerified, InvoiceAccepted, BuyerConfidenceDeclared, InvoiceRejected, InvoiceLiquidated, InvoiceSettled
Liquidity	LiquidityIntentCreated, BuyerConsentRequested, BuyerConsentConfirmed, BuyerConsentRejected, BuyerConsentExpired
Bank	BankBalanceUpdated, OverdraftUpdated
Expense	ExpenseCreated, ExpenseUpdated, ExpenseDeleted
User	UserInvited, UserActivated, UserDeactivated, RoleChanged
17. Role‑Based Access Control Matrix
Feature / Action	Admin	Finance	Sales
View Dashboard	✓	✓	✓
View Invoices	✓	✓	✓
Create / Edit / Send Invoice	✓	✓	✓ (Create only)
Delete Draft Invoice	✓	✓	✗
View / Manage Expenses	✓	✓	✗
Update Bank Balance / Overdraft	✓	✓	✗
View / Manage Clients	✓	✓	✓ (View only)
Initiate / Confirm Liquidation	✓	✓	✗
View / Manage Users	✓	✗	✗
View / Edit Settings	✓	✗	✗
View Audit Log	✓	✗	✗
18. Integration & Data Flow Reference
18.1 Service Interaction Map








18.2 Internal API Call Summary
Caller	Target	Endpoint	Purpose
Core Platform	PayDay HR	GET /internal/payday/company/lookup	Identity resolution at registration.
Core Platform	PayDay HR	POST /internal/payday/company/create	Create new company.
Cash & Expenses	Core Platform	GET /internal/platform/balance	Day 0 bank balance.
Cash & Expenses	Core Platform	GET /internal/platform/overdraft	Overdraft details.
Cash & Expenses	Core Platform	GET /internal/platform/config/ivr	IVR for waterfall.
Cash & Expenses	Invoice & Receivables	GET /internal/invoices/outstanding	Receivables for forecast.
Invoice & Receivables	Core Platform	GET /internal/platform/officer/:id	Officer email.
Invoice & Receivables	Core Platform	GET /internal/platform/config/ivr	IVR for liquidation snapshot.
19. Glossary of Business Terms
Term	Definition
Available Cash Today	The sum of the current bank balance plus available overdraft (OverdraftLimit − OverdraftUsed).
Buyer Confidence %	The percentage of an invoice's net‑of‑tax value that the buyer declares as undisputed and payable in full.
CCD Invoice ID	A unique, human‑readable identifier assigned to every invoice created in CashDay (e.g., CCD-2026-00123).
Debtor Officer	The individual at the buyer's organisation responsible for invoice acceptance and liquidation consent.
Eligible Liquidation Value (ELV)	The portion of the invoice's net value that is considered eligible for liquidation after applying the buyer's confidence percentage.
Invoice‑to‑Value Ratio (IVR)	A platform‑level risk haircut applied by CCD to the ELV to determine the maximum advanceable amount.
Liquidity Intent	A record of the seller's confirmed request to liquidate a verified invoice, including a snapshot of all risk parameters.
Manual Receivable	An invoice entered into CCD for tracking purposes that was issued outside the platform. Always unverified and ineligible for liquidation.
Net‑of‑Tax Value	The invoice amount excluding all taxes (GrossAmount − TaxAmount). This is the economic value considered for liquidation.
System Receivable	An invoice created and sent through the CCD platform. Eligible for verification and liquidation.
Verified Receivable	An invoice that has been accepted by the buyer via OTP and for which a buyer confidence percentage has been declared. IsVerified = true.
End of CIXOR CashDay Business Process Document v1.0