import { registerAs } from '@nestjs/config';

export default registerAs('email-code', () => {
  return {
    emailCodeExpiresAt:
      Number(process.env.EMAIL_CODE_EXPIRES_AT) || Number('900'),
    emailCodeResendBlockTime:
      Number(process.env.EMAIL_CODE_RESEND_BLOCK_TIME) || Number('30'),
  };
});
