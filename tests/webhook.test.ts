import postgres from 'postgres';
import crypto from 'crypto';

process.env.POSTGRES_URL = 'postgres://user:pass@localhost/db';

const pgSql = postgres({ host: 'localhost', username: 'postgres', password: 'postgres', database: 'postgres' });

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: ResponseInit) =>
      new Response(JSON.stringify(body), { status: init?.status || 200 }),
  },
}));

jest.mock('server-only', () => ({}), { virtual: true });

jest.mock('@/app/lib/db', () => ({ sql: pgSql }));

jest.mock('../app/lib/email', () => ({
  sendMail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../app/lib/crypto', () => ({
  issuePasswordToken: jest.fn().mockResolvedValue('tok'),
}));

import { POST } from '../app/api/webhook/payment/route';
import { ensureTables } from '../app/lib/bootstrap';

const { sendMail } = require('../app/lib/email');

beforeAll(async () => {
  await ensureTables();
});

beforeEach(async () => {
  (sendMail as jest.Mock).mockClear();
  await pgSql`TRUNCATE payments, purchases, users RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
  await pgSql.end({ timeout: 5 });
});

describe('razorpay webhook', () => {
  test('processes valid event once', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'rzp';
    const event = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_1',
            email: 'Foo@Example.com',
            amount: 1000,
            currency: 'INR',
            notes: { email: 'Foo@Example.com', name: 'Foo' },
            contact: '123',
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
    const res = await POST(req);
    expect(res.status).toBe(200);
    const users = await pgSql`SELECT email FROM users`;
    expect(users[0].email).toBe('foo@example.com');
    const payments = await pgSql`SELECT provider_payment_id FROM payments`;
    expect(payments.length).toBe(1);
    const purchases = await pgSql`SELECT * FROM purchases`;
    expect(purchases.length).toBe(1);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  test('duplicate webhook does not double insert', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'rzp';
    const event = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_dup',
            email: 'a@example.com',
            amount: 1000,
            currency: 'INR',
            notes: { email: 'a@example.com', name: 'A' },
            contact: '1',
          },
        },
      },
    };
    const raw = JSON.stringify(event);
    const sig = crypto.createHmac('sha256', 'rzp').update(raw).digest('hex');
    const makeReq = () =>
      new Request('http://localhost/api/webhook/payment', {
        method: 'POST',
        headers: { 'x-razorpay-signature': sig },
        body: raw,
      });
    const res1 = await POST(makeReq());
    const res2 = await POST(makeReq());
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    const payments = await pgSql`SELECT * FROM payments`;
    expect(payments.length).toBe(1);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  test('bad signature returns 400', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'rzp';
    const event = { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_b', email: 'x@example.com' } } } };
    const raw = JSON.stringify(event);
    const req = new Request('http://localhost/api/webhook/payment', {
      method: 'POST',
      headers: { 'x-razorpay-signature': 'bad' },
      body: raw,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

