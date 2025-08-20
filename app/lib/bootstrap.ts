import { sql } from './db';

export async function ensureTables() {
  await sql`CREATE TABLE IF NOT EXISTS users(
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    password_hash text NOT NULL,
    email_verified_at timestamptz NULL,
    created_at timestamptz DEFAULT now()
  );`;
  await sql`CREATE TABLE IF NOT EXISTS otps(
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    code_hash text NOT NULL,
    purpose text NOT NULL CHECK (purpose in ('verify','login','reset')),
    expires_at timestamptz NOT NULL,
    consumed_at timestamptz NULL,
    created_at timestamptz DEFAULT now()
  );`;
  await sql`CREATE TABLE IF NOT EXISTS sessions(
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    token_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
  );`;
}
