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

const router = Router();

router.get('/', listDevices);
router.post('/', createDevice);
router.get('/:id', getDevice);
router.patch('/:id', updateDevice);
router.delete('/:id', deleteDevice);
router.put('/:id/content', assignContent);
router.get('/:id/current-content', getCurrentContent);

export default router;
