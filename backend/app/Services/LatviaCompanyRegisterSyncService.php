<?php

namespace App\Services;

use App\Models\DataSyncState;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class LatviaCompanyRegisterSyncService
{
    private const SOURCE_KEY = 'latvia_company_register';

    private const SOURCE_URL = 'https://data.gov.lv/dati/dataset/4de9697f-850b-45ec-8bba-61fa09ce932f/resource/25e80bf3-f107-4ab4-89ef-251b5b9374e9/download/register.csv';

    public function __construct(
        private readonly CompanyImportService $importService,
    ) {
    }

    /**
     * Sync the public Latvia company register feed into the local database.
     *
     * @return array<string, mixed>
     */
    public function sync(bool $force = false): array
    {
        $response = Http::accept('text/csv')
            ->timeout(120)
            ->retry(3, 2_000)
            ->get(self::SOURCE_URL);

        if (! $response->successful()) {
            throw new RuntimeException('Unable to download the Latvia company register feed.');
        }

        $content = $response->body();
        $contentHash = hash('sha256', $content);
        $state = DataSyncState::query()->firstOrNew(['source_key' => self::SOURCE_KEY]);

        if (! $force && $state->exists && $state->content_hash === $contentHash) {
            return [
                'status' => 'unchanged',
                'source_key' => self::SOURCE_KEY,
                'source_url' => self::SOURCE_URL,
                'total' => 0,
                'created' => 0,
                'updated' => 0,
                'failed' => 0,
                'errors' => [],
            ];
        }

        $companies = $this->parseCompanies($content);
        $result = $this->importService->importCompanies($companies, [
            'batch_size' => 1_000,
            'skip_errors' => true,
            'upsert' => true,
        ]);

        $state->source_key = self::SOURCE_KEY;
        $state->content_hash = $contentHash;
        $state->record_count = count($companies);
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

        return [
            'status' => 'updated',
            'source_key' => self::SOURCE_KEY,
            'source_url' => self::SOURCE_URL,
            'content_hash' => $contentHash,
            'record_count' => count($companies),
        ] + $result;
    }

    /**
     * Parse the remote CSV into normalized company records.
     *
     * @return array<int, array<string, mixed>>
     */
    private function parseCompanies(string $csv): array
    {
        $lines = preg_split('/\r\n|\n|\r/', trim($csv)) ?: [];

        if ($lines === []) {
            return [];
        }

        $headers = str_getcsv(array_shift($lines), ';');
        $companies = [];

        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }

            $row = str_getcsv($line, ';');
            if (count($row) < count($headers)) {
                $row = array_pad($row, count($headers), '');
            }

            $record = array_combine($headers, array_slice($row, 0, count($headers)));
            if (! is_array($record)) {
                continue;
            }

            $normalized = $this->normalizeRecord($record);
            if ($normalized !== null) {
                $companies[] = $normalized;
            }
        }

        return $companies;
    }

    /**
     * Normalize a single CSV row into the application company shape.
     *
     * @param array<string, string> $record
     * @return array<string, mixed>|null
     */
    private function normalizeRecord(array $record): ?array
    {
        $registrationNumber = trim((string) ($record['regcode'] ?? ''));
        $name = trim((string) ($record['name'] ?? ''));

        if ($registrationNumber === '' || $name === '') {
            return null;
        }

        $terminatedAt = $this->normalizeDate($record['terminated'] ?? null);
        $closed = trim((string) ($record['closed'] ?? ''));

        return array_filter([
            'registration_number' => $registrationNumber,
            'name' => $name,
            'status' => $terminatedAt !== null
                ? 'terminated'
                : ($closed !== '' ? 'closed' : 'active'),
            'registered_at' => $this->normalizeDate($record['registered'] ?? null),
            'address' => trim((string) ($record['address'] ?? '')) ?: null,
        ], static fn ($value) => $value !== null && $value !== '');
    }

    private function normalizeDate(mixed $value): ?string
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
}
