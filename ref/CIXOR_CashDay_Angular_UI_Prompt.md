# CIXOR CashDay – Full Angular Frontend UI Build Prompt

**Version:** 1.0 | **Classification:** Highly Confidential | **Prepared by:** FINAP Worldwide W.L.L.

> **Purpose of this document:** This is a complete, production-grade Angular frontend build prompt. Every screen, component, interaction, validation rule, state transition, API contract, role gate, and design token is specified here. Nothing is left to assumption. An engineer should be able to implement the entire frontend solely from this document.

---

## Table of Contents

1. [System Overview & Goals](#1-system-overview--goals)
2. [Tech Stack & Architecture Decision](#2-tech-stack--architecture-decision)
3. [Project Folder Structure](#3-project-folder-structure)
4. [Design System & Theming](#4-design-system--theming)
5. [Routing & Navigation Map](#5-routing--navigation-map)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Layout Shell](#7-layout-shell)
8. [Feature: Auth Pages](#8-feature-auth-pages)
9. [Feature: Dashboard](#9-feature-dashboard)
10. [Feature: Invoices](#10-feature-invoices)
11. [Feature: Expenses](#11-feature-expenses)
12. [Feature: Bank Balance & Overdraft](#12-feature-bank-balance--overdraft)
13. [Feature: Clients & Debtor Officers](#13-feature-clients--debtor-officers)
14. [Feature: Users & Role Management](#14-feature-users--role-management)
15. [Feature: Settings](#15-feature-settings)
16. [Feature: Audit Log](#16-feature-audit-log)
17. [Public: Acceptance Portal](#17-public-acceptance-portal)
18. [Public: Consent Portal](#18-public-consent-portal)
19. [Shared Components Library](#19-shared-components-library)
20. [Services & HTTP Layer](#20-services--http-layer)
21. [State Management (NgRx)](#21-state-management-ngrx)
22. [Guards & Directives](#22-guards--directives)
23. [Error Handling Strategy](#23-error-handling-strategy)
24. [Performance Requirements](#24-performance-requirements)
25. [API Contract Reference](#25-api-contract-reference)

---

## 1. System Overview & Goals

### 1.1 What The Application Does

CIXOR CashDay (CCD) is an SME financial co-pilot platform. It solves the liquidity timing gap that causes profitable SMEs to fail: they deliver goods/services today but receive payment in 30–60 days, while obligations (salaries, rent, suppliers) are due immediately.

The platform provides four interlocking capabilities:

| Capability | What the UI must deliver |
|---|---|
| **Compliant Invoice Engine** | Create, send, and track country-specific invoices with real-time Net/Tax/Gross calculations and unique CCD Invoice IDs |
| **Buyer Verification** | A public OTP-gated acceptance portal where buyers declare undisputed value, creating a legally defensible Verified Receivable |
| **90-Day Cash-Flow Forecast** | An interactive chart (30 daily + two 30-day aggregate blocks) combining bank balance, receivables, payables, and expenses |
| **Liquidation Simulator & Execution** | What-if overlays on the forecast chart, then a confirmation flow to execute liquidation with buyer consent |

### 1.2 User Types

| Role | Access Summary |
|---|---|
| **Admin** | Full access to all features and settings. Can invite/deactivate users. |
| **Finance** | Dashboard, full invoice CRUD, expenses, bank, clients. Cannot manage users or settings. |
| **Sales** | Dashboard (view), create invoices (not delete), view clients. No expenses, bank, users, settings, or liquidation. |
| **Debtor Officer** | *External user — no login.* Accesses only the public Acceptance Portal via email link. |

### 1.3 Non-Negotiable UX Principles

1. **Forecast chart is the hero element.** The dashboard must feel fast—render within 200ms from cached data.
2. **Simulation is non-destructive.** Entering simulation mode (typing in a simulate field) must never trigger API calls for liquidation.
3. **Status progression is always forward-only.** UI must never offer state-backward actions.
4. **Role enforcement is dual-layered:** route guards + `*ccdRole` directive hides UI elements.
5. **The acceptance portal requires zero login.** It must work as a standalone page accessible via email link.
6. **All monetary amounts use locale-aware formatting** (e.g., LKR 1,150,000.00). Currency and locale are per company settings.

---

## 2. Tech Stack & Architecture Decision

### 2.1 Core Framework & Tooling

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Angular 17+** (standalone components) | Specified by client |
| Language | **TypeScript 5+** strict mode | Type safety across all models |
| Build | **Angular CLI + esbuild** | Fast build, watch |
| State | **NgRx 17+** (Store + Effects + ComponentStore for local) | Predictable state, DevTools support |
| Forms | **Angular Reactive Forms** | Complex validation, dynamic line items |
| HTTP | **Angular HttpClient** with interceptors | JWT injection, error handling |
| Charts | **ApexCharts** (via `ng-apexcharts`) | Rich line chart, dual series, annotations |
| UI Library | **Angular Material 17+** (Material Design 3) with custom theme | Dialogs, snackbars, form fields |
| Routing | **Angular Router** with lazy-loaded feature modules | Code-splitting per feature |
| Styling | **SCSS** + CSS custom properties (design tokens) | Theming, dark mode support |
| Linting | **ESLint** + `@angular-eslint` | Code quality |
| Testing | **Jest** (unit) + **Cypress** (e2e) | As per QA requirements |
| Icons | **Material Icons** + custom SVGs | Consistent iconography |
| Date Handling | **date-fns** | Consistent date manipulation |
| Notifications | **Angular Material Snackbar** + custom toast component | Success/error/info feedback |

### 2.2 Key Architecture Patterns

- **Feature Module Architecture:** Each business domain (invoices, expenses, bank, etc.) is a lazy-loaded feature module.
- **Smart / Dumb Component Pattern:** Feature page components are "smart" (connect to store, call services). Presentational components are "dumb" (inputs/outputs only).
- **Signals for local reactive state** (Angular 17 Signals API) where NgRx store is overkill.
- **HTTP Interceptors:** `AuthInterceptor` for JWT Bearer tokens; `ErrorInterceptor` for global error handling.
- **Environment-based configuration:** `environment.ts` / `environment.prod.ts` for API base URLs.

---

## 3. Project Folder Structure

```
cixor-cashday/
├── src/
│   ├── app/
│   │   ├── core/                          # Singleton services, guards, interceptors
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts          # Redirects unauthenticated users to /login
│   │   │   │   └── role.guard.ts          # Redirects users lacking required role
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts    # Attaches JWT Bearer header
│   │   │   │   └── error.interceptor.ts   # Global HTTP error handling
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── dashboard.service.ts
│   │   │   │   ├── invoice.service.ts
│   │   │   │   ├── expense.service.ts
│   │   │   │   ├── bank.service.ts
│   │   │   │   ├── client.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── audit.service.ts
│   │   │   │   ├── acceptance-portal.service.ts
│   │   │   │   └── notification.service.ts
│   │   │   └── models/                    # All TypeScript interfaces/types/enums
│   │   │       ├── auth.models.ts
│   │   │       ├── invoice.models.ts
│   │   │       ├── expense.models.ts
│   │   │       ├── bank.models.ts
│   │   │       ├── client.models.ts
│   │   │       ├── user.models.ts
│   │   │       ├── dashboard.models.ts
│   │   │       └── audit.models.ts
│   │   │
│   │   ├── layout/                        # App shell - authenticated layout wrapper
│   │   │   ├── shell/
│   │   │   │   └── shell.component.ts     # Main authenticated layout (sidebar + topbar + router-outlet)
│   │   │   ├── sidebar/
│   │   │   │   └── sidebar.component.ts   # Navigation sidebar (role-filtered)
│   │   │   ├── topbar/
│   │   │   │   └── topbar.component.ts    # Top navigation bar (user info, notifications, logout)
│   │   │   └── public-layout/
│   │   │       └── public-layout.component.ts  # Layout for acceptance/consent portals
│   │   │
│   │   ├── features/                      # Lazy-loaded feature modules
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── set-password/
│   │   │   ├── dashboard/
│   │   │   ├── invoices/
│   │   │   │   ├── invoice-list/
│   │   │   │   ├── invoice-detail/
│   │   │   │   ├── invoice-form/
│   │   │   │   └── invoice-audit-trail/
│   │   │   ├── expenses/
│   │   │   │   ├── expense-list/
│   │   │   │   └── expense-form-modal/
│   │   │   ├── bank/
│   │   │   ├── clients/
│   │   │   │   ├── client-list/
│   │   │   │   ├── client-detail/
│   │   │   │   └── officer-form-modal/
│   │   │   ├── users/
│   │   │   ├── settings/
│   │   │   ├── audit/
│   │   │   ├── acceptance-portal/         # Public route (no auth)
│   │   │   │   ├── step-invoice-review/
│   │   │   │   ├── step-otp-verify/
│   │   │   │   ├── step-confidence/
│   │   │   │   ├── step-reject-reason/
│   │   │   │   └── step-confirmation/
│   │   │   └── consent-portal/            # Public route (no auth)
│   │   │       ├── step-summary/
│   │   │       ├── step-otp-verify/
│   │   │       ├── step-review/
│   │   │       └── step-confirmation/
│   │   │
│   │   ├── shared/                        # Reusable presentational components & pipes
│   │   │   ├── components/
│   │   │   │   ├── status-badge/
│   │   │   │   ├── data-table/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   ├── loading-overlay/
│   │   │   │   ├── waterfall-display/
│   │   │   │   ├── amount-display/
│   │   │   │   ├── empty-state/
│   │   │   │   └── page-header/
│   │   │   ├── directives/
│   │   │   │   └── ccd-role.directive.ts  # *ccdRole="['Admin','Finance']"
│   │   │   └── pipes/
│   │   │       ├── currency-format.pipe.ts
│   │   │       └── invoice-status.pipe.ts
│   │   │
│   │   ├── store/                         # NgRx global store
│   │   │   ├── app.state.ts
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── invoices/
│   │   │   ├── expenses/
│   │   │   ├── bank/
│   │   │   ├── clients/
│   │   │   └── users/
│   │   │
│   │   ├── app.config.ts                  # provideRouter, provideHttpClient, etc.
│   │   ├── app.routes.ts                  # Root route definitions
│   │   └── app.component.ts
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── assets/
│   ├── styles/
│   │   ├── _tokens.scss               # Design tokens
│   │   ├── _typography.scss
│   │   ├── _layout.scss
│   │   └── styles.scss                # Global styles, Material theme
│   └── index.html
├── angular.json
├── tsconfig.json
└── package.json
```

---

## 4. Design System & Theming

### 4.1 Design Tokens (SCSS Custom Properties)

```scss
:root {
  // Brand colors
  --ccd-primary:         #00C9A7;   // Teal — main accent, CTAs
  --ccd-primary-light:   #33D7B8;
  --ccd-primary-dark:    #009E84;
  --ccd-secondary:       #4FACFE;   // Blue — secondary actions, links
  --ccd-accent:          #F7971E;   // Amber — warnings, highlights

  // Semantic colors
  --ccd-success:         #3FB950;
  --ccd-warning:         #D29922;
  --ccd-danger:          #F85149;
  --ccd-info:            #4FACFE;

  // Surface colors (dark theme default)
  --ccd-bg:              #0D1117;
  --ccd-surface-1:       #161B22;   // Cards, sidebar
  --ccd-surface-2:       #1F2937;   // Table headers, inner cards
  --ccd-border:          #30363D;
  --ccd-text:            #E6EDF3;
  --ccd-text-muted:      #8B949E;
  --ccd-text-disabled:   #484F58;

  // Chart colors
  --ccd-chart-actual:    #00C9A7;   // Actual forecast line
  --ccd-chart-hypo:      #00BFFF;   // Hypothetical (simulation) line — dashed cyan
  --ccd-chart-negative:  #F85149;   // Line color when cash goes negative
  --ccd-chart-grid:      #21262D;

  // Spacing scale
  --space-1: 0.25rem;   // 4px
  --space-2: 0.5rem;    // 8px
  --space-3: 0.75rem;   // 12px
  --space-4: 1rem;      // 16px
  --space-5: 1.25rem;   // 20px
  --space-6: 1.5rem;    // 24px
  --space-8: 2rem;      // 32px
  --space-10: 2.5rem;   // 40px

  // Type scale
  --text-xs:    0.72rem;
  --text-sm:    0.85rem;
  --text-base:  1rem;
  --text-lg:    1.15rem;
  --text-xl:    1.35rem;
  --text-2xl:   1.6rem;
  --text-3xl:   2rem;

  // Border radius
  --radius-sm:  0.35rem;
  --radius-md:  0.6rem;
  --radius-lg:  0.9rem;
  --radius-xl:  1.25rem;
  --radius-full: 999px;

  // Shadows
  --shadow-sm: 0 1px 3px rgba(0,0,0,.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,.5);
  --shadow-lg: 0 8px 32px rgba(0,0,0,.6);
}
```

### 4.2 Typography

- **Font family:** `'Inter', 'Segoe UI', system-ui, sans-serif`
- **Monospace (amounts, IDs):** `'JetBrains Mono', 'Fira Code', monospace`
- **H1:** 2rem, weight 800 — page titles only
- **H2:** 1.35rem, weight 700 — section headers
- **H3:** 1.1rem, weight 600 — card headers
- **Body:** 1rem, weight 400
- **Caption/Label:** 0.75rem, uppercase, letter-spacing 0.06em, weight 600, `var(--ccd-text-muted)`

### 4.3 Component Patterns

#### Stat Card
```
┌─────────────────────────────┐
│  LABEL (caption)            │
│  VALUE (3xl, bold, primary) │
│  Sub-text (muted, sm)       │
└─────────────────────────────┘
```

#### Status Badge
Pill-shaped, color-coded per invoice status:
| Status | Background | Text |
|---|---|---|
| Draft | `rgba(79,172,254,.15)` | `--ccd-secondary` |
| Sent | `rgba(247,151,30,.15)` | `--ccd-accent` |
| Viewed | `rgba(247,151,30,.2)` | amber-lighter |
| Accepted | `rgba(0,201,167,.15)` | `--ccd-primary` |
| Rejected | `rgba(248,81,73,.15)` | `--ccd-danger` |
| Liquidated | `rgba(79,172,254,.2)` | `--ccd-secondary` |
| Settled | `rgba(63,185,80,.15)` | `--ccd-success` |
| Deleted | `rgba(132,141,154,.15)` | muted |
| Pending | `rgba(247,151,30,.15)` | amber |

#### Data Table
- Background: `--ccd-surface-1`
- Header row: `--ccd-surface-2`, caption text, uppercase labels
- Row hover: `rgba(255,255,255,.025)`
- Row border: `1px solid var(--ccd-border)`
- Sticky first column support for wide tables

#### Modals / Dialogs
- Angular Material `MatDialog`
- Backdrop: `rgba(0,0,0,.7)`
- Panel class: `ccd-dialog` (width: 540px default, 680px for forms)
- Header: title + close button
- Footer: action buttons right-aligned (Cancel + Primary action)

---

## 5. Routing & Navigation Map

### 5.1 Route Tree

```
/                          → redirect to /dashboard (if auth) or /login (if not)
│
├── /login                 → LoginComponent            [public]
├── /register              → RegisterComponent         [public]
├── /set-password/:token   → SetPasswordComponent      [public]
├── /acceptance/portal/:token → AcceptancePortalComponent [public, no layout]
├── /consent/portal/:token    → ConsentPortalComponent    [public, no layout]
│
└── / (ShellComponent - authenticated layout)
    ├── /dashboard                     AuthGuard
    ├── /invoices                      AuthGuard
    │   ├── (index - list)
    │   ├── /new                       RoleGuard(['Admin','Finance','Sales'])
    │   ├── /:id                       
    │   └── /:id/edit                  RoleGuard(['Admin','Finance'])
    ├── /expenses                      AuthGuard + RoleGuard(['Admin','Finance'])
    ├── /bank                          AuthGuard + RoleGuard(['Admin','Finance'])
    ├── /clients                       AuthGuard
    │   ├── (index - list)
    │   └── /:id
    ├── /users                         AuthGuard + RoleGuard(['Admin'])
    ├── /settings                      AuthGuard + RoleGuard(['Admin'])
    └── /audit                         AuthGuard + RoleGuard(['Admin'])
```

### 5.2 Sidebar Navigation Items (Role-filtered)

| Item | Icon | Route | Visible To |
|---|---|---|---|
| Dashboard | `dashboard` | `/dashboard` | All |
| Invoices | `receipt_long` | `/invoices` | All |
| Expenses | `payments` | `/expenses` | Admin, Finance |
| Bank | `account_balance` | `/bank` | Admin, Finance |
| Clients | `groups` | `/clients` | All |
| Users | `manage_accounts` | `/users` | Admin |
| Settings | `settings` | `/settings` | Admin |
| Audit Log | `history` | `/audit` | Admin |

---

## 6. Authentication & Authorization

### 6.1 JWT Token Handling

- On login/register success, the API returns `{ token: string, companyId: string }`.
- Store the JWT in `localStorage` under key `ccd_access_token`.
- Store decoded claims (`sub`, `companyId`, `role`, `name`, `email`) in the NgRx Auth store.
- The `AuthInterceptor` reads the token from `localStorage` and attaches `Authorization: Bearer <token>` to every outgoing request (excluding public AcceptancePortal/ConsentPortal endpoints).
- On `401 Unauthorized` response, dispatch `authLogout` action → clear localStorage → navigate to `/login`.

### 6.2 Auth Store (NgRx)

```typescript
interface AuthState {
  user: {
    userId: string;
    companyId: string;
    email: string;
    name: string;
    role: 'Admin' | 'Finance' | 'Sales';
  } | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
```

**Actions:** `login`, `loginSuccess`, `loginFailure`, `logout`, `setPasswordSuccess`, `restoreSession`

**Effects:**
- `login$` → calls `POST /api/platform/auth/login` → on success dispatches `loginSuccess` + stores token → navigates to `/dashboard`
- `logout$` → clears localStorage → navigates to `/login`
- `restoreSession$` → on app init, checks localStorage for token → decodes and dispatches `loginSuccess` if valid

### 6.3 Role Guard

```typescript
// Usage in routes:
canActivate: [RoleGuard],
data: { roles: ['Admin', 'Finance'] }
```

- Injects `AuthService`, reads current user role.
- If role is not in `data.roles`, redirects to `/dashboard` with a snackbar: "You don't have permission to access this area."

### 6.4 `*ccdRole` Structural Directive

```html
<!-- Hides the element if user role is not in the list -->
<button *ccdRole="['Admin', 'Finance']">Delete Draft</button>
<mat-list-item *ccdRole="['Admin']">Users</mat-list-item>
```

---

## 7. Layout Shell

### 7.1 Shell Component

The authenticated app shell consists of:
- **Left Sidebar** (fixed, 240px wide, collapsed to 60px on mobile)
- **Top Bar** (64px height, full width minus sidebar)
- **Main Content Area** (scrollable `<router-outlet>`)

#### Sidebar Anatomy

```
┌─────────────────────────────────┐
│  [LOGO] CIXOR CashDay           │  ← 56px header, logo + brand name
├─────────────────────────────────┤
│  ● Dashboard                    │  ← Active item: left border accent + bg tint
│    Invoices                     │
│    Expenses                     │
│    Bank                         │
│    Clients                      │
│    ──────────────────           │  ← Divider
│    Users                        │
│    Settings                     │
│    Audit Log                    │
├─────────────────────────────────┤
│  [Avatar] Akila Perera     ↕    │  ← User mini-profile at bottom
│  Finance                        │
└─────────────────────────────────┘
```

- Active route: left border `3px solid var(--ccd-primary)`, background `rgba(0,201,167,.07)`, text `var(--ccd-primary)`.
- Nav items hidden via `*ccdRole` directive based on current user role.
- On hover: background `rgba(255,255,255,.04)`.

#### Top Bar Anatomy

```
┌───────────────────────────────────────────────────────────┐
│  [Page Title]                   [🔔 Notifications] [Avatar]│
└───────────────────────────────────────────────────────────┘
```

- Page title is set dynamically per route via a `TitleService`.
- Notification bell: badge with count; clicking opens a panel listing recent events.
- Avatar: clicking opens a menu: "My Profile", "Sign Out".

### 7.2 Public Layout (Acceptance/Consent Portal)

Minimal layout — no sidebar, no topbar:
```
┌─────────────────────────────────┐
│  [CIXOR Logo] CashDay           │  ← 56px header, center-aligned
├─────────────────────────────────┤
│                                 │
│       <router-outlet />         │  ← Portal content, centered card max-width 560px
│                                 │
└─────────────────────────────────┘
```

---

## 8. Feature: Auth Pages

### 8.1 Login Page (`/login`)

**Layout:** Single centered card (max-width 420px), vertically centered on screen.

**Form Fields:**
| Field | Type | Validation |
|---|---|---|
| Email | `email` input | Required, valid email format |
| Password | `password` input (toggle show/hide) | Required, min 8 chars |

**Elements:**
- CIXOR CashDay logo + tagline "Your SME Financial Co-Pilot"
- Reactive form with `FormBuilder`
- "Login" primary button (full width, loading spinner during request)
- "Don't have an account? Register" link → `/register`
- "Forgot password?" link (post-MVP placeholder)
- Error banner on HTTP 401: "Invalid email or password."

**API:** `POST /api/platform/auth/login` → `{ email, password }` → `{ token, companyId }`

**On Success:** Dispatch `loginSuccess`, store token, navigate to `/dashboard`.

---

### 8.2 Register Page (`/register`)

**Layout:** Multi-step flow (3 steps), progress indicator at top.

#### Step 1: Company Details

**Form Fields:**
| Field | Type | Validation | Notes |
|---|---|---|---|
| Legal Company Name | text | Required, min 2 chars | |
| Tax Registration Number | text | Required | Used for Priority 1 identity lookup |
| Business Registration Number | text | Required | Priority 2 lookup |
| Email Domain | text | Required, domain format | e.g. `mycompany.com` |
| Country | dropdown | Required | Populates country list from `GET /api/platform/countries` |

**Behavior:** On "Next", call `POST /api/platform/register/lookup` with the form data. Handle the response:

- **Priority 1 or 2 match:** Advance to Step 2a (Company Confirmation).
- **Priority 3 fuzzy match:** Show a "Did you mean...?" confirmation card with the matched company's details. User clicks "Yes, that's my company" → advance to Step 3 with `existingCompanyId`. User clicks "No, create new" → call create, advance to Step 3.
- **No match (Priority 4):** Skip Step 2a, advance directly to Step 3.
- **409 Conflict:** Show inline error: "This company is already registered in CashDay."
- **503:** "Service temporarily unavailable. Please try again in a moment."

#### Step 2a: Company Confirmation (only shown for Priority 3 fuzzy match)

Display a card showing the matched company's details (Legal Name, Tax Reg, Business Reg). Buttons:
- "Yes, this is my company" → continue registration with `existingCompanyId`
- "No, create new company" → continue with new company flow

#### Step 3: Admin User Setup

**Form Fields:**
| Field | Type | Validation |
|---|---|---|
| Your Full Name | text | Required |
| Your Email Address | email | Required, valid email, must match company email domain |
| Password | password | Required, min 8 chars, complexity: upper + lower + number |
| Confirm Password | password | Must match password |
| Accept Terms | checkbox | Required |

**"Create Account" button:** Calls `POST /api/platform/register` with all data. On success → store JWT → navigate to `/dashboard`.

---

### 8.3 Set Password Page (`/set-password/:token`)

**Purpose:** Used when an invited user clicks the link in their invitation email.

**Form Fields:**
| Field | Validation |
|---|---|
| New Password | Required, min 8 chars, complexity |
| Confirm Password | Must match |

**API:** `POST /api/platform/users/set-password` with `{ token, password }`.

**On Success:** Auto-login (store returned JWT), navigate to `/dashboard` with welcome toast.

**Token Validation:** On page load, call `GET /api/platform/users/verify-invite-token/:token`. If invalid/expired, show error page with "This link has expired or is invalid. Please contact your administrator."

---

## 9. Feature: Dashboard

### 9.1 Overview

The Dashboard is the most complex and most important page. It combines:
1. **KPI Summary Cards** — Key financial figures at a glance
2. **90-Day Cash-Flow Chart** — The primary forecast visualization
3. **Verified Invoices Panel** — The liquidation simulation workspace
4. **Simulation Summary Bar** — Appears when simulation is active

**Route:** `/dashboard`
**Guards:** `AuthGuard`
**Roles:** All authenticated roles (Admin, Finance, Sales)

**On Load:** Dispatch `loadDashboard` NgRx action → effect calls `GET /api/dashboard` → populates store.

---

### 9.2 KPI Summary Cards Row

Four cards displayed in a horizontal row (responsive: 2×2 on tablet, 1×4 on desktop):

| Card | Value | Sub-text | Color condition |
|---|---|---|---|
| **Available Cash Today** | `availableCashToday` formatted with currency | "Bank balance + available overdraft" | Red if < 0 |
| **Bank Balance** | `bankBalance` | "As of [date]" with "Update" link | — |
| **Overdraft Available** | `overdraftLimit - overdraftUsed` | "Limit: X · Used: Y" | Yellow if > 80% used |
| **Verified Invoices** | Count of verified (liquidation-eligible) invoices | "LKR X available to liquidate" (sum of ATL) | — |

Each card has a subtle icon, a label, a value, and a sub-text. The "Available Cash Today" card is the largest (double width on desktop).

---

### 9.3 90-Day Cash-Flow Chart

**Library:** ApexCharts (used via `ng-apexcharts`)

**Chart Type:** `line` with area fill below zero

**Series:**
1. **"Actual Cash Flow"** — solid line, color `var(--ccd-chart-actual)` (teal) when positive, switches to `var(--ccd-chart-negative)` (red) when negative. Filled below.
2. **"With Liquidation"** — dashed line, color `var(--ccd-chart-hypo)` (cyan). Only visible when simulation is active.

**X-Axis:**
- Days 1–30: every day as a tick
- Days 31–60: aggregated; show one tick labeled "31–60 Days"
- Days 61–90: aggregated; show one tick labeled "61–90 Days"

**Y-Axis:** Auto-scaled, currency formatted (abbreviated: "LKR 1.2M").

**Annotations:**
- A horizontal dashed line at Y=0 (zero cash line), labeled "Zero"
- Vertical dotted lines separating the three 30-day periods

**Tooltip (hover/tap):**
- Day N (date)
- Cash Position: LKR X
- Receipts today: LKR X (list of invoices)
- Payments today: LKR X (list of expenses/payables)
- Net change: ±LKR X
- If simulation active, also shows "Simulated impact: +LKR X"

**Chart Options:**
```typescript
chartOptions: ApexCharts = {
  chart: { type: 'area', height: 320, background: 'transparent', toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 400 } },
  stroke: { curve: 'smooth', width: [2, 2], dashArray: [0, 8] },
  fill: { type: 'gradient', gradient: { shadeIntensity: 0.3, opacityFrom: 0.4, opacityTo: 0.05 } },
  grid: { borderColor: 'var(--ccd-chart-grid)' },
  xaxis: { type: 'category', labels: { style: { colors: 'var(--ccd-text-muted)', fontSize: '11px' } } },
  yaxis: { labels: { formatter: (val) => currencyFormat(val) } },
  legend: { position: 'top', horizontalAlign: 'right' },
  colors: ['var(--ccd-chart-actual)', 'var(--ccd-chart-hypo)'],
}
```

---

### 9.4 Verified Invoices Panel (Simulation Workspace)

This panel appears **below the chart** only when `verifiedInvoices.length > 0`.

**Panel Header:**
- Title: "Verified Invoices — Available for Liquidation"
- Subtitle: "Enter an amount to simulate the cash-flow impact. You can simulate multiple invoices at once."
- Visible only to **Admin** and **Finance** roles (`*ccdRole="['Admin','Finance']"`)

**Table Columns:**

| Column | Description |
|---|---|
| CCD Invoice ID | `CCD-2026-00123` (monospace, clickable → opens invoice detail) |
| Customer | Customer legal name |
| Due Date | Formatted date, color-coded: red if < 7 days |
| Gross Amount | Right-aligned, currency formatted |
| Buyer Confidence | `92%` with a mini progress bar |
| Net-of-Tax | Right-aligned, currency formatted |
| ELV | Right-aligned, currency formatted (Net × Confidence%) |
| Avail. to Liquidate | Right-aligned, **bold**, `var(--ccd-primary)` |
| Simulate | Input field (numeric, max = ATL) + "Simulate" chip button. Empty = not simulating. |

**Simulate Input Field behavior:**
- `type="number"`, `min=1`, `max=availableToLiquidate`
- Placeholder: `"e.g. 500,000"`
- On Enter key or blur: dispatch `runSimulation` action (only if value > 0)
- Client-side validation: show red border + tooltip "Must be between 1 and [ATL]" if out of range
- When simulating: field has a cyan glow border, row highlighted with subtle cyan tint

**Simulation Summary Bar** (appears below table when any simulate field has a value):
```
┌────────────────────────────────────────────────────────────────────────┐
│ Simulating 2 invoice(s) · Gross requested: LKR 1,200,000              │
│ CCD Fee (2.5%): LKR 30,000 · Net Injection: LKR 1,170,000            │
│                   [Reset Simulation]    [Proceed to Liquidation →]    │
└────────────────────────────────────────────────────────────────────────┘
```
- "Reset Simulation" → clears all simulate fields, removes hypothetical chart line, calls `POST /api/dashboard/simulate/reset`
- "Proceed to Liquidation" → only for Admin/Finance; opens Liquidation Confirmation Dialog

---

### 9.5 Liquidation Confirmation Dialog

**Trigger:** User clicks "Proceed to Liquidation" in simulation summary bar.

**Dialog Width:** 680px

**Content:**

**Section 1 — Per Invoice Breakdown:**
Table with columns: Invoice ID | Customer | Due Date | Requested Amount | CCD Fee | Net to You | Buyer Consent Notice

**Section 2 — Summary Totals:**
```
Total Requested:    LKR 1,200,000
Platform Fee:       LKR 30,000
Net Cash to You:    LKR 1,170,000
```

**Section 3 — Cash Position Impact:**
```
Available Cash Before:  LKR 450,000
Net Injection:         +LKR 1,170,000
Projected Cash After:   LKR 1,620,000
```

**Section 4 — Important Disclosures:**
- "Settlement path disclosure: The buyer will be required to pay CCD directly on the invoice due date."
- "Buyer consent notice: Each buyer will receive an email requesting consent. Liquidation requires buyer confirmation within 48 hours."
- "You acknowledge by confirming that this is a binding request."

**Section 5 — Pre-confirmation Checkbox:**
- "I have reviewed the terms above and confirm my liquidation request."

**Buttons:**
- "Cancel" (secondary) → closes dialog, simulation state preserved
- "Confirm & Request Liquidation" (primary, disabled until checkbox ticked) → calls `POST /api/invoices/liquidate` (batch)

**On Success:**
- Dismiss dialog
- Show success snackbar: "Liquidation request submitted. Awaiting buyer consent."
- Reload dashboard (dispatch `loadDashboard`)
- Affected invoice rows show a "Consent Pending" badge instead of simulate input

---

### 9.6 Dashboard Store (NgRx)

```typescript
interface DashboardState {
  availableCashToday: number | null;
  bankBalance: number | null;
  overdraftLimit: number | null;
  overdraftUsed: number | null;
  forecast: ForecastDay[];           // 90 items
  verifiedInvoices: VerifiedInvoice[];
  hypotheticalForecast: ForecastDay[] | null;  // null when not simulating
  simulation: {
    sessionId: string | null;
    selections: { invoiceId: string; amount: number }[];
    totalInjection: number;
    totalFees: number;
    netInjection: number;
  };
  isLoading: boolean;
  isSimulating: boolean;
  error: string | null;
}
```

---

## 10. Feature: Invoices

### 10.1 Invoice List Page (`/invoices`)

**Header Row:**
- Page title: "Invoices"
- Buttons (role-gated):
  - "New Invoice" (primary) → `/invoices/new` — Admin, Finance, Sales
  - "Add Manual Receivable" (secondary) → opens modal — Admin, Finance
  - "Add Manual Payable" (secondary) → opens modal — Admin, Finance

**Filter Bar:**
- **Classification tabs:** All | Receivables | Payables (tab strip)
- **Status filter** (multi-select chip list): Draft, Sent, Viewed, Accepted, Rejected, Liquidated, Settled
- **Search** (text input): searches CCD Invoice ID, customer name
- **Date range picker:** Issue Date or Due Date filter

**Table Columns (Receivables):**

| Column | Notes |
|---|---|
| CCD Invoice ID | Monospace, link to detail |
| Customer | Company name |
| Officer | Debtor officer name |
| Issue Date | Formatted |
| Due Date | Color: red if overdue, amber if due in ≤7 days |
| Net Amount | Right-aligned |
| Tax Amount | Right-aligned |
| Gross Amount | Right-aligned, bold |
| Status | `StatusBadge` component |
| Verified | Green tick icon `✓` or dash |
| Actions | Contextual action menu (kebab) |

**Row Action Menu (items shown depending on status + role):**

| Action | Visible When | Role Required |
|---|---|---|
| View | Always | All |
| Edit | Status = Draft | Admin, Finance |
| Send | Status = Draft | Admin, Finance |
| Delete | Status = Draft | Admin, Finance |
| Mark as Settled | Status = Accepted (non-liquidated) | Admin, Finance |
| View Audit Trail | Always | Admin |

**Pagination:** 25 items per page, with page size selector (10/25/50).

**Empty state:** Illustration + "No invoices yet. Create your first invoice." + "New Invoice" button.

---

### 10.2 Invoice Form — New/Edit (`/invoices/new`, `/invoices/:id/edit`)

**Only System Receivables** can be created/edited via this form.

**Form Layout:** Two-column layout on desktop (invoice header left, customer/officer right), full-width for line items.

#### Invoice Header Fields

| Field | Type | Validation | Notes |
|---|---|---|---|
| Invoice Date | date picker | Required | Default: today |
| Due Date | date picker | Required | Must be >= invoice date |
| Invoice Reference | text | Optional | Additional seller reference |
| Country Template | dropdown | Required | Auto-populated from company settings; determines tax logic |

#### Customer & Officer Fields

| Field | Type | Validation | Notes |
|---|---|---|---|
| Customer | searchable dropdown | Required | Fetches `GET /api/platform/customers` |
| Debtor Officer | searchable dropdown | Required | Filtered by selected customer. Re-fetches when customer changes: `GET /api/platform/customers/:id/officers` |
| "Add New Customer" | link | — | Opens ClientFormModal inline |
| "Add New Officer" | link | — | Opens OfficerFormModal inline |

#### Line Items Section

**Dynamic table** (add/remove rows):

| Column | Type | Validation |
|---|---|---|
| Description | text | Required |
| Quantity | number | Required, > 0 |
| Unit Price | currency input | Required, > 0 |
| Tax Rate % | dropdown | Required (from country template tax rates, e.g. 0%, 5%, 15%) |
| Net Amount | computed: Qty × UnitPrice | Read-only |
| Tax Amount | computed: Net × TaxRate | Read-only |
| Gross Amount | computed: Net + Tax | Read-only |
| Remove | button | — |

**"Add Line Item" button** — appends a new empty row.

**All computed fields update in real-time** using `valueChanges` subscriptions on the `FormArray`.

#### Invoice Totals Footer (read-only)

```
                          Net Total:    LKR 1,000,000.00
                          Tax Total:    LKR   150,000.00
                    ─────────────────────────────────────
                          Gross Total:  LKR 1,150,000.00
```

#### Form Action Buttons

| Button | Action | Notes |
|---|---|---|
| Save as Draft | `POST /api/invoices` with `{ ...formValues, action: 'draft' }` | Navigates to invoice detail on success |
| Send Invoice | `POST /api/invoices` then `POST /api/invoices/:id/send` | Requires all fields valid. Shows confirmation dialog first. |
| Cancel | Navigate back | Prompts "Discard unsaved changes?" if form is dirty |

**Pre-send confirmation dialog:**
- "You are about to send this invoice to [Officer Name] at [Customer]."
- "Once sent, the invoice cannot be edited."
- Accept + Send / Cancel

---

### 10.3 Invoice Detail Page (`/invoices/:id`)

**Header:** CCD Invoice ID (large, monospace), status badge, action menu.

**Invoice Info Section:**
```
Seller: [Company Name]                   Customer: [Customer Legal Name]
Tax Reg: [TaxRegNumber]                  Debtor Officer: [Name] · [Email]
Invoice Date: DD MMM YYYY                Due Date: DD MMM YYYY
CCD Invoice ID: CCD-2026-00123
```

**Line Items Table:** same columns as form (read-only).

**Totals:** Net / Tax / Gross.

**Waterfall Section** (only shown if `IsVerified = true`):

```
┌─── Risk Waterfall ────────────────────────────────────────────────────┐
│  Gross Amount:              LKR 1,150,000                             │
│  Less: Tax Amount:         -LKR   150,000                             │
│  Net-of-Tax Value:          LKR 1,000,000                             │
│                                                                       │
│  × Buyer Confidence (92%):  LKR   920,000  ← ELV                     │
│  × Platform IVR (85%):      LKR   782,000  ← Available to Liquidate  │
│                                                                       │
│  ┌───────────────────────────────────────────────────────┐           │
│  │  ✓ Available to Liquidate:    LKR 782,000             │           │
│  └───────────────────────────────────────────────────────┘           │
└───────────────────────────────────────────────────────────────────────┘
```

Use the `WaterfallDisplayComponent` (see section 19).

**Liquidity Intent Section** (shown if intent exists):
- `BuyerConsentStatus` badge (Pending/Confirmed/Rejected/Expired)
- Requested Amount, CCD Fee, Net to Seller
- Consent expiry countdown (if Pending)

**Audit Timeline Section** (at bottom):
Timeline of `InvoiceAuditLog` events:
```
● InvoiceSent          — Admin User · 10 Apr 2026, 14:32
● OtpVerified          — Buyer Portal · 10 Apr 2026, 16:05
● InvoiceAccepted      — Buyer Portal · 10 Apr 2026, 16:07
● BuyerConfidenceDeclared (92%) — Buyer Portal · 10 Apr 2026, 16:07
```

---

### 10.4 Invoice Store (NgRx)

```typescript
interface InvoiceState {
  invoices: Invoice[];
  selectedInvoice: InvoiceDetail | null;
  filters: { classification: string; statuses: string[]; search: string; };
  pagination: { page: number; pageSize: number; total: number; };
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}
```

---

## 11. Feature: Expenses

### 11.1 Expenses Page (`/expenses`)

**Guards:** `AuthGuard` + `RoleGuard(['Admin','Finance'])`

**Tabs:** Recurring | One-Off | Unplanned

---

#### Tab 1: Recurring Expenses

**Table Columns:**
| Column | Notes |
|---|---|
| Name | Expense name |
| Amount | Right-aligned, currency |
| Frequency | Badge: Weekly / Monthly / Quarterly |
| Category | e.g. Rent, Salaries, Loan |
| Start Date | formatted |
| End Date | formatted or "–" if none |
| Next Due | Computed next occurrence |
| Actions | Edit, Delete |

**"Add Recurring Expense" button** → opens `ExpenseFormModal` with type = Recurring.

**ExpenseFormModal — Recurring:**
| Field | Validation |
|---|---|
| Name | Required |
| Amount | Required, > 0 |
| Category | dropdown: Rent, Salaries, Utilities, Loan Repayment, Insurance, Other |
| Frequency | dropdown: Weekly, Monthly, Quarterly |
| Start Date | Required, date picker |
| End Date | Optional, date picker, must be > Start Date |

**API:** `POST /api/expenses/recurring` (create) | `PUT /api/expenses/recurring/:id` (edit) | `DELETE /api/expenses/recurring/:id` with confirm dialog

---

#### Tab 2: One-Off Expenses

**Table Columns:** Name | Amount | Category | Due Date | Actions

**ExpenseFormModal — One-Off:**
| Field | Validation |
|---|---|
| Name | Required |
| Amount | Required, > 0 |
| Category | dropdown |
| Due Date | Required, date picker |

**API:** `POST /api/expenses/oneoff` | `PUT /api/expenses/oneoff/:id` | `DELETE /api/expenses/oneoff/:id`

---

#### Tab 3: Unplanned Expenses

**Table Columns:** Name | Amount | Category | Recorded At | Notes | Actions (Delete only)

**"Add Unplanned Expense" button** → `ExpenseFormModal` (no date field, uses current date).

| Field | Validation |
|---|---|
| Name | Required |
| Amount | Required, > 0 |
| Category | dropdown |
| Notes | Optional, textarea, max 250 chars |

**API:** `POST /api/expenses/unplanned` | `DELETE /api/expenses/unplanned/:id`

**Important note:** Deleting any expense triggers an immediate forecast cache invalidation — the dashboard chart will refresh on next load.

---

## 12. Feature: Bank Balance & Overdraft

### 12.1 Bank Page (`/bank`)

**Guards:** `AuthGuard` + `RoleGuard(['Admin','Finance'])`

**Top Section — Summary Cards:**

```
┌─────────────────────────────┐   ┌─────────────────────────────────────────┐
│  Current Bank Balance       │   │  Overdraft Facility                     │
│  LKR 450,000.00             │   │  Limit:    LKR 1,000,000                │
│  As of 10 Apr 2026          │   │  Used:     LKR 200,000                  │
│  [Update Balance]           │   │  Available: LKR 800,000  (80% free)     │
└─────────────────────────────┘   │  [Update Overdraft]                     │
                                   └─────────────────────────────────────────┘
```

**Balance History Table:**
| Column | Notes |
|---|---|
| Date | `AsOfDate` |
| Balance | Currency formatted |
| Note | Free text note |
| Recorded By | User name |
| Recorded At | Timestamp |

Sorted descending (most recent first). Paginated (10 per page).

---

### 12.2 Update Balance Modal

**Form Fields:**
| Field | Validation |
|---|---|
| New Balance | Required, numeric (can be negative for overdraft-covered situation) |
| As of Date | Required, date picker, default = today |
| Note | Optional, max 200 chars |

**API:** `POST /api/bank/balance` → `{ balance, asOfDate, note }`

**On Success:**
- Close modal
- Update KPI cards in real-time via store dispatch
- Show snackbar: "Bank balance updated. Dashboard forecast will refresh."
- Trigger forecast cache invalidation (backend handles this)

---

### 12.3 Update Overdraft Modal

**Form Fields:**
| Field | Validation |
|---|---|
| Overdraft Limit | Required, >= 0 |
| Overdraft Used | Required, >= 0, must be <= Limit |

**API:** `POST /api/bank/overdraft` → `{ overdraftLimit, overdraftUsed }`

---

## 13. Feature: Clients & Debtor Officers

### 13.1 Client List Page (`/clients`)

**Visible To:** All roles (Admin, Finance, Sales — Sales is read-only)

**Header:**
- Title: "Clients & Debtor Officers"
- "Add Client" button (primary) — `*ccdRole="['Admin','Finance']"`

**Table Columns:**
| Column | Notes |
|---|---|
| Legal Name | Link to client detail |
| Tax Reg No | |
| Business Reg | |
| Primary Email | |
| Officers | Count badge, e.g. "3 officers" |
| Status | Active / Inactive |
| Actions | View, Edit (`*ccdRole`), Add Officer (`*ccdRole`) |

---

### 13.2 Client Detail Page (`/clients/:id`)

**Header:** Client legal name, status badge, Edit button (role-gated).

**Client Info Card:** All profile fields.

**Officers Sub-table:**
| Column | Notes |
|---|---|
| Name | |
| Email | |
| Phone | |
| Title | e.g. "CFO", "Accounts Manager" |
| Active | Toggle (role-gated: Admin/Finance) |
| Actions | Edit, Deactivate (`*ccdRole`) |

**"Add Officer" button** → `OfficerFormModal`

**OfficerFormModal:**
| Field | Validation |
|---|---|
| Full Name | Required |
| Email | Required, valid email |
| Phone | Required |
| Job Title | Required |

**API:** `POST /api/platform/customers/:id/officers`

---

### 13.3 Add/Edit Client Modal

**Client Form Fields:**
| Field | Validation |
|---|---|
| Legal Company Name | Required |
| Tax Registration Number | Required |
| Business Registration Number | Optional |
| Address (Line 1) | Required |
| Address (Line 2) | Optional |
| City | Required |
| Country | Required, dropdown |
| Primary Contact Email | Required, valid email |

**API:** `POST /api/platform/customers` (create) | `PUT /api/platform/customers/:id` (edit)

---

## 14. Feature: Users & Role Management

### 14.1 Users Page (`/users`)

**Guards:** `AuthGuard` + `RoleGuard(['Admin'])`

**Header:**
- Title: "Users"
- "Invite User" button (primary)

**Table Columns:**
| Column | Notes |
|---|---|
| Name | |
| Email | |
| Role | Editable inline dropdown (Admin can change) |
| Status | Badge: Invited / Active / Inactive |
| Last Login | Formatted timestamp or "Never" |
| Actions | Edit Role, Activate/Deactivate |

**Status badges:**
- Invited: amber
- Active: green
- Inactive: grey

**Cannot deactivate self** — the current user's row has no deactivate button.

---

### 14.2 Invite User Modal

**Form Fields:**
| Field | Validation |
|---|---|
| Full Name | Required |
| Email Address | Required, valid email |
| Role | Required, dropdown: Admin / Finance / Sales |

**API:** `POST /api/platform/users/invite`

**On Success:** snackbar "Invitation sent to [email]."

---

### 14.3 Deactivate User Dialog

Confirm dialog: "Deactivate [Name]? They will lose access to CashDay immediately."

**API:** `PATCH /api/platform/users/:id/status` `{ status: 'Inactive' }`

---

## 15. Feature: Settings

### 15.1 Settings Page (`/settings`)

**Guards:** `AuthGuard` + `RoleGuard(['Admin'])`

**Tabs:** Company Profile | Invoice Templates | Notifications

---

#### Tab 1: Company Profile

**Read/edit fields:**
| Field | Notes |
|---|---|
| Legal Company Name | Editable |
| Tax Registration Number | Read-only after registration |
| Business Registration Number | Read-only |
| Country | Read-only |
| Email Domain | Read-only |
| Company Logo | Upload (PNG/JPG, max 2MB) — used on invoice PDFs |

**API:** `PUT /api/platform/company/profile`

---

#### Tab 2: Invoice Templates

Configure country-specific tax rates and invoice defaults:

| Field | Notes |
|---|---|
| Default Currency | Dropdown (e.g. LKR, USD, EUR) |
| Date Format | Dropdown |
| Tax Label | e.g. "VAT", "GST" |
| Tax Rates | Dynamic list: rate name + % (add/remove) |
| Invoice Number Prefix | e.g. "CCD-2026-" |
| Invoice Terms (default) | Textarea (e.g. "Net 30 days") |

**API:** `PUT /api/platform/company/invoice-config`

---

#### Tab 3: Notifications

Toggles for notification preferences (checkboxes):
- Email on invoice accepted ✓
- Email on invoice rejected ✓
- Email on buyer consent confirmed ✓
- Email on buyer consent rejected ✓
- Email when invoice is overdue ✓
- In-app notifications ✓

**API:** `PUT /api/platform/company/notification-settings`

---

## 16. Feature: Audit Log

### 16.1 Audit Log Page (`/audit`)

**Guards:** `AuthGuard` + `RoleGuard(['Admin'])`

**Header:**
- Title: "Audit Log"
- Export button: "Export CSV"

**Filter Bar:**
| Filter | Implementation |
|---|---|
| Event Domain | Multi-select: Company, Invoice, Liquidity, Bank, Expense, User |
| Event Type | Multi-select, filtered by domain selection |
| Actor | Text search (user name or "Buyer Portal") |
| Date Range | Date range picker |
| Invoice ID | Text search |

**Table Columns:**

| Column | Notes |
|---|---|
| Timestamp | `DD MMM YYYY HH:mm:ss` |
| Domain | Badge color-coded |
| Event Type | e.g. `InvoiceAccepted` in monospace |
| Actor | User name or "Buyer Portal" |
| IP Address | Masked: `192.168.x.x` |
| Detail | Collapsible JSON payload (click to expand) |

**Detail Expansion:** Clicking a row expands an inline JSON viewer showing the `Detail` field of the audit record.

**Pagination:** 50 per page.

**Export:** `GET /api/audit/export?filters=...` — downloads CSV.

---

## 17. Public: Acceptance Portal

### 17.1 Overview

**Route:** `/acceptance/portal/:token`

**No authentication required.** No sidebar. Minimal public layout.

**On Load:** Call `GET /api/acceptance/portal/:token`
- If valid: render acceptance flow with invoice summary
- If invalid/expired: show error page

**Error Page (token invalid/expired):**
> "This link has expired or is invalid."
> "Please contact [seller company name] for a new invoice link."

---

### 17.2 Step Flow (Stepper)

Angular Material `MatStepper` (vertical, linear) with 4 steps. Each step is a separate component.

```
Step 1: Invoice Review
Step 2: Verify Identity (OTP)
Step 3: Review & Declare Confidence
Step 4: Confirmation
```

---

### 17.3 Step 1: Invoice Review

**Purpose:** Show the officer what they are being asked to review before asking them to authenticate.

**Content:**
```
┌─────────────────────────────────────────────────────────┐
│  Invoice from [Seller Company Name]                     │
│  CCD Invoice ID: CCD-2026-00123                         │
│                                                         │
│  To: [Officer Name] · [Customer Company]                │
│  Issue Date: DD MMM YYYY                                │
│  Due Date:   DD MMM YYYY                                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Description        Qty  Unit Price  Net   Tax  Gross│ │
│  │ [line items...]                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Net Total:   LKR 1,000,000                             │
│  Tax (VAT 15%): LKR 150,000                             │
│  Gross Total: LKR 1,150,000                             │
│                                                         │
│  [Proceed to Verify Identity →]                         │
└─────────────────────────────────────────────────────────┘
```

**"Proceed" button:** advances to Step 2.

---

### 17.4 Step 2: Verify Identity (OTP)

**Purpose:** Authenticate the officer via OTP sent to their email.

**Content:**

1. Display: "We'll send a 6-digit code to [officer email address (partially masked: a***@company.com)]"
2. **"Send Code" button** → `POST /api/acceptance/portal/:token/otp`
   - Rate limit UI: if 3 OTPs already sent in past hour, show: "Too many requests. Please try again later." and disable button.
3. If OTP sent: Show OTP input field (6 individual digit inputs that auto-advance, or a single 6-digit field).
4. **OTP expiry timer:** Countdown from 10:00. When expired: show "Code expired." + "Resend Code" button.
5. **"Verify Code" button** → `POST /api/acceptance/portal/:token/verify` `{ otp }`
   - On success: advance to Step 3
   - On error: "Incorrect or expired code. You have [N] attempts remaining."
   - On OTP reused: "This code has already been used."
6. **"Resend Code"** link: re-sends new OTP (subject to rate limit).

---

### 17.5 Step 3: Review & Declare Confidence

**Purpose:** Officer reviews the invoice in full, adjusts the Buyer Confidence Percentage, ticks pre-consent, and accepts or rejects.

**Content:**

**Repeat invoice summary** (read-only, same as Step 1)

**Buyer Confidence Slider:**
```
How much of this invoice do you accept as undisputed and payable in full?

  0%  ─────────────────────●──────  100%
                          92%

  Undisputed Amount: LKR 920,000
```

- Slider range: 0–100. Step: 1.
- Real-time computed: "Undisputed Amount: LKR [Net × confidence%]"
- Default: 100
- If slider < 100: show amber notice: "You are disputing LKR [X]. You may be asked to provide written justification for the disputed portion."

**Pre-Consent Clause:**
A text block (the pre-consent clause text returned from the API) in a scrollable box, followed by:
- Checkbox: "I have read and understood the above. I confirm the declared amount is correct and payable on [Due Date]."

**Action Buttons:**
- **"Accept Invoice"** (primary, green) → enabled only when checkbox is ticked. Calls `POST /api/acceptance/portal/:token/accept` `{ buyerConfidencePercent }`
- **"Reject Invoice"** (secondary, red) → opens rejection reason sub-step.

**Rejection Sub-step:**
On clicking "Reject Invoice":
- Inline expand (not a new step): a textarea labeled "Rejection Reason (required)" + "Confirm Rejection" button.
- `POST /api/acceptance/portal/:token/reject` `{ reason }`

---

### 17.6 Step 4: Confirmation

After Accept or Reject, show a confirmation screen.

**On Accept:**
```
  ✓ Invoice Accepted

  Your acceptance has been recorded.

  Evidence Reference ID: EVD-2026-00987
  Declared Amount: LKR 920,000 (92%)
  Date: 10 Apr 2026, 16:07 UTC

  Thank you. The seller has been notified.
```

**On Reject:**
```
  ✗ Invoice Rejected

  Your rejection has been recorded.
  Reason: "[reason]"
  Date: 10 Apr 2026, 16:10 UTC

  The seller has been notified.
```

No "go back" or navigation options. This is the terminal state for this portal session.

---

## 18. Public: Consent Portal

### 18.1 Overview

**Route:** `/consent/portal/:token`

**No authentication required.** Same minimal public layout as acceptance portal.

**Purpose:** Debtor officer confirms or rejects the seller's liquidation request. This is separate from the acceptance portal.

**On Load:** `GET /api/consent/portal/:token`
- Valid: renders consent flow
- Invalid/expired: "This liquidation consent link has expired. Please contact [seller] for an update."

---

### 18.2 Step Flow

Three steps:
```
Step 1: Liquidation Summary
Step 2: Verify Identity (2FA OTP — same as acceptance portal Step 2)
Step 3: Confirmation
```

---

### 18.3 Step 1: Liquidation Summary

**Content:**
```
┌─────────────────────────────────────────────────────────┐
│  Liquidation Consent Request from [Seller Company]      │
│                                                         │
│  Invoice: CCD-2026-00123                                │
│  Original Gross Amount: LKR 1,150,000                  │
│  Advance Amount Requested: LKR 782,000                  │
│                                                         │
│  What this means:                                       │
│  The seller has requested an advance against this       │
│  invoice. If you confirm, your payment obligation for   │
│  this invoice will be redirected to CIXOR CashDay on    │
│  [Due Date]. The full Net-of-Tax amount (LKR 1,000,000) │
│  must be paid to CCD on or before [Due Date].          │
│                                                         │
│  ⚠ This is a legally binding consent.                  │
│                                                         │
│  [Proceed to Verify Identity →]                         │
└─────────────────────────────────────────────────────────┘
```

---

### 18.4 Step 2: Verify Identity (2FA OTP)

Identical implementation to Acceptance Portal Step 2. Uses endpoint:
`POST /api/consent/portal/:token/otp` and `POST /api/consent/portal/:token/verify`

---

### 18.5 Step 3: Confirm or Reject

**Confirmation checkbox:** "I confirm the payment obligation for invoice [CCD Invoice ID] in the amount of LKR [NetAmount] on [Due Date] is directed to CIXOR CashDay."

**Action Buttons:**
- **"Confirm Consent"** (primary) → `POST /api/consent/portal/:token/confirm`
- **"Reject"** (secondary red) → prompts for reason → `POST /api/consent/portal/:token/reject` `{ reason }`

**Result Screens:**

On Confirm:
```
  ✓ Consent Confirmed

  Your consent has been recorded.
  Payment Reference: The full amount (LKR 1,000,000) is
  now payable to CIXOR CashDay on [Due Date].

  Thank you. The seller has been notified.
```

On Reject:
```
  ✗ Consent Rejected

  Your rejection has been recorded. The seller has been notified.
  The original invoice obligation remains with you.
```

---

## 19. Shared Components Library

### 19.1 `StatusBadge` Component

```typescript
@Input() status: InvoiceStatus | UserStatus | ConsentStatus;
@Input() size: 'sm' | 'md' = 'md';
```

Renders a pill-shaped badge with color per status table defined in Section 4.3.

---

### 19.2 `WaterfallDisplay` Component

```typescript
@Input() grossAmount: number;
@Input() taxAmount: number;
@Input() buyerConfidencePercent: number;
@Input() ivrPercent: number;
```

Renders the cascading three-layer waterfall (same design as HTML document). Shows Net-of-Tax → ELV → Available to Liquidate with formulas and values.

---

### 19.3 `AmountDisplay` Component

```typescript
@Input() amount: number;
@Input() currency: string = 'LKR';
@Input() highlight: boolean = false;  // primary color
@Input() negative: boolean = false;   // red
@Input() size: 'sm' | 'md' | 'lg' = 'md';
```

Renders a locale-formatted currency amount in JetBrains Mono font.

---

### 19.4 `PageHeader` Component

```typescript
@Input() title: string;
@Input() subtitle?: string;
@Input() badge?: { text: string; color: 'primary' | 'warning' | 'danger' };
@ContentChild('actions') actions: TemplateRef<any>;
```

Used at the top of every feature page. Provides consistent title + actions slot.

---

### 19.5 `DataTable` Component

A generic, configurable table component:
```typescript
@Input() columns: ColumnDef[];
@Input() data: any[];
@Input() isLoading: boolean;
@Input() paginator: boolean = true;
@Input() pageSize: number = 25;
@Output() rowAction = new EventEmitter<{ action: string; row: any }>();
```

Supports sortable columns, skeleton loading rows (placeholder rows while `isLoading = true`).

---

### 19.6 `ConfirmDialog` Component

```typescript
// Usage:
this.dialog.open(ConfirmDialogComponent, {
  data: {
    title: 'Delete Draft Invoice',
    message: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    confirmColor: 'warn',
  }
});
```

Standard Material dialog with configurable title, message, confirm button color, cancel/confirm actions.

---

### 19.7 `EmptyState` Component

```typescript
@Input() icon: string;     // Material icon name
@Input() title: string;
@Input() subtitle?: string;
@Input() actionLabel?: string;
@Output() action = new EventEmitter<void>();
```

Centered layout for empty list states.

---

### 19.8 `LoadingOverlay` Component

Full-area spinner overlay with `position: absolute` for use within container elements. Used on charts and tables during data loading.

---

### 19.9 `OtpInput` Component

A specialized 6-digit OTP input:
```typescript
@Output() otpComplete = new EventEmitter<string>();  // emits full 6-digit code
```

Renders 6 individual `<input type="text" maxlength="1">` fields that auto-advance focus. On backspace, focus moves back. On paste, fills all 6 digits. Accessible (aria-label on each).

---

## 20. Services & HTTP Layer

### 20.1 `AuthService`

```typescript
login(email: string, password: string): Observable<LoginResponse>
// POST /api/platform/auth/login

register(payload: RegisterPayload): Observable<RegisterResponse>
// POST /api/platform/register

setPassword(token: string, password: string): Observable<void>
// POST /api/platform/users/set-password

verifyInviteToken(token: string): Observable<{ valid: boolean; name: string }>
// GET /api/platform/users/verify-invite-token/:token

logout(): void
// Clears localStorage, dispatches authLogout
```

---

### 20.2 `DashboardService`

```typescript
getDashboard(): Observable<DashboardResponse>
// GET /api/dashboard

simulate(invoices: SimulateRequest[]): Observable<SimulationResponse>
// POST /api/dashboard/simulate

resetSimulation(): Observable<void>
// POST /api/dashboard/simulate/reset
```

---

### 20.3 `InvoiceService`

```typescript
getInvoices(filters: InvoiceFilters): Observable<PagedResponse<Invoice>>
// GET /api/invoices?classification=...&status=...&page=...

getInvoiceById(id: string): Observable<InvoiceDetail>
// GET /api/invoices/:id

getWaterfall(id: string): Observable<WaterfallResponse>
// GET /api/invoices/:id/waterfall

createInvoice(payload: CreateInvoicePayload): Observable<Invoice>
// POST /api/invoices

updateInvoice(id: string, payload: UpdateInvoicePayload): Observable<Invoice>
// PUT /api/invoices/:id

sendInvoice(id: string): Observable<void>
// POST /api/invoices/:id/send

deleteInvoice(id: string): Observable<void>
// DELETE /api/invoices/:id

markSettled(id: string): Observable<void>
// POST /api/invoices/:id/settle

submitLiquidation(requests: LiquidationRequest[]): Observable<LiquidationResponse>
// POST /api/invoices/liquidate

getAuditTrail(invoiceId: string): Observable<InvoiceAuditEntry[]>
// GET /api/invoices/:id/audit
```

---

### 20.4 `ExpenseService`

```typescript
getRecurring(): Observable<RecurringExpense[]>
getOneOff(): Observable<OneOffExpense[]>
getUnplanned(): Observable<UnplannedExpense[]>

createRecurring(payload): Observable<RecurringExpense>
updateRecurring(id, payload): Observable<RecurringExpense>
deleteRecurring(id): Observable<void>

createOneOff(payload): Observable<OneOffExpense>
updateOneOff(id, payload): Observable<OneOffExpense>
deleteOneOff(id): Observable<void>

createUnplanned(payload): Observable<UnplannedExpense>
deleteUnplanned(id): Observable<void>
```

---

### 20.5 `BankService`

```typescript
getBankSummary(): Observable<BankSummary>
// GET /api/bank

getBalanceHistory(): Observable<PagedResponse<BalanceRecord>>
// GET /api/bank/balance/history

updateBalance(payload: UpdateBalancePayload): Observable<BankSummary>
// POST /api/bank/balance

updateOverdraft(payload: UpdateOverdraftPayload): Observable<BankSummary>
// POST /api/bank/overdraft
```

---

### 20.6 `ClientService`

```typescript
getClients(): Observable<Customer[]>
getClientById(id: string): Observable<CustomerDetail>
createClient(payload): Observable<Customer>
updateClient(id, payload): Observable<Customer>

getOfficers(customerId: string): Observable<DebtorOfficer[]>
createOfficer(customerId: string, payload): Observable<DebtorOfficer>
updateOfficer(officerId: string, payload): Observable<DebtorOfficer>
toggleOfficerActive(officerId: string, isActive: boolean): Observable<void>
```

---

### 20.7 `UserService`

```typescript
getUsers(): Observable<User[]>
inviteUser(payload: InviteUserPayload): Observable<void>
updateUserRole(userId: string, role: string): Observable<void>
setUserStatus(userId: string, status: 'Active' | 'Inactive'): Observable<void>
```

---

### 20.8 `AcceptancePortalService`

```typescript
getPortalData(token: string): Observable<PortalInvoiceData>
// GET /api/acceptance/portal/:token

requestOtp(token: string): Observable<{ rateLimit: boolean }>
// POST /api/acceptance/portal/:token/otp

verifyOtp(token: string, otp: string): Observable<{ success: boolean; attemptsRemaining?: number }>
// POST /api/acceptance/portal/:token/verify

acceptInvoice(token: string, buyerConfidencePercent: number): Observable<{ evidenceId: string }>
// POST /api/acceptance/portal/:token/accept

rejectInvoice(token: string, reason: string): Observable<void>
// POST /api/acceptance/portal/:token/reject
```

---

### 20.9 HTTP Interceptors

#### `AuthInterceptor`

```typescript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = localStorage.getItem('ccd_access_token');
  const isPublicRoute = req.url.includes('/acceptance/portal') || req.url.includes('/consent/portal');
  if (token && !isPublicRoute) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next.handle(req);
}
```

#### `ErrorInterceptor`

```typescript
// 401 → dispatch authLogout action, navigate /login
// 403 → show snackbar "Access denied."
// 404 → show snackbar "Resource not found."
// 409 → re-throw for component-level handling
// 422 → extract validation errors, re-throw
// 500/503 → show snackbar "Server error. Please try again."
```

---

## 21. State Management (NgRx)

### 21.1 Store Structure

```
AppState:
  auth: AuthState
  dashboard: DashboardState
  invoices: InvoiceState
  expenses: ExpenseState
  bank: BankState
  clients: ClientState
  users: UserState
```

### 21.2 Effects Summary

| Effect | Trigger | Side Effect |
|---|---|---|
| `login$` | `loginAction` | Calls `AuthService.login()`, stores token |
| `logout$` | `logoutAction` | Clears localStorage, navigates /login |
| `loadDashboard$` | `loadDashboardAction` | Calls `DashboardService.getDashboard()` |
| `runSimulation$` | `runSimulationAction` | Calls `DashboardService.simulate()` |
| `loadInvoices$` | `loadInvoicesAction` | Calls `InvoiceService.getInvoices()` |
| `createInvoice$` | `createInvoiceAction` | Calls service, dispatches `loadInvoices` on success |
| `sendInvoice$` | `sendInvoiceAction` | Calls service, shows success toast |
| `submitLiquidation$` | `submitLiquidationAction` | Calls service, dispatches `loadDashboard` on success |
| `loadExpenses$` | `loadExpensesAction` | Calls `ExpenseService` for all 3 types |
| `deleteExpense$` | `deleteExpenseAction` | Calls service, dispatches `loadExpenses` + `loadDashboard` |
| `updateBankBalance$` | `updateBalanceAction` | Calls `BankService.updateBalance()` |
| `loadClients$` | `loadClientsAction` | Calls `ClientService.getClients()` |
| `inviteUser$` | `inviteUserAction` | Calls `UserService.inviteUser()`, shows toast |

---

## 22. Guards & Directives

### 22.1 `AuthGuard`

```typescript
canActivate(): boolean {
  const token = localStorage.getItem('ccd_access_token');
  if (!token || isTokenExpired(token)) {
    this.router.navigate(['/login']);
    return false;
  }
  return true;
}
```

### 22.2 `RoleGuard`

```typescript
canActivate(route: ActivatedRouteSnapshot): boolean {
  const requiredRoles: string[] = route.data['roles'];
  const userRole = this.authStore.selectCurrentRole();
  if (!requiredRoles.includes(userRole)) {
    this.snackbar.open("You don't have permission to access this area.", '', { duration: 3000 });
    this.router.navigate(['/dashboard']);
    return false;
  }
  return true;
}
```

### 22.3 `*ccdRole` Directive

```typescript
@Directive({ selector: '[ccdRole]' })
export class CcdRoleDirective implements OnInit {
  @Input('ccdRole') allowedRoles: string[];
  
  ngOnInit() {
    const userRole = this.authStore.selectCurrentRole$();
    userRole.subscribe(role => {
      if (!this.allowedRoles.includes(role)) {
        this.vcr.clear();  // removes element from DOM
      }
    });
  }
}
```

### 22.4 `CanDeactivateGuard` (Unsaved Changes)

Applied to `InvoiceFormComponent` and Settings tabs. Prompts "You have unsaved changes. Are you sure you want to leave?" using `MatDialog ConfirmDialog` if the form is dirty.

---

## 23. Error Handling Strategy

### 23.1 Error Display Hierarchy

| Error Type | Display Mechanism |
|---|---|
| Form validation errors | Inline under form fields (`mat-error`) |
| HTTP 400 validation errors | Form fields highlighted + server error messages mapped to fields |
| HTTP 409 Conflict | Inline banner in the current form/modal |
| HTTP 401 | Auto-logout + redirect |
| HTTP 403 | Snackbar (3 seconds) |
| HTTP 404 | Snackbar or empty state component |
| HTTP 500/503 | Full-page error banner with "Try again" button |
| Network offline | Persistent top banner: "No internet connection." |

### 23.2 Toast Notification Patterns

Use Material `MatSnackBar` with custom panel classes:

| Type | Duration | Color |
|---|---|---|
| Success | 3s | `--ccd-success` |
| Error | 5s | `--ccd-danger` |
| Info | 3s | `--ccd-info` |
| Warning | 4s | `--ccd-warning` |

Create a `NotificationService` wrapper:
```typescript
success(message: string): void
error(message: string): void
info(message: string): void
warning(message: string): void
```

---

## 24. Performance Requirements

| Requirement | Target | Implementation |
|---|---|---|
| Dashboard initial load | < 2s (cold) | NgRx store, lazy loading |
| Dashboard re-render (cache hit) | < 200ms | Store selectors, `OnPush` CD |
| Simulation response (after Enter) | < 300ms visible | Optimistic UI + server < 200ms |
| Invoice list render | < 1s | Pagination (25 rows), virtual scroll for > 500 items |
| Chart render | < 400ms | ApexCharts async rendering |
| Route transitions | < 150ms | Lazy loaded modules |
| Form validation feedback | Immediate | Pure client-side |

### Implementation rules:
1. All feature components use **`ChangeDetectionStrategy.OnPush`**.
2. All store selectors use **`createSelector`** with memoization.
3. All `Observable` subscriptions are managed with the **`async` pipe** (no manual subscribe/unsubscribe).
4. Heavy lists use **`@angular/cdk/scrolling` VirtualScrollViewport** when > 100 rows.
5. Charts are loaded only after data arrives (no empty chart flash).
6. Images are lazy-loaded (`loading="lazy"`).

---

## 25. API Contract Reference

### 25.1 Base URL

```
Development:  http://localhost:5000/api
Production:   https://api.cixor-cashday.com/api
```

### 25.2 Auth Headers

All authenticated endpoints require:
```
Authorization: Bearer <JWT>
Content-Type: application/json
```

### 25.3 Standard Response Envelope

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string; details?: Record<string, string[]> };
  meta?: { page: number; pageSize: number; total: number; };
}
```

### 25.4 Complete Endpoint Reference

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/platform/auth/login` | No | — | Login |
| POST | `/platform/register` | No | — | Register company |
| POST | `/platform/users/invite` | Yes | Admin | Invite user |
| POST | `/platform/users/set-password` | No | — | Set password from invite |
| GET | `/platform/users/verify-invite-token/:token` | No | — | Validate invite token |
| GET | `/platform/users` | Yes | Admin | List users |
| PATCH | `/platform/users/:id/status` | Yes | Admin | Activate/deactivate user |
| PATCH | `/platform/users/:id/role` | Yes | Admin | Change user role |
| GET | `/platform/customers` | Yes | All | List clients |
| POST | `/platform/customers` | Yes | Admin, Finance | Create client |
| GET | `/platform/customers/:id` | Yes | All | Get client detail |
| PUT | `/platform/customers/:id` | Yes | Admin, Finance | Update client |
| GET | `/platform/customers/:id/officers` | Yes | All | List officers |
| POST | `/platform/customers/:id/officers` | Yes | Admin, Finance | Create officer |
| PUT | `/platform/officers/:id` | Yes | Admin, Finance | Update officer |
| GET | `/platform/company/profile` | Yes | Admin | Get company profile |
| PUT | `/platform/company/profile` | Yes | Admin | Update company profile |
| PUT | `/platform/company/invoice-config` | Yes | Admin | Update invoice settings |
| GET | `/bank` | Yes | Admin, Finance | Get bank summary |
| POST | `/bank/balance` | Yes | Admin, Finance | Update bank balance |
| GET | `/bank/balance/history` | Yes | Admin, Finance | Balance history |
| POST | `/bank/overdraft` | Yes | Admin, Finance | Update overdraft |
| GET | `/invoices` | Yes | All | List invoices (filtered) |
| POST | `/invoices` | Yes | Admin, Finance, Sales | Create invoice |
| GET | `/invoices/:id` | Yes | All | Invoice detail |
| PUT | `/invoices/:id` | Yes | Admin, Finance | Update draft invoice |
| DELETE | `/invoices/:id` | Yes | Admin, Finance | Delete draft |
| POST | `/invoices/:id/send` | Yes | Admin, Finance | Send invoice |
| POST | `/invoices/:id/settle` | Yes | Admin, Finance | Mark settled |
| GET | `/invoices/:id/waterfall` | Yes | All | Waterfall breakdown |
| GET | `/invoices/:id/audit` | Yes | Admin | Invoice audit trail |
| POST | `/invoices/liquidate` | Yes | Admin, Finance | Submit liquidation |
| GET | `/dashboard` | Yes | All | Dashboard data + forecast |
| POST | `/dashboard/simulate` | Yes | Admin, Finance | Run simulation |
| POST | `/dashboard/simulate/reset` | Yes | Admin, Finance | Reset simulation |
| GET | `/expenses/recurring` | Yes | Admin, Finance | List recurring |
| POST | `/expenses/recurring` | Yes | Admin, Finance | Create recurring |
| PUT | `/expenses/recurring/:id` | Yes | Admin, Finance | Update recurring |
| DELETE | `/expenses/recurring/:id` | Yes | Admin, Finance | Delete recurring |
| GET | `/expenses/oneoff` | Yes | Admin, Finance | List one-off |
| POST | `/expenses/oneoff` | Yes | Admin, Finance | Create one-off |
| PUT | `/expenses/oneoff/:id` | Yes | Admin, Finance | Update one-off |
| DELETE | `/expenses/oneoff/:id` | Yes | Admin, Finance | Delete one-off |
| GET | `/expenses/unplanned` | Yes | Admin, Finance | List unplanned |
| POST | `/expenses/unplanned` | Yes | Admin, Finance | Create unplanned |
| DELETE | `/expenses/unplanned/:id` | Yes | Admin, Finance | Delete unplanned |
| GET | `/audit` | Yes | Admin | Audit log (filtered) |
| GET | `/audit/export` | Yes | Admin | Export audit CSV |
| GET | `/acceptance/portal/:token` | No | — | Get acceptance portal data |
| POST | `/acceptance/portal/:token/otp` | No | — | Request OTP |
| POST | `/acceptance/portal/:token/verify` | No | — | Verify OTP |
| POST | `/acceptance/portal/:token/accept` | No | — | Accept invoice |
| POST | `/acceptance/portal/:token/reject` | No | — | Reject invoice |
| GET | `/consent/portal/:token` | No | — | Get consent portal data |
| POST | `/consent/portal/:token/otp` | No | — | Request consent OTP |
| POST | `/consent/portal/:token/verify` | No | — | Verify consent OTP |
| POST | `/consent/portal/:token/confirm` | No | — | Confirm consent |
| POST | `/consent/portal/:token/reject` | No | — | Reject consent |

---

### 25.5 Core TypeScript Models

```typescript
// ─── AUTH ───────────────────────────────────────────────────
type UserRole = 'Admin' | 'Finance' | 'Sales';
type UserStatus = 'Invited' | 'Active' | 'Inactive';

interface AuthUser {
  userId: string;
  companyId: string;
  email: string;
  name: string;
  role: UserRole;
}

// ─── INVOICE ────────────────────────────────────────────────
type InvoiceStatus = 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Liquidated' | 'Settled' | 'Deleted';
type InvoiceClassification = 'SystemReceivable' | 'ManualReceivable' | 'SystemPayable' | 'ManualPayable';
type ConsentStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'Expired';

interface Invoice {
  invoiceId: string;
  ccdInvoiceId: string;
  companyId: string;
  customerId: string;
  customerName: string;
  officerId: string;
  officerName: string;
  classification: InvoiceClassification;
  status: InvoiceStatus;
  isVerified: boolean;
  buyerConfidencePercent: number | null;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
  dueDate: string;         // ISO date string
  issueDate: string;
  sentAt: string | null;
}

interface InvoiceLineItem {
  lineItemId: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
}

interface InvoiceDetail extends Invoice {
  lineItems: InvoiceLineItem[];
  waterfall: WaterfallBreakdown | null;
  liquidityIntent: LiquidityIntent | null;
}

interface WaterfallBreakdown {
  grossAmount: number;
  taxAmount: number;
  netOfTaxValue: number;
  buyerConfidencePercent: number;
  eligibleLiquidationValue: number;
  ivrPercent: number;
  availableToLiquidate: number;
}

interface LiquidityIntent {
  liquidityIntentId: string;
  requestedAmount: number;
  ccdFeeAmount: number;
  netCashToSeller: number;
  buyerConsentStatus: ConsentStatus;
  buyerConsentExpiry: string;
  confirmedAt: string | null;
  createdAt: string;
}

// ─── DASHBOARD ──────────────────────────────────────────────
interface ForecastDay {
  date: string;             // ISO date
  dayIndex: number;
  endBalance: number;
  receivablesDue: number;
  payablesDue: number;
  expensesDue: number;
  netChange: number;
  events: ForecastEvent[];
}

interface ForecastEvent {
  type: 'Receivable' | 'Payable' | 'Expense';
  label: string;
  amount: number;
}

interface VerifiedInvoice {
  invoiceId: string;
  ccdInvoiceId: string;
  customerName: string;
  dueDate: string;
  grossAmount: number;
  netOfTaxValue: number;
  buyerConfidencePercent: number;
  eligibleLiquidationValue: number;
  availableToLiquidate: number;
  ivrPercent: number;
  hasActiveIntent: boolean;    // true if Liquidation Pending
}

interface DashboardResponse {
  availableCashToday: number;
  bankBalance: number;
  overdraftLimit: number;
  overdraftUsed: number;
  forecast: ForecastDay[];
  verifiedInvoices: VerifiedInvoice[];
}

interface SimulationResponse {
  actualForecast: ForecastDay[];
  hypotheticalForecast: ForecastDay[];
  totalInjection: number;
  totalFees: number;
  netInjection: number;
  sessionId: string;
}

// ─── EXPENSES ───────────────────────────────────────────────
type ExpenseFrequency = 'Weekly' | 'Monthly' | 'Quarterly';
type ExpenseCategory = 'Rent' | 'Salaries' | 'Utilities' | 'LoanRepayment' | 'Insurance' | 'Other';

interface RecurringExpense {
  expenseId: string;
  name: string;
  amount: number;
  frequency: ExpenseFrequency;
  category: ExpenseCategory;
  startDate: string;
  endDate: string | null;
}

interface OneOffExpense {
  expenseId: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  dueDate: string;
}

interface UnplannedExpense {
  expenseId: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  recordedAt: string;
  notes: string;
}

// ─── BANK ────────────────────────────────────────────────────
interface BankSummary {
  bankBalance: number;
  asOfDate: string;
  overdraftLimit: number;
  overdraftUsed: number;
  availableOverdraft: number;
  availableCashToday: number;
}

// ─── CLIENT / OFFICER ────────────────────────────────────────
interface Customer {
  customerId: string;
  legalName: string;
  taxRegNumber: string;
  businessRegNumber: string | null;
  address: string;
  city: string;
  country: string;
  primaryContactEmail: string;
  officerCount: number;
}

interface DebtorOfficer {
  officerId: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  isActive: boolean;
}

// ─── USER ────────────────────────────────────────────────────
interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
}

// ─── ACCEPTANCE PORTAL ───────────────────────────────────────
interface PortalInvoiceData {
  invoiceId: string;
  ccdInvoiceId: string;
  sellerCompanyName: string;
  customerName: string;
  officerName: string;
  officerEmailMasked: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
  taxLabel: string;
  preConsentClauseText: string;
}

// ─── AUDIT ───────────────────────────────────────────────────
type AuditDomain = 'Company' | 'Invoice' | 'Liquidity' | 'Bank' | 'Expense' | 'User';

interface AuditEntry {
  auditId: string;
  timestamp: string;
  domain: AuditDomain;
  eventType: string;
  actorId: string | null;
  actorLabel: string;
  ipAddress: string;
  detail: Record<string, any> | null;
}
```

---

## Appendix A: Page-by-Page Checklist

Use this during development & QA to verify completeness:

| Page | Auth | Role Gate | Empty State | Loading State | Error State | Mobile Responsive |
|---|---|---|---|---|---|---|
| Login | — | — | — | ✓ | ✓ | ✓ |
| Register | — | — | — | ✓ | ✓ | ✓ |
| Set Password | — | — | — | ✓ | ✓ | ✓ |
| Dashboard | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| Invoice List | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| Invoice New/Edit | ✓ | Finance/Admin/Sales | — | ✓ | ✓ | ✓ |
| Invoice Detail | ✓ | — | — | ✓ | ✓ | ✓ |
| Expenses | ✓ | Finance/Admin | ✓ | ✓ | ✓ | ✓ |
| Bank | ✓ | Finance/Admin | — | ✓ | ✓ | ✓ |
| Clients | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| Client Detail | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| Users | ✓ | Admin | ✓ | ✓ | ✓ | ✓ |
| Settings | ✓ | Admin | — | ✓ | ✓ | ✓ |
| Audit Log | ✓ | Admin | ✓ | ✓ | ✓ | ✓ |
| Acceptance Portal | — | — | — | ✓ | ✓ | ✓ |
| Consent Portal | — | — | — | ✓ | ✓ | ✓ |

---

## Appendix B: Business Rules Encoded in UI

The following business rules from the BPD must be enforced in the frontend (in addition to backend enforcement):

| Rule | Where Enforced |
|---|---|
| Only Draft invoices can be Edited | Action menu: Edit hidden unless `status === 'Draft'` |
| Only Draft invoices can be Deleted | Action menu: Delete hidden unless `status === 'Draft'` |
| Only Admin/Finance can Delete | `*ccdRole` on Delete action |
| Only System Receivables can be Liquidated | Simulate input only shown for `classification === 'SystemReceivable' && isVerified` |
| Simulate amount must be ≤ AvailableToLiquidate | Client-side max validation on simulate input |
| If invoice has active LiquidityIntent, simulate input is replaced with status | `hasActiveIntent === true` → show "Consent Pending" badge, no input |
| Buyer Confidence slider default = 100% | Set in acceptance portal Step 3 form initialization |
| Pre-consent checkbox must be ticked before Accept | Disable "Accept Invoice" button until checkbox is `true` |
| Liquidation confirmation checkbox must be ticked | Disable "Confirm & Request Liquidation" until checkbox is `true` |
| Sales role cannot initiate Liquidation | "Proceed to Liquidation" button hidden via `*ccdRole` |
| Invoice status is strictly forward-only | No backward transition actions are ever presented in UI |
| Manual Receivables/Payables have no Simulate field | `classification === 'ManualReceivable'` rows excluded from verified invoices panel |

---

*End of CIXOR CashDay Angular Frontend UI Build Prompt v1.0*
*FINAP Worldwide W.L.L. — Highly Confidential*
