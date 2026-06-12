'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { CompanyCard } from '@/components/company-card';

type CompanyRecord = {
  id: number;
  name: string;
  registration_number: string;
  status: string | null;
  registered_at: string | null;
  industry: string | null;
  address: string | null;
};

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const openCompanyDetails = (company: CompanyRecord) => {
    router.push(`/dashboard/companies/${encodeURIComponent(company.registration_number)}`);
  };

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await apiFetch('/api/companies?per_page=24&sort=registered_at_desc');
        const payload: { data: CompanyRecord[] } = await response.json();

        if (!response.ok) {
          throw new Error('Unable to load companies');
        }

        setCompanies(payload.data ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load companies');
      } finally {
        setLoading(false);
      }
    }

    void loadCompanies();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Companies</p>
        <h2 className="text-3xl font-semibold text-white">Most recently registered companies</h2>
      </div>

      {loading ? <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6 text-gray-300">Loading companies...</div> : null}
      {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">{error}</div> : null}

      {!loading && !error ? (
        <ul className="divide-y divide-gray-700">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} onOpenDetails={openCompanyDetails} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
