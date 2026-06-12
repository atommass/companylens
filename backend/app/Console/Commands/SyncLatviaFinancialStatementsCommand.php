<?php

namespace App\Console\Commands;

use App\Services\LatviaFinancialStatementsSyncService;
use Illuminate\Console\Command;

class SyncLatviaFinancialStatementsCommand extends Command
{
    protected $signature = 'financials:sync-latvia {--force : Import even if the remote CSVs have not changed}';

    protected $description = 'Synchronize Latvia yearly financial statement CSV feeds into the local database';

    public function handle(LatviaFinancialStatementsSyncService $service): int
    {
        try {
            $result = $service->sync((bool) $this->option('force'));

            if (($result['status'] ?? null) === 'unchanged') {
                $this->info('Latvia financial statement feeds unchanged; no import needed.');
                return self::SUCCESS;
            }

            $this->info('Latvia financial statement feeds synced successfully.');
            $this->line('  Records: ' . $result['record_count']);
            $this->line('  Created:  ' . $result['created']);
            $this->line('  Updated:  ' . $result['updated']);
            $this->line('  Failed:   ' . $result['failed']);

            if (! empty($result['errors'])) {
                $this->warn('Some records failed to import.');
            }

            return ($result['failed'] ?? 0) > 0 ? self::FAILURE : self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Latvia financial statement sync failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}