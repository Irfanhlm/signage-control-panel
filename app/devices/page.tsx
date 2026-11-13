'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Device, Content, CreateDeviceDto, UpdateDeviceDto, DeviceStatusEvent } from '@/lib/types';
import {
  getDevices,
  getContents,
  createDevice,
  updateDevice,
  deleteDevice,
  assignDeviceContent,
} from '@/lib/api';
import { useAdminSocket } from '@/lib/useAdminSocket';
import { Navbar } from '@/components/Navbar';
import { DeviceStatusBadge } from '@/components/DeviceStatusBadge';
import { ContentTypeBadge } from '@/components/ContentTypeBadge';
import { formatTimeAgo, formatDateTime } from '@/lib/format';
import { DeviceFormDialog } from '@/components/DeviceFormDialog';
import { AssignContentDialog } from '@/components/AssignContentDialog';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import {
  MonitorPlay,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [assignTargetDevice, setAssignTargetDevice] = useState<Device | null>(null);
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load data on mount
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
          setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat data perangkat.');
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
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat data perangkat.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time status update via Socket.IO
  const handleDeviceStatusChange = (event: DeviceStatusEvent) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === event.deviceId
          ? { ...d, status: event.status, last_seen: event.last_seen }
          : d
      )
    );
  };

  const { isConnected: isSocketConnected } = useAdminSocket(handleDeviceStatusChange);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return devices;
    return devices.filter(
      (d) =>
        d.nama.toLowerCase().includes(q) ||
        d.lokasi.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
    );
  }, [devices, searchQuery]);

  // CRUD Handlers
  const handleCreateOrUpdateDevice = async (dto: CreateDeviceDto | UpdateDeviceDto) => {
    if (editingDevice) {
      const updated = await updateDevice(editingDevice.id, dto);
      setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      showToast(`Perangkat ${updated.nama} berhasil diperbarui.`);
    } else {
      const created = await createDevice(dto as CreateDeviceDto);
      setDevices((prev) => [...prev, created]);
      showToast(`Perangkat ${created.nama} berhasil ditambahkan.`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDevice) return;
    setIsDeleting(true);
    try {
      await deleteDevice(deletingDevice.id);
      setDevices((prev) => prev.filter((d) => d.id !== deletingDevice.id));
      showToast(`Perangkat ${deletingDevice.nama} berhasil dihapus.`);
      setDeletingDevice(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus perangkat.');
    } finally {
      setIsDeleting(false);
    }
  };

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
        ? `Konten berhasil ditautkan ke ${res.device.nama}!`
        : `Konten pada ${res.device.nama} telah dicabut.`
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <Navbar isSocketConnected={isSocketConnected} />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-md bg-gray-900 text-white flex items-center gap-3 font-semibold text-sm">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Section Header */}
      <section className="bg-gray-100 py-10 border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <MonitorPlay className="w-4 h-4" />
                <span>Inventori Perangkat</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Daftar Layar Signage
              </h1>
              <p className="text-sm text-gray-600 max-w-xl font-medium">
                Kelola nama unit unik, lokasi pemasangan fisik, serta status koneksi Socket.IO real-time.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingDevice(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all duration-200 hover:scale-105 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Perangkat Baru</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-red-100 text-red-900 rounded-md font-semibold text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={handleRefresh} className="underline font-bold uppercase ml-4">
              Coba Lagi
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-2 focus:border-blue-500 transition-all duration-200"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Menampilkan <span className="text-blue-600">{filteredDevices.length}</span> dari {devices.length} perangkat
          </div>
        </div>

        {/* Devices Table */}
        <div className="bg-gray-100 rounded-lg p-6">
          <div
            tabIndex={0}
            role="region"
            aria-label="Tabel Manajemen Perangkat"
            className="overflow-x-auto bg-white rounded-md"
          >
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200/80 text-gray-700 font-bold uppercase text-xs tracking-wider">
                  <th scope="col" className="py-4 px-5">Kode / Nama Layar</th>
                  <th scope="col" className="py-4 px-5">Lokasi Fisik</th>
                  <th scope="col" className="py-4 px-5">Status Koneksi</th>
                  <th scope="col" className="py-4 px-5">Waktu Terakhir Aktif</th>
                  <th scope="col" className="py-4 px-5">Konten Aktif</th>
                  <th scope="col" className="py-4 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                      Memuat data perangkat dari database...
                    </td>
                  </tr>
                ) : filteredDevices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                      {searchQuery
                        ? `Tidak ada perangkat yang cocok dengan pencarian "${searchQuery}".`
                        : 'Belum ada perangkat terdaftar. Klik "+ Tambah Perangkat Baru" untuk memulai.'}
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((device) => {
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
                              title="Buka Player di tab baru"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                            ID: {device.id.slice(0, 8)}...
                          </span>
                        </td>

                        {/* Lokasi */}
                        <td className="py-4 px-5 font-semibold text-gray-700">
                          {device.lokasi}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <DeviceStatusBadge status={device.status} />
                        </td>

                        {/* Last Seen */}
                        <td className="py-4 px-5 text-gray-600 text-xs font-medium">
                          <span title={formatDateTime(device.last_seen)}>
                            {formatTimeAgo(device.last_seen)}
                          </span>
                        </td>

                        {/* Konten Aktif */}
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
                              Konten
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDevice(device);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-200"
                              title="Edit Perangkat"
                            >
                              <Edit2 className="w-4 h-4 stroke-[2]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingDevice(device)}
                              className="p-1.5 rounded-md bg-red-100 hover:bg-red-200 text-red-700 transition-all duration-200"
                              title="Hapus Perangkat"
                            >
                              <Trash2 className="w-4 h-4 stroke-[2]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Dialog: Create/Edit Device */}
      <DeviceFormDialog
        isOpen={isFormOpen}
        device={editingDevice}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDevice(null);
        }}
        onSubmit={handleCreateOrUpdateDevice}
      />

      {/* Dialog: Assign Content */}
      <AssignContentDialog
        isOpen={!!assignTargetDevice}
        device={assignTargetDevice}
        contents={contents}
        onClose={() => setAssignTargetDevice(null)}
        onAssign={handleAssignContent}
      />

      {/* Dialog: Confirm Delete */}
      <ConfirmDeleteDialog
        isOpen={!!deletingDevice}
        title="Hapus Perangkat Signage?"
        message={`Apakah Anda yakin ingin menghapus data perangkat "${deletingDevice?.nama}" (${deletingDevice?.lokasi})? Tindakan ini permanen.`}
        warningNote="Player yang sedang terhubung akan otomatis terputus dari jaringan."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingDevice(null)}
      />
    </div>
  );
}
