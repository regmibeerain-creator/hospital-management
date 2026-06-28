<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabSample extends Model
{
    protected $fillable = [
        'patient_id', 'collected_by', 'accession_number', 'specimen_type',
        'status', 'collected_at', 'accessioned_at', 'validated_at',
        'released_at', 'rejection_reason', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'collected_at' => 'datetime',
            'accessioned_at' => 'datetime',
            'validated_at' => 'datetime',
            'released_at' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function collectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function testOrders(): HasMany
    {
        return $this->hasMany(LabTestOrder::class, 'lab_sample_id');
    }

    public static function generateAccessionNumber(): string
    {
        $prefix = 'L' . now()->format('ymd');
        $last = static::where('accession_number', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')->first();
        $num = $last ? (int) substr($last->accession_number, -4) + 1 : 1;
        return $prefix . str_pad($num, 4, '0', STR_PAD_LEFT);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
