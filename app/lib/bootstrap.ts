// app/lib/bootstrap.ts
import { sql } from "../lib/db";

/**
 * Creates the minimal schema required by the app.
 * - Keeps your existing users & otps (unchanged)
 * - Adds sections & lectures used by the /admin/course builder
 *   (TEXT ids so we can use any string id; foreign key from lectures → sections)
 */
export async function ensureTables() {
  // --- existing tables ---
  await sql`
    CREATE TABLE IF NOT EXISTS users(
      id            uuid PRIMARY KEY,
      email         text UNIQUE NOT NULL,
      name          text NOT NULL,
      password_hash text NOT NULL,
      created_at    timestamptz DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS otps(
      id          uuid PRIMARY KEY,
      user_id     uuid NOT NULL,
      code_hash   text NOT NULL,
      purpose     text NOT NULL CHECK (purpose in ('login')),
      expires_at  timestamptz NOT NULL,
      consumed_at timestamptz NULL,
      created_at  timestamptz DEFAULT now()
    );
  `;

  -- Add a small index that speeds up “latest login OTPs for a user” lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_otps_user_purpose_created
      ON otps (user_id, purpose, created_at DESC);
  `;

  // --- NEW: sections/lectures for course structure ---
  await sql`
    CREATE TABLE IF NOT EXISTS sections (
      id          text PRIMARY KEY,
      title       text NOT NULL,
      order_index int  NOT NULL DEFAULT 0,
      created_at  timestamptz DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS lectures (
      id           text PRIMARY KEY,
      section_id   text NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      title        text NOT NULL,
      order_index  int  NOT NULL DEFAULT 0,
      video_id     text,                -- VdoCipher videoId (nullable until you paste one)
      duration_min int  DEFAULT 0,
      created_at   timestamptz DEFAULT now()
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(order_index, created_at);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_lectures_section_order ON lectures(section_id, order_index, created_at);`;
}
