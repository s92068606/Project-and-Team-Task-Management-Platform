import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

export function validateBody(schema: ZodTypeAny) {
  return (request: Request, response: Response, next: NextFunction) => {
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({ message: 'Validation failed', issues: parsed.error.issues });
    }

    request.body = parsed.data;
    return next();
  };
}
