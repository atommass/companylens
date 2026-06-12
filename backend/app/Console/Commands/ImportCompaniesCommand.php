<?php

namespace App\Console\Commands;

use App\Jobs\ImportCompaniesJob;
use App\Services\CompanyImportService;
use Illuminate\Console\Command;
use SplFileObject;

class ImportCompaniesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'companies:import 
                            {file : Path to CSV or JSON file with company data}
                            {--format=csv : File format (csv or json)}
                            {--async : Queue the import job instead of running synchronously}
                            {--batch-size=500 : Number of records per batch}
                            {--skip-errors : Continue on import errors}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import companies from CSV or JSON file';

    /**
     * Execute the console command.
     */
    public function handle(CompanyImportService $service): int
    {
        $filePath = $this->argument('file');
        $format = $this->option('format');
        $async = $this->option('async');
        $batchSize = (int) $this->option('batch-size');
        $skipErrors = $this->option('skip-errors');

        if (! file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return self::FAILURE;
        }

        try {
            $companies = $this->parseFile($filePath, $format);

            if (empty($companies)) {
                $this->warn('No companies found in file');
                return self::SUCCESS;
            }

            $count = count($companies);
            $this->info("Loaded {$count} companies from {$filePath}");

            $options = [
                'batch_size' => $batchSize,
                'skip_errors' => $skipErrors,
                'upsert' => true,
            ];

            if ($async) {
                ImportCompaniesJob::dispatch($companies, $options);
                $this->info('Import job queued for async processing');
                return self::SUCCESS;
            }

            $this->info('Starting import...');
            $result = $service->importCompanies($companies, $options);

            $this->displayResults($result);

            return $result['failed'] > 0 ? self::FAILURE : self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Import failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }

    /**
     * Parse CSV or JSON file.
     */
    private function parseFile(string $filePath, string $format): array
    {
        return match ($format) {
            'csv' => $this->parseCSV($filePath),
            'json' => $this->parseJSON($filePath),
            default => throw new \InvalidArgumentException("Unsupported format: {$format}"),
        };
    }

    /**
     * Parse CSV file.
     */
    private function parseCSV(string $filePath): array
    {
        $companies = [];
        $file = new SplFileObject($filePath, 'r');
        $file->setFlags(SplFileObject::READ_CSV);

        $headers = null;

        foreach ($file as $row) {
            if ($headers === null) {
                $headers = $row;
                continue;
            }

            if (empty($row[0])) {
                continue;
            }

            $company = array_combine($headers, $row);
            if ($company !== false && ! empty($company['name'])) {
                $companies[] = array_filter($company, fn ($v) => $v !== '');
            }
        }

        return $companies;
    }

    /**
     * Parse JSON file.
     */
    private function parseJSON(string $filePath): array
    {
        $content = file_get_contents($filePath);
        $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

        return is_array($data) ? $data : [];
    }

    /**
     * Display import results.
     */
    private function displayResults(array $result): void
    {
        $this->newLine();
        $this->info('Import Results:');
        $this->line("  Created:  <info>{$result['created']}</info>");
        $this->line("  Updated:  <comment>{$result['updated']}</comment>");
        $this->line("  Failed:   <error>{$result['failed']}</error>");
        $this->line("  Total:    {$result['total']}");

        if (! empty($result['errors'])) {
            $this->newLine();
            $this->warn('Errors:');
            foreach (array_slice($result['errors'], 0, 5) as $error) {
                $this->line("  - {$error['error']}");
            }

            if (count($result['errors']) > 5) {
                $this->line("  ... and " . (count($result['errors']) - 5) . ' more');
            }
        }
    }
}
