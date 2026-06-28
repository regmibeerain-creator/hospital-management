<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ImagingStudy extends Model
{
    protected $fillable = [
        'imaging_order_id',
        'study_uid',
        'accession_number',
        'modality',
        'series_count',
        'instance_count',
        'dicom_path',
        'acquisition_notes',
        'quality',
        'status',
        'acquired_by',
        'acquired_at',
    ];

    protected function casts(): array
    {
        return [
            'series_count' => 'integer',
            'instance_count' => 'integer',
            'acquired_at' => 'datetime',
            'status' => 'string',
            'quality' => 'string',
        ];
    }

    public static function generateAccessionNumber(): string
    {
        $prefix = 'ACC';
        $date = now()->format('Ymd');
        $last = static::whereDate('created_at', today())->count();
        return sprintf('%s-%s-%04d', $prefix, $date, $last + 1);
    }

    public function imagingOrder(): BelongsTo
    {
        return $this->belongsTo(ImagingOrder::class, 'imaging_order_id');
    }

    public function acquirer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acquired_by');
    }

    public function report(): HasOne
    {
        return $this->hasOne(StructuredReport::class, 'imaging_study_id');
    }
}
