import bcrypt from 'bcryptjs';
import crypto from 'crypto';
export async function hashPassword(p: string) { return await bcrypt.hash(p, 10); }
export async function verifyPassword(p: string, hash: string) { return await bcrypt.compare(p, hash); }
export function hashToken(v: string) { return crypto.createHash('sha256').update(v).digest('hex'); }
export function randomId() { return crypto.randomUUID(); }
