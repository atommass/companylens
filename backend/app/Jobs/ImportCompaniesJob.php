<?php

namespace App\Jobs;

use App\Services\CompanyImportService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ImportCompaniesJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected array $companies,
        protected array $options = [],
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(CompanyImportService $service): void
    {
        $result = $service->importCompanies($this->companies, $this->options);

        \Log::info('Company import completed', $result);
    }
}
