<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InsuranceClaim extends Model
{
    protected $fillable = [
        'patient_policy_id', 'bill_id', 'claim_number',
        'claimed_amount', 'approved_amount', 'status',
        'submitted_date', 'approved_date', 'notes', 'processed_by',
    ];

    protected function casts(): array
    {
        return [
            'claimed_amount' => 'decimal:2',
            'approved_amount' => 'decimal:2',
            'submitted_date' => 'date',
            'approved_date' => 'date',
        ];
    }

    public function patientPolicy(): BelongsTo { return $this->belongsTo(PatientPolicy::class); }
    public function bill(): BelongsTo { return $this->belongsTo(Bill::class); }
    public function processedBy(): BelongsTo { return $this->belongsTo(User::class, 'processed_by'); }

    public static function generateClaimNumber(): string
    {
        $year = now()->format('Y');
        $last = static::whereYear('created_at', $year)->max('id') ?? 0;
        return 'CLM-' . $year . '-' . str_pad($last + 1, 5, '0', STR_PAD_LEFT);
    }
}
