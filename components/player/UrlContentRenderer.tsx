'use client';

import { Content } from '@/lib/types';
import { Globe, ExternalLink, AlertTriangle } from 'lucide-react';

interface UrlContentRendererProps {
  content: Content;
}

export function UrlContentRenderer({ content }: UrlContentRendererProps) {
  const targetUrl = content.url || (content.payload?.url as string) || '';

  if (!targetUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <Globe className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">URL Target Kosong</h3>
        <p className="text-sm text-gray-600 max-w-md">
          Konten &ldquo;{content.judul}&rdquo; belum memiliki tautan URL web yang valid.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col relative bg-white overflow-hidden">
      {/* Target Iframe */}
      <iframe
        src={targetUrl}
        title={content.judul}
        className="w-full flex-1 border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />

      {/* Helpful bottom notice for iframe policies */}
      <div className="bg-gray-900 text-gray-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-3 border-t border-gray-800 z-10 select-none">
        <div className="flex items-center gap-2 truncate max-w-xl">
          <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-gray-400">Web Embed:</span>
          <span className="font-mono text-gray-100 truncate">{targetUrl}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 text-gray-400 text-[11px]">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Jika halaman kosong, situs target memblokir iframe (X-Frame-Options).
          </span>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-all hover:scale-105"
          >
            <span>Buka Langsung</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

