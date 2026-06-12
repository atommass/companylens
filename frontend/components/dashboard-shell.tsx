'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';
import { useAuth } from '@/lib/auth';
import type { ReactNode } from 'react';

const navigation = [
  { href: '/dashboard', label: 'Search' },
  { href: '/dashboard/companies', label: 'Companies' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/support', label: 'Support' },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.history.scrollRestoration = 'manual';

    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();
    window.requestAnimationFrame(resetScroll);
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 md:flex">
      <aside className="border-b border-gray-800 bg-gray-950/90 backdrop-blur md:sticky md:top-0 md:z-20 md:border-b-0 md:border-r md:h-screen md:w-72">
        <div className="flex h-full flex-col p-6">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#533483] text-sm font-bold text-white">
              CL
            </span>
            <div>
              <p className="text-lg font-semibold text-white">CompanyLens NGO</p>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Public data for everyone</p>
            </div>
          </Link>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${active
                    ? 'bg-[#533483] text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4 pt-8">
            <div className="rounded-2xl border border-[#533483]/30 bg-[#533483]/10 p-4">
              <p className="text-sm font-medium text-white">Community supported</p>
              <p className="mt-1 text-sm text-gray-300">
                Help keep public company data free and accessible through donations and volunteering.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg border border-gray-700 px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 md:pt-0 md:self-start">
        <header className="border-b border-gray-800 bg-gray-900/95 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Dashboard</p>
              <h1 className="text-lg font-semibold text-white">Data discovery workspace</h1>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{loading ? 'Loading session...' : user?.email ?? 'Guest'}</p>
              <p className="text-xs text-gray-400">Logged in access</p>
            </div>
          </div>
        </header>

        <main className="mx-auto mt-6 max-w-6xl px-6 pb-8 pt-0 md:mt-8">{children}</main>
      </div>
    </div>
  );
}
