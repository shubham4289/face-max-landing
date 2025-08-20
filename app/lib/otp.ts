export function generateOtp(n = 6): string {
  let otp = '';
  for (let i = 0; i < n; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

export function expiresIn(minutes = 10): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
