'use client';

import { useState, useEffect } from 'react';
import { Content } from '@/lib/types';
import { ImageOff, RotateCw, ExternalLink, Maximize2 } from 'lucide-react';

interface ImageContentRendererProps {
  content: Content;
}

type FitMode = 'contain' | 'cover';

export function ImageContentRenderer({ content }: ImageContentRendererProps) {
  const [hasError, setHasError] = useState(false);
  const [fitMode, setFitMode] = useState<FitMode>('contain');
  const [aspectRatioLabel, setAspectRatioLabel] = useState<string | null>(null);

  const imageUrl = content.url || (content.payload?.url as string) || '';

  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      if (mounted && typeof window !== 'undefined') {
        const savedMode = localStorage.getItem('signage_image_fit_mode') as FitMode;
        if (savedMode === 'contain' || savedMode === 'cover') {
          setFitMode(savedMode);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFitMode = () => {
    const nextMode: FitMode = fitMode === 'contain' ? 'cover' : 'contain';
    setFitMode(nextMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('signage_image_fit_mode', nextMode);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      if (Math.abs(ratio - 16 / 9) < 0.08) {
        setAspectRatioLabel('16:9 Landscape');
      } else if (Math.abs(ratio - 9 / 16) < 0.08) {
        setAspectRatioLabel('9:16 Portrait');
      } else if (Math.abs(ratio - 4 / 3) < 0.08) {
        setAspectRatioLabel('4:3 Standar');
      } else if (Math.abs(ratio - 1) < 0.08) {
        setAspectRatioLabel('1:1 Square');
      } else {
        setAspectRatioLabel(`${naturalWidth}×${naturalHeight}`);
      }
    }
  };

  if (!imageUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center mb-4 border border-amber-800">
          <ImageOff className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">URL Gambar Kosong</h3>
        <p className="text-sm text-gray-400 max-w-md">
          Konten &ldquo;{content.judul}&rdquo; belum memiliki URL gambar yang valid.
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 text-white p-8 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-red-950 text-red-400 flex items-center justify-center mb-4 border border-red-800">
          <ImageOff className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">Gagal Memuat Gambar</h3>
        <p className="text-sm text-gray-400 max-w-lg mb-4 break-all">
          URL target tidak dapat diakses atau diblokir oleh kebijakan keamanan:
          <span className="block mt-1 font-mono text-xs text-amber-400 bg-gray-900 p-2 rounded border border-gray-800">
            {imageUrl}
          </span>
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasError(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-all hover:scale-105 cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            Coba Muat Ulang
          </button>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-md transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Buka URL Langsung
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-1 min-h-0 flex items-center justify-center bg-black relative select-none overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-25 scale-125 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="relative z-10 w-full h-full flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        <img
          src={imageUrl}
          alt={content.judul}
          onLoad={handleImageLoad}
          onError={() => setHasError(true)}
          className={`transition-all duration-300 rounded select-none ${fitMode === 'cover'
            ? 'w-full h-full object-cover'
            : 'max-w-full max-h-full w-auto h-auto object-contain'
            }`}
        />
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 select-none">
        {aspectRatioLabel && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-900/80 text-gray-300 text-[11px] font-mono border border-gray-800">
            <span>{aspectRatioLabel}</span>
          </div>
        )}

        <button
          type="button"
          onClick={toggleFitMode}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900/80 hover:bg-gray-900 text-gray-200 hover:text-white text-xs font-semibold border border-gray-700 transition-all hover:scale-105 cursor-pointer shadow-none"
          title={
            fitMode === 'contain'
              ? 'Ubah ke mode Penuh Layar (Cover)'
              : 'Ubah ke mode Utuh Tanpa Potong (Fit)'
          }
        >
          <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
          <span>{fitMode === 'contain' ? 'Rasio: Fit (Utuh)' : 'Rasio: Fill (Penuh)'}</span>
        </button>
      </div>
    </div>
  );
}
