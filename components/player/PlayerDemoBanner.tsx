'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Device, Content } from '@/lib/types';
import {
  MapPin,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface PlayerDemoBannerProps {
  device: Device;
  content: Content | null;
  isConnected: boolean;
}

export function PlayerDemoBanner({
  device,
  content,
  isConnected,
}: PlayerDemoBannerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50 select-none">
        <button
          onClick={() => setIsVisible(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gray-900/90 hover:bg-gray-900 text-white text-xs font-semibold rounded-full border border-gray-700 transition-all hover:scale-105"
          title="Tampilkan Info Demo"
        >
          <span>{device.nama}</span>
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
          />
          <Eye className="w-3.5 h-3.5 text-gray-400 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-gray-900 text-white border-b-2 border-gray-800 px-4 py-2 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-white">
            <span>Layar:</span>
            <span className="font-extrabold text-blue-400">{device.nama}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-gray-300">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>Lokasi:</span>
            <span className="font-semibold text-white">{device.lokasi}</span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${isConnected
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
              : 'bg-amber-950 text-amber-300 border border-amber-600/40'
              }`}
          >
            <span>{isConnected ? 'Live' : 'Terputus'}</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-gray-300">
          <span className="text-gray-400">Konten Aktif:</span>
          {content ? (
            <span className="font-semibold text-white truncate max-w-xs">
              {content.judul}
              <span className="ml-1.5 text-[10px] font-mono uppercase bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded">
                {content.tipe}
              </span>
            </span>
          ) : (
            <span className="font-medium text-gray-400 italic">Belum ada konten</span>
          )}
        </div>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Sembunyikan Bar Demo"
          >
            <EyeOff className="w-4 h-4" />
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded transition-all text-xs"
          >
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
