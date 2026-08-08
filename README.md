# ReceiptStore — Prototype 001

**Every receipt. One place.**

A working prototype of three connected services that prove the core
ReceiptStore journey end to end:

> A customer identifies themselves at checkout with a personal ReceiptStore
> barcode → the till recognises them → the sale completes → a digital
> receipt appears in the customer's app.

This replaces the earlier single-file browser mockup with a real API and
database behind two separate front ends.

## What's in here

```
receiptstore/
├── backend/         Node.js + Express REST API, SQLite database
├── customer-app/    Mobile-first React app (the shopper's ReceiptStore)
└── till-app/        Demo self-checkout screen
```

The three run as independent processes and only talk to each other over
HTTP, the same way they would in a real deployment.

| Service       | Tech                        | Default port |
| ------------- | ---------------------------- | ------------- |
| `backend`     | Express, SQLite (`better-sqlite3`) | 4000 |
| `customer-app`| React + Vite                 | 5173 |
| `till-app`    | React + Vite                 | 5174 |

## Deploying live (Render)

A `render.yaml` [Blueprint](https://render.com/docs/blueprint-spec) at the
repo root deploys all three services at once — no manual dashboard
configuration beyond the one-time setup below:

1. Sign in at [dashboard.render.com](https://dashboard.render.com) and
   connect your GitHub account, granting access to this repo if prompted.
2. Click **New +** → **Blueprint**, pick this repo. Render reads
   `render.yaml` and shows all three services (`receiptstore-backend`,
   `receiptstore-customer-app`, `receiptstore-till-app`).
3. It will prompt for `TILL_API_KEY` (on the backend) and
   `VITE_TILL_API_KEY` (on the till app) — these aren't committed to the
   repo, so pick any random string yourself and **enter the exact same
   value in both prompts**. `JWT_SECRET` is generated for you.
4. Click **Apply**. Render builds and deploys all three; first build takes
   a few minutes.

You'll end up with:
- `https://receiptstore-customer-app.onrender.com`
- `https://receiptstore-till-app.onrender.com`
- `https://receiptstore-backend.onrender.com` (the API — the two apps
  above already point at it via `VITE_API_BASE_URL` in `render.yaml`)

If Render appends a suffix to any of those names (only happens if the
plain name is taken), the hardcoded `CORS_ORIGIN` and `VITE_API_BASE_URL`
values in `render.yaml` won't match anymore — update them to the actual
assigned URLs and push again to redeploy.

**Known limitations of the free tier**: the backend spins down after 15
minutes of inactivity (the first request after that takes ~30–60s to wake
it back up), and its SQLite file is **not persisted** across
redeploys/restarts — every restart starts from an empty database. Fine
for demoing the flow; for anything longer-lived, either attach a Render
persistent disk to the backend service or migrate to a hosted Postgres
(see [Swapping SQLite for Postgres later](#swapping-sqlite-for-postgres-later)).

## Prerequisites

Node.js 18+ and npm.

## Setup

Each service has its own dependencies and its own `.env`. Run these once:

```bash
# 1. Backend
cd backend
cp .env.example .env
npm install

# 2. Customer app
cd ../customer-app
cp .env.example .env
npm install

# 3. Demo till
cd ../till-app
cp .env.example .env
npm install
```

`till-app/.env`'s `VITE_TILL_API_KEY` must match `backend/.env`'s
`TILL_API_KEY` — they ship with the same placeholder value already, so
this works out of the box. Change both together if you edit either.

## Running locally

Open three terminals, one per service:

```bash
# Terminal 1
cd backend && npm run dev
# → http://localhost:4000

# Terminal 2
cd customer-app && npm run dev
# → http://localhost:5173

# Terminal 3
cd till-app && npm run dev
# → http://localhost:5174
```

The backend creates `backend/receiptstore.sqlite` on first run and seeds
one demo retailer ("Demo Mart"). Delete that file to reset all data.

## Walking through the demo

1. Open the **customer app** (`:5173`), tap **Create Account**, and sign
   up with a name, email and password.
2. You land on **Home**. Tap **My Card** — you'll see your ReceiptStore ID
   (`RS-XXXXXXXX`), a scannable barcode, and a QR code.
3. Open the **Demo Till** (`:5174`) in another tab/window. Type that
   ReceiptStore ID into the customer panel and tap **Simulate Scan** (or
   **Look Up**) — the till shows **CUSTOMER RECOGNISED ✓** with your name.
4. Tap a few products to add them to the basket (subtotal, 20% VAT and
   total update live).
5. Tap **COMPLETE SALE**. The till posts the transaction to the backend
   and shows a confirmation.
6. Back in the customer app, open **Receipts** — the new receipt is there.
   Open it to see the full item breakdown and VAT split.

That loop (account → card → till recognition → sale → receipt in app) is
the thing this prototype exists to prove.

## API overview

All endpoints are under `backend`'s `/api` prefix.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | — | Create an account + ReceiptStore customer, returns a JWT |
| POST | `/auth/login` | — | Sign in, returns a JWT |
| GET | `/customer/me` | customer JWT | Profile + this-month spend |
| GET | `/customer/card` | customer JWT | Name + ReceiptStore ID for the Card screen |
| GET | `/receipts` | customer JWT | List receipts (`?q=`, `?retailer=`, `?sort=`) |
| GET | `/receipts/:id` | customer JWT | Full receipt detail |
| POST | `/transactions` | till API key | Record a completed till sale |
| POST | `/barcode/validate` | till API key | Look up a customer by ReceiptStore ID |

Customer endpoints expect `Authorization: Bearer <token>`. Till endpoints
expect an `x-till-api-key` header — see [Security notes](#security-notes)
for why that's a deliberately simple stand-in.

## Data model

- **users** — login credentials, name
- **customers** — one per user, holds the public `receiptstore_id`
- **retailers** — just "Demo Mart" for now; created on demand
- **transactions** — subtotal / VAT / total (integer pence), linked to a customer and retailer
- **receipt_items** — sku, name, qty, unit price, line total, linked to a transaction

Money is stored and computed in integer pence throughout the backend to
avoid floating-point rounding errors; only the UI formats it as £.

## Security notes (prototype scope)

- No payment or card data is ever stored — the till only ever sends a
  product catalogue and a ReceiptStore ID.
- The barcode/QR on the Card screen carries only the customer's public
  ReceiptStore ID, not personal data or receipt contents.
- Every API request is authenticated: customer app calls carry a JWT,
  till calls carry a shared API key.
- `GET /receipts` and `GET /receipts/:id` scope strictly to the
  authenticated customer — there's no way to read another customer's
  receipts. A receipt that isn't yours (or doesn't exist) returns a plain
  404, not a 403, so the endpoint doesn't confirm which IDs exist.
- All secrets (`JWT_SECRET`, `TILL_API_KEY`) live in `.env` files, which
  are git-ignored. `.env.example` files with placeholder values are
  committed instead.
- The till's shared API key is a **prototype-only** simplification — a
  real deployment would provision credentials per device rather than
  baking one static key into every till's build.

## What's deliberately not built

Per the Prototype 001 brief, these have UI entry points where the spec
calls for them but are not functional:

- Real Apple/Google Wallet passes (the Card screen's button is a stub)
- Push notifications
- A retailer-facing dashboard
- Real EPOS/retailer integration (the till has one fixed demo catalogue and one demo retailer)
- Loyalty/rewards
- Category or date filters on Receipts (search, retailer filter and sort are implemented)
- Receipt Export / Share / Warranty / Return actions (stub buttons on the receipt detail screen)

## Swapping SQLite for Postgres later

The backend's only database-specific code lives in `backend/src/db.js`
(connection + schema bootstrap) and its route files use plain SQL through
`better-sqlite3`'s synchronous API. Moving to Postgres means swapping the
driver and adjusting that SQL to an async client (e.g. `pg`) — the schema
in `backend/src/schema.sql` is standard enough to port directly.
