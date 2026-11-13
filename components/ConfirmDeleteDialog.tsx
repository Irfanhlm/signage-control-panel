'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  warningNote?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({
  isOpen,
  title,
  message,
  warningNote,
  isDeleting,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
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

  const handleCancel = () => {
    if (isDeleting) return;
    onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        handleCancel();
      }}
      aria-labelledby="confirm-delete-title"
      className="backdrop:bg-gray-900/40 bg-white text-gray-900 p-0 rounded-lg max-w-md w-full m-auto border-2 border-red-200"
    >
      <div className="p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="flex-1">
            <h3
              id="confirm-delete-title"
              className="text-xl font-extrabold text-gray-900 tracking-tight"
            >
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {message}
            </p>
            {warningNote && (
              <div className="mt-4 p-3.5 bg-amber-50 rounded-md border-2 border-amber-200 text-xs text-amber-900 font-medium">
                {warningNote}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isDeleting}
            autoFocus
            className="px-5 py-3 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-3 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
            <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
