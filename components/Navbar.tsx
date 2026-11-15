'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthUser, clearAuth } from '@/lib/api';
import { AdminUser } from '@/lib/types';
import { ConfirmLogoutDialog } from '@/components/ConfirmLogoutDialog';
import { LogOut } from 'lucide-react';

interface NavbarProps {
  isSocketConnected?: boolean;
}

export function Navbar({ isSocketConnected }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      if (mounted) {
        setUser(getAuthUser());
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleConfirmLogout = () => {
    setIsLogoutDialogOpen(false);
    clearAuth();
    router.replace('/login?logout=success');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/devices', label: 'Perangkat' },
    { href: '/contents', label: 'Konten Media' },
  ];

  return (
    <>
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            {typeof isSocketConnected !== 'undefined' && (
              <div
                className={`hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 ${isSocketConnected
                  ? 'text-emerald-800'
                  : 'text-amber-800'
                  }`}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/20 text-xs font-bold uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                </div>
                <span>{isSocketConnected ? 'Live' : 'Connecting...'}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsLogoutDialogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all duration-200 hover:scale-105 cursor-pointer"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

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

      <ConfirmLogoutDialog
        isOpen={isLogoutDialogOpen}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </>
  );
}
