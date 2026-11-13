'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Device, Content } from '@/lib/types';
import {
  Tv,
  MapPin,
  Clock,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  LayoutDashboard,
  Radio,
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
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Live Clock (HH:mm:ss WIB)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', {
        hour12: false,
        timeZone: 'Asia/Jakarta',
      });
      setCurrentTime(`${timeStr} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Track Fullscreen state
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
      // Ignore fullscreen errors in browsers that restrict programmatic triggers
    }
  };

  // When collapsed, show tiny floating pill in bottom-left corner
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50 select-none">
        <button
          onClick={() => setIsVisible(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gray-900/90 hover:bg-gray-900 text-white text-xs font-semibold rounded-full border border-gray-700 transition-all hover:scale-105"
          title="Tampilkan Info Demo"
        >
          <Tv className="w-3.5 h-3.5 text-blue-400" />
          <span>{device.nama}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
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
        {/* Left: Device Identity & Location */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-white">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <Tv className="w-4 h-4" />
            </div>
            <span>Layar:</span>
            <span className="font-extrabold text-blue-400">{device.nama}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-gray-300">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>Lokasi:</span>
            <span className="font-semibold text-white">{device.lokasi}</span>
          </div>

          {/* Connection Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${
              isConnected
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                : 'bg-amber-950 text-amber-300 border border-amber-600/40'
            }`}
          >
            <Radio
              className={`w-3 h-3 ${
                isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
              }`}
            />
            <span>{isConnected ? 'Live (Online)' : 'Terputus'}</span>
          </div>
        </div>

        {/* Center: Active Content Summary */}
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

        {/* Right: Live Clock & Controls */}
        <div className="flex items-center gap-3">
          {currentTime && (
            <div className="hidden md:flex items-center gap-1.5 font-mono text-gray-300 text-xs bg-gray-800 px-2.5 py-1 rounded border border-gray-700">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentTime}</span>
            </div>
          )}

          {/* Fullscreen Toggle */}
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

          {/* Hide Bar */}
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Sembunyikan Bar Demo"
          >
            <EyeOff className="w-4 h-4" />
          </button>

          {/* Back to Dashboard */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded transition-all text-xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

