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
