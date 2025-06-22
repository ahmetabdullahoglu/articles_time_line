import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';

/**
 * 404 Not Found middleware
 * This middleware catches all requests that don't match any route
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  
  next(error);
};