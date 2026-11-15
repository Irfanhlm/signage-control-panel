import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service.js';
import { AuthTokenPayload } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Autentikasi diperlukan. Silakan login terlebih dahulu.',
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token otorisasi kosong. Silakan login kembali.',
    });
    return;
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err: unknown) {
    res.status(401).json({
      success: false,
      message: err instanceof Error ? err.message : 'Token tidak valid.',
    });
  }
}
