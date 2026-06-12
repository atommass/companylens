'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="border-b border-gray-800 bg-gray-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#533483]"></div>
            <span className="text-xl font-bold text-white">CompanyLens</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-sm font-medium text-gray-300 hover:text-white">
              Blog
            </Link>
            <Link href="/#mission" className="text-sm font-medium text-gray-300 hover:text-white">
              Our Mission
            </Link>
            <Link href="/#features" className="text-sm font-medium text-gray-300 hover:text-white">
              Features
            </Link>
            <Link href="/#transparency" className="text-sm font-medium text-gray-300 hover:text-white">
              Transparency
            </Link>
            <Link href="/#support" className="text-sm font-medium text-gray-300 hover:text-white">
              Support Us
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm font-medium text-gray-300">{user.email}</span>
              <Link
                href="/dashboard"
                className="rounded-md bg-[#533483] px-4 py-2 text-sm font-medium text-white hover:bg-[#6b4799] transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:border-gray-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[#533483] px-4 py-2 text-sm font-medium text-white hover:bg-[#6b4799] transition-colors"
              >
                Join Us
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
