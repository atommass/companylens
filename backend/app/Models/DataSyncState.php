<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataSyncState extends Model
{
    protected $fillable = [
        'source_key',
        'content_hash',
        'record_count',
        'source_last_modified_at',
        'last_synced_at',
    ];

    protected $casts = [
        'record_count' => 'integer',
        'source_last_modified_at' => 'datetime',
        'last_synced_at' => 'datetime',
    ];
}
