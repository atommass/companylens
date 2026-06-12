'use client';

import { useEffect, useState } from 'react';

export type CompanyRecord = {
  id: number;
  name: string;
  registration_number: string;
  status: string | null;
  registered_at: string | null;
  industry: string | null;
  address: string | null;
};

const STORAGE_KEY = 'companylens:favorites';

function readFavorites(): CompanyRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((company): company is CompanyRecord => typeof company === 'object' && company !== null && 'id' in company && typeof (company as CompanyRecord).id === 'number');
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<CompanyRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFavorites(readFavorites());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, loaded]);

  const isFavorite = (companyId: number) => favorites.some((company) => company.id === companyId);

  const toggleFavorite = (company: CompanyRecord) => {
    setFavorites((current) => {
      const exists = current.some((entry) => entry.id === company.id);
      return exists ? current.filter((entry) => entry.id !== company.id) : [company, ...current];
    });
  };

  const removeFavorite = (companyId: number) => {
    setFavorites((current) => current.filter((company) => company.id !== companyId));
  };

  return { favorites, loaded, isFavorite, toggleFavorite, removeFavorite };
}