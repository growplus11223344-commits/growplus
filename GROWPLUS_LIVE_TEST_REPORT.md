# GROWPLUS — 4-Window Live Testing & Complete Page Audit Report

**Date of Audit:** 2026-11-20  
**Environment:** Windows 10/11 x64 (16 GB Physical RAM, WHPX Hypervisor active)  
**Host Toolchain:** Flutter 3.50.0 / Dart 3.14.0 / OpenJDK 17.0.21 / Node.js v26.13.1  
**Project Root:** `D:\Downloads\growplus_app`  

---

## 1. Executive Environment Status

| Component | Target Runtime | Port / Target Device | Live Status | Health / Response |
|---|---|---|---|---|
| **Android Rewards App** (Window 1) | Android Emulator (Pixel 7) | `emulator-5554` | 🟢 **ACTIVE & VISIBLE** | Running `com.growplus.rewards` |
| **Android Shopping App** (Window 2) | Android Emulator (Medium Phone) | `emulator-5556` | 🟢 **ACTIVE & VISIBLE** | Running `com.growplus.shopping` |
| **iPhone Rewards Preview** (Window 3) | Flutter Web (Chrome App Mode) | `http://localhost:8081` | 🟢 **ACTIVE & VISIBLE** | HTTP 200 OK (Viewport: 430×932) |
| **iPhone Shopping Preview** (Window 4) | Flutter Web (Chrome App Mode) | `http://localhost:8082` | 🟢 **ACTIVE & VISIBLE** | HTTP 200 OK (Viewport: 430×932) |
| **Admin Web Dashboard** | Next.js 14 Production Server | `http://localhost:3000` | 🟢 **ACTIVE & RUNNING** | HTTP 200 OK (7/7 routes active) |
| **Backend REST API** | Express / Node.js Engine | `http://localhost:3001` | 🟢 **ACTIVE & RUNNING** | `{"status":"ok","version":"1.0.0"}` |
| **Supabase PostgreSQL & Auth** | Cloud Supabase Instance | `zjolitbzviahchueaofv` | 🟢 **CONNECTED** | Auth, Profiles, Wallets, Carts active |

---

## 2. Four Testing Windows Status

### Window 1: Android Rewards App
- **Device:** Android Emulator 1 (`emulator-5554` — `Pixel_7`)
- **Package:** `com.growplus.rewards`
- **Application State:** Running in foreground on desktop screen.
- **Tested Screens:**
  1. Splash Screen (Emerald triangle badge on dark navy)
  2. Onboarding Page 1 (Welcome to GrowPlus Rewards • Member Club • Instant Credits)
  3. Onboarding Page 2 (Share and Get Rewarded • Referral link `growplus.app/ref/MEMBER`)
  4. Onboarding Page 3 (Your Rewards Wallet • Promotional balance `₹2,450.00` • Verified Ledger)
  5. Onboarding Page 4 (Start Your Rewards Journey • Single Sign-On • Login & Register actions)
  6. Login Screen (`GROWPLUS Rewards & Referral Portal`)
  7. Registration Screen (`Create Account • Join GrowPlus Rewards`)

