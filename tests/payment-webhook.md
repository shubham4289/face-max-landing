# Payment webhook test checklist

## Razorpay test mode

- Create a Payment Link that requires email.
- In Razorpay Webhooks: URL https://thefacemax.com/api/webhook/payment, secret matches RAZORPAY_WEBHOOK_SECRET, select `payment.captured`.
- Pay using test card, complete capture.
- Verify in DB: users.purchased=true for that email; payments row present.
- Check email (Resend logs) → open set-password link → set password → redirect to /course.
- Logout → Login with password → you should enter OTP (existing flow) and access /course.

## Forgot password

- Use the same email → request reset at /auth/forgot-password → receive mail → set new password → login OK.
