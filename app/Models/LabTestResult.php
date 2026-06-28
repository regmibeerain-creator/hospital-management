<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabTestResult extends Model
{
    protected $fillable = [
        'lab_test_order_id', 'lab_test_catalog_id',
        'result_value', 'result_text', 'unit',
        'reference_range_low', 'reference_range_high', 'reference_range_text',
        'flag', 'notes', 'status', 'entered_by', 'validated_by',
        'validated_at', 'amendment_reason',
    ];

    protected function casts(): array
    {
        return [
            'result_value' => 'decimal:4',
            'reference_range_low' => 'decimal:4',
            'reference_range_high' => 'decimal:4',
            'validated_at' => 'datetime',
        ];
    }

    public function testOrder(): BelongsTo
    {
        return $this->belongsTo(LabTestOrder::class, 'lab_test_order_id');
    }

    public function testCatalog(): BelongsTo
    {
        return $this->belongsTo(LabTestCatalog::class, 'lab_test_catalog_id');
    }

    public function enteredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'entered_by');
    }

    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeValidated($query)
    {
        return $query->where('status', 'validated');
    }

    /**
     * Auto-calculate flag based on result value vs reference range.
     */
    public function calculateFlag(): ?string
    {
        if ($this->result_value === null) return null;
        if ($this->reference_range_low === null && $this->reference_range_high === null) return null;

        if ($this->reference_range_low !== null && $this->result_value < $this->reference_range_low) {
            return 'low';
        }
        if ($this->reference_range_high !== null && $this->result_value > $this->reference_range_high) {
            return 'high';
        }
        return 'normal';
    }

    /**
     * Calculate critical flags (more sensitive thresholds).
     * Critical thresholds are approximated if not explicitly defined.
     */
    public function calculateCriticalFlag(): ?string
    {
        if ($this->result_value === null) return null;
        if ($this->reference_range_low === null && $this->reference_range_high === null) return null;

        $criticalLow = $this->reference_range_low !== null ? $this->reference_range_low * 0.5 : null;
        $criticalHigh = $this->reference_range_high !== null ? $this->reference_range_high * 1.5 : null;

        if ($criticalLow !== null && $this->result_value < $criticalLow) return 'critical_low';
        if ($criticalHigh !== null && $this->result_value > $criticalHigh) return 'critical_high';

        return $this->calculateFlag();
    }
}