### Window 2: Android Shopping App
- **Device:** Android Emulator 2 (`emulator-5556` — `Medium_Phone_API_37.0`)
- **Package:** `com.growplus.shopping`
- **Application State:** Running in foreground on desktop screen.
- **Tested Screens:**
  1. Onboarding Page 1 (Welcome to GrowPlus • Everything You Love, In One Place)
  2. Onboarding Page 2 (Discover Amazing Products • Fashion Edit, Electronics • Category Tags)
  3. Onboarding Page 3 (Shopping Made Simple • Cart Total `₹3,200` • Wallet Credits `-₹500` • Net Payable `₹2,700` • 100% Secure Razorpay)
  4. Onboarding Page 4 (Let's Get Started • Member Privileges • Login & Register actions)
  5. Login Screen (`GROWPLUS SHOPPING • Sign in to shop with your rewards credits`)
  6. Registration Screen (`Create Shopping Account • Join GrowPlus Shopping`)

### Window 3: iPhone-style Rewards Web Preview
- **URL:** `http://localhost:8081`
- **Runtime:** Google Chrome launched in responsive App Mode (`--app=http://localhost:8081 --window-size=430,932`)
- **Status:** HTTP 200 OK. CanvasKit/HTML Flutter Web engine active.
- **Features Verified:** Onboarding flow, theme styling, dark navy/emerald branding, navigation controls.

### Window 4: iPhone-style Shopping Web Preview
- **URL:** `http://localhost:8082`
- **Runtime:** Google Chrome launched in responsive App Mode (`--app=http://localhost:8082 --window-size=430,932`)
- **Status:** HTTP 200 OK. CanvasKit/HTML Flutter Web engine active.
- **Features Verified:** Shopping onboarding flow, product category tags, shopping cart breakdown, auth links.

---

## 3. Backend Connectivity & API Audit

All backend endpoints were tested via direct live HTTP requests against `http://localhost:3001`:

| Endpoint | Method | Auth Required | Live Response | Status |
|---|---|---|---|---|
| `/health` | GET | No | `{"status":"ok","version":"1.0.0"}` | 🟢 PASS |
| `/api/v1/categories` | GET | No | 5 Categories returned (Electronics, Fashion, Beauty, Home, Sports) | 🟢 PASS |
| `/api/v1/products` | GET | No | Product catalog returned (1 active product: `Premium Consumer Retail Item`) | 🟢 PASS |
| `/api/v1/auth/register` | POST | No | `{"message":"Registration successful","user_id":"..."}` | 🟢 PASS |
| `/api/v1/auth/login` | POST | No | Returns `access_token`, `refresh_token`, and user metadata | 🟢 PASS |
| `/api/v1/wallet` | GET | Yes (Bearer) | `{"balance":0,"currency":"INR","is_frozen":false}` | 🟢 PASS |
| `/api/v1/wallet/transactions` | GET | Yes (Bearer) | `{"transactions":[],"pagination":{"total":0}}` | 🟢 PASS |
| `/api/v1/cart` | GET | Yes (Bearer) | `{"id":"c055c0f1-...","items":[]}` | 🟢 PASS |
| `/api/v1/auth/cross-app-token` | POST | Yes (Bearer) | `{"launch_token":"...","deep_link":"growplus://shopping?handoff_token=..."}` | 🟢 PASS |
| `/api/v1/auth/verify-cross-app`| POST | No | `{"success":true,"access_token":"...","wallet":{...}}` | 🟢 PASS |
| **CORS Verification** | OPTIONS / GET | — | `Access-Control-Allow-Origin: http://localhost:8081` | 🟢 PASS |

---

## 4. Admin Dashboard Audit (`http://localhost:3000`)

| Route | HTTP Status | Page Title / Purpose | Visual State |
|---|---|---|---|
| `/` | 200 (Redirect) | Root Overview | Redirects unauthenticated visitors to `/login` |
| `/login` | 200 | GROW PLUS Authorized Staff Portal | Clean navy form with email & password fields |
| `/products` | 200 | Product Catalog & Inventory | Active; shows catalog management, stock, and "+ Add New Product" |
| `/orders` | 200 | Orders & Fulfillment | Active; table layout for order tracking |
| `/rewards` | 200 | Reward Rules & Audit | Active; reward ledger audit view |
| `/reports` | 200 | Reports & Sync | Active; Google Sheets sync status |
| `/staff` | 200 | Staff & Role Management | Active; RBAC management |

---

## 5. Visual UI & Functional Findings

### Positives Verified:
1. **Responsive Scaling:** All 8 onboarding screens adapt to Android 1080×2400 viewports and iPhone 430×932 viewports without horizontal RenderFlex overflow.
2. **Keyboard Handling:** When software keyboards or clipboard overlays appear on Android, screens scroll cleanly inside `SingleChildScrollView` without clipping buttons or throwing bottom overflow errors.
3. **Brand Separation:** 
   - Shopping App correctly presents an emerald-and-white ecommerce aesthetic.
   - Rewards App correctly presents a dark navy-and-emerald fintech aesthetic.
4. **Form Validation:** Both login and registration screens display inline error alerts when required fields are missing or invalid credentials are submitted.

### Issues & Observations (Non-Destructive Audit — No Code Changed):

#### BUG-001 (Low)
- **Application:** Android System / Emulators
- **Page Name:** Android System UI
- **Problem:** When cold-booting Android 17 (API 37) emulators under Windows hypervisor with tight memory, a transient "System UI isn't responding" dialog may appear.
- **Reproduction Steps:** Cold boot a newly created API 37 AVD on Windows with <3 GB free RAM.
- **Expected Behavior:** Emulator boots directly to launcher without ANR dialog.
- **Actual Behavior:** Android OS takes ~90 seconds to initialize system services, triggering ANR.
- **Suggested Fix:** Dismiss dialog by tapping "Wait". In AVD settings, enable snapshot / quick boot or allocate 3072 MB RAM to avoid cold booting on each run.
- **Severity:** Low

#### BUG-002 (Low)
- **Application:** GrowPlus Shopping Web Preview (`http://localhost:8082`)
- **Page Name:** CanvasKit WebGL Initialization
- **Problem:** In headless Chrome without hardware GPU flags (`--disable-gpu`), CanvasKit wasm initial compilation may take >5 seconds on first load before rendering the first frame.
- **Reproduction Steps:** Run headless Chrome with `--disable-gpu` against port 8082 without warm cache.
- **Expected Behavior:** CanvasKit renders within 1 second.
- **Actual Behavior:** Takes 4–6 seconds to compile WebGL shaders on CPU software rasterizer.
- **Suggested Fix:** In normal interactive Chrome (with GPU acceleration enabled), the page renders instantaneously. No code change needed.
- **Severity:** Low

---

## 6. Screenshots Index

All screenshots have been saved in the project artifacts directory:

| Screenshot File | Description |
|---|---|
| `shopping_onboarding_p1_clean.png` | Shopping App Screen 1 on Android (Welcome to GrowPlus) |
| `shopping_onboarding_p2.png` | Shopping App Screen 2 on Android (Discover Amazing Products) |
| `shopping_onboarding_p3.png` | Shopping App Screen 3 on Android (Shopping Made Simple & Razorpay Trust Badge) |
| `shopping_onboarding_p4.png` | Shopping App Screen 4 on Android (Let's Get Started & Login/Register actions) |
| `shopping_login_screen.png` | Shopping App Login Screen |
| `shopping_register_screen.png` | Shopping App Registration Screen |
| `rewards_onboarding_p1_screen.png` | Rewards App Screen 1 on Android (Welcome to GrowPlus Rewards) |
| `rewards_onboarding_p2.png` | Rewards App Screen 2 on Android (Share and Get Rewarded • Referral link) |
| `rewards_onboarding_p3.png` | Rewards App Screen 3 on Android (Your Rewards Wallet • Promotional Credits) |
| `rewards_onboarding_p4.png` | Rewards App Screen 4 on Android (Start Your Rewards Journey • SSO Security) |
| `rewards_login_screen.png` | Rewards App Login Screen |
| `rewards_register_screen.png` | Rewards App Registration Screen |
| `admin_dashboard_preview.png` | Admin Dashboard Login Screen (`http://localhost:3000/login`) |
| `admin_products_preview.png` | Admin Dashboard Products Management Screen (`http://localhost:3000/products`) |
| `rewards_web_p1.png` | Rewards App iPhone-style Web Preview (`http://localhost:8081`) |
