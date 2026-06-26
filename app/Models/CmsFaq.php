<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsFaq extends Model
{
    protected $fillable = [
        'faq_category_id',
        'question',
        'answer',
        'sort_order',
        'status',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(CmsFaqCategory::class, 'faq_category_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
