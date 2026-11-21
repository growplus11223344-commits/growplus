# GrowPlus — Production Ecosystem

> A multi-app e-commerce platform with integrated rewards, referrals, and wallet system built on Supabase, Express/TypeScript, Flutter, and Next.js.

---

## 📦 Monorepo Structure

```
growplus_app/
├── backend/                    # Express + TypeScript API server
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.ts     # Supabase admin + anon clients
│   │   ├── middleware/
│   │   │   ├── authenticate.ts # JWT auth + admin auth middleware
│   │   │   └── errorHandler.ts # Global error handler + AppError class
│   │   ├── routes/
│   │   │   ├── auth.ts         # Register, login, refresh, logout
│   │   │   ├── users.ts        # User profile CRUD
│   │   │   ├── products.ts     # Product catalog (public + admin)
│   │   │   ├── categories.ts   # Category listing
│   │   │   ├── cart.ts         # Cart management
│   │   │   ├── orders.ts       # Order creation + history
│   │   │   ├── payments.ts     # Razorpay payment initiation + verify
│   │   │   ├── wallet.ts       # Wallet balance + transactions
│   │   │   ├── rewards.ts      # Reward balance + rules
│   │   │   ├── referrals.ts    # Referral code + history
│   │   │   ├── notifications.ts# Notification management
│   │   │   ├── admin.ts        # Admin dashboard endpoints
│   │   │   ├── support.ts      # Support ticket management
│   │   │   └── webhooks.ts     # Razorpay webhook handler
│   │   └── utils/
│   │       └── logger.ts       # Winston logger
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── admin-dashboard/            # Next.js 14 Admin Dashboard
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example (copy from root)
│
├── apps/
│   ├── growplus_rewards/       # Flutter App: Earn rewards
│   │   ├── lib/
│   │   │   ├── main.dart
│   │   │   ├── app.dart
│   │   │   ├── core/
│   │   │   │   ├── constants/  # Colors, theme, API constants
│   │   │   │   └── router/     # GoRouter configuration
│   │   │   └── features/       # Auth, home, wallet, referrals, profile
│   │   └── pubspec.yaml
│   │
│   └── growplus_shopping/      # Flutter App: Shop with credits
│       ├── lib/
│       │   ├── main.dart
│       │   ├── app.dart
│       │   ├── core/
│       │   │   ├── constants/  # Colors, theme
│       │   │   └── router/     # GoRouter configuration
│       │   └── features/       # Auth, home, products, cart, orders
│       └── pubspec.yaml
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # All 23 tables + RLS + triggers
│   └── seed.sql                     # Staff roles, categories, reward rules
│
├── docker-compose.yml          # MongoDB + Mongo Express (dev only)
├── .env.example                # Root env template
├── .gitignore
├── PROJECT_STATUS.md           # Phase tracking and credentials checklist
└── README.md
```

---

## 🔑 Required Credentials

> ⚠️ All keys must be filled in before running the system. Use **Test/Sandbox** keys during development.

