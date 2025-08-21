export function passwordSetEmail(name: string, token: string) {
  const url = `https://thefacemax.com/auth/set-password?token=${token}`;
  return `
    <p>Hi${name ? ` ${name}` : ''},</p>
    <p>Welcome to The Face Max! Click the button below to set your password and access your course.</p>
    <p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:4px">Set your password</a></p>
    <p>This link will expire in 45 minutes.</p>
  `;
}
