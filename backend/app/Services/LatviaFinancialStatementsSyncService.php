<?php

namespace App\Services;

use App\Models\BalanceSheet;
use App\Models\CashFlowStatement;
use App\Models\DataSyncState;
use App\Models\FinancialStatement;
use App\Models\IncomeStatement;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class LatviaFinancialStatementsSyncService
{
    private const SOURCES = [
        [
            'key' => 'latvia_balance_sheets',
            'url' => 'https://data.gov.lv/dati/datastore/dump/50ef4f26-f410-4007-b296-22043ca3dc43?bom=True',
            'table' => 'balance_sheets',
        ],
        [
            'key' => 'latvia_income_statements',
            'url' => 'https://data.gov.lv/dati/datastore/dump/d5fd17ef-d32e-40cb-8399-82b780095af0?bom=True',
            'table' => 'income_statements',
        ],
        [
            'key' => 'latvia_cash_flow_statements',
            'url' => 'https://data.gov.lv/dati/datastore/dump/1a11fc29-ba7c-4e5a-8edc-7a28cea24988?bom=True',
            'table' => 'cash_flow_statements',
        ],
        [
            'key' => 'latvia_financial_statements',
            'url' => 'https://data.gov.lv/dati/datastore/dump/27fcc5ec-c63b-4bfd-bb08-01f073a52d04?bom=True',
            'table' => 'financial_statements',
        ],
    ];

    /**
     * Sync the Latvia yearly financial statement feeds into the database.
     *
     * @return array<string, mixed>
     */
    public function sync(bool $force = false): array
    {
        $totals = [
            'created' => 0,
            'updated' => 0,
            'failed' => 0,
            'errors' => [],
            'record_count' => 0,
            'sources' => [],
        ];

        $anyUpdated = false;

        foreach (self::SOURCES as $source) {
            $response = Http::accept('text/csv')
                ->timeout(900)
                ->retry(3, 2_000)
                ->get($source['url']);

            if (! $response->successful()) {
                throw new RuntimeException('Unable to download financial feed: ' . $source['url']);
            }

            $content = $response->body();
            $contentHash = hash('sha256', $content);
            $state = DataSyncState::query()->firstOrNew(['source_key' => $source['key']]);

            if (! $force && $state->exists && $state->content_hash === $contentHash) {
                $totals['sources'][] = [
                    'source_key' => $source['key'],
                    'source_url' => $source['url'],
                    'status' => 'unchanged',
                    'record_count' => $state->record_count,
                ];

                continue;
            }

            $records = $this->parseCsv($content);
            $result = $this->importSource($source['table'], $records);

            $state->source_key = $source['key'];
            $state->content_hash = $contentHash;
            $state->record_count = count($records);
            $state->last_synced_at = now();

            $lastModified = $response->header('Last-Modified');
            if ($lastModified) {
                try {
                    $state->source_last_modified_at = Carbon::parse($lastModified);
                } catch (\Throwable) {
                    // Ignore malformed upstream timestamps.
                }
            }

            $state->save();

            $anyUpdated = true;
            $totals['created'] += $result['created'];
            $totals['updated'] += $result['updated'];
            $totals['failed'] += $result['failed'];
            $totals['errors'] = array_merge($totals['errors'], $result['errors']);
            $totals['record_count'] += $result['total'];
            $totals['sources'][] = [
                'source_key' => $source['key'],
                'source_url' => $source['url'],
                'status' => 'updated',
                'record_count' => count($records),
            ];
        }

        return [
            'status' => $anyUpdated ? 'updated' : 'unchanged',
        ] + $totals;
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function parseCsv(string $csv): array
    {
        $lines = preg_split('/\r\n|\n|\r/', trim($csv)) ?: [];

        if ($lines === []) {
            return [];
        }

        $rawHeader = array_shift($lines);
        $delimiter = strpos($rawHeader, ';') !== false ? ';' : ',';
        $headers = str_getcsv($rawHeader, $delimiter);
        if (isset($headers[0])) {
            $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', $headers[0]) ?? $headers[0];
        }

        $records = [];

        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }

            $row = str_getcsv($line, $delimiter);
            if (count($row) < count($headers)) {
                $row = array_pad($row, count($headers), '');
            }

            $record = array_combine($headers, array_slice($row, 0, count($headers)));
            if (is_array($record)) {
                $records[] = $record;
            }
        }

        return $records;
    }

    /**
     * @param array<int, array<string, string>> $records
     * @return array<string, mixed>
     */
    private function importSource(string $table, array $records): array
    {
        return DB::transaction(function () use ($table, $records): array {
            return match ($table) {
                'financial_statements' => $this->importFinancialStatements($records),
                'balance_sheets' => $this->importBalanceSheets($records),
                'income_statements' => $this->importIncomeStatements($records),
                'cash_flow_statements' => $this->importCashFlowStatements($records),
                default => throw new RuntimeException('Unsupported financial feed: ' . $table),
            };
        });
    }

    /**
     * @param array<int, array<string, string>> $records
     * @return array<string, mixed>
     */
    private function importFinancialStatements(array $records): array
    {
        $rows = [];

        foreach ($records as $record) {
            $id = $this->integerValue($record['id'] ?? null);
            $registrationNumber = $this->stringValue($record['legal_entity_registration_number'] ?? null);

            if ($id === null || $registrationNumber === null) {
                continue;
            }

            $rows[] = [
                'id' => $id,
                'file_id' => $this->integerValue($record['file_id'] ?? null),
                'legal_entity_registration_number' => $registrationNumber,
                'source_schema' => $this->stringValue($record['source_schema'] ?? null),
                'source_type' => $this->stringValue($record['source_type'] ?? null),
                'year' => $this->integerValue($record['year'] ?? null),
                'year_started_on' => $this->dateValue($record['year_started_on'] ?? null),
                'year_ended_on' => $this->dateValue($record['year_ended_on'] ?? null),
                'employees' => $this->integerValue($record['employees'] ?? null),
                'rounded_to_nearest' => $this->stringValue($record['rounded_to_nearest'] ?? null),
                'currency' => $this->stringValue($record['currency'] ?? null),
                'created_at' => $this->dateTimeValue($record['created_at'] ?? null),
            ];
        }

        if ($rows === []) {
            return ['created' => 0, 'updated' => 0, 'failed' => 0, 'errors' => [], 'total' => 0];
        }

        $ids = array_column($rows, 'id');
        $existingIds = FinancialStatement::query()
            ->whereIn('id', $ids)
            ->pluck('id')
            ->all();
        $existingIdLookup = array_fill_keys($existingIds, true);
        $created = count(array_filter($ids, static fn ($id) => ! isset($existingIdLookup[$id])));
        $updated = count($rows) - $created;

        FinancialStatement::upsert(
            $rows,
            ['id'],
            ['file_id', 'legal_entity_registration_number', 'source_schema', 'source_type', 'year', 'year_started_on', 'year_ended_on', 'employees', 'rounded_to_nearest', 'currency', 'created_at']
        );

        return ['created' => $created, 'updated' => $updated, 'failed' => 0, 'errors' => [], 'total' => count($rows)];
    }

    /**
     * @param array<int, array<string, string>> $records
     * @return array<string, mixed>
     */
    private function importBalanceSheets(array $records): array
    {
        $rows = [];

        foreach ($records as $record) {
            $statementId = $this->integerValue($record['statement_id'] ?? null);

            if ($statementId === null) {
                continue;
            }

            $rows[] = [
                'statement_id' => $statementId,
                'file_id' => $this->integerValue($record['file_id'] ?? null),
                'cash' => $this->integerValue($record['cash'] ?? null),
                'marketable_securities' => $this->integerValue($record['marketable_securities'] ?? null),
                'accounts_receivable' => $this->integerValue($record['accounts_receivable'] ?? null),
                'inventories' => $this->integerValue($record['inventories'] ?? null),
                'total_current_assets' => $this->integerValue($record['total_current_assets'] ?? null),
                'investments' => $this->integerValue($record['investments'] ?? null),
                'fixed_assets' => $this->integerValue($record['fixed_assets'] ?? null),
                'intangible_assets' => $this->integerValue($record['intangible_assets'] ?? null),
                'total_non_current_assets' => $this->integerValue($record['total_non_current_assets'] ?? null),
                'total_assets' => $this->integerValue($record['total_assets'] ?? null),
                'future_housing_repairs_payments' => $this->integerValue($record['future_housing_repairs_payments'] ?? null),
                'current_liabilities' => $this->integerValue($record['current_liabilities'] ?? null),
                'non_current_liabilities' => $this->integerValue($record['non_current_liabilities'] ?? null),
                'provisions' => $this->integerValue($record['provisions'] ?? null),
                'equity' => $this->integerValue($record['equity'] ?? null),
                'total_equities' => $this->integerValue($record['total_equities'] ?? null),
            ];
        }

        if ($rows === []) {
            return ['created' => 0, 'updated' => 0, 'failed' => 0, 'errors' => [], 'total' => 0];
        }

        $statementIds = array_column($rows, 'statement_id');
        $existingStatementIds = BalanceSheet::query()
            ->whereIn('statement_id', $statementIds)
            ->pluck('statement_id')
            ->all();
        $existingLookup = array_fill_keys($existingStatementIds, true);
        $created = count(array_filter($statementIds, static fn ($statementId) => ! isset($existingLookup[$statementId])));
        $updated = count($rows) - $created;

        BalanceSheet::upsert(
            $rows,
            ['statement_id'],
            ['file_id', 'cash', 'marketable_securities', 'accounts_receivable', 'inventories', 'total_current_assets', 'investments', 'fixed_assets', 'intangible_assets', 'total_non_current_assets', 'total_assets', 'future_housing_repairs_payments', 'current_liabilities', 'non_current_liabilities', 'provisions', 'equity', 'total_equities']
        );

        return ['created' => $created, 'updated' => $updated, 'failed' => 0, 'errors' => [], 'total' => count($rows)];
    }

    /**
     * @param array<int, array<string, string>> $records
     * @return array<string, mixed>
     */
    private function importIncomeStatements(array $records): array
    {
        $rows = [];

        foreach ($records as $record) {
            $statementId = $this->integerValue($record['statement_id'] ?? null);

            if ($statementId === null) {
                continue;
            }

            $rows[] = [
                'statement_id' => $statementId,
                'file_id' => $this->integerValue($record['file_id'] ?? null),
                'net_turnover' => $this->integerValue($record['net_turnover'] ?? null),
                'by_nature_inventory_change' => $this->integerValue($record['by_nature_inventory_change'] ?? null),
                'by_nature_long_term_investment_expenses' => $this->integerValue($record['by_nature_long_term_investment_expenses'] ?? null),
                'by_nature_other_operating_revenues' => $this->integerValue($record['by_nature_other_operating_revenues'] ?? null),
                'by_nature_material_expenses' => $this->integerValue($record['by_nature_material_expenses'] ?? null),
                'by_nature_labour_expenses' => $this->integerValue($record['by_nature_labour_expenses'] ?? null),
                'by_nature_depreciation_expenses' => $this->integerValue($record['by_nature_depreciation_expenses'] ?? null),
                'by_function_cost_of_goods_sold' => $this->integerValue($record['by_function_cost_of_goods_sold'] ?? null),
                'by_function_gross_profit' => $this->integerValue($record['by_function_gross_profit'] ?? null),
                'by_function_selling_expenses' => $this->integerValue($record['by_function_selling_expenses'] ?? null),
                'by_function_administrative_expenses' => $this->integerValue($record['by_function_administrative_expenses'] ?? null),
                'by_function_other_operating_revenues' => $this->integerValue($record['by_function_other_operating_revenues'] ?? null),
                'other_operating_expenses' => $this->integerValue($record['other_operating_expenses'] ?? null),
                'equity_investment_earnings' => $this->integerValue($record['equity_investment_earnings'] ?? null),
                'other_long_term_investment_earnings' => $this->integerValue($record['other_long_term_investment_earnings'] ?? null),
                'other_interest_revenues' => $this->integerValue($record['other_interest_revenues'] ?? null),
                'investment_fair_value_adjustments' => $this->integerValue($record['investment_fair_value_adjustments'] ?? null),
                'interest_expenses' => $this->integerValue($record['interest_expenses'] ?? null),
                'extra_revenues' => $this->integerValue($record['extra_revenues'] ?? null),
                'extra_expenses' => $this->integerValue($record['extra_expenses'] ?? null),
                'income_before_income_taxes' => $this->integerValue($record['income_before_income_taxes'] ?? null),
                'provision_for_income_taxes' => $this->integerValue($record['provision_for_income_taxes'] ?? null),
                'income_after_income_taxes' => $this->integerValue($record['income_after_income_taxes'] ?? null),
                'other_taxes' => $this->integerValue($record['other_taxes'] ?? null),
                'extra_dividends' => $this->integerValue($record['extra_dividends'] ?? null),
                'net_income' => $this->integerValue($record['net_income'] ?? null),
            ];
        }

        if ($rows === []) {
            return ['created' => 0, 'updated' => 0, 'failed' => 0, 'errors' => [], 'total' => 0];
        }

        $statementIds = array_column($rows, 'statement_id');
        $existingStatementIds = IncomeStatement::query()
            ->whereIn('statement_id', $statementIds)
            ->pluck('statement_id')
            ->all();
        $existingLookup = array_fill_keys($existingStatementIds, true);
        $created = count(array_filter($statementIds, static fn ($statementId) => ! isset($existingLookup[$statementId])));
        $updated = count($rows) - $created;

        IncomeStatement::upsert(
            $rows,
            ['statement_id'],
            ['file_id', 'net_turnover', 'by_nature_inventory_change', 'by_nature_long_term_investment_expenses', 'by_nature_other_operating_revenues', 'by_nature_material_expenses', 'by_nature_labour_expenses', 'by_nature_depreciation_expenses', 'by_function_cost_of_goods_sold', 'by_function_gross_profit', 'by_function_selling_expenses', 'by_function_administrative_expenses', 'by_function_other_operating_revenues', 'other_operating_expenses', 'equity_investment_earnings', 'other_long_term_investment_earnings', 'other_interest_revenues', 'investment_fair_value_adjustments', 'interest_expenses', 'extra_revenues', 'extra_expenses', 'income_before_income_taxes', 'provision_for_income_taxes', 'income_after_income_taxes', 'other_taxes', 'extra_dividends', 'net_income']
        );

        return ['created' => $created, 'updated' => $updated, 'failed' => 0, 'errors' => [], 'total' => count($rows)];
    }

    /**
     * @param array<int, array<string, string>> $records
     * @return array<string, mixed>
     */
    private function importCashFlowStatements(array $records): array
    {
        $rows = [];

        foreach ($records as $record) {
            $statementId = $this->integerValue($record['statement_id'] ?? null);

            if ($statementId === null) {
                continue;
            }

            $rows[] = [
                'statement_id' => $statementId,
                'file_id' => $this->integerValue($record['file_id'] ?? null),
                'cfo_dm_cash_received_from_customers' => $this->integerValue($record['cfo_dm_cash_received_from_customers'] ?? null),
                'cfo_dm_cash_paid_to_suppliers_employees' => $this->integerValue($record['cfo_dm_cash_paid_to_suppliers_employees'] ?? null),
                'cfo_dm_other_cash_received_paid' => $this->integerValue($record['cfo_dm_other_cash_received_paid'] ?? null),
                'cfo_dm_operating_cash_flow' => $this->integerValue($record['cfo_dm_operating_cash_flow'] ?? null),
                'cfo_dm_interest_paid' => $this->integerValue($record['cfo_dm_interest_paid'] ?? null),
                'cfo_dm_income_taxes_paid' => $this->integerValue($record['cfo_dm_income_taxes_paid'] ?? null),
                'cfo_dm_extra_items_cash_flow' => $this->integerValue($record['cfo_dm_extra_items_cash_flow'] ?? null),
                'cfo_dm_net_operating_cash_flow' => $this->integerValue($record['cfo_dm_net_operating_cash_flow'] ?? null),
                'cfo_im_income_before_income_taxes' => $this->integerValue($record['cfo_im_income_before_income_taxes'] ?? null),
                'cfo_im_income_before_changes_in_working_capital' => $this->integerValue($record['cfo_im_income_before_changes_in_working_capital'] ?? null),
                'cfo_im_operating_cash_flow' => $this->integerValue($record['cfo_im_operating_cash_flow'] ?? null),
                'cfo_im_interest_paid' => $this->integerValue($record['cfo_im_interest_paid'] ?? null),
                'cfo_im_income_taxes_paid' => $this->integerValue($record['cfo_im_income_taxes_paid'] ?? null),
                'cfo_im_extra_items_cash_flow' => $this->integerValue($record['cfo_im_extra_items_cash_flow'] ?? null),
                'cfo_im_net_operating_cash_flow' => $this->integerValue($record['cfo_im_net_operating_cash_flow'] ?? null),
                'cfi_acquisition_of_stocks_shares' => $this->integerValue($record['cfi_acquisition_of_stocks_shares'] ?? null),
                'cfi_sale_proceeds_from_stocks_shares' => $this->integerValue($record['cfi_sale_proceeds_from_stocks_shares'] ?? null),
                'cfi_acquisition_of_fixed_assets_intangible_assets' => $this->integerValue($record['cfi_acquisition_of_fixed_assets_intangible_assets'] ?? null),
                'cfi_sale_proceeds_from_fixed_assets_intangible_assets' => $this->integerValue($record['cfi_sale_proceeds_from_fixed_assets_intangible_assets'] ?? null),
                'cfi_loans_made' => $this->integerValue($record['cfi_loans_made'] ?? null),
                'cfi_repayments_of_loans_received' => $this->integerValue($record['cfi_repayments_of_loans_received'] ?? null),
                'cfi_interest_received' => $this->integerValue($record['cfi_interest_received'] ?? null),
                'cfi_dividends_received' => $this->integerValue($record['cfi_dividends_received'] ?? null),
                'cfi_net_investing_cash_flow' => $this->integerValue($record['cfi_net_investing_cash_flow'] ?? null),
                'cff_proceeds_from_stocks_bonds_issuance_or_contributed_capital' => $this->integerValue($record['cff_proceeds_from_stocks_bonds_issuance_or_contributed_capital'] ?? null),
                'cff_loans_received' => $this->integerValue($record['cff_loans_received'] ?? null),
                'cff_subsidies_grants_donations_received' => $this->integerValue($record['cff_subsidies_grants_donations_received'] ?? null),
                'cff_repayments_of_loans_made' => $this->integerValue($record['cff_repayments_of_loans_made'] ?? null),
                'cff_repayments_of_lease_obligations' => $this->integerValue($record['cff_repayments_of_lease_obligations'] ?? null),
                'cff_dividends_paid' => $this->integerValue($record['cff_dividends_paid'] ?? null),
                'cff_net_financing_cash_flow' => $this->integerValue($record['cff_net_financing_cash_flow'] ?? null),
                'effect_of_exchange_rate_change' => $this->integerValue($record['effect_of_exchange_rate_change'] ?? null),
                'net_increase' => $this->integerValue($record['net_increase'] ?? null),
                'at_beginning_of_year' => $this->integerValue($record['at_beginning_of_year'] ?? null),
                'at_end_of_year' => $this->integerValue($record['at_end_of_year'] ?? null),
            ];
        }

        if ($rows === []) {
            return ['created' => 0, 'updated' => 0, 'failed' => 0, 'errors' => [], 'total' => 0];
        }

        $statementIds = array_column($rows, 'statement_id');
        $existingStatementIds = CashFlowStatement::query()
            ->whereIn('statement_id', $statementIds)
            ->pluck('statement_id')
            ->all();
        $existingLookup = array_fill_keys($existingStatementIds, true);
        $created = count(array_filter($statementIds, static fn ($statementId) => ! isset($existingLookup[$statementId])));
        $updated = count($rows) - $created;

        CashFlowStatement::upsert(
            $rows,
            ['statement_id'],
            ['file_id', 'cfo_dm_cash_received_from_customers', 'cfo_dm_cash_paid_to_suppliers_employees', 'cfo_dm_other_cash_received_paid', 'cfo_dm_operating_cash_flow', 'cfo_dm_interest_paid', 'cfo_dm_income_taxes_paid', 'cfo_dm_extra_items_cash_flow', 'cfo_dm_net_operating_cash_flow', 'cfo_im_income_before_income_taxes', 'cfo_im_income_before_changes_in_working_capital', 'cfo_im_operating_cash_flow', 'cfo_im_interest_paid', 'cfo_im_income_taxes_paid', 'cfo_im_extra_items_cash_flow', 'cfo_im_net_operating_cash_flow', 'cfi_acquisition_of_stocks_shares', 'cfi_sale_proceeds_from_stocks_shares', 'cfi_acquisition_of_fixed_assets_intangible_assets', 'cfi_sale_proceeds_from_fixed_assets_intangible_assets', 'cfi_loans_made', 'cfi_repayments_of_loans_received', 'cfi_interest_received', 'cfi_dividends_received', 'cfi_net_investing_cash_flow', 'cff_proceeds_from_stocks_bonds_issuance_or_contributed_capital', 'cff_loans_received', 'cff_subsidies_grants_donations_received', 'cff_repayments_of_loans_made', 'cff_repayments_of_lease_obligations', 'cff_dividends_paid', 'cff_net_financing_cash_flow', 'effect_of_exchange_rate_change', 'net_increase', 'at_beginning_of_year', 'at_end_of_year']
        );

        return ['created' => $created, 'updated' => $updated, 'failed' => 0, 'errors' => [], 'total' => count($rows)];
    }

    private function integerValue(mixed $value): ?int
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }

    private function stringValue(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function dateValue(mixed $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }

    private function dateTimeValue(mixed $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        try {
            return Carbon::parse($value)->toDateTimeString();
        } catch (\Throwable) {
            return null;
        }
    }
}