# VdoCipher Setup

## Endpoint
- The secure OTP endpoint lives at `app/api/get-otp/route.ts`.

## Changing the Video
- Update the `VIDEO_ID` string in `app/page.tsx` to point to a different video.

## Environment Variable
- Set the `VDOCIPHER_API_SECRET` environment variable in Vercel for the endpoint to authenticate with VdoCipher.

## Watermark
- Optional `viewerName` and `viewerEmail` fields can be passed to `/api/get-otp` to render personalized watermark text.
- The annotation also includes built-in `{{ip}}` and `{{timestamp}}` tokens and moves on screen (`movable: true`).
- The API secret remains hidden; it should live in the Vercel environment variable `VDOCIPHER_API_SECRET`.
