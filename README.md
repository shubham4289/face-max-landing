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

## Deploy on Vercel
1. Push this repo to GitHub.
2. In Vercel, New Project → Import from GitHub → select this repo → Deploy.
3. In Project Settings → Environment Variables, add `ABSTRACT_API_KEY` with the value `fd77498b5dda457cba99528dffd37832`.
4. Add your domain in Project Settings → Domains → thefacemax.com
