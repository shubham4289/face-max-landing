# VdoCipher Setup

## Endpoint
- The secure OTP endpoint lives at `app/api/get-otp/route.ts`.

## Changing the Video
- Update the `VIDEO_ID` string in `app/page.tsx` to point to a different video.

## Environment Variable
- Set the `VDOCIPHER_API_SECRET` environment variable in Vercel for the endpoint to authenticate with VdoCipher.

## Watermark
- Optional `viewerName` and `viewerEmail` fields can be passed to `/api/get-otp` to render personalized watermark text.
- The annotation also includes built-in `{ip}` and `{date.h:i:s A}` tokens and moves on screen.
- The API secret remains hidden; it should live in the Vercel environment variable `VDOCIPHER_API_SECRET`.

## Usage

```ts
--- GET example ---
fetch(`/api/get-otp?videoId=VIDEO_ID&viewerName=${encodeURIComponent(name)}&viewerEmail=${encodeURIComponent(email)}`, { cache: "no-store" })
  .then(r => r.json())
  .then(({ otp, playbackInfo }) => {
    document.getElementById("vdoplayer").src =
      `https://player.vdocipher.com/v2/?otp=${encodeURIComponent(otp)}&playbackInfo=${encodeURIComponent(playbackInfo)}`;
  });

--- POST example ---
await fetch("/api/get-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  cache: "no-store",
  body: JSON.stringify({ videoId: "VIDEO_ID", viewerName: name, viewerEmail: email })
}).then(r => r.json()).then(({ otp, playbackInfo }) => { /* set iframe src as above */ });
```

## Environment Variables
- `POSTGRES_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `APP_URL`
- `VDOCIPHER_API_SECRET`

## Auth Flows
- Sign-up requires email verification via OTP sent to the user.
- Login requires password then a second-factor OTP emailed to the user.
- Forgot password triggers a reset OTP; resetting updates the password.
- Sessions are stored in Postgres and issued as an HttpOnly `fm_session` cookie.
- `/course` is protected by middleware that checks this cookie.

## Watermark Personalization
`/api/get-otp` personalizes the dynamic watermark using `viewerName` and `viewerEmail`.
If these fields are not provided, the route pulls `name` and `email` from the `fm_session` cookie.
