<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabTestCatalog extends Model
{
    protected $fillable = [
        'test_name', 'test_code', 'department', 'specimen_type',
        'unit', 'reference_range_low', 'reference_range_high',
        'reference_range_text', 'gender', 'age_min', 'age_max',
        'turnaround_minutes', 'price', 'instructions', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'reference_range_low' => 'decimal:4',
            'reference_range_high' => 'decimal:4',
            'price' => 'decimal:2',
            'age_min' => 'integer',
            'age_max' => 'integer',
            'turnaround_minutes' => 'integer',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByDepartment($query, string $department)
    {
        return $query->where('department', $department);
    }
}
