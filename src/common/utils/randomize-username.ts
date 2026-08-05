import { createUsername } from './create-username';

function generateSuffix(): string {
  return Math.floor(Math.random() * 9000 + 100).toString();
}

export function randomizeUsername(name: string): string {
  const base = createUsername(name);

  const safeBase = base || 'user';

  return `${safeBase}_${generateSuffix()}`;
}
