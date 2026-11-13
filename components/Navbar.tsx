'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  isSocketConnected?: boolean;
}

export function Navbar({ isSocketConnected }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/devices', label: 'Perangkat' },
    { href: '/contents', label: 'Konten Media' },
  ];

  return (
    <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-3.5 group">
            <div>
              <span className="font-extrabold text-xl text-gray-900 tracking-tight leading-none block">
                Signage Panel
              </span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mt-1">
                Flat Control System
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'bg-blue-500 text-white scale-105'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Socket Indicator */}
          {typeof isSocketConnected !== 'undefined' && (
            <div
              className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 ${isSocketConnected
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
                }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/20 text-xs font-bold uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              </div>
              <span>{isSocketConnected ? 'Live' : 'Connecting...'}</span>
            </div>
          )}

          {/* Quick Player Links */}
          <div className="flex items-center bg-gray-100 p-1.5 rounded-lg text-xs font-semibold">
            <span className="text-gray-500 px-2 font-bold hidden lg:inline">
              Simulasi Player:
            </span>
            <Link
              href="/player/SIGN-001"
              target="_blank"
              className="px-3 py-1.5 rounded-md text-gray-800 hover:bg-blue-500 hover:text-white transition-all duration-200 font-bold"
            >
              #1 Lobby
            </Link>
            <Link
              href="/player/SIGN-002"
              target="_blank"
              className="px-3 py-1.5 rounded-md text-gray-800 hover:bg-blue-500 hover:text-white transition-all duration-200 font-bold"
            >
              #2 Warehouse
            </Link>
            <Link
              href="/player/SIGN-003"
              target="_blank"
              className="px-3 py-1.5 rounded-md text-gray-800 hover:bg-blue-500 hover:text-white transition-all duration-200 font-bold"
            >
              #3 Meeting Room
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-around">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${isActive ? 'bg-blue-500 text-white' : 'text-gray-600'
                }`}
            >
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
