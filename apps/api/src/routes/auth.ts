import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { signToken } from '../utils/jwt.js';
import { validateBody } from '../middleware/validate.js';

export const authRouter = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post('/login', validateBody(authSchema), async (request, response) => {
  const { email, password } = request.body as z.infer<typeof authSchema>;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  return response.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
});

authRouter.get('/me', requireAuth, async (request: AuthenticatedRequest, response) => {
  const user = await prisma.user.findUnique({
    where: { id: request.user?.id ?? '' }
  });

  if (!user) {
    return response.status(404).json({ message: 'User not found' });
  }

  return response.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role
  });
});
