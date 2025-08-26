# Face Max Landing (Next.js + Tailwind)

## Local Setup
1. Install Node.js 18+
2. `npm install`
3. `npm run dev` then open http://localhost:3000

### `/api/geo-price` and `ABSTRACT_API_KEY`
The geo-pricing API uses [Abstract's IP Geolocation API](https://www.abstractapi.com/ip-geolocation-api).

1. Sign up at Abstract and copy your API key.
2. Create a `.env.local` file in the project root and add:

   ```env
   ABSTRACT_API_KEY=fd77498b5dda457cba99528dffd37832
   ```
3. Restart `npm run dev` so the key is loaded.

### Other Environment Variables
In Vercel Project Settings → Environment Variables, add:

- `RAZORPAY_WEBHOOK_SECRET` – verifies Razorpay webhooks at `/api/webhook/payment`.
- `APP_URL` – base URL for emails; must be `https://thefacemax.com`.
- `RESEND_API_KEY` – API key for sending emails through Resend.
- `RESEND_FROM` – sender address (`admin@thefacemax.com`).

## Deploy on Vercel
1. Push this repo to GitHub.
2. In Vercel, New Project → Import from GitHub → select this repo → Deploy.
3. In Project Settings → Environment Variables, add the keys above including `ABSTRACT_API_KEY`.
4. Add your domain in Project Settings → Domains → thefacemax.com

## Payments & Password Setup
1. In the Razorpay dashboard, go to Webhooks and add:
   - URL: `https://thefacemax.com/api/webhook/payment`
   - Secret: your `RAZORPAY_WEBHOOK_SECRET`
   - Events: `payment.captured`
2. When a payment is captured, the webhook marks `purchased=true` and sends a set‑password email.
3. Forgot password is allowed only if `purchased=true`.

## Razorpay (.club) setup
For the `thefacemax.club` Vercel project, configure these environment variables:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM` (use `admin@thefacemax.com`)
- `APP_URL` (should be `https://www.thefacemax.club`)

The payment API defaults to USD. To switch to INR, edit the `CURRENCY` constant in `app/api/payments/create/route.ts`.

## Razorpay Test vs Live

Razorpay issues separate credentials for Test and Live modes. Ensure these environment variables are set for the desired mode:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_WEBHOOK_SECRET`

When switching modes in the Razorpay dashboard, update the variables above in Vercel so the server and client use the matching keys.

## Database schema

The application bootstraps its PostgreSQL schema at runtime via `ensureTables()` in `app/lib/bootstrap.ts`. It creates or updates the following tables:

- **users**: `id` UUID primary key, `email` unique lowercase text, optional `name` and `phone`, `is_admin` boolean, `password_hash`, `created_at` timestamp.
- **purchases**: records entitlements with `user_id` UUID FK to `users`, `product`, `amount_cents`, `currency`, `provider`, optional `provider_order_id`, `created_at`.
- **payments**: logs payment events with `user_id` UUID FK, `provider`, `provider_payment_id`, `status`, `amount_cents`, `currency`, raw JSON payload, `created_at`, and uniqueness on `(provider, provider_payment_id)`.

Run the migration locally by importing and executing `ensureTables()` or starting the dev server. On deploy, this function runs automatically to keep the schema in sync.

## Schema guard

`ensureTables()` also acts as a schema guard. On startup it adds missing `user_id` columns to `payments` and `purchases`, wires their foreign keys to `users(id)` with `ON DELETE CASCADE`, ensures the `users` table exists with required fields, and maintains a unique index on `lower(email)`.
