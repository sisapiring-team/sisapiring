# SisaPiring Test Infrastructure & Quality Assurance Architecture

## 1. Executive Summary & Architecture Overview

The SisaPiring Quality Assurance infrastructure is built to guarantee end-to-end data integrity, robust authorization enforcement, and seamless coordination between buyer, seller, and platform administration workflows. The test suite validates the full operational lifecycle of food surplus rescue—from real-time catalog discovery and dynamic stock locking to escrow fund protection and environmental impact logging.

### 1.1 Test Execution Architecture

```
+-------------------------------------------------------------------------------+
|                               Test Runner                                      |
|                  PHPUnit 12.5.43 on PHP 8.4.27 (DDEV / CLI)                   |
+-------------------------------------------------------------------------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
      +-------------------------+             +-------------------------+
      |  Laravel Test Container |             |  Database Isolation     |
      |  Laravel 11 REST Engine |             |  SQLite In-Memory       |
      |  Sanctum Auth & Guards  |             |  (:memory:) via         |
      |  Service Layer Pipeline |             |  RefreshDatabase Trait  |
      +-------------------------+             +-------------------------+
                   |
     +-------------+-------------+-------------+
     |                           |             |
     v                           v             v
+------------------+   +------------------+   +------------------+
| Buyer Features   |   | Seller Features  |   | Admin Governance |
| API Suite        |   | API Suite        |   | API Suite        |
| (BuyerFeatures-  |   | (SellerFeatures- |   | (AdminGovernance-|
|  Test.php)       |   |  Test.php)       |   |  Test.php)       |
+------------------+   +------------------+   +------------------+
     |                           |             |
     +-------------+-------------+-------------+
                   |
                   v
+-------------------------------------------------------------------------------+
|                         Core Lifecycle Integration                            |
|             Tests\Feature\Api\MarketplaceFlowTest (Checkout -> Pay ->         |
|                     Confirm -> QR/PIN Verify -> Escrow & Impact)              |
+-------------------------------------------------------------------------------+
```

### 1.2 Isolation & State Management
- **In-Memory SQLite**: Configured via `phpunit.xml` (`<env name="DB_CONNECTION" value="sqlite"/>`, `<env name="DB_DATABASE" value=":memory:"/>`), guaranteeing instantaneous test runs (~1.5–2.5 seconds for the entire suite) with zero cross-test state pollution.
- **`RefreshDatabase` Trait**: Every test class uses `Illuminate\Foundation\Testing\RefreshDatabase`, automatically applying all 35 database schema migrations prior to test execution and resetting transactions after each test method.
- **Factory & Model Creation**: Tests isolate actors (`buyer`, `seller`, `admin`) and their corresponding entity relations (`merchants`, `products`, `order_groups`, `orders`, `escrow_ledger`, `impact_logs`) within their own test fixture setup.
- **Sanctum Authentication**: API authorization is verified using `Laravel\Sanctum\Sanctum::actingAs($user)` and explicit Bearer token round-trips via `POST /api/v1/auth/login`.

---

## 2. Testing Methodologies & Rigorous Design Techniques

To ensure complete verification without superficial facade tests, four formal software testing methodologies are systematically implemented across all test suites:

### 2.1 Category-Partition Method
Functional specifications are systematically partitioned into discrete input domains, operational states, and equivalence classes. For each parameter or state variable, non-overlapping categories are tested:

1. **Order Lifecycle States**:
   - `pending_payment`: Stock locked, payment pending, cancellation releases locked stock.
   - `waiting_confirmation`: Payment settled, escrow held, awaiting merchant confirmation.
   - `confirmed`: Merchant accepted order, eligible for pickup scheduling or ready transition.
   - `ready_for_pickup`: Pickup code and secure QR code active, awaiting buyer arrival.
   - `completed`: Scanned via QR/PIN, escrow released to seller, impact log created.
   - `cancelled` / `expired`: Reversal triggered, stock restored, held escrow refunded.

