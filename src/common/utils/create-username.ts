import { normalizeBase } from './normalize-base';

export function createUsername(value: string): string {
  return normalizeBase(value)
    .replace(/[^a-z0-9_\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}
