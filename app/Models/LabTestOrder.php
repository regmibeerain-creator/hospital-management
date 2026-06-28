<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabTestOrder extends Model
{
    protected $fillable = [
        'patient_id', 'doctor_id', 'appointment_id', 'lab_sample_id',
        'order_number', 'priority', 'clinical_notes', 'status', 'ordered_by',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function labSample(): BelongsTo
    {
        return $this->belongsTo(LabSample::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(LabTestResult::class);
    }

    public function orderedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ordered_by');
    }

    public static function generateOrderNumber(): string
    {
        $prefix = 'LO' . now()->format('ymd');
        $last = static::where('order_number', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')->first();
        $num = $last ? (int) substr($last->order_number, -4) + 1 : 1;
        return $prefix . str_pad($num, 4, '0', STR_PAD_LEFT);
    }
}
