import { Router } from 'express';
import {
  listContents,
  createContent,
  getContent,
  updateContent,
  deleteContent,
} from '../controllers/content.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, listContents);
router.post('/', authMiddleware, createContent);
router.get('/:id', authMiddleware, getContent);
router.patch('/:id', authMiddleware, updateContent);
router.delete('/:id', authMiddleware, deleteContent);

export default router;
