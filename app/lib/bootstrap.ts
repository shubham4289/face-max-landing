// app/lib/bootstrap.ts
import { sql } from "@/app/lib/db";

let done = false;

export async function ensureTables() {
  if (done) return;
  // USERS
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT,
      purchased BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `;
  // Ensure purchased column exists (if table came from an older revision)
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='purchased'
      ) THEN
        ALTER TABLE users ADD COLUMN purchased BOOLEAN DEFAULT FALSE;
      END IF;
    END $$;
  `;

  // OTPS (already used for login)
  await sql`
    CREATE TABLE IF NOT EXISTS otps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      code_hash TEXT NOT NULL,
      purpose TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      consumed_at TIMESTAMP WITH TIME ZONE
    );
  `;

  // COURSE STRUCTURE
  await sql`
    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      "order" INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lectures (
      id TEXT PRIMARY KEY,
      section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      order_index INT NOT NULL DEFAULT 0,
      vdocipher_videoid TEXT,
      duration_minutes INT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `;

  // PAYMENTS (log)
  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      payment_id TEXT NOT NULL,
      email TEXT NOT NULL,
      amount INTEGER,       -- store in minor units if available
      currency TEXT,
      raw JSONB,            -- store full webhook for audit
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `;

  // PASSWORD RESET TOKENS
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      purpose TEXT NOT NULL, -- 'set-password' or 'reset-password'
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `;

  done = true;
}
