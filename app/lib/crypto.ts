import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'crypto';
import { sql } from '@/app/lib/db';

export function randomId(len = 32): string {
  return randomBytes(len / 2).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;
  const derived = scryptSync(plain, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  return derived.length === keyBuf.length && timingSafeEqual(derived, keyBuf);
}

export async function issuePasswordToken(
  email: string,
  purpose: 'set' | 'reset',
  ttlMinutes = 60
): Promise<string> {
  const token = randomId(48);
  const expires = new Date(Date.now() + ttlMinutes * 60_000);
  await sql`INSERT INTO password_tokens(token, email, purpose, expires_at) VALUES(${token}, ${email}, ${purpose}, ${expires});`;
  return token;
}

export async function consumePasswordToken(
  token: string,
  expectedPurpose: 'set' | 'reset'
): Promise<{ email: string } | null> {
  const rows = (await sql`
    DELETE FROM password_tokens
    WHERE token=${token} AND purpose=${expectedPurpose} AND expires_at > now()
    RETURNING email;
  `) as { email: string }[];
  if (rows.length === 0) return null;
  return { email: rows[0].email };
}

export function createPlainToken(): string {
  return randomBytes(24).toString('hex');
}

export function safeEqualHex(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a, 'hex');
    const bBuf = Buffer.from(b, 'hex');
    return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

