# ServicePort Platform

A service marketplace connecting clients with specialists. Clients browse services, book time slots, pay online, and leave reviews. Specialists manage their schedule and receive bookings.

## Tech stack

- **Backend** — Spring Boot 4.0.3, Java 21, PostgreSQL, Flyway, JWT auth
- **Frontend** — React 19, Vite, Tailwind CSS, TanStack Query, Zustand

---

## Running locally

### Prerequisites

- Java 21
- PostgreSQL 15+
- Node.js 20.19+

### Backend

```bash
# Create database
psql -U postgres -c "CREATE USER spp_user WITH PASSWORD 'spp_pass';"
psql -U postgres -c "CREATE DATABASE spp_db OWNER spp_user;"

# Set required environment variables (see sections below for integrations)
export JWT_SECRET=<base64-encoded-secret>

cd backend/spp
./gradlew bootRun
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Stripe integration (test mode)

Payments are processed via Stripe Payment Intents. No card data ever touches the server — only a `PaymentIntent` ID is stored, which removes the project from PCI DSS scope (SAQ A).

### 1. Get test API keys

1. Sign up or log in at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure **Test mode** is toggled on (top-right switch)
3. Go to **Developers → API keys**
4. Copy **Secret key** (starts with `sk_test_...`)

### 2. Set environment variables

```bash
export STRIPE_API_KEY=sk_test_...
export STRIPE_CURRENCY=eur          # default, can be changed
```

### 3. Set up the webhook for local development

Install the Stripe CLI:

```bash
# Arch Linux
yay -S stripe-cli
# or download from https://stripe.com/docs/stripe-cli
```

Forward events to your local server:

```bash
stripe listen --forward-to localhost:8080/api/webhooks/stripe
```

The CLI prints a **webhook signing secret** (`whsec_...`). Set it:

```bash
export STRIPE_WEBHOOK_SECRET=whsec_...
```

Restart the backend after setting variables.

### 4. Test cards

| Card number          | Behaviour                     |
|----------------------|-------------------------------|
| 4242 4242 4242 4242  | Payment succeeds immediately  |
| 4000 0000 0000 9995  | Declined — insufficient funds |
| 4000 0025 0000 3155  | Requires 3D Secure            |

Use any future expiry date, any 3-digit CVC, any ZIP code.

### Payment flow

1. Client creates a booking → status `PENDING`
2. Client calls `POST /api/bookings/{id}/payment` → receives `clientSecret`
3. Frontend uses Stripe.js to confirm the payment with the `clientSecret`
4. Stripe calls `POST /api/webhooks/stripe` with `payment_intent.succeeded`
5. Backend sets booking status to `CONFIRMED` and payment status to `SUCCEEDED`

---

## Google Calendar integration

Connects a user's Google Calendar so confirmed bookings automatically appear in both participants' calendars.

### Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services → Enable APIs** → enable **Google Calendar API**
3. **Credentials → Create → OAuth 2.0 Client ID** (type: Web application)
4. Add authorized redirect URI: `http://localhost:8080/api/integrations/google/callback`
5. Copy Client ID and Client Secret

```bash
export GOOGLE_CLIENT_ID=...
export GOOGLE_CLIENT_SECRET=...
export GOOGLE_TOKEN_ENCRYPTION_SECRET=<random-32-char-string>
```

On the **OAuth consent screen**, add test user emails before Google verification.

---

## Environment variables reference

| Variable                        | Required | Default                              | Description                        |
|---------------------------------|----------|--------------------------------------|------------------------------------|
| `JWT_SECRET`                    | yes      | dev fallback in yml                  | Base64 HMAC key for JWT signing    |
| `STRIPE_API_KEY`                | yes      | —                                    | Stripe secret key (`sk_test_...`)  |
| `STRIPE_WEBHOOK_SECRET`         | yes      | —                                    | Stripe webhook endpoint secret     |
| `STRIPE_CURRENCY`               | no       | `eur`                                | ISO 4217 currency code             |
| `GOOGLE_CLIENT_ID`              | no       | —                                    | Google OAuth client ID             |
| `GOOGLE_CLIENT_SECRET`          | no       | —                                    | Google OAuth client secret         |
| `GOOGLE_REDIRECT_URI`           | no       | `http://localhost:8080/...`          | OAuth callback URL                 |
| `GOOGLE_TOKEN_ENCRYPTION_SECRET`| no       | —                                    | AES key for token storage          |
| `CORS_ALLOWED_ORIGINS`          | no       | `http://localhost:5173`              | Allowed frontend origins           |
