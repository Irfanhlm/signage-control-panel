'use client';

import { useState, useEffect, useRef } from 'react';
import { Content, ContentType, CreateContentDto, UpdateContentDto } from '@/lib/types';
import { ContentTypeBadge } from './ContentTypeBadge';
import { X, Eye } from 'lucide-react';

interface ContentFormDialogProps {
  isOpen: boolean;
  content?: Content | null;
  onClose: () => void;
  onSubmit: (dto: CreateContentDto | UpdateContentDto) => Promise<void>;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

export function ContentFormDialog({
  isOpen,
  content,
  onClose,
  onSubmit,
}: ContentFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="content-dialog-title"
      className="backdrop:bg-gray-900/40 bg-white text-gray-900 p-0 rounded-lg max-w-xl w-full m-auto border-2 border-gray-200"
    >
      {isOpen && (
        <ContentFormInner
          key={content?.id || 'new'}
          content={content}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </dialog>
  );
}

interface ContentFormInnerProps {
  content?: Content | null;
  onClose: () => void;
  onSubmit: (dto: CreateContentDto | UpdateContentDto) => Promise<void>;
}

function ContentFormInner({ content, onClose, onSubmit }: ContentFormInnerProps) {
  const [judul, setJudul] = useState(content?.judul || '');
  const [tipe, setTipe] = useState<ContentType>(content?.tipe || 'text');
  const [textContent, setTextContent] = useState(content?.payload?.text || '');
  const [mediaUrl, setMediaUrl] = useState(content?.url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEdit = !!content;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      setErrorMessage('Judul konten wajib diisi.');
      return;
    }

    if (tipe === 'text' && !textContent.trim()) {
      setErrorMessage('Teks pengumuman tidak boleh kosong untuk konten teks.');
      return;
    }

    if ((tipe === 'image' || tipe === 'video' || tipe === 'url') && !mediaUrl.trim()) {
      setErrorMessage(`URL ${tipe} wajib diisi.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const dto: CreateContentDto = {
      judul: judul.trim(),
      tipe,
      payload: tipe === 'text' ? { text: textContent.trim() } : {},
      url: tipe !== 'text' ? mediaUrl.trim() : null,
    };

    try {
      await onSubmit(dto);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan konten.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="flex items-center justify-between pb-5 border-b-2 border-gray-100">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3
                id="content-dialog-title"
                className="text-xl font-extrabold text-gray-900 tracking-tight"
              >
                {isEdit ? 'Ubah Data Konten' : 'Tambah Konten Baru'}
              </h3>
              <ContentTypeBadge tipe={tipe} />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-md text-sm text-red-800 font-semibold">
          {errorMessage}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label
            htmlFor="content-judul"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
          >
            Judul Materi Tayang *
          </label>
          <input
            id="content-judul"
            type="text"
            required
            autoFocus
            placeholder="Contoh: Pengumuman Jadwal Operasional Libur"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-2 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="content-tipe"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
          >
            Tipe Media Konten *
          </label>
          <select
            id="content-tipe"
            value={tipe}
            onChange={(e) => setTipe(e.target.value as ContentType)}
            className="w-full px-4 py-3 bg-gray-100 rounded-md text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-2 focus:border-blue-500 transition-all duration-200"
          >
            <option value="text">Teks (Pengumuman / Tipografi)</option>
            <option value="image">Gambar (Poster / Banner URL)</option>
            <option value="video">Video (MP4 / WebM Direct URL)</option>
            <option value="url">Web URL (Iframe / Dashboard)</option>
          </select>
        </div>

        {tipe === 'text' && (
          <div>
            <label
              htmlFor="content-text"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
            >
              Isi Teks Pengumuman *
            </label>
            <textarea
              id="content-text"
              rows={4}
              required
              placeholder="Tuliskan teks pesan yang akan ditampilkan di layar player..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-2 focus:border-blue-500 transition-all duration-200 resize-none"
            />
          </div>
        )}

        {tipe !== 'text' && (
          <div>
            <label
              htmlFor="content-url"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
            >
              Direct URL {tipe.toUpperCase()} *
            </label>
            <input
              id="content-url"
              type="url"
              required
              placeholder={
                tipe === 'image'
                  ? 'https://images.unsplash.com/photo-...'
                  : tipe === 'video'
                    ? 'https://www.youtube.com/watch?v=... atau file .mp4'
                    : 'https://example.com'
              }
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-md text-sm font-mono text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-2 focus:border-blue-500 transition-all duration-200"
            />
            {tipe === 'video' && (
              <p className="text-xs text-blue-700 mt-1.5 font-medium">
                Mendukung tautan YouTube (Watch, Shorts, Share) serta direct URL file video (.mp4/.webm).
              </p>
            )}
            {tipe === 'url' && (
              <p className="text-xs text-amber-700 mt-1.5 font-medium">
                Catatan: Pastikan situs web tujuan mengizinkan penayangan dalam iframe.
              </p>
            )}
          </div>
        )}

        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Pratinjau Live Konten
            </span>
          </div>
          <div className="p-5 bg-gray-100 rounded-lg flex items-center justify-center min-h-[140px] text-center overflow-hidden">
            {tipe === 'text' && (
              <p className="text-base font-bold text-gray-900 max-w-md">
                {textContent || '(Isi teks di atas untuk melihat pratinjau)'}
              </p>
            )}
            {tipe === 'image' && (
              mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt="Preview"
                  className="max-h-40 rounded-md object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-xs text-gray-500 font-semibold">[Masukkan URL gambar di atas]</span>
              )
            )}
            {tipe === 'video' && (
              mediaUrl ? (
                extractYouTubeId(mediaUrl) ? (
                  <div className="relative max-h-40 rounded-md overflow-hidden flex items-center justify-center">
                    <img
                      src={`https://img.youtube.com/vi/${extractYouTubeId(mediaUrl)}/mqdefault.jpg`}
                      alt="YouTube Preview"
                      className="max-h-40 rounded-md object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-md">
                        YouTube Video
                      </span>
                    </div>
                  </div>
                ) : (
                  <video src={mediaUrl} className="max-h-40 rounded-md" controls muted />
                )
              ) : (
                <span className="text-xs text-gray-500 font-semibold">[Masukkan URL YouTube atau video .mp4]</span>
              )
            )}
            {tipe === 'url' && (
              mediaUrl ? (
                <span className="text-xs font-mono font-bold text-blue-600 break-all">
                  Iframe Target: {mediaUrl}
                </span>
              ) : (
                <span className="text-xs text-gray-500 font-semibold">[Masukkan URL website di atas]</span>
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-5 border-t-2 border-gray-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-5 py-3 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Konten'}</span>
        </button>
      </div>
    </form>
  );
}
