// app/lib/bootstrap.ts
import { sql } from "../lib/db";

/**
 * Creates/updates the schema used by the app.
 * - Keeps users & otps (as you had them)
 * - Adds sections & lectures for the admin course builder
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

  // Small index to speed up "latest login OTPs for a user"
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
      video_id     text,
      duration_min int  DEFAULT 0,
      created_at   timestamptz DEFAULT now()
    );
  `;

  // --- purchases for course access ---
  await sql`
    CREATE TABLE IF NOT EXISTS purchases (
      user_id    text NOT NULL,
      course_id  text NOT NULL,
      created_at timestamptz DEFAULT now(),
      PRIMARY KEY (user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  // --- password reset tokens ---
  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      id          text PRIMARY KEY,
      user_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash  text NOT NULL,
      expires_at  timestamptz NOT NULL,
      consumed_at timestamptz
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(order_index, created_at);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_lectures_section_order ON lectures(section_id, order_index, created_at);`;
}
