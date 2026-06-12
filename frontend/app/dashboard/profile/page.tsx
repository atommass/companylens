'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, csrf } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation must match.');
      return;
    }

    setPasswordLoading(true);

    try {
      await csrf();

      const response = await apiFetch('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to update password.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage(payload.message ?? 'Password updated successfully.');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Unable to update password.');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteProfile(event: React.FormEvent) {
    event.preventDefault();
    setDeleteError('');

    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm profile removal.');
      return;
    }

    setDeleteLoading(true);

    try {
      await csrf();

      const response = await apiFetch('/api/auth/profile', {
        method: 'DELETE',
        body: JSON.stringify({
          current_password: deletePassword,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to delete profile.');
      }

      await logout();
      router.replace('/register');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to delete profile.');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Profile</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Account settings</h2>
        <p className="mt-3 text-sm text-gray-300">
          Manage your account details, credentials, and security actions from one place.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Profile info</p>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="text-base font-medium text-white">{user?.name ?? 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-base font-medium text-white">{user?.email ?? 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">User ID</p>
              <p className="text-base font-medium text-white">{user?.id ?? 'Unknown'}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Preferences</p>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <p>Profile notifications and additional user preferences can be added in this section later.</p>
            <p>This panel is ready for future account customization settings.</p>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white">Change password</h3>
        <p className="mt-1 text-sm text-gray-400">Update your password to keep your account secure.</p>

        <form onSubmit={handleChangePassword} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm text-gray-300">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-[#533483]"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-300">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-[#533483]"
              minLength={8}
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-300">Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-[#533483]"
              minLength={8}
              required
            />
          </label>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded-xl bg-[#533483] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6b4799] disabled:opacity-60"
            >
              {passwordLoading ? 'Updating...' : 'Update password'}
            </button>
            {passwordMessage ? <p className="text-sm text-green-300">{passwordMessage}</p> : null}
            {passwordError ? <p className="text-sm text-red-300">{passwordError}</p> : null}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
        <h3 className="text-lg font-semibold text-red-200">Danger zone</h3>
        <p className="mt-1 text-sm text-red-100/80">
          Deleting your profile is permanent and cannot be undone.
        </p>

        <form onSubmit={handleDeleteProfile} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-red-100">Current password</span>
            <input
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              className="w-full rounded-xl border border-red-300/30 bg-red-950/40 px-4 py-3 text-white outline-none transition focus:border-red-300/60"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-red-100">Type DELETE to confirm</span>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(event) => setDeleteConfirmText(event.target.value)}
              className="w-full rounded-xl border border-red-300/30 bg-red-950/40 px-4 py-3 text-white outline-none transition focus:border-red-300/60"
              required
            />
          </label>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={deleteLoading}
              className="rounded-xl border border-red-300/40 bg-red-600/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600/55 disabled:opacity-60"
            >
              {deleteLoading ? 'Deleting...' : 'Delete profile'}
            </button>
            {deleteError ? <p className="text-sm text-red-200">{deleteError}</p> : null}
          </div>
        </form>
      </section>
    </section>
  );
}