'use client';

import { useMemo } from 'react';

export type CompanyFinancialStatement = {
  id: number;
  year: number;
  year_started_on: string | null;
  year_ended_on: string | null;
  employees: number | null;
  currency: string | null;
  source_schema: string | null;
  source_type: string | null;
  net_income: number | null;
  net_turnover: number | null;
  operating_cash_flow: number | null;
  total_assets: number | null;
  total_equities: number | null;
  equity: number | null;
  cash: number | null;
  current_liabilities: number | null;
  non_current_liabilities: number | null;
};

type ChartSeries = {
  label: string;
  color: string;
  values: Array<number | null>;
};

type CompanyFinancialInsightsProps = {
  companyName: string;
  statements: CompanyFinancialStatement[];
};

const chartWidth = 760;
const chartHeight = 260;
const chartPadding = { top: 20, right: 24, bottom: 48, left: 64 };

function currencySymbol(currency: string | null) {
  switch (currency) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'GBP':
      return '£';
    default:
      return currency ? `${currency} ` : '€';
  }
}

function formatCompactAmount(value: number | null, currency: string | null) {
  if (value === null || Number.isNaN(value)) {
    return 'n/a';
  }

  const absolute = Math.abs(value);
  const symbol = currencySymbol(currency);
  const sign = value < 0 ? '-' : '';
  const suffix = absolute >= 1_000_000_000 ? 'B' : absolute >= 1_000_000 ? 'M' : absolute >= 1_000 ? 'K' : '';
  const scaled = suffix === 'B' ? absolute / 1_000_000_000 : suffix === 'M' ? absolute / 1_000_000 : suffix === 'K' ? absolute / 1_000 : absolute;
  const precision = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;

  return `${sign}${symbol}${scaled.toFixed(precision)}${suffix}`;
}