2. **User Roles & Authorization Domains**:
   - `buyer`: Access restricted to `/api/v1/buyer/*`, `/api/v1/conversations`, and public `/catalog`. Access to `/admin/*` or `/seller/*` strictly rejected (HTTP 403).
   - `seller`: Access restricted to `/api/v1/seller/*` scoped strictly to their own merchant entity (`merchant_id`). Managing other merchants' orders or inventory rejected (HTTP 403).
   - `admin`: Elevated platform governance access (`/api/v1/admin/*`). Access to resolve disputes, moderate content, sanction merchants, and manage user account statuses.

3. **Review & Dispute Eligibility**:
   - Reviews: Allowed strictly for items belonging to completed orders (`OrderStatus::Completed`). Uncompleted orders or foreign buyer items strictly rejected (HTTP 422).
   - Disputes: Allowed on buyer orders; messaging permitted for dispute participants (reporter, merchant, admin) and rejected for third parties.

### 2.2 Boundary Value Analysis (BVA)
Boundary values are tested at the exact edges of acceptable ranges to uncover off-by-one errors and invalid state transitions:

| Parameter / Domain | Min Boundary | Nominal Value | Max Boundary | Out-of-Bounds / Invalid |
|---|---|---|---|---|
| **Stock Modification** | `stock = locked_stock` (Valid) | `stock > locked_stock` | `stock = 10,000` | `stock < locked_stock` (HTTP 422) |
| **Tiered Discount %** | `50%` (Minimum rescue tier) | `70%`, `90%` | `100%` (Free rescue deal) | `40%`, `60%`, `80%`, `101%` (HTTP 422) |
| **Review Rating** | `1` (Lowest rating) | `3` (Neutral) | `5` (Highest rating) | `0`, `6`, `-1` (HTTP 422) |
| **Order Item Quantity** | `1` (Single portion) | `2 - 10` | `50` (Cart limit) | `0`, `-1`, `51` (HTTP 422) |
| **Merchant Coordinates** | `-90.0, -180.0` (Min lat/lng) | `-6.9175, 107.6191` (Bandung) | `90.0, 180.0` | `>90`, `<-180` (HTTP 422) |
| **Review Comment Length** | `1` character | `50 - 200` characters | `2000` characters | `>2000` characters, empty string |

### 2.3 Pairwise (Combinatorial) Testing
Pairwise reduction verifies multi-factor interactions across high-dimensional parameter spaces without testing unnecessary Cartesian products:

- **Actor Role $\times$ Endpoint Scope $\times$ Account Status**:
  * `[Buyer, Seller, Admin]` $\times$ `[Buyer API, Seller API, Admin API]` $\times$ `[Active, Suspended]`.
  * Verifies that suspended users across all roles are blocked by `EnsureRole` middleware (HTTP 403 `Akun Anda sedang dibekukan`).
  * Verifies that valid active users can only reach their authorized endpoints.
- **Product Price $\times$ Discount Tier $\times$ Moderation Status**:
  * Original price (e.g., IDR 60,000, 100,000) $\times$ Discount tier (50%, 70%, 100%) $\times$ Status (`active`, `under_review`, `taken_down`).
  * Proves that catalog search filters (`GET /api/v1/catalog`) strictly exclude `taken_down` or unverified merchant products while correctly calculating discounted prices (e.g. IDR 0 for 100% discount).

### 2.4 Real-World Workload & Adversarial Scenarios
1. **Dynamic Stock Lock & Concurrency Reversal**:
   - A buyer creates an order group reserving 3 units of surplus food. The product's `locked_stock` increments to 3 while `stock` remains 10.
   - If the buyer cancels before payment, `StockService::releaseForGroup` safely decrements `locked_stock` back to 0 without mutating available inventory.
   - If paid, `StockService::convertForGroup` decrements `locked_stock` to 0 and permanently decrements `stock` to 7.
2. **Double Resolution & State Lockout**:
   - Attempting to resolve an already resolved dispute (`resolved_refund` / `resolved_sanction` / `rejected`) is rejected with HTTP 422 (`Sengketa ini sudah diselesaikan`).
3. **Escrow Safety on Dispute Refund**:
   - Resolving a dispute with `resolved_refund` automatically transitions the order's `escrow_ledger` entry from `held` to `refunded`, preventing unauthorized payout to the seller.
