'use client';

import { useState, useEffect, useRef } from 'react';
import { Device, CreateDeviceDto, UpdateDeviceDto } from '@/lib/types';
import { MonitorPlay, X, Check } from 'lucide-react';

interface DeviceFormDialogProps {
  isOpen: boolean;
  device?: Device | null;
  onClose: () => void;
  onSubmit: (dto: CreateDeviceDto | UpdateDeviceDto) => Promise<void>;
}

export function DeviceFormDialog({
  isOpen,
  device,
  onClose,
  onSubmit,
}: DeviceFormDialogProps) {
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
      aria-labelledby="device-dialog-title"
      className="backdrop:bg-gray-900/40 bg-white text-gray-900 p-0 rounded-lg max-w-lg w-full m-auto border-2 border-gray-200"
    >
      {isOpen && (
        <DeviceFormInner
          key={device?.id || 'new'}
          device={device}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </dialog>
  );
}

interface DeviceFormInnerProps {
  device?: Device | null;
  onClose: () => void;
  onSubmit: (dto: CreateDeviceDto | UpdateDeviceDto) => Promise<void>;
}

function DeviceFormInner({ device, onClose, onSubmit }: DeviceFormInnerProps) {
  const [nama, setNama] = useState(device?.nama || '');
  const [lokasi, setLokasi] = useState(device?.lokasi || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEdit = !!device;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !lokasi.trim()) {
      setErrorMessage('Nama dan lokasi perangkat wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit({
        nama: nama.trim(),
        lokasi: lokasi.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perangkat.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="flex items-center justify-between pb-5 border-b-2 border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <MonitorPlay className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3
              id="device-dialog-title"
              className="text-xl font-extrabold text-gray-900 tracking-tight"
            >
              {isEdit ? 'Ubah Data Perangkat' : 'Tambah Perangkat Baru'}
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Kelola nama unik dan lokasi fisik layar
            </p>
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
            htmlFor="device-nama"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
          >
            Nama / Kode Perangkat *
          </label>
          <input
            id="device-nama"
            type="text"
            required
            autoFocus
            placeholder="Contoh: SIGN-004 atau Layar Kantin"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-2 focus:border-blue-500 transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1.5 font-medium">
            Kode ini menentukan URL player: <span className="font-bold text-blue-600">/player/{nama || 'SIGN-XXX'}</span>
          </p>
        </div>

        <div>
          <label
            htmlFor="device-lokasi"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
          >
            Lokasi Fisik Perangkat *
          </label>
          <input
            id="device-lokasi"
            type="text"
            required
            placeholder="Contoh: Gedung A Lantai 1, Lobby Barat"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-2 focus:border-blue-500 transition-all duration-200"
          />
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
          className="flex items-center gap-2 px-6 py-3 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Perangkat'}</span>
        </button>
      </div>
    </form>
  );
}
