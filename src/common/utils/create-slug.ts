import { normalizeBase } from './normalize-base';

export function createSlug(value: string): string {
  return normalizeBase(value)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/_/g, '-') // 👈 ponto chave
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
