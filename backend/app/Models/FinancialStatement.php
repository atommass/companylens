<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class FinancialStatement extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = 'id';

    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'file_id',
        'legal_entity_registration_number',
        'source_schema',
        'source_type',
        'year',
        'year_started_on',
        'year_ended_on',
        'employees',
        'rounded_to_nearest',
        'currency',
        'created_at',
    ];

    protected $casts = [
        'year' => 'integer',
        'year_started_on' => 'date',
        'year_ended_on' => 'date',
        'employees' => 'integer',
        'created_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'legal_entity_registration_number', 'registration_number');
    }

    public function balanceSheet(): HasOne
    {
        return $this->hasOne(BalanceSheet::class, 'statement_id');
    }

    public function incomeStatement(): HasOne
    {
        return $this->hasOne(IncomeStatement::class, 'statement_id');
    }

    public function cashFlowStatement(): HasOne
    {
        return $this->hasOne(CashFlowStatement::class, 'statement_id');
    }
}