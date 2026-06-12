<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Industry;
use App\Models\Region;
use Illuminate\Support\Facades\DB;

class CompanyImportService
{
    public function __construct(
        private readonly OpenSearchCompanyService $searchService,
    ) {
    }

    /**
     * Import companies from an array of data.
     *
     * @param array<array> $companies
     * @param array<string, mixed> $options
     * @return array<string, mixed>
     */
    public function importCompanies(array $companies, array $options = []): array
    {
        $batchSize = $options['batch_size'] ?? 500;
        $skipErrors = $options['skip_errors'] ?? true;
        $upsert = $options['upsert'] ?? true;

        $created = 0;
        $updated = 0;
        $failed = 0;
        $errors = [];

        $chunks = array_chunk($companies, $batchSize);

        foreach ($chunks as $chunk) {
            $indexedCompanies = DB::transaction(function () use ($chunk, $upsert, &$created, &$updated, &$failed, &$errors, $skipErrors) {
                $companiesToIndex = [];

                foreach ($chunk as $data) {
                    try {
                        $result = $this->importSingleCompany($data, $upsert);

                        if ($result['action'] === 'created') {
                            $created++;
                        } elseif ($result['action'] === 'updated') {
                            $updated++;
                        }

                        $companiesToIndex[] = $result['company'];
                    } catch (\Exception $e) {
                        $failed++;
                        $errors[] = [
                            'data' => $data,
                            'error' => $e->getMessage(),
                        ];

                        if (! $skipErrors) {
                            throw $e;
                        }
                    }
                }

                return $companiesToIndex;
            });

            foreach ($indexedCompanies as $company) {
                $this->indexCompanySafely($company);
            }
        }

        return [
            'created' => $created,
            'updated' => $updated,
            'failed' => $failed,
            'errors' => $errors,
            'total' => count($companies),
        ];
    }

    /**
     * Import a single company record.
     *
     * @param array<string, mixed> $data
     * @param bool $upsert
    * @return array{action: string, company: Company}
     */
    private function importSingleCompany(array $data, bool $upsert = true): array
    {
        $this->validateCompanyData($data);

        $attributes = [
            'name' => $data['name'],
        ];

        if (array_key_exists('registration_number', $data) && $data['registration_number'] !== null && $data['registration_number'] !== '') {
            $attributes['registration_number'] = $data['registration_number'];
        }

        if (array_key_exists('status', $data) && $data['status'] !== null && $data['status'] !== '') {
            $attributes['status'] = $data['status'];
        }

        if (array_key_exists('registered_at', $data) && $data['registered_at'] !== null && $data['registered_at'] !== '') {
            $attributes['registered_at'] = $data['registered_at'];
        }

        if (array_key_exists('address', $data) && $data['address'] !== null && $data['address'] !== '') {
            $attributes['address'] = $data['address'];
        }

        $industryId = $this->resolveIndustry($data['industry'] ?? null);
        if ($industryId !== null) {
            $attributes['industry_id'] = $industryId;
        }

        $regionId = $this->resolveRegion($data['region'] ?? null);
        if ($regionId !== null) {
            $attributes['region_id'] = $regionId;
        }

        if ($upsert) {
            $lookup = isset($attributes['registration_number'])
                ? ['registration_number' => $attributes['registration_number']]
                : ['name' => $attributes['name']];

            $company = Company::updateOrCreate($lookup, $attributes);

            return ['action' => $company->wasRecentlyCreated ? 'created' : 'updated', 'company' => $company];
        }

        $company = Company::create($attributes);

        return ['action' => 'created', 'company' => $company];
    }

    private function indexCompanySafely(Company $company): void
    {
        try {
            $this->searchService->indexCompany($company);
        } catch (\Throwable) {
            // Indexing should never break the import pipeline.
        }
    }

    /**
     * Validate required company fields.
     *
     * @param array<string, mixed> $data
     * @return void
     *
     * @throws \InvalidArgumentException
     */
    private function validateCompanyData(array $data): void
    {
        if (empty($data['name'])) {
            throw new \InvalidArgumentException('Company name is required');
        }
    }

    /**
     * Resolve or create an industry.
     *
     * @param string|null $industryName
     * @return int|null
     */
    private function resolveIndustry(?string $industryName): ?int
    {
        if (! $industryName) {
            return null;
        }

        $industry = Industry::firstOrCreate(
            ['name' => $industryName],
            ['slug' => str()->slug($industryName)]
        );

        return $industry->id;
    }

    /**
     * Resolve or create a region.
     *
     * @param string|null $regionName
     * @return int|null
     */
    private function resolveRegion(?string $regionName): ?int
    {
        if (! $regionName) {
            return null;
        }

        $region = Region::firstOrCreate(
            ['name' => $regionName],
            ['code' => strtoupper(substr($regionName, 0, 2))]
        );

        return $region->id;
    }
}
