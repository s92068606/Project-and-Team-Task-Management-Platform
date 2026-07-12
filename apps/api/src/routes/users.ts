import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { prisma } from '../utils/prisma.js';

export const userRouter = Router();

const userSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'])
});

const userUpdateSchema = userSchema.partial().extend({
  password: z.string().min(8).optional()
});

userRouter.get('/', requireAuth, requireRole(['ADMIN']), async (_request, response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return response.json(users);
});

userRouter.post('/', requireAuth, requireRole(['ADMIN']), validateBody(userSchema), async (request, response) => {
  const body = request.body as z.infer<typeof userSchema>;
  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      fullName: body.fullName,
      email: body.email,
      passwordHash,
      role: body.role
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return response.status(201).json(user);
});

userRouter.patch('/:id', requireAuth, requireRole(['ADMIN']), validateBody(userUpdateSchema), async (request, response) => {
  const body = request.body as z.infer<typeof userUpdateSchema>;
  const data: Record<string, unknown> = { ...body };

  if (body.password) {
    data.passwordHash = await bcrypt.hash(body.password, 10);
    delete data.password;
  }

  const user = await prisma.user.update({
    where: { id: request.params.id },
    data: {
      ...(data.fullName ? { fullName: String(data.fullName) } : {}),
      ...(data.email ? { email: String(data.email) } : {}),
      ...(data.role ? { role: String(data.role) as 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER' } : {}),
      ...(data.passwordHash ? { passwordHash: String(data.passwordHash) } : {})
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return response.json(user);
});

userRouter.delete('/:id', requireAuth, requireRole(['ADMIN']), async (request, response) => {
  await prisma.user.delete({ where: { id: request.params.id } });
  return response.status(204).send();
});