4. **Self-Moderation Prevention**:
   - An administrator attempting to suspend or modify their own account status via `PATCH /api/v1/admin/users/{id}/status` is blocked with HTTP 422 (`Anda tidak dapat mengubah status akun sendiri`).
5. **Cross-Tenant Data Isolation**:
   - Buyer B cannot inspect Buyer A's order groups (`GET /api/v1/buyer/order-groups/{group}`).
   - Seller B cannot update Seller A's orders (`PATCH /api/v1/seller/orders/{order}/status`).
   - Seller B cannot reply to Seller A's customer reviews.

---

## 3. Feature Inventory & Automated Test Coverage

The following matrix documents the automated test coverage mapped against `PROJECT.md` features and `ORIGINAL_REQUEST.md` requirements:

| Feature / Requirement | API Endpoint Under Test | Test Suite File | Key Automated Test Method | Verification Target |
|---|---|---|---|---|
| **R1 / F18: Catalog Filtering** | `GET /api/v1/catalog` | `BuyerFeaturesTest.php` | `test_catalog_category_browsing_and_filtering` | Category filter, distinct categories |
| **R2 / F7: Stock Lock & Cancel** | `POST /buyer/order-groups/{code}/cancel` | `BuyerFeaturesTest.php` | `test_buyer_order_cancellation_releases_locked_stock` | `locked_stock` restored to 0, status `cancelled` |
| **R2 / F10: Completed Item Review** | `POST /api/v1/buyer/reviews` | `BuyerFeaturesTest.php` | `test_buyer_review_submission_for_completed_order_item` | 201 Created, merchant rating updated |
| **R2 / F10: Uncompleted Item Review** | `POST /api/v1/buyer/reviews` | `BuyerFeaturesTest.php` | `test_rejection_of_review_for_uncompleted_order_item` | 422 Unprocessable, review rejected |
| **R2 / F11: Dispute & Messaging** | `POST /buyer/disputes`, `/messages` | `BuyerFeaturesTest.php` | `test_buyer_dispute_creation_and_messaging` | 201 Created, ticket code, message reply |
| **R2 / F10: Direct Chat Conversation** | `POST /conversations`, `/messages` | `BuyerFeaturesTest.php` | `test_direct_conversation_initiation_with_merchant` | 201 Created, participant link, message store |
| **R2 / F11: Environmental Impact** | `GET /api/v1/buyer/impact` | `BuyerFeaturesTest.php` | `test_buyer_environmental_impact_query` | 200 OK, portions & CO2 metric calculation |
| **R3 / F13: Food Safety Product CRUD** | `POST /api/v1/seller/products` | `SellerFeaturesTest.php` | `test_product_creation_with_food_safety_checklist_validation` | 201 Created, checklist array stored, price calc |
| **R3 / F13: Tiered Discounts** | `PATCH /seller/products/{c}/discount` | `SellerFeaturesTest.php` | `test_tiered_discount_application_50_70_100` | 50%, 70%, 100% discount price calculation |
| **R3 / F13: Stock & Active Toggle** | `PATCH /seller/products/{c}/stock`, `/toggle-active` | `SellerFeaturesTest.php` | `test_stock_updates_and_active_toggle` | Stock update, locked stock validation, active toggle |
| **R3 / F15: Merchant Profile & Hours** | `PATCH /api/v1/seller/merchant` | `SellerFeaturesTest.php` | `test_merchant_profile_and_operating_hours_update` | Operating hours, pickup window, store bio update |
| **R3 / F15: Seller Review Reply** | `POST /seller/reviews/{id}/reply` | `SellerFeaturesTest.php` | `test_seller_reply_to_customer_review` | Reply stored, reviewer notified, 403 on other seller |
| **R3 / F15: Seller Dispute Reply** | `POST /seller/disputes/{id}/messages`| `SellerFeaturesTest.php` | `test_seller_reply_to_dispute` | Reply stored, reporter notified, 403 on other seller |
| **R4 / F17: Merchant Verification** | `POST /admin/merchants/{c}/verify`, `/suspend`, `/reinstate` | `AdminGovernanceTest.php` | `test_umkm_merchant_verification_suspension_and_reinstatement`| Verified, suspended (products deactivated), reinstated |
| **R4 / F18: Food Safety Moderation** | `POST /admin/products/{c}/moderate` | `AdminGovernanceTest.php` | `test_food_surplus_product_moderation_and_takedown` | Moderation status `taken_down`, `is_active = false` |
| **R4 / F19: Dispute Escrow Refund** | `POST /admin/disputes/{id}/resolve` | `AdminGovernanceTest.php` | `test_dispute_resolution_with_buyer_escrow_refund` | `resolved_refund`, `escrow_ledger.status = refunded` |
| **R4 / F20: User Account Governance**| `PATCH /admin/users/{id}/status` | `AdminGovernanceTest.php` | `test_user_account_status_update_and_self_suspension_rejection` | Account status updated, self-modification blocked |
| **R4 / F20: Review Moderation** | `POST /admin/reviews/{id}/moderate` | `AdminGovernanceTest.php` | `test_review_moderation_by_admin` | Status `hidden`, flag reason and admin reply saved |
| **R4 / F20: Role Guard Enforcement** | Multiple `/api/v1/admin/*` endpoints | `AdminGovernanceTest.php` | `test_non_admin_access_rejection` | 403 Forbidden for Buyer/Seller, 401 unauthenticated |
| **Core E2E / F8, F14: Lifecycle Flow** | Order -> Mock Pay -> Verify -> Impact | `MarketplaceFlowTest.php` | `test_buyer_can_checkout_pay_and_seller_can_complete_pickup` | Full order lifecycle, escrow release, impact log |

