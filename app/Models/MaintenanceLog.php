<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceLog extends Model
{
    protected $fillable = [
        'asset_id', 'type', 'description', 'maintenance_date',
        'next_maintenance_date', 'cost', 'performed_by', 'notes', 'status',
    ];

    protected function casts(): array
    {
        return [
            'maintenance_date' => 'date',
            'next_maintenance_date' => 'date',
            'cost' => 'decimal:2',
        ];
    }

    public function asset(): BelongsTo { return $this->belongsTo(Asset::class); }
}
