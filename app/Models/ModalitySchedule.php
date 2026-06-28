<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModalitySchedule extends Model
{
    protected $fillable = [
        'imaging_order_id',
        'modality',
        'scheduled_at',
        'duration_minutes',
        'room',
        'preparation_notes',
        'status',
        'technician_id',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'duration_minutes' => 'integer',
            'status' => 'string',
        ];
    }

    public function imagingOrder(): BelongsTo
    {
        return $this->belongsTo(ImagingOrder::class, 'imaging_order_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function scopeForModality($query, string $modality)
    {
        return $query->where('modality', $modality);
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('scheduled_at', $date);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>=', now())->orderBy('scheduled_at');
    }
}
