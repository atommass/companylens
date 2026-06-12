<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function kpis(): JsonResponse
    {
        return response()->json([
            'total_companies' => 1200,
            'new_this_month' => 42,
            'active_companies' => 1107,
            'inactive_companies' => 93,
        ]);
    }
}
