<?php

namespace App\Contracts;

use App\Models\Company;

interface SearchServiceInterface
{
	/**
	 * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>, query?: string}
	 */
	public function listCompanies(int $perPage = 12): array;

	/**
	 * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>, query: string}
	 */
	public function searchCompanies(string $query, int $perPage = 12, int $page = 1, ?string $status = null, ?string $sort = null): array;

	/**
	 * @return array<string, mixed>|null
	 */
	public function findCompany(int $id): ?array;

	public function indexCompany(Company $company): void;
}
