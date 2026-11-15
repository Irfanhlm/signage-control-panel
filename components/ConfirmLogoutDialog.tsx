'use client';

import { useEffect, useRef } from 'react';
import { LogOut } from 'lucide-react';

interface ConfirmLogoutDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmLogoutDialog({
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmLogoutDialogProps) {
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
        onCancel();
      }}
      className="backdrop:bg-gray-900/40 bg-white text-gray-900 p-0 rounded-lg max-w-md w-full m-auto border-2 border-gray-200"
    >
      <div className="p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <LogOut className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Konfirmasi Logout
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin mengakhiri sesi?
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </dialog>
  );
}
