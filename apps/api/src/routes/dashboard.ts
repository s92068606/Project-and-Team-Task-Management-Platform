import { Router } from 'express';
import { prisma } from '../utils/prisma.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', async (_request, response) => {
  const [users, projects, tasks] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.task.count()
  ]);

  return response.json({
    users,
    projects,
    tasks
  });
});
