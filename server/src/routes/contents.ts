import { Router } from 'express';
import {
  listContents,
  createContent,
  getContent,
  updateContent,
  deleteContent,
} from '../controllers/content.controller.js';

const router = Router();

router.get('/', listContents);
router.post('/', createContent);
router.get('/:id', getContent);
router.patch('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router;

