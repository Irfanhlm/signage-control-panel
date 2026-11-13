'use client';

import { useState, useEffect, useRef } from 'react';
import { Device, Content } from '@/lib/types';
import { ContentTypeBadge } from './ContentTypeBadge';
import { X, Ban } from 'lucide-react';

interface AssignContentDialogProps {
  isOpen: boolean;
  device: Device | null;
  contents: Content[];
  onClose: () => void;
  onAssign: (deviceId: string, contentId: string | null) => Promise<void>;
}

export function AssignContentDialog({
  isOpen,
  device,
  contents,
  onClose,
  onAssign,
}: AssignContentDialogProps) {
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

  if (!device) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="assign-dialog-title"
      className="backdrop:bg-gray-900/40 bg-white text-gray-900 p-0 rounded-lg max-w-xl w-full m-auto border-2 border-gray-200"
    >
      {isOpen && (
        <AssignContentInner
          key={device.id}
          device={device}
          contents={contents}
          onClose={onClose}
          onAssign={onAssign}
        />
      )}
    </dialog>
  );
}

interface AssignContentInnerProps {
  device: Device;
  contents: Content[];
  onClose: () => void;
  onAssign: (deviceId: string, contentId: string | null) => Promise<void>;
}

function AssignContentInner({
  device,
  contents,
  onClose,
  onAssign,
}: AssignContentInnerProps) {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    device.active_content_id
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onAssign(device.id, selectedContentId);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menetapkan konten.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="flex items-center justify-between pb-5 border-b-2 border-gray-100">
        <div>
          <h3
            id="assign-dialog-title"
            className="text-xl font-extrabold text-gray-900 tracking-tight"
          >
            Tetapkan Konten ke Layar
          </h3>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Target Layar: <span className="text-gray-900 font-bold">{device.nama}</span> ({device.lokasi})
          </p>
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

      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
          Pilih Materi Tayang Aktif:
        </label>

        <label
          className={`flex items-start justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 ${selectedContentId === null
            ? 'bg-blue-50 border-2 border-blue-500 scale-[1.02]'
            : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
            }`}
        >
          <div className="flex items-center gap-3.5">
            <input
              type="radio"
              name="contentOption"
              checked={selectedContentId === null}
              onChange={() => setSelectedContentId(null)}
              className="w-4 h-4 text-blue-600 accent-blue-500"
            />
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                <Ban className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-900 block">
                  Kosongkan Konten (Unassign)
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Layar player akan kembali ke status standby &quot;Belum Ada Konten&quot;.
                </span>
              </div>
            </div>
          </div>
        </label>

        <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
          {contents.length === 0 ? (
            <div className="p-6 bg-gray-100 rounded-lg text-center text-sm font-medium text-gray-500">
              Belum ada materi konten tersimpan di database.
            </div>
          ) : (
            contents.map((item) => {
              const isSelected = selectedContentId === item.id;
              return (
                <label
                  key={item.id}
                  className={`flex items-start justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 ${isSelected
                    ? 'bg-blue-50 border-2 border-blue-500 scale-[1.02]'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="radio"
                      name="contentOption"
                      checked={isSelected}
                      onChange={() => setSelectedContentId(item.id)}
                      className="mt-1 w-4 h-4 text-blue-600 accent-blue-500"
                    />
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-extrabold text-gray-900">
                          {item.judul}
                        </span>
                        <ContentTypeBadge tipe={item.tipe} />
                      </div>
                      {item.tipe === 'text' && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1 font-medium">
                          {item.payload?.text}
                        </p>
                      )}
                      {item.tipe !== 'text' && item.url && (
                        <p className="text-xs font-mono text-gray-500 mt-1 truncate max-w-sm">
                          {item.url}
                        </p>
                      )}
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
        <div className="flex items-center gap-3">
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
            <span>{isSubmitting ? 'Mengirim...' : 'Terapkan ke Player'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
