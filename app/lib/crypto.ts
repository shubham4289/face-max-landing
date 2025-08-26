// app/lib/crypto.ts
import { randomBytes, scryptSync, timingSafeEqual, createHmac, createHash } from "crypto";

/** Make a base64url string from bytes */
function toBase64Url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** Generate an opaque random token the user will receive via email */
export function generateOpaqueToken(bytes: number = 32) {
  return toBase64Url(randomBytes(bytes));
}

/** Hash a token (never store raw tokens) */
export function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

/** Constant-time equality for strings (as Buffers) */
export function safeEqualHex(aHex: string, bHex: string) {
  const a = Buffer.from(aHex, "hex");
  const b = Buffer.from(bHex, "hex");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Hash password with scrypt; store as "s1$<saltHex>$<keyHex>" */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64); // defaults are solid for scryptSync
  return `s1$${salt.toString("hex")}$${Buffer.from(key).toString("hex")}`;
}

/** Verify scrypt password */
export function verifyPassword(password: string, stored: string): boolean {
  const [ver, saltHex, keyHex] = stored.split("$");
  if (ver !== "s1" || !saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const actual = Buffer.from(keyHex, "hex");
  const test = scryptSync(password, salt, actual.length);
  try {
    return timingSafeEqual(actual, test);
  } catch {
    return false;
  }
}

/** HMAC verify for Razorpay webhook bodies */
export function hmacSha256Hex(secret: string, rawBody: string) {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}
