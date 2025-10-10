// backend/__tests__/health.test.js
const request = require('supertest');

let app;
beforeAll(() => {
  // Import here (not top-level) so the test fails clearly if app isn't exported.
  app = require('../src/app');
});

describe('Health check', () => {
  test('GET /_ping responds with { ok: true }', async () => {
    const res = await request(app).get('/_ping');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ ok: true }));
  });
});
