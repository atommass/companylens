const API_URL = process.env.NEXT_PUBLIC_API_URL!;

function readCookie(name: string) {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split('=').slice(1).join('='));
}

export async function csrf() {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const xsrfToken = readCookie('XSRF-TOKEN');

  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...(options.headers || {}),
    },
  });
}