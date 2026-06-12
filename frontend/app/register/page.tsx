'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { SocialLogin } from '@/components/social-login';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const { user, loading, register } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, router, user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return;
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 transition hover:border-[#533483] hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>

        <Link href="/" className="flex items-center gap-2 text-white transition hover:text-[#c4bce0]">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#533483] text-sm font-bold text-white">
            CL
          </span>
          <span className="text-sm font-semibold tracking-wide">CompanyLens</span>
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-white">Create Account</h1>
        {loading ? <p className="text-sm text-gray-400">Checking session...</p> : null}
        <input
          className="w-full rounded-md border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          required
        />
        <input
          className="w-full rounded-md border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />
        <input
          className="w-full rounded-md border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <input
          className="w-full rounded-md border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="Confirm Password"
          required
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button className="w-full cursor-pointer rounded-md border border-[#533483] bg-[#533483] px-4 py-3 text-white transition-all hover:bg-[#6b4799] hover:border-[#6b4799] active:scale-95">
          Join Us
        </button>
        <SocialLogin />
        <p className="text-sm text-gray-400 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-[#a8a0d8] hover:text-[#c4bce0]">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