---

## 4. Test Suite Execution & Verification Guide

### 4.1 Running All Backend Automated Tests
Execute the full test suite via the DDEV environment:

```bash
ddev artisan test
```

Or execute directly via PHPUnit with detailed testdox output:

```bash
ddev exec ./vendor/bin/phpunit --testdox
```

### 4.2 Running Specific Test Suites
To execute an individual feature test suite:

```bash
# Buyer Features Suite
ddev artisan test tests/Feature/Api/BuyerFeaturesTest.php

# Seller Features Suite
ddev artisan test tests/Feature/Api/SellerFeaturesTest.php

# Admin Governance Suite
ddev artisan test tests/Feature/Api/AdminGovernanceTest.php

# Core Marketplace Flow Suite
ddev artisan test tests/Feature/Api/MarketplaceFlowTest.php
```

### 4.3 Running Single Targeted Test Methods
```bash
# Test buyer cancellation releasing stock
ddev artisan test --filter=test_buyer_order_cancellation_releases_locked_stock

# Test seller tiered discounts
ddev artisan test --filter=test_tiered_discount_application_50_70_100

# Test admin dispute resolution with escrow refund
ddev artisan test --filter=test_dispute_resolution_with_buyer_escrow_refund
```

### 4.4 Verifying Frontend Quality
Ensure zero TypeScript errors and a clean production build:

```bash
# Typecheck
ddev exec npm run lint

# Production Build
ddev exec npm run build
```

---

## 5. Maintenance & Expansion Guidelines

1. **Always Use `RefreshDatabase`**: Ensure every new test class leverages `use RefreshDatabase;` to isolate database transactions.
2. **Never Hardcode Time Constraints**: In tests verifying deadlines or expiry, utilize Laravel's `$this->travelTo(...)` or relative timestamps (`now()->addDays(...)`) to eliminate transient time-dependent flakes.
3. **Escrow & Impact Validation**: Any test completing an order (`verifyPickup`) must assert that:
   - `escrow_ledger` has a record with `status = released` and matching `order_id`.
   - `impact_logs` has a record with valid positive calculations for `portions_rescued`, `weight_rescued_kg`, and `co2_prevented_kg`.
4. **Boundary Checks**: Whenever adding new endpoints with enum or numeric inputs, include test cases for both the exact boundary limits and the first invalid out-of-boundary values.
