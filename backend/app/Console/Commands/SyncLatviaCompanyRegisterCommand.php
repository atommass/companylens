<?php

namespace App\Console\Commands;

use App\Services\LatviaCompanyRegisterSyncService;
use Illuminate\Console\Command;

class SyncLatviaCompanyRegisterCommand extends Command
{
    protected $signature = 'companies:sync-latvia-register {--force : Import even if the remote CSV has not changed}';

    protected $description = 'Synchronize the Latvia company register CSV into the local database';

    public function handle(LatviaCompanyRegisterSyncService $service): int
    {
        try {
            $result = $service->sync((bool) $this->option('force'));

            if (($result['status'] ?? null) === 'unchanged') {
                $this->info('Latvia company register unchanged; no import needed.');
                return self::SUCCESS;
            }

            $this->info('Latvia company register synced successfully.');
            $this->line('  Records: ' . $result['record_count']);
            $this->line('  Created:  ' . $result['created']);
            $this->line('  Updated:  ' . $result['updated']);
            $this->line('  Failed:   ' . $result['failed']);

            if (! empty($result['errors'])) {
                $this->warn('Some records failed to import.');
            }

            return ($result['failed'] ?? 0) > 0 ? self::FAILURE : self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Latvia company register sync failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
