'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Device, Content, DeviceStatusEvent } from '@/lib/types';
import { getDevices, getContents } from '@/lib/api';
import { useAdminSocket } from '@/lib/useAdminSocket';
import { Navbar } from '@/components/Navbar';
import { AuthGuard } from '@/components/AuthGuard';
import {
  RotateCw,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([getDevices(), getContents()])
      .then(([devList, contentList]) => {
        if (!ignore) {
          setDevices(devList);
          setContents(contentList);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat data dashboard.');
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [devList, contentList] = await Promise.all([
        getDevices(),
        getContents(),
      ]);
      setDevices(devList);
      setContents(contentList);
      showToast('Data dashboard berhasil diperbarui.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat data dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceStatusChange = useCallback((event: DeviceStatusEvent) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === event.deviceId
          ? { ...d, status: event.status, last_seen: event.last_seen }
          : d
      )
    );
  }, []);

  const { isConnected: isSocketConnected } = useAdminSocket(handleDeviceStatusChange);

  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const offlineDevices = totalDevices - onlineDevices;
  const totalContents = contents.length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        <Navbar isSocketConnected={isSocketConnected} />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-md bg-gray-900 text-white flex items-center gap-3 font-semibold text-sm">
            <span>{toastMessage}</span>
          </div>
        )}

        <section className="bg-blue-500 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                  Signage Control Panel
                </h1>
                <p className="text-blue-100 text-base max-w-2xl font-medium">
                  Pantau status perangkat secara realtime
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-3 rounded-md bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50"
                >
                  <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
                <Link
                  href="/devices"
                  className="flex items-center gap-2 px-5 py-3 rounded-md bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition-all duration-200 hover:scale-105"
                >
                  <span>Kelola Perangkat</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contents"
                  className="flex items-center gap-2 px-6 py-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Tambah Konten</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          {errorMessage && (
            <div className="p-4 bg-red-100 text-red-900 rounded-md font-semibold text-sm flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                onClick={handleRefresh}
                className="underline font-bold uppercase ml-4"
              >
                Coba Lagi
              </button>
            </div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/devices"
              className="flat-card p-6 bg-blue-50 text-gray-900 flex flex-col justify-between group cursor-pointer hover:bg-blue-100 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Total Perangkat
                </span>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-4">
                <span className="text-5xl font-extrabold text-blue-600 leading-none">
                  {totalDevices}
                </span>
                <span className="text-xs font-semibold text-blue-700 ml-2 uppercase">Layar</span>
              </div>
            </Link>

            <Link
              href="/devices"
              className="flat-card p-6 bg-emerald-50 text-gray-900 flex flex-col justify-between group cursor-pointer hover:bg-emerald-100 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Perangkat Online
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-4">
                <span className="text-5xl font-extrabold text-emerald-600 leading-none">
                  {onlineDevices}
                </span>
                <span className="text-xs font-semibold text-emerald-700 ml-2 uppercase">Aktif</span>
              </div>
            </Link>

            <Link
              href="/devices"
              className="flat-card p-6 bg-gray-100 text-gray-900 flex flex-col justify-between group cursor-pointer hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Perangkat Offline
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-4">
                <span className="text-5xl font-extrabold text-gray-700 leading-none">
                  {offlineDevices}
                </span>
                <span className="text-xs font-semibold text-gray-600 ml-2 uppercase">Standby</span>
              </div>
            </Link>

            <Link
              href="/contents"
              className="flat-card p-6 bg-amber-50 text-gray-900 flex flex-col justify-between group cursor-pointer hover:bg-amber-100 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Total Materi Konten
                </span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-4">
                <span className="text-5xl font-extrabold text-amber-600 leading-none">
                  {totalContents}
                </span>
                <span className="text-xs font-semibold text-amber-700 ml-2 uppercase">Media</span>
              </div>
            </Link>
          </section>

          <section className="bg-emerald-500 text-white rounded-lg p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight">
                  Simulasi Multi-Player
                </h3>
                <p className="text-emerald-100 text-sm font-medium mt-1">
                  Buka tab player baru untuk mensimulasikan layar fisik secara realtime
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                <Link
                  href="/devices"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-all hover:scale-105"
                >
                  <span>Kelola Semua Perangkat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/20 text-xs font-bold uppercase tracking-wider">
                  <span>{devices.length} Layar Terdaftar</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white/10 rounded-md p-12 text-center relative z-10">
                <p className="text-white text-sm font-semibold">
                  Memuat data layar simulasi...
                </p>
              </div>
            ) : devices.length === 0 ? (
              <div className="bg-white/10 rounded-md p-8 text-center relative z-10">
                <p className="text-white text-sm font-semibold mb-4">
                  Belum ada perangkat yang terdaftar di sistem.
                </p>
                <Link
                  href="/devices"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-md hover:bg-emerald-50 transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Tambah Perangkat Baru</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
                {devices.map((device, index) => {
                  const activeContent =
                    device.active_content ||
                    contents.find((c) => c.id === device.active_content_id);

                  return (
                    <Link
                      key={device.id}
                      href={`/player/${device.nama}`}
                      target="_blank"
                      className="p-5 bg-white text-gray-900 rounded-md transition-all duration-200 hover:scale-105 block group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between font-extrabold text-base mb-1">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              device.status === 'online'
                                ? 'bg-emerald-500 animate-pulse'
                                : 'bg-gray-300'
                            }`}
                          />
                          <span className="truncate">
                            Player {index + 1}: {device.nama}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                      </div>

                      <p className="text-xs text-gray-500 font-semibold truncate mb-3">
                        {device.lokasi}
                      </p>

                      <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                        <span className="text-gray-400 font-medium">Konten:</span>
                        <span className="font-bold text-gray-700 truncate max-w-[140px]">
                          {activeContent ? activeContent.judul : 'Belum Ditetapkan'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}
