<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientPolicy extends Model
{
    protected $fillable = [
        'patient_id', 'insurance_company_id', 'policy_number',
        'coverage_type', 'coverage_limit', 'deductible',
        'start_date', 'end_date', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'coverage_limit' => 'decimal:2',
            'deductible' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function patient(): BelongsTo { return $this->belongsTo(Patient::class); }
    public function insuranceCompany(): BelongsTo { return $this->belongsTo(InsuranceCompany::class); }
    public function claims(): HasMany { return $this->hasMany(InsuranceClaim::class); }

    public function scopeActive($q) { return $q->where('status', 'active'); }
    public function isValid(): bool
    {
        return $this->status === 'active' && now()->between($this->start_date, $this->end_date);
    }
}
