import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { prisma } from '../utils/prisma.js';

export const projectRouter = Router();

const projectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  status: z.string().optional(),
  managerId: z.string().optional(),
  memberIds: z.array(z.string()).optional().default([])
});

projectRouter.get('/', requireAuth, async (_request, response) => {
  const request = _request as AuthenticatedRequest;
  const projects = await prisma.project.findMany({
    where:
      request.user?.role === 'ADMIN'
        ? undefined
        : {
            OR: [{ managerId: request.user?.id }, { members: { some: { userId: request.user?.id } } }]
          },
    include: {
      manager: true,
      members: {
        include: { user: true }
      },
      tasks: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return response.json(projects);
});

projectRouter.post(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  validateBody(projectSchema),
  async (request: AuthenticatedRequest, response) => {
    const body = request.body as z.infer<typeof projectSchema>;
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        status: body.status ?? 'ACTIVE',
        managerId: body.managerId ?? request.user!.id,
        members: body.memberIds.length
          ? {
              create: body.memberIds.map((userId) => ({ userId }))
            }
          : undefined
      },
      include: {
        manager: true,
        members: { include: { user: true } },
        tasks: true
      }
    });

    return response.status(201).json(project);
  }
);

projectRouter.patch(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  validateBody(projectSchema.partial()),
  async (request: AuthenticatedRequest, response) => {
    const existingProject = await prisma.project.findUnique({
      where: { id: request.params.id },
      select: { managerId: true }
    });

    if (!existingProject) {
      return response.status(404).json({ message: 'Project not found' });
    }

    if (request.user?.role !== 'ADMIN' && existingProject.managerId !== request.user?.id) {
      return response.status(403).json({ message: 'Forbidden' });
    }

    const body = request.body as z.infer<typeof projectSchema>;
    const project = await prisma.project.update({
      where: { id: request.params.id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.managerId ? { managerId: body.managerId } : {})
      },
      include: {
        manager: true,
        members: { include: { user: true } },
        tasks: true
      }
    });

    return response.json(project);
  }
);

projectRouter.delete('/:id', requireAuth, requireRole(['ADMIN', 'PROJECT_MANAGER']), async (request, response) => {
  const existingProject = await prisma.project.findUnique({
    where: { id: request.params.id },
    select: { managerId: true }
  });

  if (!existingProject) {
    return response.status(404).json({ message: 'Project not found' });
  }

  if (request.user?.role !== 'ADMIN' && existingProject.managerId !== request.user?.id) {
    return response.status(403).json({ message: 'Forbidden' });
  }

  await prisma.project.delete({ where: { id: request.params.id } });
  return response.status(204).send();
});