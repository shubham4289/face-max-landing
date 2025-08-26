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

jest.mock('../app/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  sendMail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../app/lib/cookies', () => ({
  getSession: jest.fn(),
  setSession: jest.fn(),
}));

jest.mock('../app/lib/access', () => ({
  userHasPurchase: jest.fn(),
}));

jest.mock('../app/lib/course-data', () => ({
  getCourseData: jest.fn(),
}));

jest.mock('../app/lib/admin', () => ({
  requireAdminEmail: jest.fn(),
}));

jest.mock('../app/lib/crypto', () => ({
  randomId: () => 'new-id',
  hashToken: () => 'hash',
  hashPassword: async () => 'passhash',
  verifyPassword: async () => true,
  issuePasswordToken: async () => 'tok123',
  safeEqualHex: () => true,
}));

import { renderToStaticMarkup } from 'react-dom/server';
import crypto from 'crypto';

import CoursePage from '../app/course/page';
import { POST as StripeWebhook } from '../app/api/webhooks/stripe/route';
import { POST as PaymentWebhook } from '../app/api/webhook/payment/route';
import { POST as CreateOrder } from '../app/api/payments/create/route';
import { POST as AdminInvite } from '../app/api/admin/invite/route';
import { POST as ForgotPassword } from '../app/api/auth/forgot-password/route';
import { upsertUserByEmail } from '../app/lib/users';

const { sql } = require('@/app/lib/db');
const { getSession } = require('../app/lib/cookies');
const { userHasPurchase } = require('../app/lib/access');
const { getCourseData } = require('../app/lib/course-data');
const { sendEmail, sendMail } = require('../app/lib/email');
const { requireAdminEmail } = require('../app/lib/admin');

describe('users helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('upsertUserByEmail lowercases email', async () => {
    sql.mockResolvedValueOnce([{ id: 'u1', email: 'foo@example.com' }]);
    const res = await upsertUserByEmail({
      email: 'Foo@Example.COM',
      name: 'Foo',
      phone: '123',
    });
    expect(res).toEqual({ id: 'u1', email: 'foo@example.com' });
    expect(sql.mock.calls[0][1]).toBe('foo@example.com');
  });
});

describe('/course page access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logged out prompts login', async () => {
    getSession.mockReturnValue(null);
    const el = await CoursePage();
    const html = renderToStaticMarkup(el);
    expect(html).toContain('Please log in');
  });

  test('non-buyer sees paywall', async () => {
    getSession.mockReturnValue({ userId: 'u1' });
    userHasPurchase.mockResolvedValue(false);
    const el = await CoursePage();
    const html = renderToStaticMarkup(el);
    expect(html).toContain('You do not have access');
  });

  test('buyer sees course', async () => {
    getSession.mockReturnValue({ userId: 'u1' });
    userHasPurchase.mockResolvedValue(true);
    getCourseData.mockResolvedValue([]);
    const el = await CoursePage();
    const html = renderToStaticMarkup(el);
    expect(html).toContain('Course content');
  });
});

describe('payments create', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'ord_1' }),
    }) as any;
    process.env.RAZORPAY_KEY_ID = 'key';
    process.env.RAZORPAY_KEY_SECRET = 'sec';
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'key';
    process.env.APP_URL = 'https://www.thefacemax.club';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('returns order info', async () => {
    const req = new Request('http://localhost/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@example.com' }),
    });
    const res = await CreateOrder(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect((global.fetch as any).mock.calls.length).toBe(1);
  });
});

