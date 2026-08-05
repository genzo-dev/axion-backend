import request from 'supertest';
import { createTestApp } from './utils/test-app';
import type { TestContext } from './utils/test-app';

describe('AppController (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('/ (GET)', () => {
    return request(ctx.httpServer)
      .get('/')
      .expect(200)
      .expect(process.env.NODE_ENV!);
  });
});
