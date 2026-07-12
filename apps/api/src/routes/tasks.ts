import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { prisma } from '../utils/prisma.js';

export const taskRouter = Router();

const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  projectId: z.string(),
  assigneeId: z.string().optional().nullable()
});

taskRouter.get('/', requireAuth, async (request: AuthenticatedRequest, response) => {
  const where =
    request.user?.role === 'ADMIN'
      ? undefined
      : request.user?.role === 'PROJECT_MANAGER'
        ? {
            project: {
              managerId: request.user.id
            }
          }
        : {
            assigneeId: request.user?.id
          };

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: true,
      assignee: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return response.json(tasks);
});

taskRouter.post(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'PROJECT_MANAGER']),
  validateBody(taskSchema),
  async (request: AuthenticatedRequest, response) => {
    const body = request.body as z.infer<typeof taskSchema>;
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status ?? 'TODO',
        priority: body.priority ?? 'MEDIUM',
        projectId: body.projectId,
        assigneeId: body.assigneeId ?? null
      },
      include: {
        project: true,
        assignee: true
      }
    });

    return response.status(201).json(task);
  }
);

taskRouter.patch(
  '/:id',
  requireAuth,
  validateBody(taskSchema.partial()),
  async (request: AuthenticatedRequest, response) => {
    const body = request.body as z.infer<typeof taskSchema>;
    const isElevated = request.user?.role === 'ADMIN' || request.user?.role === 'PROJECT_MANAGER';
    const task = await prisma.task.findUnique({ where: { id: request.params.id } });

    if (!task) {
      return response.status(404).json({ message: 'Task not found' });
    }

    if (!isElevated && task.assigneeId !== request.user?.id) {
      return response.status(403).json({ message: 'Forbidden' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: request.params.id },
      data: {
        ...(isElevated && body.title ? { title: body.title } : {}),
        ...(isElevated && body.description !== undefined ? { description: body.description } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(isElevated && body.priority ? { priority: body.priority } : {}),
        ...(isElevated && body.projectId ? { projectId: body.projectId } : {}),
        ...(isElevated && body.assigneeId !== undefined ? { assigneeId: body.assigneeId ?? null } : {})
      },
      include: {
        project: true,
        assignee: true
      }
    });

    return response.json(updatedTask);
  }
);

taskRouter.delete('/:id', requireAuth, requireRole(['ADMIN', 'PROJECT_MANAGER']), async (request, response) => {
  const existingTask = await prisma.task.findUnique({
    where: { id: request.params.id },
    select: { project: { select: { managerId: true } } }
  });

  if (!existingTask) {
    return response.status(404).json({ message: 'Task not found' });
  }

  if (request.user?.role !== 'ADMIN' && existingTask.project.managerId !== request.user?.id) {
    return response.status(403).json({ message: 'Forbidden' });
  }

  await prisma.task.delete({ where: { id: request.params.id } });
  return response.status(204).send();
});