function formatAmount(value: number | null, currency: string | null) {
  if (value === null || Number.isNaN(value)) {
    return 'n/a';
  }

  const code = currency && /^[A-Z]{3}$/.test(currency) ? currency : 'EUR';

  try {
    return new Intl.NumberFormat('lv-LV', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currencySymbol(currency)}${Math.round(value).toLocaleString('en-US')}`;
  }
}

function formatSignedPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return 'n/a';
  }

  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function makeUniqueAnnualStatements(statements: CompanyFinancialStatement[]) {
  const byYear = new Map<number, CompanyFinancialStatement>();

  [...statements]
    .sort((left, right) => right.year - left.year || right.id - left.id)
    .forEach((statement) => {
      if (!byYear.has(statement.year)) {
        byYear.set(statement.year, statement);
      }
    });

  return [...byYear.values()].sort((left, right) => left.year - right.year);
}

function getYears(statements: CompanyFinancialStatement[]) {
  return statements.map((statement) => statement.year);
}

function getValues(statements: CompanyFinancialStatement[], selector: (statement: CompanyFinancialStatement) => number | null) {
  return statements.map((statement) => selector(statement));
}

function getValueRange(series: ChartSeries[]) {
  const values = series.flatMap((entry) => entry.values.filter((value): value is number => value !== null && Number.isFinite(value)));

  if (values.length === 0) {
    return { min: 0, max: 1 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    const padding = Math.abs(max || 1) * 0.2 || 1;
    return { min: min - padding, max: max + padding };
  }

  const padding = (max - min) * 0.15;
  return { min: min - padding, max: max + padding };
}

function getX(index: number, total: number) {
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  if (total <= 1) {
    return chartPadding.left + innerWidth / 2;
  }

  return chartPadding.left + (innerWidth * index) / (total - 1);
}

function getY(value: number, range: { min: number; max: number }) {
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const safeRange = range.max - range.min || 1;
  const ratio = (value - range.min) / safeRange;

  return chartHeight - chartPadding.bottom - ratio * innerHeight;
}

function buildLinePath(values: Array<number | null>, range: { min: number; max: number }) {
  const points = values
    .map((value, index) => ({ value, index }))
    .filter((entry): entry is { value: number; index: number } => entry.value !== null && Number.isFinite(entry.value));

  if (points.length === 0) {
    return '';
  }

  return points
    .map((point, pointIndex) => {
      const x = getX(point.index, values.length);
      const y = getY(point.value, range);
      return `${pointIndex === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function buildBars(values: Array<number | null>, range: { min: number; max: number }) {
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const groupWidth = values.length > 0 ? innerWidth / values.length : innerWidth;
  const baseline = getY(Math.max(range.min, 0), range);

  return values.map((value, index) => {
    if (value === null || Number.isNaN(value)) {
      return null;
    }

    const x = chartPadding.left + groupWidth * index + groupWidth * 0.18;
    const width = groupWidth * 0.64;
    const y = getY(value, range);
    const height = Math.max(2, Math.abs(baseline - y));
    const top = value >= 0 ? y : baseline;

    return { x, width, y: top, height, value };
  });
}

function TrendChart({ title, subtitle, years, series }: { title: string; subtitle: string; years: number[]; series: ChartSeries[] }) {
  const range = getValueRange(series);
  const zeroY = range.min < 0 && range.max > 0 ? getY(0, range) : null;

  return (
    <section className="rounded-3xl border border-gray-700 bg-gray-900/80 p-6 shadow-[0_24px_80px_rgba(8,10,17,0.45)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-gray-400">{title}</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{subtitle}</h3>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          {series.map((entry) => (
            <div key={entry.label} className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-950/70 px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-700 bg-gray-950/70">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[18rem] w-full">
          {[0, 1, 2, 3, 4].map((step) => {
            const y = chartPadding.top + ((chartHeight - chartPadding.top - chartPadding.bottom) * step) / 4;
            return <line key={step} x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={y} y2={y} stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="4 8" />;
          })}

          {zeroY !== null ? (
            <line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={zeroY} y2={zeroY} stroke="rgba(251, 191, 36, 0.35)" strokeDasharray="8 6" />
          ) : null}

          {series.map((entry) => {
            const path = buildLinePath(entry.values, range);
            return path ? <path key={entry.label} d={path} fill="none" stroke={entry.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /> : null;
          })}

          {series.map((entry) =>
            entry.values.map((value, index) => {
              if (value === null || Number.isNaN(value)) {
                return null;
              }

              const x = getX(index, entry.values.length);
              const y = getY(value, range);

              return <circle key={`${entry.label}-${index}`} cx={x} cy={y} r="4" fill={entry.color} stroke="rgba(8, 10, 17, 0.9)" strokeWidth="2" />;
            }),
          )}

          {years.map((year, index) => {
            const x = getX(index, years.length);
            return (
              <text key={year} x={x} y={chartHeight - 18} textAnchor="middle" className="fill-gray-500 text-[12px]">
                {year}
              </text>
            );
          })}

          {[range.max, range.min].map((value, index) => (
            <text key={`${value}-${index}`} x={16} y={getY(value, range) + 4} className="fill-gray-500 text-[12px]">
              {formatCompactAmount(value, 'EUR')}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}

function CapitalChart({ years, statements }: { years: number[]; statements: CompanyFinancialStatement[] }) {
  const series: ChartSeries[] = [
    {
      label: 'Assets',
      color: '#7dd3fc',
      values: getValues(statements, (statement) => statement.total_assets),
    },
    {
      label: 'Equity',
      color: '#a78bfa',
      values: getValues(statements, (statement) => statement.total_equities ?? statement.equity),
    },
    {
      label: 'Cash',
      color: '#f59e0b',
      values: getValues(statements, (statement) => statement.cash),
    },
  ];
  const range = getValueRange(series);
  const barSeries = series.map((entry) => ({ ...entry, bars: buildBars(entry.values, range) }));

  return (
    <section className="rounded-3xl border border-gray-700 bg-gray-900/80 p-6 shadow-[0_24px_80px_rgba(8,10,17,0.45)]">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-gray-400">Balance sheet profile</p>
        <h3 className="mt-1 text-xl font-semibold text-white">Assets, equity, and cash position</h3>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-700 bg-gray-950/70">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[18rem] w-full">
          {[0, 1, 2, 3, 4].map((step) => {
            const y = chartPadding.top + ((chartHeight - chartPadding.top - chartPadding.bottom) * step) / 4;
            return <line key={step} x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={y} y2={y} stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="4 8" />;
          })}

          {barSeries.map((entry) =>
            entry.bars.map((bar, index) => {
              if (!bar) {
                return null;
              }

              return <rect key={`${entry.label}-${index}`} x={bar.x} y={bar.y} width={bar.width} height={bar.height} rx="10" fill={entry.color} opacity={0.85} />;
            }),
          )}

          {years.map((year, index) => {
            const x = getX(index, years.length);
            return (
              <text key={year} x={x} y={chartHeight - 18} textAnchor="middle" className="fill-gray-500 text-[12px]">
                {year}
              </text>
            );
          })}

          {[range.max, range.min].map((value, index) => (
            <text key={`${value}-${index}`} x={16} y={getY(value, range) + 4} className="fill-gray-500 text-[12px]">
              {formatCompactAmount(value, 'EUR')}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}

function MetricCard({ label, value, detail, tone = 'from-gray-800 to-gray-900' }: { label: string; value: string; detail?: string; tone?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-700 bg-gradient-to-br ${tone} p-5 shadow-[0_20px_60px_rgba(8,10,17,0.35)]`}>
      <p className="text-xs uppercase tracking-[0.22em] text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-gray-300">{detail}</p> : null}
    </div>
  );
}

export function CompanyFinancialInsights({ companyName, statements }: CompanyFinancialInsightsProps) {
  const annualStatements = useMemo(() => makeUniqueAnnualStatements(statements), [statements]);

  const latest = annualStatements.at(-1) ?? null;
  const previous = annualStatements.at(-2) ?? null;

  const years = getYears(annualStatements);
  const profitSeries: ChartSeries[] = [
    {
      label: 'Revenue',
      color: '#7dd3fc',
      values: getValues(annualStatements, (statement) => statement.net_turnover),
    },
    {
      label: 'Profit / Loss',
      color: '#f472b6',
      values: getValues(annualStatements, (statement) => statement.net_income),
    },
  ];

  const latestNetIncome = latest?.net_income ?? null;
  const previousNetIncome = previous?.net_income ?? null;
  const profitYoY = latestNetIncome !== null && previousNetIncome !== null && previousNetIncome !== 0
    ? ((latestNetIncome - previousNetIncome) / Math.abs(previousNetIncome)) * 100
    : null;
  const latestRevenue = latest?.net_turnover ?? null;
  const previousRevenue = previous?.net_turnover ?? null;
  const revenueYoY = latestRevenue !== null && previousRevenue !== null && previousRevenue !== 0
    ? ((latestRevenue - previousRevenue) / Math.abs(previousRevenue)) * 100
    : null;
  const latestAssets = latest?.total_assets ?? null;
  const latestEquity = latest?.total_equities ?? latest?.equity ?? null;
  const equityRatio = latestAssets && latestAssets !== 0 && latestEquity !== null ? (latestEquity / latestAssets) * 100 : null;
  const latestCash = latest?.cash ?? null;
  const latestOperatingCashFlow = latest?.operating_cash_flow ?? null;

  if (annualStatements.length === 0) {
    return (
      <section className="rounded-3xl border border-gray-700 bg-gray-900/80 p-6 text-gray-300">
        <p className="text-sm uppercase tracking-[0.22em] text-gray-400">Financial analytics</p>
        <h3 className="mt-2 text-xl font-semibold text-white">No financial statements found for {companyName}</h3>
        <p className="mt-3 leading-7 text-gray-300">Once Latvia filings are linked to this company, this area will show trends, ratios, and the full annual history.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-gray-700 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 p-6 shadow-[0_24px_80px_rgba(8,10,17,0.45)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-gray-400">Financial analytics</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Profit / loss, revenue, and capital trends for {companyName}</h3>
          </div>
          <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
            Latest year: {latest?.year ?? 'n/a'}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Latest profit / loss"
            value={formatAmount(latestNetIncome, latest?.currency)}
            detail={profitYoY === null ? 'Not enough history for YoY comparison.' : `YoY change: ${formatSignedPercent(profitYoY)}`}
            tone={latestNetIncome !== null && latestNetIncome < 0 ? 'from-red-950 to-gray-900' : 'from-emerald-950 to-gray-900'}
          />
          <MetricCard
            label="Latest revenue"
            value={formatAmount(latestRevenue, latest?.currency)}
            detail={revenueYoY === null ? 'Revenue YoY comparison is unavailable.' : `YoY change: ${formatSignedPercent(revenueYoY)}`}
            tone="from-sky-950 to-gray-900"
          />
          <MetricCard
            label="Latest assets"
            value={formatAmount(latestAssets, latest?.currency)}
            detail={latestCash === null ? 'Cash position unavailable.' : `Cash on hand: ${formatAmount(latestCash, latest?.currency)}`}
            tone="from-indigo-950 to-gray-900"
          />
          <MetricCard
            label="Equity ratio"
            value={formatSignedPercent(equityRatio)}
            detail={latestOperatingCashFlow === null ? 'Operating cash flow unavailable.' : `Operating cash flow: ${formatAmount(latestOperatingCashFlow, latest?.currency)}`}
            tone="from-violet-950 to-gray-900"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendChart
          title="Income statement trend"
          subtitle="Revenue and profit / loss across the latest filing years"
          years={years}
          series={profitSeries}
        />

        <CapitalChart years={years} statements={annualStatements} />
      </div>

      <section className="rounded-3xl border border-gray-700 bg-gray-900/80 p-6 shadow-[0_24px_80px_rgba(8,10,17,0.35)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-gray-400">Annual snapshot</p>
            <h3 className="mt-1 text-xl font-semibold text-white">The latest filing years at a glance</h3>
          </div>
          <p className="text-sm text-gray-400">Sorted oldest to newest for easier trend reading.</p>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead className="bg-gray-950/60 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Year</th>
                <th className="px-4 py-3 text-right font-medium">Revenue</th>
                <th className="px-4 py-3 text-right font-medium">Profit / loss</th>
                <th className="px-4 py-3 text-right font-medium">Assets</th>
                <th className="px-4 py-3 text-right font-medium">Equity</th>
                <th className="px-4 py-3 text-right font-medium">Cash</th>
                <th className="px-4 py-3 text-right font-medium">Employees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900/40 text-gray-200">
              {annualStatements.map((statement) => (
                <tr key={statement.id} className="transition hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-semibold text-white">{statement.year}</td>
                  <td className="px-4 py-3 text-right">{formatAmount(statement.net_turnover, statement.currency)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${statement.net_income !== null && statement.net_income < 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                    {formatAmount(statement.net_income, statement.currency)}
                  </td>
                  <td className="px-4 py-3 text-right">{formatAmount(statement.total_assets, statement.currency)}</td>
                  <td className="px-4 py-3 text-right">{formatAmount(statement.total_equities ?? statement.equity, statement.currency)}</td>
                  <td className="px-4 py-3 text-right">{formatAmount(statement.cash, statement.currency)}</td>
                  <td className="px-4 py-3 text-right">{statement.employees ?? 'n/a'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}