describe('webhook handlers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('stripe webhook creates user, purchase, sends email', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'sec';
    sql
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'u1' }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    const event = {
      type: 'checkout.session.completed',
      data: { object: { customer_details: { email: 'a@example.com', name: 'Alice' } } },
    };
    const raw = JSON.stringify(event);
    const ts = '12345';
    const v1 = crypto.createHmac('sha256', 'sec').update(`${ts}.${raw}`).digest('hex');
    const sig = `t=${ts},v1=${v1}`;
    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': sig },
      body: raw,
    });
    const res = await StripeWebhook(req);
    expect(res.status).toBe(200);
    const queries = sql.mock.calls.map((c: any[]) => c[0].join(''));
    expect(queries.some((q: string) => q.includes('INSERT INTO users'))).toBe(true);
    expect(queries.some((q: string) => q.includes('RETURNING id'))).toBe(true);
    expect(queries.some((q: string) => q.includes('INSERT INTO purchases'))).toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  test('razorpay webhook marks user purchased, logs payment, sends email', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'rzp';
    sql
      .mockResolvedValueOnce([{ id: 'u1', email: 'b@example.com' }])
      .mockResolvedValueOnce([{ id: 'pay_1' }])
      .mockResolvedValueOnce(undefined);

    const event = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_1',
            email: 'b@example.com',
            amount: 1000,
            currency: 'INR',
            notes: { email: 'b@example.com', name: 'Bob' },
          },
        },
      },
    };
    const raw = JSON.stringify(event);
    const sig = crypto.createHmac('sha256', 'rzp').update(raw).digest('hex');
    const req = new Request('http://localhost/api/webhook/payment', {
      method: 'POST',
      headers: { 'x-razorpay-signature': sig },
      body: raw,
    });
    const res = await PaymentWebhook(req);
    expect(res.status).toBe(200);
    const queries = sql.mock.calls.map((c: any[]) => c[0].join(''));
    expect(queries.some((q: string) => q.includes('INSERT INTO users'))).toBe(true);
    expect(queries.some((q: string) => q.includes('INSERT INTO payments'))).toBe(true);
    expect(queries.some((q: string) => q.includes('INSERT INTO purchases'))).toBe(true);
    const payUser = sql.mock.calls[1][1];
    const purchaseUser = sql.mock.calls[2][1];
    expect(payUser).toBe('u1');
    expect(purchaseUser).toBe('u1');
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  test('razorpay webhook is idempotent', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'rzp';
    sql
      .mockResolvedValueOnce([{ id: 'u1', email: 'b@example.com' }])
      .mockResolvedValueOnce([]);

    const event = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_1',
            email: 'b@example.com',
            amount: 1000,
            currency: 'INR',
            notes: { email: 'b@example.com', name: 'Bob' },
          },
        },
      },
    };
    const raw = JSON.stringify(event);
    const sig = crypto.createHmac('sha256', 'rzp').update(raw).digest('hex');
    const req = new Request('http://localhost/api/webhook/payment', {
      method: 'POST',
      headers: { 'x-razorpay-signature': sig },
      body: raw,
    });
    const res = await PaymentWebhook(req);
    expect(res.status).toBe(200);
    expect(sql.mock.calls.length).toBe(2);
    expect(sendMail).not.toHaveBeenCalled();
  });

  test('razorpay webhook returns 400 on bad signature', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'rzp';
    const event = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_1', email: 'b@example.com' } } },
    };
    const raw = JSON.stringify(event);
    const req = new Request('http://localhost/api/webhook/payment', {
      method: 'POST',
      headers: { 'x-razorpay-signature': 'bad' },
      body: raw,
    });
    const res = await PaymentWebhook(req);
    expect(res.status).toBe(400);
  });

});

describe('admin invite', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('creates user and purchase and sends email', async () => {
    requireAdminEmail.mockReturnValue(undefined);
    sql
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'u1' }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    const req = new Request('http://localhost/api/admin/invite', {
      method: 'POST',
      body: JSON.stringify({ email: 'c@example.com', name: 'Carol' }),
    });
    const res = await AdminInvite(req);
    expect(res.status).toBe(200);
    const queries = sql.mock.calls.map((c: any[]) => c[0].join(''));
    expect(queries.some((q: string) => q.includes('INSERT INTO users'))).toBe(true);
    expect(queries.some((q: string) => q.includes('RETURNING id'))).toBe(true);
    expect(queries.some((q: string) => q.includes('INSERT INTO purchases'))).toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});

describe('forgot password', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('sends email only for buyers', async () => {
    sql.mockResolvedValueOnce([{ ok: 1 }]).mockResolvedValueOnce(undefined);
    const req = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'buyer@example.com' }),
    });
    const res = await ForgotPassword(req);
    expect(res.status).toBe(200);
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      'buyer@example.com',
      'Reset your password – The Ultimate Implant Course',
      expect.stringContaining('tok123')
    );
  });

  test('non-buyers do not receive email', async () => {
    sql.mockResolvedValueOnce([]);
    const req = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'nobuyer@example.com' }),
    });
    const res = await ForgotPassword(req);
    expect(res.status).toBe(200);
    expect(sendMail).not.toHaveBeenCalled();
  });
});
