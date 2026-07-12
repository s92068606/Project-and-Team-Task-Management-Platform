import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt.js';

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: string;
    email: string;
  };
};

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const header = request.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Missing bearer token' });
  }

  try {
    const token = header.slice(7);
    const payload = verifyToken(token);
    request.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email
    };
    return next();
  } catch {
    return response.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}
