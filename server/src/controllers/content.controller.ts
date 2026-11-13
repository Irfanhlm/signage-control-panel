import { Request, Response, NextFunction } from 'express';
import * as contentService from '../services/content.service.js';
import { ApiResponse, CreateContentDto, UpdateContentDto, isUuid } from '../types/index.js';

const VALID_TYPES = ['text', 'image', 'video', 'url'];

// GET /api/contents
export async function listContents(_req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const contents = await contentService.listContents();
    res.status(200).json({
      success: true,
      data: contents,
      message: `Ditemukan ${contents.length} konten.`,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/contents
export async function createContent(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const { judul, tipe, payload, url } = req.body as CreateContentDto;

    const errors: Record<string, string> = {};
    if (!judul || typeof judul !== 'string' || judul.trim().length === 0) {
      errors.judul = 'Judul konten wajib diisi.';
    }
    if (!tipe || typeof tipe !== 'string' || !VALID_TYPES.includes(tipe)) {
      errors.tipe = `Tipe konten wajib diisi dan harus salah satu dari: ${VALID_TYPES.join(', ')}.`;
    }
    if (payload !== undefined && (typeof payload !== 'object' || Array.isArray(payload))) {
      errors.payload = 'Payload harus berupa object JSON.';
    }
    if (url !== undefined && url !== null && typeof url !== 'string') {
      errors.url = 'URL harus berupa string atau null.';
    }
    if (Object.keys(errors).length > 0) {
      res.status(400).json({ success: false, message: 'Validasi gagal.', errors });
      return;
    }

    const content = await contentService.createContent({
      judul: judul.trim(),
      tipe: tipe as CreateContentDto['tipe'],
      payload: payload ?? {},
      url: url ?? null,
    });
    res.status(201).json({
      success: true,
      data: content,
      message: 'Konten berhasil dibuat.',
    });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 400) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(err);
  }
}

// GET /api/contents/:id
export async function getContent(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      res.status(400).json({ success: false, message: 'ID konten harus berupa UUID valid.' });
      return;
    }

    const content = await contentService.getContentById(id);
    if (!content) {
      res.status(404).json({ success: false, message: 'Konten tidak ditemukan.' });
      return;
    }
    res.status(200).json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/contents/:id
export async function updateContent(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      res.status(400).json({ success: false, message: 'ID konten harus berupa UUID valid.' });
      return;
    }

    const { judul, tipe, payload, url } = req.body as UpdateContentDto;

    const errors: Record<string, string> = {};
    if (judul !== undefined && (typeof judul !== 'string' || judul.trim().length === 0)) {
      errors.judul = 'Judul konten tidak boleh kosong.';
    }
    if (tipe !== undefined && (typeof tipe !== 'string' || !VALID_TYPES.includes(tipe))) {
      errors.tipe = `Tipe konten harus salah satu dari: ${VALID_TYPES.join(', ')}.`;
    }
    if (payload !== undefined && (typeof payload !== 'object' || Array.isArray(payload))) {
      errors.payload = 'Payload harus berupa object JSON.';
    }
    if (url !== undefined && url !== null && typeof url !== 'string') {
      errors.url = 'URL harus berupa string atau null.';
    }
    if (Object.keys(errors).length > 0) {
      res.status(400).json({ success: false, message: 'Validasi gagal.', errors });
      return;
    }

    const dto: UpdateContentDto = {};
    if (judul !== undefined) dto.judul = judul.trim();
    if (tipe !== undefined) dto.tipe = tipe as UpdateContentDto['tipe'];
    if (payload !== undefined) dto.payload = payload;
    if (url !== undefined) dto.url = url;

    const content = await contentService.updateContent(id, dto);
    if (!content) {
      res.status(404).json({ success: false, message: 'Konten tidak ditemukan.' });
      return;
    }
    res.status(200).json({
      success: true,
      data: content,
      message: 'Konten berhasil diperbarui.',
    });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 400) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(err);
  }
}

// DELETE /api/contents/:id
export async function deleteContent(req: Request, res: Response<ApiResponse>, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      res.status(400).json({ success: false, message: 'ID konten harus berupa UUID valid.' });
      return;
    }

    const deleted = await contentService.deleteContent(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Konten tidak ditemukan.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Konten berhasil dihapus.',
    });
  } catch (err) {
    next(err);
  }
}

