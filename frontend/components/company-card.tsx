'use client';

import type { CompanyRecord } from '@/lib/favorites';

type CompanyCardProps = {
  company: CompanyRecord;
  onOpenDetails: (company: CompanyRecord) => void;
  favorited?: boolean;
  onToggleFavorite?: (company: CompanyRecord) => void;
  onRemoveFavorite?: (companyId: number) => void;
};

export function CompanyCard({
  company,
  onOpenDetails,
  favorited = false,
  onToggleFavorite,
  onRemoveFavorite,
}: CompanyCardProps) {
  return (
    <li
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(company)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenDetails(company);
        }
      }}
      className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-gray-800/40 focus:outline-none focus:ring-2 focus:ring-[#533483] sm:px-6"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="truncate">
            <h4 className="text-base font-semibold text-white truncate">{company.name}</h4>
            <p className="text-xs text-gray-400 truncate">Reg. No. {company.registration_number}</p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Address</span>
            <span className="text-sm text-gray-100">{company.address ?? 'Not listed'}</span>
          </div>
        </div>
      </div>

      <div className="ml-4 flex min-w-[8.5rem] flex-shrink-0 flex-col items-end justify-center gap-2 text-right">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-xs text-gray-400">Registered</span>
          <span className="text-sm text-white">{company.registered_at ?? 'Unknown'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#533483]/15 px-3 py-1 text-xs font-semibold text-[#c4bce0]">
            {company.status ?? 'unknown'}
          </span>
          {onToggleFavorite ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite(company);
              }}
              aria-pressed={favorited}
              aria-label={favorited ? `Remove ${company.name} from favourites` : `Add ${company.name} to favourites`}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition ${favorited
                ? 'border-amber-400/40 bg-amber-400/15 text-amber-300 hover:bg-amber-400/20'
                : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-amber-400/40 hover:text-amber-300'
                }`}
            >
              <span aria-hidden="true">{favorited ? '★' : '☆'}</span>
            </button>
          ) : null}
          {onRemoveFavorite ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRemoveFavorite(company.id);
              }}
              className="hidden text-xs text-gray-500 transition hover:text-red-300 sm:inline-flex"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}