import { Router } from 'express';
import {
  listDevices,
  createDevice,
  getDevice,
  updateDevice,
  deleteDevice,
  assignContent,
  getCurrentContent,
} from '../controllers/device.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, listDevices);
router.post('/', authMiddleware, createDevice);
router.get('/:id', authMiddleware, getDevice);
router.patch('/:id', authMiddleware, updateDevice);
router.delete('/:id', authMiddleware, deleteDevice);
router.put('/:id/content', authMiddleware, assignContent);
router.get('/:id/current-content', getCurrentContent);

export default router;
