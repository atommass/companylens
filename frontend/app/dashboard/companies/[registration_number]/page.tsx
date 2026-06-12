'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { CompanyRecord } from '@/lib/favorites';
import { CompanyFinancialInsights, type CompanyFinancialStatement } from '@/components/company-financial-insights';

type CompanyDetail = CompanyRecord & {
  region: string | null;
  updated_at: string | null;
  financial_statements: CompanyFinancialStatement[];
};

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams<{ registration_number: string }>();
  const registrationNumber = params.registration_number;
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCompany() {
      try {
        const response = await apiFetch(`/api/companies/by-registration/${encodeURIComponent(registrationNumber)}`);
        const payload: { data: CompanyDetail } = await response.json();

        if (!response.ok) {
          throw new Error('Unable to load company');
        }

        setCompany(payload.data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load company');
      } finally {
        setLoading(false);
      }
    }

    if (registrationNumber) {
      void loadCompany();
    }
  }, [registrationNumber]);

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:border-[#533483]"
      >
        Back to search results
      </button>

      <div className="rounded-3xl border border-gray-700 bg-gray-900/80 p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Company profile</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">{company?.name ?? 'Loading company...'}</h2>
        <p className="mt-2 text-sm text-gray-400">Registration number: {registrationNumber}</p>
      </div>

      {loading ? <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6 text-gray-300">Loading company details...</div> : null}
      {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">{error}</div> : null}

      {!loading && !error && company ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Status</p>
              <p className="mt-2 text-lg font-semibold text-white">{company.status ?? 'unknown'}</p>
            </div>
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Registered</p>
              <p className="mt-2 text-lg font-semibold text-white">{company.registered_at ?? 'Unknown'}</p>
            </div>
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Industry</p>
              <p className="mt-2 text-lg font-semibold text-white">{company.industry ?? 'Not listed'}</p>
            </div>
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Address</p>
              <p className="mt-2 text-lg font-semibold text-white">{company.address ?? 'Not listed'}</p>
            </div>
          </div>

          <CompanyFinancialInsights companyName={company.name} statements={company.financial_statements ?? []} />
        </div>
      ) : null}
    </section>
  );
}