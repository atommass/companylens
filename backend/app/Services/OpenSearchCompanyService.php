<?php

namespace App\Services;

use App\Contracts\SearchServiceInterface;
use App\Models\Company;
use Illuminate\Support\Facades\Http;
use Throwable;

class OpenSearchCompanyService implements SearchServiceInterface
{
    public function listCompanies(int $perPage = 12): array
    {
        return $this->searchCompanies('', $perPage);
    }

    public function searchCompanies(string $query, int $perPage = 12, int $page = 1, ?string $status = null, ?string $sort = null): array
    {
        try {
            $opensearchResponse = $this->queryOpenSearch($query, $perPage, $page, $status, $sort);
        } catch (Throwable) {
            $opensearchResponse = null;
        }

        if ($opensearchResponse !== null) {
            return $opensearchResponse;
        }

        $companies = Company::query()
            ->with(['industry', 'region'])
            ->when($query !== '', function ($builder) use ($query) {
                $term = '%' . strtolower($query) . '%';
                $builder->where(function ($inner) use ($term) {
                    $inner->whereRaw('LOWER(name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(registration_number) LIKE ?', [$term]);
                });
            })
            ->when($status !== null && $status !== '', function ($builder) use ($status) {
                $builder->where('status', $status);
            })
            ->orderByDesc('updated_at')
            ->when($sort !== null, function ($builder) use ($sort) {
                if ($sort === 'name_asc') {
                    $builder->orderByRaw('LOWER(name) ASC');
                } elseif ($sort === 'name_desc') {
                    $builder->orderByRaw('LOWER(name) DESC');
                } elseif ($sort === 'registered_at_asc') {
                    $builder->orderBy('registered_at', 'asc');
                } elseif ($sort === 'registered_at_desc') {
                    $builder->orderBy('registered_at', 'desc');
                }
            })
            ->paginate($perPage, ['*'], 'page', $page);

        return [
            'query' => $query,
            'data' => $companies->getCollection()->map(fn (Company $company) => $this->formatCompany($company))->values()->all(),
            'meta' => [
                'current_page' => $companies->currentPage(),
                'last_page' => $companies->lastPage(),
                'per_page' => $companies->perPage(),
                'total' => $companies->total(),
            ],
        ];
    }

    public function findCompany(int $id): ?array
    {
        if ($this->isConfigured()) {
            $response = $this->client()->get($this->indexName() . '/_doc/' . $id);

            if ($response->successful()) {
                $payload = $response->json();
                $source = $payload['_source'] ?? null;

                if (is_array($source)) {
                    $source = $this->fillMissingAddress($source, $id);

                    return $source;
                }
            }
        }

        $company = Company::query()->with(['industry', 'region'])->find($id);

        return $company ? $this->formatCompany($company) : null;
    }

    public function indexCompany(Company $company): void
    {
        if (! $this->isConfigured()) {
            return;
        }

        $this->client()->put($this->indexName() . '/_doc/' . $company->id, [
            'json' => $this->formatCompany($company),
        ])->throw();
    }

