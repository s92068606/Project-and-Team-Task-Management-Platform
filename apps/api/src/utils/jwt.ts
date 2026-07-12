import jwt from 'jsonwebtoken';

export type TokenPayload = {
  sub: string;
  role: string;
  email: string;
};

const secret = process.env.JWT_SECRET ?? 'dev-secret';

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, secret, { expiresIn: '8h' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret) as TokenPayload;
}
