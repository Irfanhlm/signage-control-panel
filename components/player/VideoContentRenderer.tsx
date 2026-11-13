'use client';

import { useState, useRef } from 'react';
import { Content } from '@/lib/types';
import { VideoOff, Volume2, VolumeX, RotateCw, ExternalLink } from 'lucide-react';

interface VideoContentRendererProps {
  content: Content;
}

export function VideoContentRenderer({ content }: VideoContentRendererProps) {
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = content.url || (content.payload?.url as string) || '';

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  if (!videoUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <VideoOff className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">URL Video Kosong</h3>
        <p className="text-sm text-gray-600 max-w-md">
          Konten &ldquo;{content.judul}&rdquo; belum memiliki URL video yang valid.
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-900 text-red-200 flex items-center justify-center mb-4">
          <VideoOff className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">Gagal Memutar Video</h3>
        <p className="text-sm text-gray-300 max-w-lg mb-4 break-all">
          Format video tidak didukung atau URL tidak dapat diakses:
          <span className="block mt-1 font-mono text-xs text-amber-400 bg-gray-900 p-2 rounded">
            {videoUrl}
          </span>
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasError(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-all hover:scale-105"
          >
            <RotateCw className="w-4 h-4" />
            Coba Putar Ulang
          </button>
          <a
            href={videoUrl}
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
    <div className="w-full h-full flex items-center justify-center bg-black relative select-none overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        onError={() => setHasError(true)}
        className="w-full h-full object-contain"
      />

      <button
        type="button"
        onClick={toggleSound}
        className="absolute bottom-6 right-6 z-20 inline-flex items-center gap-2 px-4 py-2 bg-gray-900/90 hover:bg-gray-900 text-white text-xs font-semibold rounded-full border border-gray-700 transition-all hover:scale-105"
        title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
      >
        {isMuted ? (
          <>
            <VolumeX className="w-4 h-4 text-amber-400" />
            <span>Muted (Klik untuk Suara)</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Suara Aktif</span>
          </>
        )}
      </button>
    </div>
  );
}
