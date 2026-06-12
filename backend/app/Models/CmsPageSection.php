<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsPageSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'cms_page_id',
        'type',
        'title',
        'content',
        'sort_order',
    ];

    protected $casts = [
        'content' => 'array',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(CmsPage::class, 'cms_page_id');
    }
}
