'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiFetch, csrf } from '@/lib/api';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type SocialLoginPayload = {
  provider: 'google' | 'facebook';
  token: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  socialLogin: (payload: SocialLoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readJsonError(res: Response): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return data.message || 'Request failed';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const res = await apiFetch('/api/auth/me');

    if (!res.ok) {
      setUser(null);
      return null;
    }

    const data: { user: AuthUser | null } = await res.json();
    setUser(data.user);
    return data.user;
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function login(payload: LoginPayload) {
    await csrf();

    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(await readJsonError(res));
    }

    const data: { user: AuthUser | null } = await res.json();
    setUser(data.user);
    return data.user as AuthUser;
  }

  async function register(payload: RegisterPayload) {
    await csrf();

    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(await readJsonError(res));
    }

    const data: { user: AuthUser | null } = await res.json();
    setUser(data.user);
    return data.user as AuthUser;
  }

  async function socialLogin(payload: SocialLoginPayload) {
    const res = await apiFetch(`/api/auth/social/${payload.provider}`, {
      method: 'POST',
      body: JSON.stringify({ token: payload.token }),
    });

    if (!res.ok) {
      throw new Error(await readJsonError(res));
    }

    const data: { user: AuthUser | null } = await res.json();
    setUser(data.user);
    return data.user as AuthUser;
  }

  async function logout() {
    await apiFetch('/api/auth/logout', {
      method: 'POST',
    }).catch(() => null);

    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, socialLogin, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}