    private function queryOpenSearch(string $query, int $perPage, int $page = 1, ?string $status = null, ?string $sort = null): ?array
    {
        if (! $this->isConfigured()) {
            return null;
        }

        // Build a more tolerant query: fuzzy match on name and registration_number,
        // plus a multi_match across several fields. This helps with typos and case.
        if ($query === '') {
            $esQuery = ['match_all' => (object) []];
        } else {
            $esQuery = [
                'bool' => [
                    'should' => [
                        [
                            'multi_match' => [
                                'query' => $query,
                                'fields' => ['name^3', 'registration_number^2', 'industry', 'region', 'address', 'status'],
                                'fuzziness' => 'AUTO',
                                'type' => 'best_fields',
                            ],
                        ],
                        [
                            'match' => [
                                'name' => [
                                    'query' => $query,
                                    'fuzziness' => 'AUTO',
                                    'operator' => 'and',
                                ],
                            ],
                        ],
                        [
                            'match' => [
                                'registration_number' => [
                                    'query' => $query,
                                    'operator' => 'and',
                                ],
                            ],
                        ],
                    ],
                    'minimum_should_match' => 1,
                ],
            ];
        }

        // Apply status filter if present
        if ($status !== null && $status !== '') {
            if (! isset($esQuery['bool'])) {
                $esQuery = ['bool' => ['filter' => [ ['term' => ['status' => $status]] ]]];
            } else {
                $esQuery['bool']['filter'] = $esQuery['bool']['filter'] ?? [];
                $esQuery['bool']['filter'][] = ['term' => ['status' => $status]];
            }
        }

        $from = max(0, ($page - 1) * $perPage);
        // Map sort param to ES sort clause
        $esSort = [ ['updated_at' => ['order' => 'desc']] ];
        if ($sort !== null) {
            if ($sort === 'name_asc' || $sort === 'name_desc') {
                // Use a painless script to sort case-insensitively by name.keyword if available,
                // falling back to name. This ensures A->Z ordering regardless of case.
                $order = $sort === 'name_asc' ? 'asc' : 'desc';
                $esSort = [
                    [
                        '_script' => [
                            'type' => 'string',
                            'script' => [
                                'source' => "if (doc.containsKey('name.keyword') && !doc['name.keyword'].empty) { return doc['name.keyword'].value.toLowerCase(); } else if (doc.containsKey('name') && !doc['name'].empty) { return doc['name'].value.toLowerCase(); } else { return ''; }",
                                'lang' => 'painless',
                            ],
                            'order' => $order,
                        ],
                    ],
                ];
            } elseif ($sort === 'registered_at_asc') {
                $esSort = [ ['registered_at' => ['order' => 'asc']] ];
            } elseif ($sort === 'registered_at_desc') {
                $esSort = [ ['registered_at' => ['order' => 'desc']] ];
            }
        }

        $response = $this->client()->post($this->indexName() . '/_search', [
            'json' => [
                'from' => $from,
                'size' => $perPage,
                'query' => $esQuery,
                'sort' => $esSort,
            ],
        ]);

        if (! $response->successful()) {
            return null;
        }

        $hits = $response->json('hits.hits', []);
        $total = (int) ($response->json('hits.total.value') ?? $response->json('hits.total') ?? count($hits));

        $lastPage = $perPage > 0 ? (int) ceil($total / $perPage) : 1;

        return [
            'query' => $query,
            'data' => $this->hydrateMissingAddresses(collect($hits)->map(function (array $hit) {
                $source = $hit['_source'] ?? [];

                return [
                    'id' => (int) ($source['id'] ?? $hit['_id'] ?? 0),
                    'name' => $source['name'] ?? '',
                    'registration_number' => $source['registration_number'] ?? '',
                    'status' => $source['status'] ?? null,
                    'registered_at' => $source['registered_at'] ?? null,
                    'industry' => $source['industry'] ?? null,
                    'region' => $source['region'] ?? null,
                    'address' => $source['address'] ?? ($source['region'] ?? null),
                ];
            })->values()->all()),
            'meta' => [
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
            ],
        ];
    }

    private function formatCompany(Company $company): array
    {
        return [
            'id' => $company->id,
            'name' => $company->name,
            'registration_number' => $company->registration_number,
            'status' => $company->status,
            'registered_at' => $company->registered_at?->toDateString(),
            'industry' => $company->industry?->name,
            'region' => $company->region?->name,
            'address' => $company->address ?? $company->region?->name,
            'updated_at' => $company->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @param array<int, array<string, mixed>> $companies
     * @return array<int, array<string, mixed>>
     */
    private function hydrateMissingAddresses(array $companies): array
    {
        $missingAddressIds = collect($companies)
            ->filter(fn (array $company) => empty($company['address']) && ! empty($company['id']))
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        if ($missingAddressIds->isEmpty()) {
            return $companies;
        }

        $addressById = Company::query()
            ->with('region')
            ->whereIn('id', $missingAddressIds)
            ->get()
            ->mapWithKeys(fn (Company $company) => [
                $company->id => $company->address ?? $company->region?->name,
            ])
            ->all();

        return array_map(function (array $company) use ($addressById) {
            if (! empty($company['address']) || empty($company['id'])) {
                return $company;
            }

            $company['address'] = $addressById[(int) $company['id']] ?? null;

            return $company;
        }, $companies);
    }

    /**
     * @param array<string, mixed> $company
     * @return array<string, mixed>
     */
    private function fillMissingAddress(array $company, int $id): array
    {
        if (! empty($company['address'])) {
            return $company;
        }

        $model = Company::query()->with('region')->find($id);

        if ($model === null) {
            return $company;
        }

        $company['address'] = $model->address ?? $model->region?->name;

        return $company;
    }

    private function isConfigured(): bool
    {
        return (bool) config('services.opensearch.host') && (bool) config('services.opensearch.index');
    }

    private function client()
    {
        $request = Http::baseUrl(rtrim((string) config('services.opensearch.host'), '/'))
            ->acceptJson()
            ->timeout(10)
            ->retry(2, 500);

        if (config('services.opensearch.username')) {
            $request = $request->withBasicAuth(
                (string) config('services.opensearch.username'),
                (string) config('services.opensearch.password')
            );
        }

        // Allow disabling TLS verification for local/self-signed setups.
        $verify = config('services.opensearch.verify', true);
        if (is_string($verify)) {
            $verify = !in_array(strtolower($verify), ['0', 'false', 'no', 'off'], true);
        }

        if ($verify === false) {
            $request = $request->withOptions(['verify' => false]);
        }

        return $request;
    }

    private function indexName(): string
    {
        return (string) config('services.opensearch.index', 'companies');
    }
}