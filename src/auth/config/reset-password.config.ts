import { registerAs } from '@nestjs/config';

export default registerAs('resetPassword', () => {
  return {
    secret:
      process.env.JWT_RESET_PASSWORD_SECRET ||
      'segredo da redefinição de senha',
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    jwtTtl: Number(process.env.JWT_TTL_RESET_PASSWORD ?? '900'),
    frontUrl: process.env.FRONT_URL || 'http://localhost:3000',
  };
});
