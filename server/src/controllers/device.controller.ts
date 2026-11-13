import { Request, Response, NextFunction } from 'express';
import * as deviceService from '../services/device.service.js';
import { ApiResponse, CreateDeviceDto, UpdateDeviceDto, AssignContentPayload, isUuid } from '../types/index.js';
import { getIO } from '../socket/index.js';

// GET /api/devices
export async function listDevices(_req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const devices = await deviceService.listDevices();
    res.status(200).json({
      success: true,
      data: devices,
      message: `Ditemukan ${devices.length} perangkat.`,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/devices
export async function createDevice(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const { nama, lokasi } = req.body as CreateDeviceDto;

    const errors: Record<string, string> = {};
    if (!nama || typeof nama !== 'string' || nama.trim().length === 0) {
      errors.nama = 'Nama perangkat wajib diisi.';
    }
    if (!lokasi || typeof lokasi !== 'string' || lokasi.trim().length === 0) {
      errors.lokasi = 'Lokasi perangkat wajib diisi.';
    }
    if (Object.keys(errors).length > 0) {
      res.status(400).json({ success: false, message: 'Validasi gagal.', errors });
      return;
    }

    const device = await deviceService.createDevice({ nama: nama.trim(), lokasi: lokasi.trim() });
    res.status(201).json({
      success: true,
      data: device,
      message: 'Perangkat berhasil dibuat.',
    });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 409) {
      res.status(409).json({ success: false, message: error.message });
      return;
    }
    next(err);
  }
}

// GET /api/devices/:id
export async function getDevice(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const device = await deviceService.getDeviceById(req.params.id);
    if (!device) {
      res.status(404).json({ success: false, message: 'Perangkat tidak ditemukan.' });
      return;
    }
    res.status(200).json({ success: true, data: device });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/devices/:id
export async function updateDevice(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const { nama, lokasi } = req.body as UpdateDeviceDto;

    const errors: Record<string, string> = {};
    if (nama !== undefined && (typeof nama !== 'string' || nama.trim().length === 0)) {
      errors.nama = 'Nama perangkat tidak boleh kosong.';
    }
    if (lokasi !== undefined && (typeof lokasi !== 'string' || lokasi.trim().length === 0)) {
      errors.lokasi = 'Lokasi perangkat tidak boleh kosong.';
    }
    if (Object.keys(errors).length > 0) {
      res.status(400).json({ success: false, message: 'Validasi gagal.', errors });
      return;
    }

    const dto: UpdateDeviceDto = {};
    if (nama !== undefined) dto.nama = nama.trim();
    if (lokasi !== undefined) dto.lokasi = lokasi.trim();

    const device = await deviceService.updateDevice(req.params.id, dto);
    if (!device) {
      res.status(404).json({ success: false, message: 'Perangkat tidak ditemukan.' });
      return;
    }
    res.status(200).json({
      success: true,
      data: device,
      message: 'Perangkat berhasil diperbarui.',
    });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 409) {
      res.status(409).json({ success: false, message: error.message });
      return;
    }
    next(err);
  }
}

// DELETE /api/devices/:id
export async function deleteDevice(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const deleted = await deviceService.deleteDevice(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Perangkat tidak ditemukan.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Perangkat berhasil dihapus.',
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/devices/:id/content
export async function assignContent(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const { contentId } = req.body as AssignContentPayload;

    // contentId must be a string UUID or null
    if (contentId !== null) {
      if (typeof contentId !== 'string' || !isUuid(contentId)) {
        res.status(400).json({
          success: false,
          message: 'Validasi gagal.',
          errors: { contentId: 'contentId harus berupa UUID valid atau null.' },
        });
        return;
      }
    }

    const result = await deviceService.assignContent(req.params.id, contentId);

    // Emit real-time content update to the target device's player room
    try {
      const io = getIO();
      const deviceRoom = `device:${result.device.id}`;
      io.to(deviceRoom).emit('content:updated', result.content);
      // Also notify admin dashboard
      io.to('admin').emit('device:status', {
        deviceId: result.device.id,
        status: result.device.status,
        last_seen: result.device.last_seen,
      });
    } catch (socketErr) {
      // Socket.IO emit failure should not fail the REST response
      console.error('[assignContent] Socket.IO emit error:', socketErr);
    }

    res.status(200).json({
      success: true,
      data: {
        device: result.device,
        content: result.content,
      },
      message: contentId
        ? 'Konten berhasil ditetapkan ke perangkat.'
        : 'Konten aktif perangkat berhasil dicabut.',
    });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 404) {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(err);
  }
}

// GET /api/devices/:id/current-content
export async function getCurrentContent(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const result = await deviceService.getCurrentContent(req.params.id);
    res.status(200).json({
      success: true,
      data: {
        device: result.device,
        content: result.content,
      },
    });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 404) {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(err);
  }
}

