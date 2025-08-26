// app/lib/bootstrap.ts
import { sql } from "@/app/lib/db";

export const ensureTables: Promise<void> = (async () => {

  // Guard constraints via pg_constraint so boot can run on every request without errors.

  // Required for gen_random_uuid()
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

  // USERS
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      phone TEXT,
      password_hash TEXT,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::uuid;`;
  await sql`ALTER TABLE users ALTER COLUMN email SET NOT NULL;`;
  await sql`ALTER TABLE users ALTER COLUMN name DROP NOT NULL;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;`;
  await sql`ALTER TABLE users ALTER COLUMN is_admin SET DEFAULT FALSE;`;
  await sql`ALTER TABLE users ALTER COLUMN is_admin SET NOT NULL;`;
  await sql`ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();`;
  await sql`ALTER TABLE users DROP COLUMN IF EXISTS purchased;`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users(LOWER(email));`;

  // OTPS
  await sql`
    CREATE TABLE IF NOT EXISTS otps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`ALTER TABLE otps ALTER COLUMN id TYPE UUID USING id::uuid;`;
  await sql`ALTER TABLE otps ALTER COLUMN user_id TYPE UUID USING user_id::uuid;`;
  await sql`
    DO $$
    BEGIN
      LOCK TABLE otps IN ACCESS EXCLUSIVE MODE;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'otps_user_id_fkey'
      ) THEN
        ALTER TABLE otps
          ADD CONSTRAINT otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `;

  // COURSE STRUCTURE
  await sql`
    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      "order" INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // PAYMENTS
  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      provider_payment_id TEXT NOT NULL,
      status TEXT NOT NULL,
      amount_cents INT NOT NULL,
      currency TEXT NOT NULL,
      raw JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`ALTER TABLE payments ALTER COLUMN id TYPE UUID USING id::uuid;`;
  await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id UUID;`;
  await sql`ALTER TABLE payments ALTER COLUMN user_id TYPE UUID USING user_id::uuid;`;
  await sql`ALTER TABLE payments ALTER COLUMN user_id SET NOT NULL;`;
  await sql`ALTER TABLE payments DROP COLUMN IF EXISTS email;`;
  await sql`ALTER TABLE payments DROP COLUMN IF EXISTS payload;`;
  await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'captured';`;
  await sql`ALTER TABLE payments ALTER COLUMN status DROP DEFAULT;`;
  await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS raw JSONB NOT NULL DEFAULT '{}'::jsonb;`;
  await sql`ALTER TABLE payments ALTER COLUMN raw DROP DEFAULT;`;
  await sql`ALTER TABLE payments ALTER COLUMN created_at SET DEFAULT now();`;
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_user_id_fkey'
      ) THEN
        ALTER TABLE payments
          ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `;
  await sql`
    DO $$
    DECLARE
      existing_constraint TEXT;
    BEGIN
      -- Drop standalone index if it exists without a matching constraint
      IF EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'payments_provider_payment_id_key' AND relkind = 'i'
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_provider_payment_id_key'
      ) THEN
        EXECUTE 'DROP INDEX IF EXISTS payments_provider_payment_id_key';
      END IF;

      -- If the constraint already exists, skip creation
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_provider_payment_id_key'
      ) THEN
        RETURN;
      END IF;

      -- Rename existing composite constraint or create a new one
      SELECT conname INTO existing_constraint
      FROM pg_constraint
      WHERE conrelid = 'payments'::regclass
        AND contype = 'u'
        AND conkey = ARRAY[
          (SELECT attnum FROM pg_attribute WHERE attrelid = 'payments'::regclass AND attname = 'provider'),
          (SELECT attnum FROM pg_attribute WHERE attrelid = 'payments'::regclass AND attname = 'provider_payment_id')
        ];

      IF existing_constraint IS NOT NULL THEN
        EXECUTE format('ALTER TABLE payments RENAME CONSTRAINT %I TO payments_provider_payment_id_key', existing_constraint);
      ELSE
        ALTER TABLE payments
          ADD CONSTRAINT payments_provider_payment_id_key UNIQUE (provider, provider_payment_id);
      END IF;
    END $$;
  `;

  // PURCHASES
  await sql`
    CREATE TABLE IF NOT EXISTS purchases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product TEXT NOT NULL,
      amount_cents INT NOT NULL,
      currency TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_order_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`ALTER TABLE purchases ALTER COLUMN id TYPE UUID USING id::uuid;`;
  await sql`ALTER TABLE purchases ADD COLUMN IF NOT EXISTS user_id UUID;`;
  await sql`ALTER TABLE purchases ALTER COLUMN user_id TYPE UUID USING user_id::uuid;`;
  await sql`ALTER TABLE purchases ALTER COLUMN user_id SET NOT NULL;`;
  await sql`ALTER TABLE purchases DROP COLUMN IF EXISTS course_id;`;
  await sql`ALTER TABLE purchases DROP COLUMN IF EXISTS payment_id;`;
  await sql`ALTER TABLE purchases ADD COLUMN IF NOT EXISTS provider TEXT;`;
  await sql`ALTER TABLE purchases ALTER COLUMN provider SET NOT NULL;`;
  await sql`ALTER TABLE purchases ADD COLUMN IF NOT EXISTS provider_order_id TEXT;`;
  await sql`ALTER TABLE purchases ALTER COLUMN created_at SET DEFAULT now();`;
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'purchases_user_id_fkey'
      ) THEN
        ALTER TABLE purchases
          ADD CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS purchases_user_product_key ON purchases(user_id, product);`;

  // PASSWORD TOKENS
  await sql`
    CREATE TABLE IF NOT EXISTS password_tokens (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      purpose TEXT NOT NULL CHECK (purpose IN ('set','reset')),
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_password_tokens_email ON password_tokens(email);`;
})();
