import { createHmac } from 'crypto';
import { expect, test } from '@playwright/test';
import { Config } from '@/utils/config';

test.describe('signatures', () => {
  test('rejects missing', async ({ page }) => {
    const response = await page.request.post('/api/vercel', {
      data: JSON.stringify({ foo: 'bar' }),
    });
    const data = await response.json();

    expect(response.status()).toBe(401);
    expect(data.error.code).toBe('UnauthorizedError');
    expect(data.error.message).toBe('Invalid signature');
  });

  test('rejects invalid', async ({ page }) => {
    const response = await page.request.post('/api/vercel', {
      data: JSON.stringify({ foo: 'bar' }),
      headers: {
        'x-vercel-signature': 'foobar',
      },
    });
    const data = await response.json();

    expect(response.status()).toBe(401);
    expect(data.error.code).toBe('UnauthorizedError');
    expect(data.error.message).toBe('Invalid signature');
  });

  test('accepts valid', async ({ page }) => {
    const data = JSON.stringify({ foo: 'bar' });
    const response = await page.request.post('/api/vercel', {
      data,
      headers: {
        'x-vercel-signature': createHmac('sha1', Config.VERCEL_CLIENT_SECRET)
          .update(data)
          .digest('hex'),
      },
    });
    expect(response.status()).toBe(200);
  });
});
