<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StructuredReport extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'imaging_order_id',
        'imaging_study_id',
        'report_title',
        'technique',
        'findings',
        'impression',
        'recommendation',
        'comparison',
        'status',
        'is_double_read',
        'primary_reader_id',
        'secondary_reader_id',
        'amendment_reason',
        'signed_at',
    ];

    protected function casts(): array
    {
        return [
            'is_double_read' => 'boolean',
            'signed_at' => 'datetime',
            'status' => 'string',
        ];
    }

    public function imagingOrder(): BelongsTo
    {
        return $this->belongsTo(ImagingOrder::class, 'imaging_order_id');
    }

    public function imagingStudy(): BelongsTo
    {
        return $this->belongsTo(ImagingStudy::class, 'imaging_study_id');
    }

    public function primaryReader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'primary_reader_id');
    }

    public function secondaryReader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'secondary_reader_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSigned($query)
    {
        return $query->where('status', 'signed');
    }

    /**
     * Sign the report. If double reading is required, secondary reader signs.
     */
    public function sign(int $userId, ?int $secondaryUserId = null): void
    {
        if ($this->is_double_read && $secondaryUserId) {
            $this->secondary_reader_id = $secondaryUserId;
        } else {
            $this->primary_reader_id = $userId;
        }
        $this->status = 'signed';
        $this->signed_at = now();
        $this->save();
    }
}
