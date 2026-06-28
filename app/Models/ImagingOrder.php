<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class ImagingOrder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'patient_id',
        'referring_doctor_id',
        'radiologist_id',
        'order_number',
        'study_type',
        'body_part',
        'clinical_history',
        'notes',
        'priority',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'priority' => 'string',
            'status' => 'string',
        ];
    }

    public static function generateOrderNumber(): string
    {
        $prefix = 'RIS';
        $date = now()->format('Ymd');
        $last = static::whereDate('created_at', today())->count();
        return sprintf('%s-%s-%04d', $prefix, $date, $last + 1);
    }

    // ── Scopes ──

    public function scopePending($query)
    {
        return $query->whereIn('status', ['ordered', 'scheduled']);
    }

    public function scopeForModality($query, string $modality)
    {
        return $query->where('study_type', $modality);
    }

    public function scopeForPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    // ── Relations ──

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function referringDoctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'referring_doctor_id');
    }

    public function radiologist(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'radiologist_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function schedule(): HasOne
    {
        return $this->hasOne(ModalitySchedule::class, 'imaging_order_id');
    }

    public function study(): HasOne
    {
        return $this->hasOne(ImagingStudy::class, 'imaging_order_id');
    }

    public function report(): HasOne
    {
        return $this->hasOne(StructuredReport::class, 'imaging_order_id');
    }
}
