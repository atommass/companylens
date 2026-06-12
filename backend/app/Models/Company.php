<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $fillable = [
        'registration_number',
        'name',
        'address',
        'industry_id',
        'region_id',
        'status',
        'registered_at',
    ];

    protected $casts = [
        'registered_at' => 'date',
    ];

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function financialStatements(): HasMany
    {
        return $this->hasMany(FinancialStatement::class, 'legal_entity_registration_number', 'registration_number');
    }
}
