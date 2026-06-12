<?php

namespace App\Http\Controllers\Api;

use App\Contracts\SearchServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\FinancialStatement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    public function __construct(
        private readonly SearchServiceInterface $searchService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->integer('per_page', 12), 50));

        $companies = Company::query()
            ->with(['industry', 'region'])
            ->orderByRaw('registered_at IS NULL')
            ->orderByDesc('registered_at')
            ->orderByDesc('updated_at')
            ->limit($perPage)
            ->get()
            ->map(fn (Company $company) => $this->formatCompany($company))
            ->values()
            ->all();

        return response()->json([
            'data' => $companies,
        ]);
    }

    public function show(Company $company): JsonResponse
    {
        $companyData = $this->searchService->findCompany($company->id);

        if ($companyData === null) {
            abort(404);
        }

        return response()->json([
            'data' => $companyData,
        ]);
    }

    public function showByRegistration(Company $company): JsonResponse
    {
        $company->load(['industry', 'region']);

        $financialStatements = $company->financialStatements()
            ->with(['balanceSheet', 'incomeStatement', 'cashFlowStatement'])
            ->orderByDesc('year')
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        return response()->json([
            'data' => $this->formatCompanyDetail($company, $financialStatements),
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = trim((string) $request->string('q'));
        $perPage = max(1, min((int) $request->integer('per_page', 12), 50));
        $page = max(1, (int) $request->integer('page', 1));
        $status = $request->string('status', null);
        $sort = $request->string('sort', null);

        return response()->json($this->searchService->searchCompanies($query, $perPage, $page, $status === '' ? null : $status, $sort === '' ? null : $sort));
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
     * @param iterable<FinancialStatement> $financialStatements
     * @return array<string, mixed>
     */
    private function formatCompanyDetail(Company $company, iterable $financialStatements): array
    {
        return $this->formatCompany($company) + [
            'financial_statements' => collect($financialStatements)
                ->map(fn (FinancialStatement $statement) => $this->formatFinancialStatement($statement))
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatFinancialStatement(FinancialStatement $statement): array
    {
        return [
            'id' => $statement->id,
            'year' => $statement->year,
            'year_started_on' => $statement->year_started_on?->toDateString(),
            'year_ended_on' => $statement->year_ended_on?->toDateString(),
            'employees' => $statement->employees,
            'currency' => $statement->currency,
            'source_schema' => $statement->source_schema,
            'source_type' => $statement->source_type,
            'net_income' => $statement->incomeStatement?->net_income,
            'net_turnover' => $statement->incomeStatement?->net_turnover,
            'operating_cash_flow' => $statement->cashFlowStatement?->cfo_dm_net_operating_cash_flow ?? $statement->cashFlowStatement?->cfo_im_net_operating_cash_flow,
            'total_assets' => $statement->balanceSheet?->total_assets,
            'total_equities' => $statement->balanceSheet?->total_equities,
            'equity' => $statement->balanceSheet?->equity,
            'cash' => $statement->balanceSheet?->cash,
            'current_liabilities' => $statement->balanceSheet?->current_liabilities,
            'non_current_liabilities' => $statement->balanceSheet?->non_current_liabilities,
        ];
    }
}
