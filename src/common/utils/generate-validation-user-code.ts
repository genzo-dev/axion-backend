import { randomInt } from 'crypto';

export function generateValidationUserCode() {
  const code = randomInt(100_000, 999_999).toString();

  return code;
}
