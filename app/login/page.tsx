'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAdmin, getAuthToken } from '@/lib/api';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isLogoutSuccess = searchParams.get('logout') === 'success';
  const isSessionExpired = searchParams.get('session_expired') === 'true';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLogoutNotice, setShowLogoutNotice] = useState(isLogoutSuccess);
  const [showExpiredNotice, setShowExpiredNotice] = useState(isSessionExpired);

  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      if (mounted) {
        setIsLoading(false);
      }
    });

    const token = getAuthToken();
    if (token) {
      router.replace('/dashboard');
    }

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Username dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setShowLogoutNotice(false);
    setShowExpiredNotice(false);

    try {
      await loginAdmin(username.trim(), password);
      setIsLoading(false);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Login gagal. Periksa kembali username dan password Anda.'
      );
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <span>Control Panel Signage</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Login Administrator
          </h1>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 sm:p-8 border-2 border-gray-200">
          {showLogoutNotice && (
            <div className="mb-6 p-4 bg-emerald-100 text-emerald-900 rounded-md text-sm font-semibold flex items-center justify-between border-2 border-emerald-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Anda telah berhasil logout</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutNotice(false)}
                className="text-emerald-700 hover:text-emerald-900 ml-2 p-1 cursor-pointer"
                title="Tutup pesan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {showExpiredNotice && (
            <div className="mb-6 p-4 bg-amber-100 text-amber-900 rounded-md text-sm font-semibold flex items-center justify-between border-2 border-amber-300">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Sesi admin Anda telah berakhir. Silakan login kembali.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowExpiredNotice(false)}
                className="text-amber-700 hover:text-amber-900 ml-2 p-1 cursor-pointer"
                title="Tutup pesan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 text-red-900 rounded-md text-sm font-semibold flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700"
              >
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3.5 bg-white rounded-md text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-2 focus:border-blue-500 transition-all border-2 border-gray-200"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3.5 bg-white rounded-md text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-2 focus:border-blue-500 transition-all border-2 border-gray-200"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 flex items-center justify-center gap-2 rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-bold uppercase tracking-wider">Kredensial Default</span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer"
              >
                Gunakan Akun Demo
              </button>
            </div>
            <div className="p-3 bg-white rounded-md border-2 border-gray-200 text-xs font-mono space-y-1 text-gray-700">
              <div>Username: <span className="font-bold text-blue-600">admin</span></div>
              <div>Password: <span className="font-bold text-blue-600">admin123</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-white flex items-center justify-center font-sans">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
