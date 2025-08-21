// app/emails/set-password.ts

export function setPasswordEmail(link: string) {
  return `
    <p>Hello,</p>
    <p>Thank you for your purchase of The Face Max course.</p>
    <p><a href="${link}">Click here to set your password</a>. This link is valid for 45 minutes.</p>
    <p>If you did not expect this email, you can ignore it.</p>
  `;
}
