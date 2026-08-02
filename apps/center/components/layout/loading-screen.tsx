'use client';

/**
 * Enterprise-grade loading screen with skeleton UI.
 * Shows while checking authentication status.
 */
export function LoadingScreen() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar skeleton */}
      <aside className="hidden w-64 flex-col bg-slate-900 lg:flex">
        <div className="border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-slate-700 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-24 rounded bg-slate-700 animate-pulse" />
              <div className="mt-1 h-3 w-32 rounded bg-slate-700 animate-pulse" />
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-4 p-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 rounded bg-slate-700 animate-pulse" />
              <div className="space-y-1">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="h-8 rounded bg-slate-700 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content skeleton */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header skeleton */}
        <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-slate-200 animate-pulse lg:hidden" />
              <div className="space-y-1">
                <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-48 rounded bg-slate-200 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>
        </header>

        {/* Main content skeleton */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <div className="space-y-6">
            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-6 w-32 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
            </div>

            {/* Cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
                  <div className="mt-3 h-8 w-16 rounded bg-slate-200 animate-pulse" />
                  <div className="mt-2 h-3 w-24 rounded bg-slate-200 animate-pulse" />
                </div>
              ))}
            </div>

            {/* Table skeleton */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 p-4">
                <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
              </div>
              <div className="space-y-2 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded bg-slate-100 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
