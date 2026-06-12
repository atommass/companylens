'use client';

import { AuthProvider } from '@/lib/auth';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}