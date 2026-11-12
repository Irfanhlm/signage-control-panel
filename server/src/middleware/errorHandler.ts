import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
) {
  console.error('[Error]', err.stack || err.message);
  
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}

