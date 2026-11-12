import { Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';

export function getHealth(_req: Request, res: Response<ApiResponse>) {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'digital-signage-control-panel-api',
    },
    message: 'Server is healthy',
  });
}

