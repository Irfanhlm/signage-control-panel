import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';

export function errorHandler(
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
) {
  console.error('[Error]', err.stack || err.message);
  
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}

