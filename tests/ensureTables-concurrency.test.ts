import postgres from 'postgres';

const pgSql = postgres({ host: 'localhost', username: 'postgres', password: 'postgres', database: 'postgres' });

jest.mock('@/app/lib/db', () => ({ sql: pgSql }));

async function loadBootstrap() {
  delete require.cache[require.resolve('@/app/lib/bootstrap')];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@/app/lib/bootstrap');
}

describe('ensureTables concurrency', () => {
  beforeAll(async () => {
    await pgSql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
    const { ensureTables } = await loadBootstrap();
    await ensureTables();
    await pgSql`ALTER TABLE otps DROP CONSTRAINT IF EXISTS otps_user_id_fkey`;
  });

  afterAll(async () => {
    await pgSql.end({ timeout: 5 });
  });

  it('runs twice in parallel without errors', async () => {
    const { ensureTables } = await loadBootstrap();
    await Promise.all([ensureTables(), ensureTables()]);
  });
});
