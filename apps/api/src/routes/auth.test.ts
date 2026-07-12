import { describe, expect, it } from 'vitest';
import { signToken } from '../utils/jwt.js';

describe('jwt helper', () => {
  it('creates a token string', () => {
    const token = signToken({ sub: 'user-1', role: 'ADMIN', email: 'admin@example.com' });
    expect(typeof token).toBe('string');
  });
});