| Service | Variables | How to Get |
|---------|-----------|------------|
| **Supabase** | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | [supabase.com](https://supabase.com) → Project Settings → API |
| **Razorpay** (Sandbox) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | [razorpay.com](https://razorpay.com) → Settings → API Keys (Test mode) |
| **Google Sheets** | `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` | GCP Console → IAM → Service Accounts → Create Key |
| **Google Sheets IDs** | 6 × `GOOGLE_SHEETS_SPREADSHEET_ID_*` | Google Sheets URL after `/d/` |
| **JWT Secrets** | `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_JWT_SECRET` | `openssl rand -base64 32` |
| **MongoDB** | `MONGODB_URI` | Docker Compose (local) or MongoDB Atlas |

---

## 🚀 Setup Instructions

### 1. Prerequisites

- Node.js ≥ 20
- Flutter ≥ 3.3.0
- Docker Desktop (for local MongoDB)
- Supabase CLI: `npm install -g supabase`

### 2. Environment Setup

```bash
# Root env
cp .env.example .env

# Backend env
cp backend/.env.example backend/.env

# Fill in ALL values in both .env files
```

### 3. Database Setup (Supabase)

```bash
# Link your Supabase project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Apply schema migrations
supabase db push

# Apply seed data
psql -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

### 4. Backend Setup

```bash
cd backend
npm install
npm run dev        # Development (hot reload)
# OR
npm run build && npm start  # Production
```

Backend runs on: http://localhost:3001  
Health check: http://localhost:3001/health

### 5. Admin Dashboard Setup

```bash
cd admin-dashboard
npm install
npm run dev        # Development
```

Admin dashboard runs on: http://localhost:3000

### 6. Local MongoDB (Development)

```bash
docker-compose up -d
# MongoDB: localhost:27017
# Mongo Express UI: http://localhost:8081
```

### 7. Flutter Apps

```bash
# GrowPlus Rewards App
cd apps/growplus_rewards
flutter pub get
flutter run --dart-define=SUPABASE_URL=https://your-project.supabase.co \
             --dart-define=SUPABASE_ANON_KEY=your-anon-key

# GrowPlus Shopping App
cd apps/growplus_shopping
flutter pub get
flutter run --dart-define=SUPABASE_URL=https://your-project.supabase.co \
             --dart-define=SUPABASE_ANON_KEY=your-anon-key
```

---

## 🗄️ Database (23 Tables)

| # | Table | Purpose |
|---|-------|---------|
| 1 | `user_profiles` | Customer profiles |
| 2 | `referral_codes` | Per-user referral codes |
| 3 | `referrals` | Referral tracking |
| 4 | `categories` | Product categories |
| 5 | `products` | Product catalog |
| 6 | `product_images` | Product gallery |
| 7 | `inventory` | Stock levels |
| 8 | `product_variations` | SKU variants |
| 9 | `carts` | Active carts |
| 10 | `cart_items` | Cart line items |
| 11 | `orders` | Customer orders |
| 12 | `order_items` | Order line items |
| 13 | `payments` | Razorpay payment records |
| 14 | `wallet_accounts` | GrowPlus credit wallets |
| 15 | `wallet_transactions` | Credit/debit history |
| 16 | `reward_rules` | Configurable reward rules |
| 17 | `reward_transactions` | Reward earning history |
| 18 | `notifications` | In-app notifications |
| 19 | `staff_roles` | Role definitions |
| 20 | `staff` | Admin staff members |
| 21 | `audit_logs` | Admin audit trail |
| 22 | `support_tickets` | Customer support |
| 23 | `support_messages` | Ticket message threads |

---

## 🔄 Development Workflow

```
Feature Development:
1. Branch from main
2. Make changes (backend → test with curl/Postman)
3. Write tests: npm test (backend)
4. PR → review → merge

Database Changes:
1. Create new migration file: supabase/migrations/NNN_description.sql
2. Test locally with: supabase db reset
3. Apply to production: supabase db push
```

---

## 📊 Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Monorepo Scaffold | ✅ Complete |
| Phase 2–12 | See PROJECT_STATUS.md | ⏳ Pending |

---

## ⚠️ Important Notes

1. **Razorpay**: Use Test (`rzp_test_`) keys during development. Live keys require merchant KYC verification.
2. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Backend only.
3. **Idempotency**: Order creation uses `idempotency_key` (UUID) to prevent duplicate orders on network retry.
4. **Wallet deduction**: Done atomically with order creation. Never deduct without creating a `wallet_transactions` record.
5. **Webhooks**: Razorpay webhooks use `x-razorpay-event-id` for idempotency.
6. **Google Sheets**: Share each spreadsheet with the service account email (Editor access).
7. **RLS**: All tables have Row Level Security enabled. Backend uses service role to bypass RLS where needed.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | Supabase (PostgreSQL) + MongoDB (analytics) |
| Backend | Node.js, Express, TypeScript |
| Auth | Supabase Auth (JWT) |
| Payments | Razorpay (India) |
| Admin Dashboard | Next.js 14, React, TypeScript, Tailwind CSS |
| Mobile Apps | Flutter 3.x, Riverpod, GoRouter |
| Container | Docker (MongoDB dev only) |
