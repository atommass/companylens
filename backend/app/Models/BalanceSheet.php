<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BalanceSheet extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = 'statement_id';

    protected $keyType = 'int';

    protected $fillable = [
        'statement_id',
        'file_id',
        'cash',
        'marketable_securities',
        'accounts_receivable',
        'inventories',
        'total_current_assets',
        'investments',
        'fixed_assets',
        'intangible_assets',
        'total_non_current_assets',
        'total_assets',
        'future_housing_repairs_payments',
        'current_liabilities',
        'non_current_liabilities',
        'provisions',
        'equity',
        'total_equities',
    ];

    public function financialStatement(): BelongsTo
    {
        return $this->belongsTo(FinancialStatement::class, 'statement_id');
    }
}