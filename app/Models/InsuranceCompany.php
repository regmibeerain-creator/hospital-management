<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InsuranceCompany extends Model
{
    protected $fillable = [
        'name', 'code', 'contact_person', 'phone', 'email',
        'address', 'coverage_percentage', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'coverage_percentage' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function policies(): HasMany { return $this->hasMany(PatientPolicy::class); }
    public function scopeActive($q) { return $q->where('is_active', true); }
}
