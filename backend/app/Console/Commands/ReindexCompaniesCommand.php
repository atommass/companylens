<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Services\OpenSearchCompanyService;
use Illuminate\Console\Command;

class ReindexCompaniesCommand extends Command
{
    protected $signature = 'opensearch:reindex-companies {--chunk=250 : Number of records to process per batch}';

    protected $description = 'Reindex all companies into OpenSearch';

    public function handle(OpenSearchCompanyService $searchService): int
    {
        $chunkSize = max(1, (int) $this->option('chunk'));
        $processed = 0;
        $failed = 0;

        Company::query()
            ->with(['industry', 'region'])
            ->orderBy('id')
            ->chunkById($chunkSize, function ($companies) use ($searchService, &$processed, &$failed) {
                foreach ($companies as $company) {
                    try {
                        $searchService->indexCompany($company);
                        $processed++;
                    } catch (\Throwable) {
                        $failed++;
                    }
                }
            });

        $this->info("Reindexed {$processed} companies.");

        if ($failed > 0) {
            $this->warn("{$failed} companies failed to index.");
        }

        return self::SUCCESS;
    }
}
