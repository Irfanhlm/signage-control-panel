'use client';

import { Content } from '@/lib/types';

interface TextContentRendererProps {
  content: Content;
}

export function TextContentRenderer({ content }: TextContentRendererProps) {
  const displayText =
    (typeof content.payload?.text === 'string' && content.payload.text.trim().length > 0)
      ? content.payload.text
      : content.judul;

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 bg-white relative overflow-hidden select-none">

      <div
        className="absolute -top-16 -right-16 w-64 h-64 bg-blue-50 rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-50 rounded-lg rotate-12 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 left-12 w-8 h-8 bg-amber-400 rounded-md rotate-45 pointer-events-none opacity-40"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center text-center">

        {content.judul && content.payload?.text && (
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-500 uppercase tracking-wider mb-6">
            {content.judul}
          </h2>
        )}


        <div className="bg-gray-50 border-4 border-gray-900 rounded-2xl p-8 sm:p-12 md:p-16 w-full">
          <p className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight break-words">
            {displayText}
          </p>
        </div>

      </div>
    </div>
  );
}

