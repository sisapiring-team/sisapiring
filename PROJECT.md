# Project: SisaPiring End-to-End Feature Completion & Data Harmonization

## Architecture
- **Backend**: Laravel 11 REST API (`/api/v1/*`) with Sanctum authentication, MariaDB 11.8 database, Eloquent ORM, Service Layer (`OrderService`, `StockService`, `PaymentService`, `EscrowService`, `ImpactService`), FormRequests, and JSON API Resources.
- **Frontend**: Single Page Application (SPA) built with React 19, TypeScript, Tailwind CSS v4, Lucide Icons, and Axios client (`src/lib/api.ts`). Mounted via `resources/views/spa.blade.php` at `src/main.tsx`. Browser URL synchronization via `src/utils/navigation.ts`.
- **Database Schema**: 35 MariaDB tables including `users`, `merchants`, `merchant_documents`, `products`, `product_checks`, `stock_locks`, `order_groups`, `orders`, `order_items`, `payments`, `escrow_ledger`, `impact_logs`, `reviews`, `disputes`, `dispute_messages`, `conversations`, `messages`, `activity_logs`.
- **Data Flow**:
  1. Buyer registers/logs in -> redirected to `/etalase` -> adds surplus menu to cart -> checkout group (`POST /api/v1/buyer/order-groups`) creates dynamic stock lock (`stock_locks` with 10m TTL).
  2. Buyer simulates payment (`POST /api/v1/buyer/payments/{id}/mock-pay`) -> stock lock converted, payment marked `paid`, escrow hold created (`escrow_ledger`), order status `waiting_confirmation`, pickup PIN and QR token issued.
  3. Seller confirms order (`PATCH /api/v1/seller/orders/{code}/status`) and marks ready for pickup (`ready_for_pickup`).
  4. Seller verifies buyer's QR code or 4-digit pickup PIN (`POST /api/v1/seller/orders/{code}/verify`) -> order completed, escrow released (`escrow_ledger.status = 'released'`), environmental impact recorded in `impact_logs`.
  5. Admin monitors platform (`/api/v1/admin/*`), approves/rejects UMKM verification, moderates food surplus listings, resolves buyer disputes (triggering escrow refunds), and manages user account statuses.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Baseline Syntax & Build Fix | Fix `AuthPage.tsx:1180` JSX syntax bug to achieve 0 error `npm run lint` & `npm run build` | M1 | survey |
| 2 | MariaDB Operational Seed Data | Restore `DatabaseSeeder.php` from git HEAD and seed MariaDB with initial operational records | M1 | survey / R1 |
| 3 | Backend API Adjustments | Fix `OrderStatus::Confirmed -> Completed` transition, add `POST /admin/users`, expose escrow entries in orders | M1 | survey |
| 4 | Unified API Client (`api.ts`) | Complete typed API client functions for all Buyer, Seller, and Admin endpoints | M1 | survey / R1 |
| 5 | Post-Login Redirection | Ensure Buyer login routes directly to active catalog `/etalase` | M2 | R2 |
| 6 | Buyer Catalog & Detail Integration | Connect `/etalase` and product detail modals to real `/api/v1/catalog` | M2 | R1, R2 |
| 7 | Dynamic Stock Lock Checkout | Connect checkout in `RescueModals.tsx` to `POST /api/v1/buyer/order-groups` with `stock_locks` | M2 | R2 |
| 8 | Payment Simulation & Tickets | Connect payment simulator to mock-pay, generate real QR & pickup PIN tickets, record escrow hold | M2 | R2 |
| 9 | Buyer Orders Tracking & History | Connect `/pesanan` and `/history` to `GET /api/v1/buyer/orders` | M2 | R2 |
| 10 | Buyer Direct Chat & Reviews | Connect `/conversations` messaging and `/reviews` rating submission to database | M2 | R2 |
| 11 | Buyer Disputes & Impact | Connect `/disputes` complaint reporting and `/impact` metrics to database | M2 | R2 |
| 12 | Seller Dashboard & Analytics | Hydrate Seller dashboard stats and revenue charts from `/api/v1/seller/dashboard` | M3 | R3 |
| 13 | Surplus Product Management | Connect surplus menu CRUD with food safety checklist, tiered discount (50/70/100%), stock, toggle active | M3 | R3 |
| 14 | Seller Order Progression & Pickup Verification | Connect order status transitions and QR/PIN verification triggering `escrow_ledger` release and `impact_logs` | M3 | R3 |
| 15 | Seller Docs & Dispute Replies | Connect UMKM legal document upload, verification submit, review replies, and dispute replies | M3 | R3 |
| 16 | Admin Overview Dashboard | Hydrate `/admin` stats, revenue, and active dispute metrics from `/api/v1/admin/dashboard` | M4 | R4 |
| 17 | Admin UMKM Verification & Sanction | Connect merchant document review, approval, suspension, and reinstatement to `/api/v1/admin/merchants/*` | M4 | R4 |
| 18 | Admin Product Moderation | Connect food listing moderation and safety takedown to `/api/v1/admin/products/*` | M4 | R4 |
| 19 | Admin Dispute Resolution & Refunds | Connect dispute resolution to `/api/v1/admin/disputes/*`, auto-refunding escrow in MariaDB | M4 | R4 |
| 20 | Admin Escrow & User Governance | Connect real escrow transactions, review moderation, user account creation and status toggles | M4 | R4 |
| 21 | Full E2E Automated Verification | 100% pass on expanded test suite (29+ tests), clean lint & build, no dummy state, all API 200/201/204 | M5 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Foundation, DB Seeder & API Harmonization | Fix syntax in `AuthPage.tsx`, restore `DatabaseSeeder.php`, backend fixes (`OrderStatus`, `POST /admin/users`), full `api.ts` client expansion | none | PLANNED |
| 2 | M2: Buyer Marketplace Flow & Persistence | Connect `/etalase`, cart, dynamic stock lock checkout, payment simulation, QR/PIN tickets, orders list, chat, reviews, disputes | M1 | PLANNED |
| 3 | M3: Seller Portal & Escrow/Impact Automation | Connect seller dashboard, product CRUD with checklist & tiered discounts, order transitions, QR/PIN verification triggering escrow release & impact logs | M1, M2 | PLANNED |
| 4 | M4: Admin Governance & Moderation Flow | Connect Admin dashboard, UMKM verification/suspension, product moderation, dispute refunds, user management | M1 | PLANNED |
| 5 | M5: Final Verification & Coverage Hardening | Phase 1: Pass 100% E2E test suite (Tiers 1-4). Phase 2: Adversarial coverage hardening (Tier 5). Validate all acceptance criteria | M1, M2, M3, M4 | PLANNED |

