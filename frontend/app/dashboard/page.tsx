'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyCard } from '@/components/company-card';
import { apiFetch } from '@/lib/api';

type CompanyRecord = {
  id: number;
  name: string;
  registration_number: string;
  status: string | null;
  registered_at: string | null;
  industry: string | null;
  address: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [perPage, setPerPage] = useState(12);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const savedState = window.sessionStorage.getItem('companylens:search-state');

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState) as {
          query: string;
          submittedQuery: string;
          companies: CompanyRecord[];
          perPage: number;
          page: number;
          meta: { current_page: number; last_page: number; per_page: number; total: number } | null;
          statusFilter: string | null;
          sort: string | null;
          hasSearched: boolean;
        };

        setQuery(parsed.query ?? '');
        setSubmittedQuery(parsed.submittedQuery ?? '');
        setCompanies(parsed.companies ?? []);
        setPerPage(parsed.perPage ?? 12);
        setPage(parsed.page ?? 1);
        setMeta(parsed.meta ?? null);
        setStatusFilter(parsed.statusFilter ?? null);
        setSort(parsed.sort ?? null);
        setHasSearched(Boolean(parsed.hasSearched));
      } catch {
        window.sessionStorage.removeItem('companylens:search-state');
      }
    }

    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!hasSearched) {
      window.sessionStorage.removeItem('companylens:search-state');
      return;
    }

    window.sessionStorage.setItem(
      'companylens:search-state',
      JSON.stringify({
        query,
        submittedQuery,
        companies,
        perPage,
        page,
        meta,
        statusFilter,
        sort,
        hasSearched,
      }),
    );
  }, [companies, hasSearched, meta, page, perPage, query, sort, statusFilter, submittedQuery]);

  async function searchCompanies(nextQuery: string, nextPage = 1, nextPerPage = perPage, nextStatus: string | null = statusFilter, nextSort: string | null = sort) {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.set('q', nextQuery);
      params.set('per_page', String(nextPerPage));
      params.set('page', String(nextPage));
      if (nextStatus) params.set('status', nextStatus);
      if (nextSort) params.set('sort', nextSort);

      const response = await apiFetch(`/api/companies-search?${params.toString()}`);
      const payload: { data: CompanyRecord[]; query: string; meta?: { current_page: number; last_page: number; per_page: number; total: number } } = await response.json();

      if (!response.ok) {
        throw new Error('Search failed');
      }

      setCompanies(payload.data ?? []);
      setSubmittedQuery(payload.query ?? nextQuery);
      setMeta(payload.meta ?? null);
      setPage(payload.meta?.current_page ?? nextPage);
      setPerPage(payload.meta?.per_page ?? nextPerPage);
      setStatusFilter(nextStatus);
      setSort(nextSort);
      setHasSearched(true);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Search failed');
      setCompanies([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    await searchCompanies(query.trim());
  }

  function clearSearch() {
    setQuery('');
    setSubmittedQuery('');
    setCompanies([]);
    setPerPage(12);
    setPage(1);
    setMeta(null);
    setStatusFilter(null);
    setSort(null);
    setLoading(false);
    setError('');
    setHasSearched(false);
    window.sessionStorage.removeItem('companylens:search-state');
  }

  const totalResults = companies.length;

  const openCompanyDetails = (company: CompanyRecord) => {
    router.push(`/dashboard/companies/${encodeURIComponent(company.registration_number)}`);
  };

  return (
    <div className="space-y-8 pt-0">
      {!hasSearched ? (
        <section className="rounded-3xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-8 md:p-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Search public company data</p>
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              Find companies, understand them, and make public data easy to read.
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-gray-300">
              Search our public registry to surface company records, status, geography, and industry information in one place.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-700 bg-gray-950/60 p-3 md:flex-row">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by company name or registration number"
                  className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-4 text-white placeholder-gray-400 outline-none ring-0 transition focus:border-[#533483]"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#533483] px-6 py-4 font-semibold text-white transition hover:bg-[#6b4799] active:scale-[0.99]"
                  >
                    Search companies
                  </button>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="rounded-xl border border-gray-700 px-6 py-4 font-semibold text-gray-200 transition hover:border-gray-500 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                {['Riga', 'Daugavpils', 'inactive', 'manufacturing', 'public limited'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setQuery(chip);
                      void searchCompanies(chip);
                    }}
                    className="rounded-full border border-gray-700 px-3 py-1.5 transition hover:border-[#533483] hover:text-white"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </section>
      ) : (
        <section className="sticky top-4 z-10 rounded-2xl border border-gray-700 bg-gray-900/95 p-4 backdrop-blur">
          <form onSubmit={onSubmit} className="flex flex-col gap-3 md:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search another company"
              className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 outline-none transition focus:border-[#533483]"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-xl bg-[#533483] px-5 py-3 font-semibold text-white transition hover:bg-[#6b4799]"
              >
                Search
              </button>
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-xl border border-gray-700 px-5 py-3 font-semibold text-gray-200 transition hover:border-gray-500 hover:text-white"
              >
                Clear
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6 text-gray-300">
          Searching public records...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {error}
        </div>
      ) : null}

      {hasSearched ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Search results</p>
              <h3 className="text-2xl font-semibold text-white">
                {submittedQuery ? `Results for “${submittedQuery}”` : 'Latest public records'}
              </h3>
            </div>
            <p className="text-sm text-gray-400">{meta?.total ?? totalResults} companies found</p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Per page:</label>
                <select
                  value={perPage}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setPerPage(next);
                    setPage(1);
                    void searchCompanies(submittedQuery || '', 1, next, statusFilter, sort);
                  }}
                  className="rounded-md bg-gray-800 px-2 py-1 text-white"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Status:</label>
                <select
                  value={statusFilter ?? ''}
                  onChange={(e) => {
                    const next = e.target.value || null;
                    setStatusFilter(next);
                    setPage(1);
                    void searchCompanies(submittedQuery || '', 1, perPage, next, sort);
                  }}
                  className="rounded-md bg-gray-800 px-2 py-1 text-white"
                >
                  <option value="">Any</option>
                  <option value="active">Active</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Sort:</label>
                <select
                  value={sort ?? ''}
                  onChange={(e) => {
                    const next = e.target.value || null;
                    setSort(next);
                    setPage(1);
                    void searchCompanies(submittedQuery || '', 1, perPage, statusFilter, next);
                  }}
                  className="rounded-md bg-gray-800 px-2 py-1 text-white"
                >
                  <option value="">Updated</option>
                  <option value="name_asc">A → Z</option>
                  <option value="name_desc">Z → A</option>
                  <option value="registered_at_asc">Date registered ↑</option>
                  <option value="registered_at_desc">Date registered ↓</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const prev = Math.max(1, page - 1);
                  setPage(prev);
                  void searchCompanies(submittedQuery || '', prev, perPage);
                }}
                disabled={meta ? meta.current_page <= 1 : page <= 1}
                className="rounded-md bg-gray-800 px-3 py-1 text-sm text-white disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-300">Page {meta?.current_page ?? page} of {meta?.last_page ?? 1}</span>
              <button
                type="button"
                onClick={() => {
                  const next = (meta ? Math.min(meta.last_page, page + 1) : page + 1);
                  setPage(next);
                  void searchCompanies(submittedQuery || '', next, perPage);
                }}
                disabled={meta ? meta.current_page >= meta.last_page : false}
                className="rounded-md bg-gray-800 px-3 py-1 text-sm text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {companies.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} onOpenDetails={openCompanyDetails} />
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center text-gray-300">
              No companies matched that search. Try a broader term or use one of the suggested filters above.
            </div>
          )}
            {companies.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const prev = Math.max(1, page - 1);
                    setPage(prev);
                    void searchCompanies(submittedQuery || '', prev, perPage, statusFilter, sort);
                  }}
                  disabled={meta ? meta.current_page <= 1 : page <= 1}
                  className="rounded-md bg-gray-800 px-3 py-1 text-sm text-white disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-300">Page {meta?.current_page ?? page} of {meta?.last_page ?? 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = (meta ? Math.min(meta.last_page, page + 1) : page + 1);
                    setPage(next);
                    void searchCompanies(submittedQuery || '', next, perPage, statusFilter, sort);
                  }}
                  disabled={meta ? meta.current_page >= meta.last_page : false}
                  className="rounded-md bg-gray-800 px-3 py-1 text-sm text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Public company data',
              description: 'Search records from the public register and see the key details in a clear format.',
            },
            {
              title: 'Community-first design',
              description: 'Built to help journalists, residents, and researchers understand company information quickly.',
            },
            {
              title: 'Free access',
              description: 'We keep the platform free through donations and volunteer support.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">{item.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}