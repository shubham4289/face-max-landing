process.env.POSTGRES_URL = 'postgres://user:pass@localhost/db';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: ResponseInit) =>
      new Response(JSON.stringify(body), { status: init?.status || 200 }),
  },
}));

jest.mock('server-only', () => ({}), { virtual: true });

jest.mock('@/app/lib/db', () => ({
  sql: jest.fn(),
}));

jest.mock('../app/lib/bootstrap', () => ({
  ensureTables: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../app/lib/cookies', () => ({
  getSession: jest.fn(),
}));

jest.mock('../app/lib/crypto', () => ({
  randomId: () => 'new-id',
}));

import { POST } from '../app/api/admin/sections/route';
import { getCourseData } from '../app/lib/course-data';

const { sql } = require('@/app/lib/db');
const { getSession } = require('../app/lib/cookies');

beforeEach(() => {
  process.env.ADMIN_EMAIL = 'admin@example.com';
  sql.mockReset();
});

describe('admin sections POST', () => {
  it('returns 401 when not admin', async () => {
    getSession.mockReturnValue({ email: 'user@example.com' });
    const req = new Request('http://localhost/api/admin/sections', {
      method: 'POST',
      body: JSON.stringify({ title: 'A', orderIndex: 0 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  it('creates section when admin', async () => {
    getSession.mockReturnValue({ email: 'admin@example.com' });
    sql.mockResolvedValueOnce(undefined);
    const req = new Request('http://localhost/api/admin/sections', {
      method: 'POST',
      body: JSON.stringify({ title: 'Hello', orderIndex: 1 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true, id: 'new-id', title: 'Hello', orderIndex: 1 });
  });
});

describe('course data loader', () => {
  it('returns created sections', async () => {
    sql
      .mockImplementationOnce(async () => [
        { id: 'new-id', title: 'Hello', order_index: 1 },
      ])
      .mockImplementationOnce(async () => []);
    const data = await getCourseData();
    expect(data.length).toBe(1);
    expect(data[0].title).toBe('Hello');
  });
});

