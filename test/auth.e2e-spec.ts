import request from 'supertest';
import {
  createTestApp,
  emailMock,
  extractResetToken,
  getVerificationCode,
  uniqueEmail,
} from './utils/test-app';
import type { TestContext } from './utils/test-app';

describe('AuthController (e2e)', () => {
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

  const createAccount = async () => {
    const payload = {
      email: uniqueEmail('auth'),
      username: `user_${Date.now()}`,
      password: '12345678',
      name: 'Auth User',
    };

    await request(ctx.httpServer).post('/users').send(payload).expect(201);

    return payload;
  };

  const verifyAccount = async (email: string) => {
    const code = await getVerificationCode(ctx.userRepository, email);
    expect(code).not.toBeNull();

    return request(ctx.httpServer)
      .post('/auth/verify')
      .send({ validateEmail: email, validateCode: code })
      .expect(201);
  };

  it('fluxo completo: verify, login, refresh e change-password', async () => {
    const account = await createAccount();

    const verifyResponse = await verifyAccount(account.email);
    expect(verifyResponse.body.accessToken).toBeDefined();
    expect(verifyResponse.body.refreshToken).toBeDefined();
    const accessToken = verifyResponse.body.accessToken;

    const loginResponse = await request(ctx.httpServer)
      .post('/auth/login')
      .send({ indentifier: account.email, password: account.password })
      .expect(201);
    expect(loginResponse.body.accessToken).toBeDefined();

    const refreshResponse = await request(ctx.httpServer)
      .post('/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken })
      .expect(201);
    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.refreshToken).toBeDefined();

    const changeResponse = await request(ctx.httpServer)
      .patch('/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ password: account.password, newPassword: 'nova-senha-123' })
      .expect(200);
    expect(changeResponse.body.message).toBe('Senha alterada com sucesso');

    const loginWithNewPassword = await request(ctx.httpServer)
      .post('/auth/login')
      .send({ indentifier: account.email, password: 'nova-senha-123' })
      .expect(201);
    expect(loginWithNewPassword.body.accessToken).toBeDefined();
  });

  it('resend-code: retorna 401 durante o cooldown e novo código funciona depois', async () => {
    const account = await createAccount();

    const blocked = await request(ctx.httpServer)
      .post('/auth/resend-code')
      .send({ validateEmail: account.email })
      .expect(401);
    expect(blocked.body.message).toBe('Aguarde para pedir seu código novamente');

    const user = await ctx.userRepository.findOneBy({ email: account.email });
    user!.resendTimeCode = new Date(Date.now() - 60_000);
    await ctx.userRepository.save(user!);

    const resend = await request(ctx.httpServer)
      .post('/auth/resend-code')
      .send({ validateEmail: account.email })
      .expect(201);
    expect(resend.body.message).toBe('Código reenviado com sucesso');
    expect(emailMock.sendEmail).toHaveBeenCalledTimes(2);

    const newCode = await getVerificationCode(ctx.userRepository, account.email);
    expect(newCode).not.toBeNull();

    const verifyResponse = await request(ctx.httpServer)
      .post('/auth/verify')
      .send({ validateEmail: account.email, validateCode: newCode })
      .expect(201);
    expect(verifyResponse.body.accessToken).toBeDefined();
  });

  it('forgot-password envia e-mail e reset-password redefine a senha', async () => {
    const account = await createAccount();
    await verifyAccount(account.email);

    const forgotResponse = await request(ctx.httpServer)
      .post('/auth/forgot-password')
      .send({ email: account.email })
      .expect(201);
    expect(forgotResponse.body.message).toBe(
      'E-mail de redefinição de senha enviado com sucesso',
    );

    const resetEmail = emailMock.sendEmail.mock.calls.at(-1)?.[0];
    const resetToken = extractResetToken(resetEmail);
    expect(resetToken).not.toBeNull();

    const resetResponse = await request(ctx.httpServer)
      .post('/auth/reset-password')
      .send({ token: resetToken, newPassword: 'nova-senha-123' })
      .expect(201);
    expect(resetResponse.body.message).toBe(
      'Senha redefinida com sucesso. Faça login com sua nova senha.',
    );

    const loginResponse = await request(ctx.httpServer)
      .post('/auth/login')
      .send({ indentifier: account.email, password: 'nova-senha-123' })
      .expect(201);
    expect(loginResponse.body.accessToken).toBeDefined();
  });

  it('login - retorna 401 para senha incorreta', async () => {
    const account = await createAccount();

    await request(ctx.httpServer)
      .post('/auth/login')
      .send({ indentifier: account.email, password: 'senha-errada' })
      .expect(401);
  });

  it('login - retorna 401 para conta não verificada', async () => {
    const account = await createAccount();

    await request(ctx.httpServer)
      .post('/auth/login')
      .send({ indentifier: account.email, password: account.password })
      .expect(401);
  });

  it('verify - retorna 401 para código inválido', async () => {
    const account = await createAccount();

    await request(ctx.httpServer)
      .post('/auth/verify')
      .send({ validateEmail: account.email, validateCode: '000000' })
      .expect(401);
  });

  it('verify - retorna 401 para código expirado', async () => {
    const account = await createAccount();

    const user = await ctx.userRepository.findOneBy({ email: account.email });
    user!.validTimeCode = new Date(Date.now() - 60_000);
    await ctx.userRepository.save(user!);

    const code = await getVerificationCode(ctx.userRepository, account.email);

    await request(ctx.httpServer)
      .post('/auth/verify')
      .send({ validateEmail: account.email, validateCode: code })
      .expect(401);
  });

  it('reset-password - retorna 401 para token inválido', async () => {
    await request(ctx.httpServer)
      .post('/auth/reset-password')
      .send({ token: 'token-invalido', newPassword: 'nova-senha-123' })
      .expect(401);
  });

  it('change-password - retorna 401 sem token de autenticação', async () => {
    await request(ctx.httpServer)
      .patch('/auth/change-password')
      .send({ password: '12345678', newPassword: 'nova-senha-123' })
      .expect(401);
  });
});
