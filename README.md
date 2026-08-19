# GigFlow

A freelance marketplace where clients hire freelancers for fixed-price gigs, pay through Stripe escrow, and release funds once work is approved.

## Features

- **Auth** - email/password registration and login (client/freelancer/admin roles), JWT access + refresh tokens in httpOnly cookies.
- **Gigs** - freelancers create, edit, and list gigs; clients browse and search by category.
- **Orders** - full lifecycle: `PENDING_PAYMENT` → `PENDING_ACCEPTANCE` → `IN_PROGRESS` → `DELIVERED` → `COMPLETED`, with revision requests and cancellations.
- **Payments (Stripe)** - card payment on order creation, held via manual-capture PaymentIntents (escrow), captured on freelancer acceptance, transferred to the freelancer's connected Stripe account on completion. Refunds on rejection/cancellation/dispute.
- **Freelancer payouts** - Stripe Connect Express onboarding so freelancers can receive transfers.
- **Disputes** - either party can raise a dispute; admins resolve it (refund or restore order).
- **Ratings** - clients rate freelancers after a completed order.
- **Admin dashboard** - dispute resolution queue.

## Tech stack

|              |                                                             |
| ------------ | ----------------------------------------------------------- |
| Frontend     | React 18, Vite, React Router, Tailwind CSS, Radix UI, Axios |
| Backend      | Node.js, Express, MongoDB (Mongoose)                        |
| Payments     | Stripe (PaymentIntents, Connect, Webhooks)                  |
| File storage | Supabase Storage (gig images, delivery attachments)         |
| Auth         | JWT (access + refresh), httpOnly cookies                    |

## Project structure

```
Gigflow/
├── client/   # React + Vite frontend
└── server/   # Express + MongoDB API
```

## Prerequisites

- Node.js 18+
- A MongoDB instance (local or [Atlas](https://www.mongodb.com/atlas))
- A [Stripe](https://dashboard.stripe.com) account (test mode is fine)
- A [Supabase](https://supabase.com) project with a storage bucket
- The [Stripe CLI](https://docs.stripe.com/stripe-cli) (for forwarding webhooks locally)

## Local setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # then fill in real values, see below
npm run dev
```

`server/.env` variables:

| Variable                                                         | Notes                                                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `PORT`                                                           | e.g. `5000`                                                                            |
| `CLIENT_URL`                                                     | frontend origin, e.g. `http://localhost:5173` — used for CORS and Stripe redirect URLs |
| `MONGODB_URI`                                                    | MongoDB connection string                                                              |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`                       | strong random strings                                                                  |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY`                       | e.g. `15m` / `30d`                                                                     |
| `NODE_ENV`                                                       | `development` or `production`                                                          |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_BUCKET` | from your Supabase project settings                                                    |
| `STRIPE_SECRET_KEY`                                              | from the Stripe Dashboard                                                              |
| `STRIPE_WEBHOOK_SECRET`                                          | see below                                                                              |

### 2. Stripe webhooks (local)

In a separate terminal:

```bash
stripe listen --forward-to localhost:5000/webhooks/stripe
```

This prints a `whsec_...` value — put it in `STRIPE_WEBHOOK_SECRET`. Keep this running while you test payments locally; restart it (and copy the new secret) if it's ever closed and reopened.

### 3. Frontend

```bash
cd client
npm install
cp .env.example .env   # then fill in real values
npm run dev
```

`client/.env` variables:

| Variable                      | Notes                            |
| ----------------------------- | -------------------------------- |
| `VITE_API_BASE_URL`           | e.g. `http://localhost:5000/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | your Stripe `pk_test_...` key    |

The app runs at `http://localhost:5173`.

### Test payments

Use Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC.

## Deployment

- **Frontend** → [Vercel](https://vercel.com), root directory `client/`, framework preset Vite. `client/vercel.json` handles SPA routing so deep links (e.g. `/dashboard/freelancer`) don't 404 on refresh.
- **Backend** → [Railway](https://railway.app), root directory `server/`. Generate a public domain under Networking, then set all the env vars above with production values (`NODE_ENV=production`, a real `MONGODB_URI` — e.g. MongoDB Atlas — and `CLIENT_URL` pointing at the Vercel URL).
- **Stripe webhook (production)** — create an event destination in the Stripe Dashboard pointing at `https://<railway-domain>/webhooks/stripe`, listening for: `account.updated`, `payment_intent.amount_capturable_updated`, `payment_intent.succeeded`, `payment_intent.canceled`, `transfer.created`, `charge.refunded`. Use its signing secret as `STRIPE_WEBHOOK_SECRET` on Railway — the local `stripe listen` CLI is not used in production.

## Scripts

**server/**
| Command | |
|---|---|
| `npm run dev` | start with nodemon |
| `npm start` | start (production) |
| `npm run seed:admin` | seed an admin user |

**client/**
| Command | |
|---|---|
| `npm run dev` | start Vite dev server |
| `npm run build` | production build |
| `npm run preview` | preview a production build locally |
| `npm run lint` | run ESLint |
