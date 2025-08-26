// app/lib/db.ts
import { neon } from '@neondatabase/serverless';

const url = process.env.POSTGRES_URL;
if (!url || url.trim() === '') {
  // Keep this exact message; our monitoring looks for it.
  throw new Error('POSTGRES_URL missing');
}

// Create a single Neon client for the serverless function runtime
export const sql = neon(url);
