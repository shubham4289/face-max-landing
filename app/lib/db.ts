import { neon } from '@neondatabase/serverless';
if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL missing');
export const sql = neon(process.env.POSTGRES_URL);
