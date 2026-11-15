'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken, getMe, clearAuth } from '@/lib/api';
import { RotateCw, ShieldCheck } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    let isMounted = true;

    if (!token) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setIsAuthorized(false);
          setIsChecking(false);
          router.replace('/login');
        }
      });
      return () => {
        isMounted = false;
      };
    }

    getMe()
      .then(() => {
        if (isMounted) {
          setIsAuthorized(true);
          setIsChecking(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          clearAuth();
          setIsAuthorized(false);
          setIsChecking(false);
          router.replace('/login?session_expired=true');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router, pathname]);

  if (isChecking) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-gray-900 p-6 select-none font-sans">
        <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-2 text-blue-600 font-semibold mb-2">
          <RotateCw className="w-5 h-5 animate-spin" />
          <span>Memverifikasi Sesi Admin...</span>
        </div>
        <p className="text-sm text-gray-400">
          Memeriksa token autentikasi JWT
        </p>
      </main>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
