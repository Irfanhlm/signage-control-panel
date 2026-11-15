'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Device, Content } from '@/lib/types';
import { getCurrentContent } from '@/lib/api';
import { usePlayerSocket } from '@/lib/usePlayerSocket';
import { PlayerDemoBanner } from '@/components/player/PlayerDemoBanner';
import { TextContentRenderer } from '@/components/player/TextContentRenderer';
import { ImageContentRenderer } from '@/components/player/ImageContentRenderer';
import { VideoContentRenderer } from '@/components/player/VideoContentRenderer';
import { UrlContentRenderer } from '@/components/player/UrlContentRenderer';
import {
  AlertCircle,
  RotateCw,
  Radio,
  WifiOff,
} from 'lucide-react';

function PlayerContent() {
  const params = useParams();
  const rawId = params?.deviceId;
  const deviceId = Array.isArray(rawId) ? rawId[0] : (rawId || '');

  const [device, setDevice] = useState<Device | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reloadContent = useCallback(
    (isBackground = false) => {
      if (!deviceId) return;
      if (!isBackground) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      getCurrentContent(deviceId)
        .then((res) => {
          setDevice(res.device);
          setContent(res.content);
          setNotFound(false);
          setErrorMessage(null);
          if (!isBackground) setIsLoading(false);
        })
        .catch((err: Error & { status?: number }) => {
          if (err.status === 404 || err.message?.includes('tidak ditemukan')) {
            setNotFound(true);
          } else {
            setErrorMessage(err.message || 'Gagal mengambil data perangkat.');
          }
          if (!isBackground) setIsLoading(false);
        });
    },
    [deviceId]
  );

  useEffect(() => {
    if (!deviceId) return;
    let ignore = false;

    getCurrentContent(deviceId)
      .then((res) => {
        if (!ignore) {
          setDevice(res.device);
          setContent(res.content);
          setNotFound(false);
          setErrorMessage(null);
          setIsLoading(false);
        }
      })
      .catch((err: Error & { status?: number }) => {
        if (!ignore) {
          if (err.status === 404 || err.message?.includes('tidak ditemukan')) {
            setNotFound(true);
          } else {
            setErrorMessage(err.message || 'Gagal mengambil data perangkat.');
          }
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [deviceId]);

  const handleContentUpdated = useCallback((newContent: Content | null) => {
    setContent(newContent);
  }, []);

  const handleReconnect = useCallback(() => {
    reloadContent(true);
  }, [reloadContent]);

  const { isConnected, connectionError } = usePlayerSocket({
    deviceId,
    onContentUpdated: handleContentUpdated,
    onReconnect: handleReconnect,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-6 select-none">
        <div className="inline-flex items-center gap-2 text-blue-600 font-semibold mb-2">
          <RotateCw className="w-5 h-5 animate-spin" />
          <span>Menghubungkan ke Perangkat...</span>
        </div>
        <p className="text-sm text-gray-500">
          Memuat konfigurasi untuk kode perangkat: <span className="font-mono font-bold text-gray-900">{deviceId}</span>
        </p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-gray-900 p-6 select-none">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-3">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Perangkat Tidak Ditemukan
          </h1>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Perangkat dengan ID atau nama <span className="font-mono font-bold text-gray-900">&ldquo;{deviceId}&rdquo;</span> tidak terdaftar dalam database sistem control panel.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reloadContent(false)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-md transition-all hover:scale-105 text-sm"
            >
              <RotateCw className="w-4 h-4" />
              Coba Lagi
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-all hover:scale-105 text-sm"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage && !device) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-gray-900 p-6 select-none">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Gagal Memuat Signage Player
          </h1>
          <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => reloadContent(false)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-all hover:scale-105 text-sm"
          >
            <RotateCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  const resolvedDevice = device!;

  return (
    <main className="h-screen w-full flex flex-col bg-gray-950 text-white relative overflow-hidden">
      <PlayerDemoBanner
        device={resolvedDevice}
        content={content}
        isConnected={isConnected}
      />

      {!isConnected && (
        <div className="fixed top-14 inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-gray-950 font-bold text-xs rounded-full shadow-none border-2 border-amber-400">
            <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
            <span>Koneksi terputus. Mencoba menghubungkan kembali secara otomatis...</span>
            {connectionError && (
              <span className="font-mono text-[11px] opacity-80">({connectionError})</span>
            )}
          </div>
        </div>
      )}

      <section className="flex-1 min-h-0 w-full pt-12 flex flex-col relative overflow-hidden">
        {content ? (
          <div className="w-full h-full flex-1 min-h-0 flex flex-col animate-fadeIn">
            {content.tipe === 'text' && <TextContentRenderer content={content} />}
            {content.tipe === 'image' && <ImageContentRenderer content={content} />}
            {content.tipe === 'video' && <VideoContentRenderer content={content} />}
            {content.tipe === 'url' && <UrlContentRenderer content={content} />}
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 text-gray-900 select-none text-center relative">
            <div className="max-w-md w-full flex flex-col items-center">

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Perangkat Siap &bull; {resolvedDevice.status}</span>
              </div>

              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
                Belum Ada Konten Aktif
              </h2>

              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Layar <span className="font-bold text-gray-900">{resolvedDevice.nama}</span> ({resolvedDevice.lokasi}) saat ini tidak memiliki konten yang aktif. Tetapkan konten melalui Dashboard Admin untuk menampilkannya secara langsung tanpa reload.
              </p>

              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg w-full mb-8 text-left text-xs text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Kode Perangkat:</span>
                  <span className="font-mono font-bold text-gray-900">{resolvedDevice.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lokasi:</span>
                  <span className="font-semibold text-gray-900">{resolvedDevice.lokasi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status Socket:</span>
                  <span className={`font-bold ${isConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isConnected ? 'Terhubung (Online)' : 'Menghubungkan...'}
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-all hover:scale-105 text-sm"
              >
                Buka Dashboard Admin
              </Link>
            </div>

            <div className="absolute bottom-6 flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span>Digital Signage Control Panel &bull; Flat Design Real-Time Engine</span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function PlayerPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-6 select-none">
          <div className="inline-flex items-center gap-2 text-blue-600 font-semibold mb-2">
            <RotateCw className="w-5 h-5 animate-spin" />
            <span>Memuat Signage Player...</span>
          </div>
        </main>
      }
    >
      <PlayerContent />
    </Suspense>
  );
}