## Interface Contracts

### Buyer ↔ Backend API
- `POST /api/v1/buyer/order-groups`:
  - Request: `{ items: [{ product_code: string, quantity: number }], customer_name?: string, customer_phone?: string, delivery_type?: string, notes?: string }`
  - Response: `{ data: { group_code: string, total_amount: number, payment: { id: number, status: string }, orders: Order[] } }`
- `POST /api/v1/buyer/payments/{id}/mock-pay`:
  - Response: `{ message: string, data: Payment }`
- `GET /api/v1/buyer/orders`:
  - Response: `{ data: Order[], links: {...}, meta: {...} }` where Order includes `order_code`, `status`, `pickup_code`, `qr_code_token`, `items`
- `POST /api/v1/buyer/reviews`:
  - Request: `{ order_item_id: number, rating: number (1-5), comment?: string, tags?: string[] }`
- `POST /api/v1/buyer/disputes`:
  - Request: `{ order_id: number, order_item_id?: number, category: string, description: string, evidence_path?: string }`

### Seller ↔ Backend API
- `GET /api/v1/seller/dashboard`:
  - Response: `{ merchant: Merchant, stats: { revenue: number, orders: number, activeProducts: number, resolvedImpact: number }, ordersByStatus: {...}, recentOrders: Order[], lowStock: Product[] }`
- `POST /api/v1/seller/products`:
  - Request: `{ name, category, original_price, discount_percentage, stock, weight_grams, production_time, safe_consumption_deadline, storage_instruction, food_safety_checklist: { clean_packaging: bool, temperature_ok: bool, fresh_quality: bool, halal_hygiene: bool } }`
- `POST /api/v1/seller/orders/{order:order_code}/verify`:
  - Request: `{ pickup_code: string }` OR `{ qr_token: string }`
  - Response: `{ message: string, data: Order }` -> Side effects: `orders.status = completed`, `escrow_ledger.status = 'released'`, `impact_logs` entry created.

### Admin ↔ Backend API
- `GET /api/v1/admin/dashboard`:
  - Response: `{ stats: { users, buyers, sellers, merchantsPending, merchantsVerified, productsUnderReview, orders, revenue, openDisputes, impact }, recentOrders: Order[] }`
- `POST /api/v1/admin/merchants/{code}/verify`:
  - Request: `{ status: 'verified' | 'rejected', note?: string }`
- `POST /api/v1/admin/products/{code}/moderate`:
  - Request: `{ status: 'active' | 'under_review' | 'taken_down', reason?: string }`
- `POST /api/v1/admin/disputes/{id}/resolve`:
  - Request: `{ status: 'resolved_refund' | 'resolved_sanction' | 'rejected', resolution_type?: string, resolution_note: string, refund_amount?: number }`
- `PATCH /api/v1/admin/users/{id}/status`:
  - Request: `{ status: 'active' | 'suspended' | 'banned', note?: string }`

## Code Layout
- Backend Source:
  - Controllers: `app/Http/Controllers/Api/` (Buyer/, Seller/, Admin/, CatalogController, AuthController, ConversationController, etc.)
  - Services: `app/Services/` (OrderService, StockService, PaymentService, EscrowService, ImpactService)
  - Models: `app/Models/` (User, Merchant, Product, Order, OrderGroup, EscrowLedger, ImpactLog, Review, Dispute, Conversation, etc.)
  - Seeders: `database/seeders/DatabaseSeeder.php`
- Frontend Source:
  - App Entry: `src/main.tsx`, `src/App.tsx`
  - API Client: `src/lib/api.ts`
  - Context: `src/context/AppContext.tsx`
  - Navigation / Router: `src/utils/navigation.ts`
  - Buyer Views & Modals: `src/components/MarketplaceDisplayPage.tsx`, `src/components/RescueModals.tsx`, `src/components/RescueCartPage.tsx`, `src/components/ActiveOrdersView.tsx`, `src/components/OrderHistoryView.tsx`, `src/components/chat/*`
  - Seller Views: `src/components/dashboard/SellerDashboardView.tsx`, `src/components/products/ProductManagementView.tsx`, `src/components/orders/OrderManagementView.tsx`, `src/components/pickup/QRPickupVerificationView.tsx`, `src/components/deals/RescueDealsView.tsx`, `src/components/registration/SellerRegistrationView.tsx`
  - Admin Views: `src/components/admin/AdminDashboardPage.tsx`, `src/components/admin/tabs/*`, `src/components/admin/modals/*`
- Tests:
  - Backend: `tests/Feature/Api/` (`MarketplaceFlowTest.php`, `BuyerFeaturesTest.php`, `SellerFeaturesTest.php`, `AdminGovernanceTest.php`)
  - Verification: `ddev artisan test` and `ddev exec npm run lint && ddev exec npm run build`
