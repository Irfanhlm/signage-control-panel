import { Request, Response, NextFunction } from 'express';
import { login } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi',
        errors: {
          ...(!username ? { username: 'Username wajib diisi' } : {}),
          ...(!password ? { password: 'Password wajib diisi' } : {}),
        },
      });
      return;
    }

    const result = await login(String(username).trim(), String(password));

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login berhasil',
    });
  } catch (error) {
    next(error);
  }
}

export async function getMeHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      data: {
        admin: req.user,
      },
      message: 'Sesi aktif',
    });
  } catch (error) {
    next(error);
  }
}
