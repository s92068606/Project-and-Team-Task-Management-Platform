import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { authRouter } from './routes/auth.js';
import { dashboardRouter } from './routes/dashboard.js';
import { projectRouter } from './routes/projects.js';
import { taskRouter } from './routes/tasks.js';
import { userRouter } from './routes/users.js';

dotenv.config();

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',') ?? true,
      credentials: true
    })
  );
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use('/auth', authRouter);
  app.use('/dashboard', dashboardRouter);
  app.use('/projects', projectRouter);
  app.use('/tasks', taskRouter);
  app.use('/users', userRouter);

  app.use((_request, response) => {
    response.status(404).json({ message: 'Route not found' });
  });

  return app;
}
