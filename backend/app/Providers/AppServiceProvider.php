<?php

namespace App\Providers;

use App\Contracts\SearchServiceInterface;
use App\Services\OpenSearchCompanyService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(SearchServiceInterface::class, OpenSearchCompanyService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
