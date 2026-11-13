'use client';

import { useState, useEffect, useMemo } from 'react';
import { Content, CreateContentDto, UpdateContentDto } from '@/lib/types';
import { getContents, createContent, updateContent, deleteContent } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { ContentTypeBadge } from '@/components/ContentTypeBadge';
import { formatDateTime } from '@/lib/format';
import { ContentFormDialog } from '@/components/ContentFormDialog';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import {
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2
} from 'lucide-react';

export default function ContentsPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [deletingContent, setDeletingContent] = useState<Content | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    let ignore = false;
    getContents()
      .then((list) => {
        if (!ignore) {
          setContents(list);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat data konten.');
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
      const list = await getContents();
      setContents(list);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memuat data konten.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return contents.filter((c) => {
      const matchesSearch =
        !q ||
        c.judul.toLowerCase().includes(q) ||
        (c.payload?.text && c.payload.text.toLowerCase().includes(q)) ||
        (c.url && c.url.toLowerCase().includes(q));

      const matchesType = typeFilter === 'all' || c.tipe === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [contents, searchQuery, typeFilter]);

  const handleCreateOrUpdateContent = async (dto: CreateContentDto | UpdateContentDto) => {
    if (editingContent) {
      const updated = await updateContent(editingContent.id, dto);
      setContents((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showToast(`Konten "${updated.judul}" berhasil diperbarui.`);
    } else {
      const created = await createContent(dto as CreateContentDto);
      setContents((prev) => [created, ...prev]);
      showToast(`Konten "${created.judul}" berhasil ditambahkan.`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingContent) return;
    setIsDeleting(true);
    try {
      await deleteContent(deletingContent.id);
      setContents((prev) => prev.filter((c) => c.id !== deletingContent.id));
      showToast(`Konten "${deletingContent.judul}" berhasil dihapus.`);
      setDeletingContent(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus konten.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <Navbar />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-md bg-gray-900 text-white flex items-center gap-3 font-semibold text-sm">
          <span>{toastMessage}</span>
        </div>
      )}

      <section className="bg-gray-100 py-10 border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Materi Konten Media
              </h1>
            </div>

            <button
              onClick={() => {
                setEditingContent(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all duration-200 hover:scale-105 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Konten Baru</span>
            </button>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {errorMessage && (
          <div className="p-4 bg-red-100 text-red-900 rounded-md font-semibold text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={handleRefresh} className="underline font-bold uppercase ml-4">
              Coba Lagi
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari judul atau isi konten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-2 focus:border-blue-500 transition-all duration-200"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter Tipe Media"
              className="px-4 py-3 bg-gray-100 rounded-md text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:border-2 focus:border-blue-500 transition-all duration-200"
            >
              <option value="all">Semua Tipe Media</option>
              <option value="text">Teks Pengumuman</option>
              <option value="image">Gambar Poster</option>
              <option value="video">Streaming Video</option>
              <option value="url">URL Web Iframe</option>
            </select>
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Menampilkan <span className="text-emerald-600">{filteredContents.length}</span> dari {contents.length} konten
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <div
            tabIndex={0}
            role="region"
            aria-label="Tabel Manajemen Konten"
            className="overflow-x-auto bg-white rounded-md"
          >
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200/80 text-gray-700 font-bold uppercase text-xs tracking-wider">
                  <th scope="col" className="py-4 px-5">Judul Materi Konten</th>
                  <th scope="col" className="py-4 px-5">Format Tipe</th>
                  <th scope="col" className="py-4 px-5">Payload / Pratinjau URL</th>
                  <th scope="col" className="py-4 px-5">Tanggal Dibuat</th>
                  <th scope="col" className="py-4 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                      Memuat daftar konten dari database...
                    </td>
                  </tr>
                ) : filteredContents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                      {searchQuery || typeFilter !== 'all'
                        ? 'Tidak ada konten yang sesuai dengan filter pencarian.'
                        : 'Belum ada konten tersimpan. Klik "+ Tambah Konten Baru" untuk memulai.'}
                    </td>
                  </tr>
                ) : (
                  filteredContents.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/50 transition-colors duration-150"
                    >
                      <td className="py-4 px-5">
                        <span className="font-extrabold text-gray-900 block text-base">
                          {item.judul}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                          ID: {item.id.slice(0, 8)}...
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <ContentTypeBadge tipe={item.tipe} />
                      </td>

                      <td className="py-4 px-5 max-w-sm">
                        {item.tipe === 'text' && (
                          <p className="text-gray-700 text-sm line-clamp-2 font-medium">
                            {item.payload?.text || '(Teks kosong)'}
                          </p>
                        )}
                        {item.tipe === 'image' && item.url && (
                          <div className="flex items-center gap-3">
                            <img
                              src={item.url}
                              alt={item.judul}
                              className="h-10 w-16 object-cover rounded-md shrink-0 bg-gray-100"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-mono text-gray-600 hover:text-blue-600 truncate max-w-[200px]"
                            >
                              {item.url} ↗
                            </a>
                          </div>
                        )}
                        {item.tipe === 'video' && item.url && (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded bg-gray-200 text-gray-800 text-xs font-bold font-mono">
                              MP4
                            </span>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-mono text-gray-600 hover:text-blue-600 truncate max-w-[220px]"
                            >
                              {item.url} ↗
                            </a>
                          </div>
                        )}
                        {item.tipe === 'url' && item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-mono font-bold text-blue-600 hover:underline truncate max-w-[260px] flex items-center gap-1"
                          >
                            <span>{item.url}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        )}
                      </td>

                      <td className="py-4 px-5 text-gray-600 text-xs font-medium">
                        {formatDateTime(item.created_at)}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingContent(item);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-200"
                            title="Edit Konten"
                          >
                            <Edit2 className="w-4 h-4 stroke-[2]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingContent(item)}
                            className="p-1.5 rounded-md bg-red-100 hover:bg-red-200 text-red-700 transition-all duration-200"
                            title="Hapus Konten"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ContentFormDialog
        isOpen={isFormOpen}
        content={editingContent}
        onClose={() => {
          setIsFormOpen(false);
          setEditingContent(null);
        }}
        onSubmit={handleCreateOrUpdateContent}
      />

      <ConfirmDeleteDialog
        isOpen={!!deletingContent}
        title="Hapus Konten Media?"
        message={`Apakah Anda yakin ingin menghapus materi tayang "${deletingContent?.judul}"?`}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingContent(null)}
      />
    </div>
  );
}
