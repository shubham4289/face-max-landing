// app/lib/crypto.ts
import { randomBytes, scryptSync, timingSafeEqual, createHmac, createHash } from "crypto";

// app/lib/crypto.ts (append these helpers)
import { randomBytes, timingSafeEqual } from "crypto";

export function createPlainToken(): string {
  return randomBytes(24).toString("hex"); // 48-char
}

// Compares two hex-encoded hashes in constant-time
export function safeEqualHex(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");
    return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}


