<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContentController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/social/{provider}', [AuthController::class, 'socialAuth']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
Route::put('/auth/password', [AuthController::class, 'updatePassword'])->middleware('auth:sanctum');
Route::delete('/auth/profile', [AuthController::class, 'destroyProfile'])->middleware('auth:sanctum');

Route::get('/content/pages/{slug}', [ContentController::class, 'pageBySlug']);
Route::get('/content/posts', [ContentController::class, 'posts']);
Route::get('/content/posts/{slug}', [ContentController::class, 'postBySlug']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/kpis', [DashboardController::class, 'kpis']);
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::get('/companies/by-registration/{company:registration_number}', [CompanyController::class, 'showByRegistration']);
    Route::get('/companies/{company}', [CompanyController::class, 'show']);
    Route::get('/companies-search', [CompanyController::class, 'search']);
});
