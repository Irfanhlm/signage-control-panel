import Link from "next/link";

export default function Home() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
            DS
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-100">Digital Signage Control Panel</h1>
            <p className="text-xs text-zinc-400">MVP Demonstration — Satu Laptop Demo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Tahap 1 — Fondasi Siap
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Hero Section */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Pusat Kendali & Pemutar Signage Real-Time
          </h2>
          <p className="text-base text-zinc-400 max-w-2xl leading-relaxed">
            Membuktikan alur komunikasi end-to-end:{" "}
            <code className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded text-xs font-mono">
              Admin Dashboard → REST API → Supabase → Socket.IO → Signage Player
            </code>
          </p>
        </div>

        {/* Status Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                Frontend App
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Next.js + Tailwind</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Menyediakan dashboard admin dan pemutar signage virtual berbasis web.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-500">
              Port: <span className="text-zinc-300 font-mono">3000</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
                Backend Server
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Express + Socket.IO</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Menyediakan REST API CRUD, manajemen room per device, dan heartbeat online/offline.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-500 flex items-center justify-between">
              <span>Port: <span className="text-zinc-300 font-mono">3001</span></span>
              <a
                href={`${apiBaseUrl}/api/health`}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline"
              >
                /api/health ↗
              </a>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                Database
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Supabase PostgreSQL</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Penyimpanan persisten tabel devices dan contents dengan foreign key active_content_id.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-500">
              Status: <span className="text-zinc-300">Siap untuk Tahap 2</span>
            </div>
          </div>
        </div>

        {/* Roadmap / Tahapan Implementasi */}
        <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/80 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-200">Tahapan Implementasi MVP</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black text-xs font-bold">
                ✓
              </span>
              <div>
                <div className="font-medium text-emerald-300">Tahap 1 — Fondasi</div>
                <div className="text-xs text-zinc-400">Next.js, Express, Socket.IO, TypeScript, Env config</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold">
                2
              </span>
              <div>
                <div className="font-medium text-zinc-200">Tahap 2 — Database</div>
                <div className="text-xs text-zinc-400">Schema Supabase PostgreSQL (devices & contents)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold">
                3
              </span>
              <div>
                <div className="font-medium text-zinc-200">Tahap 3 — REST API</div>
                <div className="text-xs text-zinc-400">CRUD devices, contents & assignment endpoint</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold">
                4
              </span>
              <div>
                <div className="font-medium text-zinc-200">Tahap 4 — Socket.IO</div>
                <div className="text-xs text-zinc-400">Rooms per device, heartbeat & online/offline timeout</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold">
                5
              </span>
              <div>
                <div className="font-medium text-zinc-200">Tahap 5 — Frontend Admin</div>
                <div className="text-xs text-zinc-400">Dashboard, CRUD tables & assign content UI</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold">
                6
              </span>
              <div>
                <div className="font-medium text-zinc-200">Tahap 6 — Player & Demo</div>
                <div className="text-xs text-zinc-400">Route /player/[deviceId] & simulasi 3 device</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Demo Navigation Preview */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-zinc-200 transition-colors border border-zinc-700"
          >
            Buka Dashboard (Tahap 5)
          </Link>
          <Link
            href="/devices"
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-zinc-200 transition-colors border border-zinc-700"
          >
            Kelola Devices (Tahap 5)
          </Link>
          <Link
            href="/contents"
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-zinc-200 transition-colors border border-zinc-700"
          >
            Kelola Contents (Tahap 5)
          </Link>
          <Link
            href="/player/SIGN-001"
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-zinc-200 transition-colors border border-zinc-700"
          >
            Player SIGN-001 (Tahap 6)
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 px-6 py-4 text-xs text-zinc-500 text-center">
        Digital Signage Control Panel &middot; Diimplementasikan sesuai PRD.md & context.md
      </footer>
    </div>
  );
}
