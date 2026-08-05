import request from 'supertest';
import { createTestApp, emailMock, uniqueEmail } from './utils/test-app';
import type { TestContext } from './utils/test-app';

describe('UsersController (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  beforeEach(async () => {
    await ctx.userRepository.clear();
    emailMock.sendEmail.mockClear();
  });

  const createUserPayload = {
    email: uniqueEmail('user'),
    username: 'genzo_test',
    password: '12345678',
    name: 'Test User',
  };

  it('POST /users - cria a conta, persiste e envia e-mail de validação', async () => {
    const response = await request(ctx.httpServer)
      .post('/users')
      .send(createUserPayload)
      .expect(201);

    expect(response.body.email).toBe(createUserPayload.email);
    expect(response.body.username).toBe(createUserPayload.username);
    expect(response.body.name).toBe(createUserPayload.name);
    expect(response.body.isVerified).toBe(false);

    const user = await ctx.userRepository.findOneBy({
      email: createUserPayload.email,
    });

    expect(user).not.toBeNull();
    expect(user!.passwordHash).not.toBe(createUserPayload.password);
    expect(user!.verificationCode).not.toBeNull();

    expect(emailMock.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('POST /users - retorna 409 quando o e-mail já está cadastrado', async () => {
    await request(ctx.httpServer)
      .post('/users')
      .send(createUserPayload)
      .expect(201);

    const response = await request(ctx.httpServer)
      .post('/users')
      .send({ ...createUserPayload, username: `outro_${Date.now()}` })
      .expect(409);

    expect(response.body.message).toBe('Já existe uma conta com este e-mail');
  });

  it('POST /users - retorna 409 quando o username já está em uso', async () => {
    await request(ctx.httpServer)
      .post('/users')
      .send(createUserPayload)
      .expect(201);

    const response = await request(ctx.httpServer)
      .post('/users')
      .send({ ...createUserPayload, email: uniqueEmail('user') })
      .expect(409);

    expect(response.body.message).toBe(
      'Este nome de usuário não está disponível',
    );
  });

  it('POST /users - retorna 400 quando falta a senha', async () => {
    const { email, username, name } = createUserPayload;

    await request(ctx.httpServer)
      .post('/users')
      .send({ email, username, name })
      .expect(400);
  });

  it('POST /users - retorna 400 para campo extra (whitelist)', async () => {
    await request(ctx.httpServer)
      .post('/users')
      .send({ ...createUserPayload, admin: true })
      .expect(400);
  });
});
