<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CmsHealthPackage extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'included_services',
        'price',
        'original_price',
        'duration',
        'featured_image',
        'is_featured',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'is_featured' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (CmsHealthPackage $package) {
            if (empty($package->slug)) {
                $package->slug = Str::slug($package->title);
            }
        });
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function getDiscountPercentAttribute(): ?int
    {
        if ($this->original_price && $this->original_price > 0) {
            return (int) round((1 - $this->price / $this->original_price) * 100);
        }
        return null;
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
