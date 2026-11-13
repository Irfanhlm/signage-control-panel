'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Device, Content, DeviceStatusEvent } from '@/lib/types';
import { getDevices, getContents, assignDeviceContent } from '@/lib/api';
import { useAdminSocket } from '@/lib/useAdminSocket';
import { Navbar } from '@/components/Navbar';
import { DeviceStatusBadge } from '@/components/DeviceStatusBadge';
import { ContentTypeBadge } from '@/components/ContentTypeBadge';
import { formatTimeAgo, formatDateTime } from '@/lib/format';
import { AssignContentDialog } from '@/components/AssignContentDialog';
import {
  RotateCw,
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal & Toast state
  const [assignTargetDevice, setAssignTargetDevice] = useState<Device | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial load
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
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat data dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time status updates via Socket.IO
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

  // Content assignment handler
  const handleAssignContent = async (deviceId: string, contentId: string | null) => {
    const res = await assignDeviceContent(deviceId, contentId);
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
            ...d,
            active_content_id: contentId,
            active_content: res.content,
          }
          : d
      )
    );
    showToast(
      contentId
        ? `Konten berhasil ditetapkan ke perangkat ${res.device.nama}!`
        : `Konten aktif pada perangkat ${res.device.nama} telah dicabut.`
    );
  };

  // Metrics
  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const offlineDevices = totalDevices - onlineDevices;
  const totalContents = contents.length;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <Navbar isSocketConnected={isSocketConnected} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-md bg-gray-900 text-white flex items-center gap-3 font-semibold text-sm">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
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
                Pantau status perangkat secara realtime simulasi 3 player virtual.
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Error notification */}
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

        {/* 4 Multi-Color Metric Cards (Color as Structure) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Devices: Blue tint */}
          <div className="flat-card p-6 bg-blue-50 text-gray-900 flex flex-col justify-between group cursor-pointer hover:bg-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Total Perangkat
              </span>
            </div>
            <div className="mt-4">
              <span className="text-5xl font-extrabold text-blue-600 leading-none">
                {totalDevices}
              </span>
              <span className="text-xs font-semibold text-blue-700 ml-2 uppercase">Layar</span>
            </div>
          </div>

          {/* Online Devices: Emerald tint */}
          <div className="flat-card p-6 bg-emerald-50 text-gray-900 flex flex-col justify-between group cursor-pointer hover:bg-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Perangkat Online
              </span>
            </div>
            <div className="mt-4">
              <span className="text-5xl font-extrabold text-emerald-600 leading-none">
                {onlineDevices}
              </span>
              <span className="text-xs font-semibold text-emerald-700 ml-2 uppercase">Aktif</span>
            </div>
          </div>

          {/* Offline Devices: Gray 100 */}
          <div className="flat-card p-6 bg-gray-100 text-gray-900 flex flex-col justify-between group cursor-pointer hover:bg-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Perangkat Offline
              </span>
            </div>
            <div className="mt-4">
              <span className="text-5xl font-extrabold text-gray-700 leading-none">
                {offlineDevices}
              </span>
              <span className="text-xs font-semibold text-gray-600 ml-2 uppercase">Standby</span>
            </div>
          </div>

          {/* Total Contents: Amber tint */}
          <div className="flat-card p-6 bg-amber-50 text-gray-900 flex flex-col justify-between group cursor-pointer hover:bg-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Total Materi Konten
              </span>
            </div>
            <div className="mt-4">
              <span className="text-5xl font-extrabold text-amber-600 leading-none">
                {totalContents}
              </span>
              <span className="text-xs font-semibold text-amber-700 ml-2 uppercase">Media</span>
            </div>
          </div>
        </section>

        {/* Live Device Table Section with Gray 100 background */}
        <section className="bg-gray-100 rounded-lg p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Status Perangkat &amp; Materi Tayang
              </h2>
            </div>
            <Link
              href="/devices"
              className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Kelola Semua Perangkat</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Table */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Tabel Status Perangkat Real-time"
            className="overflow-x-auto bg-white rounded-lg"
          >
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200/80 text-gray-700 font-bold uppercase text-xs tracking-wider">
                  <th scope="col" className="py-4 px-5">Nama / Kode Perangkat</th>
                  <th scope="col" className="py-4 px-5">Lokasi Fisik</th>
                  <th scope="col" className="py-4 px-5">Status Koneksi</th>
                  <th scope="col" className="py-4 px-5">Terakhir Aktif</th>
                  <th scope="col" className="py-4 px-5">Konten Aktif</th>
                  <th scope="col" className="py-4 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                      Memuat daftar perangkat dari database...
                    </td>
                  </tr>
                ) : devices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                      Belum ada data perangkat. Silakan tambahkan perangkat baru.
                    </td>
                  </tr>
                ) : (
                  devices.map((device) => {
                    const activeContent =
                      device.active_content ||
                      contents.find((c) => c.id === device.active_content_id);

                    return (
                      <tr
                        key={device.id}
                        className="hover:bg-blue-50/50 transition-colors duration-150"
                      >
                        {/* Nama */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-gray-900">
                              {device.nama}
                            </span>
                            <Link
                              href={`/player/${device.nama}`}
                              target="_blank"
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title={`Buka Player ${device.nama}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>

                        {/* Lokasi */}
                        <td className="py-4 px-5 font-semibold text-gray-700">
                          {device.lokasi}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <DeviceStatusBadge status={device.status} size="sm" />
                        </td>

                        {/* Last Seen */}
                        <td className="py-4 px-5 text-gray-600 text-xs font-medium">
                          <span title={formatDateTime(device.last_seen)}>
                            {formatTimeAgo(device.last_seen)}
                          </span>
                        </td>

                        {/* Active Content */}
                        <td className="py-4 px-5">
                          {activeContent ? (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 truncate max-w-[200px]">
                                {activeContent.judul}
                              </span>
                              <ContentTypeBadge tipe={activeContent.tipe} />
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs font-semibold uppercase">
                              Belum Ditetapkan
                            </span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setAssignTargetDevice(device)}
                              className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-all duration-200 hover:scale-105"
                            >
                              Ganti Konten
                            </button>
                            <Link
                              href={`/player/${device.nama}`}
                              target="_blank"
                              className="px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition-all duration-200"
                            >
                              Player
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Demo Simulation Box with Emerald Color Block */}
        <section className="bg-emerald-500 text-white rounded-lg p-8 relative overflow-hidden">
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />

          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-extrabold tracking-tight">
              Simulasi Multi-Player
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/player/SIGN-001"
              target="_blank"
              className="p-5 bg-white text-gray-900 rounded-md transition-all duration-200 hover:scale-105 block group"
            >
              <div className="flex items-center justify-between font-extrabold text-base">
                <span>Player 1: SIGN-001</span>
                <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-gray-500 font-semibold mt-1">Main Lobby</p>
            </Link>

            <Link
              href="/player/SIGN-002"
              target="_blank"
              className="p-5 bg-white text-gray-900 rounded-md transition-all duration-200 hover:scale-105 block group"
            >
              <div className="flex items-center justify-between font-extrabold text-base">
                <span>Player 2: SIGN-002</span>
                <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-gray-500 font-semibold mt-1">Warehouse</p>
            </Link>

            <Link
              href="/player/SIGN-003"
              target="_blank"
              className="p-5 bg-white text-gray-900 rounded-md transition-all duration-200 hover:scale-105 block group"
            >
              <div className="flex items-center justify-between font-extrabold text-base">
                <span>Player 3: SIGN-003</span>
                <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-gray-500 font-semibold mt-1">Meeting Room</p>
            </Link>
          </div>
        </section>
      </main>

      {/* Modal: Assign Content */}
      <AssignContentDialog
        isOpen={!!assignTargetDevice}
        device={assignTargetDevice}
        contents={contents}
        onClose={() => setAssignTargetDevice(null)}
        onAssign={handleAssignContent}
      />
    </div>
  );
}
