import { GET } from '../app/api/geo-price/route';

// Mock NextResponse.json to behave like Next.js response
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: ResponseInit) =>
      new Response(JSON.stringify(body), { status: init?.status || 200 }),
  },
}));

describe('geo-price API', () => {
  const url = 'https://example.com/api/geo-price?baseInr=1000';

  it('returns 500 when ABSTRACT_API_KEY is missing', async () => {
    delete process.env.ABSTRACT_API_KEY;
    const req = new Request(url);
    const res = await GET(req);
    expect(res.status).toBe(500);
  });

  it('converts INR to target currency', async () => {
    process.env.ABSTRACT_API_KEY = 'test-key';
    const mockData = {
      ip_address: '1.2.3.4',
      country: 'US',
      currency: { currency_code: 'USD' },
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    }) as any;

    const req = new Request(url);
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.currency.symbol).toBe('$');
    expect(json.price.converted).toBe(12);
  });
});
