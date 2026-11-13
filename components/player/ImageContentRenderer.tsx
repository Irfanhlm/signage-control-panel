'use client';

import { useState } from 'react';
import { Content } from '@/lib/types';
import { ImageOff, RotateCw, ExternalLink } from 'lucide-react';

interface ImageContentRendererProps {
  content: Content;
}

export function ImageContentRenderer({ content }: ImageContentRendererProps) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = content.url || (content.payload?.url as string) || '';

  if (!imageUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <ImageOff className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">URL Gambar Kosong</h3>
        <p className="text-sm text-gray-600 max-w-md">
          Konten &ldquo;{content.judul}&rdquo; belum memiliki URL gambar yang valid.
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-900 text-red-200 flex items-center justify-center mb-4">
          <ImageOff className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">Gagal Memuat Gambar</h3>
        <p className="text-sm text-gray-300 max-w-lg mb-4 break-all">
          URL target tidak dapat diakses atau diblokir oleh kebijakan keamanan:
          <span className="block mt-1 font-mono text-xs text-amber-400 bg-gray-800 p-2 rounded">
            {imageUrl}
          </span>
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasError(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-all hover:scale-105"
          >
            <RotateCw className="w-4 h-4" />
            Coba Muat Ulang
          </button>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-md transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Buka URL Langsung
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-950 p-2 sm:p-4 select-none relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={content.judul}
        onError={() => setHasError(true)}
        className="max-w-full max-h-full object-contain rounded-md"
      />
    </div>
  );
}

