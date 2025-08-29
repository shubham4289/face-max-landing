import { sql } from '@/app/lib/db';

export async function ensureTables(): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      password_hash text NULL,
      name text NULL,
      phone text NULL,
      is_admin boolean DEFAULT false NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL
    );
  `;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text NULL;`;
  await sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'password_hash' AND is_nullable = 'NO'
      ) THEN
        ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
      END IF;
    END $$;
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));`;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NULL,
      provider text,
      provider_payment_id text,
      status text,
      amount_cents integer,
      currency text,
      raw jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS purchases (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NULL,
      product text,
      amount_cents integer,
      currency text,
      provider text,
      created_at timestamptz DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS otps (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      code_hash text NOT NULL,
      purpose text NOT NULL,
      expires_at timestamptz NOT NULL,
      consumed_at timestamptz,
      created_at timestamptz DEFAULT now()
    );
  `;

  await sql`ALTER TABLE purchases ALTER COLUMN user_id TYPE uuid USING user_id::uuid;`;

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_provider_payment_id_key'
      ) THEN
        ALTER TABLE payments ADD CONSTRAINT payments_provider_payment_id_key UNIQUE (provider_payment_id);
      END IF;
    END $$;
  `;

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_user_id_fkey'
      ) THEN
        ALTER TABLE payments ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `;

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'purchases_user_id_fkey'
      ) THEN
        ALTER TABLE purchases ADD CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `;

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'otps_user_id_fkey'
      ) THEN
        ALTER TABLE otps ADD CONSTRAINT otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `;

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS purchases_user_product_idx ON purchases (user_id, product);`;
}

